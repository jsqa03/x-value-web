import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { Users, Inbox, AlertCircle } from "lucide-react";
import DeleteUserButton from "./DeleteUserButton";
import ViewAgendaButton from "./ViewAgendaButton";
import { ROLE_META } from "./types";
import type { Role } from "./types";

// ─── Profile row from DB ───────────────────────────────────────────────────────
interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default async function TeamManagementTable() {
  // 1 — Get current user via SSR client (session-verified)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 2 — Fetch caller role to determine query scope and delete controls
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const callerRole = (callerProfile?.role ?? "client") as Role;

  // 3 — Read profiles using Service Role (bypasses RLS)
  //     • Admin  → sees everyone except themselves
  //     • Manager → sees only users they personally created (manager_id = their id)
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
      ? baseQuery.eq("manager_id", user.id)           // only their direct reports
      : baseQuery.neq("id", user.id);                 // admin: everyone except self

  const { data: profiles, error } = await scopedQuery;

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-red-400 text-sm font-medium">Error al cargar usuarios</p>
          <p className="text-red-400/60 text-xs mt-0.5">{error.message}</p>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!profiles || profiles.length === 0) {
    const emptyMsg =
      callerRole === "manager"
        ? "No hay usuarios en tu equipo aún"
        : "No hay otros usuarios registrados";
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <Inbox size={28} className="text-white/15" />
        <p className="text-white/30 text-sm">{emptyMsg}</p>
        <p className="text-white/15 text-xs">Crea cuentas usando el botón "+ Nuevo Usuario"</p>
      </div>
    );
  }

  // ── Determine which users can be deleted by the caller ────────────────────
  function canDelete(targetRole: Role): boolean {
    if (callerRole === "admin") return targetRole !== "admin" || false; // admin can delete non-admins
    if (callerRole === "manager") return targetRole === "sales" || targetRole === "client";
    return false;
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: "#a855f7" }} />
          <p className="text-white/60 text-sm font-medium">Gestión del equipo</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "#a855f7" }}>
          {profiles.length} {profiles.length === 1 ? "usuario" : "usuarios"}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {["Usuario", "Email", "Rol", "Creado", ""].map((col, i) => (
                <th key={i}
                  className="px-5 py-2.5 text-left text-[11px] font-medium tracking-wider uppercase"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
            {(profiles as ProfileRow[]).map((p) => {
              const meta = ROLE_META[p.role] ?? ROLE_META.client;
              return (
                <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">

                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}22` }}>
                        {(p.full_name ?? p.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium truncate max-w-[140px]">
                        {p.full_name ?? "—"}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5">
                    <span className="text-white/50 text-sm truncate max-w-[200px] block">{p.email}</span>
                  </td>

                  {/* Role badge */}
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
                      {meta.label}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <span className="text-white/30 text-xs">{formatDate(p.created_at)}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <ViewAgendaButton userName={p.full_name ?? p.email} />
                      {canDelete(p.role) ? (
                        <DeleteUserButton userId={p.id} userName={p.full_name ?? p.email} />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {(profiles as ProfileRow[]).map((p) => {
          const meta = ROLE_META[p.role] ?? ROLE_META.client;
          return (
            <div key={p.id} className="px-5 py-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}22` }}>
                    {(p.full_name ?? p.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium">{p.full_name ?? "—"}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                  {meta.label}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-white/40 text-xs truncate">{p.email}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ViewAgendaButton userName={p.full_name ?? p.email} />
                  {canDelete(p.role) ? (
                    <DeleteUserButton userId={p.id} userName={p.full_name ?? p.email} />
                  ) : null}
                </div>
              </div>
              <p className="text-white/20 text-xs">{formatDate(p.created_at)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
