import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e2",
          300: "#b0b8c9",
          400: "#8591aa",
          500: "#65718f",
          600: "#505a76",
          700: "#424a60",
          800: "#394051",
          900: "#111725",
          950: "#0a0e17",
        },
        accent: {
          DEFAULT: "#2563eb",
          soft: "#dbeafe",
        },
        gain: "#0f9d58",
        loss: "#d93025",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Hiragino Kaku Gothic ProN",
          "Meiryo",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
