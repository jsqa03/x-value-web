"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Database, Users, Settings,
  Target, Calendar, Bot, TrendingUp, DollarSign,
  LogOut, Eye, User, X, ClipboardList, ChevronLeft, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Profile, Role } from "./types";
import { ROLE_META } from "./types";

interface NavItem { id: string; label: string; icon: LucideIcon; group: "main" | "ops" | "system" }

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { id: "overview",  label: "Resumen",          icon: LayoutDashboard, group: "main"   },
    { id: "crm",       label: "CRM · Leads",       icon: Database,        group: "main"   },
    { id: "team",      label: "Equipo",            icon: Users,           group: "main"   },
    { id: "finanzas",  label: "Finanzas",          icon: DollarSign,      group: "ops"    },
    { id: "agenda",    label: "Mi Agenda",         icon: ClipboardList,   group: "ops"    },
    { id: "calendar",  label: "Calendario",        icon: Calendar,        group: "ops"    },
    { id: "settings",  label: "Config",            icon: Settings,        group: "system" },
    { id: "profile",   label: "Mi Perfil",         icon: User,            group: "system" },
  ],
  manager: [
    { id: "overview",   label: "Resumen",          icon: LayoutDashboard, group: "main"   },
    { id: "crm",        label: "Leads Equipo",     icon: Database,        group: "main"   },
    { id: "team",       label: "Mi Equipo",        icon: Users,           group: "main"   },
    { id: "ganancias",  label: "Ganancias",        icon: TrendingUp,      group: "ops"    },
    { id: "agenda",     label: "Mi Agenda",        icon: ClipboardList,   group: "ops"    },
    { id: "calendar",   label: "Calendario",       icon: Calendar,        group: "ops"    },
    { id: "profile",    label: "Mi Perfil",        icon: User,            group: "system" },
  ],
  sales: [
    { id: "leads",     label: "Mis Leads",         icon: Target,          group: "main"   },
    { id: "ganancias", label: "Ganancias",         icon: TrendingUp,      group: "ops"    },
    { id: "schedule",  label: "Mi Agenda",         icon: ClipboardList,   group: "ops"    },
    { id: "calendar",  label: "Calendario",        icon: Calendar,        group: "ops"    },
    { id: "profile",   label: "Mi Perfil",         icon: User,            group: "system" },
  ],
  client: [
    { id: "agent",   label: "Agente IA",           icon: Bot,             group: "main"   },
    { id: "metrics", label: "ROI · Métricas",      icon: TrendingUp,      group: "main"   },
    { id: "profile", label: "Mi Perfil",           icon: User,            group: "system" },
  ],
};

const GROUP_LABELS: Record<"main" | "ops" | "system", string> = {
  main:   "MAIN",
  ops:    "OPERACIONES",
  system: "SISTEMA",
};

const ROLE_VIEWS: { role: Role; label: string }[] = [
  { role: "admin",   label: "Admin"     },
  { role: "manager", label: "Manager"   },
  { role: "sales",   label: "Comercial" },
  { role: "client",  label: "Cliente"   },
];

