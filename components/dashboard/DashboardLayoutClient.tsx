"use client";

import { useState } from "react";
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

export default function DashboardLayoutClient({ sidebarProps, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-white bg-black">
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 gap-3 z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>
        <Image
          src="/logo.png"
          alt="X-Value"
          width={90}
          height={22}
          style={{ height: "18px", width: "auto" }}
          priority
        />
      </header>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        {...sidebarProps}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Mobile overlay backdrop ─────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-screen overflow-y-auto md:ml-60 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
