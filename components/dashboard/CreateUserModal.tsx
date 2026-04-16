"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createUserAccount, getLeaders } from "@/app/actions/admin";
import type { ActionResult, LeaderOption } from "@/app/actions/admin";
import {
  UserPlus, X, Loader2, CheckCircle2,
  Eye, EyeOff, AlertCircle,
  User, Mail, Lock, GraduationCap, Globe, CalendarDays, Users, Tag,
} from "lucide-react";
import { COUNTRIES } from "./types";

// ─── Roles available per caller ────────────────────────────────────────────────
const ALL_ROLES = [
  { value: "manager", label: "Manager",   color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)"  },
  { value: "sales",   label: "Comercial", color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"    },
  { value: "client",  label: "Cliente",   color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)"   },
] as const;

const CLIENT_TYPES = ["X-Value AI", "X-Value Growth"] as const;

interface Props { callerRole: "admin" | "manager" }

// ─── Field wrapper ─────────────────────────────────────────────────────────────
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

// ─── Input with left icon ──────────────────────────────────────────────────────
function IconInput({ icon: Icon, name, type = "text", placeholder, required, min, max, ...rest }: {
  icon: React.ElementType; name: string; type?: string; placeholder?: string;
  required?: boolean; min?: string; max?: string; minLength?: number;
}) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
      <input
        name={name} type={type} placeholder={placeholder} required={required} min={min} max={max}
        {...rest}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors"
      />
    </div>
  );
}

