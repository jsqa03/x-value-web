"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  colorBase: string;
  life: number;
  maxLife: number;
}

const COLORS = [
  "0,192,243",   // cyan
  "209,255,72",  // lime accent
  "255,255,255", // white
  "255,255,255", // white (more common)
  "255,255,255",
];

function createParticle(w: number, h: number, scatter = false): Particle {
  const maxLife = 180 + Math.random() * 200;
  return {
    x: Math.random() * w,
    y: scatter ? Math.random() * h : h + 10,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -(Math.random() * 0.4 + 0.15),
    radius: Math.random() * 1.2 + 0.3,
    opacity: Math.random() * 0.12 + 0.02,
    colorBase: COLORS[Math.floor(Math.random() * COLORS.length)],
    life: 0,
    maxLife,
  };
}

export default function AntigravityBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const particles: Particle[] = [];
    const COUNT = 90;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    for (let i = 0; i < COUNT; i++) {
      particles.push(createParticle(canvas.width, canvas.height, true));
    }
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.008;
        p.vx = Math.max(-0.35, Math.min(0.35, p.vx));
        p.life++;

        // fade in / fade out envelope
        const progress = p.life / p.maxLife;
        const envelope =
          progress < 0.1
            ? progress / 0.1
            : progress > 0.8
            ? (1 - progress) / 0.2
            : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorBase},${p.opacity * envelope})`;
        ctx.fill();

        if (p.life >= p.maxLife || p.y < -10) {
          particles.splice(i, 1);
          particles.push(createParticle(canvas.width, canvas.height));
        }
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.7 }}
    />
  );
}
