"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  TrendingUp,
  Settings,
  BookOpen,
  Code,
  FileText,
  BarChart2,
  Users,
  DollarSign,
  Home,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const ACCENTS = ["#00c0f3", "#A78BFA", "#00c0f3", "#A78BFA", "#00c0f3", "#A78BFA", "#00c0f3", "#A78BFA", "#00c0f3"];

const CARDS = [
  {
    icon: TrendingUp,
    label: "01",
    title: "Software AI Sales Tools",
    desc: "Plataforma de ventas inteligente que califica leads, automatiza el outreach y cierra oportunidades 24/7 — tu propio CRM potenciado con IA.",
  },
  {
    icon: Settings,
    label: "02",
    title: "Software AI for Business Operations",
    desc: "Centraliza y automatiza tus operaciones con IA que toma decisiones en tiempo real, elimina procesos manuales y escala sin fricción.",
  },
  {
    icon: BookOpen,
    label: "03",
    title: "Software AI Automation for Education",
    desc: "Plataformas educativas adaptativas que personalizan el aprendizaje para cada estudiante, automatizan la evaluación y optimizan los resultados.",
  },
  {
    icon: Code,
    label: "04",
    title: "Software AI SaaS Solutions",
    desc: "Construimos tu producto SaaS con IA nativa desde la arquitectura hasta el lanzamiento — listo para escalar a miles de usuarios.",
  },
  {
    icon: FileText,
    label: "05",
    title: "Software AI for Law Firms",
    desc: "Revisión de contratos, investigación legal automatizada y gestión de casos — herramientas de IA diseñadas para la precisión que el derecho exige.",
  },
  {
    icon: BarChart2,
    label: "06",
    title: "Software AI Powered Marketing",
    desc: "Campañas hiper-personalizadas impulsadas por IA que predicen comportamientos, capturan audiencias ideales y maximizan el ROAS.",
  },
  {
    icon: Users,
    label: "07",
    title: "Software AI for Human Resources",
    desc: "Reclutamiento, onboarding y gestión del talento optimizados con IA que evalúa, recomienda y retiene a las personas correctas.",
  },
  {
    icon: DollarSign,
    label: "08",
    title: "Software AI Debt Collection",
    desc: "Automatiza y humaniza la cobranza con IA conversacional que maximiza la recuperación de cartera mientras preserva la relación con el cliente.",
  },
  {
    icon: Home,
    label: "09",
    title: "Software AI in Real Estate",
    desc: "Valuación automatizada, generación de leads cualificados y gestión de propiedades con IA especializada en el mercado inmobiliario.",
  },
];

type CardData = (typeof CARDS)[0] & { accent: string };

function Card({ card }: { card: CardData }) {
  const Icon = card.icon as React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  return (
    <div className="group liquid-glass relative rounded-2xl p-6 flex flex-col gap-4 overflow-hidden cursor-default transition-all duration-300 h-full hover:scale-[1.015]">
      <span
        className="absolute top-4 right-5 text-xs font-mono tracking-widest"
        style={{ color: "rgba(255,255,255,0.15)" }}
      >
        {card.label}
      </span>

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}
      >
        <Icon size={16} style={{ color: card.accent }} />
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <h3
          className="text-lg text-white leading-tight"
          style={{ fontFamily: "var(--font-instrument), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
        >
          {card.title}
        </h3>
        <p className="text-sm leading-relaxed flex-1 text-white/80">
          {card.desc}
        </p>
      </div>

      {/* Hover accent glow */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
        style={{ background: card.accent }}
      />
    </div>
  );
}

export default function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const [emblaRef] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });

  const cardsWithAccent: CardData[] = CARDS.map((card, i) => ({
    ...card,
    accent: ACCENTS[i % ACCENTS.length],
  }));

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
          <span className="text-xs tracking-[0.3em] text-white/50 uppercase">Servicios</span>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl text-white mb-10"
          style={{ fontFamily: "var(--font-instrument), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
        >
          Lo que <span style={{ color: "#00c0f3" }}>hacemos</span>
        </motion.h2>
      </div>

      {/* ── Mobile: Embla swipe carousel ── */}
      <div className="md:hidden overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-6">
          {cardsWithAccent.map((card) => (
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
          <div style={{ flex: "0 0 24px" }} />
        </div>
      </div>

      {/* ── Desktop: 3-col grid ── */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-6">
        {cardsWithAccent.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card card={card} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