// ─── Select with left icon ─────────────────────────────────────────────────────
function IconSelect({ icon: Icon, name, value, onChange, required, children }: {
  icon: React.ElementType; name: string; value: string;
  onChange: (v: string) => void; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
      <select
        name={name} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors appearance-none"
      >
        {children}
      </select>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function CreateUserModal({ callerRole }: Props) {
  const ROLES = callerRole === "manager"
    ? ALL_ROLES.filter((r) => r.value !== "manager")
    : ALL_ROLES;

  const [open, setOpen]                     = useState(false);
  const [showPwd, setShowPwd]               = useState(false);
  const [role, setRole]                     = useState<string>(ROLES[ROLES.length - 1].value);
  const [leaderId, setLeaderId]             = useState<string>("");
  const [leaders, setLeaders]               = useState<LeaderOption[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [country, setCountry]               = useState<string>("");
  const [nationality, setNationality]       = useState<string>("");
  const [clientType, setClientType]         = useState<string>("");
  const [result, setResult]                 = useState<ActionResult | null>(null);
  const [isPending, startTransition]        = useTransition();
  const formRef                             = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoadingLeaders(true);
    getLeaders().then((list) => { setLeaders(list); setLoadingLeaders(false); });
  }, [open]);

  useEffect(() => {
    if (role === "manager") setLeaderId("");
    if (role !== "client") setClientType("");
  }, [role]);

  function handleOpen() {
    setResult(null);
    setRole(ROLES[ROLES.length - 1].value);
    setLeaderId(""); setCountry(""); setNationality(""); setClientType(""); setShowPwd(false);
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
    fd.set("role", role);
    if (leaderId)    fd.set("manager_id",  leaderId);
    if (country)     fd.set("country",     country);
    if (nationality) fd.set("nationality", nationality);
    if (clientType)  fd.set("client_type", clientType);
    startTransition(async () => {
      const res = await createUserAccount(fd);
      setResult(res);
      if (res.success) formRef.current?.reset();
    });
  }

  const needsLeader = role === "sales" || role === "client";

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
      >
        <UserPlus size={14} />
        Nuevo Usuario
      </button>

      {/* ── Modal overlay ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <UserPlus size={15} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Crear cuenta de usuario</p>
                  <p className="text-zinc-600 text-xs mt-0.5">Acceso inmediato al portal</p>
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

            {/* Body — scrollable */}
            <div className="px-6 py-5 overflow-y-auto">

              {/* ── Success ─────────────────────────────────────────────── */}
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={26} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base mb-1">¡Cuenta creada!</p>
                    <p className="text-zinc-500 text-sm">El usuario ya puede iniciar sesión.</p>
                  </div>
                  <button
                    onClick={() => {
                      setResult(null);
                      formRef.current?.reset();
                      setRole(ROLES[ROLES.length - 1].value);
                      setLeaderId(""); setCountry(""); setNationality(""); setClientType("");
                    }}
                    className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Crear otro usuario →
                  </button>
                </div>

              ) : (
                /* ── Form ─────────────────────────────────────────────── */
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">

                  <Field label="Nombre completo" icon={User} required>
                    <IconInput icon={User} name="full_name" placeholder="Santiago Martínez" required />
                  </Field>

                  <Field label="Email" icon={Mail} required>
                    <IconInput icon={Mail} name="email" type="email" placeholder="usuario@empresa.com" required />
                  </Field>

                  <Field label="Contraseña temporal" icon={Lock} required>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input
                        name="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        required minLength={6}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-11 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </Field>

                  {/* Role selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
                      Rol asignado <span className="text-red-400">*</span>
                    </label>
                    <div className={`grid gap-2 ${ROLES.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                      {ROLES.map((r) => {
                        const active = role === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setRole(r.value)}
                            className="py-2.5 rounded-lg text-sm font-semibold transition-all"
                            style={{
                              background: active ? r.bg : "rgba(255,255,255,0.03)",
                              border: `1px solid ${active ? r.border : "rgba(255,255,255,0.07)"}`,
                              color: active ? r.color : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leader assignment */}
                  {needsLeader && (
                    <Field label="Asignar Líder" icon={Users} required>
                      <div className="relative">
                        <Users size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                        <select
                          value={leaderId} required
                          onChange={(e) => setLeaderId(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors appearance-none"
                        >
                          <option value="" disabled className="bg-zinc-950">
                            {loadingLeaders ? "Cargando líderes…" : "Selecciona un líder…"}
                          </option>
                          {leaders.filter((l) => l.role === "manager").length > 0 && (
                            <optgroup label="── Managers ──" className="bg-zinc-950">
                              {leaders.filter((l) => l.role === "manager").map((m) => (
                                <option key={m.id} value={m.id} className="bg-zinc-950">
                                  {m.full_name ?? m.email}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {leaders.filter((l) => l.role === "sales").length > 0 && (
                            <optgroup label="── Comerciales ──" className="bg-zinc-950">
                              {leaders.filter((l) => l.role === "sales").map((s) => (
                                <option key={s.id} value={s.id} className="bg-zinc-950">
                                  {s.full_name ?? s.email}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                    </Field>
                  )}

                  {/* Client type */}
                  {role === "client" && (
                    <Field label="Tipo de Cliente" icon={Tag} required>
                      <IconSelect icon={Tag} name="client_type" value={clientType} onChange={setClientType} required>
                        <option value="" disabled className="bg-zinc-950">Selecciona tipo…</option>
                        {CLIENT_TYPES.map((t) => (
                          <option key={t} value={t} className="bg-zinc-950">{t}</option>
                        ))}
                      </IconSelect>
                    </Field>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-zinc-700 text-[10px] uppercase tracking-widest font-semibold">Datos adicionales</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  <Field label="Universidad / Institución" icon={GraduationCap}>
                    <IconInput icon={GraduationCap} name="university" placeholder="Universidad Nacional…" />
                  </Field>

                  <Field label="Fecha de nacimiento" icon={CalendarDays}>
                    <IconInput
                      icon={CalendarDays} name="birth_date" type="date"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split("T")[0]}
                      min="1930-01-01"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="País" icon={Globe}>
                      <IconSelect icon={Globe} name="country" value={country} onChange={setCountry}>
                        <option value="" className="bg-zinc-950">— Seleccionar —</option>
                        {COUNTRIES.map((c) => <option key={c} value={c} className="bg-zinc-950">{c}</option>)}
                      </IconSelect>
                    </Field>
                    <Field label="Nacionalidad" icon={Globe}>
                      <IconSelect icon={Globe} name="nationality" value={nationality} onChange={setNationality}>
                        <option value="" className="bg-zinc-950">— Seleccionar —</option>
                        {COUNTRIES.map((c) => <option key={c} value={c} className="bg-zinc-950">{c}</option>)}
                      </IconSelect>
                    </Field>
                  </div>

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
                      <><Loader2 size={15} className="animate-spin" /> Creando cuenta…</>
                    ) : (
                      <><UserPlus size={15} /> Crear cuenta</>
                    )}
                  </button>

                  <p className="text-center text-zinc-700 text-xs">
                    Sin verificación por email · Acceso inmediato
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
