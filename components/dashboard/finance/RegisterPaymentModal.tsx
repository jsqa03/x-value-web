"use client";

import { useState, useTransition } from "react";
import { registerPayment } from "@/app/actions/finance";
import type { ActionResult } from "@/app/actions/admin";
import {
  CheckCircle, X, Loader2, CheckCircle2, AlertCircle,
  Calendar, FileText, DollarSign,
} from "lucide-react";

interface Props {
  paymentId: string;
  scheduledDate: string;
  amount: string;        // pre-formatted COP string
  contractName: string;
  paymentMonth: number;
}

const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors";

function Field({ label, icon: Icon, required: req, children }: {
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

export default function RegisterPaymentModal({
  paymentId, scheduledDate, amount, contractName, paymentMonth,
}: Props) {
  const [open, setOpen]               = useState(false);
  const [result, setResult]           = useState<ActionResult | null>(null);
  const [isPending, startTransition]  = useTransition();

  function handleOpen()  { setResult(null); setOpen(true); }
  function handleClose() { if (isPending) return; setOpen(false); setTimeout(() => setResult(null), 250); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd    = new FormData(e.currentTarget);
    const date  = fd.get("paid_date") as string;
    const notes = (fd.get("notes") as string | null) || undefined;
    startTransition(async () => {
      const res = await registerPayment(paymentId, date, notes);
      setResult(res);
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title="Registrar pago recibido"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors"
        style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}
      >
        <CheckCircle size={10} />
        Recibido
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Confirmar Pago</p>
                  <p className="text-zinc-600 text-xs mt-0.5 truncate max-w-[200px]">
                    {contractName} · Mes {paymentMonth}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} disabled={isPending}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-900">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={26} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base mb-1">¡Pago registrado!</p>
                    <p className="text-zinc-500 text-sm">El recaudo quedó marcado como recibido.</p>
                  </div>
                  <button onClick={handleClose} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Summary pill */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <DollarSign size={14} className="text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-400 text-xs">Monto a confirmar</p>
                      <p className="text-white font-semibold text-sm">{amount}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-zinc-600 text-[10px]">Programado</p>
                      <p className="text-zinc-400 text-xs">{scheduledDate}</p>
                    </div>
                  </div>

                  {/* Fecha de pago real */}
                  <Field label="Fecha de recepción" icon={Calendar} required>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input name="paid_date" type="date" required
                        className={`${inputCls} [color-scheme:dark]`} />
                    </div>
                  </Field>

                  {/* Notas opcionales */}
                  <Field label="Notas (opcional)" icon={FileText}>
                    <textarea name="notes" rows={2}
                      placeholder="Referencia bancaria, observaciones…"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 resize-none transition-colors" />
                  </Field>

                  {result?.error && (
                    <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs">{result.error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isPending
                      ? <><Loader2 size={15} className="animate-spin" /> Guardando…</>
                      : <><CheckCircle size={14} /> Confirmar Pago Recibido</>}
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
