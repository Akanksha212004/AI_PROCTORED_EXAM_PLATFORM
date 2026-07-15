// import type { Config } from "tailwindcss";

// const config: Config = {
//   darkMode: "class",
//   content: [
//     "./app/**/*.{ts,tsx}",
//     "./components/**/*.{ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         ink: "#061420", // deep sky navy — page background
//         paper: "#E6F3FC", // near-white ice — primary text on dark
//         surface: {
//           DEFAULT: "#0B2135", // card / panel surface
//           muted: "#081826", // inputs, recessed surfaces
//         },
//         accent: {
//           sky: "#3FA7E8", // primary CTA / links / focus
//           skyHover: "#5FB6EE",
//           teal: "#14B8A6", // proctoring / verified state
//           rose: "#EF4444", // error / violation state
//         },
//         border: {
//           DEFAULT: "#1E4A66",
//           strong: "#235676",
//         },
//         muted: "#8FB2C9", // secondary text
//       },
//       fontFamily: {
//         display: ["var(--font-space-grotesk)", "sans-serif"],
//         body: ["var(--font-inter)", "sans-serif"],
//         mono: ["var(--font-jetbrains-mono)", "monospace"],
//       },
//       boxShadow: {
//         card: "0 1px 2px 0 rgba(11, 18, 32, 0.04), 0 8px 24px -8px rgba(11, 18, 32, 0.12)",
//       },
//       keyframes: {
//         scanline: {
//           "0%": { transform: "translateY(-100%)" },
//           "100%": { transform: "translateY(100%)" },
//         },
//         pulseDot: {
//           "0%, 100%": { opacity: "1" },
//           "50%": { opacity: "0.35" },
//         },
//       },
//       animation: {
//         scanline: "scanline 3.5s ease-in-out infinite",
//         pulseDot: "pulseDot 1.6s ease-in-out infinite",
//       },
//     },
//   },
//   plugins: [],
// };

// export default config;




// import type { Config } from "tailwindcss";

// const config: Config = {
//   darkMode: "class",
//   content: [
//     "./app/**/*.{ts,tsx}",
//     "./components/**/*.{ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         ink: "#061420", // deep sky navy — page background
//         paper: "#E6F3FC", // near-white ice — primary text on dark
//         surface: {
//           DEFAULT: "#0B2135", // card / panel surface
//           muted: "#081826", // inputs, recessed surfaces
//         },
//         accent: {
//           sky: "#3FA7E8", // primary CTA / links / focus
//           skyHover: "#5FB6EE",
//           teal: "#14B8A6", // proctoring / verified state
//           rose: "#EF4444", // error / violation state
//           // Added for the Examiner Command Center redesign:
//           amber: "#F5A623", // pending / needs-attention state
//           amberHover: "#FFB84D",
//           violet: "#8B7FE8", // AI-assisted / insight state
//         },
//         border: {
//           DEFAULT: "#1E4A66",
//           strong: "#235676",
//         },
//         muted: "#8FB2C9", // secondary text
//       },
//       fontFamily: {
//         display: ["var(--font-space-grotesk)", "sans-serif"],
//         body: ["var(--font-inter)", "sans-serif"],
//         mono: ["var(--font-jetbrains-mono)", "monospace"],
//       },
//       boxShadow: {
//         card: "0 1px 2px 0 rgba(11, 18, 32, 0.04), 0 8px 24px -8px rgba(11, 18, 32, 0.12)",
//       },
//       keyframes: {
//         scanline: {
//           "0%": { transform: "translateY(-100%)" },
//           "100%": { transform: "translateY(100%)" },
//         },
//         pulseDot: {
//           "0%, 100%": { opacity: "1" },
//           "50%": { opacity: "0.35" },
//         },
//       },
//       animation: {
//         scanline: "scanline 3.5s ease-in-out infinite",
//         pulseDot: "pulseDot 1.6s ease-in-out infinite",
//       },
//     },
//   },
//   plugins: [],
// };

// export default config;




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
