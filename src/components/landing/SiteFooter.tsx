import { Logo } from "@/components/Logo";

const columns = [
  { title: "Product", links: ["Wallet", "ODL Swap", "Cultural drops", "Security"] },
  { title: "Developers", links: ["SynapticChain docs", "SwapEngine API", "Testnet", "Status"] },
  { title: "Company", links: ["About", "Creators", "Careers", "Contact"] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={30} className="text-primary" />
              <span className="font-display text-lg text-text">FUTURE CREATIVES</span>
            </div>
            <p className="mt-4 max-w-xs text-base text-muted">
              A self-custody Web4 wallet on SynapticChain. Own your culture.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-xs tracking-[0.2em] text-muted">{col.title.toUpperCase()}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-base text-text/80 transition-colors hover:text-primary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">
            SELF-CUSTODY // OWN YOUR CULTURE
          </p>
          <p className="font-mono text-xs tracking-[0.2em] text-muted/70">
            © {new Date().getFullYear()} FUTURE CREATIVES
          </p>
        </div>
      </div>
    </footer>
  );
}
