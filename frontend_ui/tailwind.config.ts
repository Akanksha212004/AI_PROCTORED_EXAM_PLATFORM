
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
          // Added for the Examiner Command Center redesign:
          amber: "#F5A623", // pending / needs-attention state
          amberHover: "#FFB84D",
          violet: "#8B7FE8", // AI-assisted / insight state
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
        // Added for the visual-polish pass: soft accent-tinted glow used on card hover states.
        "glow-sky": "0 0 0 1px rgba(63, 167, 232, 0.35), 0 12px 28px -10px rgba(63, 167, 232, 0.25)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 15% -10%, rgba(63,167,232,0.10), transparent 45%), radial-gradient(circle at 90% 0%, rgba(20,184,166,0.07), transparent 40%)",
        // Soft, low-saturation page backdrop — used on body so every screen shares the same gentle wash.
        // Bumped opacity slightly + added a fourth glow so the canvas feels a touch more alive without
        // getting noisy behind text.
        "page-glow":
          "radial-gradient(circle at 12% 0%, rgba(63,167,232,0.13), transparent 42%), radial-gradient(circle at 88% 8%, rgba(139,127,232,0.11), transparent 45%), radial-gradient(circle at 50% 100%, rgba(20,184,166,0.08), transparent 48%), radial-gradient(circle at 70% 45%, rgba(236,72,153,0.05), transparent 40%)",
        // Header / nav surface — subtle sky/violet-tinted gradient so text stays crisp
        // while the bar still feels alive rather than a flat navy strip.
        "header-surface":
          "linear-gradient(180deg, #0E2740 0%, #0B2135 55%, #081826 100%)",
        // Default card surface — subtle diagonal gradient so panels never look flat, on any page.
        "card-surface": "linear-gradient(155deg, #0E2740 0%, #0B2135 55%, #0A1F30 100%)",
        // Primary CTA gradient (buttons, active nav pill).
        "brand": "linear-gradient(135deg, #3FA7E8 0%, #6366F1 100%)",
        "brand-hover": "linear-gradient(135deg, #5FB6EE 0%, #7C7FF5 100%)",
        // Per-tone icon-badge gradients — soft, soothing pairings rather than harsh neon.
        "tone-sky": "linear-gradient(135deg, #3FA7E8 0%, #6366F1 100%)",
        "tone-teal": "linear-gradient(135deg, #14B8A6 0%, #0EA5E9 100%)",
        "tone-amber": "linear-gradient(135deg, #F5A623 0%, #F97316 100%)",
        "tone-rose": "linear-gradient(135deg, #EF4444 0%, #EC4899 100%)",
        "tone-violet": "linear-gradient(135deg, #8B7FE8 0%, #6366F1 100%)",
        // Role accents for header (Student / Examiner / Admin) — used as a thin top border + badge.
        "role-student": "linear-gradient(90deg, #14B8A6 0%, #3FA7E8 100%)",
        "role-examiner": "linear-gradient(90deg, #3FA7E8 0%, #8B7FE8 100%)",
        "role-admin": "linear-gradient(90deg, #F5A623 0%, #EF4444 100%)",
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
        // Slow left-right sheen on the role stripe / active nav pills — purely decorative,
        // keeps the top-of-page accent from ever reading as a flat, static bar.
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        scanline: "scanline 3.5s ease-in-out infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
