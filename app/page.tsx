import Link from 'next/link';

export default function Home() {
  const cards = [
    {
      title: 'Software de IA a Medida',
      text: 'Para empresas que quieren desarrollar su propio software de IA.',
      href: '/plataforma',
    },
    {
      title: 'Embudos E-commerce',
      text: 'Aumenta tu facturación mínimo 5x mediante embudos creados con IA.',
      href: '/plataforma',
    },
    {
      title: 'Portal de Clientes',
      text: 'Si ya eres parte de X-Value, accede con tus credenciales para ver tus rendimientos.',
      href: '/login',
    },
  ];

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

        {/* 3 Tarjetas glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
          {cards.map((card) => (
            <Link
              key={card.href + card.title}
              href={card.href}
              className="group relative flex flex-col gap-3 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 30px rgba(0,192,243,0.12)' }} />

              <h3 className="text-white font-semibold text-base leading-snug">
                {card.title}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">
                {card.text}
              </p>
              <span className="mt-auto text-xs font-medium text-[#00c0f3] flex items-center gap-1">
                Ingresar
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
