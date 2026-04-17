import { Suspense } from "react";
import { TrendingUp, Target, Flame, Calendar, Inbox } from "lucide-react";
import StatCard from "./StatCard";
import TaskManager from "./TaskManager";
import CreateLeadModal from "./CreateLeadModal";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import LeadsTable from "./LeadsTable";
import SalesEarningsView from "./finance/SalesEarningsView";
import type { Profile } from "./types";

const MY_STATS = [
  { label: "Mis deals activos",    value: "—", sub: "en seguimiento",  accent: "#f59e0b", icon: Target     },
  { label: "Reuniones esta semana",value: "—", sub: "confirmadas",     accent: "#38bdf8", icon: Calendar   },
  { label: "Tasa de cierre",       value: "—", sub: "últimos 30 días", accent: "#a78bfa", icon: TrendingUp },
  { label: "Leads calientes",      value: "—", sub: "para contactar",  accent: "#ef4444", icon: Flame      },
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

function LeadsSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-500 text-sm mb-1">¡Buenas, {name}!</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Mis Leads</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ScheduleMeetingModal />
          <CreateLeadModal callerRole="sales" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MY_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <Suspense fallback={<SkeletonTable />}>
        <LeadsTable />
      </Suspense>
    </div>
  );
}

function ScheduleSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-zinc-500 text-sm mb-1">Agenda personal · {name}</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Mi Agenda</h1>
      </div>
      <TaskManager />
    </div>
  );
}

interface Props { profile: Profile; section: string; userId: string }

export default function SalesView({ profile, section, userId }: Props) {
  const name = profile.full_name?.split(" ")[0] ?? "Comercial";
  if (section === "schedule")  return <ScheduleSection name={name} />;
  if (section === "ganancias") return <SalesEarningsView userId={userId} />;
  return <LeadsSection name={name} />;
}
