"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./admin";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
  assigned_to: string;
  assigned_by: string | null;
  assignee: { full_name: string | null; email: string } | null;
  assigner: { full_name: string | null; email: string } | null;
  created_at: string;
}

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireStaff(): Promise<{ id: string; role: string } | null> {
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

// ─── createTask ───────────────────────────────────────────────────────────────
export async function createTask(formData: FormData): Promise<ActionResult> {
  const caller = await requireStaff();
  if (!caller) return { error: "No autenticado o sin permisos." };

  const title       = (formData.get("title")       as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() || null;
  const due_date    = (formData.get("due_date")    as string | null) ?? "";
  // Admin can assign to anyone; others are always self-assigned
  const raw_assignee = (formData.get("assigned_to") as string | null) || caller.id;
  const assigned_to  = caller.role === "admin" ? raw_assignee : caller.id;

  if (!title)    return { error: "El título es obligatorio." };
  if (!due_date) return { error: "La fecha de vencimiento es obligatoria." };

  const ac = getAdminClient();
  const { error } = await ac.from("tasks").insert({
    title,
    description,
    due_date,
    assigned_to,
    assigned_by: caller.id,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── completeTask ─────────────────────────────────────────────────────────────
export async function completeTask(taskId: string): Promise<ActionResult> {
  const caller = await requireStaff();
  if (!caller) return { error: "No autenticado." };

  const ac = getAdminClient();

  if (caller.role !== "admin") {
    const { data } = await ac.from("tasks").select("assigned_to").eq("id", taskId).single();
    if (!data || data.assigned_to !== caller.id)
      return { error: "Solo puedes completar tus propias tareas." };
  }

  const { error } = await ac.from("tasks").update({ status: "completed" }).eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── reopenTask ───────────────────────────────────────────────────────────────
export async function reopenTask(taskId: string): Promise<ActionResult> {
  const caller = await requireStaff();
  if (!caller) return { error: "No autenticado." };

  const ac = getAdminClient();

  if (caller.role !== "admin") {
    const { data } = await ac.from("tasks").select("assigned_to").eq("id", taskId).single();
    if (!data || data.assigned_to !== caller.id)
      return { error: "Solo puedes reabrir tus propias tareas." };
  }

  const { error } = await ac.from("tasks").update({ status: "pending" }).eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── deleteTask ───────────────────────────────────────────────────────────────
export async function deleteTask(taskId: string): Promise<ActionResult> {
  const caller = await requireStaff();
  if (!caller) return { error: "No autenticado." };

  const ac = getAdminClient();

  if (caller.role !== "admin") {
    const { data } = await ac.from("tasks").select("assigned_to").eq("id", taskId).single();
    if (!data || data.assigned_to !== caller.id)
      return { error: "Solo puedes eliminar tus propias tareas." };
  }

  const { error } = await ac.from("tasks").delete().eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── getUserTasks (readable server action for client use) ─────────────────────
export async function getUserTasks(targetUserId: string): Promise<Task[]> {
  const caller = await requireStaff();
  if (!caller) return [];

  const ac = getAdminClient();
  const { data } = await ac
    .from("tasks")
    .select(`
      id, title, description, due_date, status,
      assigned_to, assigned_by, created_at,
      assignee:profiles!assigned_to(full_name, email),
      assigner:profiles!assigned_by(full_name, email)
    `)
    .eq("assigned_to", targetUserId)
    .order("due_date", { ascending: true });

  return (data ?? []) as unknown as Task[];
}
