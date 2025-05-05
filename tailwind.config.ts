// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // Added src directory for content scanning
  ],
  theme: {
    extend: {
      colors: {
        // Keep your existing color mappings
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))", 
        secondary: "hsl(var(--secondary))", 
        accent: "hsl(var(--accent))", 
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        ring: "hsl(var(--ring))",
        
        // Add our custom color variables for Diff Digest app
        "text-heading": "var(--text-heading)",
        "text-body": "var(--text-body)",
        "text-muted": "var(--text-muted)",
        "accent-blue": "var(--accent-blue)",
        "accent-blue-hover": "var(--accent-blue-hover)",
        "accent-blue-light": "var(--accent-blue-light)",
        "accent-purple": "var(--accent-purple)",
        "accent-purple-light": "var(--accent-purple-light)",
        "accent-green": "var(--accent-green)",
        "accent-green-light": "var(--accent-green-light)",
        "surface-1": "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        
        // Keep your standard color mappings
        gray: {
           50:  'hsl(var(--background))',
           100: 'hsl(var(--background))',
           200: 'hsl(var(--border))',
           300: 'hsl(var(--muted))',
           400: 'hsl(var(--muted-foreground))',
           500: 'hsl(var(--foreground))',
           600: 'hsl(var(--foreground))',
           700: 'hsl(var(--foreground))',
           800: 'hsl(var(--foreground))',
           900: 'hsl(var(--foreground))', 
        },
        yellow: {
           400: 'hsl(var(--primary))',
           500: 'hsl(var(--primary))',
           600: 'hsl(var(--primary))',
        },
        blue: {
           600: 'hsl(220, 89%, 54%)',
           400: 'hsl(220, 89%, 64%)',
        },
        red: {
           50: 'hsl(0, 84%, 96%)',
           100: 'hsl(0, 84%, 96%)',
           400: 'hsl(0, 84%, 60%)',
           700: 'hsl(0, 84%, 40%)',
        },
        green: {
           500: 'hsl(142, 76%, 36%)',
           600: 'hsl(142, 70%, 30%)',
        }
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
        'none': '0',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
        'large': '12px',
      },

      boxShadow: {
        glow: "0 0 12px rgba(255, 234, 0, 0.6)",
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
        none: 'none',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;