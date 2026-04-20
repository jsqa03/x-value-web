import {
  TrendingUp, Zap, Activity, BarChart2,
  CheckCircle2, Clock, HeartHandshake, Bot,
} from "lucide-react";
import StatCard from "./StatCard";
import type { Profile } from "./types";

const ROI_STATS = [
  { label: "ROI generado",         value: "—", sub: "desde implementación", accent: "#38bdf8", icon: <TrendingUp size={12} style={{ color: "#38bdf8", opacity: 0.6 }} /> },
  { label: "Tareas automatizadas", value: "—", sub: "por mes",              accent: "#22c55e", icon: <Zap        size={12} style={{ color: "#22c55e", opacity: 0.6 }} /> },
  { label: "Disponibilidad IA",    value: "—", sub: "uptime garantizado",   accent: "#a78bfa", icon: <Activity   size={12} style={{ color: "#a78bfa", opacity: 0.6 }} /> },
  { label: "Ahorro operativo",     value: "—", sub: "vs. equipo manual",    accent: "#f59e0b", icon: <BarChart2  size={12} style={{ color: "#f59e0b", opacity: 0.6 }} /> },
];

const MILESTONES = [
  { label: "Contrato firmado",        done: true  },
  { label: "Análisis de procesos",    done: true  },
  { label: "Desarrollo del agente",   done: false },
  { label: "Testing & QA",            done: false },
  { label: "Deploy en producción",    done: false },
  { label: "Seguimiento mensual",     done: false },
];

const RECENT_ACTIVITY = [
  { event: "Reunión kick-off agendada",      time: "—", color: "#38bdf8" },
  { event: "Acceso al portal habilitado",    time: "—", color: "#22c55e" },
  { event: "Diagnóstico inicial completado", time: "—", color: "#a78bfa" },
];

function AgentSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-500 text-sm mb-1">Hola, {name}</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Mi Agente IA</h1>
      </div>

      {/* Agent status */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
          <Bot size={22} className="text-orange-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Agente IA personalizado</p>
          <p className="text-zinc-500 text-sm mt-0.5">
            Tu agente está siendo configurado para tu flujo de trabajo específico.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-zinc-500">En configuración</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent activity */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-zinc-500" />
            <p className="text-zinc-300 text-sm font-medium">Actividad reciente</p>
          </div>
          {RECENT_ACTIVITY.map((a) => (
            <div key={a.event} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
              <div>
                <p className="text-white text-sm">{a.event}</p>
                <p className="text-zinc-600 text-xs flex items-center gap-1 mt-0.5">
                  <Clock size={10} /> {a.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Support */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <HeartHandshake size={18} className="text-orange-400 shrink-0" />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">¿Necesitas ayuda?</p>
            <p className="text-zinc-500 text-xs mt-0.5">Tu equipo de X-Value está disponible</p>
          </div>
          <a
            href="mailto:soporte@xvalueai.com"
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors shrink-0"
          >
            Contactar
          </a>
        </div>
      </div>
    </div>
  );
}

function MetricsSection() {
  const currentIndex = MILESTONES.findIndex((m) => !m.done);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">Rendimiento</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">ROI y Métricas</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROI_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-zinc-500" />
          <p className="text-zinc-300 text-sm font-medium">Estado de implementación</p>
        </div>
        <div className="flex flex-col gap-3">
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  m.done
                    ? "bg-emerald-500/15 border border-emerald-500/30"
                    : "border border-zinc-700"
                }`}
              >
                {m.done && <CheckCircle2 size={11} className="text-emerald-400" />}
              </div>
              <p className={`text-sm ${m.done ? "text-white" : "text-zinc-600"}`}>{m.label}</p>
              {i === currentIndex && (
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 animate-pulse">
                  En curso
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props { profile: Profile; section: string }

export default function ClientView({ profile, section }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Cliente";
  if (section === "metrics") return <MetricsSection />;
  return <AgentSection name={name} />;
}
