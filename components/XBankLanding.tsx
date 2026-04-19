"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Rocket, Lock, CheckCircle2, ArrowRight,
  Wifi, Shield, Zap, Star, Pencil,
  CreditCard, BarChart3, Percent, RefreshCw, ShieldCheck,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { joinXBankWaitlist, type ContractStats } from "@/app/actions/xbank";

// ─── Waitlist counter — increments by 1 each day at 15:00 Colombia (UTC-5) ───
const WAITLIST_BASE     = 47;
const WAITLIST_BASE_UTC = new Date("2026-04-19T05:00:00Z").getTime();
const MS_PER_DAY        = 86_400_000;

function calcWaitlistCount(): number {
  const nowMs       = Date.now();
  const diasPasados = Math.floor((nowMs - WAITLIST_BASE_UTC) / MS_PER_DAY);
  const colombiaHour = ((new Date().getUTCHours() - 5) + 24) % 24;
  const adjustment   = colombiaHour >= 15 ? 0 : -1;
  return Math.max(WAITLIST_BASE, WAITLIST_BASE + diasPasados + adjustment);
}

// ─── Corporate benefits data ──────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: CreditCard,
    title: "Tarjetas Ilimitadas",
    desc: "Emite tarjetas físicas y virtuales para cada empleado o departamento con límites personalizados en un clic.",
    accent: "#f59e0b",
  },
  {
    icon: BarChart3,
    title: "Control Inteligente",
    desc: "Monitorea gastos en tiempo real, establece presupuestos y aprueba transacciones desde el dashboard.",
    accent: "#38bdf8",
  },
  {
    icon: Percent,
    title: "Cashback Premium",
    desc: "Gana hasta 2.5% de cashback en las categorías donde tu empresa más invierte: SaaS, anuncios y viajes.",
    accent: "#a78bfa",
  },
  {
    icon: RefreshCw,
    title: "Integración Contable",
    desc: "Sincronización automática de facturas y recibos con tu ERP para cerrar el mes sin estrés.",
    accent: "#34d399",
  },
  {
    icon: ShieldCheck,
    title: "Riesgo Cero",
    desc: "Crédito basado en los ingresos de la empresa. Sin afectar el score de crédito personal de los fundadores.",
    accent: "#fb923c",
  },
] as const;

