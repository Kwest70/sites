"use client";

import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { WalletHeader } from "@/components/WalletHeader";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const details = [
  { label: "Slippage tolerance", value: "1.0%" },
  { label: "Network fee", value: "0.0021 SYN" },
  { label: "Pool reserves", value: "1.2M sUSD · 3.1B cTZS" },
  { label: "Route", value: "ODL corridor · direct", accent: true },
];

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.05 * i, ease: "easeOut" as const } }),
};

function TokenPill({ letter, symbol, mark }: { letter: string; symbol: string; mark: string }) {
  return (
    <button className="flex items-center gap-3 rounded-full bg-surface-2 py-2 pl-2 pr-4">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-base font-bold", mark)}>{letter}</span>
      <span className="text-xl font-semibold text-text">{symbol}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export default function SwapPage() {
  return (
    <PhoneFrame>
      <WalletHeader />

      <motion.div custom={0} variants={rise} initial="hidden" animate="show" className="mt-6">
        <h1 className="font-display text-5xl text-text">ODL SWAP</h1>
        <p className="mt-2 font-mono text-sm tracking-[0.2em] text-accent">
          CROSS-BORDER // SUSD ↔ CTZS
        </p>
      </motion.div>

      {/* pay / receive */}
      <div className="mt-6">
        <motion.div custom={1} variants={rise} initial="hidden" animate="show" className="rounded-3xl border border-border bg-surface px-6 py-5">
          <div className="flex items-center justify-between font-mono text-sm tracking-wider text-muted">
            <span>YOU PAY</span>
            <span>BAL 842.00</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-display text-5xl text-text">250.00</span>
            <TokenPill letter="S" symbol="sUSD" mark="bg-[var(--plum-600)] text-text" />
          </div>
        </motion.div>

        {/* swap toggle — straddles the seam between the two cards */}
        <div className="relative z-10 flex justify-center">
          <motion.button
            custom={2}
            variants={rise}
            initial="hidden"
            animate="show"
            whileTap={{ scale: 0.9, rotate: 180 }}
            aria-label="Flip direction"
            className="-my-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-glow"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4v13l-3-3M17 20V7l3 3" />
            </svg>
          </motion.button>
        </div>

        <motion.div custom={3} variants={rise} initial="hidden" animate="show" className="rounded-3xl border border-primary/50 bg-surface px-6 py-5">
          <div className="font-mono text-sm tracking-wider text-muted">YOU RECEIVE</div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-display text-5xl text-primary">652,300</span>
            <TokenPill letter="C" symbol="cTZS" mark="bg-accent text-on-primary" />
          </div>
        </motion.div>
      </div>

      <motion.p custom={4} variants={rise} initial="hidden" animate="show" className="mt-6 font-mono text-sm tracking-wider text-accent">
        1 SUSD = 2,609.20 CTZS // SWAPENGINE V3B
      </motion.p>

      {/* details */}
      <motion.dl custom={5} variants={rise} initial="hidden" animate="show" className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface px-6 py-5">
        {details.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <dt className="text-base text-muted">{d.label}</dt>
            <dd className={cn("text-base font-semibold tabular-nums", d.accent ? "text-accent" : "text-text")}>{d.value}</dd>
          </div>
        ))}
      </motion.dl>

      <motion.div custom={6} variants={rise} initial="hidden" animate="show" className="mt-6 pb-2">
        <Button href="/wallet">SWAP VIA ODL</Button>
      </motion.div>
    </PhoneFrame>
  );
}
