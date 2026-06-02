import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        slate: {
          ...colors.slate,
          DEFAULT: "#46546b",
        },
        soft: "#f3f8ff",
        muted: "#8898aa",
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          400: "#22d3ee",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#f43f5e",
          600: "#e11d48",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(14, 165, 233, 0.22)",
        "glow-sm": "0 8px 30px rgba(14, 165, 233, 0.18)",
        "glow-lg": "0 30px 80px rgba(14, 165, 233, 0.28)",
        card: "0 10px 30px rgba(11, 18, 32, 0.08)",
        "card-lg": "0 20px 60px rgba(11, 18, 32, 0.12)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.15)",
        premium: "0 32px 96px rgba(2, 132, 199, 0.24), 0 4px 16px rgba(11, 18, 32, 0.06)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        drift: {
          "0%, 100%": { transform: "translateX(0px) translateY(0px)" },
          "50%": { transform: "translateX(12px) translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(14, 165, 233, 0.0)" },
          "50%": { boxShadow: "0 0 28px rgba(14, 165, 233, 0.4)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        ringGrow: {
          "0%": { strokeDashoffset: "339.292" },
          "100%": { strokeDashoffset: "var(--dash-offset)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        drift: "drift 6s ease-in-out infinite",
        pulseSoft: "pulseSoft 1.8s ease-in-out infinite",
        shimmer: "shimmer 3.2s linear infinite",
        glowPulse: "glowPulse 2.8s ease-in-out infinite",
        fadeUp: "fadeUp 0.5s ease-out forwards",
        fadeIn: "fadeIn 0.4s ease-out forwards",
        scaleIn: "scaleIn 0.4s ease-out forwards",
        ringGrow: "ringGrow 1.4s ease-out forwards",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
