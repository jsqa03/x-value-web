"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Zap, Layers } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const CARDS = [
  {
    icon: TrendingUp,
    accent: "#D1FF48",
    label: "01",
    title: "Vende Más",
    desc: "Identifica leads calificados automáticamente, prioriza los más rentables y cierra oportunidades mientras tu competencia duerme.",
    detail: "+68% tasa de cierre",
  },
  {
    icon: Zap,
    accent: "#00C0F3",
    label: "02",
    title: "Responde al Instante",
    desc: "Voz natural 24/7. Tu agente atiende prospectos en segundos, sin esperas ni guiones robóticos. Conversaciones reales, resultados reales.",
    detail: "< 2 seg respuesta",
  },
  {
    icon: Layers,
    accent: "#A78BFA",
    label: "03",
    title: "CRM Integration",
    desc: "Se conecta a tu ecosistema actual — HubSpot, Salesforce, Pipedrive, Notion. Cero fricción, máxima visibilidad de cada interacción.",
    detail: "40+ integraciones",
  },
];

function Card({ card }: { card: (typeof CARDS)[0] }) {
  const Icon = card.icon;
  return (
    <div
      className="group relative rounded-2xl p-7 flex flex-col gap-6 overflow-hidden cursor-default transition-all duration-300 h-full"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.06)";
      }}
    >
      <span className="absolute top-5 right-6 text-xs font-mono tracking-widest"
        style={{ color: "rgba(255,255,255,0.1)" }}>
        {card.label}
      </span>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${card.accent}12`, border: `1px solid ${card.accent}20` }}>
        <Icon size={18} style={{ color: card.accent }} />
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <h3 className="text-2xl text-white"
          style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}>
          {card.title}
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed flex-1">{card.desc}</p>
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide self-start"
        style={{ background: `${card.accent}10`, color: card.accent, border: `1px solid ${card.accent}20` }}>
        {card.detail}
      </div>
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: card.accent }} />
    </div>
  );
}

export default function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  // Mobile Embla carousel
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  return (
    <section ref={ref} className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-px h-8 bg-white/20" />
          <span className="text-xs tracking-[0.3em] text-white/30 uppercase">Capacidades</span>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl text-white mb-10"
          style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
        >
          Lo que <span style={{ color: "#D1FF48" }}>hacemos</span>
        </motion.h2>
      </div>

      {/* ── Mobile carousel (< md) ── */}
      <div className="md:hidden overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-6">
          {CARDS.map((card) => (
            <motion.div
              key={card.title}
              className="snap-card"
              style={{ flex: "0 0 78vw", maxWidth: 280 }}
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card card={card} />
            </motion.div>
          ))}
          {/* trailing space */}
          <div style={{ flex: "0 0 24px" }} />
        </div>
      </div>

      {/* ── Desktop grid (>= md) ── */}
      <div className="hidden md:grid grid-cols-3 gap-4 max-w-6xl mx-auto px-6">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card card={card} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
