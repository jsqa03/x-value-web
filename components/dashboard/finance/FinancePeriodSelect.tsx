"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const MONTHS = [
  { value: "0",  label: "Todo el año" },
  { value: "1",  label: "Enero"       },
  { value: "2",  label: "Febrero"     },
  { value: "3",  label: "Marzo"       },
  { value: "4",  label: "Abril"       },
  { value: "5",  label: "Mayo"        },
  { value: "6",  label: "Junio"       },
  { value: "7",  label: "Julio"       },
  { value: "8",  label: "Agosto"      },
  { value: "9",  label: "Septiembre"  },
  { value: "10", label: "Octubre"     },
  { value: "11", label: "Noviembre"   },
  { value: "12", label: "Diciembre"   },
] as const;

// Build year list: 2024 → current year
function getYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = 2024; y <= currentYear; y++) years.push(y);
  return years;
}

interface Props {
  year?: string;
  month?: string;
}

export default function FinancePeriodSelect({ year, month }: Props) {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const years       = getYears();

  function update(key: "year" | "month", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "0" && key === "month") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // If year is cleared, also clear month
    if (key === "year" && !value) params.delete("month");
    router.push(`/dashboard?${params.toString()}`);
  }

  const selectCls = "appearance-none bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-zinc-300 outline-none focus:border-orange-500/50 transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-2">
      {/* Year */}
      <div className="relative">
        <select
          value={year ?? ""}
          onChange={(e) => update("year", e.target.value)}
          className={selectCls}
        >
          <option value="" className="bg-zinc-950">Todo el histórico</option>
          {years.map((y) => (
            <option key={y} value={String(y)} className="bg-zinc-950">{y}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
      </div>

      {/* Month — only visible when a year is selected */}
      {year && (
        <div className="relative">
          <select
            value={month ?? "0"}
            onChange={(e) => update("month", e.target.value)}
            className={selectCls}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value} className="bg-zinc-950">{m.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
        </div>
      )}
    </div>
  );
}
