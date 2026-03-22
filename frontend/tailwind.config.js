/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        slate: "#46546b",
        soft: "#f3f8ff",
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1"
        },
        accent: {
          50: "#fff7ed",
          500: "#f97316",
          600: "#ea580c"
        }
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 20px 60px rgba(14, 165, 233, 0.22)",
        card: "0 10px 30px rgba(11, 18, 32, 0.08)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        drift: {
          "0%, 100%": { transform: "translateX(0px) translateY(0px)" },
          "50%": { transform: "translateX(12px) translateY(-10px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(14, 165, 233, 0.0)" },
          "50%": { boxShadow: "0 0 24px rgba(14, 165, 233, 0.38)" }
        }
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        drift: "drift 6s ease-in-out infinite",
        pulseSoft: "pulseSoft 1.8s ease-in-out infinite",
        shimmer: "shimmer 3.2s linear infinite",
        glowPulse: "glowPulse 2.8s ease-in-out infinite"
      }
    },
  },
  plugins: [],
};
