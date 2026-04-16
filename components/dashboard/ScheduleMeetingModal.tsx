"use client";

import { useState, useTransition, useRef } from "react";
import { scheduleMeeting } from "@/app/actions/admin";
import type { ActionResult } from "@/app/actions/admin";
import {
  CalendarPlus, X, Loader2, CheckCircle2, AlertCircle,
  Building2, Clock, FileText,
} from "lucide-react";

function Field({
  label, icon: Icon, required: req, children,
}: {
  label: string; icon: React.ElementType; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
        <Icon size={10} className="text-zinc-600" />
        {label}
        {req && <span className="text-orange-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors";

export default function ScheduleMeetingModal() {
  const [open, setOpen]            = useState(false);
  const [result, setResult]        = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef                    = useRef<HTMLFormElement>(null);

  function handleOpen() {
    setResult(null);
    setOpen(true);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setTimeout(() => { formRef.current?.reset(); setResult(null); }, 250);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await scheduleMeeting(fd);
      setResult(res);
      if (res.success) formRef.current?.reset();
    });
  }

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors shrink-0"
      >
        <CalendarPlus size={14} />
        Agendar Cita
      </button>

      {/* ── Modal overlay ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <CalendarPlus size={15} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Agendar Cita</p>
                  <p className="text-zinc-600 text-xs mt-0.5">Nueva reunión con cliente</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto">

              {result?.success ? (
                /* ── Success state ──────────────────────────────────────── */
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={26} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base mb-1">¡Cita agendada!</p>
                    <p className="text-zinc-500 text-sm">La reunión fue añadida al calendario.</p>
                  </div>
                  <button
                    onClick={() => { setResult(null); formRef.current?.reset(); }}
                    className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Agendar otra →
                  </button>
                </div>

              ) : (
                /* ── Form ───────────────────────────────────────────────── */
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Empresa */}
                  <Field label="Empresa" icon={Building2} required>
                    <div className="relative">
                      <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input
                        name="company_name"
                        type="text"
                        placeholder="Nombre de la empresa…"
                        required
                        className={inputCls}
                      />
                    </div>
                  </Field>

                  {/* Fecha y hora */}
                  <Field label="Fecha y Hora" icon={Clock} required>
                    <div className="relative">
                      <Clock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input
                        name="meeting_date"
                        type="datetime-local"
                        required
                        className={`${inputCls} [color-scheme:dark]`}
                      />
                    </div>
                  </Field>

                  {/* Notas / Descripción */}
                  <Field label="Notas / Descripción" icon={FileText}>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Objetivo de la reunión, temas a tratar…"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors resize-none"
                    />
                  </Field>

                  {/* Error */}
                  {result?.error && (
                    <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs leading-relaxed">{result.error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  >
                    {isPending ? (
                      <><Loader2 size={15} className="animate-spin" /> Guardando…</>
                    ) : (
                      <><CalendarPlus size={15} /> Guardar Cita</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
