"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.05 * i, ease: "easeOut" as const },
  }),
};

export default function UnlockPage() {
  const router = useRouter();
  const [password, setPassword] = useState("password12");
  const [show, setShow] = useState(false);

  return (
    <PhoneFrame>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/wallet");
        }}
        className="flex flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col justify-center">
          <motion.div custom={0} variants={rise} initial="hidden" animate="show" className="flex flex-col items-center">
            <Logo size={64} className="text-primary" />
            <p className="mt-4 font-mono text-sm tracking-[0.35em] text-accent">
              FUTURE CREATIVES WALLET
            </p>
          </motion.div>

          <motion.h1 custom={1} variants={rise} initial="hidden" animate="show" className="mt-8 text-center font-display text-5xl text-text">
            WELCOME BACK.
          </motion.h1>
          <motion.p custom={2} variants={rise} initial="hidden" animate="show" className="mt-3 text-center text-lg text-muted">
            Unlock to continue.
          </motion.p>

          {/* password field */}
          <motion.label
            custom={3}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-8 block rounded-2xl border border-border bg-surface px-6 py-4"
          >
            <span className="font-mono text-xs tracking-[0.3em] text-muted">PASSWORD</span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-2xl tracking-widest text-text outline-none placeholder:text-muted"
                placeholder="••••••••"
                aria-label="Wallet password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="text-muted transition-colors hover:text-text"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                  {!show && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </div>
          </motion.label>

          <motion.div custom={4} variants={rise} initial="hidden" animate="show" className="mt-6">
            <Button type="submit">UNLOCK WALLET</Button>
          </motion.div>

          <motion.div custom={5} variants={rise} initial="hidden" animate="show" className="mt-6 space-y-2 text-center">
            <p className="text-muted">
              New here?{" "}
              <Link href="/wallet" className="font-semibold text-primary hover:underline">
                Create wallet
              </Link>
            </p>
            <Link href="/wallet" className="block font-semibold text-primary hover:underline">
              Restore from seed
            </Link>
          </motion.div>
        </div>

        <footer className="pt-6 text-center">
          <p className="flex items-center justify-center gap-2 font-mono text-xs tracking-[0.25em] text-muted">
            <span className="h-2 w-2 rounded-full bg-success" />
            CONNECTED // AFRICAN TESTNET
          </p>
          <p className="mt-2 font-mono text-xs tracking-[0.3em] text-muted/70">V1.2.1</p>
        </footer>
      </form>
    </PhoneFrame>
  );
}
