"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Create your wallet",
    body: "Generate a self-custody wallet in seconds. Your recovery phrase never leaves your device.",
  },
  {
    n: "02",
    title: "Fund & receive",
    body: "Top up with SYN, stablecoins, or local-currency tokens. Share your address or QR to get paid.",
  },
  {
    n: "03",
    title: "Swap & spend anywhere",
    body: "Move across borders through ODL corridors and back your favourite creators — all on-chain.",
  },
];

export function Steps() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-mono text-sm tracking-[0.2em] text-accent">HOW IT WORKS</p>
        <h2 className="mt-4 max-w-xl font-display text-4xl text-text md:text-5xl">
          Three taps from zero to on-chain.
        </h2>
      </motion.div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 * i, ease: "easeOut" }}
            className="relative rounded-3xl border border-border bg-surface p-8"
          >
            <span className="font-display text-5xl text-primary/30">{s.n}</span>
            <h3 className="mt-4 text-xl font-semibold text-text">{s.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-muted">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
