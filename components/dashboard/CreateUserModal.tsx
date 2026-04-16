"use client";

import { useState, useTransition, useRef } from "react";
import { createUserAccount } from "@/app/actions/admin";
import type { CreateUserResult } from "@/app/actions/admin";
import {
  UserPlus, X, Loader2, CheckCircle2,
  Eye, EyeOff, AlertCircle,
  User, Mail, Lock,
} from "lucide-react";

// ─── All non-admin roles ────────────────────────────────────────────────────────
const ALL_ROLES = [
  { value: "manager", label: "Manager",   color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)"  },
  { value: "sales",   label: "Comercial", color: "#D1FF48", bg: "rgba(209,255,72,0.1)",  border: "rgba(209,255,72,0.3)"  },
  { value: "client",  label: "Cliente",   color: "#00c0f3", bg: "rgba(0,192,243,0.1)",   border: "rgba(0,192,243,0.3)"   },
] as const;

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  /** The role of the currently logged-in user. Managers cannot create other managers. */
  callerRole: "admin" | "manager";
}

// ─── Shared input style helpers ───────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function CreateUserModal({ callerRole }: Props) {
  // Managers can only create Sales or Client accounts
  const ROLES = callerRole === "manager"
    ? ALL_ROLES.filter((r) => r.value !== "manager")
    : ALL_ROLES;

  const [open, setOpen]               = useState(false);
  const [showPwd, setShowPwd]         = useState(false);
  const [role, setRole]               = useState<string>(ROLES[ROLES.length - 1].value);
  const [result, setResult]           = useState<CreateUserResult | null>(null);
  const [isPending, startTransition]  = useTransition();
  const formRef                       = useRef<HTMLFormElement>(null);

  function handleOpen() {
    setResult(null);
    setRole(ROLES[ROLES.length - 1].value);
    setShowPwd(false);
    setOpen(true);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setTimeout(() => {
      formRef.current?.reset();
      setResult(null);
    }, 250);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    fd.set("role", role);

    startTransition(async () => {
      const res = await createUserAccount(fd);
      setResult(res);
      if (res.success) formRef.current?.reset();
    });
  }

  return (
    <>
      {/* ── Trigger button ──────────────────────────────────────────────── */}
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
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: "rgba(9,7,20,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(252,211,77,0.5), transparent)",
              }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-6 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(252,211,77,0.1)",
                    border: "1px solid rgba(252,211,77,0.2)",
                  }}
                >
                  <UserPlus size={15} style={{ color: "#fcd34d" }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">
                    Crear cuenta de usuario
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    Acceso inmediato al portal
                  </p>
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

            {/* Body */}
            <div className="px-6 py-5">

              {/* ── Success state ────────────────────────────────────────── */}
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: "rgba(34,197,94,0.12)" }}
                    />
                    <div
                      className="relative w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.25)",
                      }}
                    >
                      <CheckCircle2 size={26} className="text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base mb-1">
                      ¡Cuenta creada!
                    </p>
                    <p className="text-zinc-500 text-sm">
                      El usuario ya puede iniciar sesión.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setResult(null);
                      formRef.current?.reset();
                      setRole(ROLES[ROLES.length - 1].value);
                    }}
                    className="text-sm font-semibold transition-colors hover:text-white"
                    style={{ color: "#fcd34d" }}
                  >
                    Crear otro usuario →
                  </button>
                </div>
              ) : (

                /* ── Form ───────────────────────────────────────────────── */
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  {/* Full name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "rgba(255,255,255,0.22)" }}
                      />
                      <input
                        name="full_name"
                        type="text"
                        placeholder="Santiago Martínez"
                        required
                        className="w-full rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
                        style={inputBase}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
                        }
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "rgba(255,255,255,0.22)" }}
                      />
                      <input
                        name="email"
                        type="email"
                        placeholder="usuario@empresa.com"
                        required
                        className="w-full rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
                        style={inputBase}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
                        }
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">
                      Contraseña temporal
                    </label>
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
                        className="w-full rounded-xl pl-9 pr-11 py-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
                        style={inputBase}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Role selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">
                      Rol asignado
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

                  {/* Error */}
                  {result?.error && (
                    <div
                      className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      <AlertCircle
                        size={14}
                        className="text-red-400 mt-0.5 shrink-0"
                      />
                      <p className="text-red-400 text-xs leading-relaxed">
                        {result.error}
                      </p>
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
                        Creando cuenta...
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
