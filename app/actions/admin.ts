"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// ─── Types ─────────────────────────────────────────────────────────────────────
type AllowedRole = "manager" | "sales" | "client";

export interface CreateUserResult {
  success?: boolean;
  error?: string;
  userId?: string;
}

// ─── Server Action ─────────────────────────────────────────────────────────────
export async function createUserAccount(
  formData: FormData
): Promise<CreateUserResult> {
  // 1 — Parse & validate inputs
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
  const ALLOWED: AllowedRole[] = ["manager", "sales", "client"];
  if (!ALLOWED.includes(role as AllowedRole)) {
    return { error: "Rol inválido." };
  }

  // 2 — Service Role client: bypasses RLS, DOES NOT touch current session
  //     Uses @supabase/supabase-js directly (not SSR) as required
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // 3 — Create auth user (email pre-confirmed so they can log in immediately)
  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !user) {
    // Surface known error codes as human-readable messages
    const msg = authError?.message ?? "Error al crear el usuario.";
    if (msg.toLowerCase().includes("already registered")) {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: msg };
  }

  // 4 — Insert profile row linked to the new auth user
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: user.id,
    email,
    full_name: fullName,
    role,
  });

  if (profileError) {
    // Auth user was created but profile failed — roll back to avoid orphaned users
    await adminClient.auth.admin.deleteUser(user.id);
    return {
      error: `Cuenta creada pero falló el perfil: ${profileError.message}. Se revirtió la operación.`,
    };
  }

  // 5 — Refresh dashboard so team table and stats pick up the new user
  revalidatePath("/dashboard");

  return { success: true, userId: user.id };
}
