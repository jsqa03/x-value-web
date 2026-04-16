import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Calendar, Clock, Building2, User, Inbox, CalendarCheck } from "lucide-react";
import ScheduleMeetingModal from "./ScheduleMeetingModal";

interface Creator {
  full_name: string | null;
  email: string;
}

interface Meeting {
  id: string;
  company_name: string;
  meeting_date: string;
  description: string | null;
  created_at: string;
  creator: Creator | null;
}

interface Props {
  userId: string;
  userRole: string;
}

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function parseDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return {
    date: d.toLocaleDateString("es-ES", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }),
    time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    isPast: d < now,
  };
}

function MeetingCard({ meeting, isPast }: { meeting: Meeting; isPast: boolean }) {
  const { date, time } = parseDate(meeting.meeting_date);
  const creatorName = meeting.creator?.full_name ?? meeting.creator?.email ?? "—";

  return (
    <div
      className="group flex gap-4 px-5 py-4 hover:bg-zinc-900/30 transition-colors border-b border-zinc-800/40 last:border-0"
      style={{ opacity: isPast ? 0.65 : 1 }}
    >
      {/* Date column */}
      <div className="shrink-0 flex flex-col items-center justify-center w-12 pt-0.5">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: isPast ? "#71717a" : "#f97316" }}
        >
          {new Date(meeting.meeting_date).toLocaleDateString("es-ES", { month: "short" })}
        </span>
        <span
          className="text-2xl font-semibold leading-none"
          style={{ color: isPast ? "#52525b" : "#ffffff" }}
        >
          {new Date(meeting.meeting_date).getDate()}
        </span>
        <span className="text-[10px] text-zinc-600 mt-0.5">
          {new Date(meeting.meeting_date).getFullYear()}
        </span>
      </div>

      {/* Vertical divider */}
      <div
        className="w-px self-stretch rounded-full shrink-0"
        style={{ background: isPast ? "rgba(63,63,70,0.6)" : "rgba(249,115,22,0.4)" }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: company + badge */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={13} className="text-zinc-500 shrink-0" />
            <p className="text-white font-semibold text-sm truncate">{meeting.company_name}</p>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={
              isPast
                ? { background: "rgba(63,63,70,0.4)", color: "#71717a", border: "1px solid rgba(63,63,70,0.6)" }
                : { background: "rgba(249,115,22,0.08)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)" }
            }
          >
            {isPast ? "Pasada" : "Próxima"}
          </span>
        </div>

        {/* Date + time */}
        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={11} className="text-zinc-600 shrink-0" />
          <p className="text-zinc-400 text-xs capitalize">{date} — {time}</p>
        </div>

        {/* Description */}
        {meeting.description && (
          <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
            {meeting.description}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center gap-1.5 mt-2">
          <User size={11} className="text-zinc-500 shrink-0" />
          <p className="text-zinc-400 text-sm">
            Agendado por:{" "}
            <span className="font-medium text-zinc-300">{creatorName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

async function fetchMeetings(userId: string, userRole: string) {
  const ac = getAdminClient();

  const baseSelect = `
    id,
    company_name,
    meeting_date,
    description,
    created_at,
    creator:profiles!created_by(full_name, email)
  `;

  if (userRole === "admin") {
    return ac
      .from("meetings")
      .select(baseSelect)
      .order("meeting_date", { ascending: true });
  }

  if (userRole === "manager") {
    // Fetch team member IDs first
    const { data: team } = await ac
      .from("profiles")
      .select("id")
      .eq("manager_id", userId);

    const teamIds = (team ?? []).map((m: { id: string }) => m.id);
    const visibleIds = [userId, ...teamIds];

    return ac
      .from("meetings")
      .select(baseSelect)
      .in("created_by", visibleIds)
      .order("meeting_date", { ascending: true });
  }

  // sales (and any other role): only their own meetings
  return ac
    .from("meetings")
    .select(baseSelect)
    .eq("created_by", userId)
    .order("meeting_date", { ascending: true });
}

export default async function CalendarView({ userId, userRole }: Props) {
  const { data, error } = await fetchMeetings(userId, userRole);

  const meetings = (data ?? []) as Meeting[];
  const now = new Date();

  const upcoming = meetings.filter((m) => new Date(m.meeting_date) >= now);
  const past     = meetings.filter((m) => new Date(m.meeting_date) <  now);

  const scopeLabel =
    userRole === "admin"   ? "empresa" :
    userRole === "manager" ? "tu equipo" :
    "ti";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">
            Agenda de reuniones · {scopeLabel}
          </p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Calendario de Citas</h1>
        </div>
        <ScheduleMeetingModal />
      </div>

      {error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-5 py-4">
          <p className="text-red-400 text-sm">Error al cargar las reuniones: {error.message}</p>
        </div>
      )}

      {/* Upcoming */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <CalendarCheck size={14} className="text-orange-400" />
            <p className="text-zinc-300 text-sm font-medium">Próximas citas</p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400">
            {upcoming.length} programada{upcoming.length !== 1 ? "s" : ""}
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Inbox size={28} className="text-zinc-700" />
            <p className="text-zinc-600 text-sm">No hay citas próximas</p>
            <p className="text-zinc-700 text-xs">Usa el botón &quot;Agendar Cita&quot; para crear una</p>
          </div>
        ) : (
          <div>
            {upcoming.map((m) => (
              <MeetingCard key={m.id} meeting={m} isPast={false} />
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-zinc-600" />
              <p className="text-zinc-500 text-sm font-medium">Historial de citas</p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-zinc-900 border border-zinc-800 text-zinc-600">
              {past.length} pasada{past.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div>
            {[...past].reverse().map((m) => (
              <MeetingCard key={m.id} meeting={m} isPast={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
