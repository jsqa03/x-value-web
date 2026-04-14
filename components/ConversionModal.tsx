"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, CheckCircle, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
}

type Step = "lead" | "otp" | "success";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_OTP = "123456";

const CALENDLY_URL =
  "https://calendly.com/juansquiceno-xvalueaigrowth/llamada-de-consultoria-inicial";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConversionModal({
  isOpen,
  onClose,
  agentName,
}: ConversionModalProps) {
  const [step, setStep] = useState<Step>("lead");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);

  // Lead form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("57"); // react-phone-input-2 value (no + prefix)

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("lead");
        setName("");
        setEmail("");
        setPhone("57");
        setOtp(["", "", "", "", "", ""]);
        setError("");
        setLoading(false);
        setLeadId(null);
      }, 300);
    }
  }, [isOpen]);

  // ── Lead submit — Supabase logic untouched ──────────────────────────────────
  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || phone.length < 8) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingresa un email corporativo válido.");
      return;
    }

    setLoading(true);
    try {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      console.log("[x-value] Intentando insertar lead en Supabase...");
      console.log("[x-value] URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

      // Format phone: react-phone-input-2 returns digits without +, e.g. "573001234567"
      const fullWhatsapp = `+${phone}`;

      const { data, error: dbError } = await supabase
        .from("leads")
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          whatsapp: fullWhatsapp,
          verification_code: verificationCode,
          is_verified: false,
        })
        .select("id")
        .single();

      if (dbError) {
        console.error("[x-value] Error de Supabase:", dbError);
        console.error("[x-value] Código:", dbError.code);
        console.error("[x-value] Mensaje:", dbError.message);
        console.error("[x-value] Detalles:", dbError.details);
        console.error("[x-value] Hint:", dbError.hint);

        if (dbError.code === "42501") {
          setError("Error de permisos (RLS). Activa INSERT para anon en la tabla 'leads'.");
        } else if (dbError.code === "42P01") {
          setError("La tabla 'leads' no existe en Supabase. Créala primero.");
        } else if (dbError.code === "23505") {
          setError("Este email ya está registrado.");
        } else {
          setError(`Error al guardar: ${dbError.message}`);
        }
        return;
      }

      console.log("[x-value] Lead guardado correctamente. ID:", data?.id);
      setLeadId(data?.id ?? null);
      setStep("otp");
    } catch (err) {
      console.error("[x-value] Error inesperado:", err);
      setError("Error de conexión. Revisa tu red e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP helpers ─────────────────────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Ingresa los 6 dígitos."); return; }

    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 800));

    if (code !== VALID_OTP) {
      setError("Código incorrecto. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    // Mark verified in Supabase (best-effort, logic untouched)
    if (leadId) {
      await supabase.from("leads").update({ is_verified: true }).eq("id", leadId);
    }

    setLoading(false);
    setStep("success");
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="relative z-10 w-full"
            style={{ maxWidth: step === "success" ? 640 : 440 }}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="glass-dark rounded-2xl overflow-hidden">

              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "#00c0f3" }}
                  />
                  <span
                    className="text-xs font-medium tracking-wider uppercase"
                    style={{ color: "#00c0f3" }}
                  >
                    {step === "lead"    && "Consultoría Gratuita"}
                    {step === "otp"     && "Verificación de Seguridad"}
                    {step === "success" && "Acceso Concedido"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white pr-8">
                  {step === "lead"    && "Agendar Consultoría Gratuita"}
                  {step === "otp"     && "Confirma tu identidad"}
                  {step === "success" && `Bienvenido, ${name.split(" ")[0]}`}
                </h2>
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <AnimatePresence mode="wait">

                  {/* ── STEP 1: Lead form ── */}
                  {step === "lead" && (
                    <motion.form
                      key="lead-form"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleLeadSubmit}
                      className="space-y-4"
                    >
                      {/* Name */}
                      <div>
                        <label className="block text-xs text-white/40 mb-1.5 tracking-wide">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Juan Pérez"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                          style={{
                            fontFamily: "'Geist', var(--font-inter), sans-serif",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "rgba(0,192,243,0.45)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,192,243,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs text-white/40 mb-1.5 tracking-wide">
                          Email corporativo
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="juan@empresa.com"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                          style={{
                            fontFamily: "'Geist', var(--font-inter), sans-serif",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "rgba(0,192,243,0.45)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,192,243,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      {/* WhatsApp — react-phone-input-2 */}
                      <div>
                        <label className="block text-xs text-white/40 mb-1.5 tracking-wide">
                          WhatsApp
                        </label>
                        <PhoneInput
                          country="co"
                          value={phone}
                          onChange={(value: string) => setPhone(value)}
                          enableSearch
                          searchPlaceholder="Buscar país..."
                          containerStyle={{ width: "100%" }}
                        />
                      </div>

                      {/* Error */}
                      {error && (
                        <div className="flex items-start gap-2 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2.5">
                          <span className="text-red-400 mt-px shrink-0 text-xs">⚠</span>
                          <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full font-bold py-3.5 rounded-lg text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-black"
                        style={{ background: "#00c0f3" }}
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Calendar size={15} />
                            Agendar Consultoría Gratuita
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-white/20">
                        Tu información está protegida · Sin spam · Sin compromiso
                      </p>
                    </motion.form>
                  )}

                  {/* ── STEP 2: OTP ── */}
                  {step === "otp" && (
                    <motion.form
                      key="otp-form"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleOtpSubmit}
                      className="space-y-6"
                    >
                      <div
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{
                          background: "rgba(0,192,243,0.04)",
                          border: "1px solid rgba(0,192,243,0.12)",
                        }}
                      >
                        <Shield size={18} style={{ color: "#00c0f3" }} className="shrink-0" />
                        <p className="text-xs text-white/40">
                          Código de 6 dígitos enviado a{" "}
                          <span className="text-white/80">+{phone}</span>
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/25 mb-4 text-center tracking-wider uppercase">
                          Ingresa el código
                        </p>
                        <div className="flex gap-2 justify-center">
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => { otpRefs.current[i] = el; }}
                              className="otp-input"
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              autoFocus={i === 0}
                            />
                          ))}
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-400 text-xs text-center">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={loading || otp.join("").length < 6}
                        className="w-full font-bold py-3.5 rounded-lg text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-black"
                        style={{ background: "#00c0f3" }}
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin text-black" />
                        ) : (
                          "Verificar identidad"
                        )}
                      </button>

                      <p className="text-center text-xs text-white/20">
                        Demo: código{" "}
                        <span style={{ color: "#00c0f3" }} className="font-mono">
                          123456
                        </span>
                      </p>
                    </motion.form>
                  )}

                  {/* ── STEP 3: Success + Calendly ── */}
                  {step === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Confirmation header */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: "rgba(0,192,243,0.1)",
                            border: "1px solid rgba(0,192,243,0.2)",
                          }}
                        >
                          <CheckCircle size={20} style={{ color: "#00c0f3" }} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            Identidad verificada
                          </p>
                          <p className="text-white/35 text-xs">
                            Elige la fecha y hora que más te convenga
                          </p>
                        </div>
                      </div>

                      {/* Calendly iframe */}
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <iframe
                          src={`${CALENDLY_URL}?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0a0a0a&text_color=ffffff&primary_color=00c0f3`}
                          width="100%"
                          height="580"
                          frameBorder="0"
                          title="Agendar consultoría x-value IA"
                          loading="lazy"
                          style={{ display: "block" }}
                        />
                      </div>

                      <button
                        onClick={onClose}
                        className="w-full border border-white/8 hover:border-white/15 text-white/40 hover:text-white/70 py-3 rounded-lg text-sm transition-all"
                      >
                        Cerrar
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
