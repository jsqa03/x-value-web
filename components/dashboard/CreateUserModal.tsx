"use client";

import { useState, useTransition, useRef } from "react";
import { createUserAccount } from "@/app/actions/admin";
import type { CreateUserResult } from "@/app/actions/admin";
import {
  UserPlus,
  X,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

// ─── Role options (admin cannot be assigned from here) ─────────────────────────
const ROLES = [
  { value: "manager", label: "Manager",   color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)"  },
  { value: "sales",   label: "Comercial", color: "#D1FF48", bg: "rgba(209,255,72,0.1)",  border: "rgba(209,255,72,0.3)"  },
  { value: "client",  label: "Cliente",   color: "#00c0f3", bg: "rgba(0,192,243,0.1)",   border: "rgba(0,192,243,0.3)"   },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function CreateUserModal() {
  const [open, setOpen]           = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [role, setRole]           = useState<string>("client");
  const [result, setResult]       = useState<CreateUserResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleOpen() {
    setResult(null);
    setRole("client");
    setShowPwd(false);
    setOpen(true);
  }

  function handleClose() {
    if (isPending) return; // prevent close mid-submit
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
    fd.set("role", role); // inject selected role

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
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(252,211,77,0.3)]"
        style={{ background: "#fcd34d" }}
      >
        <UserPlus size={14} />
        Nuevo Usuario
      </button>

      {/* ── Modal overlay ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10,8,20,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-8 right-8 h-px"
              style={{ background: "linear-gradient(to right, transparent, rgba(252,211,77,0.5), transparent)" }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(252,211,77,0.1)", border: "1px solid rgba(252,211,77,0.2)" }}>
                  <UserPlus size={15} style={{ color: "#fcd34d" }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Crear cuenta de usuario</p>
                  <p className="text-white/30 text-xs mt-0.5">Acceso inmediato al portal</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="text-white/30 hover:text-white/70 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">

              {/* ── Success state ─────────────────────────────────────── */}
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: "rgba(34,197,94,0.15)" }} />
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                      <CheckCircle2 size={26} className="text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base mb-1">¡Cuenta creada!</p>
                    <p className="text-white/40 text-sm">
                      El usuario ya puede iniciar sesión en{" "}
                      <span className="text-white/60">xvalueaigrowth.com/login</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { setResult(null); formRef.current?.reset(); setRole("client"); }}
                    className="text-sm font-medium transition-colors"
                    style={{ color: "#fcd34d" }}
                  >
                    Crear otro usuario →
                  </button>
                </div>
              ) : (

                /* ── Form ─────────────────────────────────────────────── */
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Full name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/40 text-xs font-medium tracking-wide uppercase">
                      Nombre completo
                    </label>
                    <input
                      name="full_name"
                      type="text"
                      placeholder="Santiago Martínez"
                      required
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/40 text-xs font-medium tracking-wide uppercase">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="usuario@empresa.com"
                      required
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/40 text-xs font-medium tracking-wide uppercase">
                      Contraseña temporal
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(252,211,77,0.4)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                      >
                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Role selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/40 text-xs font-medium tracking-wide uppercase">
                      Rol asignado
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((r) => {
                        const active = role === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setRole(r.value)}
                            className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                              background: active ? r.bg : "rgba(255,255,255,0.04)",
                              border: `1px solid ${active ? r.border : "rgba(255,255,255,0.08)"}`,
                              color: active ? r.color : "rgba(255,255,255,0.35)",
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
                    <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs leading-relaxed">{result.error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 mt-1"
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

                  <p className="text-center text-white/20 text-xs">
                    El usuario recibirá acceso inmediato · Sin verificación por email
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
