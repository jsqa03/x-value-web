"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Database,
  Users,
  Settings,
  Target,
  Calendar,
  Bot,
  TrendingUp,
  LogOut,
  Eye,
  User,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Profile, Role } from "./types";
import { ROLE_META } from "./types";

// ─── Nav items per role ────────────────────────────────────────────────────────
interface NavItem { id: string; label: string; icon: LucideIcon }

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { id: "overview", label: "Resumen",          icon: LayoutDashboard },
    { id: "crm",      label: "CRM · Leads",       icon: Database        },
    { id: "team",     label: "Gestión de Equipo", icon: Users           },
    { id: "settings", label: "Configuración",     icon: Settings        },
    { id: "profile",  label: "Mi Perfil",         icon: User            },
  ],
  manager: [
    { id: "overview", label: "Resumen",            icon: LayoutDashboard },
    { id: "crm",      label: "Leads del Equipo",   icon: Database        },
    { id: "team",     label: "Mi Equipo",          icon: Users           },
    { id: "profile",  label: "Mi Perfil",          icon: User            },
  ],
  sales: [
    { id: "leads",    label: "Mis Leads",          icon: Target          },
    { id: "schedule", label: "Mi Agenda",          icon: Calendar        },
    { id: "profile",  label: "Mi Perfil",          icon: User            },
  ],
  client: [
    { id: "agent",   label: "Mi Agente IA",        icon: Bot             },
    { id: "metrics", label: "ROI y Métricas",      icon: TrendingUp      },
    { id: "profile", label: "Mi Perfil",           icon: User            },
  ],
};

const ROLE_VIEWS: { role: Role; label: string }[] = [
  { role: "admin",   label: "Admin"     },
  { role: "manager", label: "Manager"   },
  { role: "sales",   label: "Comercial" },
  { role: "client",  label: "Cliente"   },
];

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  profile: Profile;
  effectiveRole: Role;
  activeSection: string;
  isAdmin: boolean;
  currentView: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Sidebar({
  profile,
  effectiveRole,
  activeSection,
  isAdmin,
  currentView,
}: Props) {
  const router = useRouter();
  const navItems = NAV[effectiveRole];
  const roleMeta = ROLE_META[profile.role];
  const accentColor = ROLE_META[effectiveRole].color;
  const firstName = profile.full_name?.split(" ")[0] ?? "Usuario";

  function navigate(section: string) {
    const params = new URLSearchParams();
    if (isAdmin && currentView !== "admin") params.set("view", currentView);
    params.set("section", section);
    router.push(`/dashboard?${params.toString()}`);
  }

  function simulate(role: Role) {
    const defaultSection = NAV[role][0].id;
    if (role === "admin") {
      router.push("/dashboard?section=overview");
    } else {
      router.push(`/dashboard?view=${role}&section=${defaultSection}`);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full w-60 flex flex-col z-30 select-none"
      style={{
        background: "#05010d",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div
        className="px-5 h-[60px] flex items-center shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Image
          src="/logo.png"
          alt="X-Value"
          width={110}
          height={28}
          style={{ height: "24px", width: "auto" }}
          priority
        />
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              title={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left w-full transition-all group relative"
              style={{
                background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.38)",
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: accentColor }}
                />
              )}
              <item.icon
                size={16}
                className="shrink-0 transition-colors"
                style={{ color: isActive ? accentColor : "rgba(255,255,255,0.22)" }}
              />
              <span className="group-hover:text-white/70 transition-colors">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Bottom ────────────────────────────────────────────────────────── */}
      <div
        className="px-3 pb-4 pt-3 flex flex-col gap-3 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Role Simulator — admin only */}
        {isAdmin && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 px-1 mb-0.5">
              <Eye size={10} style={{ color: "rgba(252,211,77,0.6)" }} />
              <span
                className="text-[9px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Simular rol
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {ROLE_VIEWS.map(({ role, label }) => {
                const meta = ROLE_META[role];
                const isActiveView =
                  currentView === role ||
                  (role === "admin" && (!currentView || currentView === "admin"));
                return (
                  <button
                    key={role}
                    onClick={() => simulate(role)}
                    className="text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-all text-center"
                    style={{
                      background: isActiveView ? meta.bg : "rgba(255,255,255,0.03)",
                      color: isActiveView ? meta.color : "rgba(255,255,255,0.22)",
                      border: `1px solid ${isActiveView ? meta.border : "rgba(255,255,255,0.06)"}`,
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
          className="rounded-xl p-3 flex items-center gap-2.5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "Avatar"}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: `${roleMeta.color}15`,
                color: roleMeta.color,
                border: `1px solid ${roleMeta.color}25`,
              }}
            >
              {firstName[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate leading-none mb-1">
              {profile.full_name ?? "Usuario"}
            </p>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: roleMeta.bg,
                color: roleMeta.color,
                border: `1px solid ${roleMeta.border}`,
              }}
            >
              {roleMeta.label}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/[0.04] group w-full"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          <LogOut
            size={13}
            className="shrink-0 transition-colors group-hover:text-red-400/70"
          />
          <span className="text-xs transition-colors group-hover:text-white/50">
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
