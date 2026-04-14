"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

// Mercator coords for each country (lat, lng)
const MARKERS = [
  { location: [23.6345, -102.5528] as [number, number], size: 0.07 }, // México
  { location: [4.5709, -74.2973] as [number, number], size: 0.06 },   // Colombia
  { location: [6.4238, -66.5897] as [number, number], size: 0.055 },  // Venezuela
  { location: [-1.8312, -78.1834] as [number, number], size: 0.055 }, // Ecuador
  { location: [-14.235, -51.9253] as [number, number], size: 0.09 },  // Brasil
  { location: [-38.4161, -63.6167] as [number, number], size: 0.07 }, // Argentina
  { location: [40.4637, -3.7492] as [number, number], size: 0.065 },  // España
  { location: [39.3999, -8.2245] as [number, number], size: 0.055 },  // Portugal
  { location: [41.8719, 12.5674] as [number, number], size: 0.055 },  // Italia
  { location: [35.9375, 14.3754] as [number, number], size: 0.045 },  // Malta
];

export default function InteractiveMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0.6);
  const isDragging = useRef(false);
  const prevX = useRef(0);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let w = container.offsetWidth;
    canvas.width = w * 2;
    canvas.height = w * 2;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: w * 2,
      height: w * 2,
      phi: phiRef.current,
      theta: 0.25,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 20000,
      mapBrightness: 5,
      baseColor: [0.07, 0.07, 0.07],
      markerColor: [0.0, 0.75, 0.95],
      glowColor: [0.0, 0.3, 0.45],
      markers: MARKERS,
      onRender(state) {
        if (!isDragging.current) {
          phiRef.current += 0.004;
        }
        state.phi = phiRef.current;
        state.width = w * 2;
        state.height = w * 2;
      },
    } as any);

    // Resize observer
    const ro = new ResizeObserver(() => {
      w = container.offsetWidth;
    });
    ro.observe(container);

    return () => {
      globeRef.current?.destroy();
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ aspectRatio: "1/1" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: isDragging.current ? "grabbing" : "grab",
          contain: "layout paint size",
        }}
        onPointerDown={(e) => {
          isDragging.current = true;
          prevX.current = e.clientX;
          (e.currentTarget as HTMLCanvasElement).style.cursor = "grabbing";
        }}
        onPointerUp={(e) => {
          isDragging.current = false;
          (e.currentTarget as HTMLCanvasElement).style.cursor = "grab";
        }}
        onPointerOut={(e) => {
          isDragging.current = false;
          (e.currentTarget as HTMLCanvasElement).style.cursor = "grab";
        }}
        onPointerMove={(e) => {
          if (!isDragging.current) return;
          const delta = e.clientX - prevX.current;
          phiRef.current += delta * 0.006;
          prevX.current = e.clientX;
        }}
      />
    </div>
  );
}
