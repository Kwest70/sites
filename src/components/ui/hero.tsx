"use client";
import { useEffect, useRef, useState } from "react";
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

/**
 * Brand palette (mirrors the semantic tokens in globals.css). These are raw
 * hex because the shader canvas + SVG gradient stops take colour strings, not
 * CSS variables — everything className-driven still uses the tokens.
 */
const BRAND = {
  midnight: "#140a20", // --bg / plum-950
  plum: "#34215a", // plum-700
  gold: "#e8b923", // --primary
  goldSoft: "#f5cd4b", // gold-400
  goldDeep: "#cfa015", // gold-600
  orange: "#e8612d", // --accent (burnt orange)
  white: "#ffffff",
};

export default function ShaderShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-bg relative overflow-hidden">
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BRAND.white} />
            <stop offset="35%" stopColor={BRAND.gold} />
            <stop offset="70%" stopColor={BRAND.orange} />
            <stop offset="100%" stopColor={BRAND.white} />
          </linearGradient>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Shader background — midnight / gold / burnt orange */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={[BRAND.midnight, BRAND.gold, BRAND.goldDeep, BRAND.plum, BRAND.orange]}
        speed={0.3}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={[BRAND.midnight, BRAND.white, BRAND.gold, BRAND.orange]}
        speed={0.2}
      />

      <header className="relative z-20 flex items-center justify-between p-6">
        {/* Brand mark */}
        <motion.div
          className="relative flex items-center group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.div
            style={{ filter: "url(#logo-glow)" }}
            whileHover={{ rotate: [0, -2, 2, 0], transition: { duration: 0.6, ease: "easeInOut" } }}
          >
            <Logo size={36} className="text-primary transition-all duration-300" />
          </motion.div>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/70 rounded-full"
                style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%` }}
                animate={{
                  y: [-10, -20, -10],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
          <a href="#" className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Wallet
          </a>
          <a href="#" className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Swap
          </a>
          <a href="#" className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Docs
          </a>
        </nav>

        {/* Launch button group with gooey arrow */}
        <div id="gooey-btn" className="relative flex items-center group" style={{ filter: "url(#gooey-filter)" }}>
          <button className="absolute right-0 px-2.5 py-2 rounded-full bg-primary text-on-primary font-normal text-xs transition-all duration-300 hover:brightness-105 cursor-pointer h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-19 z-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
          <button className="px-6 py-2 rounded-full bg-primary text-on-primary font-semibold text-xs transition-all duration-300 hover:brightness-105 cursor-pointer h-8 flex items-center z-10">
            Launch App
          </button>
        </div>
      </header>

      <main className="absolute bottom-8 left-8 z-20 max-w-2xl">
        <div className="text-left">
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
            style={{ filter: "url(#glass-effect)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />
            <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
              ✨ Web4 Wallet // SynapticChain
            </span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="block font-light text-4xl md:text-5xl lg:text-6xl mb-2 tracking-wider italic"
              style={{
                background: `linear-gradient(135deg, ${BRAND.white} 0%, ${BRAND.gold} 35%, ${BRAND.orange} 70%, ${BRAND.white} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "url(#text-glow)",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              Future
            </motion.span>
            <span className="block font-black text-white drop-shadow-2xl">Creatives</span>
            <span className="block font-light text-white/80 italic">own your culture.</span>
          </motion.h1>

          <motion.p
            className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            A self-custody Web4 wallet on SynapticChain. Swap across borders, hold cultural
            assets, and own everything you create — all from your phone.
          </motion.p>

          <motion.div
            className="flex items-center gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.button
              className="px-10 py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-primary/60 hover:text-primary cursor-pointer backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore
            </motion.button>
            <motion.button
              className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-on-primary font-semibold text-sm transition-all duration-300 hover:brightness-110 cursor-pointer shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* Bottom-right brand badge: the F logo inside the pulsing border */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <PulsingBorder
            colors={[BRAND.gold, BRAND.goldDeep, BRAND.orange, BRAND.goldSoft, BRAND.white]}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            spots={5}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.5}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            frame={9161408.251009725}
            style={{ width: "60px", height: "60px", borderRadius: "50%" }}
          />

          {/* F mark, centred */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ filter: "url(#logo-glow)" }}>
            <Logo size={22} className="text-primary" />
          </div>

          {/* Rotating brand text around the badge */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            style={{ transform: "scale(1.6)" }}
          >
            <defs>
              <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text className="text-sm fill-white/80 font-medium">
              <textPath href="#circle" startOffset="0%">
                FUTURE CREATIVES • WEB4 WALLET • SYNAPTICCHAIN •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>
    </div>
  );
}
