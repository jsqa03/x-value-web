import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { ClipboardList, Clock, CheckCircle2, Inbox, Calendar, User } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import TaskCompleteButton from "./TaskCompleteButton";
import TaskDeleteButton from "./TaskDeleteButton";
import AgendaUserSelect from "./AgendaUserSelect";
import type { Task } from "@/app/actions/tasks";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface AssignableUser { id: string; full_name: string | null; email: string }

interface Props {
  userId: string;
  userRole: string;
  viewUserId?: string; // admin only — viewing another user's tasks
}

function dueDateLabel(dateStr: string): { text: string; color: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0)  return { text: `Venció hace ${Math.abs(diff)}d`, color: "#ef4444" };
  if (diff === 0) return { text: "Vence hoy",                      color: "#f59e0b" };
  if (diff === 1) return { text: "Vence mañana",                   color: "#f59e0b" };
  if (diff <= 7)  return { text: `En ${diff} días`,                color: "#a78bfa" };
  return {
    text: new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
    color: "#71717a",
  };
}

function TaskCard({ task }: { task: Task }) {
  const isDone = task.status === "completed";
  const due    = dueDateLabel(task.due_date);
  const assignerName = task.assigner?.full_name ?? task.assigner?.email;

  return (
    <div
      className={`group flex items-start gap-3 px-5 py-4 transition-colors last:border-0 ${isDone ? "opacity-55" : ""}`}
      style={{ borderBottom: "1px solid var(--neural-border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="pt-0.5">
        <TaskCompleteButton taskId={task.id} isDone={isDone} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${isDone ? "line-through" : ""}`}
          style={{
            fontFamily: "var(--font-ui)",
            color: isDone ? "var(--neural-text-muted)" : "var(--neural-text)",
          }}
        >
          {task.title}
        </p>
        {task.description && (
          <p
            className="text-xs mt-0.5 leading-relaxed line-clamp-2"
            style={{ color: "var(--neural-text-muted)" }}
          >
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold"
            style={{
              fontFamily: "var(--font-mono)",
              color: isDone ? "var(--neural-text-muted)" : due.color,
            }}
          >
            <Calendar size={8} />
            {due.text}
          </span>
          {assignerName && (
            <span
              className="inline-flex items-center gap-1 text-[10px]"
              style={{ color: "var(--neural-text-muted)" }}
            >
              <User size={8} />
              {assignerName}
            </span>
          )}
          {isDone && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: "var(--neural-green)" }}
            >
              <CheckCircle2 size={8} /> Completada
            </span>
          )}
        </div>
      </div>
      <TaskDeleteButton taskId={task.id} />
    </div>
  );
}

export default async function AgendaView({ userId, userRole, viewUserId }: Props) {
  const ac = getAdminClient();
  const isAdmin = userRole === "admin";

  // Whose tasks are we showing?
  const targetUserId = (isAdmin && viewUserId) ? viewUserId : userId;

  // Fetch tasks in parallel with users (if admin)
  const [tasksRes, usersRes] = await Promise.all([
    ac
      .from("tasks")
      .select(`
        id, title, description, due_date, status,
        assigned_to, assigned_by, created_at,
        assignee:profiles!assigned_to(full_name, email),
        assigner:profiles!assigned_by(full_name, email)
      `)
      .eq("assigned_to", targetUserId)
      .order("due_date", { ascending: true }),

    isAdmin
      ? ac
          .from("profiles")
          .select("id, full_name, email")
          .in("role", ["admin", "manager", "sales"])
          .order("full_name")
      : Promise.resolve({ data: null }),
  ]);

  const tasks = (tasksRes.data ?? []) as unknown as Task[];
  const users = (usersRes.data ?? []) as AssignableUser[];

  const pending   = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  // Viewing target name (for admin viewing someone else)
  const targetUser = isAdmin && viewUserId && viewUserId !== userId
    ? users.find((u) => u.id === viewUserId)
    : null;
  const viewingLabel = targetUser
    ? `Agenda de ${targetUser.full_name ?? targetUser.email}`
    : "Mi Agenda";

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p
            className="text-[10px] font-semibold uppercase mb-1"
            style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text-muted)", letterSpacing: "0.14em" }}
          >
            {isAdmin ? "Sistema de Tareas" : "Agenda personal"}
          </p>
          <h1
            className="text-[20px] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text)" }}
          >
            {viewingLabel}
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Admin: user selector */}
          {isAdmin && users.length > 0 && (
            <AgendaUserSelect
              users={users}
              currentUserId={userId}
              selectedId={viewUserId}
            />
          )}
          {/* Create task button */}
          <CreateTaskModal
            defaultAssigneeId={targetUserId}
            assignableUsers={isAdmin ? users : undefined}
          />
        </div>
      </div>

      {/* ── Pending tasks ───────────────────────────────────────────────── */}
      <div className="neural-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--neural-border)" }}
        >
          <div className="flex items-center gap-2">
            <Clock size={12} style={{ color: "var(--neural-accent)", opacity: 0.8 }} />
            <p
              className="text-[12px] font-semibold"
              style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text-2)" }}
            >
              Tareas Pendientes
            </p>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-[3px]"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(249,115,22,0.06)",
              color: "var(--neural-accent)",
              border: "1px solid rgba(249,115,22,0.2)",
            }}
          >
            {pending.length} pendiente{pending.length !== 1 ? "s" : ""}
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <ClipboardList size={24} style={{ color: "var(--neural-text-muted)" }} />
            <p className="text-sm" style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text-2)" }}>
              La agenda está libre
            </p>
            <p className="text-xs" style={{ color: "var(--neural-text-muted)" }}>
              Usa "Nueva Tarea" para agregar una
            </p>
          </div>
        ) : (
          <div>
            {pending.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        )}
      </div>

      {/* ── Completed tasks ─────────────────────────────────────────────── */}
      {completed.length > 0 && (
        <div className="neural-card overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--neural-border)" }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} style={{ color: "var(--neural-green)", opacity: 0.6 }} />
              <p
                className="text-[12px] font-semibold"
                style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text-muted)" }}
              >
                Completadas
              </p>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-[3px]"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(0,255,136,0.06)",
                color: "var(--neural-green)",
                border: "1px solid rgba(0,255,136,0.15)",
              }}
            >
              {completed.length}
            </span>
          </div>
          <div>
            {completed.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="neural-card overflow-hidden">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox size={28} style={{ color: "var(--neural-text-muted)" }} />
            <p
              className="text-sm font-medium"
              style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text-2)" }}
            >
              Sin tareas registradas
            </p>
            <p className="text-xs max-w-xs" style={{ color: "var(--neural-text-muted)" }}>
              {isAdmin
                ? "Crea tareas y asígnalas a cualquier miembro del equipo."
                : "Crea tareas para organizar tu agenda de trabajo."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
