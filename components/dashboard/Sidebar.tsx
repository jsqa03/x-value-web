"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Database, Users, Settings,
  Target, Calendar, Bot, TrendingUp, DollarSign,
  LogOut, Eye, User, X, ClipboardList, type LucideIcon,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Profile, Role } from "./types";
import { ROLE_META } from "./types";

interface NavItem { id: string; label: string; icon: LucideIcon }

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { id: "overview",  label: "Resumen",          icon: LayoutDashboard },
    { id: "crm",       label: "CRM · Leads",       icon: Database        },
    { id: "team",      label: "Gestión de Equipo", icon: Users           },
    { id: "finanzas",  label: "Finanzas",          icon: DollarSign      },
    { id: "agenda",    label: "Mi Agenda",         icon: ClipboardList   },
    { id: "calendar",  label: "Calendario",        icon: Calendar        },
    { id: "settings",  label: "Configuración",     icon: Settings        },
    { id: "profile",   label: "Mi Perfil",         icon: User            },
  ],
  manager: [
    { id: "overview",   label: "Resumen",          icon: LayoutDashboard },
    { id: "crm",        label: "Leads del Equipo", icon: Database        },
    { id: "team",       label: "Mi Equipo",        icon: Users           },
    { id: "ganancias",  label: "Mis Ganancias",    icon: TrendingUp      },
    { id: "agenda",     label: "Mi Agenda",        icon: ClipboardList   },
    { id: "calendar",   label: "Calendario",       icon: Calendar        },
    { id: "profile",    label: "Mi Perfil",        icon: User            },
  ],
  sales: [
    { id: "leads",     label: "Mis Leads",      icon: Target        },
    { id: "ganancias", label: "Mis Ganancias",   icon: TrendingUp    },
    { id: "schedule",  label: "Mi Agenda",      icon: ClipboardList },
    { id: "calendar",  label: "Calendario",     icon: Calendar      },
    { id: "profile",   label: "Mi Perfil",      icon: User          },
  ],
  client: [
    { id: "agent",   label: "Mi Agente IA",  icon: Bot        },
    { id: "metrics", label: "ROI y Métricas", icon: TrendingUp },
    { id: "profile", label: "Mi Perfil",      icon: User       },
  ],
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

  return (
    <aside
      className={[
        "fixed top-0 left-0 h-full w-60 flex flex-col z-50",
        "bg-zinc-950 border-r border-zinc-800",
        "transition-transform duration-300 ease-in-out",
        // Mobile: controlled by isOpen; md+: always visible
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="px-5 h-[60px] flex items-center justify-between shrink-0 border-b border-zinc-800">
        <Image
          src="/logo.png"
          alt="X-Value"
          width={110}
          height={28}
          style={{ height: "22px", width: "auto" }}
          priority
        />
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          aria-label="Cerrar menú"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-colors relative group ${
                active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-orange-500" />
              )}
              <item.icon
                size={15}
                className={active ? "text-orange-400" : "text-zinc-600 group-hover:text-zinc-400 transition-colors"}
              />
              {item.label}
            </button>
          );
        })}

      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 flex flex-col gap-3 shrink-0 border-t border-zinc-800">
        {/* Role Simulator — admin only */}
        {isAdmin && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 px-1 mb-0.5">
              <Eye size={10} className="text-orange-500/60" />
              <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-zinc-600">
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
                    className="text-[10px] font-semibold px-2 py-1.5 rounded-md transition-colors text-center"
                    style={{
                      background: isActive ? meta.bg : "transparent",
                      color: isActive ? meta.color : "rgba(255,255,255,0.25)",
                      border: `1px solid ${isActive ? meta.border : "rgba(255,255,255,0.06)"}`,
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-2.5">
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
              style={{ background: `${roleMeta.color}15`, color: roleMeta.color, border: `1px solid ${roleMeta.color}25` }}
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
              style={{ background: roleMeta.bg, color: roleMeta.color, border: `1px solid ${roleMeta.border}` }}
            >
              {roleMeta.label}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50 transition-colors w-full group"
        >
          <LogOut size={13} className="shrink-0 group-hover:text-red-400/70 transition-colors" />
          <span className="text-xs">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
