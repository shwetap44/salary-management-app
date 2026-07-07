/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F7F7F5",
        surface: "#FFFFFF",
        border: "#E4E4E1",
        ink: "#1C1C1A",
        muted: "#6B6B66",
        accent: {
          DEFAULT: "#3452C6",
          soft: "#E9EDFB",
        },
        positive: {
          DEFAULT: "#1F9D6B",
          soft: "#E4F5EE",
        },
        warn: {
          DEFAULT: "#B45309",
          soft: "#FBEEDD",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
