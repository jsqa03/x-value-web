"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingUp, RefreshCw, Bell, Play, ChevronLeft, ChevronRight, Sparkles, Cpu } from "lucide-react";

import AntigravityBg from "@/components/ui/AntigravityBg";
import SplitText from "@/components/ui/SplitText";
import MagicRings from "@/components/ui/MagicRings";
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
  { src: "hubspot.jpg",        alt: "HubSpot"     },
  { src: "KLAVIYO.png",        alt: "Klaviyo"     },
  { src: "KOMMO.jpg",          alt: "Kommo"       },
  { src: "MONDAY.COM.png",     alt: "Monday.com"  },
  { src: "NOTION.png",         alt: "Notion"      },
  { src: "Pipedrive.png",      alt: "Pipedrive"   },
  { src: "Salesforce.png",     alt: "Salesforce"  },
  { src: "segment-1.svg",      alt: "Segment"     },
  { src: "Shopify-Logo.png",   alt: "Shopify"     },
  { src: "Slack.png",          alt: "Slack"       },
  { src: "Stripe.png",         alt: "Stripe"      },
  { src: "Twilio.png",         alt: "Twilio"      },
  { src: "ZENDESK.png",        alt: "Zendesk"     },
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
              src={`/${logo.src}`}
              alt={logo.alt}
              className="h-10 md:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
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
    desc: "Califica leads, personaliza propuestas en segundos y hace seguimiento inteligente a cada oportunidad. Próximamente disponible para que lo pruebes en vivo.",
    icon: TrendingUp,
    accent: "#D1FF48",
    stat: "+68% cierre",
  },
  {
    id: "recompra",
    name: "Agente de Recompra",
    tagline: "Retiene y reactiva clientes",
    desc: "Detecta señales de churn y activa campañas de recompra personalizadas en el momento exacto. Próximamente disponible para que lo pruebes en vivo.",
    icon: RefreshCw,
    accent: "#00C0F3",
    stat: "+120% LTV",
  },
  {
    id: "seguimiento",
    name: "Agente de Seguimiento",
    tagline: "Nunca pierdas un prospecto",
    desc: "Automatiza touchpoints post-reunión, envía recordatorios y mantiene el pipeline activo. Próximamente disponible para que lo pruebes en vivo.",
    icon: Bell,
    accent: "#A78BFA",
    stat: "< 2 min respuesta",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALL_AGENT_COUNT = AGENTS.length + 1; // 3 agentes + 1 "próximamente"

export default function PlataformaPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("Agente x-value IA");

  // ── Agents carousel ────────────────────────────────────────────────────────
  const [agentIdx, setAgentIdx] = useState(0);
  const agentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const agentResumeRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const startAgentAutoPlay = useCallback(() => {
    if (agentIntervalRef.current) clearInterval(agentIntervalRef.current);
    agentIntervalRef.current = setInterval(() => {
      setAgentIdx((prev) => (prev + 1) % ALL_AGENT_COUNT);
    }, 2000);
  }, []);

  const goToAgent = useCallback((idx: number) => {
    setAgentIdx(((idx % ALL_AGENT_COUNT) + ALL_AGENT_COUNT) % ALL_AGENT_COUNT);
    if (agentIntervalRef.current) clearInterval(agentIntervalRef.current);
    if (agentResumeRef.current)   clearTimeout(agentResumeRef.current);
    agentResumeRef.current = setTimeout(startAgentAutoPlay, 6000);
  }, [startAgentAutoPlay]);

  useEffect(() => {
    startAgentAutoPlay();
    return () => {
      if (agentIntervalRef.current) clearInterval(agentIntervalRef.current);
      if (agentResumeRef.current)   clearTimeout(agentResumeRef.current);
    };
  }, [startAgentAutoPlay]);
  // ──────────────────────────────────────────────────────────────────────────

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
              {/* Logo */}
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

            {/* Nav links — desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white/80 hover:text-white text-sm transition-colors">
                Home
              </Link>
              <button
                onClick={() => openModal("Agente x-value IA")}
                className="text-white/80 hover:text-white text-sm transition-colors"
              >
                Book a Demo
              </button>
              <Link href="/login" className="text-white/80 hover:text-white text-sm transition-colors">
                Sign In
              </Link>
            </div>

            {/* CTA button */}
            <button
              onClick={() => openModal("Agente x-value IA")}
              className="bg-[#00c0f3] text-black font-semibold rounded-full px-5 py-2 text-sm hover:bg-[#00a8d6] transition-colors"
            >
              Book a Demo
            </button>
          </div>
        </nav>

        {/* ── ZONA 1: HERO — 2 columnas Z-pattern ───────────────────────── */}
        <section className="relative min-h-screen overflow-hidden bg-[#05010d] pt-20">

          {/* Video de fondo */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-30">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4" type="video/mp4" />
          </video>

          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none z-0" />

          {/* 2-column grid */}
          <div className="relative z-20 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 min-h-[calc(100vh-80px)] py-16">

            {/* ── Left column ── */}
            <div className="flex-1 flex flex-col gap-6 text-left">

              {/* Badge */}
              <motion.div className="flex items-center gap-2 w-fit rounded-full px-4 py-1.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                <Sparkles size={13} style={{ color: "#00c0f3" }} />
                <span className="text-white/60 text-xs font-medium tracking-wide">Inteligencia Artificial para Empresas</span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                className="font-sans tracking-tight text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}>
                <span className="text-white">X-Value </span>
                <motion.span
                  className="inline-block bg-clip-text text-transparent bg-gradient-to-l from-[#6366f1] via-[#a855f7] to-[#fcd34d]"
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  style={{ backgroundSize: "200% auto" }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                  IA
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p className="text-white/80 text-lg leading-relaxed font-light max-w-lg"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}>
                Aumenta tu rentabilidad y reduce gastos operativos. Un software de
                inteligencia artificial a medida que trabaja 24/7, capaz de realizar
                tareas y asumir la carga operativa de hasta 5 empleados.
              </motion.p>

              {/* CTA */}
              <motion.button
                onClick={() => openModal("Agente x-value IA")}
                className="w-fit flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base text-black transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(0,192,243,0.4)]"
                style={{ background: "#00c0f3" }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.38 }}>
                Agendar Consultoría Gratuita
                <ArrowRight size={16} />
              </motion.button>
            </div>

            {/* ── Right column — AI metrics visual ── */}
            <motion.div className="flex-1 w-full"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}>
              <div className="rounded-2xl overflow-hidden p-8 flex flex-col gap-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>

                {/* Top badge */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/40 text-xs font-medium">Sistema activo · respondiendo en tiempo real</span>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "ROI Promedio",       value: "340%",   accent: "#00c0f3" },
                    { label: "Deploy en",           value: "72 h",   accent: "#a855f7" },
                    { label: "Disponibilidad",      value: "24/7",   accent: "#fcd34d" },
                    { label: "Equiv. operativo",    value: "5 emp.", accent: "rgba(255,255,255,0.8)" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl p-4"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-white/40 text-xs mb-1">{m.label}</p>
                      <p className="text-2xl font-bold" style={{ color: m.accent }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Icon row */}
                <div className="flex items-center gap-3 pt-2"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,192,243,0.12)", border: "1px solid rgba(0,192,243,0.2)" }}>
                    <Cpu size={16} style={{ color: "#00c0f3" }} />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">Software a medida</p>
                    <p className="text-white/30 text-xs">Entrenado en tus datos · diseñado para tus procesos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Logo marquee */}
          <div className="relative w-full pb-12 z-20">
            <p className="text-center text-xs tracking-[0.3em] uppercase text-white/30 mb-6">
              Integra con las herramientas que ya usas
            </p>
            <LogoMarquee />
          </div>
        </section>

        {/* ── ZONA 2: RESULTADO ACUMULADO ──────────────────────────────── */}
        <section className="relative bg-black w-full z-10">
          <RevenueBanner />
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

        {/* ── AGENTS CAROUSEL ─────────────────────────────────────────────── */}
        <section className="py-20 px-6 relative">
          {/* MagicRings — decorative 3D rings */}
          <MagicRings color="#00c0f3" colorTwo="#a855f7" />

          <div className="max-w-3xl mx-auto relative" style={{ zIndex: 1 }}>
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

            {/* Header row with title + arrows */}
            <div className="flex items-end justify-between mb-5">
              <motion.h2
                className="text-4xl md:text-5xl text-white leading-tight"
                style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
              >
                Elige tu <span style={{ color: "#D1FF48" }}>agente</span> para probarlo en vivo
              </motion.h2>

              <motion.div className="flex gap-2 shrink-0 ml-4"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}>
                <button onClick={() => goToAgent(agentIdx - 1)} aria-label="Anterior"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <ChevronLeft size={18} className="text-white" />
                </button>
                <button onClick={() => goToAgent(agentIdx + 1)} aria-label="Siguiente"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <ChevronRight size={18} className="text-white" />
                </button>
              </motion.div>
            </div>

            {/* "Próximamente disponibles" pill */}
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "rgba(209,255,72,0.08)", border: "1px solid rgba(209,255,72,0.2)", color: "#D1FF48" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D1FF48] animate-pulse inline-block" />
                Próximamente disponibles
              </span>
            </div>

            {/* Single agent card */}
            <AnimatePresence mode="wait">
              <motion.div key={agentIdx}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-[260px]">
                {agentIdx < AGENTS.length ? (() => {
                  const agent = AGENTS[agentIdx];
                  const Icon = agent.icon;
                  return (
                    <div className="group rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: agent.accent }} />

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${agent.accent}12`, border: `1px solid ${agent.accent}20` }}>
                          <Icon size={18} style={{ color: agent.accent }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-wider uppercase mb-0.5"
                            style={{ color: agent.accent }}>{agent.tagline}</p>
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
                    </div>
                  );
                })() : (
                  /* Próximamente card */
                  <div className="rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden opacity-50"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      Available Soon
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium tracking-wider uppercase mb-0.5 text-white/25">Próximamente</p>
                      <h3 className="text-xl text-white/40 leading-tight"
                        style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}>
                        Nuevo Agente
                      </h3>
                    </div>
                    <p className="text-sm text-white/25 leading-relaxed flex-1">
                      Estamos desarrollando un nuevo agente especializado. Pronto disponible para tu empresa.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Pagination dots */}
            <div className="flex gap-2 justify-center mt-6">
              {Array.from({ length: ALL_AGENT_COUNT }).map((_, i) => (
                <button key={i} onClick={() => goToAgent(i)} aria-label={`Agente ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === agentIdx ? "24px" : "8px", height: "8px",
                    background: i === agentIdx ? "#D1FF48" : "rgba(255,255,255,0.2)" }} />
              ))}
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
