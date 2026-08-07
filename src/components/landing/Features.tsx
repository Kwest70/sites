"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Self-custody by default",
    body: "Your keys, your culture. Non-custodial from the very first tap — nobody holds your assets but you.",
    icon: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  {
    title: "Cross-border ODL swaps",
    body: "Move value between currencies — sUSD ↔ cTZS and beyond — through on-demand liquidity corridors in seconds.",
    icon: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  },
  {
    title: "Own your culture",
    body: "Hold, trade, and showcase cultural drops and NFTs minted by African creators, all on SynapticChain.",
    icon: (
      <>
        <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 21l-4.9 2.6.9-5.5-4-3.9 5.5-.8z" />
      </>
    ),
  },
  {
    title: "Every currency, one place",
    body: "SYN, stablecoins, and local-currency tokens live side by side with live balances and instant conversions.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M9.5 9.5h3.5a2 2 0 0 1 0 4H9.5m0 0h4" />
      </>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: "easeOut" as const },
  }),
};

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <p className="font-mono text-sm tracking-[0.2em] text-accent">WHAT YOU GET</p>
        <h2 className="mt-4 font-display text-4xl text-text md:text-5xl">
          A wallet built for creators, not speculators.
        </h2>
        <p className="mt-4 text-lg text-muted">
          Future Creatives is a Web4 wallet on SynapticChain — self-custody, cross-border,
          and made to carry culture as easily as it carries value.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {features.map((f, i) => (
          <motion.article
            key={f.title}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="group rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-primary/40"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
              </svg>
            </span>
            <h3 className="mt-6 text-xl font-semibold text-text">{f.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-muted">{f.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
