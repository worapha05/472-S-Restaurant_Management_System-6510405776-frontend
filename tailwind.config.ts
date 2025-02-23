import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-thai)', 'var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      colors: {
        background: "#FFFFFF",
        primary: "#333333",
        secondary: "#666666",
        accent: "#4D4D4D",
        button: "#262626",
        hoverButton: "#404040",
        mainText: "#1A1A1A",
        secondText: "#808080",
        placeholder: "#999999",
        searchBox: "#F2F2F2",
        boldTextHighlights: "#000000",
        cancelRed: "#A91D3A",
        hoverCancel: "#B22222",
        acceptGreen: "#1DA936",
        hoverAccept: "#264653",
        inputFieldFocus: "#4E54E7",
      },
    },
  },
  plugins: [],
} satisfies Config;
