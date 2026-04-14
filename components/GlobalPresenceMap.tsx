"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import InteractiveMap from "./InteractiveMap";

const COUNTRIES = [
  { name: "México",    flag: "🇲🇽" },
  { name: "Colombia",  flag: "🇨🇴" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Ecuador",   flag: "🇪🇨" },
  { name: "Brasil",    flag: "🇧🇷" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "España",    flag: "🇪🇸" },
  { name: "Portugal",  flag: "🇵🇹" },
  { name: "Italia",    flag: "🇮🇹" },
  { name: "Malta",     flag: "🇲🇹" },
];

export default function GlobalPresenceMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-px h-8 bg-white/20" />
          <span className="text-xs tracking-[0.3em] text-white/30 uppercase">
            Presencia Global
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text + pills */}
          <div>
            <motion.h2
              className="text-4xl md:text-5xl text-white mb-3"
              style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
            >
              Operamos en{" "}
              <span style={{ color: "#00C0F3" }}>10 países</span>
            </motion.h2>

            <motion.p
              className="text-sm text-gray-300 mb-8 max-w-md leading-relaxed"
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              Desde LatAm hasta Europa, nuestros agentes hablan el idioma de
              tus clientes, entienden su cultura y generan resultados reales.
            </motion.p>

            {/* Country pills */}
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
              {COUNTRIES.map((c) => (
                <span
                  key={c.name}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {c.flag} {c.name}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — Interactive cobe globe */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="w-full rounded-2xl overflow-hidden"
              style={{
                maxWidth: 480,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 0 60px rgba(0,192,243,0.06)",
              }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00C0F3" }} />
                <span className="text-xs text-white/25 tracking-wider">Arrastra para girar</span>
              </div>
              <InteractiveMap />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
