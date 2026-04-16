"use client";

import { Search } from "lucide-react";

interface Props {
  placeholder?: string;
  accentColor?: string;
}

export default function SearchBar({
  placeholder = "Buscar…",
  accentColor = "rgba(252,211,77,0.35)",
}: Props) {
  return (
    <div className="relative max-w-sm w-full">
      <Search
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "rgba(255,255,255,0.25)" }}
      />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.7)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
        }
      />
    </div>
  );
}
