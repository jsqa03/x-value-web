"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, TrendingUp, RefreshCw, Bell, Play } from "lucide-react";

import AntigravityBg from "@/components/ui/AntigravityBg";
import SplitText from "@/components/ui/SplitText";
import { InlineWidget } from "react-calendly";
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

// ─── Integration logos ────────────────────────────────────────────────────────

const LOGOS = [
  { src: "/hubspot.jpg",        alt: "HubSpot"     },
  { src: "/KLAVIYO.png",        alt: "Klaviyo"     },
  { src: "/KOMMO.jpg",          alt: "Kommo"       },
  { src: "/MONDAY.COM.png",     alt: "Monday.com"  },
  { src: "/NOTION.png",         alt: "Notion"      },
  { src: "/Pipedrive.png",      alt: "Pipedrive"   },
  { src: "/Salesforce.png",     alt: "Salesforce"  },
  { src: "/segment-1.svg",      alt: "Segment"     },
  { src: "/Shopify-Logo.png",   alt: "Shopify"     },
  { src: "/Slack.png",          alt: "Slack"       },
  { src: "/Stripe.png",         alt: "Stripe"      },
  { src: "/Twilio.png",         alt: "Twilio"      },
  { src: "/ZENDESK.png",        alt: "Zendesk"     },
];

// ─── LogoMarquee — CSS marquee ────────────────────────────────────────────────

