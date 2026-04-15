"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ElectricBorder from "./ui/ElectricBorder";
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

const CARDS_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(CARDS.length / CARDS_PER_PAGE);

type CardData = (typeof CARDS)[0] & { accent: string };

function Card({ card }: { card: CardData }) {
  const Icon = card.icon as React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  return (
    <ElectricBorder color={card.accent} speed={1} chaos={0.1} borderRadius={16} className="h-full">
      <div className="group relative rounded-2xl p-6 flex flex-col gap-4 overflow-hidden cursor-default transition-all duration-300 h-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
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
            className="text-lg text-white leading-tight font-semibold"
            style={{ fontFamily: "'Geist', var(--font-barlow), var(--font-inter), system-ui, sans-serif" }}
          >
            {card.title}
          </h3>
          <p className="text-sm leading-relaxed flex-1 text-white/75">
            {card.desc}
          </p>
        </div>

        <div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
          style={{ background: card.accent }}
        />
      </div>
    </ElectricBorder>
  );
}

export default function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [page, setPage] = useState(0);

  const cardsWithAccent: CardData[] = CARDS.map((card, i) => ({
    ...card,
    accent: ACCENTS[i % ACCENTS.length],
  }));

  const visibleCards = cardsWithAccent.slice(
    page * CARDS_PER_PAGE,
    (page + 1) * CARDS_PER_PAGE
  );

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(TOTAL_PAGES - 1, p + 1));

  return (
    <section ref={ref} className="py-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-px h-8 bg-white/20" />
          <span className="text-xs tracking-[0.3em] text-white/50 uppercase">Servicios</span>
        </motion.div>

        <div className="flex items-end justify-between mb-10">
          <motion.h2
            className="text-4xl md:text-5xl text-white"
            style={{ fontFamily: "'Geist', var(--font-barlow), var(--font-inter), system-ui, sans-serif", fontWeight: 700 }}
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
          >
            Lo que <span style={{ color: "#00c0f3" }}>hacemos</span>
          </motion.h2>

          {/* Arrow controls */}
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              onClick={prev}
              disabled={page === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-25"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              aria-label="Anterior"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button
              onClick={next}
              disabled={page === TOTAL_PAGES - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-25"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              aria-label="Siguiente"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </motion.div>
        </div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {visibleCards.map((card) => (
              <div key={card.title} className="min-h-[260px]">
                <Card card={card} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination dots */}
        <div className="flex gap-2 justify-center mt-8">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Página ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === page ? "24px" : "8px",
                height: "8px",
                background: i === page ? "#00c0f3" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
