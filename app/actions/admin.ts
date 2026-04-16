"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type ManagedRole = "manager" | "sales" | "client";
type CallerRole = "admin" | "manager";

export interface ActionResult {
  success?: boolean;
  error?: string;
  userId?: string;
}

// Alias kept for backward compatibility with CreateUserModal import
export type CreateUserResult = ActionResult;

export interface LeaderOption {
  id: string;
  full_name: string | null;
  email: string;
  role: "manager" | "sales";
}

// Kept for backward compat — callers that import ManagerOption still work
export type ManagerOption = LeaderOption;

export interface AssignableUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

export interface LeadStats {
  total: number;
  byStatus: { status: string; count: number }[];
  closed: number;
  lost: number;
  inProgress: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Verify caller is authenticated with admin/manager role. */
async function getCallerProfile(): Promise<{ id: string; role: CallerRole } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = data?.role as string | undefined;
  if (role !== "admin" && role !== "manager") return null;
  return { id: user.id, role: role as CallerRole };
}

/** Any authenticated user with a staff role (admin/manager/sales). */
async function getStaffUser(): Promise<{ id: string; role: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = data?.role as string | undefined;
  if (!role || !["admin", "manager", "sales"].includes(role)) return null;
  return { id: user.id, role };
}

/** Service Role client — bypasses RLS, never persists session. */
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── revalidateDashboard ──────────────────────────────────────────────────────
/** Called from client components (e.g. AvatarUpload) to force a page refresh. */
export async function revalidateDashboard(): Promise<void> {
  revalidatePath("/dashboard", "layout");
}

// ─── getLeaders ───────────────────────────────────────────────────────────────
export async function getLeaders(): Promise<LeaderOption[]> {
  const caller = await getCallerProfile();
  if (!caller) return [];

  const adminClient = getAdminClient();
  const { data } = await adminClient
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["manager", "sales"])
    .order("role")
    .order("full_name");

  return (data ?? []) as LeaderOption[];
}

export const getManagers = getLeaders;

// ─── getAssignableUsers ───────────────────────────────────────────────────────
/**
 * Returns the list of profiles that can be set as `assigned_to` for a new lead.
 * - Admin: all managers + sales reps
 * - Manager: themselves + their team members (manager_id = their id)
 * - Sales: only themselves
 */
export async function getAssignableUsers(): Promise<AssignableUser[]> {
  const staff = await getStaffUser();
  if (!staff) return [];

  const ac = getAdminClient();

  if (staff.role === "admin") {
    const { data } = await ac
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", ["manager", "sales"])
      .order("role")
      .order("full_name");
    return (data ?? []) as AssignableUser[];
  }

  if (staff.role === "manager") {
    const [{ data: self }, { data: team }] = await Promise.all([
      ac.from("profiles").select("id, full_name, email, role").eq("id", staff.id).single(),
      ac.from("profiles").select("id, full_name, email, role").eq("manager_id", staff.id).order("full_name"),
    ]);
    return [self, ...(team ?? [])].filter(Boolean) as AssignableUser[];
  }

  if (staff.role === "sales") {
    const { data: self } = await ac
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", staff.id)
      .single();
    return self ? [self as AssignableUser] : [];
  }

  return [];
}

