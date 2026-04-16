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

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Verify the caller is authenticated and has an admin/manager role. */
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

// ─── createUserAccount ────────────────────────────────────────────────────────
export async function createUserAccount(formData: FormData): Promise<ActionResult> {
  // 1 — Verify caller identity & role
  const caller = await getCallerProfile();
  if (!caller) return { error: "No autorizado. Inicia sesión de nuevo." };

  // 2 — Parse inputs
  const fullName = (formData.get("full_name") as string | null)?.trim() ?? "";
  const email    = (formData.get("email")     as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password")  as string | null) ?? "";
  const role     = (formData.get("role")      as string | null) ?? "";

  if (!fullName || !email || !password || !role) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Ingresa un email válido." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  // 3 — Role permission gate
  const MANAGER_ALLOWED: ManagedRole[] = ["sales", "client"];
  const ADMIN_ALLOWED:   ManagedRole[] = ["manager", "sales", "client"];

  if (caller.role === "manager" && !MANAGER_ALLOWED.includes(role as ManagedRole)) {
    return { error: "Un manager solo puede crear cuentas de tipo Sales o Cliente." };
  }
  if (caller.role === "admin" && !ADMIN_ALLOWED.includes(role as ManagedRole)) {
    return { error: "Rol inválido." };
  }

  // 4 — Create auth user via Service Role
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

  // 5 — Insert profile; roll back on failure
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: user.id,
    email,
    full_name: fullName,
    role,
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
  // 1 — Verify caller
  const caller = await getCallerProfile();
  if (!caller) return { error: "No autorizado." };

  // 2 — Prevent self-deletion
  if (caller.id === targetUserId) {
    return { error: "No puedes eliminar tu propia cuenta." };
  }

  // 3 — Fetch target role from DB (never trust client-provided data for auth checks)
  const adminClient = getAdminClient();

  const { data: targetProfile, error: fetchError } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", targetUserId)
    .single();

  if (fetchError || !targetProfile) {
    return { error: "Usuario no encontrado." };
  }

  // 4 — Manager restriction: cannot delete admin or other managers
  if (
    caller.role === "manager" &&
    (targetProfile.role === "admin" || targetProfile.role === "manager")
  ) {
    return { error: "Un manager no puede eliminar admins ni otros managers." };
  }

  // 5 — Delete from auth (cascades to profiles via FK if configured, else separate delete)
  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUserId);

  if (deleteAuthError) {
    return { error: `Error al eliminar: ${deleteAuthError.message}` };
  }

  // 6 — Explicitly delete profile row (safe even if already cascaded)
  await adminClient.from("profiles").delete().eq("id", targetUserId);

  revalidatePath("/dashboard");
  return { success: true };
}
