"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, ArrowRight } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";

export default function GatePage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "hsl(260 87% 3%)" }}
    >
      {/* Full-screen video with rAF fade loop */}
      <VideoBackground />

      {/* Cinematic overlay — heavier at bottom-left where content lives */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(3,1,18,0.85) 0%, rgba(3,1,18,0.35) 55%, rgba(3,1,18,0.1) 100%)",
          zIndex: 1,
        }}
      />

      {/* Ambient cyan glow — upper-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 65% 35%, rgba(0,192,243,0.07) 0%, transparent 55%)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative min-h-screen flex flex-col" style={{ zIndex: 2 }}>

        {/* Logo — top-left */}
        <motion.div
          className="p-8 md:p-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/logo.png"
            alt="x-value IA"
            width={140}
            height={36}
            style={{ height: "36px", width: "auto" }}
            priority
          />
        </motion.div>

        {/* Main content — pushed to bottom-left */}
        <div className="flex-1 flex items-end pb-14 px-8 md:px-12">
          <div className="w-full max-w-[420px]">

            {/* Category badge */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{
                background: "rgba(0,192,243,0.08)",
                border: "1px solid rgba(0,192,243,0.2)",
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#00c0f3" }}
              />
              <span
                className="text-xs font-medium tracking-[0.2em] uppercase"
                style={{ color: "#00c0f3" }}
              >
                Plataforma B2B · IA a Medida
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl md:text-6xl text-white leading-[1.05] mb-3"
              style={{
                fontFamily: "'Geist', var(--font-bebas), sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Multiplica tu
              <br />
              <span style={{ color: "#00c0f3" }}>rentabilidad</span>
            </motion.h1>

            <motion.p
              className="text-sm leading-relaxed mb-8 max-w-xs"
              style={{ color: "rgba(255,255,255,0.5)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              Automatiza procesos críticos y escala operaciones con agentes de
              IA diseñados a medida para tu industria.
            </motion.p>

            {/* Glassmorphic card */}
            <motion.div
              className="liquid-glass rounded-2xl p-6 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => router.push("/plataforma")}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(0,192,243,0.1)",
                    border: "1px solid rgba(0,192,243,0.22)",
                  }}
                >
                  <Building2 size={18} style={{ color: "#00c0f3" }} />
                </div>
                <div>
                  <span
                    className="text-xs font-medium tracking-widest uppercase block mb-0.5"
                    style={{ color: "#00c0f3" }}
                  >
                    Empresas
                  </span>
                  <p className="text-white font-semibold text-sm leading-tight">
                    Plataforma de Agentes IA
                  </p>
                </div>
              </div>

              {/* Stats row + CTA */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(0,192,243,0.1)",
                      color: "#00c0f3",
                      border: "1px solid rgba(0,192,243,0.2)",
                    }}
                  >
                    +340% ROI
                  </span>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.45)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    72h Demo
                  </span>
                </div>
                <div
                  className="flex items-center gap-1.5 font-semibold text-sm shrink-0"
                  style={{ color: "#00c0f3" }}
                >
                  Ingresar
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>

            {/* Footer note */}
            <motion.p
              className="text-xs mt-4"
              style={{ color: "rgba(255,255,255,0.2)" }}
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
