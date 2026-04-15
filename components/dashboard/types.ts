export type Role = "admin" | "manager" | "sales" | "client";

export interface Profile {
  role: Role;
  full_name: string | null;
}

export const ROLE_META: Record<Role, { label: string; color: string; bg: string; border: string }> = {
  admin:   { label: "CEO / Admin",   color: "#fcd34d", bg: "rgba(252,211,77,0.08)",  border: "rgba(252,211,77,0.2)"  },
  manager: { label: "Manager",       color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)" },
  sales:   { label: "Comercial",     color: "#D1FF48", bg: "rgba(209,255,72,0.08)", border: "rgba(209,255,72,0.2)" },
  client:  { label: "Cliente",       color: "#00c0f3", bg: "rgba(0,192,243,0.08)",  border: "rgba(0,192,243,0.2)"  },
};
