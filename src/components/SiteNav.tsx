"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "The Mission" },
  { href: "/philanthropist", label: "Philanthropist" },
  { href: "/impact-investor", label: "Impact Investor" },
  { href: "/degen", label: "Degen" },
  { href: "/a-hip-hop-story", label: "A Hip Hop Story" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Don't let the page scroll behind an open drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="nav">
      <div className="nav__bar">
        <Link href="/" className="nav__brand">
          <Image src="/logo.svg" alt="" width={30} height={30} priority />
          <span className="nav__wordmark">Future Creatives</span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav__link${pathname === href ? " is-current" : ""}`}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <a href="#get-belief-token" className="nav__buy">
          Buy Belief
        </a>

        <button
          type="button"
          className={`nav__burger${open ? " is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="nav__drawer">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav__drawer-link${
                pathname === href ? " is-current" : ""
              }`}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <a href="#get-belief-token" className="buy nav__drawer-buy">
            Buy Belief
          </a>
        </div>
      )}
    </header>
  );
}
