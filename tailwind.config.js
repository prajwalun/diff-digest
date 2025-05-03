/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // Next.js pages and components
    "./components/**/*.{js,ts,jsx,tsx}", // Your UI components
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 6%)",
        foreground: "hsl(60, 100%, 95%)",
        primary: "hsl(48, 100%, 60%)",
        secondary: "hsl(240, 5%, 40%)",
        muted: "hsl(240, 4%, 12%)",
      },
      fontFamily: {
        sans: ["Geist", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
