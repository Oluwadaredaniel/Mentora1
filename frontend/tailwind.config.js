/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        backgroundDark: "#0f172a",
        accent: "#38bdf8",
      },
    },
  },
  plugins: [],
}
