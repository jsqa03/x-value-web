"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, ChevronRight } from "lucide-react";

const CALENDLY_URL =
  "https://calendly.com/juansquiceno-xvalueaigrowth/llamada-de-consultoria-inicial";

export default function CalendlyCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3 rounded-full font-bold text-sm text-black shadow-2xl"
        style={{
          background: "#D1FF48",
          boxShadow: "0 0 30px rgba(209,255,72,0.35), 0 4px 20px rgba(0,0,0,0.5)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <Calendar size={15} />
        Agendar Demo
        <ChevronRight size={13} />
      </motion.button>

      {/* Popup overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="calendly-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative z-10 w-full max-w-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(24px)",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-6 py-4 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "#D1FF48" }}
                    />
                    <span className="text-sm font-semibold text-white">
                      Agendar Consultoría Gratuita
                    </span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Calendly iframe */}
                <iframe
                  src={`${CALENDLY_URL}?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0a0a0a&text_color=ffffff&primary_color=D1FF48`}
                  width="100%"
                  height="620"
                  frameBorder="0"
                  title="Agendar consultoría x-value IA"
                  loading="lazy"
                  style={{ display: "block" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
