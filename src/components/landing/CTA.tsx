"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2.5rem] border border-primary/30 px-8 py-20 text-center"
        style={{ background: "radial-gradient(120% 120% at 50% 0%, rgba(232,97,45,0.22), transparent 55%), linear-gradient(160deg, var(--plum-700), var(--plum-950))" }}
      >
        <p className="font-mono text-sm tracking-[0.25em] text-accent">FUTURE CREATIVES</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl text-text md:text-6xl">
          Own your culture. On-chain.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Join the creators building the Web4 economy on SynapticChain. Self-custody,
          cross-border, yours.
        </p>
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 sm:flex-row">
          <Button href="#" className="sm:flex-1">
            GET STARTED
          </Button>
          <Button href="#features" variant="outline" className="tracking-[0.15em] sm:flex-1">
            SEE FEATURES
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
