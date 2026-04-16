"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { updateLead, getAssignableUsers } from "@/app/actions/admin";
import type { ActionResult, AssignableUser } from "@/app/actions/admin";
import {
  Pencil, X, Loader2, CheckCircle2, AlertCircle,
  User, Mail, Phone, Building2, Layers, Tag,
  TrendingUp, Users, FileText, AlertTriangle,
} from "lucide-react";
import type { Lead } from "./LeadsTable";
import type { Role } from "./types";

const PIPELINE_STATUSES = [
  "En seguimiento",
  "Reunión confirmada",
  "Cotización enviada",
  "Perdido/No",
  "Cerrado/Cliente activo",
] as const;

const PIPELINE_COLORS: Record<string, { active: string; bg: string; border: string }> = {
  "En seguimiento":         { active: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)"  },
  "Reunión confirmada":     { active: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  "Cotización enviada":     { active: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  "Perdido/No":             { active: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  "Cerrado/Cliente activo": { active: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"   },
};

const SERVICE_TYPES = ["X-Value AI", "X-Value Growth"] as const;

interface Props {
  lead: Lead;
  callerRole: Role;
}

function Field({ label, icon: Icon, required: req, children }: {
  label: string; icon: React.ElementType; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
        <Icon size={10} className="text-zinc-600" />
        {label}
        {req && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors";
const selectCls = "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors appearance-none";

export default function EditLeadModal({ lead, callerRole }: Props) {
  const [open, setOpen]                       = useState(false);
  const [pipelineStatus, setPipelineStatus]   = useState<string>(lead.pipeline_status ?? PIPELINE_STATUSES[0]);
  const [assignedTo, setAssignedTo]           = useState<string>(lead.assigned_to ?? "");
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [loadingUsers, setLoadingUsers]       = useState(false);
  const [result, setResult]                   = useState<ActionResult | null>(null);
  const [isPending, startTransition]          = useTransition();
  const formRef                               = useRef<HTMLFormElement>(null);

  const showLostReason  = pipelineStatus === "Perdido/No";
  const showAssignedTo  = callerRole === "admin" || callerRole === "manager";

  // Load assignable users when modal opens (admin & manager only)
  useEffect(() => {
    if (!open || !showAssignedTo) return;
    setLoadingUsers(true);
    getAssignableUsers().then((list) => {
      setAssignableUsers(list);
      setLoadingUsers(false);
    });
  }, [open, showAssignedTo]);

  function handleOpen() {
    // Reset to lead's current values each time the modal opens
    setPipelineStatus(lead.pipeline_status ?? PIPELINE_STATUSES[0]);
    setAssignedTo(lead.assigned_to ?? "");
    setResult(null);
    setOpen(true);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setTimeout(() => setResult(null), 250);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    fd.set("id", lead.id);
    fd.set("pipeline_status", pipelineStatus);
    if (showAssignedTo && assignedTo) fd.set("assigned_to", assignedTo);

    startTransition(async () => {
      const res = await updateLead(fd);
      setResult(res);
    });
  }

  const managers = assignableUsers.filter((u) => u.role === "manager");
  const sales    = assignableUsers.filter((u) => u.role === "sales");

  return (
    <>
      {/* ── Trigger: pencil icon button ─────────────────────────────────── */}
      <button
        onClick={handleOpen}
        title="Editar lead"
        className="p-1.5 rounded-lg hover:bg-orange-500/10 transition-colors group"
      >
        <Pencil size={13} className="text-zinc-600 group-hover:text-orange-400 transition-colors" />
      </button>

      {/* ── Modal overlay ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Pencil size={14} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Editar Lead</p>
                  <p className="text-zinc-600 text-xs mt-0.5 truncate max-w-[220px]">{lead.name}</p>
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

              {/* ── Success ─────────────────────────────────────────────── */}
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={26} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base mb-1">¡Lead actualizado!</p>
                    <p className="text-zinc-500 text-sm">Los cambios se guardaron correctamente.</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>

              ) : (
                /* ── Form ─────────────────────────────────────────────── */
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Nombre + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nombre" icon={User} required>
                      <div className="relative">
                        <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <input
                          name="name"
                          type="text"
                          defaultValue={lead.name}
                          required
                          className={inputCls}
                        />
                      </div>
                    </Field>
                    <Field label="Email" icon={Mail} required>
                      <div className="relative">
                        <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <input
                          name="email"
                          type="email"
                          defaultValue={lead.email}
                          required
                          className={inputCls}
                        />
                      </div>
                    </Field>
                  </div>

                  {/* WhatsApp + Empresa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="WhatsApp" icon={Phone}>
                      <div className="relative">
                        <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <input
                          name="whatsapp"
                          type="tel"
                          defaultValue={lead.whatsapp ?? ""}
                          placeholder="+57 300 000 0000"
                          className={inputCls}
                        />
                      </div>
                    </Field>
                    <Field label="Empresa" icon={Building2}>
                      <div className="relative">
                        <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <input
                          name="company_info"
                          type="text"
                          defaultValue={lead.company_info ?? ""}
                          placeholder="Nombre empresa…"
                          className={inputCls}
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Nicho + Tipo de Servicio */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nicho" icon={Layers}>
                      <div className="relative">
                        <Layers size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <input
                          name="niche"
                          type="text"
                          defaultValue={lead.niche ?? ""}
                          placeholder="eCommerce, SaaS…"
                          className={inputCls}
                        />
                      </div>
                    </Field>
                    <Field label="Tipo de Servicio" icon={Tag}>
                      <div className="relative">
                        <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <select name="service_type" defaultValue={lead.service_type ?? ""} className={selectCls}>
                          <option value="" className="bg-zinc-950">— Seleccionar —</option>
                          {SERVICE_TYPES.map((t) => (
                            <option key={t} value={t} className="bg-zinc-950">{t}</option>
                          ))}
                        </select>
                      </div>
                    </Field>
                  </div>

                  {/* Estado del embudo */}
                  <Field label="Estado del Embudo" icon={TrendingUp} required>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PIPELINE_STATUSES.map((status) => {
                        const isActive = pipelineStatus === status;
                        const c = PIPELINE_COLORS[status] ?? { active: "#71717a", bg: "transparent", border: "rgba(113,113,122,0.3)" };
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setPipelineStatus(status)}
                            className="py-2 px-3 rounded-lg text-xs font-semibold transition-all text-left leading-tight"
                            style={{
                              background: isActive ? c.bg : "rgba(255,255,255,0.02)",
                              border: `1px solid ${isActive ? c.border : "rgba(255,255,255,0.06)"}`,
                              color: isActive ? c.active : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Razón de pérdida — condicional */}
                  {showLostReason && (
                    <Field label="Razón de pérdida" icon={AlertTriangle} required>
                      <div className="relative">
                        <AlertTriangle size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-red-400/60" />
                        <input
                          name="lost_reason"
                          type="text"
                          defaultValue={lead.lost_reason ?? ""}
                          placeholder="¿Por qué se perdió este lead?"
                          required
                          className="w-full bg-zinc-900 border border-red-500/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-red-500/40 transition-colors"
                        />
                      </div>
                    </Field>
                  )}

                  {/* Asignado a — admin y manager solamente */}
                  {showAssignedTo && (
                    <Field label="Asignado a" icon={Users}>
                      <div className="relative">
                        <Users size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                        <select
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          className={selectCls}
                          style={{ borderColor: "rgba(249,115,22,0.25)" }}
                        >
                          <option value="" className="bg-zinc-950">
                            {loadingUsers ? "Cargando…" : "— Sin asignar —"}
                          </option>
                          {managers.length > 0 && (
                            <optgroup label="── Managers ──" className="bg-zinc-950">
                              {managers.map((u) => (
                                <option key={u.id} value={u.id} className="bg-zinc-950">
                                  {u.full_name ?? u.email}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {sales.length > 0 && (
                            <optgroup label="── Comerciales ──" className="bg-zinc-950">
                              {sales.map((u) => (
                                <option key={u.id} value={u.id} className="bg-zinc-950">
                                  {u.full_name ?? u.email}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        {/* Subtle orange hint that this is the routing field */}
                        <p className="text-[10px] text-orange-500/60 mt-1 pl-1">
                          Cambiar el responsable moverá este lead a su panel.
                        </p>
                      </div>
                    </Field>
                  )}

                  {/* Notas */}
                  <Field label="Notas" icon={FileText}>
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={lead.notes ?? ""}
                      placeholder="Observaciones adicionales sobre el lead…"
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
                      <><Pencil size={14} /> Guardar cambios</>
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
