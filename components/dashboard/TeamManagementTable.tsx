import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { Users, Inbox, AlertCircle } from "lucide-react";
import DeleteUserButton from "./DeleteUserButton";
import ViewAgendaButton from "./ViewAgendaButton";
import PerformanceModal from "./PerformanceModal";
import { ROLE_META } from "./types";
import type { Role } from "./types";

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

// Null-safe date formatter
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function TeamManagementTable() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const callerRole = (callerProfile?.role ?? "client") as Role;

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const baseQuery = adminClient
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const scopedQuery =
    callerRole === "manager"
      ? baseQuery.eq("manager_id", user.id)
      : baseQuery.neq("id", user.id);

  const { data: profiles, error } = await scopedQuery;

  if (error) {
    return (
      <div
        className="p-5 flex items-start gap-3 rounded-[4px]"
        style={{ background: "rgba(255,68,68,0.05)", border: "1px solid rgba(255,68,68,0.15)" }}
      >
        <AlertCircle size={14} style={{ color: "var(--neural-red)" }} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--neural-red)" }}>Error al cargar usuarios</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,68,68,0.5)" }}>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    const emptyMsg = callerRole === "manager"
      ? "No hay usuarios en tu equipo aún"
      : "No hay otros usuarios registrados";
    return (
      <div className="neural-card p-10 flex flex-col items-center gap-3 text-center">
        <Inbox size={24} style={{ color: "var(--neural-text-muted)" }} />
        <p className="text-sm" style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text-2)" }}>{emptyMsg}</p>
        <p className="text-xs" style={{ color: "var(--neural-text-muted)" }}>
          Crea cuentas usando el botón "+ Nuevo Usuario"
        </p>
      </div>
    );
  }

  function canDelete(targetRole: Role): boolean {
    if (callerRole === "admin") return targetRole !== "admin";
    if (callerRole === "manager") return targetRole === "sales" || targetRole === "client";
    return false;
  }

  function canViewPerformance(targetRole: Role): boolean {
    return targetRole === "sales" || targetRole === "manager";
  }

  return (
    <div className="neural-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--neural-border)" }}
      >
        <div className="flex items-center gap-2">
          <Users size={12} style={{ color: "var(--neural-cyan)", opacity: 0.8 }} />
          <p
            className="text-[12px] font-semibold"
            style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text-2)" }}
          >
            Gestión del equipo
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-[3px]"
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--neural-surface-2)",
            color: "var(--neural-text-2)",
            border: "1px solid var(--neural-border)",
          }}
        >
          {profiles.length} {profiles.length === 1 ? "usuario" : "usuarios"}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto transform-gpu">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--neural-border)" }}>
              {["Usuario", "Email", "Rol", "Creado", ""].map((col, i) => (
                <th
                  key={i}
                  className="px-5 py-3 text-left text-[10px] font-semibold uppercase"
                  style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text-muted)", letterSpacing: "0.12em" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(profiles as ProfileRow[]).map((p) => {
              const meta = ROLE_META[p.role] ?? ROLE_META.client;
              return (
                <tr
                  key={p.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--neural-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}22` }}
                      >
                        {(p.full_name ?? p.email).charAt(0).toUpperCase()}
                      </div>
                      <span
                        className="text-sm font-medium truncate max-w-[140px]"
                        style={{ color: "var(--neural-text)" }}
                      >
                        {p.full_name ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs truncate max-w-[200px] block tabular-nums"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--neural-text-2)" }}
                    >
                      {p.email}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-[3px]"
                      style={{
                        fontFamily: "var(--font-ui)",
                        background: meta.bg,
                        border: `1px solid ${meta.border}`,
                        color: meta.color,
                      }}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs tabular-nums"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--neural-text-muted)" }}
                    >
                      {formatDate(p.created_at)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {canViewPerformance(p.role) && (
                        <PerformanceModal userId={p.id} userName={p.full_name ?? p.email} />
                      )}
                      <ViewAgendaButton userId={p.id} userName={p.full_name ?? p.email} />
                      {canDelete(p.role) && (
                        <DeleteUserButton userId={p.id} userName={p.full_name ?? p.email} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {(profiles as ProfileRow[]).map((p) => {
          const meta = ROLE_META[p.role] ?? ROLE_META.client;
          return (
            <div
              key={p.id}
              className="px-5 py-4 flex flex-col gap-2"
              style={{ borderBottom: "1px solid var(--neural-border)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}22` }}
                  >
                    {(p.full_name ?? p.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--neural-text)" }}>
                    {p.full_name ?? "—"}
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-[3px]"
                  style={{
                    fontFamily: "var(--font-ui)",
                    background: meta.bg,
                    color: meta.color,
                    border: `1px solid ${meta.border}`,
                  }}
                >
                  {meta.label}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-xs truncate"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--neural-text-2)" }}
                >
                  {p.email}
                </p>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {canViewPerformance(p.role) && (
                    <PerformanceModal userId={p.id} userName={p.full_name ?? p.email} />
                  )}
                  <ViewAgendaButton userName={p.full_name ?? p.email} />
                  {canDelete(p.role) && (
                    <DeleteUserButton userId={p.id} userName={p.full_name ?? p.email} />
                  )}
                </div>
              </div>
              <p
                className="text-xs tabular-nums"
                style={{ fontFamily: "var(--font-mono)", color: "var(--neural-text-muted)" }}
              >
                {formatDate(p.created_at)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
