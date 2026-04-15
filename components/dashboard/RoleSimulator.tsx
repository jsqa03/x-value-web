"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import type { Role } from "./types";
import { ROLE_META } from "./types";

interface Props {
  currentView: string;
}

const VIEWS: { role: Role; label: string }[] = [
  { role: "admin",   label: "CEO / Admin" },
  { role: "manager", label: "Manager"     },
  { role: "sales",   label: "Comercial"   },
  { role: "client",  label: "Cliente"     },
];

export default function RoleSimulator({ currentView }: Props) {
  const router = useRouter();

  function simulate(role: Role) {
    if (role === "admin") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard?view=${role}`);
    }
  }

  return (
    <div className="mb-8 rounded-2xl p-4"
      style={{ background: "rgba(252,211,77,0.04)", border: "1px solid rgba(252,211,77,0.12)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Eye size={13} style={{ color: "#fcd34d" }} />
        <p className="text-xs text-white/40 font-medium tracking-wide">Simular vista de rol</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {VIEWS.map(({ role, label }) => {
          const meta = ROLE_META[role];
          const isActive = currentView === role || (role === "admin" && !currentView);
          return (
            <button
              key={role}
              onClick={() => simulate(role)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: isActive ? meta.bg : "rgba(255,255,255,0.04)",
                color: isActive ? meta.color : "rgba(255,255,255,0.35)",
                border: `1px solid ${isActive ? meta.border : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
