"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, TrendingUp, RefreshCw, Bell, Play } from "lucide-react";

import AntigravityBg from "@/components/ui/AntigravityBg";
import SplitText from "@/components/ui/SplitText";
import RevenueBanner from "@/components/RevenueBanner";
import ClientsMarquee from "@/components/ClientsMarquee";
import FeatureCards from "@/components/FeatureCards";
import ComparisonTable from "@/components/ComparisonTable";
import GlobalPresenceMap from "@/components/GlobalPresenceMap";
import Testimonials from "@/components/Testimonials";
import GrowthBanner from "@/components/GrowthBanner";
import VoiceAgentDemo from "@/components/VoiceAgentDemo";
import InstagramMedia from "@/components/InstagramMedia";
import ConversionModal from "@/components/ConversionModal";
import CalendlyCTA from "@/components/CalendlyCTA";

// ─── Agent data ───────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: "ventas",
    name: "Agente de Ventas IA",
    tagline: "Cierra negocios 24/7",
    desc: "Califica leads, personaliza propuestas en segundos y hace seguimiento inteligente a cada oportunidad.",
    icon: TrendingUp,
    accent: "#D1FF48",
    stat: "+68% cierre",
  },
  {
    id: "recompra",
    name: "Agente de Recompra",
    tagline: "Retiene y reactiva clientes",
    desc: "Detecta señales de churn y activa campañas de recompra personalizadas en el momento exacto.",
    icon: RefreshCw,
    accent: "#00C0F3",
    stat: "+120% LTV",
  },
  {
    id: "seguimiento",
    name: "Agente de Seguimiento",
    tagline: "Nunca pierdas un prospecto",
    desc: "Automatiza touchpoints post-reunión, envía recordatorios y mantiene el pipeline activo.",
    icon: Bell,
    accent: "#A78BFA",
    stat: "< 2 min respuesta",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlataformaPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("Agente x-value IA");

  function openModal(agentName: string) {
    setSelectedAgent(agentName);
    setModalOpen(true);
  }

  return (
    <>
      {/* Particle background */}
      <AntigravityBg />

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <nav
          className="fixed top-0 left-0 right-0 z-40 border-b"
          style={{
            background: "rgba(10,10,10,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="x-value IA"
                width={130}
                height={32}
                style={{ height: "32px", width: "auto" }}
                priority
              />
            </div>
            <button
              onClick={() => openModal("Agente x-value IA")}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all text-black"
              style={{ background: "#D1FF48" }}
            >
              Agendar Consultoría
              <ArrowRight size={13} />
            </button>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="pt-36 pb-20 px-6 relative overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center top, rgba(209,255,72,0.055) 0%, transparent 70%)",
            }}
          />

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Status pill */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
              style={{
                background: "rgba(209,255,72,0.06)",
                border: "1px solid rgba(209,255,72,0.12)",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#D1FF48" }} />
              <span
                className="text-xs font-medium tracking-[0.2em] uppercase"
                style={{ color: "#D1FF48" }}
              >
                Plataforma B2B · IA a Medida
              </span>
            </motion.div>

            {/* H1 with SplitText */}
            <h1
              className="text-[clamp(3.5rem,9vw,8.5rem)] leading-[0.92] tracking-tight text-white mb-8"
              style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
            >
              <SplitText text="EMPRESAS" delay={0.05} stagger={0.07} />
              <br />
              <SplitText text="QUE YA ESTÁN" delay={0.2} stagger={0.06} className="text-white/35" />
              <br />
              <SplitText text="ADELANTE" delay={0.4} stagger={0.07} />
            </h1>

            <motion.p
              className="text-gray-300 text-lg max-w-lg leading-relaxed mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              Agentes de inteligencia artificial que automatizan ventas, retención
              y seguimiento — desplegados en{" "}
              <span className="text-white/80">72 horas</span>, adaptados a tu empresa.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              <button
                onClick={() => openModal("Agente x-value IA")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-[1.02]"
                style={{ background: "#D1FF48" }}
              >
                Agendar Consultoría Gratuita
                <ArrowRight size={15} />
              </button>
              <span
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D1FF48" }} />
                Demo disponible en 72 horas
              </span>
            </motion.div>
          </div>
        </section>

        {/* ── REVENUE BANNER ──────────────────────────────────────────────── */}
        <RevenueBanner />

        {/* ── CLIENTS MARQUEE ─────────────────────────────────────────────── */}
        <ClientsMarquee />

        {/* ── FEATURE CARDS ───────────────────────────────────────────────── */}
        <FeatureCards />

        {/* ── AGENTS GRID ─────────────────────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="w-px h-8 bg-white/20" />
              <span className="text-xs tracking-[0.3em] text-white/30 uppercase">Agentes IA</span>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl text-white mb-10"
              style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
            >
              Elige tu <span style={{ color: "#D1FF48" }}>agente</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AGENTS.map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="group rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: agent.accent }} />

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${agent.accent}12`, border: `1px solid ${agent.accent}20` }}>
                        <Icon size={18} style={{ color: agent.accent }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider uppercase mb-0.5"
                          style={{ color: agent.accent }}>
                          {agent.tagline}
                        </p>
                        <h3 className="text-xl text-white leading-tight"
                          style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}>
                          {agent.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed flex-1">{agent.desc}</p>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{ background: `${agent.accent}10`, color: agent.accent, border: `1px solid ${agent.accent}15` }}>
                        {agent.stat}
                      </span>
                      <button
                        onClick={() => openModal(agent.name)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all hover:scale-[1.02] text-black"
                        style={{ background: agent.accent }}
                      >
                        <Play size={11} fill="currentColor" />
                        Demo en vivo
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── VOICE AGENT DEMO (X-Sarah) ───────────────────────────────────── */}
        <VoiceAgentDemo />

        {/* ── COMPARISON TABLE ────────────────────────────────────────────── */}
        <ComparisonTable />

        {/* ── GLOBAL PRESENCE MAP (Interactive Globe) ─────────────────────── */}
        <GlobalPresenceMap />

        {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
        <Testimonials />

        {/* ── INSTAGRAM REEL ──────────────────────────────────────────────── */}
        <InstagramMedia />

        {/* ── GROWTH BANNER CTA ───────────────────────────────────────────── */}
        <GrowthBanner onCTA={() => openModal("Agente x-value IA")} />

        {/* Footer */}
        <footer className="border-t px-6 py-8" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="x-value IA"
                width={100}
                height={24}
                style={{ height: "24px", width: "auto", opacity: 0.5 }}
              />
            </div>
            <p className="text-xs text-white/20 text-center">
              © 2025 x-value IA · Plataforma B2B de Inteligencia Artificial
            </p>
          </div>
        </footer>
      </div>

      {/* ── Modals / CTAs (outside scroll container) ─────────────────────── */}
      <ConversionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        agentName={selectedAgent}
      />
      <CalendlyCTA />
    </>
  );
}
