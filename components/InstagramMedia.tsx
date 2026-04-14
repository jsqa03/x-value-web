"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Share2 } from "lucide-react";

const REEL_ID = "DWzmSJugjzI";
const INSTAGRAM_URL = "https://www.instagram.com/xvalueai/";
const REEL_EMBED = `https://www.instagram.com/reel/${REEL_ID}/embed/`;

interface ReelMediaProps {
  title?: string;
  subtitle?: string;
}

export default function Share2Media({
  title = "Míranos en acción",
  subtitle = "Descubre cómo nuestros agentes transforman negocios reales.",
}: ReelMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-px h-8 bg-white/20" />
          <div className="flex items-center gap-2">
            <Share2 size={12} style={{ color: "#00c0f3" }} />
            <span className="text-xs tracking-[0.3em] text-white/50 uppercase">
              x-value IA
            </span>
          </div>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl text-white mb-2"
          style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, sans-serif" }}
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="text-sm mb-10 max-w-md"
          style={{ color: "rgba(255,255,255,0.55)" }}
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
        >
          {subtitle}
        </motion.p>

        {/* 9:16 Reel container — centered, max-width ~340px */}
        <motion.div
          className="relative mx-auto rounded-2xl overflow-hidden"
          style={{
            maxWidth: 340,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 60px rgba(0,192,243,0.06), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          {/* Top bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <Share2 size={11} style={{ color: "#00c0f3", opacity: 0.8 }} />
            <span className="text-xs text-white/40 flex-1">
              instagram.com · x-value IA
            </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/20 hover:text-white/50 transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Share2 Reel iframe — 9:16 */}
          <div className="relative" style={{ paddingBottom: "177.77%", height: 0 }}>
            <iframe
              src={REEL_EMBED}
              title="x-value IA — Reel"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </div>
        </motion.div>

        {/* CTA link */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)"; }}
          >
            <Share2 size={10} />
            Síguenos en Share2
            <ExternalLink size={10} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
