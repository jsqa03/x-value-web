"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2, CheckCircle2, AlertCircle, Calendar, FileText, User, ClipboardList, ChevronDown } from "lucide-react";
import { createTask } from "@/app/actions/tasks";
import type { ActionResult } from "@/app/actions/admin";

interface AssignableUser { id: string; full_name: string | null; email: string }

interface Props {
  defaultAssigneeId: string;
  assignableUsers?: AssignableUser[]; // provided for admin only
}

const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors";

function Field({ label, icon: Icon, required: req, children }: {
  label: string; icon: React.ElementType; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
        <Icon size={10} className="text-zinc-600" />
        {label}
        {req && <span className="text-orange-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function CreateTaskModal({ defaultAssigneeId, assignableUsers }: Props) {
  const [open, setOpen]              = useState(false);
  const [result, setResult]          = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isAdmin = Boolean(assignableUsers && assignableUsers.length > 0);

  function handleOpen()  { setResult(null); setOpen(true); }
  function handleClose() { if (isPending) return; setOpen(false); setTimeout(() => setResult(null), 250); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    if (!isAdmin) fd.set("assigned_to", defaultAssigneeId);
    startTransition(async () => {
      const res = await createTask(fd);
      setResult(res);
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors"
        style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}
      >
        <Plus size={12} />
        Nueva Tarea
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <ClipboardList size={14} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Nueva Tarea</p>
                  <p className="text-zinc-600 text-xs mt-0.5">Agregar a la agenda</p>
                </div>
              </div>
              <button onClick={handleClose} disabled={isPending}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-900">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {result?.success ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={26} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base mb-1">¡Tarea creada!</p>
                    <p className="text-zinc-500 text-sm">Aparecerá en la agenda correspondiente.</p>
                  </div>
                  <button onClick={handleClose} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Title */}
                  <Field label="Título" icon={ClipboardList} required>
                    <div className="relative">
                      <ClipboardList size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input name="title" type="text" placeholder="Ej. Llamar al cliente A…" required className={inputCls} />
                    </div>
                  </Field>

                  {/* Description */}
                  <Field label="Descripción (opcional)" icon={FileText}>
                    <textarea name="description" rows={2}
                      placeholder="Detalle de la tarea…"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 resize-none transition-colors" />
                  </Field>

                  {/* Due date */}
                  <Field label="Fecha de vencimiento" icon={Calendar} required>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                      <input name="due_date" type="date" required className={`${inputCls} [color-scheme:dark]`} />
                    </div>
                  </Field>

                  {/* Assignee — admin only */}
                  {isAdmin && assignableUsers && (
                    <Field label="Asignar a" icon={User} required>
                      <div className="relative">
                        <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                        <select name="assigned_to" defaultValue={defaultAssigneeId} required
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors appearance-none">
                          {assignableUsers.map((u) => (
                            <option key={u.id} value={u.id} className="bg-zinc-950">
                              {u.full_name ?? u.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>
                  )}

                  {result?.error && (
                    <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-400 text-xs">{result.error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                    {isPending
                      ? <><Loader2 size={15} className="animate-spin" /> Guardando…</>
                      : <><Plus size={14} /> Crear Tarea</>}
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
