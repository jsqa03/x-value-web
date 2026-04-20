import { Suspense } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  Users, TrendingUp, Target, BarChart2,
  Award, UserX, Activity,
} from "lucide-react";
import StatCard from "./StatCard";
import LeadsTable from "./LeadsTable";
import CreateUserModal from "./CreateUserModal";
import CreateLeadModal from "./CreateLeadModal";
import TeamManagementTable from "./TeamManagementTable";
import SearchBar from "./SearchBar";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import ManagerEarningsView from "./finance/ManagerEarningsView";
import AgendaView from "./AgendaView";
import type { Profile, Role } from "./types";
import { ROLE_META } from "./types";

const TEAM_STATS = [
  { label: "Deals abiertos (equipo)", value: "—", sub: "este mes",        accent: "#a78bfa", icon: <Target    size={12} style={{ color: "#a78bfa", opacity: 0.6 }} /> },
  { label: "Tasa de cierre",          value: "—", sub: "promedio equipo", accent: "#22c55e", icon: <TrendingUp size={12} style={{ color: "#22c55e", opacity: 0.6 }} /> },
  { label: "Comerciales activos",     value: "—", sub: "en pipeline",     accent: "#38bdf8", icon: <Users     size={12} style={{ color: "#38bdf8", opacity: 0.6 }} /> },
  { label: "Revenue generado",        value: "—", sub: "acumulado",       accent: "#f59e0b", icon: <BarChart2  size={12} style={{ color: "#f59e0b", opacity: 0.6 }} /> },
];

