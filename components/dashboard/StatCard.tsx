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
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}
      >
        <Icon size={16} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
        {sub && <p className="text-xs mt-1" style={{ color: accent }}>{sub}</p>}
      </div>
    </div>
  );
}
