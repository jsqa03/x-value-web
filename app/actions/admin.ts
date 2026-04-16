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

export interface ManagerOption {
  id: string;
  full_name: string | null;
  email: string;
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

/** Service Role client — bypasses RLS, never persists session. */
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── getManagers ──────────────────────────────────────────────────────────────
/** Returns list of managers for the "Asignar Líder" selector. */
export async function getManagers(): Promise<ManagerOption[]> {
  const caller = await getCallerProfile();
  if (!caller) return [];

  const adminClient = getAdminClient();
  const { data } = await adminClient
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "manager")
    .order("full_name");

  return (data ?? []) as ManagerOption[];
}

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
  const birthYearRaw = formData.get("birth_year") as string | null;
  const birth_year  = birthYearRaw ? parseInt(birthYearRaw, 10) || null : null;
  const country     = (formData.get("country")      as string | null)?.trim() || null;
  const nationality = (formData.get("nationality")  as string | null)?.trim() || null;

  // manager_id: explicit selection (admin) OR auto-assign (manager creating their own member)
  const explicitManagerId = (formData.get("manager_id") as string | null) || null;
  const manager_id =
    explicitManagerId ?? (caller.role === "manager" ? caller.id : null);

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
    birth_year,
    country,
    nationality,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(user.id);
    return { error: `Error al crear el perfil: ${profileError.message}. Operación revertida.` };
  }

  revalidatePath("/dashboard");
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

  revalidatePath("/dashboard");
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
  return { success: true };
}
