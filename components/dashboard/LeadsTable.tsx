import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { Users, Clock, Inbox } from "lucide-react";
import EditLeadModal from "./EditLeadModal";
import ContractActivationModal from "./finance/ContractActivationModal";
import type { Role } from "./types";

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  company_info: string | null;
  niche: string | null;
  service_type: string | null;
  pipeline_status: string | null;
  lost_reason: string | null;
  notes: string | null;
  is_verified: boolean;
  assigned_to: string | null;
  created_at: string;
}

interface Assignee { id: string; full_name: string | null }

// Null-safe date formatter — avoids the 1970 epoch fallback
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

const PIPELINE_STYLE: Record<string, { color: string; bg: string; border: string; short: string }> = {
  "En seguimiento":         { color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)",  short: "Seguimiento"   },
  "Reunión confirmada":     { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", short: "Reunión"       },
  "Cotización enviada":     { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",  short: "Cotización"    },
  "Perdido/No":             { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   short: "Perdido"       },
  "Cerrado/Cliente activo": { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)",   short: "Cerrado ✓"     },
};

function PipelineBadge({ status }: { status: string | null }) {
  if (!status) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
      <Clock size={9} />
      Pendiente
    </span>
  );
  const s = PIPELINE_STYLE[status];
  if (!s) return <span className="text-zinc-500 text-xs">{status}</span>;
  return (
    <span
      className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.short}
    </span>
  );
}

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const LEAD_COLS = "id, name, email, whatsapp, company_info, niche, service_type, pipeline_status, lost_reason, notes, is_verified, assigned_to, created_at";

export default async function LeadsTable() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = (profileData?.role ?? "client") as Role;

  const ac = getAdminClient();
  let leads: Lead[] = [];

  if (role === "admin") {
    const { data } = await ac.from("leads").select(LEAD_COLS).order("created_at", { ascending: false });
    leads = (data ?? []) as Lead[];

  } else if (role === "manager") {
    // Leads assigned to the manager OR any of their team members
    const { data: team } = await ac.from("profiles").select("id").eq("manager_id", user.id);
    const teamIds = [user.id, ...(team ?? []).map((t: { id: string }) => t.id)];
    const { data } = await ac.from("leads").select(LEAD_COLS).in("assigned_to", teamIds).order("created_at", { ascending: false });
    leads = (data ?? []) as Lead[];

  } else if (role === "sales") {
    const { data } = await ac.from("leads").select(LEAD_COLS).eq("assigned_to", user.id).order("created_at", { ascending: false });
    leads = (data ?? []) as Lead[];
  }

  // Build a name map for assignees
  const assigneeIds = [...new Set(leads.map((l) => l.assigned_to).filter(Boolean))] as string[];
  let assigneeMap: Record<string, string> = {};
  if (assigneeIds.length > 0) {
    const { data: assignees } = await ac.from("profiles").select("id, full_name").in("id", assigneeIds);
    assigneeMap = Object.fromEntries((assignees as Assignee[] ?? []).map((a) => [a.id, a.full_name ?? "—"]));
  }

  // Find which closed leads already have a contract (to avoid showing "Activar" twice)
  const closedLeadIds = leads
    .filter((l) => l.pipeline_status === "Cerrado/Cliente activo")
    .map((l) => l.id);
  let activatedLeadIds = new Set<string>();
  if (closedLeadIds.length > 0) {
    const { data: contracts } = await ac
      .from("contracts")
      .select("lead_id")
      .in("lead_id", closedLeadIds);
    activatedLeadIds = new Set((contracts ?? []).map((c: { lead_id: string }) => c.lead_id));
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-10 flex flex-col items-center gap-3 text-center">
        <Inbox size={26} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm">No hay leads registrados</p>
        <p className="text-zinc-700 text-xs">Los contactos aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-zinc-500" />
          <p className="text-zinc-300 text-sm font-medium">Todos los leads</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
          {leads.length} registros
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {["Nombre / Empresa", "Contacto", "Servicio", "Estado", "Asignado a", "Fecha", ""].map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-zinc-900/40 transition-colors group">
                {/* Name / Company */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[11px] font-semibold text-orange-400 shrink-0">
                      {lead.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate max-w-[130px]">{lead.name}</p>
                      {lead.company_info && (
                        <p className="text-zinc-600 text-xs truncate max-w-[130px]">{lead.company_info}</p>
                      )}
                    </div>
                  </div>
                </td>
                {/* Contact */}
                <td className="px-4 py-3.5">
                  <p className="text-zinc-400 text-sm truncate max-w-[160px]">{lead.email}</p>
                  {lead.whatsapp && <p className="text-zinc-600 text-xs">{lead.whatsapp}</p>}
                </td>
                {/* Service */}
                <td className="px-4 py-3.5">
                  <span className="text-zinc-400 text-xs">{lead.service_type ?? "—"}</span>
                </td>
                {/* Status */}
                <td className="px-4 py-3.5">
                  <PipelineBadge status={lead.pipeline_status} />
                </td>
                {/* Assignee */}
                <td className="px-4 py-3.5">
                  <span className="text-zinc-500 text-xs">
                    {lead.assigned_to ? (assigneeMap[lead.assigned_to] ?? "—") : "—"}
                  </span>
                </td>
                {/* Date */}
                <td className="px-4 py-3.5">
                  <span className="text-zinc-600 text-xs">{formatDate(lead.created_at)}</span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {lead.pipeline_status === "Cerrado/Cliente activo" &&
                      !activatedLeadIds.has(lead.id) &&
                      (role === "admin" || role === "manager") && (
                      <ContractActivationModal lead={lead} />
                    )}
                    <EditLeadModal lead={lead} callerRole={role} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet / Mobile cards */}
      <div className="lg:hidden divide-y divide-zinc-800/60">
        {leads.map((lead) => (
          <div key={lead.id} className="px-5 py-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[11px] font-semibold text-orange-400 shrink-0">
                  {lead.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{lead.name}</p>
                  {lead.company_info && <p className="text-zinc-600 text-xs">{lead.company_info}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PipelineBadge status={lead.pipeline_status} />
                {lead.pipeline_status === "Cerrado/Cliente activo" &&
                  !activatedLeadIds.has(lead.id) &&
                  (role === "admin" || role === "manager") && (
                  <ContractActivationModal lead={lead} />
                )}
                <EditLeadModal lead={lead} callerRole={role} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-zinc-500 text-xs truncate">{lead.email}</p>
                {lead.service_type && <p className="text-zinc-600 text-xs">{lead.service_type}</p>}
              </div>
              <div className="text-right shrink-0">
                {lead.assigned_to && <p className="text-zinc-600 text-xs">{assigneeMap[lead.assigned_to] ?? "—"}</p>}
                <p className="text-zinc-700 text-xs">{formatDate(lead.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
