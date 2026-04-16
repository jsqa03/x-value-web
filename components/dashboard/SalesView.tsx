import { TrendingUp, Target, Flame, Calendar, Clock } from "lucide-react";
import StatCard from "./StatCard";
import TaskManager from "./TaskManager";
import type { Profile } from "./types";

// ─── Static data ──────────────────────────────────────────────────────────────
const MY_STATS = [
  { label: "Mis deals activos",    value: "—", sub: "en seguimiento",  accent: "#D1FF48", icon: Target     },
  { label: "Reuniones esta semana",value: "—", sub: "confirmadas",     accent: "#00c0f3", icon: Calendar   },
  { label: "Tasa de cierre",       value: "—", sub: "últimos 30 días", accent: "#a855f7", icon: TrendingUp },
  { label: "Leads calientes",      value: "—", sub: "para contactar",  accent: "#f97316", icon: Flame      },
];

const MY_LEADS = [
  { name: "Empresa X", status: "Calificado", value: "—", next: "Demo",        color: "#D1FF48" },
  { name: "Empresa Y", status: "Propuesta",  value: "—", next: "Seguimiento", color: "#00c0f3" },
  { name: "Empresa Z", status: "Negociando", value: "—", next: "Cierre",      color: "#a855f7" },
];

// ─── Section: Leads ───────────────────────────────────────────────────────────
function LeadsSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-500 text-sm mb-1">¡Buenas, {name}!</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Mis <span style={{ color: "#D1FF48" }}>Leads</span>
        </h1>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MY_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Leads list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="flex items-center gap-2 px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <Target size={14} style={{ color: "#00c0f3" }} />
          <p className="text-zinc-400 text-sm font-medium">Mis leads activos</p>
        </div>

        {MY_LEADS.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Target size={28} className="text-white/10" />
            <p className="text-zinc-500 text-sm">No hay leads activos aún</p>
            <p className="text-zinc-700 text-xs">
              Los leads asignados a ti aparecerán aquí
            </p>
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            {MY_LEADS.map((lead) => (
              <div
                key={lead.name}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `${lead.color}12`,
                      color: lead.color,
                      border: `1px solid ${lead.color}20`,
                    }}
                  >
                    {lead.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{lead.name}</p>
                    <span
                      className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${lead.color}12`,
                        color: lead.color,
                        border: `1px solid ${lead.color}20`,
                      }}
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

// ─── Section: Schedule ────────────────────────────────────────────────────────
function ScheduleSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-500 text-sm mb-1">Agenda personal · {name}</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Mi <span style={{ color: "#00c0f3" }}>Agenda</span>
        </h1>
      </div>
      <TaskManager />
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
interface Props {
  profile: Profile;
  section: string;
}

export default function SalesView({ profile, section }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Comercial";

  if (section === "schedule") return <ScheduleSection name={name} />;
  return <LeadsSection name={name} />;
}
