"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Play } from "lucide-react";

// ─── Replace VIDEO_ID with your actual YouTube video ID ────────────────────
// Example: "dQw4w9WgXcQ" → https://www.youtube.com/watch?v=dQw4w9WgXcQ
const YOUTUBE_VIDEO_ID = "YOUR_VIDEO_ID";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@xvalueai"; // ← update

const EMBED_SRC = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&color=white&controls=1`;

interface VideoMediaProps {
  videoId?: string;
  title?: string;
  subtitle?: string;
}

export default function InstagramMedia({
  videoId = YOUTUBE_VIDEO_ID,
  title = "Míranos en acción",
  subtitle = "Descubre cómo nuestros agentes transforman negocios reales.",
}: VideoMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=white&controls=1`;

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
            <Play size={12} fill="#00c0f3" style={{ color: "#00c0f3" }} />
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

        {/* 16:9 video container */}
        <motion.div
          className="relative mx-auto rounded-2xl overflow-hidden"
          style={{
            maxWidth: 760,
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
            <Play size={11} fill="#00c0f3" style={{ color: "#00c0f3", opacity: 0.8 }} />
            <span className="text-xs text-white/40 flex-1">
              youtube.com · x-value IA
            </span>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/20 hover:text-white/50 transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          </div>

          {/* YouTube iframe — 16:9 */}
          <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={src}
              title="x-value IA — Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)"; }}
          >
            <span style={{ fontSize: "0.85rem" }}>▶</span>
            Síguenos en YouTube
            <ExternalLink size={10} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
