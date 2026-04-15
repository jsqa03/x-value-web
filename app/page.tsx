import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#05010d]">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-80">
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[984px] h-[527px] bg-gray-950/90 blur-[82px] pointer-events-none z-10 rounded-full"></div>
      
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 max-w-5xl mx-auto pt-20">
        <h1 className="font-sans font-bold tracking-tight leading-[1.1] text-5xl md:text-7xl lg:text-[100px] mb-6">
          <span className="text-white">Tu IA, </span>
          <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-[#6366f1] via-[#a855f7] to-[#fcd34d]">
            construida desde cero.
          </span>
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-light">
          No vendemos automatizaciones genéricas. Desarrollamos el software de inteligencia artificial de tu empresa desde la arquitectura hasta el deployment.
        </p>
        <div className="flex gap-4 items-center justify-center flex-wrap">
          <Link href="/plataforma" className="bg-[#00c0f3] text-black font-semibold rounded-full px-8 py-4 text-lg hover:bg-[#00a0cc] transition-colors flex items-center gap-2">
            Agendar Consultoría Gratuita <ArrowRight size={20} />
          </Link>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 text-white/60 rounded-full px-6 py-4 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Demo disponible en 72 horas
          </div>
        </div>
      </div>
    </main>
  );
}
