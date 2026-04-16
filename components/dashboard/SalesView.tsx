import { TrendingUp, Target, Flame, Calendar, Clock } from "lucide-react";
import StatCard from "./StatCard";
import TaskManager from "./TaskManager";
import CreateLeadModal from "./CreateLeadModal";
import type { Profile } from "./types";

const MY_STATS = [
  { label: "Mis deals activos",    value: "—", sub: "en seguimiento",  accent: "#f59e0b", icon: Target     },
  { label: "Reuniones esta semana",value: "—", sub: "confirmadas",     accent: "#38bdf8", icon: Calendar   },
  { label: "Tasa de cierre",       value: "—", sub: "últimos 30 días", accent: "#a78bfa", icon: TrendingUp },
  { label: "Leads calientes",      value: "—", sub: "para contactar",  accent: "#ef4444", icon: Flame      },
];

const MY_LEADS = [
  { name: "Empresa X", status: "Calificado", value: "—", next: "Demo",        color: "#f59e0b" },
  { name: "Empresa Y", status: "Propuesta",  value: "—", next: "Seguimiento", color: "#38bdf8" },
  { name: "Empresa Z", status: "Negociando", value: "—", next: "Cierre",      color: "#a78bfa" },
];

function LeadsSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-500 text-sm mb-1">¡Buenas, {name}!</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Mis Leads</h1>
        </div>
        <CreateLeadModal callerRole="sales" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MY_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
          <Target size={14} className="text-zinc-500" />
          <p className="text-zinc-300 text-sm font-medium">Mis leads activos</p>
        </div>

        {MY_LEADS.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Target size={26} className="text-zinc-700" />
            <p className="text-zinc-500 text-sm">No hay leads activos aún</p>
            <p className="text-zinc-700 text-xs">Los leads asignados a ti aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {MY_LEADS.map((lead) => (
              <div
                key={lead.name}
                className="flex items-center justify-between px-5 py-4 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: `${lead.color}12`, color: lead.color, border: `1px solid ${lead.color}22` }}
                  >
                    {lead.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{lead.name}</p>
                    <span
                      className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${lead.color}12`, color: lead.color, border: `1px solid ${lead.color}22` }}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{lead.value}</p>
                  <p className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1 justify-end">
                    <Clock size={10} /> {lead.next}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-500 text-sm mb-1">Agenda personal · {name}</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Mi Agenda</h1>
      </div>
      <TaskManager />
    </div>
  );
}

interface Props { profile: Profile; section: string }

export default function SalesView({ profile, section }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Comercial";
  if (section === "schedule") return <ScheduleSection name={name} />;
  return <LeadsSection name={name} />;
}
