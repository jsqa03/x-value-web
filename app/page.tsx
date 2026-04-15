import Link from 'next/link';
import ElectricBorder from '@/components/ui/ElectricBorder';

export default function Home() {
  const servicios = [
    "Software AI Sales Tools", "Software AI for Business Operations", "Software AI Automation for Education",
    "Software AI SaaS Solutions", "Software AI Software for Law Firms", "Software AI Powered Marketing",
    "Software AI for Human Resources", "Software AI Debt Collection Software", "Software AI in Real Estate"
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#05010d]">
      {/* Hero Section */}
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
        
        {/* BOTONES ARREGLADOS */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
          <Link href="/plataforma" className="bg-[#00c0f3] text-black font-semibold rounded-full px-8 py-4 text-lg hover:bg-[#00a0cc] transition-colors flex items-center gap-2">
            Agendar Consultoría Gratuita →
          </Link>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 text-white/60 rounded-full px-6 py-4 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> 
            Demo disponible en 72 horas
          </div>
        </div>
      </div>

      {/* SECCIÓN DE SERVICIOS CON BORDES ELÉCTRICOS */}
      <div className="relative z-20 bg-[#010101] py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">Lo que hacemos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicios.map((servicio, index) => (
              <ElectricBorder key={index} color="#00c0f3" speed={1} chaos={0.15} borderRadius={16} className="h-full w-full">
                <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 h-full min-h-[160px] flex flex-col justify-center items-center text-center">
                  <h3 className="text-xl font-semibold text-white">{servicio}</h3>
                </div>
              </ElectricBorder>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
