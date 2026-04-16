import {
  TrendingUp, Zap, Activity, BarChart2,
  CheckCircle2, Clock, HeartHandshake, Bot,
} from "lucide-react";
import StatCard from "./StatCard";
import type { Profile } from "./types";

// ─── Static data ──────────────────────────────────────────────────────────────
const ROI_STATS = [
  { label: "ROI generado",         value: "—", sub: "desde implementación", accent: "#00c0f3", icon: TrendingUp },
  { label: "Tareas automatizadas", value: "—", sub: "por mes",              accent: "#D1FF48", icon: Zap        },
  { label: "Disponibilidad IA",    value: "—", sub: "uptime garantizado",   accent: "#22c55e", icon: Activity   },
  { label: "Ahorro operativo",     value: "—", sub: "vs. equipo manual",    accent: "#a855f7", icon: BarChart2  },
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
  { event: "Reunión kick-off agendada",      time: "—", color: "#00c0f3" },
  { event: "Acceso al portal habilitado",    time: "—", color: "#D1FF48" },
  { event: "Diagnóstico inicial completado", time: "—", color: "#a855f7" },
];

// ─── Section: Agent ───────────────────────────────────────────────────────────
function AgentSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-500 text-sm mb-1">Hola, {name}</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Mi <span style={{ color: "#00c0f3" }}>Agente IA</span>
        </h1>
      </div>

      {/* Agent status card */}
      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{
          background: "rgba(0,192,243,0.04)",
          border: "1px solid rgba(0,192,243,0.1)",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(0,192,243,0.1)",
            border: "1px solid rgba(0,192,243,0.2)",
          }}
        >
          <Bot size={26} style={{ color: "#00c0f3" }} />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-base">Agente IA personalizado</p>
          <p className="text-zinc-500 text-sm mt-0.5">
            Tu agente está siendo configurado para tu flujo de trabajo específico.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-zinc-500">En configuración</span>
        </div>
      </div>

      {/* Activity + support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent activity */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2">
            <Activity size={14} style={{ color: "#D1FF48" }} />
            <p className="text-zinc-400 text-sm font-medium">Actividad reciente</p>
          </div>
          {RECENT_ACTIVITY.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Activity size={24} className="text-white/10" />
              <p className="text-zinc-600 text-sm">Sin actividad reciente</p>
            </div>
          ) : (
            RECENT_ACTIVITY.map((a) => (
              <div key={a.event} className="flex items-start gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: a.color }}
                />
                <div>
                  <p className="text-white text-sm">{a.event}</p>
                  <p className="text-zinc-600 text-xs flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {a.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Support CTA */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{
              background: "rgba(0,192,243,0.04)",
              border: "1px solid rgba(0,192,243,0.1)",
            }}
          >
            <HeartHandshake size={20} style={{ color: "#00c0f3" }} />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">¿Necesitas ayuda?</p>
              <p className="text-zinc-500 text-xs">
                Tu equipo de X-Value está disponible
              </p>
            </div>
            <a
              href="mailto:soporte@xvalueai.com"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-[#00c0f3]/15"
              style={{
                color: "#00c0f3",
                border: "1px solid rgba(0,192,243,0.2)",
              }}
            >
              Contactar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Metrics ─────────────────────────────────────────────────────────
function MetricsSection() {
  const currentIndex = MILESTONES.findIndex((m) => !m.done);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">
          Rendimiento
        </p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          ROI y <span style={{ color: "#a855f7" }}>Métricas</span>
        </h1>
      </div>

      {/* ROI KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROI_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Implementation roadmap */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} style={{ color: "#00c0f3" }} />
          <p className="text-zinc-400 text-sm font-medium">
            Estado de implementación
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  m.done
                    ? "bg-emerald-400/15 border border-emerald-400/30"
                    : "border border-white/10"
                }`}
              >
                {m.done && (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                )}
              </div>
              <p
                className={`text-sm ${
                  m.done ? "text-white" : "text-zinc-600"
                }`}
              >
                {m.label}
              </p>
              {i === currentIndex && (
                <span
                  className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full animate-pulse"
                  style={{
                    background: "rgba(0,192,243,0.1)",
                    color: "#00c0f3",
                    border: "1px solid rgba(0,192,243,0.2)",
                  }}
                >
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

// ─── Root component ───────────────────────────────────────────────────────────
interface Props {
  profile: Profile;
  section: string;
}

export default function ClientView({ profile, section }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Cliente";

  if (section === "metrics") return <MetricsSection />;
  return <AgentSection name={name} />;
}
