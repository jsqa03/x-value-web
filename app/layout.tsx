import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
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
    <html lang="es" className={`${inter.variable} ${bebas.variable} h-full`}>
      <body className="min-h-full bg-[#050505] text-[#f5f5f5] antialiased">
        {children}
      </body>
    </html>
  );
}
