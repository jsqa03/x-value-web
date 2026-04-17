"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTask } from "@/app/actions/tasks";

export default function TaskDeleteButton({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("¿Eliminar esta tarea?")) return;
    startTransition(async () => {
      await deleteTask(taskId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Eliminar tarea"
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/10 shrink-0 disabled:opacity-50"
    >
      {isPending
        ? <Loader2 size={11} className="animate-spin text-zinc-500" />
        : <Trash2 size={11} className="text-zinc-600 hover:text-red-400 transition-colors" />}
    </button>
  );
}
