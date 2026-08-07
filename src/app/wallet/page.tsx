"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { WalletHeader } from "@/components/WalletHeader";
import { cn } from "@/lib/cn";

const actions = [
  { label: "SEND", href: "/wallet", icon: <path d="M12 19V5M6 11l6-6 6 6" /> },
  { label: "RECEIVE", href: "/wallet", icon: <path d="M12 5v14M6 13l6 6 6-6" /> },
  { label: "SWAP", href: "/wallet/swap", icon: <path d="M4 8h13l-3-3M20 16H7l3 3" /> },
  {
    label: "ASSETS",
    href: "/wallet",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
  },
];

const tabs = [
  { label: "ASSETS", href: "/wallet", active: true },
  { label: "SEND", href: "/wallet" },
  { label: "SWAP", href: "/wallet/swap" },
  { label: "NFTS", href: "/wallet" },
  { label: "HISTORY", href: "/wallet" },
  { label: "ODL", href: "/wallet/swap" },
];

const assets = [
  { sym: "SYN", name: "SynapticChain", amount: "12,480.52", value: "$3,744.16", change: "+4.6%", up: true, mark: "bg-primary text-on-primary", letter: "S" },
  { sym: "cTZS", name: "cTZS · Tanzania Shilling", amount: "1,264,900", value: "$486.50", change: "+0.2%", up: true, mark: "bg-accent text-on-primary", letter: "C" },
  { sym: "sUSD", name: "sUSD · Stable Dollar", amount: "842.00", value: "$842.00", change: "0.0%", up: null, mark: "bg-[var(--plum-600)] text-text", letter: "S" },
  { sym: "NFT", name: "Culture Drops · 3 items", amount: "3", value: "FLOOR 120 SYN", change: "+12%", up: true, mark: "bg-[var(--plum-600)] text-accent", letter: "N" },
];

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.04 * i, ease: "easeOut" as const } }),
};

export default function WalletPage() {
  return (
    <PhoneFrame>
      <WalletHeader />

      {/* balance card */}
      <motion.section
        custom={0}
        variants={rise}
        initial="hidden"
        animate="show"
        className="mt-6 rounded-3xl border border-white/10 p-6"
        style={{ background: "linear-gradient(145deg, var(--plum-600), var(--plum-800))" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-base tracking-wider text-text">
            SYN1QX3...K9F4
            <span className="flex gap-2 text-muted">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </span>
          </div>
          <span className="flex items-center gap-2 font-mono text-sm text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            LIVE
          </span>
        </div>

        <p className="mt-6 font-mono text-sm tracking-[0.2em] text-accent">TOTAL BALANCE</p>
        <p className="mt-1 font-display text-6xl text-text">$5,072.66</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xl text-muted">12,480.52 SYN</span>
          <span className="rounded-full bg-success/15 px-3 py-1 text-sm font-semibold text-success">+4.6%</span>
        </div>
      </motion.section>

      {/* quick actions */}
      <motion.div custom={1} variants={rise} initial="hidden" animate="show" className="mt-8 grid grid-cols-4 gap-2">
        {actions.map((a) => (
          <Link key={a.label} href={a.href} className="group flex flex-col items-center gap-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary transition-transform group-hover:scale-105 group-active:scale-95">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {a.icon}
              </svg>
            </span>
            <span className="font-mono text-xs tracking-[0.15em] text-muted">{a.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* tabs */}
      <motion.nav custom={2} variants={rise} initial="hidden" animate="show" className="mt-8 flex items-center gap-5 overflow-x-auto border-b border-border pb-3">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={cn(
              "relative shrink-0 font-mono text-sm tracking-widest transition-colors",
              t.active ? "text-primary" : "text-muted hover:text-text",
            )}
          >
            {t.label}
            {t.active && <span className="absolute -bottom-3 left-0 h-0.5 w-full rounded-full bg-primary" />}
          </Link>
        ))}
      </motion.nav>

      {/* assets */}
      <motion.ul custom={3} variants={rise} initial="hidden" animate="show" className="mt-4 flex flex-col gap-3 pb-2">
        {assets.map((asset) => (
          <li key={asset.sym} className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-4">
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold", asset.mark)}>
              {asset.letter}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-text">{asset.sym}</p>
              <p className="truncate text-sm text-muted">{asset.name}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-text tabular-nums">{asset.amount}</p>
              <p className="font-mono text-sm tabular-nums">
                <span className={asset.up === null ? "text-muted" : "text-success"}>{asset.value}</span>{" "}
                <span className={asset.up === null ? "text-muted" : "text-success"}>{asset.change}</span>
              </p>
            </div>
          </li>
        ))}
      </motion.ul>
    </PhoneFrame>
  );
}
