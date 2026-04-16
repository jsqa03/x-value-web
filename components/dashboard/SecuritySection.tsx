import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { ShieldCheck, AlertCircle, Inbox } from "lucide-react";
import ResetPasswordModal from "./ResetPasswordModal";
import DeleteUserButton from "./DeleteUserButton";
import AvatarUpload from "./AvatarUpload";
import { ROLE_META, computeAge } from "./types";
import type { Role } from "./types";

// ─── Types ──────────────────────────���─────────────────────��───────────────────
interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  avatar_url: string | null;
  birth_date: string | null;
  university: string | null;
  country: string | null;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Component ─────────────────────────────���───────────────────────────────���──
export default async function SecuritySection({ currentUserId }: { currentUserId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: users, error } = await adminClient
    .from("profiles")
    .select("id, email, full_name, role, avatar_url, birth_date, university, country, created_at")
    .order("role")
    .order("full_name");

  if (error) {
    return (
      <div
        className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}
      >
        <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-red-400 text-sm font-medium">Error al cargar usuarios</p>
          <p className="text-red-400/60 text-xs mt-0.5">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">Control de accesos</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Seguridad <span style={{ color: "#fcd34d" }}>del Sistema</span>
        </h1>
      </div>

      {/* User table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} style={{ color: "#fcd34d" }} />
            <p className="text-zinc-400 text-sm font-medium">Todos los usuarios</p>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(252,211,77,0.08)", color: "#fcd34d", border: "1px solid rgba(252,211,77,0.2)" }}
          >
            {(users ?? []).length} cuentas
          </span>
        </div>

        {!users || users.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Inbox size={28} className="text-white/10" />
            <p className="text-zinc-600 text-sm">No hay usuarios registrados</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b text-left"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  >
                    {["Usuario", "Rol", "Edad / País", "Creado", "Acciones"].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-2.5 text-[11px] font-semibold tracking-wider uppercase"
                        style={{ color: "rgba(255,255,255,0.22)" }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
                  {(users as UserRow[]).map((u) => {
                    const meta = ROLE_META[u.role] ?? ROLE_META.client;
                    const age  = computeAge(u.birth_date);
                    const isSelf = u.id === currentUserId;

                    return (
                      <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                        {/* User */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar (display only — upload is elsewhere) */}
                            {u.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.avatar_url}
                                alt={u.full_name ?? u.email}
                                className="w-8 h-8 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                style={{
                                  background: `${meta.color}12`,
                                  color: meta.color,
                                  border: `1px solid ${meta.color}20`,
                                }}
                              >
                                {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate max-w-[140px]">
                                {u.full_name ?? "—"}
                                {isSelf && (
                                  <span className="ml-1.5 text-[9px] text-zinc-600">(tú)</span>
                                )}
                              </p>
                              <p className="text-zinc-600 text-xs truncate max-w-[160px]">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-3">
                          <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </td>

                        {/* Age / Country */}
                        <td className="px-5 py-3">
                          <p className="text-zinc-300 text-sm">
                            {age !== null ? `${age} años` : "—"}
                          </p>
                          {u.country && (
                            <p className="text-zinc-600 text-xs">{u.country}</p>
                          )}
                        </td>

                        {/* Created */}
                        <td className="px-5 py-3">
                          <span className="text-zinc-600 text-xs">{formatDate(u.created_at)}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {!isSelf && (
                              <>
                                <ResetPasswordModal userId={u.id} userName={u.full_name ?? u.email} />
                                {u.role !== "admin" && (
                                  <DeleteUserButton userId={u.id} userName={u.full_name ?? u.email} />
                                )}
                              </>
                            )}
                            {isSelf && (
                              <span className="text-zinc-700 text-xs">—</span>
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
            <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {(users as UserRow[]).map((u) => {
                const meta  = ROLE_META[u.role] ?? ROLE_META.client;
                const age   = computeAge(u.birth_date);
                const isSelf = u.id === currentUserId;

                return (
                  <div key={u.id} className="px-5 py-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}20` }}
                          >
                            {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium leading-none">{u.full_name ?? "—"}</p>
                          <p className="text-zinc-600 text-xs mt-0.5">{u.email}</p>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-zinc-600 text-xs">
                        {age !== null ? `${age} años` : ""}
                        {u.country ? ` · ${u.country}` : ""}
                      </p>
                      {!isSelf && (
                        <div className="flex gap-1.5">
                          <ResetPasswordModal userId={u.id} userName={u.full_name ?? u.email} />
                          {u.role !== "admin" && (
                            <DeleteUserButton userId={u.id} userName={u.full_name ?? u.email} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Avatar Upload — for the current admin to update their own photo */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-zinc-400 text-sm font-medium">Tu foto de perfil</p>
        <AvatarUpload
          userId={currentUserId}
          initialAvatarUrl={null}
          displayName="Admin"
          accentColor="#fcd34d"
          size="lg"
        />
      </div>
    </div>
  );
}
