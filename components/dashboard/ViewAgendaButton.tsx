"use client";

import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import TaskManager from "./TaskManager";

interface Props {
  userName: string;
}

export default function ViewAgendaButton({ userName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        title={`Ver agenda de ${userName}`}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/[0.06] hover:text-white/60"
        style={{
          color: "rgba(255,255,255,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <CalendarDays size={11} />
        Ver Agenda
      </button>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            background: "rgba(0,0,0,0.75)",
          }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden relative"
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
                  "linear-gradient(to right, transparent, rgba(209,255,72,0.4), transparent)",
              }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-6 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(209,255,72,0.08)",
                    border: "1px solid rgba(209,255,72,0.18)",
                  }}
                >
                  <CalendarDays size={13} style={{ color: "#D1FF48" }} />
                </div>
                <p className="text-white font-semibold text-sm">
                  Agenda de{" "}
                  <span style={{ color: "#D1FF48" }}>{userName}</span>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* TaskManager in read-only mode */}
            <div className="p-4">
              <TaskManager readOnly userName={userName} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
