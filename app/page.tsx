"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function GatePage() {
  const router = useRouter();

  return (
    <main>
      {/* ── Glassmorphic nav — untouched ──────────────────────────── */}
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

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#05010d] pt-20">

        {/* VIDEO DE FONDO */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
            type="video/mp4"
          />
        </video>

        {/* BLUR CENTRAL (Resplandor detrás del texto) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[984px] h-[527px] bg-gray-950/90 blur-[82px] pointer-events-none z-10 rounded-full" />

        {/* CONTENIDO DEL HERO */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">

          {/* TITULAR PRINCIPAL */}
          <h1 className="font-sans font-bold tracking-tight leading-[1.1] text-5xl md:text-7xl lg:text-[100px] mb-6">
            <span className="text-white">Tu IA, </span>
            <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-l from-[#6366f1] via-[#a855f7] to-[#fcd34d]">
              construida desde cero.
            </span>
          </h1>

          {/* SUBTÍTULO */}
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-light">
            No vendemos automatizaciones genéricas. Desarrollamos el software
            de inteligencia artificial de tu empresa desde la arquitectura
            hasta el deployment — entrenado en tus datos, diseñado para tus
            procesos.
          </p>

          {/* BOTÓN CTA */}
          <div className="flex gap-4">
            <button
              className="liquid-glass text-white rounded-full px-8 py-4 text-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => router.push("/plataforma")}
            >
              Agendar Consultoría Gratuita
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}
