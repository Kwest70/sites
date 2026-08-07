"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "40+", label: "ODL corridors live" },
  { value: "~12s", label: "Average settlement" },
  { value: "0.0021", label: "Avg fee in SYN" },
  { value: "100%", label: "Self-custodial" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.06 * i, ease: "easeOut" }}
            className="text-center"
          >
            <p className="font-display text-4xl text-primary md:text-5xl">{s.value}</p>
            <p className="mt-2 font-mono text-xs tracking-[0.15em] text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
