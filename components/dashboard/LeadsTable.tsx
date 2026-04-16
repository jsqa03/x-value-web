import { createClient } from "@/utils/supabase/server";
import { Users, CheckCircle2, Clock, AlertCircle, Inbox } from "lucide-react";

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

export default async function LeadsTable() {
  const supabase = await createClient();

  // No .limit() — show every lead
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, email, whatsapp, is_verified, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex items-start gap-3">
        <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-red-400 text-sm font-medium">Error al cargar leads</p>
          <p className="text-red-400/60 text-xs mt-0.5">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-10 flex flex-col items-center gap-3 text-center">
        <Inbox size={26} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm">No hay leads registrados</p>
        <p className="text-zinc-700 text-xs">Los contactos del formulario aparecerán aquí</p>
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
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {["Nombre", "Email", "WhatsApp", "Estado", "Fecha"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {leads.map((lead: Lead) => (
              <tr key={lead.id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[11px] font-semibold text-orange-400 shrink-0">
                      {lead.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <span className="text-white text-sm font-medium truncate max-w-[140px]">
                      {lead.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-zinc-400 text-sm truncate max-w-[200px] block">{lead.email}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-zinc-400 text-sm">{lead.whatsapp ?? "—"}</span>
                </td>
                <td className="px-5 py-3.5">
                  {lead.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2 size={10} />
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Clock size={10} />
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-zinc-600 text-xs">{formatDate(lead.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-zinc-800/60">
        {leads.map((lead: Lead) => (
          <div key={lead.id} className="px-5 py-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[11px] font-semibold text-orange-400 shrink-0">
                  {lead.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <span className="text-white text-sm font-medium">{lead.name}</span>
              </div>
              {lead.is_verified ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Verificado
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  Pendiente
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs">{lead.email}</p>
            <div className="flex items-center justify-between">
              <p className="text-zinc-600 text-xs">{lead.whatsapp ?? "—"}</p>
              <p className="text-zinc-700 text-xs">{formatDate(lead.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
