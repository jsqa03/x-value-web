"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, ArrowRight } from "lucide-react";
export default function GatePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden bg-transparent">
      {/* Page-specific cinematic overlay — heavier bottom-left */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(3,1,18,0.6) 0%, rgba(3,1,18,0.1) 55%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Ambient cyan glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 65% 30%, rgba(0,192,243,0.07) 0%, transparent 55%)",
          zIndex: 1,
        }}
      />

      {/* ── Content layer ─────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col bg-transparent">

        {/* Glassmorphic nav */}
        <nav
          className="fixed top-0 left-0 right-0 z-40 border-b"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Image
              src="/logo.png"
              alt="x-value IA"
              width={130}
              height={32}
              style={{ height: "32px", width: "auto" }}
              priority
            />
            <motion.button
              onClick={() => router.push("/plataforma")}
              className="liquid-glass-strong flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg text-white transition-all"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Ver Demo
              <ArrowRight size={12} />
            </motion.button>
          </div>
        </nav>

        {/* Hero content — bottom-left on desktop, centered on mobile */}
        <div className="flex-1 flex items-end justify-center md:justify-start pt-16 pb-12 px-6 md:px-12">
          <div className="w-full max-w-[440px] flex flex-col items-center md:items-start text-center md:text-left">

            {/* Headline with ShinyText sweep */}
            <motion.h1
              className="text-5xl md:text-6xl leading-[1.05] mb-4"
              style={{
                fontFamily: "'Geist', var(--font-bebas), sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.025em",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="inline-block"
                style={{
                  background: "linear-gradient(120deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.55) 30%, #fff 50%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.55) 100%)",
                  backgroundSize: "250% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["100% 0%", "-100% 0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              >
                Tu IA, construida
              </motion.span>
              <br />
              <span style={{ color: "#00c0f3" }}>desde cero.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-sm md:text-base leading-relaxed mb-8 max-w-sm text-white/80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              No vendemos automatizaciones genéricas. Desarrollamos el software
              de inteligencia artificial de tu empresa desde la arquitectura
              hasta el deployment — entrenado en tus datos, diseñado para tus
              procesos.
            </motion.p>

            {/* CTA card → liquid-glass-strong */}
            <motion.div
              className="liquid-glass-strong rounded-2xl p-6 cursor-pointer w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => router.push("/plataforma")}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0,192,243,0.15)", border: "1px solid rgba(0,192,243,0.3)" }}
                >
                  <Building2 size={18} style={{ color: "#00c0f3" }} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium tracking-widest uppercase block mb-0.5" style={{ color: "#00c0f3" }}>
                    Empresas
                  </span>
                  <p className="text-white font-semibold text-sm leading-tight">
                    Custom AI Software Development
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(0,192,243,0.15)", color: "#00c0f3", border: "1px solid rgba(0,192,243,0.25)" }}>
                    +340% ROI
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    72h Demo
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-sm shrink-0" style={{ color: "#00c0f3" }}>
                  Ingresar
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>

            {/* Footnote */}
            <motion.p
              className="text-xs mt-4 text-white/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Plataforma B2B · Datos protegidos · Demos en 72 horas
            </motion.p>
          </div>
        </div>
      </div>
    </main>
  );
}
