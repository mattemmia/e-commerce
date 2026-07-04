/** @type {import('tailwindcss').Config} */
module.exports {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./functions/**/*", // <-- ADD THIS LINE. This is the fix
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