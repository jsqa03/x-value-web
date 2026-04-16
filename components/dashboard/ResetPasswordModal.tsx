"use client";

import { useState, useTransition } from "react";
import { resetPassword } from "@/app/actions/admin";
import { KeyRound, X, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";

interface Props { userId: string; userName: string }

export default function ResetPasswordModal({ userId, userName }: Props) {
  const [open, setOpen]              = useState(false);
  const [password, setPassword]      = useState("");
  const [showPwd, setShowPwd]        = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult]          = useState<{ success?: boolean; error?: string } | null>(null);

  function handleOpen()  { setPassword(""); setResult(null); setShowPwd(false); setOpen(true); }
  function handleClose() { if (isPending) return; setOpen(false); setTimeout(() => { setPassword(""); setResult(null); }, 250); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => { setResult(await resetPassword(userId, password)); });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title={`Reset password de ${userName}`}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
      >
        <KeyRound size={11} />
        Reset
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <KeyRound size={14} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Reset de contraseña</p>
                  <p className="text-zinc-500 text-xs mt-0.5 truncate max-w-[180px]">{userName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-900"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Contraseña actualizada</p>
                    <p className="text-zinc-500 text-sm">El usuario usará la nueva contraseña en su próximo inicio.</p>
                  </div>
                  <button onClick={handleClose} className="text-sm text-zinc-400 hover:text-white transition-colors">
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
                      <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        autoFocus
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
                  </div>

                  {result?.error && (
                    <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5">
                      <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs">{result.error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending || password.length < 6}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <><Loader2 size={14} className="animate-spin" /> Actualizando…</>
                    ) : (
                      <><KeyRound size={14} /> Confirmar reset</>
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
