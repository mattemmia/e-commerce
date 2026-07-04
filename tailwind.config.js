/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./functions/**/*",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#22c55e',
          blue: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
}