"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Rocket,
  Lock,
  CheckCircle2,
  ArrowRight,
  Wifi,
  Shield,
  Zap,
  Star,
} from "lucide-react";

// ─── Fade-up helper ───────────────────────────────────────────────────────────
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
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Credit card mockup ───────────────────────────────────────────────────────
function CreditCardMockup() {
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: "100%", maxWidth: 420, perspective: 1200 }}
      initial={{ opacity: 0, rotateY: -15, y: 40 }}
      whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-3xl blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.18) 0%, rgba(234,88,12,0.10) 50%, transparent 80%)",
          transform: "scale(1.15)",
        }}
      />

      {/* The card */}
      <motion.div
        className="relative rounded-3xl overflow-hidden cursor-default select-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, rgba(245,158,11,0.04) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 0 0 1px rgba(245,158,11,0.12), 0 32px 64px rgba(0,0,0,0.7), 0 0 80px rgba(245,158,11,0.08)",
          aspectRatio: "1.586 / 1",
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.03, rotateX: -4, rotateY: 6 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        {/* Metallic sheen overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(245,158,11,0.04) 70%, transparent 100%)",
          }}
        />

        {/* Inner content padding */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">

          {/* Top row: Brand + Contactless */}
          <div className="flex items-start justify-between">
            {/* X-Bank wordmark */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="font-black tracking-tight leading-none"
                  style={{
                    fontSize: "clamp(22px, 4vw, 30px)",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f5f5f5 40%, #f59e0b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  X-Bank
                </span>
              </div>
              <span
                className="text-[10px] tracking-[0.25em] uppercase font-medium"
                style={{ color: "rgba(245,158,11,0.7)" }}
              >
                Corporate Card
              </span>
            </div>

            {/* Contactless icon */}
            <div className="flex flex-col items-end gap-1">
              <Wifi
                size={20}
                className="rotate-90"
                style={{ color: "rgba(255,255,255,0.35)" }}
              />
            </div>
          </div>

          {/* Middle: Smart chip + card number */}
          <div className="flex flex-col gap-4">
            {/* EMV chip */}
            <div className="flex items-center gap-3">
              <div
                className="rounded-md shrink-0"
                style={{
                  width: 44,
                  height: 34,
                  background:
                    "linear-gradient(135deg, #c9a84c 0%, #f5d580 30%, #b8922a 60%, #e2bb5a 100%)",
                  boxShadow:
                    "inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.4)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Chip lines */}
                <div
                  className="absolute"
                  style={{
                    top: "33%",
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: "rgba(0,0,0,0.25)",
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    top: "60%",
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: "rgba(0,0,0,0.25)",
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: "33%",
                    top: 0,
                    bottom: 0,
                    width: "1px",
                    background: "rgba(0,0,0,0.2)",
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: "62%",
                    top: 0,
                    bottom: 0,
                    width: "1px",
                    background: "rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>

            {/* Card number */}
            <p
              className="font-mono tracking-[0.22em] text-white/70"
              style={{ fontSize: "clamp(12px, 2.5vw, 15px)", letterSpacing: "0.2em" }}
            >
              •••• &nbsp; •••• &nbsp; •••• &nbsp; 0001
            </p>
          </div>

          {/* Bottom row: Cardholder + Network */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[9px] tracking-[0.2em] uppercase"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Cardholder
              </span>
              <span
                className="font-semibold tracking-wider uppercase"
                style={{
                  fontSize: "clamp(11px, 2vw, 14px)",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                X-VALUE CORP
              </span>
            </div>

            {/* Mastercard-style dual circle */}
            <div className="flex items-center -space-x-2.5 shrink-0">
              <div
                className="w-9 h-9 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 50%, #f59e0b 0%, #ea580c 100%)",
                  opacity: 0.9,
                }}
              />
              <div
                className="w-9 h-9 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 65% 50%, #dc2626 0%, #b91c1c 100%)",
                  opacity: 0.75,
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom ambient stripe */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), rgba(234,88,12,0.4), transparent)",
          }}
        />
      </motion.div>

      {/* Reflection card (ghost below) */}
      <div
        className="absolute left-4 right-4 -bottom-4 rounded-3xl opacity-[0.07]"
        style={{
          height: "30%",
          background:
            "linear-gradient(to bottom, rgba(245,158,11,0.3), transparent)",
          filter: "blur(8px)",
          transform: "scaleY(-1)",
        }}
      />
    </motion.div>
  );
}

// ─── Feature pill row ─────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap,    label: "Sin cuota de manejo",    accent: "#f59e0b" },
  { icon: Shield, label: "Seguro antifraude 24/7",  accent: "#22c55e" },
  { icon: Star,   label: "Cashback corporativo",    accent: "#a78bfa" },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function XBankLanding() {
  const [email, setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate async submission — replace with real endpoint
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-black py-24 sm:py-32 px-6"
      id="xbank"
    >
      {/* ── Ambient background ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Center amber glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, rgba(234,88,12,0.04) 50%, transparent 75%)",
          }}
        />
        {/* Bottom right ember */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: "rgba(234,88,12,0.05)" }}
        />
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Top separator line glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245,158,11,0.3), rgba(234,88,12,0.2), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-20">

        {/* ══════════════════════════════════════════════════════════════════
            TAREA 1 — HERO
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center text-center gap-6">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.28)",
                color: "#f59e0b",
                boxShadow: "0 0 20px rgba(245,158,11,0.10)",
              }}
            >
              <Rocket size={12} className="shrink-0" />
              Próximamente · Servicio en desarrollo
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                style={{ background: "#f59e0b" }}
              />
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h2
            className="font-black leading-[1.02] tracking-tight"
            style={{
              fontSize: "clamp(36px, 7vw, 76px)",
              fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif",
            }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <span className="text-white">El poder financiero</span>
            <br />
            <span className="text-white">de tu empresa, elevado a </span>
            <motion.span
              className="inline-block"
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #f59e0b 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              la X.
            </motion.span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-white/55 leading-relaxed max-w-xl"
            style={{ fontSize: "clamp(15px, 1.8vw, 18px)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
          >
            <span className="text-white/80 font-semibold">X-Bank:</span> La tarjeta de crédito
            corporativa diseñada para escalar tu negocio sin límites.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.38 }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium"
                style={{
                  background: `${f.accent}0d`,
                  border: `1px solid ${f.accent}22`,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                <f.icon size={11} style={{ color: f.accent }} />
                {f.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAREA 2 — CARD MOCKUP
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Card */}
          <div className="w-full lg:w-1/2 shrink-0">
            <CreditCardMockup />
          </div>

          {/* Side copy */}
          <div className="flex flex-col gap-6 lg:w-1/2">
            <FadeUp delay={0.05}>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-px h-7"
                  style={{ background: "rgba(245,158,11,0.4)" }}
                />
                <span
                  className="text-xs tracking-[0.28em] uppercase font-medium"
                  style={{ color: "rgba(245,158,11,0.6)" }}
                >
                  Diseñada para corporaciones
                </span>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h3
                className="font-bold text-white leading-tight"
                style={{ fontSize: "clamp(22px, 3.5vw, 32px)" }}
              >
                Una tarjeta negra que
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #f59e0b, #ea580c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  habla el idioma del crecimiento.
                </span>
              </h3>
            </FadeUp>

            <div className="flex flex-col gap-3.5">
              {[
                { title: "Límite sin techo",         desc: "Crédito revolvente ajustado al tamaño real de tu operación, no a un scoring bancario genérico." },
                { title: "Dashboard en tiempo real", desc: "Visibilidad total de cada gasto corporativo, con categorías y alertas automáticas." },
                { title: "Multi-usuario",             desc: "Tarjetas adicionales para cada miembro de tu equipo, con límites individuales configurables." },
              ].map((item, i) => (
                <FadeUp key={item.title} delay={0.14 + i * 0.07}>
                  <div
                    className="flex gap-3.5 p-4 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      <CheckCircle2 size={11} style={{ color: "#f59e0b" }} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold mb-0.5">{item.title}</p>
                      <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAREA 3 — EXCLUSIVIDAD
        ══════════════════════════════════════════════════════════════════ */}
        <FadeUp>
          <div
            className="relative rounded-3xl overflow-hidden px-8 py-10 sm:px-12 sm:py-12 flex flex-col sm:flex-row items-center gap-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(10,10,10,0.8) 60%, rgba(234,88,12,0.04) 100%)",
              border: "1px solid rgba(245,158,11,0.18)",
              boxShadow: "0 0 60px rgba(245,158,11,0.05)",
            }}
          >
            {/* Decorative corner glow */}
            <div
              className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none"
              style={{ background: "rgba(245,158,11,0.08)" }}
            />
            <div
              className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none"
              style={{ background: "rgba(234,88,12,0.06)" }}
            />

            {/* Lock icon block */}
            <div
              className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                boxShadow: "0 0 30px rgba(245,158,11,0.08)",
              }}
            >
              <Lock size={28} style={{ color: "#f59e0b" }} />
            </div>

            {/* Text */}
            <div className="relative z-10 flex flex-col gap-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span
                  className="text-xs font-bold tracking-[0.25em] uppercase px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.22)",
                    color: "#f59e0b",
                  }}
                >
                  Acceso Prioritario
                </span>
              </div>
              <h3
                className="font-bold text-white leading-tight"
                style={{ fontSize: "clamp(18px, 3vw, 26px)" }}
              >
                Exclusivo para clientes activos de X-Value.
              </h3>
              <p className="text-white/45 text-sm leading-relaxed max-w-lg">
                X-Bank estará disponible exclusivamente para empresas que ya tienen
                un contrato activo con X-Value. Nuestros clientes son nuestra
                única prioridad.
              </p>

              {/* Bullets */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1 mt-1">
                {["Contratos Growth activos", "Contratos AI activos", "Empresas en expansión"].map(
                  (b) => (
                    <span
                      key={b}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ background: "#f59e0b" }}
                      />
                      {b}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ══════════════════════════════════════════════════════════════════
            TAREA 4 — WAITLIST CTA
        ══════════════════════════════════════════════════════════════════ */}
        <FadeUp>
          <div className="flex flex-col items-center text-center gap-6">

            {/* Section label */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-px" style={{ background: "rgba(245,158,11,0.3)" }} />
              <span
                className="text-xs tracking-[0.3em] uppercase font-medium"
                style={{ color: "rgba(245,158,11,0.5)" }}
              >
                Lista de Espera VIP
              </span>
              <div className="w-10 h-px" style={{ background: "rgba(245,158,11,0.3)" }} />
            </div>

            <h3
              className="font-bold text-white leading-tight"
              style={{ fontSize: "clamp(22px, 4vw, 42px)", fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
            >
              Sé el primero en acceder.
            </h3>
            <p
              className="text-white/45 max-w-md leading-relaxed"
              style={{ fontSize: "clamp(13px, 1.5vw, 15px)" }}
            >
              Regístrate ahora y asegura tu lugar preferencial cuando X-Bank abra
              sus puertas. Cupos limitados.
            </p>

            {submitted ? (
              /* ── Success state ── */
              <motion.div
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    boxShadow: "0 0 30px rgba(245,158,11,0.12)",
                  }}
                >
                  <CheckCircle2 size={26} style={{ color: "#f59e0b" }} />
                </div>
                <p className="text-white font-semibold text-lg">
                  ¡Estás en la lista!
                </p>
                <p className="text-white/40 text-sm">
                  Te notificaremos antes del lanzamiento oficial.
                </p>
              </motion.div>
            ) : (
              /* ── Form ── */
              <form
                onSubmit={handleWaitlist}
                className="w-full max-w-md flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="flex-1 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
                  }
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-black transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
                    boxShadow: "0 0 24px rgba(245,158,11,0.25)",
                  }}
                >
                  {loading ? (
                    <svg
                      className="animate-spin"
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  ) : (
                    <>
                      Unirme a la Lista VIP
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Trust line */}
            <p
              className="flex items-center gap-2 text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              <Shield size={11} style={{ color: "rgba(245,158,11,0.4)" }} />
              Asegura tu lugar · Sin verificación de crédito para unirte a la lista
            </p>

            {/* Social proof */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <div className="flex -space-x-1.5">
                {["#f59e0b", "#ea580c", "#a78bfa", "#22c55e"].map((c) => (
                  <div
                    key={c}
                    className="w-5 h-5 rounded-full border border-black/40 shrink-0"
                    style={{ background: `${c}50` }}
                  />
                ))}
              </div>
              <span>+47 empresas ya en lista de espera</span>
            </div>
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
