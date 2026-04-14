"use client";

import Marquee from "react-fast-marquee";

const COMPANIES = [
  "BANCOLOMBIA",
  "GRUPO NUTRESA",
  "ISA INTERCOLOMBIA",
  "DAVIVIENDA",
  "ECOPETROL",
  "CEMENTOS ARGOS",
  "GRUPO SURA",
  "AVIANCA",
  "RAPPI",
  "GRUPO ÉXITO",
  "CARVAJAL",
  "GRUPO AVAL",
];

export default function ClientsMarquee() {
  return (
    <section className="py-10 relative overflow-hidden">
      {/* fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #0a0a0a, transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, #0a0a0a, transparent)",
        }}
      />

      <Marquee
        speed={35}
        gradient={false}
        pauseOnHover
        autoFill
        className="overflow-hidden"
      >
        {COMPANIES.map((name) => (
          <span
            key={name}
            className="mx-10 text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.18)" }}
          >
            {name}
          </span>
        ))}
      </Marquee>

      <p className="text-center text-xs text-white/15 tracking-widest uppercase mt-6">
        Empresas que ya confían en x-value ia
      </p>
    </section>
  );
}
