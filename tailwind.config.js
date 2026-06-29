/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand accent — a muted, desaturated sage-teal (evokes the Grab/Uber
        // idiom without copying either trademark, with calmer saturation).
        brand: {
          50: "#f1f6f3",
          100: "#dde9e3",
          200: "#bdd2c8",
          300: "#94b3a4",
          400: "#6b9484",
          500: "#4f7d6a",
          600: "#3f6555",
          700: "#345245",
          800: "#2c4339",
          900: "#263830",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 6px 20px rgba(0,0,0,0.10)",
        sheet: "0 -4px 24px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pop": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        pop: "pop 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
