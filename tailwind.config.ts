
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'ms-sans': ['MS Sans Serif', 'Tahoma', 'sans-serif'],
      },
      colors: {
        'win95-gray': '#c0c0c0',
        'win95-blue': '#0000ff',
        'win95-teal': '#008080',
      }
    },
  },
  plugins: [],
} satisfies Config;
