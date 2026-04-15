import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-[#05010d] flex items-center justify-center px-4">
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(252,211,77,0.06) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative w-full max-w-md rounded-3xl p-10 flex flex-col items-center gap-6 text-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex justify-center mb-2">
          <Image
            src="/logo.png"
            alt="X-Value"
            width={100}
            height={25}
            style={{ height: "25px", width: "auto", opacity: 0.6 }}
          />
        </div>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(252,211,77,0.08)",
            border: "1px solid rgba(252,211,77,0.2)",
          }}
        >
          <AlertTriangle size={24} style={{ color: "#fcd34d" }} />
        </div>

        <div>
          <h1 className="text-white text-xl font-bold mb-2">Perfil no configurado</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Tu cuenta existe pero aún no tiene un perfil asignado en el sistema.
            Contacta a tu administrador de X-Value para completar la configuración.
          </p>
        </div>

        <div
          className="w-full rounded-xl p-4 text-left"
          style={{
            background: "rgba(252,211,77,0.05)",
            border: "1px solid rgba(252,211,77,0.12)",
          }}
        >
          <p className="text-white/50 text-xs mb-1 font-medium uppercase tracking-wide">
            Próximos pasos
          </p>
          <ul className="text-white/40 text-xs space-y-1.5 list-none">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
              Escríbenos a soporte@xvalueai.com
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
              Incluye el email de tu cuenta
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
              Tu acceso se activará en menos de 24 h
            </li>
          </ul>
        </div>

        <a
          href="mailto:soporte@xvalueai.com"
          className="w-full py-3 rounded-xl text-sm font-semibold text-black text-center transition-opacity hover:opacity-90"
          style={{ background: "#fcd34d" }}
        >
          Contactar soporte
        </a>

        <Link href="/login" className="text-white/25 hover:text-white/50 text-xs transition-colors">
          Volver al login
        </Link>
      </div>
    </main>
  );
}
