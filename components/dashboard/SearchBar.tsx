"use client";

import { Search } from "lucide-react";

interface Props {
  placeholder?: string;
}

export default function SearchBar({ placeholder = "Buscar…" }: Props) {
  return (
    <div className="relative max-w-sm w-full">
      <Search
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"
      />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors"
      />
    </div>
  );
}
