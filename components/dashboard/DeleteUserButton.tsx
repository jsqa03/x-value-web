"use client";

import { useState, useTransition } from "react";
import { deleteUserAccount } from "@/app/actions/admin";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";

interface Props { userId: string; userName: string }

export default function DeleteUserButton({ userId, userName }: Props) {
  const [confirming, setConfirming]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  function handleDeleteClick() { setError(null); setConfirming(true); }
  function handleCancel()      { setConfirming(false); setError(null); }

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteUserAccount(userId);
      if (result.error) { setError(result.error); setConfirming(false); }
    });
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
        <Loader2 size={12} className="animate-spin" />
        Eliminando…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-red-400 text-xs max-w-[160px] truncate">{error}</span>
        <button onClick={() => setError(null)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
          <X size={12} />
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-xs flex items-center gap-1">
          <AlertTriangle size={11} /> ¿Eliminar?
        </span>
        <button
          onClick={handleConfirm}
          className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Sí
        </button>
        <button
          onClick={handleCancel}
          className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDeleteClick}
      title={`Eliminar ${userName}`}
      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors group"
    >
      <Trash2 size={14} className="text-zinc-600 group-hover:text-red-400 transition-colors" />
    </button>
  );
}
