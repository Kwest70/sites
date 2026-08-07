"use client";

import { useEffect, useState } from "react";

const WORDS = ["culture", "arts", "entertainment"];

export function CyclingHeadline() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <h1 className="display text-5xl leading-[0.95] md:text-8xl">
      You now have the power to shape{" "}
      <span key={i} className="fade-in inline-block text-orange">
        {WORDS[i]}
      </span>
    </h1>
  );
}
