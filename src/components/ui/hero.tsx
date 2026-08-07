"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Animated hero shell: a mesh-gradient field in gold and deep midnight purple
 * with the circling logo pinned bottom right. Everything below the hero stays
 * flat and brutalist — the motion is contained here.
 */
export default function ShaderHero({ children }: { children: ReactNode }) {
  return (
    <section className="shader-hero">
      {/* Base field: deep midnight purple carrying the gold. */}
      <MeshGradient
        className="shader-hero__layer"
        colors={["#0E0018", "#2D0054", "#D4A017", "#3D0A6B", "#E8B923"]}
        speed={0.25}
        distortion={0.8}
        swirl={0.6}
        grainOverlay={0.12}
      />
      {/* Second, slower pass adds gold movement without washing the purple out. */}
      <MeshGradient
        className="shader-hero__layer shader-hero__layer--gold"
        colors={["#0E0018", "#D4A017", "#2D0054", "#E8B923"]}
        speed={0.14}
        distortion={1}
        swirl={0.35}
      />

      <div className="shader-hero__content wrap">{children}</div>

      {/* Circling logo, bottom right */}
      <div className="shader-hero__badge" aria-hidden="true">
        <Image
          src="/logo.png"
          alt=""
          width={44}
          height={44}
          className="shader-hero__mark"
        />

        <motion.svg
          className="shader-hero__ring"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          <defs>
            <path
              id="fc-circle"
              d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
            />
          </defs>
          <text>
            <textPath href="#fc-circle" startOffset="0%">
              Future Creatives • Shape culture • Own what you back •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </section>
  );
}
