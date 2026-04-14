"use client";

import Marquee from "react-fast-marquee";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";

const TESTIMONIALS = [
  {
    quote: "En 3 semanas el agente cerró más reuniones de las que nuestro equipo de ventas hacía en un mes. Simplemente increíble.",
    name: "Andrés Mejía",
    role: "CEO · Fintech Colombia",
    initials: "AM",
    accent: "#D1FF48",
  },
  {
    quote: "Pasamos de responder leads en 4 horas a hacerlo en 8 segundos. La conversión subió 40% solo por eso.",
    name: "Valeria Fontana",
    role: "VP Ventas · SaaS México",
    initials: "VF",
    accent: "#00C0F3",
  },
  {
    quote: "Integración con HubSpot perfecta. El equipo de x-value lo dejó funcionando en dos días. ROI positivo desde la primera semana.",
    name: "Diego Martínez",
    role: "Director Comercial · Retail Argentina",
    initials: "DM",
    accent: "#A78BFA",
  },
  {
    quote: "Mis competidores siguen contratando personal. Yo automaticé y reduje costos un 60% manteniendo el mismo volumen.",
    name: "Carolina Reyes",
    role: "Fundadora · E-commerce España",
    initials: "CR",
    accent: "#D1FF48",
  },
  {
    quote: "El agente de recompra recuperó clientes que creíamos perdidos. Generó $80K en reactivaciones en el primer mes.",
    name: "Miguel Ferreira",
    role: "CMO · Servicios Brasil",
    initials: "MF",
    accent: "#00C0F3",
  },
  {
    quote: "Probé 3 herramientas antes. Ninguna hablaba tan natural. Los clientes no notan que es IA hasta que les decimos.",
    name: "Sofía Vargas",
    role: "Gerente · Consultoría Venezuela",
    initials: "SV",
    accent: "#A78BFA",
  },
];

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[0] }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 h-full"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span className="text-3xl leading-none font-serif" style={{ color: t.accent, opacity: 0.55 }}>
        "
      </span>
      <p className="text-sm text-gray-300 leading-relaxed flex-1">{t.quote}</p>
      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: `${t.accent}20`, color: t.accent }}>
          {t.initials}
        </div>
        <div>
          <p className="text-xs font-semibold text-white/70">{t.name}</p>
          <p className="text-xs text-gray-300">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const [emblaRef] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });

  return (
    <section ref={ref} className="py-20 overflow-hidden">
      {/* Header */}
      <div className="px-6 max-w-6xl mx-auto mb-10">
        <motion.div
          className="flex items-center gap-3 mb-2"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-px h-8 bg-white/20" />
          <span className="text-xs tracking-[0.3em] text-white/30 uppercase">Testimonios</span>
        </motion.div>
        <motion.h2
          className="text-4xl md:text-5xl text-white"
          style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.07 }}
        >
          Lo que dicen{" "}
          <span style={{ color: "#D1FF48" }}>nuestros clientes</span>
        </motion.h2>
      </div>

      {/* ── Mobile: Embla swipe carousel ── */}
      <div className="md:hidden overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="snap-card" style={{ flex: "0 0 80vw", maxWidth: 300 }}>
              <TestimonialCard t={t} />
            </div>
          ))}
          <div style={{ flex: "0 0 24px" }} />
        </div>
      </div>

      {/* ── Desktop: auto-scroll marquee ── */}
      <div className="hidden md:block relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }} />
        <Marquee speed={28} gradient={false} pauseOnHover autoFill>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="mx-3 w-80">
              <TestimonialCard t={t} />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
