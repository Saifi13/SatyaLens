/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080D18",
          900: "#0B1222",
          800: "#121B2E",
          700: "#1B2438",
          600: "#313D56",
          500: "#55617C",
          400: "#7C879F",
          300: "#A6AEBF",
          200: "#CDD2DC",
          100: "#E6E9EF",
          50: "#F2F3F7",
        },
        paper: {
          DEFAULT: "#FAFAF8",
          dim: "#F3F3EF",
          card: "#FFFFFF",
        },
        accent: {
          50: "#EEF3FD",
          100: "#DCE6FB",
          200: "#BCCDF5",
          300: "#93AEEE",
          400: "#6A8BE0",
          500: "#4766CE",
          600: "#3450B6",
          700: "#2A4093",
          800: "#223472",
          900: "#1C2A5B",
        },
        verdict: {
          green: "#3E8A66",
          "green-soft": "#EAF4EE",
          "green-line": "#CBE2D6",
          red: "#B04A45",
          "red-soft": "#F8EDEB",
          "red-line": "#EBCFCC",
          amber: "#A6762D",
          "amber-soft": "#F7F1E3",
          "amber-line": "#E8D9B8",
          slate: "#5B6B87",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Newsreader", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,34,0.04), 0 8px 24px -12px rgba(11,18,34,0.10)",
        lift: "0 2px 4px rgba(11,18,34,0.05), 0 16px 40px -16px rgba(11,18,34,0.16)",
        inset1: "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
      maxWidth: {
        content: "72rem",
        prose: "46rem",
        desk: "90rem",
      },
      spacing: {
        section: "7.5rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.82)" },
        },
        scan: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.4s linear infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        scan: "scan 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
