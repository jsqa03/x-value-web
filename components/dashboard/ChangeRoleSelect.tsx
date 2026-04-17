"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { changeUserRole } from "@/app/actions/admin";
import { ROLE_META } from "./types";
import type { Role } from "./types";

const ALL_ROLES: Role[] = ["admin", "manager", "sales", "client"];

const ROLE_LABELS: Record<Role, string> = {
  admin:   "CEO / Admin",
  manager: "Manager",
  sales:   "Comercial",
  client:  "Cliente",
};

interface Props {
  userId: string;
  currentRole: Role;
  canAssignAdmin: boolean;
}

export default function ChangeRoleSelect({ userId, currentRole, canAssignAdmin }: Props) {
  const [role, setRole]           = useState<Role>(currentRole);
  const [isPending, startTransition] = useTransition();
  const [error, setError]         = useState<string | null>(null);

  const availableRoles = ALL_ROLES.filter((r) => r !== "admin" || canAssignAdmin);
  const meta = ROLE_META[role] ?? ROLE_META.client;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    const prev = role;
    setRole(newRole);
    setError(null);
    startTransition(async () => {
      const res = await changeUserRole(userId, newRole);
      if (res.error) {
        setRole(prev); // revert
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <select
          value={role}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none pl-2.5 pr-7 py-1 rounded-full text-[11px] font-semibold outline-none cursor-pointer transition-all disabled:opacity-60"
          style={{
            background: meta.bg,
            border: `1px solid ${meta.border}`,
            color: meta.color,
          }}
        >
          {availableRoles.map((r) => (
            <option key={r} value={r} className="bg-zinc-950 text-white">
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {isPending
          ? <Loader2 size={9} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none animate-spin" style={{ color: meta.color }} />
          : <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: meta.color }} />}
      </div>
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
    </div>
  );
}
