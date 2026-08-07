import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: "#2D0054",
        orange: "#FF5500",
        gold: "#D4A017",
        midnight: "#0E0018",
        offwhite: "#F5F0EA",
      },
      fontFamily: {
        display: ["var(--font-bangers)", "system-ui", "cursive"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "720px",
      },
    },
    // Brutalist: sharp edges only, everywhere.
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      full: "0",
    },
  },
  plugins: [],
};
export default config;
