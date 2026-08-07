import Link from "next/link";
import { Logo } from "./Logo";

export function WalletHeader() {
  return (
    <header className="flex items-start justify-between pt-2">
      <div className="flex items-center gap-3">
        <Link href="/wallet" aria-label="Future Creatives home">
          <Logo size={34} className="text-primary" />
        </Link>
        <div>
          <p className="font-display text-xl leading-none text-text">FUTURE CREATIVES</p>
          <span className="mt-2 inline-block rounded-full border border-primary/50 px-3 py-0.5 font-mono text-xs tracking-[0.25em] text-primary">
            TESTNET
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-muted">
        <button aria-label="Settings" className="transition-colors hover:text-text">
          {/* sliders */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h11M18 8h3M3 16h3M10 16h11" />
            <circle cx="16" cy="8" r="2.4" fill="var(--bg)" />
            <circle cx="8" cy="16" r="2.4" fill="var(--bg)" />
          </svg>
        </button>
        <Link href="/unlock" aria-label="Lock wallet" className="transition-colors hover:text-text">
          {/* lock */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2.5" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
