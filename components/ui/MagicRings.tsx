"use client";

import { useEffect, useRef } from "react";
import "./MagicRings.css";

interface MagicRingsProps {
  color?: string;
  colorTwo?: string;
}

const VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorTwo;
  varying vec3 vNormal;
  void main() {
    float t = 0.5 + 0.5 * sin(uTime * 1.4);
    vec3 col = mix(uColor, uColorTwo, t);
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.8);
    float pulse = 0.55 + 0.45 * sin(uTime * 2.2);
    float alpha = fresnel * pulse * 0.7;
    gl_FragColor = vec4(col, alpha);
  }
`;

function hexToThreeColor(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

export default function MagicRings({ color = "#00c0f3", colorTwo = "#a855f7" }: MagicRingsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let frameId: number;
    let renderer: import("three").WebGLRenderer;

    import("three").then((THREE) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const [r1, g1, b1] = hexToThreeColor(color);
      const [r2, g2, b2] = hexToThreeColor(colorTwo);

      const ringConfigs = [
        { radius: 2.2, tube: 0.012, rotX: 0.4, rotY: 0.0, rotZ: 0.0 },
        { radius: 1.8, tube: 0.010, rotX: 0.8, rotY: 0.3, rotZ: 0.5 },
        { radius: 2.6, tube: 0.008, rotX: -0.3, rotY: 0.6, rotZ: 0.2 },
        { radius: 1.4, tube: 0.014, rotX: 1.2, rotY: -0.4, rotZ: 0.8 },
        { radius: 3.0, tube: 0.007, rotX: -0.6, rotY: 0.9, rotZ: -0.3 },
      ];

      const meshes: import("three").Mesh[] = [];

      for (const cfg of ringConfigs) {
        const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 8, 200);
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Vector3(r1, g1, b1) },
            uColorTwo: { value: new THREE.Vector3(r2, g2, b2) },
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);
        scene.add(mesh);
        meshes.push(mesh);
      }

      let startTime = performance.now();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const elapsed = (performance.now() - startTime) / 1000;

        meshes.forEach((mesh, i) => {
          (mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
          mesh.rotation.y += 0.0015 * (i % 2 === 0 ? 1 : -1);
          mesh.rotation.x += 0.001 * (i % 3 === 0 ? 1 : -0.5);
        });

        renderer.render(scene, camera);
      };

      animate();

      const onResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", onResize);

      // Store cleanup in closure
      (container as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      const el = container as HTMLElement & { _cleanup?: () => void };
      el._cleanup?.();
    };
  }, [color, colorTwo]);

  return <div ref={containerRef} className="magic-rings-container" />;
}
