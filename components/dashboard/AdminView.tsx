import { Suspense } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  Users, TrendingUp, DollarSign, Zap,
  Activity, ShieldCheck, Globe, UserX,
} from "lucide-react";
import StatCard from "./StatCard";
import LeadsTable from "./LeadsTable";
import CreateUserModal from "./CreateUserModal";
import CreateLeadModal from "./CreateLeadModal";
import TeamManagementTable from "./TeamManagementTable";
import SecuritySection from "./SecuritySection";
import SearchBar from "./SearchBar";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import FinanceView from "./finance/FinanceView";
import type { Profile, Role } from "./types";
import { ROLE_META } from "./types";

const GLOBAL_STATS = [
  { label: "Clientes activos",       value: "—", sub: "Total empresa",    accent: "#38bdf8", icon: Users      },
  { label: "Revenue este mes",        value: "—", sub: "vs. mes anterior", accent: "#22c55e", icon: DollarSign },
  { label: "Leads procesados por IA", value: "—", sub: "últimos 30 días",  accent: "#a78bfa", icon: TrendingUp },
  { label: "Agentes IA activos",      value: "—", sub: "en producción",    accent: "#f59e0b", icon: Zap        },
];

function SkeletonTable() {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-zinc-800" />
        <div className="w-32 h-3.5 rounded bg-zinc-800" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-zinc-800/50 last:border-0">
          <div className="w-7 h-7 rounded-full bg-zinc-800 shrink-0" />
          <div className="flex-1 flex gap-4">
            <div className="w-28 h-3 rounded bg-zinc-800" />
            <div className="w-40 h-3 rounded bg-zinc-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 shrink-0" />
          <div className="flex-1 h-3 rounded bg-zinc-800" />
          <div className="w-10 h-3 rounded bg-zinc-800/60" />
        </div>
      ))}
    </div>
  );
}

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Real pipeline ────────────────────────────────────────────────────────────
async function AdminPipelineCard() {
  const ac = getAdminClient();
  const { data: leads } = await ac.from("leads").select("pipeline_status, is_verified");
  const total    = leads?.length ?? 0;
  const closed   = leads?.filter((l) => l.pipeline_status === "Cerrado/Cliente activo").length ?? 0;
  const lost     = leads?.filter((l) => l.pipeline_status === "Perdido/No").length ?? 0;
  const open     = total - closed - lost;

  const stages = [
    { stage: "Total captados", count: total,  pct: 1,                              color: "#a78bfa" },
    { stage: "En proceso",     count: open,   pct: total > 0 ? open / total : 0,   color: "#38bdf8" },
    { stage: "Cerrados",       count: closed, pct: total > 0 ? closed / total : 0, color: "#22c55e" },
    { stage: "Perdidos",       count: lost,   pct: total > 0 ? lost / total : 0,   color: "#ef4444" },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Activity size={14} className="text-zinc-500" />
        <p className="text-zinc-300 text-sm font-medium">Pipeline global</p>
      </div>
      {stages.map((row) => (
        <div key={row.stage} className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">{row.stage}</span>
            <span className="text-zinc-600">{row.count} leads</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${row.pct * 100}%`, background: row.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Real team snapshot ───────────────────────────────────────────────────────
interface TeamMember { id: string; full_name: string | null; email: string; role: Role; avatar_url: string | null }

async function AdminTeamCard() {
  const ac = getAdminClient();
  const { data: members } = await ac
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .in("role", ["manager", "sales"])
    .order("role").order("full_name")
    .limit(8);

  const team = (members ?? []) as TeamMember[];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-zinc-500" />
          <p className="text-zinc-300 text-sm font-medium">Equipo comercial</p>
        </div>
        <span className="text-xs text-zinc-600">{team.length} miembro{team.length !== 1 ? "s" : ""}</span>
      </div>

      {team.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <UserX size={22} className="text-zinc-700" />
          <p className="text-zinc-600 text-xs">Sin miembros aún</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {team.map((m) => {
            const meta = ROLE_META[m.role] ?? ROLE_META.client;
            const init = (m.full_name ?? m.email).charAt(0).toUpperCase();
            return (
              <div key={m.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  {m.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatar_url} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}25` }}
                    >
                      {init}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium leading-none">{m.full_name ?? "—"}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{m.email}</p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                >
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Section: Overview ────────────────────────────────────────────────────────
function OverviewSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-500 text-sm mb-1">Bienvenido de vuelta, {name}</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Resumen de la Empresa</h1>
        </div>
        <ScheduleMeetingModal />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {GLOBAL_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Suspense fallback={<SkeletonCard />}><AdminPipelineCard /></Suspense>
        <Suspense fallback={<SkeletonCard />}><AdminTeamCard /></Suspense>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
        <Globe size={16} className="text-orange-400 shrink-0" />
        <div>
          <p className="text-white font-medium text-sm">Presencia global activa</p>
          <p className="text-zinc-500 text-xs mt-0.5">
            Tus agentes IA operan en múltiples mercados 24/7 sin intervención humana.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-500">Online</span>
        </div>
      </div>
    </div>
  );
}

// ─── Section: CRM ─────────────────────────────────────────────────────────────
function CrmSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">CRM en vivo</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Leads Capturados</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ScheduleMeetingModal />
          <CreateLeadModal callerRole="admin" />
          <SearchBar placeholder="Buscar por nombre o email…" />
        </div>
      </div>
      <Suspense fallback={<SkeletonTable />}><LeadsTable /></Suspense>
    </div>
  );
}

// ─── Section: Team ────────────────────────────────────────────────────────────
function TeamSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">Gestión de Personal</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Equipo Comercial</h1>
        </div>
        <div className="mt-1"><CreateUserModal callerRole="admin" /></div>
      </div>
      <Suspense fallback={<SkeletonTable />}><TeamManagementTable /></Suspense>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
interface Props { profile: Profile; section: string; userId: string; period?: string }

export default function AdminView({ profile, section, userId, period }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "CEO";
  if (section === "crm")       return <CrmSection />;
  if (section === "team")      return <TeamSection />;
  if (section === "finanzas")  return <FinanceView period={period} />;
  if (section === "settings") return (
    <Suspense fallback={<div className="text-zinc-600 text-sm py-8 text-center">Cargando…</div>}>
      <SecuritySection currentUserId={userId} isAdmin={profile.role === "admin"} />
    </Suspense>
  );
  return <OverviewSection name={name} />;
}
