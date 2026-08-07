import Link from "next/link";
import { cn } from "@/lib/cn";

/** Full-bleed section, alternating dark (purple) / light (off-white). */
export function Section({
  tone = "dark",
  wide = false,
  className,
  children,
}: {
  tone?: "dark" | "light";
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "w-full px-5 py-20 md:py-28",
        tone === "light" ? "bg-offwhite text-midnight" : "bg-purple text-offwhite",
        className,
      )}
    >
      <div className={cn("mx-auto", wide ? "max-w-6xl" : "max-w-prose")}>{children}</div>
    </section>
  );
}

/** Space Mono section label (orange, wide tracking). */
export function Label({ children }: { children: React.ReactNode }) {
  return <p className="label mb-5">{children}</p>;
}

/** Bangers display heading. */
export function Heading({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("display text-4xl md:text-6xl", className)}>{children}</h2>;
}

/** Bold standalone opening line (never wrapped in ReadMore). */
export function Lead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-2xl md:text-3xl font-medium leading-snug", className)}>{children}</p>
  );
}

/** Gold-bordered callout box. */
export function Callout({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("callout text-lg", className)}>{children}</div>;
}

/** End-of-page gold buy button (full width on mobile). */
export function BuyCTA({ label = "Buy your belief token" }: { label?: string }) {
  return (
    <a href="#get-belief-token" className="btn-buy mt-4 w-full sm:w-auto">
      {label}
    </a>
  );
}

/** Bulleted list with orange markers. */
export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-lg">
          <span aria-hidden className="mt-1 select-none text-orange">
            ▸
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** Persona route card on the master page (not wrapped in ReadMore). */
export function PersonaCard({ name, line, href }: { name: string; line: string; href: string }) {
  return (
    <Link
      href={href}
      className="group block border-2 border-orange p-8 transition-colors hover:bg-orange"
    >
      <p className="label mb-3">Route</p>
      <h3 className="display mb-3 text-3xl text-orange transition-colors group-hover:text-purple">
        {name}
      </h3>
      <p className="text-lg transition-colors group-hover:text-purple">{line}</p>
    </Link>
  );
}
