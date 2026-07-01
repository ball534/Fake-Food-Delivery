export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8f1",
          100: "#ddeedd",
          200: "#bcdfbc",
          300: "#8ac98a",
          400: "#4faf4f",
          500: "#228B22",
          600: "#1d761d",
          700: "#195e19",
          800: "#164b16",
          900: "#133e13",
        },
      },
      fontFamily: {
        sans: [
          "Montserrat",
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
        card: "0 1px 2px rgba(16,24,40,0.04), 0 6px 20px -6px rgba(16,24,40,0.12)",
        "card-hover": "0 14px 36px -10px rgba(16,24,40,0.22)",
        sheet: "0 -6px 28px -6px rgba(16,24,40,0.16)",
        glass:
          "0 8px 32px -12px rgba(16,24,40,0.22), inset 0 1px 0 0 rgba(255,255,255,0.55)",
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
        pop: {
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
