"use client";

import { useState, useTransition } from "react";
import { deleteUserAccount } from "@/app/actions/admin";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
}

export default function DeleteUserButton({ userId, userName }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDeleteClick() {
    setError(null);
    setConfirming(true);
  }

  function handleCancel() {
    setConfirming(false);
    setError(null);
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteUserAccount(userId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      }
      // On success, revalidatePath re-renders the table — no local state update needed
    });
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-white/30">
        <Loader2 size={13} className="animate-spin" />
        Eliminando...
      </div>
    );
  }

  // ── Error state (inline) ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-red-400 text-xs max-w-[160px] truncate">{error}</span>
        <button
          onClick={() => setError(null)}
          className="text-white/25 hover:text-white/60 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  // ── Confirm state ────────────────────────────────────────────────────────────
  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-amber-400">
          <AlertTriangle size={12} />
          <span>¿Eliminar?</span>
        </div>
        <button
          onClick={handleConfirm}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          Sí
        </button>
        <button
          onClick={handleCancel}
          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          No
        </button>
      </div>
    );
  }

  // ── Default: trash icon ──────────────────────────────────────────────────────
  return (
    <button
      onClick={handleDeleteClick}
      title={`Eliminar ${userName}`}
      className="p-1.5 rounded-lg transition-all hover:bg-red-500/10 group"
    >
      <Trash2 size={14} className="text-white/20 group-hover:text-red-400 transition-colors" />
    </button>
  );
}
