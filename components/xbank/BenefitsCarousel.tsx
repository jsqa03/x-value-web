"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import {
  CreditCard, BarChart3, Percent, RefreshCw, ShieldCheck,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const BENEFITS = [
  {
    icon: CreditCard,
    title: "Tarjetas Ilimitadas",
    desc: "Emite tarjetas físicas y virtuales para cada empleado o departamento con límites personalizados en un clic.",
    accent: "#f59e0b",
  },
  {
    icon: BarChart3,
    title: "Control Inteligente",
    desc: "Monitorea gastos en tiempo real, establece presupuestos y aprueba transacciones desde el dashboard.",
    accent: "#38bdf8",
  },
  {
    icon: Percent,
    title: "Cashback Premium",
    desc: "Gana hasta 2.5% de cashback en las categorías donde tu empresa más invierte: SaaS, anuncios y viajes.",
    accent: "#a78bfa",
  },
  {
    icon: RefreshCw,
    title: "Integración Contable",
    desc: "Sincronización automática de facturas y recibos con tu ERP para cerrar el mes sin estrés.",
    accent: "#34d399",
  },
  {
    icon: ShieldCheck,
    title: "Riesgo Cero",
    desc: "Crédito basado en los ingresos de la empresa. Sin afectar el score de crédito personal de los fundadores.",
    accent: "#fb923c",
  },
] as const;

export default function BenefitsCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-7">
      {/* Section header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-px h-7 rounded-full" style={{ background: "rgba(245,158,11,0.38)" }} />
          <span
            className="text-[10px] tracking-[0.28em] uppercase font-semibold"
            style={{ color: "rgba(245,158,11,0.55)" }}
          >
            Beneficios corporativos
          </span>
        </div>
        <h2
          className="text-white font-black leading-tight"
          style={{
            fontSize: "clamp(24px, 4vw, 40px)",
            fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif",
          }}
        >
          El control financiero en{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ea580c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            modo experto.
          </span>
        </h2>
      </div>

      {/* Carousel track */}
      <div data-carousel>
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
          }}
        >
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="group relative flex flex-col gap-5 snap-start shrink-0 rounded-2xl p-6 transition-colors duration-300"
                style={{
                  width: "clamp(256px, 72vw, 300px)",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  // Safari fix: force GPU compositing layer for backdrop-filter
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = `${b.accent}38`;
                  el.style.boxShadow = `0 0 24px ${b.accent}0d`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(255,255,255,0.07)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Hover glow blob — only rendered when not reduced motion */}
                {!prefersReducedMotion && (
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, ${b.accent}18, transparent 70%)`,
                      filter: "blur(12px)",
                      transform: "translateZ(0)",
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${b.accent}12`,
                    border: `1px solid ${b.accent}22`,
                  }}
                >
                  <Icon size={20} style={{ color: b.accent }} />
                </div>

                {/* Copy */}
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-white font-semibold text-[15px] leading-snug">{b.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {b.desc}
                  </p>
                </div>

                {/* Bottom accent stripe */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${b.accent}60, transparent)`,
                  }}
                />
              </div>
            );
          })}

          {/* Right padding sentinel */}
          <div className="shrink-0 w-2" aria-hidden />
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => carouselRef.current?.scrollBy({ left: -316, behavior: "smooth" })}
          aria-label="Anterior"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(245,158,11,0.1)";
            el.style.borderColor = "rgba(245,158,11,0.28)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(255,255,255,0.04)";
            el.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <ChevronLeft size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>

        <button
          onClick={() => carouselRef.current?.scrollBy({ left: 316, behavior: "smooth" })}
          aria-label="Siguiente"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(245,158,11,0.1)";
            el.style.borderColor = "rgba(245,158,11,0.28)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(255,255,255,0.04)";
            el.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5 ml-1">
          {BENEFITS.map((b, i) => (
            <button
              key={i}
              onClick={() => carouselRef.current?.scrollTo({ left: i * 316, behavior: "smooth" })}
              aria-label={b.title}
              className="rounded-full transition-all duration-300"
              style={{ width: 6, height: 6, background: "rgba(255,255,255,0.18)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "#f59e0b";
                el.style.width = "18px";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(255,255,255,0.18)";
                el.style.width = "6px";
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
