"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (authError) {
      setError("Usuario o contraseña incorrectos. Por favor, contacta a soporte.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#05010d] flex items-center justify-center px-4">
      {/* Subtle ambient glow */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative w-full max-w-md rounded-3xl p-10 flex flex-col gap-7"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <Image
            src="/logo.png"
            alt="X-Value"
            width={120}
            height={30}
            style={{ height: "30px", width: "auto" }}
          />
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold tracking-tight mb-1">
            Portal X-Value
          </h1>
          <p className="text-white/40 text-sm">Ingresa tus credenciales</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium tracking-wide uppercase">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              required
              className="bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/25 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-medium tracking-wide uppercase">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/25 transition-colors"
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2.5"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <span className="text-red-400 text-xs mt-px">⚠</span>
              <p className="text-red-400 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #00c0f3 0%, #6366f1 100%)",
            }}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs">
          ¿Problemas para acceder?{" "}
          <a
            href="mailto:soporte@xvalueai.com"
            className="text-white/40 hover:text-white/60 transition-colors underline"
          >
            Contacta a soporte
          </a>
        </p>
      </div>
    </main>
  );
}
