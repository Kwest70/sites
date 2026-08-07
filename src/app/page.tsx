"use client";

import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function OnboardingPage() {
  return (
    <PhoneFrame>
      {/* transport bar */}
      <div className="flex items-center justify-between font-mono text-sm tracking-[0.2em] text-muted">
        <span>PLAY // 00:00:07</span>
        <span className="flex items-center gap-2 text-primary">
          <motion.span
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          REC
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        {/* logo medallion */}
        <motion.div
          variants={rise}
          className="flex h-44 w-44 items-center justify-center rounded-full border border-primary/40"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(232,185,35,0.14), rgba(20,10,32,0.2))" }}
        >
          <Logo size={92} className="text-primary" />
        </motion.div>

        {/* wordmark */}
        <motion.h1 variants={rise} className="mt-8 font-display text-6xl leading-[0.9]">
          <span className="block text-text">FUTURE</span>
          <span className="block text-lime">CREATIVES</span>
        </motion.h1>

        <motion.div variants={rise} className="mt-6">
          <p className="font-mono text-base tracking-[0.15em] text-accent">
            WEB4 WALLET // SYNAPTICCHAIN
          </p>
          <span className="mx-auto mt-4 block h-px w-48 bg-gradient-to-r from-accent to-transparent" />
        </motion.div>
      </motion.div>

      {/* actions */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3 pt-4"
      >
        <motion.div variants={rise}>
          <Button href="/wallet">GET STARTED</Button>
        </motion.div>
        <motion.div variants={rise}>
          <Button href="/unlock" variant="outline" className="tracking-[0.2em]">
            I ALREADY HAVE A WALLET
          </Button>
        </motion.div>
        <motion.p variants={rise} className="pt-4 text-center font-mono text-xs tracking-[0.2em] text-muted">
          SELF-CUSTODY // OWN YOUR CULTURE
        </motion.p>
      </motion.div>
    </PhoneFrame>
  );
}
