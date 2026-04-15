import { TrendingUp, Zap, Activity, BarChart2, CheckCircle2, Clock, HeartHandshake } from "lucide-react";
import StatCard from "./StatCard";
import SectionHeader from "./SectionHeader";
import type { Profile } from "./types";

const ROI_STATS = [
  { label: "ROI generado",         value: "—", sub: "desde implementación", accent: "#00c0f3", icon: TrendingUp  },
  { label: "Tareas automatizadas", value: "—", sub: "por mes",              accent: "#D1FF48", icon: Zap         },
  { label: "Disponibilidad IA",    value: "—", sub: "uptime garantizado",   accent: "#22c55e", icon: Activity    },
  { label: "Ahorro operativo",     value: "—", sub: "vs. equipo manual",    accent: "#a855f7", icon: BarChart2   },
];

const MILESTONES = [
  { label: "Contrato firmado",       done: true  },
  { label: "Análisis de procesos",   done: true  },
  { label: "Desarrollo del agente",  done: false },
  { label: "Testing & QA",           done: false },
  { label: "Deploy en producción",   done: false },
  { label: "Seguimiento mensual",    done: false },
];

const RECENT_ACTIVITY = [
  { event: "Reunión kick-off agendada",     time: "—", color: "#00c0f3" },
  { event: "Acceso al portal habilitado",   time: "—", color: "#D1FF48" },
  { event: "Diagnóstico inicial completado",time: "—", color: "#a855f7" },
];

interface Props { profile: Profile }

export default function ClientView({ profile }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Cliente";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-white/40 text-sm mb-1">Hola, {name}</p>
        <SectionHeader eyebrow="Portal de Cliente" title="Tu Software de IA" accent="#00c0f3" highlight="Software de IA" />
      </div>

      {/* ROI KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROI_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Two columns: milestones + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Implementation roadmap */}
        <div className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} style={{ color: "#00c0f3" }} />
            <p className="text-white/60 text-sm font-medium">Estado de implementación</p>
          </div>
          <div className="flex flex-col gap-3">
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  m.done
                    ? "bg-emerald-400/15 border border-emerald-400/30"
                    : "border border-white/10"
                }`}>
                  {m.done && <CheckCircle2 size={12} className="text-emerald-400" />}
                </div>
                <p className={`text-sm ${m.done ? "text-white" : "text-white/30"}`}>
                  {m.label}
                </p>
                {i === MILESTONES.findIndex((x) => !x.done) && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full animate-pulse"
                    style={{ background: "rgba(0,192,243,0.1)", color: "#00c0f3", border: "1px solid rgba(0,192,243,0.2)" }}>
                    En curso
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity + support */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <Activity size={14} style={{ color: "#D1FF48" }} />
              <p className="text-white/60 text-sm font-medium">Actividad reciente</p>
            </div>
            {RECENT_ACTIVITY.map((a) => (
              <div key={a.event} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                <div>
                  <p className="text-white text-sm">{a.event}</p>
                  <p className="text-white/30 text-xs flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Support CTA */}
          <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "rgba(0,192,243,0.04)", border: "1px solid rgba(0,192,243,0.1)" }}>
            <HeartHandshake size={20} style={{ color: "#00c0f3" }} />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">¿Necesitas ayuda?</p>
              <p className="text-white/40 text-xs">Tu equipo de X-Value está disponible</p>
            </div>
            <a
              href="mailto:soporte@xvalueai.com"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-[#00c0f3]/20"
              style={{ color: "#00c0f3", border: "1px solid rgba(0,192,243,0.2)" }}
            >
              Contactar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
