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
        // Keep your direct custom HSL color definitions if you use them directly (e.g., bg-primary)
        background: "hsl(0, 0%, 98%)",
        foreground: "hsl(0, 0%, 10%)",
        primary: "hsl(45, 100%, 51%)", // Your existing primary color
        secondary: "hsl(17, 100%, 55%)", // Your existing secondary color
        accent: "hsl(48, 100%, 85%)", // Your existing accent color
        border: "hsl(0, 0%, 80%)", // Your existing border color
        muted: "hsl(0, 0%, 60%)", // Your existing muted color
        ring: "hsl(45, 100%, 50%)", // Your existing ring color
        
        // --- ADDED: Mapping standard Tailwind color names to your custom CSS variables ---
        // This allows components using classes like text-gray-800 or bg-yellow-500
        // to use the values defined by your --color- variables in globals.css
        gray: { // Mapping standard gray shades
           // Adjust these mappings to your preferred grey shades based on your theme
           50:  'hsl(var(--color-background))', // Example: Very light grey often maps to background
           100: 'hsl(var(--color-background))',
           200: 'hsl(var(--color-border))', // Example: Light border color
           300: 'hsl(var(--color-muted))', // Example: Muted text/border
           400: 'hsl(var(--color-muted-foreground))', // Example: Muted foreground
           500: 'hsl(var(--color-foreground))', // Example: Standard foreground color (adjust shade)
           600: 'hsl(var(--color-foreground))',
           700: 'hsl(var(--color-foreground))',
           800: 'hsl(var(--color-foreground))',
           900: 'hsl(var(--color-foreground))', // Example: Darkest foreground often maps here
        },
        yellow: { // Mapping standard yellow shades
           // Map yellow shades to your primary or accent colors
           400: 'hsl(var(--color-primary))', // Example: Maps to your primary color
           500: 'hsl(var(--color-primary))',
           600: 'hsl(var(--color-primary))',
           // Add other shades if needed
        },
        blue: { // Mapping standard blue shades (used for links)
           600: 'hsl(220, 89%, 54%)', // Example: A standard blue color (adjust HSL)
           400: 'hsl(220, 89%, 64%)', // Example: A lighter blue for dark mode (adjust HSL)
           // Or map to custom blue variables if you have them
        },
         red: { // Mapping standard red shades (used for errors)
           // Example: A standard red color (adjust HSL)
           50: 'hsl(0, 84%, 96%)', // Very light red
           100: 'hsl(0, 84%, 96%)',
           400: 'hsl(0, 84%, 60%)', // Medium red
           700: 'hsl(0, 84%, 40%)', // Dark red
           // Or map to custom red variables if you have them
        },
        green: { // Mapping standard green shades (used for success/copied)
           // Example: A standard green color (adjust HSL)
           500: 'hsl(142, 76%, 36%)', // Medium green
           600: 'hsl(142, 70%, 30%)', // Darker green
           // Or map to custom green variables if you have them
        }
        // Add mappings for other standard colors (e.g., purple, pink) if used in components
      },

      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      borderRadius: {
        // Keep your custom radius definitions - Ensure you keep the values you prefer
        DEFAULT: "12px", // Your default
        sm: "8px",     // Your custom sm
        md: "10px",    // Your custom md
        lg: "16px",    // Your custom lg
        xl: "20px",    // Your custom xl

        // Keep other standard or custom radii without duplicating sm, md, lg, xl
        'none': '0',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px', // Tailwind's full rounded
        'large': '12px', // Example: You can define other named radii
        // If you intended to use standard Tailwind values for sm, md, lg, xl,
        // you would remove your custom definitions and keep the standard ones instead.
      },

      boxShadow: {
        glow: "0 0 12px rgba(255, 234, 0, 0.6)", // Your existing glow shadow
        // Ensure standard Tailwind shadows are available if not overridden by your custom shadows
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        outline: '0 0 0 3px rgba(66, 153, 225, 0.5)', // Example outline shadow
        none: 'none',
        // You used shadow-sm, shadow-md, shadow-lg, shadow-xl in components.
        // If these are not defined or mapped, components will use default Tailwind shadows.
        // If you want them to use your custom shadows, define/map them here.
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Keep typography plugin
    // Add other plugins if you use them (e.g., form, aspect-ratio)
  ],
};

export default config;