function LogoMarquee() {
  const loopLogos = [...LOGOS, ...LOGOS];
  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, rgba(0,0,0,0.85), transparent)" }} />
      {/* eslint-disable @next/next/no-img-element */}
      <div className="marquee-track items-center gap-10 py-2">
        {loopLogos.map((logo, i) => (
          <div key={`${logo.alt}-${i}`} className="shrink-0 mx-5">
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>
        ))}
      </div>
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}

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
              style={{ background: "#00c0f3" }}
            >
              Agendar Consultoría
              <ArrowRight size={13} />
            </button>
          </div>
        </nav>

        {/* ── ZONA 1: HERO ──────────────────────────────────────────────── */}
        <section className="pt-36 pb-0 px-6 relative overflow-hidden" style={{ background: "hsl(260 87% 3%)" }}>
          {/* Indigo ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none z-[1]"
            style={{ background: "radial-gradient(ellipse at center top, rgba(99,102,241,0.28) 0%, transparent 65%)" }}
          />

          {/* Dark gradient overlay — text contrast + transition to black Zone 2 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black pointer-events-none z-[1]" />

          {/* Content */}
          <div className="max-w-6xl mx-auto relative pb-20 z-[2]">
            {/* Status pill */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#818cf8" }} />
              <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: "#818cf8" }}>
                Plataforma B2B · IA a Medida
              </span>
            </motion.div>

            {/* H1 "Power AI" — ShinyText sweep on "Power" */}
            <motion.h1
              className="leading-[1.02] tracking-tight mb-8"
              style={{
                fontFamily: "var(--font-general), 'General Sans', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(4rem,13vw,13.75rem)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="inline-block"
                style={{
                  background: "linear-gradient(120deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 25%, #fff 45%, rgba(255,255,255,0.5) 65%, rgba(255,255,255,0.5) 100%)",
                  backgroundSize: "250% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["100% 0%", "-100% 0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
              >
                Power
              </motion.span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 52%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AI
              </span>
            </motion.h1>

            <motion.p
              className="text-white/80 text-lg max-w-lg leading-relaxed mb-10"
              style={{ fontFamily: "var(--font-barlow), var(--font-general), system-ui, sans-serif" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              Agentes de inteligencia artificial que automatizan ventas, retención
              y seguimiento — desplegados en{" "}
              <span className="text-white">72 horas</span>, adaptados a tu empresa.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
            >
              {/* Primary — premium lime */}
              <button
                onClick={() => openModal("Agente x-value IA")}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base text-black transition-all hover:scale-[1.03]"
                style={{
                  background: "#00c0f3",
                  fontFamily: "var(--font-general), system-ui, sans-serif",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 0 0 0 rgba(0,192,243,0)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 40px rgba(0,192,243,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 0 0 rgba(0,192,243,0)";
                }}
              >
                Agendar Consultoría Gratuita
                <ArrowRight size={17} />
              </button>

              {/* Secondary ghost */}
              <span
                className="flex items-center gap-2 px-5 py-4 rounded-2xl text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.55)",
                  fontFamily: "var(--font-general), system-ui, sans-serif",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00c0f3" }} />
                Demo disponible en 72 horas
              </span>
            </motion.div>
          </div>

          {/* ── Integration logos — CSS infinite marquee ──────────────────── */}
          <div className="relative pb-10 overflow-hidden z-[2]">
            <div className="mb-6 text-center">
              <span
                className="text-xs tracking-[0.25em] uppercase"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "var(--font-barlow), var(--font-general), system-ui, sans-serif",
                  letterSpacing: "0.3em",
                }}
              >
                Integra con las herramientas que ya usas
              </span>
            </div>

            <LogoMarquee />
          </div>
        </section>

        {/* ── ZONA 2: RESULTADO ACUMULADO — negro sólido puro ──────────── */}
        <section className="relative bg-black w-full z-10">
          <RevenueBanner />
          <ClientsMarquee />
        </section>

        {/* ── ZONA 3: SERVICIOS Y RESTO — glassmorphic con luces de neón ── */}
        <section className="relative w-full bg-[#010101] overflow-hidden">
          {/* Neon diffuse lights — slow float, non-distracting */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            <motion.div
              className="absolute w-[700px] h-[700px] rounded-full blur-[120px] opacity-20"
              style={{ background: "radial-gradient(circle, #FA93FA, #C967E8, #983AD6)", top: "5%", left: "-5%" }}
              animate={{ x: [0, 130, -70, 0], y: [0, -100, 60, 0] }}
              transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
              style={{ background: "radial-gradient(circle, #FA93FA, #C967E8, #983AD6)", top: "45%", right: "-5%" }}
              animate={{ x: [0, -110, 80, 0], y: [0, 90, -50, 0] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear", delay: 10 }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
              style={{ background: "radial-gradient(circle, #C967E8, #983AD6, #FA93FA)", bottom: "10%", left: "35%" }}
              animate={{ x: [0, 80, -60, 0], y: [0, -60, 80, 0] }}
              transition={{ duration: 55, repeat: Infinity, ease: "linear", delay: 20 }}
            />
          </div>

          {/* Content — above blobs */}
          <div style={{ position: "relative", zIndex: 1 }}>

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
              <span className="text-xs tracking-[0.3em] text-white/50 uppercase">Agentes IA</span>
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

        {/* ── CALENDLY INLINE ──────────────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="w-px h-8 bg-white/20" />
              <span className="text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                Agendar
              </span>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl text-white mb-3"
              style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
            >
              Agenda tu{" "}
              <span style={{ color: "#00c0f3" }}>consultoría</span>
            </motion.h2>

            <motion.p
              className="text-sm mb-10 max-w-md"
              style={{ color: "rgba(255,255,255,0.55)" }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
            >
              Elige la fecha y hora que más te convenga. Sin compromiso, sin tarjeta de crédito.
            </motion.p>

            <motion.div
              className="liquid-glass rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              {/* ↓ Replace the URL below with your Calendly booking page URL */}
              <InlineWidget
                url="https://calendly.com/juansquiceno-xvalueaigrowth/llamada-de-consultoria-inicial"
                styles={{ height: "700px", minWidth: "320px" }}
                pageSettings={{
                  backgroundColor: "050505",
                  hideEventTypeDetails: false,
                  hideGdprBanner: true,
                  primaryColor: "00c0f3",
                  textColor: "f5f5f5",
                }}
              />
            </motion.div>
          </div>
        </section>

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
          </div>{/* end content-above-blobs */}
        </section>{/* end ZONA 3 */}
      </div>{/* end outer zIndex wrapper */}

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
