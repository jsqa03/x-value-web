import { Suspense } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  Users, TrendingUp, DollarSign, Zap,
  Activity, ShieldCheck, Globe, UserX,
} from "lucide-react";
import StatCard from "./StatCard";
import LeadsTable from "./LeadsTable";
import CreateUserModal from "./CreateUserModal";
import TeamManagementTable from "./TeamManagementTable";
import SecuritySection from "./SecuritySection";
import SearchBar from "./SearchBar";
import type { Profile, Role } from "./types";
import { ROLE_META } from "./types";

// ─── Static KPIs (no real source yet) ─────────────────────────────────────────
const GLOBAL_STATS = [
  { label: "Clientes activos",       value: "—", sub: "Total empresa",    accent: "#00c0f3", icon: Users      },
  { label: "Revenue este mes",        value: "—", sub: "vs. mes anterior", accent: "#D1FF48", icon: DollarSign },
  { label: "Leads procesados por IA", value: "—", sub: "últimos 30 días",  accent: "#a855f7", icon: TrendingUp },
  { label: "Agentes IA activos",      value: "—", sub: "en producción",    accent: "#fcd34d", icon: Zap        },
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
            <div className="w-20 h-3 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4 animate-pulse" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] shrink-0" />
          <div className="flex-1 h-3 rounded bg-white/[0.04]" />
          <div className="w-12 h-3 rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
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

// ─── Real pipeline from leads table ───────────────────────────────────────────
async function AdminPipelineCard() {
  const adminClient = getAdminClient();
  const { data: leads } = await adminClient
    .from("leads")
    .select("is_verified");

  const total    = leads?.length ?? 0;
  const verified = leads?.filter((l) => l.is_verified).length ?? 0;
  const open     = total - verified;

  const stages = [
    { stage: "Total captados",  count: total,    pct: 1,                                    color: "#a855f7" },
    { stage: "Nuevos / Abiertos", count: open,   pct: total > 0 ? open / total : 0,         color: "#00c0f3" },
    { stage: "Verificados",     count: verified, pct: total > 0 ? verified / total : 0,      color: "#D1FF48" },
    { stage: "Propuesta env.",  count: 0,        pct: 0,                                    color: "#fcd34d" },
  ];

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2">
        <Activity size={14} style={{ color: "#00c0f3" }} />
        <p className="text-zinc-400 text-sm font-medium">Pipeline global</p>
      </div>
      {stages.map((row) => (
        <div key={row.stage} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">{row.stage}</span>
            <span className="text-zinc-600">{row.count} leads</span>
          </div>
          <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
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

// ─── Real team snapshot from profiles ─────────────────────────────────────────
interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  avatar_url: string | null;
}

async function AdminTeamCard() {
  const adminClient = getAdminClient();
  const { data: members } = await adminClient
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .in("role", ["manager", "sales"])
    .order("role")
    .order("full_name")
    .limit(8);

  const team = (members ?? []) as TeamMember[];

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2">
        <ShieldCheck size={14} style={{ color: "#fcd34d" }} />
        <p className="text-zinc-400 text-sm font-medium">Equipo comercial</p>
        <span className="ml-auto text-xs text-zinc-600">{team.length} miembro{team.length !== 1 ? "s" : ""}</span>
      </div>

      {team.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <UserX size={24} className="text-white/10" />
          <p className="text-zinc-600 text-xs">Sin miembros aún</p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          {team.map((member) => {
            const meta = ROLE_META[member.role] ?? ROLE_META.client;
            const initial = (member.full_name ?? member.email).charAt(0).toUpperCase();
            return (
              <div key={member.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatar_url} alt={member.full_name ?? ""} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}25` }}
                    >
                      {initial}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium leading-none">{member.full_name ?? "—"}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{member.email}</p>
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
      <div>
        <p className="text-zinc-500 text-sm mb-1">Bienvenido de vuelta, {name}</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Resumen de la <span style={{ color: "#fcd34d" }}>Empresa</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {GLOBAL_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton rows={4} />}>
          <AdminPipelineCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton rows={4} />}>
          <AdminTeamCard />
        </Suspense>
      </div>

      {/* Global reach strip */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "rgba(252,211,77,0.03)", border: "1px solid rgba(252,211,77,0.08)" }}
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

// ─── Section: CRM ─────────────────────────────────────────────────────────────
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
          <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">Gestión de Personal</p>
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

// ─── Root component ───────────────────────────────────────────────────────────
interface Props {
  profile: Profile;
  section: string;
  userId: string;
}

export default function AdminView({ profile, section, userId }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "CEO";

  if (section === "crm")  return <CrmSection />;
  if (section === "team") return <TeamSection />;
  if (section === "settings") return (
    <Suspense fallback={<div className="text-zinc-600 text-sm py-8 text-center">Cargando seguridad…</div>}>
      <SecuritySection currentUserId={userId} />
    </Suspense>
  );
  return <OverviewSection name={name} />;
}
