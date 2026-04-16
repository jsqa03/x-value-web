import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: LucideIcon;
}

export default function StatCard({ label, value, sub, accent, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}
      >
        <Icon size={15} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-white tracking-tight">{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{label}</p>
        {sub && (
          <p className="text-[11px] mt-1.5 font-medium" style={{ color: accent }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
