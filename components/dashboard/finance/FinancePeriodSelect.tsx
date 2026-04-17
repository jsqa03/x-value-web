"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const PERIODS = [
  { value: "all",      label: "Histórico Total" },
  { value: "month",    label: "Este Mes" },
  { value: "bimester", label: "Este Bimestre" },
  { value: "quarter",  label: "Este Trimestre" },
  { value: "semester", label: "Este Semestre" },
  { value: "year",     label: "Este Año" },
] as const;

export default function FinancePeriodSelect({ current }: { current?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", e.target.value);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="relative">
      <select
        value={current ?? "all"}
        onChange={handleChange}
        className="appearance-none bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-zinc-300 outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value} className="bg-zinc-950">
            {p.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
    </div>
  );
}
