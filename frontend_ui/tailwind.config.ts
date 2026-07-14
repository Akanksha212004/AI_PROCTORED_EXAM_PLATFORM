import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#061420", // deep sky navy — page background
        paper: "#E6F3FC", // near-white ice — primary text on dark
        surface: {
          DEFAULT: "#0B2135", // card / panel surface
          muted: "#081826", // inputs, recessed surfaces
        },
        accent: {
          sky: "#3FA7E8", // primary CTA / links / focus
          skyHover: "#5FB6EE",
          teal: "#14B8A6", // proctoring / verified state
          rose: "#EF4444", // error / violation state
        },
        border: {
          DEFAULT: "#1E4A66",
          strong: "#235676",
        },
        muted: "#8FB2C9", // secondary text
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(11, 18, 32, 0.04), 0 8px 24px -8px rgba(11, 18, 32, 0.12)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        scanline: "scanline 3.5s ease-in-out infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
