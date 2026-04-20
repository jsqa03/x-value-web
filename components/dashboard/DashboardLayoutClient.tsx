"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import Sidebar from "./Sidebar";
import type { Profile, Role } from "./types";

interface Props {
  sidebarProps: {
    profile: Profile;
    effectiveRole: Role;
    activeSection: string;
    isAdmin: boolean;
    currentView: string;
  };
  children: React.ReactNode;
}

function StatusBar() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      );
      setDate(
        now.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
          .toUpperCase()
      );
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="neural-status-bar select-none shrink-0 transform-gpu"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {/* Brand identifier */}
      <span style={{ color: "#333", letterSpacing: "0.15em" }}>X-VALUE OS</span>

      <div className="flex-1" />

      {/* System status indicators */}
      <div className="flex items-center gap-3">
        {/* IA Active */}
        <div className="flex items-center gap-1.5">
          <span
            className="agent-active dot inline-block w-[5px] h-[5px] rounded-full"
            style={{ background: "var(--neural-green)" }}
          />
          <span style={{ color: "#555" }}>IA Activa</span>
        </div>

        {/* System Active */}
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-[5px] h-[5px] rounded-full"
            style={{ background: "var(--neural-accent)", opacity: 0.8 }}
          />
          <span style={{ color: "#555" }}>Sistema Activo</span>
        </div>

        {/* Clock */}
        {time && (
          <span style={{ color: "#444", letterSpacing: "0.1em" }}>
            {date} · {time}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayoutClient({ sidebarProps, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /* Neural Grid canvas — grid bg + radial depth, GPU layers */
    <div className="neural-bg flex min-h-screen text-white">

      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 h-12 flex items-center px-4 gap-3 z-40 border-b"
        style={{
          background: "var(--neural-sidebar)",
          borderColor: "var(--neural-border)",
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-[3px] transition-colors"
          style={{ color: "var(--neural-text-2)" }}
          aria-label="Abrir menú"
        >
          <Menu size={16} />
        </button>
        <Image
          src="/logo.png"
          alt="X-Value"
          width={80}
          height={20}
          style={{ height: "16px", width: "auto" }}
          priority
        />
      </header>

      {/* ── Sidebar (self-contained with spacer div) ────────────────────── */}
      <Sidebar
        {...sidebarProps}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main column (status bar + page content) ─────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Status bar — desktop only */}
        <div className="hidden md:block">
          <StatusBar />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pt-12 md:pt-0 neural-fade">
          {children}
        </main>
      </div>
    </div>
  );
}
