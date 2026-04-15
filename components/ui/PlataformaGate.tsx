import React from 'react';

export default function PlataformaGate() {
  return (
    <section className="relative w-full py-32 bg-[#05010d] flex flex-col items-center justify-center overflow-hidden border-t border-white/5">
      {/* Fondo sutil (Continuidad del morado) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
        {/* Etiqueta superior */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-white/80 text-xs font-medium tracking-wide uppercase">Acceso Anticipado Disponible</span>
        </div>

        {/* Título Principal */}
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
          Diseña el futuro.<br/>
          <span className="text-white/50">Lidera el mercado.</span>
        </h2>

        {/* Descripción */}
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-12 font-light">
          Nuestros programas intensivos de DesignPro empoderan a fundadores y diseñadores con el conocimiento técnico de IA para lanzar productos globales.
        </p>

        {/* Tarjeta Glassmorphism de Acción */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center text-left">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Plazas Limitadas</h3>
              <p className="text-white/60 mb-6">Únete a los más de 8000 profesionales que ya han transformado sus carreras.</p>
              <button className="w-full bg-white text-black font-semibold rounded-full py-4 px-6 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                Aplicar a la siguiente cohorte
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="hidden md:flex justify-center border-l border-white/10 pl-8">
               <div className="text-center">
                 <div className="text-5xl font-bold text-cyan-400 mb-2">8k+</div>
                 <div className="text-white/60 text-sm uppercase tracking-widest">Diseñadores Lanzados</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
