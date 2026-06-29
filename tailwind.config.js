/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand accent — a teal-green (chosen to evoke the Grab/Uber idiom
        // without copying either trademark).
        brand: {
          50: "#effdf5",
          100: "#d7f9e6",
          200: "#b2f1d0",
          300: "#7ce4b3",
          400: "#3fce8f",
          500: "#16b574",
          600: "#0a925d",
          700: "#08744c",
          800: "#0a5c3f",
          900: "#094b35",
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
