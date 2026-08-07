"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const MotionLink = motion(Link);

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-lg tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70";

const variants: Record<Variant, string> = {
  primary: "font-display bg-primary text-on-primary shadow-glow hover:brightness-105",
  outline: "font-mono border border-border text-text hover:bg-surface",
  ghost: "font-mono text-muted hover:text-text",
};

type ButtonProps = {
  variant?: Variant;
  className?: string;
  href?: string;
  children: React.ReactNode;
} & Omit<ComponentProps<typeof motion.button>, "children" | "ref">;

export function Button({ variant = "primary", className, href, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], className);
  const tap = { scale: 0.98 };

  if (href) {
    return (
      <MotionLink href={href} whileTap={tap} className={classes}>
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button whileTap={tap} className={classes} {...props}>
      {children}
    </motion.button>
  );
}
