"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X } from "lucide-react";

const ROWS = [
  {
    feature: "Seguimiento a leads",
    xvalue: "24/7 sin interrupción",
    human: "Horario laboral",
    xvalueGood: true,
    humanGood: false,
  },
  {
    feature: "Tiempo de respuesta",
    xvalue: "< 2 segundos",
    human: "Depende disponibilidad",
    xvalueGood: true,
    humanGood: false,
  },
  {
    feature: "Costos operativos",
    xvalue: "Bajo y predecible",
    human: "Salario + capacitación",
    xvalueGood: true,
    humanGood: false,
  },
  {
    feature: "Escalabilidad",
    xvalue: "Instantánea",
    human: "Proceso de contratación",
    xvalueGood: true,
    humanGood: false,
  },
  {
    feature: "Consistencia",
    xvalue: "100% uniforme",
    human: "Variable según el día",
    xvalueGood: true,
    humanGood: false,
  },
  {
    feature: "Reportes en tiempo real",
    xvalue: "Dashboard completo",
    human: "Manual / estimado",
    xvalueGood: true,
    humanGood: false,
  },
];

export default function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, x: -10 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="w-px h-8 bg-white/20" />
          <span className="text-xs tracking-[0.3em] text-white/30 uppercase">
            Comparativa
          </span>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl text-white mb-10"
          style={{
            fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.05 }}
        >
          x-value IA vs{" "}
          <span className="text-white/30">Contratar Personal</span>
        </motion.h2>

        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-3 px-3 py-3 md:px-6 md:py-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="text-[10px] md:text-xs text-white/25 uppercase tracking-widest">
              Capacidad
            </span>
            <span
              className="text-[10px] md:text-xs uppercase tracking-widest font-semibold"
              style={{ color: "#00c0f3" }}
            >
              x-value IA
            </span>
            <span className="text-[10px] md:text-xs text-white/25 uppercase tracking-widest">
              Personal Humano
            </span>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 px-3 py-3 md:px-6 md:py-4 transition-colors hover:bg-white/[0.02]"
              style={{
                borderBottom:
                  i < ROWS.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
              }}
            >
              <span className="text-xs md:text-sm text-white/50 self-center pr-2">
                {row.feature}
              </span>

              {/* x-value */}
              <div className="flex items-center gap-1.5 md:gap-2 pr-2">
                <div
                  className="w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0,192,243,0.12)" }}
                >
                  <Check size={9} style={{ color: "#00c0f3" }} />
                </div>
                <span className="text-xs md:text-sm text-white/80 leading-tight">{row.xvalue}</span>
              </div>

              {/* Human */}
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0 bg-white/5">
                  <X size={9} className="text-white/25" />
                </div>
                <span className="text-xs md:text-sm text-white/30 leading-tight">{row.human}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