interface Props {
  profile: Profile;
  effectiveRole: Role;
  activeSection: string;
  isAdmin: boolean;
  currentView: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  profile, effectiveRole, activeSection, isAdmin, currentView,
  isOpen = false, onClose,
}: Props) {
  const router    = useRouter();
  const navItems  = NAV[effectiveRole];
  const roleMeta  = ROLE_META[profile.role];
  const firstName = profile.full_name?.split(" ")[0] ?? "Usuario";

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  function navigate(section: string) {
    const params = new URLSearchParams();
    if (isAdmin && currentView !== "admin") params.set("view", currentView);
    params.set("section", section);
    router.push(`/dashboard?${params.toString()}`);
    onClose?.();
  }

  function simulate(role: Role) {
    if (role === "admin") {
      router.push("/dashboard?section=overview");
    } else {
      router.push(`/dashboard?view=${role}&section=${NAV[role][0].id}`);
    }
    onClose?.();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  /* Group nav items, deduplicate group headers */
  const groups = (["main", "ops", "system"] as const).map((g) => ({
    key: g,
    label: GROUP_LABELS[g],
    items: navItems.filter((i) => i.group === g),
  })).filter((g) => g.items.length > 0);

  const sidebarWidth = collapsed ? "w-9" : "w-40";
  const contentOffset = collapsed ? "md:ml-9" : "md:ml-40";

  return (
    <>
      <aside
        className={[
          "fixed top-0 left-0 h-full flex flex-col z-50",
          "transition-[width,transform] duration-200 ease-in-out",
          "transform-gpu",
          sidebarWidth,
          /* Neural Grid shell */
          "border-r",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
        style={{
          background: "var(--neural-sidebar)",
          borderColor: "var(--neural-border)",
        }}
      >
        {/* ── Logo / Brand area ──────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-2.5 h-[52px] shrink-0 border-b"
          style={{ borderColor: "var(--neural-border)" }}
        >
          {/* XV mark — always visible */}
          <div
            className="w-[22px] h-[22px] flex items-center justify-center shrink-0 rounded-sm"
            style={{ border: "1.5px solid var(--neural-cyan)" }}
          >
            <span
              className="text-[7px] font-bold tracking-wider"
              style={{ fontFamily: "var(--font-mono)", color: "var(--neural-cyan)" }}
            >
              XV
            </span>
          </div>
          {/* Logo image — hidden when collapsed */}
          {!collapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <Image
                src="/logo.png"
                alt="X-Value"
                width={88}
                height={20}
                style={{ height: "17px", width: "auto", opacity: 0.9 }}
                priority
              />
            </div>
          )}
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded shrink-0"
            style={{ color: "var(--neural-text-muted)" }}
            aria-label="Cerrar menú"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Collapse toggle — desktop only ─────────────────────────────── */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:flex absolute -right-3 top-[38px] w-6 h-6 items-center justify-center rounded-full z-10 transition-colors"
          style={{
            background: "var(--neural-surface)",
            border: "1px solid var(--neural-border)",
            color: "var(--neural-text-2)",
          }}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed
            ? <ChevronRight size={11} />
            : <ChevronLeft  size={11} />
          }
        </button>

        {/* ── Nav ────────────────────────────────────────────────────────── */}
        <nav className="flex-1 px-2 py-3 flex flex-col overflow-y-auto overflow-x-hidden hide-scrollbar">
          {groups.map(({ key, label, items }, gi) => (
            <div key={key} className={gi > 0 ? "mt-3" : ""}>
              {/* Group label */}
              {!collapsed && (
                <div
                  className="px-2 mb-1.5 text-[8px] font-semibold tracking-[0.16em]"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--neural-text-muted)" }}
                >
                  {label}
                </div>
              )}
              {collapsed && gi > 0 && (
                <div
                  className="mx-auto mb-2 h-px w-4"
                  style={{ background: "var(--neural-border)" }}
                />
              )}

              {items.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "group flex items-center w-full rounded-[3px] transition-all duration-150",
                      "text-left relative overflow-hidden",
                      collapsed ? "justify-center h-8 mb-0.5" : "gap-2.5 px-2 h-8 mb-0.5",
                    ].join(" ")}
                    style={{
                      background: active
                        ? "rgba(0,212,255,0.06)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(249,115,22,0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                      }
                    }}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                        style={{ background: "var(--neural-cyan)" }}
                      />
                    )}

                    <item.icon
                      size={13}
                      className="shrink-0 transition-colors duration-150"
                      style={{
                        color: active
                          ? "var(--neural-cyan)"
                          : "var(--neural-text-muted)",
                      }}
                    />

                    {!collapsed && (
                      <span
                        className="text-[11px] font-medium truncate transition-colors duration-150"
                        style={{
                          fontFamily: "var(--font-ui)",
                          color: active
                            ? "var(--neural-cyan)"
                            : "var(--neural-text-2)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Bottom section ──────────────────────────────────────────────── */}
        <div
          className="px-2 pb-3 pt-2 flex flex-col gap-2 shrink-0 border-t"
          style={{ borderColor: "var(--neural-border)" }}
        >
          {/* Role Simulator — admin only, hidden when collapsed */}
          {isAdmin && !collapsed && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 px-1 mb-0.5">
                <Eye size={9} style={{ color: "var(--neural-accent)", opacity: 0.6 }} />
                <span
                  className="text-[8px] font-semibold tracking-[0.16em] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--neural-text-muted)" }}
                >
                  Simular rol
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {ROLE_VIEWS.map(({ role, label }) => {
                  const meta = ROLE_META[role];
                  const isActive =
                    currentView === role ||
                    (role === "admin" && (!currentView || currentView === "admin"));
                  return (
                    <button
                      key={role}
                      onClick={() => simulate(role)}
                      className="text-[9px] font-semibold px-1.5 py-1 rounded-[3px] transition-colors text-center"
                      style={{
                        fontFamily: "var(--font-ui)",
                        background: isActive ? meta.bg : "transparent",
                        color: isActive ? meta.color : "rgba(255,255,255,0.2)",
                        border: `1px solid ${isActive ? meta.border : "rgba(255,255,255,0.05)"}`,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profile card */}
          <div
            className="rounded-[3px] p-2 flex items-center gap-2"
            style={{
              background: "var(--neural-surface)",
              border: "1px solid var(--neural-border)",
            }}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? "Avatar"}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{
                  background: `${roleMeta.color}15`,
                  color: roleMeta.color,
                  border: `1px solid ${roleMeta.color}25`,
                }}
              >
                {firstName[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] font-semibold truncate leading-none mb-0.5"
                  style={{ fontFamily: "var(--font-ui)", color: "var(--neural-text)" }}
                >
                  {profile.full_name ?? "Usuario"}
                </p>
                <span
                  className="text-[8px] font-bold px-1 py-0.5 rounded-[2px]"
                  style={{
                    background: roleMeta.bg,
                    color: roleMeta.color,
                    border: `1px solid ${roleMeta.border}`,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {roleMeta.label}
                </span>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
            className={[
              "flex items-center rounded-[3px] transition-colors w-full group",
              collapsed ? "justify-center h-7" : "gap-2 px-2 py-1.5",
            ].join(" ")}
            style={{ color: "var(--neural-text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#ff4444";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,68,68,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--neural-text-muted)";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <LogOut size={12} className="shrink-0" />
            {!collapsed && (
              <span
                className="text-[11px]"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                Cerrar sesión
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Spacer div so sibling components know the sidebar width ───────── */}
      <div
        className={[
          "hidden md:block shrink-0 transition-[width] duration-200",
          sidebarWidth,
        ].join(" ")}
        aria-hidden
      />
    </>
  );
}
