"use client";

import { useTransition } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { completeTask, reopenTask } from "@/app/actions/tasks";

export default function TaskCompleteButton({
  taskId,
  isDone,
}: {
  taskId: string;
  isDone: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (isDone) {
        await reopenTask(taskId);
      } else {
        await completeTask(taskId);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isDone ? "Marcar como pendiente" : "Marcar como completada"}
      className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
      style={{
        background:  isDone ? "rgba(34,197,94,0.12)" : "transparent",
        borderColor: isDone ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.15)",
      }}
    >
      {isPending
        ? <Loader2 size={10} className="animate-spin text-zinc-500" />
        : isDone
          ? <Check size={10} className="text-emerald-400" />
          : <RotateCcw size={9} className="text-zinc-600 opacity-0 group-hover:opacity-100" />}
    </button>
  );
}
