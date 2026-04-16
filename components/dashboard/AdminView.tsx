import { Suspense } from "react";
import {
  Users, TrendingUp, DollarSign, Zap,
  Activity, ShieldCheck, Globe,
  Search, Settings2, Bell, Lock, Key,
} from "lucide-react";
import StatCard from "./StatCard";
import LeadsTable from "./LeadsTable";
import CreateUserModal from "./CreateUserModal";
import TeamManagementTable from "./TeamManagementTable";
import type { Profile } from "./types";

// ─── Static data (replace with real queries when ready) ───────────────────────
const GLOBAL_STATS = [
  { label: "Clientes activos",       value: "—", sub: "Total empresa",    accent: "#00c0f3", icon: Users      },
  { label: "Revenue este mes",        value: "—", sub: "vs. mes anterior", accent: "#D1FF48", icon: DollarSign },
  { label: "Leads procesados por IA", value: "—", sub: "últimos 30 días",  accent: "#a855f7", icon: TrendingUp },
  { label: "Agentes IA activos",      value: "—", sub: "en producción",    accent: "#fcd34d", icon: Zap        },
];

const PIPELINE = [
  { stage: "Prospecting",  count: "—", pct: 0.18, color: "#a855f7" },
  { stage: "Calificación", count: "—", pct: 0.35, color: "#00c0f3" },
  { stage: "Propuesta",    count: "—", pct: 0.60, color: "#D1FF48" },
  { stage: "Cierre",       count: "—", pct: 0.80, color: "#fcd34d" },
];

const TEAM_OVERVIEW = [
  { name: "Santiago M.", role: "Manager",   deals: "—", revenue: "—", badge: "#a855f7" },
  { name: "Comercial 1", role: "Comercial", deals: "—", revenue: "—", badge: "#D1FF48" },
  { name: "Comercial 2", role: "Comercial", deals: "—", revenue: "—", badge: "#D1FF48" },
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
            <div className="w-20 h-3 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Search bar (decorative) ──────────────────────────────────────────────────
function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative max-w-sm">
      <Search
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "rgba(255,255,255,0.25)" }}
      />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.7)",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "rgba(252,211,77,0.35)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
        }
      />
    </div>
  );
}

// ─── Section: Overview ────────────────────────────────────────────────────────
function OverviewSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div>
        <p className="text-zinc-500 text-sm mb-1">Bienvenido de vuelta, {name}</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Resumen de la{" "}
          <span style={{ color: "#fcd34d" }}>Empresa</span>
        </h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {GLOBAL_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Pipeline + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pipeline funnel */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2">
            <Activity size={14} style={{ color: "#00c0f3" }} />
            <p className="text-zinc-400 text-sm font-medium">Pipeline global</p>
          </div>
          {PIPELINE.map((row) => (
            <div key={row.stage} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">{row.stage}</span>
                <span className="text-zinc-600">{row.count} deals</span>
              </div>
              <div
                className="h-1.5 w-full rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${row.pct * 100}%`,
                    background: row.color,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Team snapshot */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} style={{ color: "#fcd34d" }} />
            <p className="text-zinc-400 text-sm font-medium">Equipo comercial</p>
          </div>
          {TEAM_OVERVIEW.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: `${member.badge}15`,
                    color: member.badge,
                    border: `1px solid ${member.badge}25`,
                  }}
                >
                  {member.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-none">
                    {member.name}
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-semibold">{member.revenue}</p>
                <p className="text-zinc-600 text-xs">{member.deals} deals</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global reach strip */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{
          background: "rgba(252,211,77,0.03)",
          border: "1px solid rgba(252,211,77,0.08)",
        }}
      >
        <Globe size={18} style={{ color: "#fcd34d" }} />
        <div>
          <p className="text-white font-medium text-sm">Presencia global activa</p>
          <p className="text-zinc-500 text-xs">
            Tus agentes IA operan en múltiples mercados 24/7 sin intervención humana.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-500">Online</span>
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
          <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">CRM en vivo</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Leads <span style={{ color: "#D1FF48" }}>Capturados</span>
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
            Equipo <span style={{ color: "#a855f7" }}>Comercial</span>
          </h1>
        </div>
        <div className="mt-1">
          <CreateUserModal callerRole="admin" />
        </div>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <TeamManagementTable />
      </Suspense>
    </div>
  );
}

// ─── Section: Settings ────────────────────────────────────────────────────────
function SettingsSection() {
  const items = [
    {
      icon: Bell,
      color: "#fcd34d",
      title: "Notificaciones",
      desc: "Configura alertas de nuevos leads y actividad del equipo.",
      tag: "Próximamente",
    },
    {
      icon: Lock,
      color: "#a855f7",
      title: "Seguridad",
      desc: "Gestiona contraseñas, 2FA y sesiones activas.",
      tag: "Próximamente",
    },
    {
      icon: Key,
      color: "#00c0f3",
      title: "API & Integraciones",
      desc: "Conecta tu CRM, WhatsApp Business y plataformas externas.",
      tag: "Próximamente",
    },
    {
      icon: Settings2,
      color: "#D1FF48",
      title: "Preferencias generales",
      desc: "Idioma, zona horaria y formato de datos.",
      tag: "Próximamente",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">Sistema</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Configuración
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl p-5 flex items-start gap-4 group cursor-default transition-all hover:border-white/10"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: `${item.color}10`,
                border: `1px solid ${item.color}20`,
              }}
            >
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white text-sm font-semibold">{item.title}</p>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {item.tag}
                </span>
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
interface Props {
  profile: Profile;
  section: string;
}

export default function AdminView({ profile, section }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "CEO";

  if (section === "crm")      return <CrmSection />;
  if (section === "team")     return <TeamSection />;
  if (section === "settings") return <SettingsSection />;
  return <OverviewSection name={name} />;
}
