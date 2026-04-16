import { Suspense } from "react";
import {
  Users, TrendingUp, Target, BarChart2,
  Award, Clock,
} from "lucide-react";
import StatCard from "./StatCard";
import LeadsTable from "./LeadsTable";
import CreateUserModal from "./CreateUserModal";
import TeamManagementTable from "./TeamManagementTable";
import SearchBar from "./SearchBar";
import type { Profile } from "./types";

// ─── Static data ──────────────────────────────────────────────────────────────
const TEAM_STATS = [
  { label: "Deals abiertos (equipo)", value: "—", sub: "este mes",       accent: "#a855f7", icon: Target     },
  { label: "Tasa de cierre",          value: "—", sub: "promedio equipo", accent: "#D1FF48", icon: TrendingUp },
  { label: "Comerciales activos",     value: "—", sub: "en pipeline",    accent: "#00c0f3", icon: Users      },
  { label: "Revenue generado",        value: "—", sub: "acumulado",      accent: "#fcd34d", icon: BarChart2  },
];

const PIPELINE_STAGES = [
  { stage: "Nuevos leads",   value: "—", accent: "#a855f7" },
  { stage: "En negociación", value: "—", accent: "#00c0f3" },
  { stage: "Propuesta env.", value: "—", accent: "#D1FF48" },
  { stage: "Ganados",        value: "—", accent: "#22c55e" },
  { stage: "Perdidos",       value: "—", accent: "#ef4444" },
];

const REPS = [
  { name: "Comercial A", deals: "—", closed: "—", rate: "—", lastActivity: "Hace —", trend: "up"   },
  { name: "Comercial B", deals: "—", closed: "—", rate: "—", lastActivity: "Hace —", trend: "down" },
  { name: "Comercial C", deals: "—", closed: "—", rate: "—", lastActivity: "Hace —", trend: "up"   },
];

// ─── Shared skeleton ───────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="px-5 py-4 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="w-3.5 h-3.5 rounded bg-white/10" />
        <div className="w-32 h-3.5 rounded bg-white/10" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0"
          style={{ borderColor: "rgba(255,255,255,0.03)" }}
        >
          <div className="w-7 h-7 rounded-full bg-white/[0.06] shrink-0" />
          <div className="flex-1 flex gap-4">
            <div className="w-28 h-3 rounded bg-white/[0.06]" />
            <div className="w-40 h-3 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section: Overview ────────────────────────────────────────────────────────
function OverviewSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div>
        <p className="text-zinc-500 text-sm mb-1">Hola, {name}</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Rendimiento del{" "}
          <span style={{ color: "#a855f7" }}>Equipo</span>
        </h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TEAM_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Individual performance */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="flex items-center gap-2 px-6 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <Award size={14} style={{ color: "#a855f7" }} />
          <p className="text-zinc-400 text-sm font-medium">Rendimiento individual</p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          {/* Header row */}
          <div className="grid grid-cols-5 px-6 py-2 text-[11px] text-zinc-600 uppercase tracking-wider">
            <span className="col-span-2">Comercial</span>
            <span className="text-center">Deals</span>
            <span className="text-center">Cerrados</span>
            <span className="text-center">Tasa</span>
          </div>
          {REPS.map((rep) => (
            <div key={rep.name} className="grid grid-cols-5 items-center px-6 py-3">
              <div className="col-span-2 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(168,85,247,0.1)",
                    color: "#a855f7",
                    border: "1px solid rgba(168,85,247,0.2)",
                  }}
                >
                  {rep.name[rep.name.length - 1]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{rep.name}</p>
                  <p className="text-zinc-600 text-xs flex items-center gap-1">
                    <Clock size={10} /> {rep.lastActivity}
                  </p>
                </div>
              </div>
              <span className="text-center text-zinc-400 text-sm">{rep.deals}</span>
              <span className="text-center text-zinc-400 text-sm">{rep.closed}</span>
              <span
                className={`text-center text-sm font-semibold ${
                  rep.trend === "up" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {rep.rate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline stages */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Target size={14} style={{ color: "#D1FF48" }} />
          <p className="text-zinc-400 text-sm font-medium">Estado del pipeline</p>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.stage}
              className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all hover:brightness-110"
              style={{
                background: `${stage.accent}08`,
                border: `1px solid ${stage.accent}18`,
              }}
            >
              <p className="text-xl font-bold" style={{ color: stage.accent }}>
                {stage.value}
              </p>
              <p className="text-[10px] text-zinc-500 leading-tight">{stage.stage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: CRM / Leads ─────────────────────────────────────────────────────
function CrmSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">
            CRM del equipo
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Leads <span style={{ color: "#D1FF48" }}>del Equipo</span>
          </h1>
        </div>
        <SearchBar placeholder="Buscar por nombre o email…" />
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <LeadsTable />
      </Suspense>
    </div>
  );
}

// ─── Section: Team Management ─────────────────────────────────────────────────
function TeamSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">
            Gestión de Personal
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Mi <span style={{ color: "#a855f7" }}>Equipo</span>
          </h1>
        </div>
        <div className="mt-1">
          <CreateUserModal callerRole="manager" />
        </div>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <TeamManagementTable />
      </Suspense>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
interface Props {
  profile: Profile;
  section: string;
}

export default function ManagerView({ profile, section }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Manager";

  if (section === "crm")  return <CrmSection />;
  if (section === "team") return <TeamSection />;
  return <OverviewSection name={name} />;
}
