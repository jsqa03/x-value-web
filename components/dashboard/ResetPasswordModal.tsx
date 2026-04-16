"use client";

import { useState, useTransition } from "react";
import { resetPassword } from "@/app/actions/admin";
import { KeyRound, X, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
}

export default function ResetPasswordModal({ userId, userName }: Props) {
  const [open, setOpen]             = useState(false);
  const [password, setPassword]     = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult]         = useState<{ success?: boolean; error?: string } | null>(null);

  function handleOpen() {
    setPassword("");
    setResult(null);
    setShowPwd(false);
    setOpen(true);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setTimeout(() => { setPassword(""); setResult(null); }, 250);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await resetPassword(userId, password);
      setResult(res);
    });
  }

  return (
    <>
      {/* ── Trigger ───────────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        title={`Reset password de ${userName}`}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:bg-amber-500/10"
        style={{ color: "rgba(251,191,36,0.7)", border: "1px solid rgba(251,191,36,0.2)" }}
      >
        <KeyRound size={11} />
        Reset
      </button>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
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
            className="w-full max-w-sm rounded-2xl overflow-hidden relative"
            style={{
              background: "rgba(9,7,20,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
            }}
          >
            {/* Accent line */}
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(251,191,36,0.5), transparent)",
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
                    background: "rgba(251,191,36,0.1)",
                    border: "1px solid rgba(251,191,36,0.2)",
                  }}
                >
                  <KeyRound size={14} style={{ color: "#fbbf24" }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">
                    Reset de contraseña
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5 truncate max-w-[180px]">
                    {userName}
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
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.25)",
                    }}
                  >
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Contraseña actualizada</p>
                    <p className="text-zinc-500 text-sm">
                      El usuario deberá usar la nueva contraseña en su próximo inicio de sesión.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        autoFocus
                        className="w-full rounded-xl pl-9 pr-11 py-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(251,191,36,0.4)")
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
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {result?.error && (
                    <div
                      className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs">{result.error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending || password.length < 6}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: "#fbbf24", color: "#000" }}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Actualizando…
                      </>
                    ) : (
                      <>
                        <KeyRound size={14} />
                        Confirmar reset
                      </>
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
