"use client";

import { Lock } from "lucide-react";

interface Bullet {
  label: string;
  count: number;
}

interface Props {
  bullets: Bullet[];
}

export default function ExclusivityPanel({ bullets }: Props) {
  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background:
          "linear-gradient(130deg, rgba(245,158,11,0.055) 0%, rgba(16,14,10,0.92) 55%, rgba(234,88,12,0.035) 100%)",
        border: "1px solid rgba(245,158,11,0.16)",
        boxShadow: "0 0 60px rgba(245,158,11,0.04)",
      }}
    >
      {/* Corner glows — GPU-composited */}
      <div
        className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: "rgba(245,158,11,0.07)",
          filter: "blur(48px)",
          transform: "translateZ(0)",
        }}
      />
      <div
        className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full pointer-events-none"
        style={{
          background: "rgba(234,88,12,0.055)",
          filter: "blur(40px)",
          transform: "translateZ(0)",
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 px-8 py-10 sm:px-12 sm:py-12">
        {/* Icon block */}
        <div
          className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.18)",
            boxShadow: "0 0 24px rgba(245,158,11,0.07)",
          }}
        >
          <Lock size={26} style={{ color: "#f59e0b" }} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <span
            className="inline-flex self-center sm:self-start items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.22em] uppercase"
            style={{
              background: "rgba(245,158,11,0.09)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#e8a60a",
            }}
          >
            Acceso Prioritario
          </span>

          <h3
            className="font-bold text-white leading-snug"
            style={{ fontSize: "clamp(18px, 3vw, 27px)" }}
          >
            Exclusivo para clientes activos de X-Value.
          </h3>

          <p
            className="text-sm leading-relaxed max-w-lg"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            X-Bank estará disponible exclusivamente para empresas que ya tienen
            un contrato activo con X-Value. Nuestros clientes son nuestra única
            prioridad.
          </p>

          {/* Real stats bullets */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 mt-0.5">
            {bullets.map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-2 text-xs"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: "#f59e0b" }}
                />
                {b.count > 0 && (
                  <strong style={{ color: "#f59e0b" }}>{b.count}</strong>
                )}
                <span>{b.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