function SkeletonTable() {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-zinc-800" /><div className="w-32 h-3.5 rounded bg-zinc-800" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-zinc-800/50 last:border-0">
          <div className="w-7 h-7 rounded-full bg-zinc-800 shrink-0" />
          <div className="flex-1 flex gap-4">
            <div className="w-28 h-3 rounded bg-zinc-800" /><div className="w-40 h-3 rounded bg-zinc-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RosterSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 items-center px-6 py-3 border-t border-zinc-800/50 animate-pulse">
          <div className="col-span-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="w-24 h-3 rounded bg-zinc-800" />
              <div className="w-32 h-2.5 rounded bg-zinc-800/60" />
            </div>
          </div>
          <div className="w-12 h-4 rounded-full bg-zinc-800 mx-auto" />
          <div className="w-4 h-3 rounded bg-zinc-800 mx-auto" />
          <div className="w-4 h-3 rounded bg-zinc-800 mx-auto" />
        </div>
      ))}
    </>
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
async function ManagerPipelineCard() {
  const ac = getAdminClient();
  const { data: leads } = await ac.from("leads").select("pipeline_status, is_verified");
  const total    = leads?.length ?? 0;
  const closed   = leads?.filter((l) => l.pipeline_status === "Cerrado/Cliente activo").length ?? 0;
  const lost     = leads?.filter((l) => l.pipeline_status === "Perdido/No").length ?? 0;
  const meeting  = leads?.filter((l) => l.pipeline_status === "Reunión confirmada").length ?? 0;
  const quote    = leads?.filter((l) => l.pipeline_status === "Cotización enviada").length ?? 0;
  const tracking = total - closed - lost - meeting - quote;

  const stages = [
    { stage: "En seguimiento",   value: String(tracking), accent: "#38bdf8", pct: total > 0 ? tracking / total : 0 },
    { stage: "Reunión conf.",     value: String(meeting),  accent: "#a78bfa", pct: total > 0 ? meeting / total : 0  },
    { stage: "Cotización env.",   value: String(quote),    accent: "#f59e0b", pct: total > 0 ? quote / total : 0    },
    { stage: "Cerrados",          value: String(closed),   accent: "#22c55e", pct: total > 0 ? closed / total : 0   },
    { stage: "Perdidos",          value: String(lost),     accent: "#ef4444", pct: total > 0 ? lost / total : 0     },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity size={14} className="text-zinc-500" />
        <p className="text-zinc-300 text-sm font-medium">Estado del pipeline</p>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {stages.map((s) => (
          <div
            key={s.stage}
            className="flex flex-col items-center gap-2 rounded-xl p-3 text-center border border-zinc-800 hover:border-zinc-700 transition-colors"
            style={{ background: `${s.accent}06` }}
          >
            <p className="text-xl font-semibold" style={{ color: s.accent }}>{s.value}</p>
            <p className="text-[10px] text-zinc-600 leading-tight">{s.stage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Real team roster ─────────────────────────────────────────────────────────
interface TeamMember { id: string; full_name: string | null; email: string; role: Role; avatar_url: string | null }

async function TeamRoster({ managerId }: { managerId: string }) {
  const ac = getAdminClient();
  const { data: members } = await ac
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("manager_id", managerId)
    .order("full_name");

  const team = (members ?? []) as TeamMember[];

  if (team.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <UserX size={26} className="text-zinc-700" />
        <p className="text-zinc-600 text-sm">Aún no tienes equipo asignado</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-5 px-6 py-2.5 text-[11px] text-zinc-600 uppercase tracking-wider border-b border-zinc-800/60">
        <span className="col-span-2">Comercial</span>
        <span className="text-center">Rol</span>
        <span className="text-center">Deals</span>
        <span className="text-center">Tasa</span>
      </div>
      {team.map((rep) => {
        const meta = ROLE_META[rep.role] ?? ROLE_META.client;
        const init = (rep.full_name ?? rep.email).charAt(0).toUpperCase();
        return (
          <div key={rep.id} className="grid grid-cols-5 items-center px-6 py-3.5 border-t border-zinc-800/60 hover:bg-zinc-900/30 transition-colors">
            <div className="col-span-2 flex items-center gap-3">
              {rep.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rep.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}25` }}
                >
                  {init}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate max-w-[140px]">{rep.full_name ?? "—"}</p>
                <p className="text-zinc-600 text-xs truncate max-w-[160px]">{rep.email}</p>
              </div>
            </div>
            <span className="flex justify-center">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
              >
                {meta.label}
              </span>
            </span>
            <span className="text-center text-zinc-700 text-sm">—</span>
            <span className="text-center text-zinc-700 text-sm">—</span>
          </div>
        );
      })}
    </>
  );
}

// ─── Section: Overview ────────────────────────────────────────────────────────
function OverviewSection({ name, managerId }: { name: string; managerId: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-500 text-sm mb-1">Hola, {name}</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Rendimiento del Equipo</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TEAM_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-800">
          <Award size={14} className="text-zinc-500" />
          <p className="text-zinc-300 text-sm font-medium">Rendimiento individual</p>
        </div>
        <Suspense fallback={<RosterSkeleton />}>
          <TeamRoster managerId={managerId} />
        </Suspense>
      </div>

      <Suspense fallback={
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 animate-pulse">
          <div className="w-32 h-4 rounded bg-zinc-800 mb-5" />
          <div className="grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-zinc-800/40" />)}
          </div>
        </div>
      }>
        <ManagerPipelineCard />
      </Suspense>
    </div>
  );
}

// ─── Section: CRM ─────────────────────────────────────────────────────────────
function CrmSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">CRM del equipo</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Leads del Equipo</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ScheduleMeetingModal />
          <CreateLeadModal callerRole="manager" />
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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Mi Equipo</h1>
        </div>
        <div className="mt-1"><CreateUserModal callerRole="manager" /></div>
      </div>
      <Suspense fallback={<SkeletonTable />}><TeamManagementTable /></Suspense>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
interface Props { profile: Profile; section: string; userId: string }

export default function ManagerView({ profile, section, userId }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Manager";
  if (section === "crm")       return <CrmSection />;
  if (section === "team")      return <TeamSection />;
  if (section === "ganancias") return <ManagerEarningsView managerId={userId} />;
  if (section === "agenda")    return <AgendaView userId={userId} userRole={profile.role} />;
  return <OverviewSection name={name} managerId={userId} />;
}
