import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neo: {
          black: "var(--color-black)",
          white: "var(--color-white)",
          yellow: "var(--color-yellow)",
          red: "var(--color-red)",
          blue: "var(--color-blue)",
          green: "var(--color-green)",
          orange: "var(--color-orange)",
          gray: "var(--color-gray)",
          muted: "var(--color-muted)",
        },
      },
      borderWidth: {
        3: "3px",
      },
      boxShadow: {
        "neo-sm": "2px 2px 0 0 var(--shadow-color)",
        neo: "3px 3px 0 0 var(--shadow-color)",
        "neo-lg": "5px 5px 0 0 var(--shadow-color)",
      },
      fontFamily: {
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        shell: "100rem",
      },
    },
  },
  plugins: [],
};

export default config;
