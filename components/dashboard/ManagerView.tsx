import { Suspense } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  Users, TrendingUp, Target, BarChart2,
  Award, UserX, Activity,
} from "lucide-react";
import StatCard from "./StatCard";
import LeadsTable from "./LeadsTable";
import CreateUserModal from "./CreateUserModal";
import TeamManagementTable from "./TeamManagementTable";
import SearchBar from "./SearchBar";
import type { Profile, Role } from "./types";
import { ROLE_META } from "./types";

// ─── Static KPIs (no real source yet) ─────────────────────────────────────────
const TEAM_STATS = [
  { label: "Deals abiertos (equipo)", value: "—", sub: "este mes",       accent: "#a855f7", icon: Target     },
  { label: "Tasa de cierre",          value: "—", sub: "promedio equipo", accent: "#D1FF48", icon: TrendingUp },
  { label: "Comerciales activos",     value: "—", sub: "en pipeline",    accent: "#00c0f3", icon: Users      },
  { label: "Revenue generado",        value: "—", sub: "acumulado",      accent: "#fcd34d", icon: BarChart2  },
];

// ─── Shared skeleton ───────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="w-3.5 h-3.5 rounded bg-white/10" />
        <div className="w-32 h-3.5 rounded bg-white/10" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
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

function RosterSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 items-center px-6 py-3 border-t animate-pulse" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="col-span-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="w-24 h-3 rounded bg-white/[0.06]" />
              <div className="w-32 h-2.5 rounded bg-white/[0.04]" />
            </div>
          </div>
          <div className="w-12 h-4 rounded-full bg-white/[0.04] mx-auto" />
          <div className="w-4 h-3 rounded bg-white/[0.04] mx-auto" />
          <div className="w-4 h-3 rounded bg-white/[0.04] mx-auto" />
        </div>
      ))}
    </>
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────────
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Real pipeline from leads ─────────────────────────────────────────────────
async function ManagerPipelineCard() {
  const adminClient = getAdminClient();
  const { data: leads } = await adminClient.from("leads").select("is_verified");

  const total    = leads?.length ?? 0;
  const verified = leads?.filter((l) => l.is_verified).length ?? 0;
  const open     = total - verified;

  const stages = [
    { stage: "Nuevos leads",    value: String(total),    accent: "#a855f7", pct: 1 },
    { stage: "En negociación",  value: String(open),     accent: "#00c0f3", pct: total > 0 ? open / total : 0 },
    { stage: "Propuesta env.",  value: "0",              accent: "#D1FF48", pct: 0 },
    { stage: "Ganados",         value: String(verified), accent: "#22c55e", pct: total > 0 ? verified / total : 0 },
    { stage: "Perdidos",        value: "0",              accent: "#ef4444", pct: 0 },
  ];

  return (
    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-5">
        <Activity size={14} style={{ color: "#D1FF48" }} />
        <p className="text-zinc-400 text-sm font-medium">Estado del pipeline</p>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {stages.map((stage) => (
          <div
            key={stage.stage}
            className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all hover:brightness-110"
            style={{ background: `${stage.accent}08`, border: `1px solid ${stage.accent}18` }}
          >
            <p className="text-xl font-bold" style={{ color: stage.accent }}>{stage.value}</p>
            <p className="text-[10px] text-zinc-500 leading-tight">{stage.stage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Real team roster ─────────────────────────────────────────────────────────
interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  avatar_url: string | null;
}

async function TeamRoster({ managerId }: { managerId: string }) {
  const adminClient = getAdminClient();
  const { data: members } = await adminClient
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("manager_id", managerId)
    .order("full_name");

  const team = (members ?? []) as TeamMember[];

  if (team.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <UserX size={28} className="text-white/10" />
        <p className="text-zinc-600 text-sm">Aún no tienes equipo asignado</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-5 px-6 py-2 text-[11px] text-zinc-600 uppercase tracking-wider">
        <span className="col-span-2">Comercial</span>
        <span className="text-center">Rol</span>
        <span className="text-center">Deals</span>
        <span className="text-center">Tasa</span>
      </div>
      {team.map((rep) => {
        const meta = ROLE_META[rep.role] ?? ROLE_META.client;
        const initial = (rep.full_name ?? rep.email).charAt(0).toUpperCase();
        return (
          <div
            key={rep.id}
            className="grid grid-cols-5 items-center px-6 py-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <div className="col-span-2 flex items-center gap-3">
              {rep.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rep.avatar_url} alt={rep.full_name ?? rep.email} className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}25` }}
                >
                  {initial}
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
            <span className="text-center text-zinc-600 text-sm">—</span>
            <span className="text-center text-zinc-600 text-sm">—</span>
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
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Rendimiento del <span style={{ color: "#a855f7" }}>Equipo</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TEAM_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Individual performance */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <Award size={14} style={{ color: "#a855f7" }} />
          <p className="text-zinc-400 text-sm font-medium">Rendimiento individual</p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <Suspense fallback={<RosterSkeleton />}>
            <TeamRoster managerId={managerId} />
          </Suspense>
        </div>
      </div>

      {/* Pipeline */}
      <Suspense fallback={
        <div className="rounded-2xl p-6 animate-pulse" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-32 h-4 rounded bg-white/[0.06] mb-5" />
          <div className="grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/[0.04]" />)}
          </div>
        </div>
      }>
        <ManagerPipelineCard />
      </Suspense>
    </div>
  );
}

// ─── Section: CRM / Leads ─────────────────────────────────────────────────────
function CrmSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">CRM del equipo</p>
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
          <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">Gestión de Personal</p>
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
  userId: string;
}

export default function ManagerView({ profile, section, userId }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Manager";

  if (section === "crm")  return <CrmSection />;
  if (section === "team") return <TeamSection />;
  return <OverviewSection name={name} managerId={userId} />;
}
