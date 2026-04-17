"use client";

import { useState, useTransition } from "react";
import { CalendarDays, X, Loader2, ClipboardList, Calendar, CheckCircle2, Clock, Inbox } from "lucide-react";
import { getUserTasks } from "@/app/actions/tasks";
import type { Task } from "@/app/actions/tasks";

interface Props {
  userId: string;
  userName: string;
}

function dueDateLabel(dateStr: string): { text: string; color: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { text: `Venció hace ${Math.abs(diff)}d`, color: "#ef4444" };
  if (diff === 0) return { text: "Vence hoy",                      color: "#f59e0b" };
  if (diff <= 7)  return { text: `En ${diff} días`,                color: "#a78bfa" };
  return {
    text: new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
    color: "#71717a",
  };
}

export default function ViewAgendaButton({ userId, userName }: Props) {
  const [open, setOpen]              = useState(false);
  const [tasks, setTasks]            = useState<Task[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setOpen(true);
    if (tasks === null) {
      startTransition(async () => {
        const result = await getUserTasks(userId);
        setTasks(result);
      });
    }
  }

  const pending   = (tasks ?? []).filter((t) => t.status !== "completed");
  const completed = (tasks ?? []).filter((t) => t.status === "completed");

  return (
    <>
      <button
        onClick={handleOpen}
        title={`Ver agenda de ${userName}`}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/[0.06] hover:text-white/60"
        style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <CalendarDays size={11} />
        Ver Agenda
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                  <CalendarDays size={13} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">
                    Agenda de <span className="text-orange-400">{userName}</span>
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    {isPending ? "Cargando…" : `${pending.length} pendiente${pending.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-900">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {isPending ? (
                <div className="flex items-center justify-center py-14 gap-2.5 text-zinc-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Cargando tareas…</span>
                </div>
              ) : tasks === null || (tasks.length === 0) ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <Inbox size={26} className="text-zinc-700" />
                  <p className="text-zinc-500 text-sm">Sin tareas registradas</p>
                  <p className="text-zinc-700 text-xs">La agenda de {userName} está libre</p>
                </div>
              ) : (
                <>
                  {/* Pending */}
                  {pending.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800/60">
                        <Clock size={12} className="text-orange-400" />
                        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Pendientes</p>
                      </div>
                      {pending.map((t) => {
                        const due = dueDateLabel(t.due_date);
                        return (
                          <div key={t.id} className="px-5 py-3.5 border-b border-zinc-800/40 last:border-0">
                            <p className="text-white text-sm font-medium">{t.title}</p>
                            {t.description && (
                              <p className="text-zinc-600 text-xs mt-0.5 line-clamp-1">{t.description}</p>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold mt-1"
                              style={{ color: due.color }}>
                              <Calendar size={9} /> {due.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Completed */}
                  {completed.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800/60 border-t border-zinc-800/60">
                        <CheckCircle2 size={12} className="text-zinc-600" />
                        <p className="text-zinc-600 text-xs font-semibold uppercase tracking-wider">Completadas</p>
                      </div>
                      {completed.map((t) => (
                        <div key={t.id} className="px-5 py-3.5 border-b border-zinc-800/40 last:border-0 opacity-50">
                          <p className="text-zinc-500 text-sm line-through">{t.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-5 py-3 border-t border-zinc-800 shrink-0">
              <p className="text-zinc-700 text-xs text-center">Vista de solo lectura · {tasks?.length ?? 0} tareas totales</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
