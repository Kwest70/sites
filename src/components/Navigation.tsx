"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Navigation.css";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "The Mission" },
    { href: "/philanthropist", label: "Philanthropist" },
    { href: "/impact-investor", label: "Impact Investor" },
    { href: "/degen", label: "Degen" },
    { href: "/a-hip-hop-story", label: "A Hip Hop Story" },
  ];

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link href="/" className="nav-logo">
          <span className="type-utility">Future Creatives</span>
        </Link>

        <button
          className={`hamburger ${isMenuOpen ? "open" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="type-utility">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
