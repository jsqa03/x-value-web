"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteExpense } from "@/app/actions/finance";

export default function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("¿Eliminar este gasto? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      await deleteExpense(expenseId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Eliminar gasto"
      className="flex items-center justify-center w-6 h-6 rounded-lg transition-colors hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color: "#ef4444" }}
    >
      {isPending
        ? <Loader2 size={11} className="animate-spin" />
        : <Trash2 size={11} />}
    </button>
  );
}
