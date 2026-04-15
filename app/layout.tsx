import type { Metadata } from "next";
import { Inter, Bebas_Neue, Instrument_Serif, Barlow } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "x-value IA — Inteligencia Artificial para Empresas",
  description:
    "Plataforma B2B de inteligencia artificial. Automatiza procesos, multiplica tu rentabilidad y escala con agentes de IA a medida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${bebas.variable} ${instrumentSerif.variable} ${barlow.variable} h-full`}>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/logo.png" />
        {/* Geist Sans — Vercel's typeface */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* General Sans — hero headlines */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full bg-transparent text-white antialiased"
        style={{ fontFamily: "var(--font-barlow), var(--font-inter), system-ui, sans-serif" }}
      >
        {/* ── Global video background — fixed behind every page ── */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed top-0 left-0 w-full h-full object-cover -z-20"
          style={{ pointerEvents: "none" }}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
            type="video/mp4"
          />
        </video>

        {/* ── Global dark overlay — guarantees white text contrast ── */}
        <div className="fixed inset-0 bg-black/60 -z-10 pointer-events-none" />

        {children}
      </body>
    </html>
  );
}
