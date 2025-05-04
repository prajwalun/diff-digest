// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 98%)",
        foreground: "hsl(0, 0%, 10%)",
        primary: "hsl(45, 100%, 51%)",
        secondary: "hsl(17, 100%, 55%)",
        accent: "hsl(48, 100%, 85%)",
        border: "hsl(0, 0%, 80%)",
        muted: "hsl(0, 0%, 60%)",
        ring: "hsl(45, 100%, 50%)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "10px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        glow: "0 0 12px rgba(255, 234, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
