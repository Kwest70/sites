"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

const links = [
  { label: "The Mission", href: "/" },
  { label: "Philanthropist", href: "/philanthropist" },
  { label: "Impact Investor", href: "/impact-investor" },
  { label: "Degen", href: "/degen" },
  { label: "A Hip Hop Story", href: "/a-hip-hop-story" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-orange/40 bg-purple/80 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Future Creatives home">
            <Logo size={26} className="text-gold" />
            <span className="font-mono text-sm tracking-[0.2em] text-white">FUTURE CREATIVES</span>
          </Link>

          {/* desktop links */}
          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "font-mono text-xs tracking-[0.15em] uppercase transition-colors",
                  isActive(l.href)
                    ? "text-white underline decoration-orange decoration-2 underline-offset-8"
                    : "text-white/70 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            ))}
            <a href="#get-belief-token" className="btn-cta !px-5 !py-2 text-xs">
              Buy Belief
            </a>
          </nav>

          {/* mobile hamburger */}
          <button
            type="button"
            className="flex flex-col gap-1.5 p-2 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={cn("h-0.5 w-6 bg-white transition-transform", open && "translate-y-2 rotate-45")} />
            <span className={cn("h-0.5 w-6 bg-white transition-opacity", open && "opacity-0")} />
            <span className={cn("h-0.5 w-6 bg-white transition-transform", open && "-translate-y-2 -rotate-45")} />
          </button>
        </div>
      </header>

      {/* mobile drawer — sibling of <header>, so the nav's backdrop-filter
          does not become its containing block */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-purple px-6 pt-24 lg:hidden">
          <nav className="flex flex-col gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "font-mono text-lg tracking-[0.15em] uppercase",
                  isActive(l.href)
                    ? "text-white underline decoration-orange decoration-2 underline-offset-8"
                    : "text-white/70",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href="#get-belief-token"
            onClick={() => setOpen(false)}
            className="btn-cta mt-10 w-full"
          >
            Buy Belief
          </a>
        </div>
      )}
    </>
  );
}