// ─── createLead ───────────────────────────────────────────────────────────────
export async function createLead(formData: FormData): Promise<ActionResult> {
  const staff = await getStaffUser();
  if (!staff) return { error: "No autenticado o sin permisos." };

  const name            = (formData.get("name")            as string | null)?.trim() ?? "";
  const email           = (formData.get("email")           as string | null)?.trim() ?? "";
  const whatsapp        = (formData.get("whatsapp")        as string | null)?.trim()  || null;
  const company_info    = (formData.get("company_info")    as string | null)?.trim()  || null;
  const niche           = (formData.get("niche")           as string | null)?.trim()  || null;
  const service_type    = (formData.get("service_type")    as string | null)           || null;
  const pipeline_status = (formData.get("pipeline_status") as string | null)           || "En seguimiento";
  const lost_reason     = (formData.get("lost_reason")     as string | null)?.trim()  || null;
  const notes           = (formData.get("notes")           as string | null)?.trim()  || null;
  const assigned_to_raw = (formData.get("assigned_to")     as string | null)           || null;

  if (!name) return { error: "El nombre del lead es obligatorio." };
  if (!email) return { error: "El email del lead es obligatorio." };

  // Sales reps are always self-assigned; others use the form field
  const assigned_to = staff.role === "sales" ? staff.id : (assigned_to_raw || null);

  const ac = getAdminClient();
  const { error } = await ac.from("leads").insert({
    name,
    email,
    whatsapp,
    company_info,
    niche,
    service_type,
    pipeline_status,
    lost_reason,
    notes,
    assigned_to,
    is_verified: false,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── getUserLeadStats ─────────────────────────────────────────────────────────
export async function getUserLeadStats(
  targetUserId: string
): Promise<{ stats: LeadStats } | { error: string }> {
  const caller = await getCallerProfile();
  if (!caller) return { error: "No autorizado." };

  const ac = getAdminClient();
  const { data: leads, error } = await ac
    .from("leads")
    .select("pipeline_status, is_verified")
    .eq("assigned_to", targetUserId);

  if (error) return { error: error.message };

  const total = leads?.length ?? 0;
  const statusCounts: Record<string, number> = {};
  for (const lead of leads ?? []) {
    const s = lead.pipeline_status ?? "Sin estado";
    statusCounts[s] = (statusCounts[s] ?? 0) + 1;
  }

  const closed     = statusCounts["Cerrado/Cliente activo"] ?? 0;
  const lost       = statusCounts["Perdido/No"] ?? 0;
  const inProgress = total - closed - lost;
  const byStatus   = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  return { stats: { total, byStatus, closed, lost, inProgress } };
}

// ─── createUserAccount ────────────────────────────────────────────────────────
export async function createUserAccount(formData: FormData): Promise<ActionResult> {
  const caller = await getCallerProfile();
  if (!caller) return { error: "No autorizado. Inicia sesión de nuevo." };

  const fullName = (formData.get("full_name") as string | null)?.trim() ?? "";
  const email    = (formData.get("email")     as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password")  as string | null) ?? "";
  const role     = (formData.get("role")      as string | null) ?? "";

  if (!fullName || !email || !password || !role) {
    return { error: "Nombre, email, contraseña y rol son obligatorios." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Ingresa un email válido." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const university  = (formData.get("university")   as string | null)?.trim() || null;
  const birth_date  = (formData.get("birth_date")   as string | null) || null;
  const country     = (formData.get("country")      as string | null)?.trim() || null;
  const nationality = (formData.get("nationality")  as string | null)?.trim() || null;
  const client_type = (formData.get("client_type")  as string | null)?.trim() || null;

  if (role === "client" && !client_type) {
    return { error: "Debes seleccionar el Tipo de Cliente." };
  }

  const explicitLeaderId = (formData.get("manager_id") as string | null) || null;

  if ((role === "sales" || role === "client") && !explicitLeaderId && caller.role === "admin") {
    return { error: "Debes asignar un líder para este usuario." };
  }

  const manager_id = explicitLeaderId ?? (caller.role === "manager" ? caller.id : null);

  const MANAGER_ALLOWED: ManagedRole[] = ["sales", "client"];
  const ADMIN_ALLOWED:   ManagedRole[] = ["manager", "sales", "client"];

  if (caller.role === "manager" && !MANAGER_ALLOWED.includes(role as ManagedRole)) {
    return { error: "Un manager solo puede crear cuentas de tipo Sales o Cliente." };
  }
  if (caller.role === "admin" && !ADMIN_ALLOWED.includes(role as ManagedRole)) {
    return { error: "Rol inválido." };
  }

  const adminClient = getAdminClient();

  const { data: { user }, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !user) {
    const msg = authError?.message ?? "Error al crear el usuario.";
    if (msg.toLowerCase().includes("already registered")) {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: msg };
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id:          user.id,
    email,
    full_name:   fullName,
    role,
    manager_id,
    university,
    birth_date,
    country,
    nationality,
    client_type,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(user.id);
    return { error: `Error al crear el perfil: ${profileError.message}. Operación revertida.` };
  }

  revalidatePath("/dashboard", "layout");
  return { success: true, userId: user.id };
}

// ─── deleteUserAccount ────────────────────────────────────────────────────────
export async function deleteUserAccount(targetUserId: string): Promise<ActionResult> {
  const caller = await getCallerProfile();
  if (!caller) return { error: "No autorizado." };

  if (caller.id === targetUserId) {
    return { error: "No puedes eliminar tu propia cuenta." };
  }

  const adminClient = getAdminClient();

  const { data: targetProfile, error: fetchError } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", targetUserId)
    .single();

  if (fetchError || !targetProfile) {
    return { error: "Usuario no encontrado." };
  }

  if (
    caller.role === "manager" &&
    (targetProfile.role === "admin" || targetProfile.role === "manager")
  ) {
    return { error: "Un manager no puede eliminar admins ni otros managers." };
  }

  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUserId);
  if (deleteAuthError) {
    return { error: `Error al eliminar: ${deleteAuthError.message}` };
  }

  await adminClient.from("profiles").delete().eq("id", targetUserId);

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── toggleCalendarAccess ─────────────────────────────────────────────────────
export async function toggleCalendarAccess(
  targetUserId: string,
  newValue: boolean
): Promise<ActionResult> {
  const caller = await getCallerProfile();
  if (!caller || caller.role !== "admin") {
    return { error: "Solo el Admin puede modificar el acceso al calendario." };
  }

  const ac = getAdminClient();
  const { error } = await ac
    .from("profiles")
    .update({ can_view_calendar: newValue })
    .eq("id", targetUserId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── scheduleMeeting ──────────────────────────────────────────────────────────
export async function scheduleMeeting(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string | undefined;
  if (!role || !["admin", "manager", "sales"].includes(role)) {
    return { error: "Sin permisos para agendar citas." };
  }

  const company_name = (formData.get("company_name") as string | null)?.trim() ?? "";
  const meeting_date = (formData.get("meeting_date") as string | null) ?? "";
  const description  = (formData.get("description")  as string | null)?.trim()  || null;

  if (!company_name) return { error: "El nombre de la empresa es obligatorio." };
  if (!meeting_date) return { error: "La fecha y hora son obligatorias." };

  const ac = getAdminClient();
  const { error } = await ac.from("meetings").insert({
    company_name,
    meeting_date,
    description,
    created_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── resetPassword ────────────────────────────────────────────────────────────
export async function resetPassword(
  targetUserId: string,
  newPassword: string
): Promise<ActionResult> {
  const caller = await getCallerProfile();
  if (!caller || caller.role !== "admin") {
    return { error: "Solo el Admin puede resetear contraseñas." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { error: "La contraseña debe tener mínimo 6 caracteres." };
  }

  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── updateLead ───────────────────────────────────────────────────────────────
export async function updateLead(formData: FormData): Promise<ActionResult> {
  const staff = await getStaffUser();
  if (!staff) return { error: "No autenticado o sin permisos." };

  const id             = (formData.get("id")             as string | null) ?? "";
  const name           = (formData.get("name")           as string | null)?.trim() ?? "";
  const email          = (formData.get("email")          as string | null)?.trim() ?? "";
  const whatsapp       = (formData.get("whatsapp")       as string | null)?.trim()  || null;
  const company_info   = (formData.get("company_info")   as string | null)?.trim()  || null;
  const niche          = (formData.get("niche")          as string | null)?.trim()  || null;
  const service_type   = (formData.get("service_type")   as string | null)           || null;
  const pipeline_status = (formData.get("pipeline_status") as string | null)         || "En seguimiento";
  const lost_reason    = (formData.get("lost_reason")    as string | null)?.trim()  || null;
  const notes          = (formData.get("notes")          as string | null)?.trim()  || null;
  const assigned_to    = (formData.get("assigned_to")    as string | null)           || null;

  if (!id)    return { error: "ID de lead requerido." };
  if (!name)  return { error: "El nombre del lead es obligatorio." };
  if (!email) return { error: "El email del lead es obligatorio." };

  const ac = getAdminClient();

  // Sales cannot change assignment — all other fields remain editable
  const payload: Record<string, unknown> = {
    name, email, whatsapp, company_info, niche,
    service_type, pipeline_status, lost_reason, notes,
  };
  if (staff.role !== "sales") {
    payload.assigned_to = assigned_to;
  }

  const { error } = await ac.from("leads").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── updateProfile ────────────────────────────────────────────────────────────
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado. Inicia sesión de nuevo." };

  const full_name   = (formData.get("full_name")   as string | null)?.trim() || null;
  const university  = (formData.get("university")  as string | null)?.trim() || null;
  const birth_date  = (formData.get("birth_date")  as string | null) || null;
  const country     = (formData.get("country")     as string | null)?.trim() || null;
  const nationality = (formData.get("nationality") as string | null)?.trim() || null;

  if (!full_name) return { error: "El nombre no puede estar vacío." };

  const adminClient = getAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ full_name, university, birth_date, country, nationality })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true };
}
