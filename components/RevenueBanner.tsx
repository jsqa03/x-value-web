"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import RevenueAnimated from "./RevenueAnimated";

export default function RevenueBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <section ref={ref} className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-16" />

        <div className="flex flex-col items-center text-center gap-4">
          {/* Animated number */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.35em] text-white/30 uppercase mb-3">
              Resultado acumulado
            </p>
            <h2
              className="text-[clamp(4rem,12vw,10rem)] leading-none tracking-tight text-white"
              style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
            >
              <span style={{ color: "#D1FF48" }}>
                <RevenueAnimated />
              </span>{" "}
              <span className="text-white/35">USD</span>
            </h2>
          </motion.div>

          <motion.p
            className="text-base md:text-lg text-gray-300 max-w-md leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Revenue generado para nuestros clientes{" "}
            <span className="text-white/70">en tiempo récord</span>
          </motion.p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mt-16" />
      </div>
    </section>
  );
}
