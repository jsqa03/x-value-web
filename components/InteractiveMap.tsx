"use client";

import { useEffect, useRef, useState } from "react";

interface Marker {
  lat: number;
  lng: number;
  flag: string;
  name: string;
}

const MARKERS: Marker[] = [
  { lat: 23.63,  lng: -102.55, flag: "🇲🇽", name: "México"    },
  { lat:  4.57,  lng:  -74.30, flag: "🇨🇴", name: "Colombia"  },
  { lat:  6.42,  lng:  -66.59, flag: "🇻🇪", name: "Venezuela" },
  { lat: -1.83,  lng:  -78.18, flag: "🇪🇨", name: "Ecuador"   },
  { lat:-14.24,  lng:  -51.93, flag: "🇧🇷", name: "Brasil"    },
  { lat:-38.42,  lng:  -63.62, flag: "🇦🇷", name: "Argentina" },
  { lat: 40.46,  lng:   -3.75, flag: "🇪🇸", name: "España"    },
  { lat: 39.40,  lng:   -8.22, flag: "🇵🇹", name: "Portugal"  },
  { lat: 41.87,  lng:   12.57, flag: "🇮🇹", name: "Italia"    },
  { lat: 35.94,  lng:   14.38, flag: "🇲🇹", name: "Malta"     },
];

type GlobeInstance = {
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    minDistance: number;
    maxDistance: number;
  };
};

export default function InteractiveMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const [Globe, setGlobe] = useState<React.ComponentType<any> | null>(null);
  const [size, setSize] = useState(0);

  // Lazy-load react-globe.gl (client-only — uses WebGL / browser APIs)
  useEffect(() => {
    import("react-globe.gl").then((mod) => {
      setGlobe(() => mod.default as React.ComponentType<any>);
    });
  }, []);

  // Track container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(el.offsetWidth));
    ro.observe(el);
    setSize(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Configure OrbitControls after globe mounts
  const onGlobeReady = () => {
    const ctrl = globeRef.current?.controls?.();
    if (ctrl) {
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = 0.35;
      ctrl.minDistance = 240;
      ctrl.maxDistance = 520;
    }
  };

  const htmlElementBuilder = (d: object): HTMLElement => {
    const marker = d as Marker;
    const el = document.createElement("div");
    el.style.cssText = [
      "font-size:1.55rem",
      "line-height:1",
      "user-select:none",
      "pointer-events:none",
      "filter:drop-shadow(0 2px 6px rgba(0,0,0,0.75))",
    ].join(";");
    el.title = marker.name;
    el.textContent = marker.flag;
    return el;
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden" }}
    >
      {Globe && size > 0 && (
        <Globe
          ref={globeRef as any}
          width={size}
          height={size}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          atmosphereColor="#00c0f3"
          atmosphereAltitude={0.18}
          htmlElementsData={MARKERS}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.02}
          htmlElement={htmlElementBuilder}
          enablePointerInteraction={true}
          onGlobeReady={onGlobeReady}
        />
      )}
    </div>
  );
}
