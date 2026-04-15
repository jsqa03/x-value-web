import { Calendar, Phone, Mail, CheckCircle2, Clock, TrendingUp, Target, Flame } from "lucide-react";
import StatCard from "./StatCard";
import SectionHeader from "./SectionHeader";
import type { Profile } from "./types";

const MY_STATS = [
  { label: "Mis deals activos",   value: "—", sub: "en seguimiento",  accent: "#D1FF48", icon: Target      },
  { label: "Reuniones esta semana",value: "—", sub: "confirmadas",    accent: "#00c0f3", icon: Calendar    },
  { label: "Tasa de cierre",      value: "—", sub: "últimos 30 días", accent: "#a855f7", icon: TrendingUp  },
  { label: "Leads calientes",     value: "—", sub: "para contactar",  accent: "#f97316", icon: Flame       },
];

const TODAY_TASKS = [
  { time: "—", lead: "Prospecto A", action: "Llamada de seguimiento", done: false, channel: "phone" },
  { time: "—", lead: "Prospecto B", action: "Enviar propuesta",       done: false, channel: "email" },
  { time: "—", lead: "Prospecto C", action: "Reunión de demo",        done: true,  channel: "phone" },
  { time: "—", lead: "Prospecto D", action: "Confirmar contrato",     done: false, channel: "email" },
];

const MY_LEADS = [
  { name: "Empresa X",  status: "Calificado", value: "—", next: "Demo",       color: "#D1FF48" },
  { name: "Empresa Y",  status: "Propuesta",  value: "—", next: "Seguimiento",color: "#00c0f3" },
  { name: "Empresa Z",  status: "Negociando", value: "—", next: "Cierre",     color: "#a855f7" },
];

interface Props { profile: Profile }

export default function SalesView({ profile }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Comercial";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-white/40 text-sm mb-1">¡Buenas, {name}!</p>
        <SectionHeader eyebrow="Vista Comercial" title="Tu Agenda y Pipeline" accent="#D1FF48" highlight="Pipeline" />
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MY_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Two columns: tasks + leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's agenda */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <Calendar size={14} style={{ color: "#D1FF48" }} />
            <p className="text-white/60 text-sm font-medium">Agenda de hoy</p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {TODAY_TASKS.map((task, i) => (
              <div key={i} className={`flex items-start gap-3 px-5 py-3.5 ${task.done ? "opacity-40" : ""}`}>
                <div className="mt-0.5 shrink-0">
                  {task.done
                    ? <CheckCircle2 size={15} className="text-emerald-400" />
                    : <div className="w-[15px] h-[15px] rounded-full border-2 border-white/20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-none mb-0.5 ${task.done ? "line-through text-white/30" : "text-white"}`}>
                    {task.action}
                  </p>
                  <p className="text-xs text-white/30 truncate">{task.lead}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {task.channel === "phone"
                    ? <Phone size={12} className="text-white/25" />
                    : <Mail size={12} className="text-white/25" />}
                  <span className="text-xs text-white/30">{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My leads */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <Target size={14} style={{ color: "#00c0f3" }} />
            <p className="text-white/60 text-sm font-medium">Mis leads activos</p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {MY_LEADS.map((lead) => (
              <div key={lead.name} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-white text-sm font-medium">{lead.name}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${lead.color}12`, color: lead.color, border: `1px solid ${lead.color}20` }}>
                    {lead.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{lead.value}</p>
                  <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1 justify-end">
                    <Clock size={10} /> {lead.next}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
