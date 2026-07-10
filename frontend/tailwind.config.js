/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf8f5',
          100: '#f3ece2',
          200: '#e5d7c3',
          300: '#d1bfa2',
          400: '#bda37e',
          500: '#a8875e',
          600: '#9b7952',
          700: '#816142',
          800: '#694e37',
          900: '#563e2e',
          950: '#2e2017',
        },
      },
    },
  },
  plugins: [],
}
