import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "ink-900": "var(--ink-900)",
        "ink-800": "var(--ink-800)",
        "paper-50": "var(--paper-50)",
        "paper-100": "var(--paper-100)",
        "brass-500": "var(--brass-500)",
        "brass-400": "var(--brass-400)",
        "slate-500": "var(--slate-500)",
        "slate-700": "var(--slate-700)",
        "slate-300": "var(--slate-300)",
        "slate-200": "var(--slate-200)",
        "slate-100": "var(--slate-100)",
        "ledger-green-700": "var(--ledger-green-700)",
        "rust-700": "var(--rust-700)",
        "rust-800": "var(--rust-800)",
        "focus-blue-500": "var(--focus-blue-500)"
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["IBM Plex Serif", "Newsreader", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"]
      },
      boxShadow: {
        ledger: "0 1px 2px rgba(11, 27, 51, 0.06), 0 12px 32px rgba(11, 27, 51, 0.06)",
        "ledger-deep": "0 20px 55px rgba(11, 27, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