// ─── Fade-up reveal helper ────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Apple Wallet badge ───────────────────────────────────────────────────────
function AppleWalletBadge() {
  return (
    <div
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl select-none"
      style={{
        background: "#000",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
      }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill="white" aria-hidden>
        <path d="M13.17 10.93c-.04-2.01 1.64-2.99 1.72-3.04-1.24-1.73-2.93-1.76-3.49-1.76-1.43-.14-2.87.87-3.58.87-.74 0-1.83-.86-3.04-.84C2.93 6.18 1.3 7.02.55 8.35-1.1 11.07.07 15.12 1.7 17.32c.87 1.19 1.88 2.5 3.19 2.46 1.29-.05 1.77-.8 3.32-.8 1.54 0 1.99.8 3.33.77 1.38-.02 2.24-1.2 3.08-2.39.98-1.37 1.38-2.7 1.4-2.77-.03-.01-2.63-1-2.85-3.66zm-2.66-6.74C11.34 3.19 12 2.1 11.73.86 10.7.92 9.48 1.57 8.73 2.56c-.67.89-1.27 2.01-.95 3.14 1.09.07 2.15-.57 2.73-1.51z" />
      </svg>
      <div className="flex flex-col leading-none gap-0.5">
        <span className="text-[9px] text-white/50 tracking-wide">Add to</span>
        <span className="text-[12px] text-white font-semibold tracking-tight">Apple Wallet</span>
      </div>
    </div>
  );
}

// ─── Google Wallet badge ──────────────────────────────────────────────────────
function GoogleWalletBadge() {
  return (
    <div
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl select-none"
      style={{
        background: "#1c1c1e",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
    >
      {/* Google G */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <div className="flex flex-col leading-none gap-0.5">
        <span className="text-[9px] text-white/45 tracking-wide">Añadir a</span>
        <span className="text-[12px] text-white font-semibold tracking-tight">Google Wallet</span>
      </div>
    </div>
  );
}

// ─── EMV chip ─────────────────────────────────────────────────────────────────
function EmvChip() {
  return (
    <div
      className="relative rounded-[5px] shrink-0"
      style={{
        width: 46,
        height: 36,
        background:
          "linear-gradient(145deg, #d4a843 0%, #f7e08a 25%, #c8922a 55%, #f0cc6a 80%, #b8831e 100%)",
        boxShadow:
          "inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.4)",
      }}
    >
      {/* Horizontal lines */}
      {[32, 52, 68].map((pct) => (
        <div
          key={pct}
          className="absolute left-0 right-0"
          style={{ top: `${pct}%`, height: 1, background: "rgba(0,0,0,0.18)" }}
        />
      ))}
      {/* Vertical lines */}
      {[30, 55, 72].map((pct) => (
        <div
          key={pct}
          className="absolute top-0 bottom-0"
          style={{ left: `${pct}%`, width: 1, background: "rgba(0,0,0,0.14)" }}
        />
      ))}
      {/* Center contact pad */}
      <div
        className="absolute rounded-[2px]"
        style={{
          top: "22%", left: "20%", right: "20%", bottom: "22%",
          background: "rgba(180,130,20,0.35)",
          border: "1px solid rgba(0,0,0,0.12)",
        }}
      />
    </div>
  );
}

// ─── Credit card mockup ───────────────────────────────────────────────────────
function CreditCardMockup({ companyName }: { companyName: string }) {
  const displayName = companyName.trim().toUpperCase() || "X-VALUE CORP";

  return (
    <motion.div
      className="relative mx-auto w-full"
      style={{ maxWidth: 440, perspective: 1400 }}
      initial={{ opacity: 0, rotateY: -18, y: 48 }}
      whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      {/* Ambient outer glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 55% 45%, rgba(245,158,11,0.22) 0%, rgba(234,88,12,0.12) 45%, transparent 75%)",
          filter: "blur(36px)",
          transform: "scale(1.2)",
        }}
      />

      {/* Card body */}
      <motion.div
        className="relative rounded-3xl overflow-hidden cursor-default select-none"
        style={{
          aspectRatio: "1.586 / 1",
          transformStyle: "preserve-3d",
          background:
            "linear-gradient(135deg, rgba(38,38,42,0.95) 0%, rgba(22,22,26,0.98) 45%, rgba(30,26,18,0.97) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 0 0 0.5px rgba(245,158,11,0.14), 0 36px 72px rgba(0,0,0,0.75), 0 0 100px rgba(245,158,11,0.07)",
        }}
        whileHover={{ scale: 1.025, rotateX: -3, rotateY: 5 }}
        transition={{ type: "spring", stiffness: 180, damping: 28 }}
      >
        {/* Glass highlight diagonal */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(118deg, rgba(255,255,255,0.055) 0%, transparent 38%, rgba(245,158,11,0.03) 65%, transparent 100%)",
          }}
        />

        {/* Subtle carbon-fiber texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 8px)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">

          {/* ── Top row ── */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span
                className="font-black tracking-tight leading-none"
                style={{
                  fontSize: "clamp(20px, 3.8vw, 28px)",
                  background:
                    "linear-gradient(130deg, #ffffff 0%, #f0f0f0 35%, #f7c96e 75%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                X-Bank
              </span>
              <span
                className="tracking-[0.28em] uppercase font-medium"
                style={{ fontSize: "clamp(7px, 1.2vw, 9px)", color: "rgba(245,158,11,0.65)" }}
              >
                Corporate Credit
              </span>
            </div>

            {/* Contactless NFC */}
            <div
              className="flex flex-col items-center justify-center"
              style={{ opacity: 0.38 }}
            >
              {/* Three arcs — proper NFC icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6.34 6.34a8 8 0 0 0 0 11.32" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8.46 8.46a5 5 0 0 0 0 7.07" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M10.59 10.59a2 2 0 0 0 0 2.83" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1" fill="white" />
              </svg>
            </div>
          </div>

          {/* ── Middle: chip + number ── */}
          <div className="flex flex-col gap-4">
            <EmvChip />
            <p
              className="font-mono text-white/60 tracking-[0.18em]"
              style={{ fontSize: "clamp(11px, 2.2vw, 14px)" }}
            >
              •••• &nbsp;&nbsp; •••• &nbsp;&nbsp; •••• &nbsp;&nbsp; 0001
            </p>
          </div>

          {/* ── Bottom row: cardholder + network ── */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="tracking-[0.18em] uppercase"
                style={{ fontSize: "clamp(7px, 1.1vw, 9px)", color: "rgba(255,255,255,0.22)" }}
              >
                Empresa
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={displayName}
                  className="font-semibold tracking-widest uppercase truncate"
                  style={{
                    fontSize: "clamp(9px, 1.7vw, 12px)",
                    color: "rgba(255,255,255,0.70)",
                    maxWidth: "180px",
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {displayName}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Network circles — premium Mastercard style */}
            <div className="flex items-center shrink-0" style={{ marginRight: "-2px" }}>
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  background: "radial-gradient(circle at 38% 48%, #f59e0b, #d97706)",
                  boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
                }}
              />
              <div
                className="w-8 h-8 rounded-full -ml-3"
                style={{
                  background: "radial-gradient(circle at 62% 48%, rgba(220,38,38,0.85), rgba(153,27,27,0.9))",
                  boxShadow: "0 2px 8px rgba(220,38,38,0.2)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom edge glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(245,158,11,0.45) 35%, rgba(234,88,12,0.35) 65%, transparent 95%)",
          }}
        />
        {/* Top edge micro-highlight */}
        <div
          className="absolute top-0 left-8 right-8 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
        />
      </motion.div>

      {/* Floor reflection */}
      <div
        className="absolute left-6 right-6 rounded-3xl pointer-events-none"
        style={{
          top: "calc(100% + 2px)",
          height: "35%",
          background:
            "linear-gradient(to bottom, rgba(245,158,11,0.07), transparent)",
          filter: "blur(10px)",
          transform: "scaleY(-0.6)",
          transformOrigin: "top",
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
}

// ─── Hero feature pills ───────────────────────────────────────────────────────
const HERO_PILLS = [
  { icon: Zap,    label: "Sin cuota de manejo",   accent: "#f59e0b" },
  { icon: Shield, label: "Antifraude 24/7",        accent: "#22c55e" },
  { icon: Star,   label: "Cashback corporativo",   accent: "#a78bfa" },
];

// ─── Card feature list ────────────────────────────────────────────────────────
const CARD_FEATURES = [
  {
    title: "Límite sin techo",
    desc: "Crédito revolvente calibrado al volumen real de tu operación, no a un scoring bancario genérico.",
  },
  {
    title: "Dashboard en tiempo real",
    desc: "Visibilidad granular de cada gasto corporativo con categorías, alertas y reportes automáticos.",
  },
  {
    title: "Tarjetas multi-usuario",
    desc: "Emisión ilimitada para tu equipo, con sublímites individuales y controles de categoría.",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  stats: ContractStats;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function XBankLanding({ stats }: Props) {
  const [companyName, setCompanyName] = useState("X-VALUE CORP");
  const [email, setEmail]             = useState("");
  const [submitted, setSubmitted]     = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition]  = useTransition();

  // Starts at base to avoid hydration mismatch; real value set in effect
  const [waitlistCount, setWaitlistCount] = useState(WAITLIST_BASE);
  useEffect(() => {
    setWaitlistCount(calcWaitlistCount());
  }, []);

  function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setServerError("");
    startTransition(async () => {
      const result = await joinXBankWaitlist(email, companyName);
      if (result.error) {
        setServerError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  // Real exclusivity bullets from Supabase
  const exclusivityBullets = [
    { label: "Contratos Growth activos", count: stats.growthContracts },
    { label: "Contratos AI activos",     count: stats.aiContracts     },
    { label: "Empresas en expansión",    count: stats.totalClients    },
  ];

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{ paddingTop: "6rem", paddingBottom: "7rem" }}
      id="xbank"
    >
      {/* Carousel scrollbar suppressor */}
      <style>{`#xbank [data-carousel] ::-webkit-scrollbar{display:none}`}</style>
      {/* ── Ambient layer ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Top-center amber corona */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 900,
            height: 520,
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.09) 0%, rgba(234,88,12,0.05) 55%, transparent 80%)",
            filter: "blur(1px)",
          }}
        />
        {/* Bottom-right ember */}
        <div
          className="absolute bottom-0 right-0"
          style={{
            width: 480,
            height: 480,
            background: "radial-gradient(circle, rgba(234,88,12,0.06), transparent 70%)",
          }}
        />
        {/* Top separator hairline glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(245,158,11,0.28) 40%, rgba(234,88,12,0.18) 60%, transparent 95%)",
          }}
        />
        {/* Subtle noise film */}
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col gap-24">

        {/* ══════════════════════════════════════════════════════════════════
            TAREA 1 — HERO
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center text-center gap-7">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.22em] uppercase"
              style={{
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.22)",
                color: "#e8a60a",
                letterSpacing: "0.2em",
              }}
            >
              <Rocket size={11} className="shrink-0" style={{ color: "#f59e0b" }} />
              Próximamente · Servicio en Desarrollo
              <motion.span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "#f59e0b" }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            className="leading-[1.02] tracking-tight"
            style={{
              fontSize: "clamp(38px, 7.5vw, 80px)",
              fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif",
              fontWeight: 900,
            }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <span className="text-white">El poder financiero</span>
            <br />
            <span className="text-white">de tu empresa, elevado a</span>
            <br />
            <motion.span
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, #ea580c 70%, #f59e0b 100%)",
                backgroundSize: "220% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              la X.
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="leading-relaxed max-w-lg"
            style={{
              fontSize: "clamp(15px, 1.9vw, 19px)",
              color: "rgba(255,255,255,0.5)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.22 }}
          >
            <strong className="text-white/80 font-semibold">X-Bank:</strong> La tarjeta
            de crédito corporativa diseñada para escalar tu negocio sin límites.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.36 }}
          >
            {HERO_PILLS.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium"
                style={{
                  background: `${p.accent}0b`,
                  border: `1px solid ${p.accent}1e`,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <p.icon size={10} style={{ color: p.accent }} />
                {p.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAREA 2 — CARD + PERSONALIZACIÓN + WALLETS
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-16">

          {/* Left: card + input + wallet badges */}
          <div className="w-full lg:w-[52%] shrink-0 flex flex-col gap-8">
            <CreditCardMockup companyName={companyName} />

            {/* Company name input */}
            <FadeUp delay={0.05}>
              <div
                className="rounded-2xl p-4 flex flex-col gap-3"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Pencil size={11} style={{ color: "rgba(245,158,11,0.6)" }} />
                  <span
                    className="text-[10px] tracking-[0.22em] uppercase font-semibold"
                    style={{ color: "rgba(245,158,11,0.55)" }}
                  >
                    Personaliza tu tarjeta
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) =>
                      setCompanyName(e.target.value.slice(0, 26))
                    }
                    placeholder="Nombre de tu empresa"
                    maxLength={26}
                    className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-wider uppercase text-white placeholder:text-white/20 placeholder:normal-case placeholder:tracking-normal outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      letterSpacing: "0.1em",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(245,158,11,0.07)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <span
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px]"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    {companyName.length}/26
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  El nombre se actualiza en la tarjeta en tiempo real.
                </p>
              </div>
            </FadeUp>

            {/* Wallet badges */}
            <FadeUp delay={0.1}>
              <div className="flex flex-col gap-3">
                <p
                  className="text-[11px] tracking-[0.18em] uppercase text-center"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  Añádela a tu billetera digital
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <AppleWalletBadge />
                  <GoogleWalletBadge />
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Right: copy + features */}
          <div className="flex flex-col gap-6 lg:w-[48%]">
            <FadeUp delay={0.04}>
              <div className="flex items-center gap-3">
                <div
                  className="w-px h-8 rounded-full"
                  style={{ background: "rgba(245,158,11,0.35)" }}
                />
                <span
                  className="text-[10px] tracking-[0.28em] uppercase font-semibold"
                  style={{ color: "rgba(245,158,11,0.55)" }}
                >
                  Diseñada para corporaciones
                </span>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h2
                className="text-white font-bold leading-tight"
                style={{ fontSize: "clamp(22px, 3.5vw, 34px)" }}
              >
                Una tarjeta negra que habla
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  el idioma del crecimiento.
                </span>
              </h2>
            </FadeUp>

            <div className="flex flex-col gap-3">
              {CARD_FEATURES.map((f, i) => (
                <FadeUp key={f.title} delay={0.14 + i * 0.07}>
                  <div
                    className="flex gap-3.5 p-4 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.022)",
                      border: "1px solid rgba(255,255,255,0.055)",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.18)",
                      }}
                    >
                      <CheckCircle2 size={11} style={{ color: "#f59e0b" }} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold mb-0.5">{f.title}</p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.38)" }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            BENEFITS CAROUSEL
        ══════════════════════════════════════════════════════════════════ */}
        <FadeUp>
          <div className="flex flex-col gap-7">

            {/* Section header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-px h-7 rounded-full" style={{ background: "rgba(245,158,11,0.38)" }} />
                <span
                  className="text-[10px] tracking-[0.28em] uppercase font-semibold"
                  style={{ color: "rgba(245,158,11,0.55)" }}
                >
                  Beneficios corporativos
                </span>
              </div>
              <h2
                className="text-white font-black leading-tight"
                style={{
                  fontSize: "clamp(24px, 4vw, 40px)",
                  fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif",
                }}
              >
                El control financiero en{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #f59e0b, #ea580c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  modo experto.
                </span>
              </h2>
            </div>

            {/* Carousel track */}
            <div data-carousel>
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1"
              style={{
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
                msOverflowStyle: "none",
              }}
            >
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="group relative flex flex-col gap-5 snap-start shrink-0 rounded-2xl p-6 transition-all duration-300"
                    style={{
                      width: "clamp(256px, 72vw, 300px)",
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.border = `1px solid ${b.accent}38`;
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${b.accent}0d`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Hover glow blob */}
                    <div
                      className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle, ${b.accent}18, transparent 70%)`,
                        filter: "blur(12px)",
                      }}
                    />

                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `${b.accent}12`,
                        border: `1px solid ${b.accent}22`,
                      }}
                    >
                      <Icon size={20} style={{ color: b.accent }} />
                    </div>

                    {/* Copy */}
                    <div className="flex flex-col gap-2 flex-1">
                      <p className="text-white font-semibold text-[15px] leading-snug">{b.title}</p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.38)" }}
                      >
                        {b.desc}
                      </p>
                    </div>

                    {/* Bottom accent stripe */}
                    <div
                      className="absolute bottom-0 left-4 right-4 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${b.accent}60, transparent)`,
                      }}
                    />
                  </div>
                );
              })}

              {/* Right padding sentinel — keeps last card from hugging the edge */}
              <div className="shrink-0 w-2" aria-hidden />
            </div>
            </div>{/* end data-carousel wrapper */}

            {/* Nav buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  carouselRef.current?.scrollBy({ left: -316, behavior: "smooth" })
                }
                aria-label="Anterior"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,158,11,0.28)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <ChevronLeft size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
              </button>

              <button
                onClick={() =>
                  carouselRef.current?.scrollBy({ left: 316, behavior: "smooth" })
                }
                aria-label="Siguiente"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,158,11,0.28)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5 ml-1">
                {BENEFITS.map((b, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      carouselRef.current?.scrollTo({
                        left: i * 316,
                        behavior: "smooth",
                      })
                    }
                    aria-label={b.title}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: 6,
                      height: 6,
                      background: "rgba(255,255,255,0.18)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#f59e0b";
                      (e.currentTarget as HTMLButtonElement).style.width = "18px";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
                      (e.currentTarget as HTMLButtonElement).style.width = "6px";
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ══════════════════════════════════════════════════════════════════
            TAREA 3 — EXCLUSIVIDAD (datos reales de Supabase)
        ══════════════════════════════════════════════════════════════════ */}
        <FadeUp>
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background:
                "linear-gradient(130deg, rgba(245,158,11,0.055) 0%, rgba(16,14,10,0.92) 55%, rgba(234,88,12,0.035) 100%)",
              border: "1px solid rgba(245,158,11,0.16)",
              boxShadow: "0 0 80px rgba(245,158,11,0.04)",
            }}
          >
            {/* Corner glows */}
            <div
              className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
              style={{
                background: "rgba(245,158,11,0.07)",
                filter: "blur(48px)",
              }}
            />
            <div
              className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full pointer-events-none"
              style={{
                background: "rgba(234,88,12,0.055)",
                filter: "blur(40px)",
              }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 px-8 py-10 sm:px-12 sm:py-12">

              {/* Icon block */}
              <div
                className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(245,158,11,0.07)",
                  border: "1px solid rgba(245,158,11,0.18)",
                  boxShadow: "0 0 28px rgba(245,158,11,0.07)",
                }}
              >
                <Lock size={26} style={{ color: "#f59e0b" }} />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-3 text-center sm:text-left">
                <span
                  className="inline-flex self-center sm:self-start items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.22em] uppercase"
                  style={{
                    background: "rgba(245,158,11,0.09)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    color: "#e8a60a",
                  }}
                >
                  Acceso Prioritario
                </span>

                <h3
                  className="font-bold text-white leading-snug"
                  style={{ fontSize: "clamp(18px, 3vw, 27px)" }}
                >
                  Exclusivo para clientes activos de X-Value.
                </h3>

                <p
                  className="text-sm leading-relaxed max-w-lg"
                  style={{ color: "rgba(255,255,255,0.42)" }}
                >
                  X-Bank estará disponible exclusivamente para empresas que ya
                  tienen un contrato activo con X-Value. Nuestros clientes son
                  nuestra única prioridad.
                </p>

                {/* Real stats bullets */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 mt-0.5">
                  {exclusivityBullets.map((b) => (
                    <span
                      key={b.label}
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                    >
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ background: "#f59e0b" }}
                      />
                      {b.count > 0 && (
                        <strong style={{ color: "#f59e0b" }}>{b.count}</strong>
                      )}
                      <span>{b.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ══════════════════════════════════════════════════════════════════
            TAREA 4 — WAITLIST VIP
        ══════════════════════════════════════════════════════════════════ */}
        <FadeUp>
          <div className="flex flex-col items-center text-center gap-7">

            {/* Section rule */}
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="flex-1 h-px" style={{ background: "rgba(245,158,11,0.15)" }} />
              <span
                className="text-[10px] tracking-[0.3em] uppercase font-semibold whitespace-nowrap"
                style={{ color: "rgba(245,158,11,0.45)" }}
              >
                Lista VIP
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(245,158,11,0.15)" }} />
            </div>

            <h2
              className="text-white font-black leading-none"
              style={{
                fontSize: "clamp(28px, 5vw, 52px)",
                fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif",
              }}
            >
              Sé el primero en acceder.
            </h2>

            <p
              className="max-w-sm leading-relaxed"
              style={{
                fontSize: "clamp(13px, 1.5vw, 15px)",
                color: "rgba(255,255,255,0.42)",
              }}
            >
              Regístrate ahora y asegura tu lugar preferencial cuando X-Bank
              abra sus puertas. Cupos limitados.
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(245,158,11,0.09)",
                      border: "1px solid rgba(245,158,11,0.22)",
                      boxShadow: "0 0 36px rgba(245,158,11,0.1)",
                    }}
                  >
                    <CheckCircle2 size={28} style={{ color: "#f59e0b" }} />
                  </div>
                  <p className="text-white font-semibold text-lg">¡Estás en la lista!</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
                    Te notificaremos antes del lanzamiento oficial.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleWaitlist}
                  className="w-full max-w-[460px] flex flex-col gap-3"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Fields row */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@tuempresa.com"
                      className="flex-1 min-w-0 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/22 outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(245,158,11,0.32)";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(245,158,11,0.06)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />

                    <button
                      type="submit"
                      disabled={isPending || !email.trim()}
                      className="group relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-black shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, #f7c04a 0%, #f59e0b 35%, #ea580c 100%)",
                        boxShadow:
                          "0 0 0 1px rgba(245,158,11,0.3), 0 8px 24px rgba(245,158,11,0.2)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 0 0 1px rgba(245,158,11,0.5), 0 12px 36px rgba(245,158,11,0.35), 0 0 60px rgba(234,88,12,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.transform =
                          "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 0 0 1px rgba(245,158,11,0.3), 0 8px 24px rgba(245,158,11,0.2)";
                        (e.currentTarget as HTMLButtonElement).style.transform =
                          "translateY(0)";
                      }}
                    >
                      {/* Sheen sweep on hover */}
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
                        }}
                      />
                      {isPending ? (
                        <svg className="animate-spin" width={15} height={15} viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
                          <path d="M4 12a8 8 0 018-8" stroke="black" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <>
                          Unirme a la Lista VIP
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>

                  {serverError && (
                    <p className="text-xs text-red-400 text-center">{serverError}</p>
                  )}

                  {/* Trust line */}
                  <div className="flex items-center justify-center gap-1.5">
                    <Shield size={10} style={{ color: "rgba(245,158,11,0.4)" }} />
                    <span
                      className="text-[11px]"
                      style={{ color: "rgba(255,255,255,0.22)" }}
                    >
                      Sin verificación de crédito para unirte a la lista
                    </span>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Social proof pill */}
            <div
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.055)",
              }}
            >
              {/* Avatar stack */}
              <div className="flex -space-x-2 shrink-0">
                {(["#f59e0b", "#ea580c", "#a78bfa", "#22c55e", "#38bdf8"] as const).map(
                  (c) => (
                    <div
                      key={c}
                      className="w-6 h-6 rounded-full ring-1 ring-black/50"
                      style={{ background: `${c}60` }}
                    />
                  )
                )}
              </div>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.32)" }}
              >
                <strong style={{ color: "rgba(255,255,255,0.55)" }}>+{waitlistCount}</strong> empresas ya en lista de espera
              </span>
            </div>

          </div>
        </FadeUp>

      </div>
    </section>
  );
}
