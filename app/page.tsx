"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, ArrowRight } from "lucide-react";

export default function GatePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen mesh-bg flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient — only cyan */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00c0f3]/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-[#00c0f3]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="x-value IA"
              width={180}
              height={48}
              style={{ height: "48px", width: "auto" }}
              priority
            />
          </div>
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase">
            Inteligencia Artificial para Empresas
          </p>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center"
        >
          <h1
            className="text-3xl md:text-4xl text-white tracking-wide"
            style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
          >
            Bienvenido
          </h1>
          <div className="mt-2 w-16 h-px bg-gradient-to-r from-transparent via-[#00c0f3] to-transparent mx-auto" />
        </motion.div>

        {/* Single card: Empresas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.25 }}
          onClick={() => router.push("/plataforma")}
          className="group relative glass rounded-2xl p-8 cursor-pointer overflow-hidden w-full transition-all duration-300"
          style={{
            boxShadow: "0 0 40px rgba(0,192,243,0.4)",
            border: "1px solid rgba(0,192,243,0.25)",
          }}
          whileHover={{
            boxShadow: "0 0 60px rgba(0,192,243,0.55)",
            y: -3,
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00c0f3]/8 rounded-bl-3xl" />
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00c0f3]/40 to-transparent" />

          <div className="flex flex-col gap-6 h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00c0f3]/10 border border-[#00c0f3]/25 flex items-center justify-center shrink-0">
                <Building2 size={22} className="text-[#00c0f3]" />
              </div>
              <div>
                <span className="text-xs text-[#00c0f3] tracking-widest uppercase font-medium">
                  Empresas
                </span>
                <h2
                  className="text-3xl text-white mt-0.5 leading-none"
                  style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
                >
                  Multiplica tu<br />rentabilidad
                </h2>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Automatiza procesos críticos y escala operaciones con agentes de
              IA diseñados a medida para tu industria.
            </p>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex gap-2.5">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#00c0f3]/10 text-[#00c0f3] border border-[#00c0f3]/20">
                  +340% ROI
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">
                  72h Demo
                </span>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[#00c0f3] font-semibold text-sm group-hover:gap-2.5 transition-all">
                Ingresar
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xs text-gray-400 text-center"
        >
          Plataforma B2B · Datos protegidos · Demos en 72 horas
        </motion.p>
      </div>
    </main>
  );
}
