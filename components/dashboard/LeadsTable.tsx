import { createClient } from "@/utils/supabase/server";
import { Users, CheckCircle2, Clock, AlertCircle, Inbox } from "lucide-react";

// ─── Exact schema from ConversionModal INSERT ──────────────────────────────────
interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  is_verified: boolean;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default async function LeadsTable() {
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, email, whatsapp, is_verified, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="rounded-2xl p-5 flex items-start gap-3"
        style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}
      >
        <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-red-400 text-sm font-medium">Error al cargar leads</p>
          <p className="text-red-400/60 text-xs mt-0.5">{error.message}</p>
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!leads || leads.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Inbox size={28} className="text-white/15" />
        <p className="text-white/30 text-sm">No hay leads recientes</p>
        <p className="text-white/15 text-xs">
          Los contactos del formulario aparecerán aquí
        </p>
      </div>
    );
  }

  // ── Table ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: "#00c0f3" }} />
          <p className="text-white/60 text-sm font-medium">Leads recientes</p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{
            background: "rgba(0,192,243,0.08)",
            border: "1px solid rgba(0,192,243,0.2)",
            color: "#00c0f3",
          }}
        >
          {leads.length} registros
        </span>
      </div>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="text-left border-b"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              {["Nombre", "Email", "WhatsApp", "Estado", "Fecha"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-2.5 text-[11px] font-medium tracking-wider uppercase"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
            {leads.map((lead: Lead) => (
              <tr
                key={lead.id}
                className="transition-colors hover:bg-white/[0.02]"
              >
                {/* Nombre */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{
                        background: "rgba(0,192,243,0.1)",
                        color: "#00c0f3",
                        border: "1px solid rgba(0,192,243,0.2)",
                      }}
                    >
                      {lead.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <span className="text-white text-sm font-medium truncate max-w-[140px]">
                      {lead.name}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-3.5">
                  <span className="text-white/50 text-sm truncate max-w-[180px] block">
                    {lead.email}
                  </span>
                </td>

                {/* WhatsApp */}
                <td className="px-5 py-3.5">
                  <span className="text-white/50 text-sm font-mono">
                    {lead.whatsapp ?? "—"}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-5 py-3.5">
                  {lead.is_verified ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        color: "#22c55e",
                      }}
                    >
                      <CheckCircle2 size={10} />
                      Verificado
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(251,191,36,0.08)",
                        border: "1px solid rgba(251,191,36,0.2)",
                        color: "#fbbf24",
                      }}
                    >
                      <Clock size={10} />
                      Pendiente
                    </span>
                  )}
                </td>

                {/* Fecha */}
                <td className="px-5 py-3.5">
                  <span className="text-white/30 text-xs">
                    {formatDate(lead.created_at)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards — shown below md */}
      <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {leads.map((lead: Lead) => (
          <div key={lead.id} className="px-5 py-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{
                    background: "rgba(0,192,243,0.1)",
                    color: "#00c0f3",
                    border: "1px solid rgba(0,192,243,0.2)",
                  }}
                >
                  {lead.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <span className="text-white text-sm font-medium">{lead.name}</span>
              </div>
              {lead.is_verified ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                  Verificado
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                  Pendiente
                </span>
              )}
            </div>
            <p className="text-white/40 text-xs">{lead.email}</p>
            <div className="flex items-center justify-between">
              <p className="text-white/30 text-xs font-mono">{lead.whatsapp ?? "—"}</p>
              <p className="text-white/25 text-xs">{formatDate(lead.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
