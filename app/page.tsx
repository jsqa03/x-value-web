import Link from 'next/link';
import { Brain, ShoppingCart, Lock } from 'lucide-react';

const CARDS = [
  {
    icon: Brain,
    title: 'Software de IA a Medida',
    text: 'Para empresas que quieren desarrollar su propio software de IA.',
    href: '/plataforma',
    accent: '#00c0f3',
  },
  {
    icon: ShoppingCart,
    title: 'Embudos E-commerce',
    text: 'Aumenta tu facturación mínimo 5x mediante embudos de venta optimizados para tu tienda.',
    href: '/plataforma',
    accent: '#a855f7',
  },
  {
    icon: Lock,
    title: 'Portal de Clientes',
    text: 'Si ya eres parte de X-Value, accede con tus credenciales para ver tus rendimientos.',
    href: '/login',
    accent: '#fcd34d',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-transparent">
      {/* Video de fondo */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
          type="video/mp4"
        />
      </video>

      {/* Blur glow central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[984px] h-[527px] bg-gray-950/90 blur-[82px] pointer-events-none z-10 rounded-full" />

      {/* Contenido */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 max-w-5xl mx-auto py-24">

        {/* H1 */}
        <h1 className="font-sans font-bold tracking-tight leading-[1.1] text-5xl md:text-7xl lg:text-[100px] mb-6">
          <span className="text-white">Tu IA, </span>
          <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-[#6366f1] via-[#a855f7] to-[#fcd34d]">
            construida desde cero.
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-white/70 text-lg md:text-xl max-w-2xl mb-14 leading-relaxed font-light">
          Desarrollamos el software de inteligencia artificial de tu empresa
          desde la arquitectura hasta el deployment.
        </p>

        {/* 3 Tarjetas premium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative flex flex-col justify-between h-full rounded-3xl p-8 text-left transition-all duration-300 bg-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1"
              >
                {/* Accent top border */}
                <div
                  className="absolute top-0 left-6 right-6 h-px rounded-full opacity-60"
                  style={{ background: `linear-gradient(to right, transparent, ${card.accent}, transparent)` }}
                />

                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 shrink-0"
                  style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}
                >
                  <Icon size={18} style={{ color: card.accent }} />
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-white font-semibold text-base leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {card.text}
                  </p>
                </div>

                <span
                  className="mt-6 text-xs font-semibold flex items-center gap-1.5 transition-gap duration-200"
                  style={{ color: card.accent }}
                >
                  Ingresar
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}
