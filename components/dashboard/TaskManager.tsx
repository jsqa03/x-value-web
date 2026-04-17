"use client";

import { useState } from "react";
import { Plus, Check, Trash2, ClipboardList } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  text: string;
  done: boolean;
}

// Mock data removed — use AgendaView + tasks table instead

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  /** When true, hides the add/delete controls — used in manager read-only modals. */
  readOnly?: boolean;
  /** Shown in the header when rendering inside a modal (manager view). */
  userName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TaskManager({ readOnly = false, userName }: Props) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [input, setInput]   = useState("");

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [
      { id: Date.now().toString(), text, done: false },
      ...prev,
    ]);
    setInput("");
  }

  function toggleTask(id: string) {
    if (readOnly) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const pending = tasks.filter((t) => !t.done).length;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <ClipboardList size={14} style={{ color: "#D1FF48" }} />
          <p className="text-zinc-400 text-sm font-medium">
            {userName ? `Agenda · ${userName}` : "Mis Tareas"}
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{
            background: "rgba(209,255,72,0.08)",
            color: "#D1FF48",
            border: "1px solid rgba(209,255,72,0.2)",
          }}
        >
          {pending} pendiente{pending !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Add task input ───────────────────────────────────────────────── */}
      {!readOnly && (
        <div
          className="px-5 py-3 flex gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Nueva tarea… (Enter para agregar)"
            className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(209,255,72,0.35)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
            }
          />
          <button
            onClick={addTask}
            disabled={!input.trim()}
            title="Agregar tarea"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
            style={{ background: "#D1FF48" }}
          >
            <Plus size={15} className="text-black" />
          </button>
        </div>
      )}

      {/* ── Task list ────────────────────────────────────────────────────── */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <ClipboardList size={24} className="text-white/10" />
          <p className="text-zinc-600 text-sm">Sin tareas pendientes</p>
          {!readOnly && (
            <p className="text-zinc-700 text-xs">
              Usa el campo de arriba para agregar una
            </p>
          )}
        </div>
      ) : (
        <div
          className="divide-y"
          style={{ borderColor: "rgba(255,255,255,0.04)" }}
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-5 py-3.5 group hover:bg-white/[0.02] transition-colors"
            >
              {/* Circle checkbox */}
              <button
                onClick={() => toggleTask(task.id)}
                disabled={readOnly}
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  readOnly
                    ? "cursor-default"
                    : "hover:scale-110 active:scale-95"
                }`}
                style={{
                  background: task.done
                    ? "rgba(34,197,94,0.12)"
                    : "transparent",
                  borderColor: task.done
                    ? "rgba(34,197,94,0.45)"
                    : "rgba(255,255,255,0.15)",
                }}
              >
                {task.done && (
                  <Check size={11} className="text-emerald-400" />
                )}
              </button>

              {/* Task text */}
              <p
                className={`flex-1 text-sm leading-snug transition-colors ${
                  task.done
                    ? "line-through text-zinc-600"
                    : "text-zinc-200"
                }`}
              >
                {task.text}
              </p>

              {/* Delete button — only in edit mode, visible on row hover */}
              {!readOnly && (
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/10 shrink-0"
                  title="Eliminar tarea"
                >
                  <Trash2
                    size={12}
                    className="text-zinc-700 hover:text-red-400 transition-colors"
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
