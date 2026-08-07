"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg p-8 text-center text-text">
      <motion.h1
        className="text-4xl font-bold tracking-tight sm:text-6xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Next.js 14 + Tailwind + Framer Motion
      </motion.h1>

      <motion.p
        className="max-w-xl text-lg text-muted"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      >
        Your project is set up and ready. Start building in{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm">
          src/app/page.tsx
        </code>
        .
      </motion.p>

      <motion.a
        href="https://nextjs.org/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-primary px-6 py-3 font-medium text-on-primary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Read the docs
      </motion.a>
    </main>
  );
}
