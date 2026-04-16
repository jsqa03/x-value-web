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
  { value: "manager", label: "Manager",   color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)"  },
  { value: "sales",   label: "Comercial", color: "#D1FF48", bg: "rgba(209,255,72,0.1)",  border: "rgba(209,255,72,0.3)"  },
  { value: "client",  label: "Cliente",   color: "#00c0f3", bg: "rgba(0,192,243,0.1)",   border: "rgba(0,192,243,0.3)"   },
] as const;

const CLIENT_TYPES = ["X-Value AI", "X-Value Growth"] as const;

interface Props {
  callerRole: "admin" | "manager";
}

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
};

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label, icon: Icon, required: req, children,
}: {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
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
function IconInput({
  icon: Icon, name, type = "text", placeholder, required, min, max, ...rest
}: {
  icon: React.ElementType;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  minLength?: number;
}) {
  return (
    <div className="relative">
      <Icon
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "rgba(255,255,255,0.22)" }}
      />
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        {...rest}
        className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
        style={inputBase}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")}
        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );
}

// ─── Select with left icon ─────────────────────────────────────────────────────
function IconSelect({
  icon: Icon, name, value, onChange, required, children,
}: {
  icon: React.ElementType;
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{ color: "rgba(255,255,255,0.22)" }}
      />
      <select
        name={name}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none transition-all appearance-none"
        style={{
          ...inputBase,
          color: value ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")}
        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
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

  const [open, setOpen]                         = useState(false);
  const [showPwd, setShowPwd]                   = useState(false);
  const [role, setRole]                         = useState<string>(ROLES[ROLES.length - 1].value);
  const [leaderId, setLeaderId]                 = useState<string>("");
  const [leaders, setLeaders]                   = useState<LeaderOption[]>([]);
  const [loadingLeaders, setLoadingLeaders]     = useState(false);
  const [country, setCountry]                   = useState<string>("");
  const [nationality, setNationality]           = useState<string>("");
  const [clientType, setClientType]             = useState<string>("");
  const [result, setResult]                     = useState<ActionResult | null>(null);
  const [isPending, startTransition]            = useTransition();
  const formRef                                 = useRef<HTMLFormElement>(null);

  // Fetch leaders when modal opens and role requires one
  useEffect(() => {
    if (!open) return;
    setLoadingLeaders(true);
    getLeaders().then((list) => {
      setLeaders(list);
      setLoadingLeaders(false);
    });
  }, [open]);

  // Reset leader when role changes to manager (not needed)
  useEffect(() => {
    if (role === "manager") setLeaderId("");
    if (role !== "client") setClientType("");
  }, [role]);

  function handleOpen() {
    setResult(null);
    setRole(ROLES[ROLES.length - 1].value);
    setLeaderId("");
    setCountry("");
    setNationality("");
    setClientType("");
    setShowPwd(false);
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
    if (leaderId) fd.set("manager_id", leaderId);
    if (country) fd.set("country", country);
    if (nationality) fd.set("nationality", nationality);
    if (clientType) fd.set("client_type", clientType);

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
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_22px_rgba(252,211,77,0.35)] active:scale-[0.99]"
        style={{ background: "#fcd34d" }}
      >
        <UserPlus size={14} />
        Nuevo Usuario
      </button>

      {/* ── Modal overlay ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            background: "rgba(0,0,0,0.78)",
          }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              background: "rgba(9,7,20,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Accent line */}
            <div
              className="absolute top-0 left-8 right-8 h-px shrink-0"
              style={{ background: "linear-gradient(to right, transparent, rgba(252,211,77,0.5), transparent)" }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(252,211,77,0.1)", border: "1px solid rgba(252,211,77,0.2)" }}
                >
                  <UserPlus size={15} style={{ color: "#fcd34d" }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Crear cuenta de usuario</p>
                  <p className="text-zinc-600 text-xs mt-0.5">Acceso inmediato al portal</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="px-6 py-5 overflow-y-auto">

              {/* ── Success ─────────────────────────────────────────────── */}
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: "rgba(34,197,94,0.12)" }}
                    />
                    <div
                      className="relative w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
                    >
                      <CheckCircle2 size={26} className="text-emerald-400" />
                    </div>
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
                      setLeaderId("");
                      setCountry("");
                      setNationality("");
                      setClientType("");
                    }}
                    className="text-sm font-semibold transition-colors hover:text-white"
                    style={{ color: "#fcd34d" }}
                  >
                    Crear otro usuario →
                  </button>
                </div>

              ) : (
                /* ── Form ─────────────────────────────────────────────── */
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Required identity fields */}
                  <Field label="Nombre completo" icon={User} required>
                    <IconInput icon={User} name="full_name" placeholder="Santiago Martínez" required />
                  </Field>

                  <Field label="Email" icon={Mail} required>
                    <IconInput icon={Mail} name="email" type="email" placeholder="usuario@empresa.com" required />
                  </Field>

                  <Field label="Contraseña temporal" icon={Lock} required>
                    <div className="relative">
                      <Lock
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "rgba(255,255,255,0.22)" }}
                      />
                      <input
                        name="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        className="w-full rounded-xl pl-9 pr-11 py-2.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
                        style={inputBase}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
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
                            className="py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                            style={{
                              background: active ? r.bg : "rgba(255,255,255,0.04)",
                              border: `1px solid ${active ? r.border : "rgba(255,255,255,0.08)"}`,
                              color: active ? r.color : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leader assignment — required for sales and client */}
                  {needsLeader && (
                    <Field label="Asignar Líder" icon={Users} required>
                      <div className="relative">
                        <Users
                          size={14}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                          style={{ color: "rgba(255,255,255,0.22)" }}
                        />
                        <select
                          value={leaderId}
                          required
                          onChange={(e) => setLeaderId(e.target.value)}
                          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none transition-all appearance-none"
                          style={{
                            ...inputBase,
                            color: leaderId ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")}
                          onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                        >
                          <option value="" disabled style={{ background: "#0a0812" }}>
                            {loadingLeaders ? "Cargando líderes…" : "Selecciona un líder…"}
                          </option>
                          {/* Group: Managers */}
                          {leaders.filter((l) => l.role === "manager").length > 0 && (
                            <optgroup label="── Managers ──" style={{ background: "#0a0812", color: "rgba(255,255,255,0.4)" }}>
                              {leaders.filter((l) => l.role === "manager").map((m) => (
                                <option key={m.id} value={m.id} style={{ background: "#0a0812" }}>
                                  {m.full_name ?? m.email}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {/* Group: Sales reps */}
                          {leaders.filter((l) => l.role === "sales").length > 0 && (
                            <optgroup label="── Comerciales ──" style={{ background: "#0a0812", color: "rgba(255,255,255,0.4)" }}>
                              {leaders.filter((l) => l.role === "sales").map((s) => (
                                <option key={s.id} value={s.id} style={{ background: "#0a0812" }}>
                                  {s.full_name ?? s.email}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                    </Field>
                  )}

                  {/* Client type — required only for client role */}
                  {role === "client" && (
                    <Field label="Tipo de Cliente" icon={Tag} required>
                      <IconSelect icon={Tag} name="client_type" value={clientType} onChange={setClientType} required>
                        <option value="" disabled style={{ background: "#0a0812" }}>Selecciona tipo…</option>
                        {CLIENT_TYPES.map((t) => (
                          <option key={t} value={t} style={{ background: "#0a0812" }}>{t}</option>
                        ))}
                      </IconSelect>
                    </Field>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <span className="text-zinc-700 text-[10px] uppercase tracking-widest font-semibold">
                      Datos adicionales
                    </span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  </div>

                  <Field label="Universidad / Institución" icon={GraduationCap}>
                    <IconInput icon={GraduationCap} name="university" placeholder="Universidad Nacional…" />
                  </Field>

                  <Field label="Fecha de nacimiento" icon={CalendarDays}>
                    <IconInput
                      icon={CalendarDays}
                      name="birth_date"
                      type="date"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split("T")[0]}
                      min="1930-01-01"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="País" icon={Globe}>
                      <IconSelect icon={Globe} name="country" value={country} onChange={setCountry}>
                        <option value="" style={{ background: "#0a0812" }}>— Seleccionar —</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} style={{ background: "#0a0812" }}>{c}</option>
                        ))}
                      </IconSelect>
                    </Field>
                    <Field label="Nacionalidad" icon={Globe}>
                      <IconSelect icon={Globe} name="nationality" value={nationality} onChange={setNationality}>
                        <option value="" style={{ background: "#0a0812" }}>— Seleccionar —</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} style={{ background: "#0a0812" }}>{c}</option>
                        ))}
                      </IconSelect>
                    </Field>
                  </div>

                  {/* Error */}
                  {result?.error && (
                    <div
                      className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs leading-relaxed">{result.error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.01] mt-1"
                    style={{ background: "#fcd34d" }}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-black" />
                        Creando cuenta…
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} />
                        Crear cuenta
                      </>
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
