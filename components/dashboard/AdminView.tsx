import { Suspense } from "react";
import { BarChart2, Users, TrendingUp, Zap, Globe, DollarSign, Activity, ShieldCheck } from "lucide-react";
import StatCard from "./StatCard";
import SectionHeader from "./SectionHeader";
import LeadsTable from "./LeadsTable";
import type { Profile } from "./types";

const GLOBAL_STATS = [
  { label: "Clientes activos",       value: "—", sub: "Total empresa",    accent: "#00c0f3",  icon: Users       },
  { label: "Revenue este mes",        value: "—", sub: "vs. mes anterior", accent: "#D1FF48",  icon: DollarSign  },
  { label: "Leads procesados por IA", value: "—", sub: "últimos 30 días",  accent: "#a855f7",  icon: TrendingUp  },
  { label: "Agentes IA activos",      value: "—", sub: "en producción",    accent: "#fcd34d",  icon: Zap         },
];

const PIPELINE = [
  { stage: "Prospecting",   count: "—", pct: 0.18, color: "#a855f7" },
  { stage: "Calificación",  count: "—", pct: 0.35, color: "#00c0f3" },
  { stage: "Propuesta",     count: "—", pct: 0.60, color: "#D1FF48" },
  { stage: "Cierre",        count: "—", pct: 0.80, color: "#fcd34d" },
];

const TEAM = [
  { name: "Santiago M.", role: "Manager",   deals: "—", revenue: "—", badge: "#a855f7" },
  { name: "Comercial 1", role: "Sales",     deals: "—", revenue: "—", badge: "#D1FF48" },
  { name: "Comercial 2", role: "Sales",     deals: "—", revenue: "—", badge: "#D1FF48" },
];

interface Props { profile: Profile }

export default function AdminView({ profile }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "CEO";

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome */}
      <div>
        <p className="text-white/40 text-sm mb-1">Bienvenido de vuelta, {name}</p>
        <SectionHeader eyebrow="Vista global" title="Resumen de la Empresa" accent="#fcd34d" highlight="Empresa" />
      </div>

      {/* Global KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {GLOBAL_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Two-column: Pipeline + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pipeline */}
        <div className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} style={{ color: "#00c0f3" }} />
            <p className="text-white/60 text-sm font-medium">Pipeline global</p>
          </div>
          {PIPELINE.map((row) => (
            <div key={row.stage} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">{row.stage}</span>
                <span className="text-white/30">{row.count} deals</span>
              </div>
              <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${row.pct * 100}%`, background: row.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Team overview */}
        <div className="rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={14} style={{ color: "#fcd34d" }} />
            <p className="text-white/60 text-sm font-medium">Equipo comercial</p>
          </div>
          {TEAM.map((member) => (
            <div key={member.name} className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: `${member.badge}15`, color: member.badge, border: `1px solid ${member.badge}25` }}>
                  {member.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-none">{member.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-semibold">{member.revenue}</p>
                <p className="text-white/30 text-xs">{member.deals} deals</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global reach */}
      <div className="rounded-2xl p-6 flex items-center gap-4"
        style={{ background: "rgba(252,211,77,0.04)", border: "1px solid rgba(252,211,77,0.1)" }}>
        <Globe size={20} style={{ color: "#fcd34d" }} />
        <div>
          <p className="text-white font-medium text-sm">Presencia global activa</p>
          <p className="text-white/40 text-xs">Tus agentes IA operan en múltiples mercados 24/7 sin intervención humana.</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/40">Online</span>
        </div>
      </div>

      {/* CRM en Vivo */}
      <Suspense fallback={<LeadsTableSkeleton />}>
        <LeadsTable />
      </Suspense>
    </div>
  );
}

function LeadsTableSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="w-3.5 h-3.5 rounded bg-white/10" />
        <div className="w-28 h-3.5 rounded bg-white/10" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0"
          style={{ borderColor: "rgba(255,255,255,0.03)" }}>
          <div className="w-7 h-7 rounded-full bg-white/8 shrink-0" />
          <div className="flex-1 flex gap-4">
            <div className="w-28 h-3 rounded bg-white/8" />
            <div className="w-40 h-3 rounded bg-white/5" />
            <div className="w-24 h-3 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
