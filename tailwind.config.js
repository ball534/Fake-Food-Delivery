export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF3EE",
          100: "#FFE4D9",
          200: "#FFC6B0",
          300: "#FF9E7B",
          400: "#FF764B",
          500: "#FF4E1F",
          600: "#ED3A0C",
          700: "#C52F0A",
          800: "#9C280E",
          900: "#7E2410",
        },
        gold: {
          50: "#FFFAEB",
          100: "#FFF1C6",
          200: "#FFE188",
          300: "#FFCC4A",
          400: "#FFB520",
          500: "#F99307",
          600: "#DD6C02",
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
        display: ["Baloo 2", "Montserrat", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(40,16,8,0.04), 0 6px 20px -6px rgba(40,16,8,0.12)",
        "card-hover": "0 14px 36px -10px rgba(40,16,8,0.22)",
        sheet: "0 -6px 28px -6px rgba(40,16,8,0.16)",
        glow: "0 8px 24px -6px rgba(255,78,31,0.5)",
        "glow-gold": "0 6px 20px -4px rgba(249,147,7,0.45)",
        glass:
          "0 8px 32px -12px rgba(40,16,8,0.22), inset 0 1px 0 0 rgba(255,255,255,0.55)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
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
        shimmer: {
          "0%": { transform: "translateX(-150%) skewX(-15deg)" },
          "100%": { transform: "translateX(250%) skewX(-15deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,78,31,0.45)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255,78,31,0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        pop: "pop 0.3s ease-out",
        shimmer: "shimmer 2.4s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 0.5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};
