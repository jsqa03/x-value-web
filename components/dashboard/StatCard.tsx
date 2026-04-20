"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface TrendBadge {
  /** Positive = up, negative = down */
  delta: number;
  label?: string;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: LucideIcon;
  trend?: TrendBadge;
}

/* ── Parse a value string into animatable parts ─────────────────────────────
 * Handles: "24", "€12,500", "85%", "4.2K", "—"
 * Returns null for num when string is non-numeric (e.g. "—")
 */
function parseValue(raw: string): {
  num: number | null;
  prefix: string;
  suffix: string;
  decimals: number;
  useCommas: boolean;
} {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([^0-9]*)([0-9][0-9,\.]*[0-9]?)([^0-9]*)$/);
  if (!match) return { num: null, prefix: "", suffix: "", decimals: 0, useCommas: false };

  const rawNum  = match[2];
  const numStr  = rawNum.replace(/,/g, "");
  const num     = parseFloat(numStr);
  const decimals = numStr.includes(".") ? numStr.split(".")[1]?.length ?? 0 : 0;

  return {
    num:       isNaN(num) ? null : num,
    prefix:    match[1],
    suffix:    match[3],
    decimals,
    useCommas: rawNum.includes(","),
  };
}

function formatNum(n: number, decimals: number, useCommas: boolean): string {
  if (useCommas) {
    return n.toLocaleString("es-ES", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
}

/* ── Animated number display ─────────────────────────────────────────────── */
function AnimatedValue({ value, accent }: { value: string; accent: string }) {
  const parsed     = parseValue(value);
  const [display, setDisplay] = useState(
    parsed.num !== null ? `${parsed.prefix}0${parsed.suffix}` : value
  );
  const prevValue  = useRef<string>(value);

  useEffect(() => {
    if (parsed.num === null) {
      setDisplay(value);
      return;
    }

    /* Only re-animate when the value actually changes */
    if (prevValue.current === value && display !== `${parsed.prefix}0${parsed.suffix}`) return;
    prevValue.current = value;

    const controls = animate(0, parsed.num, {
      duration: 0.8,
      ease:     "easeOut",
      onUpdate: (v) =>
        setDisplay(
          `${parsed.prefix}${formatNum(v, parsed.decimals, parsed.useCommas)}${parsed.suffix}`
        ),
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span
      className="text-[28px] font-medium leading-none tabular-nums"
      style={{ fontFamily: "var(--font-mono)", color: "var(--neural-text)" }}
    >
      {display}
    </span>
  );
}

/* ── Trend badge ─────────────────────────────────────────────────────────── */
function TrendChip({ trend, accent }: { trend: TrendBadge; accent: string }) {
  const up    = trend.delta >= 0;
  const color = up ? "var(--neural-green)" : "var(--neural-red)";
  const arrow = up ? "↑" : "↓";
  const bg    = up ? "rgba(0,255,136,0.08)" : "rgba(255,68,68,0.08)";

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold"
      style={{
        fontFamily: "var(--font-mono)",
        background: bg,
        color,
        border: `1px solid ${color}33`,
        letterSpacing: "0.04em",
      }}
    >
      <span>{arrow}</span>
      <span>{Math.abs(trend.delta)}%</span>
      {trend.label && (
        <span style={{ color: "var(--neural-text-muted)", fontWeight: 400 }}>
          {trend.label}
        </span>
      )}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function StatCard({ label, value, sub, accent, icon: Icon, trend }: StatCardProps) {
  return (
    <div
      className="neural-kpi neural-mount flex flex-col gap-3 relative overflow-hidden"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      {/* Subtle top-glow matching border-top color */}
      <div
        className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${accent}12, transparent)`,
          transform: "translateZ(0)",
        }}
      />

      {/* Header: icon dot + label */}
      <div className="flex items-center gap-2 relative">
        <span
          className="w-[8px] h-[8px] rounded-full shrink-0"
          style={{ background: accent, opacity: 0.85 }}
        />
        <Icon
          size={12}
          style={{ color: accent, opacity: 0.6 }}
          className="shrink-0"
        />
        <span
          className="text-[10px] font-semibold uppercase truncate"
          style={{
            fontFamily:    "var(--font-ui)",
            color:         "var(--neural-text-2)",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
      </div>

      {/* Big number */}
      <AnimatedValue value={value} accent={accent} />

      {/* Sub-label + trend row */}
      <div className="flex items-center gap-2 flex-wrap">
        {sub && (
          <span
            className="text-[11px]"
            style={{
              fontFamily: "var(--font-ui)",
              color:      "var(--neural-text-muted)",
            }}
          >
            {sub}
          </span>
        )}
        {trend && <TrendChip trend={trend} accent={accent} />}
      </div>
    </div>
  );
}
