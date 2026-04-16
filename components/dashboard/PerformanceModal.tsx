"use client";

import { useState, useTransition } from "react";
import { getUserLeadStats } from "@/app/actions/admin";
import type { LeadStats } from "@/app/actions/admin";
import { BarChart2, X, Loader2, TrendingUp } from "lucide-react";

const STATUS_STYLE: Record<string, { color: string }> = {
  "En seguimiento":         { color: "#38bdf8" },
  "Reunión confirmada":     { color: "#a78bfa" },
  "Cotización enviada":     { color: "#f59e0b" },
  "Perdido/No":             { color: "#ef4444" },
  "Cerrado/Cliente activo": { color: "#22c55e" },
};

interface Props { userId: string; userName: string }

export default function PerformanceModal({ userId, userName }: Props) {
  const [open, setOpen]                = useState(false);
  const [stats, setStats]              = useState<LeadStats | null>(null);
  const [error, setError]              = useState<string | null>(null);
  const [isPending, startTransition]   = useTransition();

  function handleOpen() {
    setOpen(true);
    setStats(null);
    setError(null);
    startTransition(async () => {
      const res = await getUserLeadStats(userId);
      if ("error" in res) setError(res.error);
      else setStats(res.stats);
    });
  }

  function handleClose() {
    setOpen(false);
    setStats(null);
    setError(null);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title={`Ver rendimiento de ${userName}`}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
      >
        <BarChart2 size={11} />
        Rendimiento
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <BarChart2 size={14} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Rendimiento</p>
                  <p className="text-zinc-500 text-xs mt-0.5 truncate max-w-[210px]">{userName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-900"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {isPending && (
                <div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Cargando estadísticas…</span>
                </div>
              )}

              {error && !isPending && (
                <p className="text-red-400 text-sm text-center py-8">{error}</p>
              )}

              {stats && !isPending && (
                <div className="flex flex-col gap-5">

                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                      <p className="text-2xl font-semibold text-white">{stats.total}</p>
                      <p className="text-zinc-600 text-xs mt-1">Total leads</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
                      <p className="text-2xl font-semibold text-emerald-400">{stats.closed}</p>
                      <p className="text-zinc-600 text-xs mt-1">Cerrados</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
                      <p className="text-2xl font-semibold text-red-400">{stats.lost}</p>
                      <p className="text-zinc-600 text-xs mt-1">Perdidos</p>
                    </div>
                  </div>

                  {/* Conversion rate */}
                  {stats.total > 0 && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-orange-400" />
                        <span className="text-zinc-400 text-sm">Tasa de cierre</span>
                      </div>
                      <span className="text-white font-semibold text-lg">
                        {Math.round((stats.closed / stats.total) * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Pipeline breakdown */}
                  {stats.total > 0 && stats.byStatus.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <p className="text-zinc-600 text-[11px] font-semibold uppercase tracking-wider">
                        Distribución del pipeline
                      </p>
                      {stats.byStatus
                        .sort((a, b) => b.count - a.count)
                        .map(({ status, count }) => {
                          const color = STATUS_STYLE[status]?.color ?? "#71717a";
                          const pct   = stats.total > 0 ? (count / stats.total) * 100 : 0;
                          return (
                            <div key={status} className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400">{status}</span>
                                <span style={{ color }}>{count} ({Math.round(pct)}%)</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-zinc-800">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%`, background: color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {stats.total === 0 && (
                    <p className="text-center text-zinc-600 text-sm py-4">
                      Sin leads asignados aún
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
