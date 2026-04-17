"use client";

import { useState, useTransition } from "react";
import { addExpense } from "@/app/actions/finance";
import type { ActionResult } from "@/app/actions/admin";
import {
  PlusCircle, X, Loader2, CheckCircle2, AlertCircle,
  Calendar, DollarSign, FileText, Tag, User, ChevronDown, Globe,
} from "lucide-react";

interface AssignableUser { id: string; full_name: string | null; email: string }
interface Props { users: AssignableUser[] }

const CATEGORIES = [
  "Nómina",
  "Infraestructura / Tech",
  "Marketing",
  "Operaciones",
  "Legal / Contable",
  "Viáticos",
  "Otro",
] as const;

const inputCls  = "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors";
const selectCls = "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors appearance-none";

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

export default function ExpenseModal({ users }: Props) {
  const [open, setOpen]               = useState(false);
  const [currency, setCurrency]       = useState<"COP" | "USD">("COP");
  const [result, setResult]           = useState<ActionResult | null>(null);
  const [isPending, startTransition]  = useTransition();

  function handleOpen()  { setResult(null); setCurrency("COP"); setOpen(true); }
  function handleClose() { if (isPending) return; setOpen(false); setTimeout(() => setResult(null), 250); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    fd.set("currency", currency);
    startTransition(async () => {
      const res = await addExpense(fd);
      setResult(res);
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors"
        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
      >
        <PlusCircle size={12} />
        Registrar Gasto
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <PlusCircle size={14} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Registrar Gasto</p>
                  <p className="text-zinc-600 text-xs mt-0.5">Egreso de la empresa</p>
                </div>
              </div>
              <button onClick={handleClose} disabled={isPending}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-900">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto">
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={26} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base mb-1">¡Gasto registrado!</p>
                    <p className="text-zinc-500 text-sm">El egreso fue guardado correctamente.</p>
                  </div>
                  <button onClick={handleClose} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Moneda */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
                      <Globe size={10} className="text-zinc-600" />
                      Moneda <span className="text-orange-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["COP", "USD"] as const).map((c) => (
                        <button key={c} type="button" onClick={() => setCurrency(c)}
                          className="py-2 px-3 rounded-xl text-xs font-bold transition-all text-center"
                          style={{
                            background: currency === c
                              ? (c === "COP" ? "rgba(34,197,94,0.08)" : "rgba(56,189,248,0.08)")
                              : "rgba(255,255,255,0.02)",
                            border: `1px solid ${currency === c
                              ? (c === "COP" ? "rgba(34,197,94,0.3)" : "rgba(56,189,248,0.3)")
                              : "rgba(255,255,255,0.06)"}`,
                            color: currency === c
                              ? (c === "COP" ? "#22c55e" : "#38bdf8")
                              : "rgba(255,255,255,0.25)",
                          }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fecha + Monto */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Fecha" icon={Calendar} required>
                      <div className="relative">
                        <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <input name="expense_date" type="date" required
                          className={`${inputCls} [color-scheme:dark]`} />
                      </div>
                    </Field>
                    <Field label={`Monto (${currency})`} icon={DollarSign} required>
                      <div className="relative">
                        <DollarSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <input name="amount" type="text"
                          placeholder={currency === "USD" ? "500.00" : "500000"}
                          required className={inputCls} />
                      </div>
                    </Field>
                  </div>

                  {/* Concepto */}
                  <Field label="Concepto" icon={FileText} required>
                    <div className="relative">
                      <FileText size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input name="concept" type="text" placeholder="Descripción del gasto…" required className={inputCls} />
                    </div>
                  </Field>

                  {/* Categoría */}
                  <Field label="Categoría" icon={Tag} required>
                    <div className="relative">
                      <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <select name="category" required className={selectCls}>
                        <option value="" className="bg-zinc-950">— Seleccionar —</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c} className="bg-zinc-950">{c}</option>
                        ))}
                      </select>
                    </div>
                  </Field>

                  {/* Responsable */}
                  <Field label="Responsable (opcional)" icon={User}>
                    <div className="relative">
                      <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <select name="responsible_id" className={selectCls}>
                        <option value="" className="bg-zinc-950">— Sin asignar —</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id} className="bg-zinc-950">{u.full_name ?? u.email}</option>
                        ))}
                      </select>
                    </div>
                  </Field>

                  {result?.error && (
                    <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs">{result.error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                    {isPending
                      ? <><Loader2 size={15} className="animate-spin" /> Guardando…</>
                      : <><PlusCircle size={14} /> Registrar Gasto</>}
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
