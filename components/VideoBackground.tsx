"use client";

import { useEffect, useRef } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4";

const FADE = 0.5; // seconds for fade-in / fade-out

interface Props { fixed?: boolean; }

export default function VideoBackground({ fixed = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tick = () => {
      if (video.duration && !isNaN(video.duration)) {
        const t = video.currentTime;
        const d = video.duration;
        let opacity: number;
        if (t < FADE) {
          opacity = t / FADE;
        } else if (t > d - FADE) {
          opacity = (d - t) / FADE;
        } else {
          opacity = 1;
        }
        video.style.opacity = String(Math.max(0, Math.min(1, opacity)));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      autoPlay
      muted
      loop
      playsInline
      style={{
        position: fixed ? "fixed" : "absolute",
        top: 0,
        left: 0,
        width: fixed ? "100vw" : "100%",
        height: fixed ? "100vh" : "100%",
        objectFit: "cover",
        opacity: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
