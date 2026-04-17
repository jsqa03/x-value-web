"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { activateClient } from "@/app/actions/finance";
import { getAssignableUsers } from "@/app/actions/admin";
import type { ActionResult, AssignableUser } from "@/app/actions/admin";
import {
  Zap, X, Loader2, CheckCircle2, AlertCircle,
  Building2, DollarSign, Calendar, Tag, Users, FileText,
  TrendingUp, ChevronDown,
} from "lucide-react";
import type { Lead } from "../LeadsTable";

interface Props { lead: Lead }

const SERVICE_TYPES = ["X-Value AI", "X-VALUE GROWTH"] as const;
const SERVICE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  "X-Value AI":     { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)" },
  "X-VALUE GROWTH": { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
};

function Field({ label, icon: Icon, required: req, children, hint }: {
  label: string; icon: React.ElementType; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
        <Icon size={10} className="text-zinc-600" />
        {label}
        {req && <span className="text-orange-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-zinc-700 text-[10px] pl-0.5">{hint}</p>}
    </div>
  );
}

const inputCls  = "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors";
const selectCls = "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors appearance-none";

export default function ContractActivationModal({ lead }: Props) {
  const [open, setOpen]                       = useState(false);
  const [serviceType, setServiceType]         = useState<string>(lead.service_type ?? "X-Value AI");
  const [assignedSalesId, setAssignedSalesId] = useState(lead.assigned_to ?? "");
  const [assignedMgrId,   setAssignedMgrId]   = useState("");
  const [users, setUsers]                     = useState<AssignableUser[]>([]);
  const [loadingUsers, setLoadingUsers]        = useState(false);
  const [result, setResult]                   = useState<ActionResult | null>(null);
  const [isPending, startTransition]          = useTransition();
  const formRef                               = useRef<HTMLFormElement>(null);

  const isGrowth = serviceType === "X-VALUE GROWTH";
  const managers = users.filter((u) => u.role === "manager");
  const salesReps = users.filter((u) => u.role === "sales");

  useEffect(() => {
    if (!open) return;
    setLoadingUsers(true);
    getAssignableUsers().then((list) => { setUsers(list); setLoadingUsers(false); });
  }, [open]);

  function handleOpen() { setResult(null); setOpen(true); }
  function handleClose() { if (isPending) return; setOpen(false); setTimeout(() => setResult(null), 250); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    fd.set("lead_id",           lead.id);
    fd.set("service_type",      serviceType);
    fd.set("assigned_sales_id", assignedSalesId);
    fd.set("assigned_manager_id", assignedMgrId);
    startTransition(async () => {
      const res = await activateClient(fd);
      setResult(res);
    });
  }

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
        style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}
      >
        <Zap size={10} />
        Activar
      </button>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden max-h-[94vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Zap size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Activar Cliente</p>
                  <p className="text-zinc-600 text-xs mt-0.5 truncate max-w-[230px]">{lead.name}{lead.company_info ? ` · ${lead.company_info}` : ""}</p>
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
                    <p className="text-white font-semibold text-base mb-1">¡Cliente activado!</p>
                    <p className="text-zinc-500 text-sm">Contrato creado. Schedule de pagos y comisiones generados automáticamente.</p>
                  </div>
                  <button onClick={handleClose} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Cerrar
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Service type selector */}
                  <Field label="Tipo de Servicio" icon={Tag} required>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICE_TYPES.map((st) => {
                        const active = serviceType === st;
                        const c = SERVICE_COLORS[st];
                        return (
                          <button key={st} type="button" onClick={() => setServiceType(st)}
                            className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center"
                            style={{
                              background: active ? c.bg : "rgba(255,255,255,0.02)",
                              border: `1px solid ${active ? c.border : "rgba(255,255,255,0.06)"}`,
                              color: active ? c.color : "rgba(255,255,255,0.25)",
                            }}>
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Client name */}
                  <Field label="Nombre del Cliente / Empresa" icon={Building2} required>
                    <div className="relative">
                      <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input name="client_name" type="text"
                        defaultValue={lead.company_info ?? lead.name}
                        placeholder="Empresa S.A.S." required className={inputCls} />
                    </div>
                  </Field>

                  {/* Closing amount */}
                  <Field label="Monto de Cierre" icon={DollarSign} required
                    hint={isGrowth ? "Monto de la venta inicial (no el fee mensual)." : "Pago único — base para la comisión del 3% del Manager."}>
                    <div className="relative">
                      <DollarSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input name="closing_amount" type="text" placeholder="5000000"
                        required className={inputCls} />
                    </div>
                  </Field>

                  {/* X-VALUE GROWTH: fee escalation */}
                  {isGrowth && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5">
                      <div className="col-span-2">
                        <p className="text-purple-400/80 text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
                          <TrendingUp size={9} /> Fee mensual X-VALUE GROWTH
                        </p>
                      </div>
                      <Field label="Fee meses 1-2" icon={DollarSign} required
                        hint="Sales cobra 10% sobre este fee (meses 1-2).">
                        <div className="relative">
                          <DollarSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                          <input name="fee_month_1_2" type="text" placeholder="5000000"
                            required={isGrowth} className={inputCls} />
                        </div>
                      </Field>
                      <Field label="Fee mes 3 en adelante" icon={DollarSign} required
                        hint="Manager cobra 10% sobre este fee (meses 3-4).">
                        <div className="relative">
                          <DollarSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                          <input name="fee_month_3_plus" type="text" placeholder="6000000"
                            required={isGrowth} className={inputCls} />
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Fecha de Firma" icon={Calendar} required>
                      <div className="relative">
                        <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <input name="contract_signed_date" type="date" required
                          className={`${inputCls} [color-scheme:dark]`} />
                      </div>
                    </Field>
                    <Field label="Primer Pago (Día 0)" icon={Calendar} required
                      hint="Inicia el ciclo de facturación.">
                      <div className="relative">
                        <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500/60" />
                        <input name="first_payment_date" type="date" required
                          className={`${inputCls} !border-orange-500/30 [color-scheme:dark]`} />
                      </div>
                    </Field>
                  </div>

                  {/* Assigned sales */}
                  <Field label="Comercial Asignado" icon={Users}>
                    <div className="relative">
                      <Users size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <select value={assignedSalesId} onChange={(e) => setAssignedSalesId(e.target.value)} className={selectCls}>
                        <option value="" className="bg-zinc-950">{loadingUsers ? "Cargando…" : "— Sin asignar —"}</option>
                        {salesReps.map((u) => (
                          <option key={u.id} value={u.id} className="bg-zinc-950">{u.full_name ?? u.email}</option>
                        ))}
                      </select>
                    </div>
                  </Field>

                  {/* Assigned manager */}
                  <Field label="Manager Asignado" icon={Users}>
                    <div className="relative">
                      <Users size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <select value={assignedMgrId} onChange={(e) => setAssignedMgrId(e.target.value)} className={selectCls}>
                        <option value="" className="bg-zinc-950">{loadingUsers ? "Cargando…" : "— Sin asignar —"}</option>
                        {managers.map((u) => (
                          <option key={u.id} value={u.id} className="bg-zinc-950">{u.full_name ?? u.email}</option>
                        ))}
                      </select>
                    </div>
                  </Field>

                  {/* Notes */}
                  <Field label="Notas del Contrato" icon={FileText}>
                    <textarea name="notes" rows={2}
                      placeholder="Condiciones especiales, observaciones…"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 resize-none transition-colors" />
                  </Field>

                  {/* Commission summary (informational) */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-500 flex flex-col gap-1">
                    <p className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider mb-1">Comisiones que se generarán</p>
                    {serviceType === "X-Value AI" ? (
                      <p>• Manager: <span className="text-orange-400 font-semibold">3%</span> del monto de cierre (pago único)</p>
                    ) : (
                      <>
                        <p>• Comercial meses 1-2: <span className="text-emerald-400 font-semibold">10%</span> del fee mensual</p>
                        <p>• Manager meses 3-4: <span className="text-purple-400 font-semibold">10%</span> del fee mensual</p>
                      </>
                    )}
                  </div>

                  {result?.error && (
                    <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs">{result.error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                    {isPending
                      ? <><Loader2 size={15} className="animate-spin" /> Activando…</>
                      : <><Zap size={14} /> Activar Cliente y Generar Contrato</>}
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
