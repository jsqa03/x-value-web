import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { BarChart2, Users, TrendingUp, Zap } from "lucide-react";

const STATS = [
  { label: "Leads calificados", value: "—", accent: "#00c0f3", icon: Users },
  { label: "Cierre estimado",   value: "—", accent: "#D1FF48", icon: TrendingUp },
  { label: "Tareas automatizadas", value: "—", accent: "#a855f7", icon: Zap },
  { label: "ROI acumulado",     value: "—", accent: "#fcd34d", icon: BarChart2 },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#05010d] text-white">
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,192,243,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          background: "rgba(5,1,13,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="X-Value"
              width={110}
              height={28}
              style={{ height: "28px", width: "auto" }}
              priority
            />
            <span
              className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "rgba(0,192,243,0.1)",
                border: "1px solid rgba(0,192,243,0.2)",
                color: "#00c0f3",
              }}
            >
              Panel de Control
            </span>
          </div>
          <LogoutButton />
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20">

        {/* Welcome header */}
        <div className="mb-10">
          <p className="text-white/40 text-sm mb-1">Bienvenido de vuelta</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Panel de Control{" "}
            <span style={{ color: "#00c0f3" }}>X-Value</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Sesión activa:{" "}
            <span className="text-white/60 font-medium">{user.email}</span>
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${s.accent}12`,
                    border: `1px solid ${s.accent}25`,
                  }}
                >
                  <Icon size={16} style={{ color: s.accent }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming soon panel */}
        <div
          className="rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[240px]"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(0,192,243,0.08)",
              border: "1px solid rgba(0,192,243,0.15)",
            }}
          >
            <Zap size={20} style={{ color: "#00c0f3" }} />
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-1">
              Tu panel de métricas está en construcción
            </p>
            <p className="text-white/40 text-sm max-w-md">
              Aquí verás tus KPIs, rendimiento de agentes IA, leads y más.
              Tu equipo de X-Value está configurando tu cuenta.
            </p>
          </div>
          <Link
            href="/plataforma"
            className="mt-2 text-xs font-medium transition-colors"
            style={{ color: "#00c0f3" }}
          >
            Ver plataforma →
          </Link>
        </div>
      </div>
    </main>
  );
}
