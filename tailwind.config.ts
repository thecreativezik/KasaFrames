import type { Config } from "tailwindcss";

/**
 * Design system, after the "The More Creative" reference in Savee:
 * a near-black page, one warm off-white ("bone") used at a few fixed
 * opacities for every tier of text and surface, a single grotesk set large
 * at regular weight with tight tracking, and gold kept for small brand marks.
 *
 * Text tiers on ink: bone (primary), bone/60 (body), bone/50 (captions —
 * the lowest tier that still clears 4.5:1 at small sizes).
 */
const config: Config = {
  // The site is dark-only: <html> always carries the `dark` class.
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          raised: "#111110",
          overlay: "#161615",
        },
        bone: {
          DEFAULT: "#f4f2ed",
        },
        // Legacy names, remapped so older class strings land on the new palette.
        kasa: {
          black: "#0a0a0a",
          charcoal: "#111110",
          ink: "#161615",
          cream: "#f4f2ed",
          sand: "#f4f2ed",
          beige: "#e3d8c8",
          earth: "#c9b8a3",
          gold: "#c9a962",
          goldsoft: "#d4bc7a",
          // bone at 60% over ink, as a solid colour.
          muted: "#969592",
        },
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        display: ["var(--font-grotesk)", "system-ui", "sans-serif"],
      },
      fontSize: {
        lead: ["clamp(1.125rem, 1.5vw, 1.5rem)", { lineHeight: "1.45", letterSpacing: "-0.035em" }],
        title: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.035em" }],
        "display-sm": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.3", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(2.125rem, 4.4vw, 4rem)", { lineHeight: "1.04", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.5rem, 5.4vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(3rem, 7vw, 6rem)", { lineHeight: "0.98", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        tile: "6px",
        panel: "20px",
      },
      boxShadow: {
        lift: "0 30px 80px -20px rgba(0,0,0,0.7)",
        card: "0 12px 40px -12px rgba(0,0,0,0.6)",
        inset: "inset 0 1px 0 rgba(244,242,237,0.06)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
