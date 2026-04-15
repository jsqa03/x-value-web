import { Users, TrendingUp, Target, Award, BarChart2, Clock } from "lucide-react";
import StatCard from "./StatCard";
import SectionHeader from "./SectionHeader";
import type { Profile } from "./types";

const TEAM_STATS = [
  { label: "Deals abiertos (equipo)", value: "—", sub: "este mes",      accent: "#a855f7", icon: Target    },
  { label: "Tasa de cierre",          value: "—", sub: "promedio equipo",accent: "#D1FF48", icon: TrendingUp},
  { label: "Comerciales activos",     value: "—", sub: "en pipeline",   accent: "#00c0f3", icon: Users     },
  { label: "Revenue generado",        value: "—", sub: "acumulado",     accent: "#fcd34d", icon: BarChart2 },
];

const REPS = [
  { name: "Comercial A", deals: "—", closed: "—", rate: "—", lastActivity: "Hace —", trend: "up"   },
  { name: "Comercial B", deals: "—", closed: "—", rate: "—", lastActivity: "Hace —", trend: "down" },
  { name: "Comercial C", deals: "—", closed: "—", rate: "—", lastActivity: "Hace —", trend: "up"   },
];

const PIPELINE_STAGES = [
  { stage: "Nuevos leads",  value: "—", accent: "#a855f7" },
  { stage: "En negociación",value: "—", accent: "#00c0f3" },
  { stage: "Propuesta env.",value: "—", accent: "#D1FF48" },
  { stage: "Ganados",       value: "—", accent: "#22c55e" },
  { stage: "Perdidos",      value: "—", accent: "#ef4444" },
];

interface Props { profile: Profile }

export default function ManagerView({ profile }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Manager";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-white/40 text-sm mb-1">Hola, {name}</p>
        <SectionHeader eyebrow="Vista de Manager" title="Rendimiento del Equipo" accent="#a855f7" highlight="Equipo" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TEAM_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Reps table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <Award size={14} style={{ color: "#a855f7" }} />
          <p className="text-white/60 text-sm font-medium">Rendimiento individual</p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          {/* Header row */}
          <div className="grid grid-cols-5 px-6 py-2 text-[11px] text-white/30 uppercase tracking-wider">
            <span className="col-span-2">Comercial</span>
            <span className="text-center">Deals</span>
            <span className="text-center">Cerrados</span>
            <span className="text-center">Tasa</span>
          </div>
          {REPS.map((rep) => (
            <div key={rep.name} className="grid grid-cols-5 items-center px-6 py-3">
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)" }}>
                  {rep.name[rep.name.length - 1]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{rep.name}</p>
                  <p className="text-white/30 text-xs flex items-center gap-1">
                    <Clock size={10} /> {rep.lastActivity}
                  </p>
                </div>
              </div>
              <span className="text-center text-white/60 text-sm">{rep.deals}</span>
              <span className="text-center text-white/60 text-sm">{rep.closed}</span>
              <span className={`text-center text-sm font-semibold ${rep.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {rep.rate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-5">
          <Target size={14} style={{ color: "#D1FF48" }} />
          <p className="text-white/60 text-sm font-medium">Estado del pipeline</p>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.stage} className="flex flex-col items-center gap-2 rounded-xl p-3 text-center"
              style={{ background: `${stage.accent}08`, border: `1px solid ${stage.accent}18` }}>
              <p className="text-xl font-bold" style={{ color: stage.accent }}>{stage.value}</p>
              <p className="text-[10px] text-white/40 leading-tight">{stage.stage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
