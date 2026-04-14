"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface GrowthBannerProps {
  onCTA: () => void;
}

export default function GrowthBanner({ onCTA }: GrowthBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="relative rounded-3xl overflow-hidden px-8 py-12 md:px-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: "rgba(209,255,72,0.04)",
            border: "1px solid rgba(209,255,72,0.15)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Background accent */}
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(209,255,72,0.06)" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(0,192,243,0.04)" }}
          />

          {/* Left text */}
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: "#D1FF48" }} />
              <span
                className="text-xs tracking-[0.25em] uppercase font-medium"
                style={{ color: "#D1FF48" }}
              >
                Escala sin límites
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl text-white max-w-lg leading-tight"
              style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif",
              }}
            >
              X-VALUE IA TE AYUDA A ESCALAR{" "}
              <span style={{ color: "#D1FF48" }}>X10</span> MÁS RÁPIDO
            </h2>
            <p className="text-sm text-white/35 max-w-sm">
              Agentes de IA desplegados en 72h. Sin contratar, sin entrenar, sin
              esperar.
            </p>
          </div>

          {/* CTA button */}
          <div className="relative z-10 shrink-0">
            <motion.button
              onClick={onCTA}
              className="flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-sm tracking-wide text-black transition-all"
              style={{ background: "#D1FF48" }}
              whileHover={{ scale: 1.03, background: "#c8f53e" }}
              whileTap={{ scale: 0.97 }}
            >
              Agendar Consultoría Gratuita
              <ArrowRight size={16} />
            </motion.button>
            <p className="text-center text-xs text-white/20 mt-2.5">
              Sin tarjeta · Demo en 72 horas
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
