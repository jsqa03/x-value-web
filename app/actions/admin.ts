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
/**
 * Returns managers + sales reps for the "Asignar Líder" selector.
 * Managers can be leaders of sales users; sales reps can be leaders of clients.
 */
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

// Backward compat alias
export const getManagers = getLeaders;

// ─── createUserAccount ────────────────────────────────────────────────────────
export async function createUserAccount(formData: FormData): Promise<ActionResult> {
  const caller = await getCallerProfile();
  if (!caller) return { error: "No autorizado. Inicia sesión de nuevo." };

  // Core required fields
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

  // Optional extended fields
  const university  = (formData.get("university")   as string | null)?.trim() || null;
  const birth_date  = (formData.get("birth_date")   as string | null) || null;
  const country     = (formData.get("country")      as string | null)?.trim() || null;
  const nationality = (formData.get("nationality")  as string | null)?.trim() || null;
  const client_type = (formData.get("client_type")  as string | null)?.trim() || null;

  // Validate client_type when role is client
  if (role === "client" && !client_type) {
    return { error: "Debes seleccionar el Tipo de Cliente." };
  }

  // manager_id: explicit form selection, OR auto-assign caller if manager
  const explicitLeaderId = (formData.get("manager_id") as string | null) || null;

  // Require leader assignment for sales/client when creating from admin
  if ((role === "sales" || role === "client") && !explicitLeaderId && caller.role === "admin") {
    return { error: "Debes asignar un líder para este usuario." };
  }

  const manager_id = explicitLeaderId ?? (caller.role === "manager" ? caller.id : null);

  // Role permission gate
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

// ─── resetPassword ────────────────────────────────────────────────────────────
/** Admin-only: forcibly change any user's password. */
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

// ─── updateProfile ────────────────────────────────────────────────────────────
/** Any authenticated user can update their own profile fields. */
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

  // Use service role to bypass any restrictive RLS on UPDATE
  const adminClient = getAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ full_name, university, birth_date, country, nationality })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true };
}
