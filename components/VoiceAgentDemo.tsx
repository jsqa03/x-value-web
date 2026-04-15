"use client";

import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Phone,
  CheckCircle,
  Loader2,
  UserCheck,
  Headphones,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: UserCheck,
    title: "Lead Qualification",
    desc: "Califica prospectos automáticamente y agenda reuniones en tiempo real.",
    accent: "#D1FF48",
  },
  {
    icon: Headphones,
    title: "Customer Service",
    desc: "Atención natural 24/7, resuelve dudas y escala casos complejos.",
    accent: "#00C0F3",
  },
  {
    icon: TrendingUp,
    title: "Sales Follow-up",
    desc: "Seguimiento proactivo post-reunión sin intervención humana.",
    accent: "#A78BFA",
  },
  {
    icon: Clock,
    title: "After-hours Support",
    desc: "Tu empresa nunca cierra. Captura oportunidades a cualquier hora.",
    accent: "#D1FF48",
  },
];

export default function VoiceAgentDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [waCode, setWaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !company.trim()) {
      setError("Nombre y empresa son obligatorios.");
      return;
    }
    if (!phone || !isValidPhoneNumber(phone)) {
      setError("Ingresa un número de teléfono válido con código de país.");
      return;
    }

    setLoading(true);
    // Simulate call initiation (replace with real API call)
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-px h-8 bg-white/20" />
          <span className="text-xs tracking-[0.3em] text-white/30 uppercase">
            Demo en Vivo
          </span>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl text-white mb-2"
          style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
        >
          Habla con{" "}
          <span style={{ color: "#D1FF48" }}>X-Sarah</span>
        </motion.h2>

        <motion.p
          className="text-sm text-gray-300 mb-10 max-w-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          Habla en vivo con X-Sarah, nuestro agente de voz. Ingresa tu número
          y recibe una llamada IA en segundos.
        </motion.p>

        {/* Two-column layout */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* LEFT — Form */}
          <div
            className="rounded-2xl p-8 flex flex-col justify-between"
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 40px rgba(0,0,0,0.4)",
            }}
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <p className="text-white font-semibold text-base mb-1">
                      Recibe una llamada IA ahora
                    </p>
                    <p className="text-sm text-gray-300">
                      Sin instalaciones · Sin esperas · 100% gratuito
                    </p>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 tracking-wide">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Pérez"
                      className="voice-input"
                    />
                  </div>

                  {/* Company */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 tracking-wide">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Nombre de tu empresa"
                      className="voice-input"
                    />
                  </div>

                  {/* Phone — react-phone-number-input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/40 tracking-wide">
                        Número de teléfono
                      </label>
                      <button
                        type="button"
                        className="text-xs font-medium transition-colors"
                        style={{ color: "#D1FF48" }}
                      >
                        Enviar código
                      </button>
                    </div>
                    <div className="phone-input-wrapper">
                      <PhoneInput
                        international
                        defaultCountry="CO"
                        value={phone}
                        onChange={(val) => setPhone(val ?? "")}
                        placeholder="300 000 0000"
                      />
                    </div>
                  </div>

                  {/* WhatsApp verification code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 tracking-wide">
                      Código de verificación WhatsApp
                    </label>
                    <input
                      type="text"
                      value={waCode}
                      onChange={(e) => setWaCode(e.target.value)}
                      placeholder="Ingresa el código de 6 dígitos"
                      maxLength={6}
                      className="voice-input"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2.5"
                      style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <span className="text-red-400 text-xs mt-px">⚠</span>
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm text-black tracking-wide mt-1 disabled:opacity-60"
                    style={{ background: "#D1FF48" }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-black" />
                        Iniciando llamada...
                      </>
                    ) : (
                      <>
                        <Phone size={15} />
                        Recibe una llamada IA ahora
                        <ArrowRight size={14} />
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-white/20">
                    Al continuar, aceptas ser contactado por x-value IA. Sin spam.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center gap-5 py-8 text-center"
                >
                  {/* Animated ring */}
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: "rgba(209,255,72,0.15)" }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(209,255,72,0.12)",
                        border: "1px solid rgba(209,255,72,0.3)",
                      }}
                    >
                      <CheckCircle size={28} style={{ color: "#D1FF48" }} />
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-bold text-lg mb-1">
                      ¡Llamada iniciada!
                    </p>
                    <p className="text-gray-300 text-sm max-w-xs">
                      X-Sarah te llamará en los próximos{" "}
                      <span className="text-white">30 segundos</span> al número{" "}
                      <span style={{ color: "#D1FF48" }}>{phone}</span>.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setCompany("");
                      setPhone("");
                    }}
                    className="text-xs text-white/25 hover:text-white/50 transition-colors"
                  >
                    Intentar con otro número
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  className="rounded-xl p-5 flex flex-col gap-3"
                  style={{
                    background: "#111111",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${f.accent}12`,
                      border: `1px solid ${f.accent}20`,
                    }}
                  >
                    <Icon size={16} style={{ color: f.accent }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold text-white mb-1"
                      style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}
                    >
                      {f.title}
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
