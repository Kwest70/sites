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
        // Semantic tokens (see globals.css). Used by /tracker.
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        subtle: "var(--color-subtle)",
        primary: { DEFAULT: "var(--color-primary)", fg: "var(--color-primary-fg)" },
        success: {
          DEFAULT: "var(--color-success)",
          fg: "var(--color-success-fg)",
          soft: "var(--color-success-soft)",
        },
        warning: { DEFAULT: "var(--color-warning)", soft: "var(--color-warning-soft)" },
        danger: {
          DEFAULT: "var(--color-danger)",
          fg: "var(--color-danger-fg)",
          soft: "var(--color-danger-soft)",
        },
        info: { DEFAULT: "var(--color-info)", soft: "var(--color-info-soft)" },
        overlay: "var(--color-overlay)",
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
