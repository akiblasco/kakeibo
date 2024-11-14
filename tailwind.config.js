/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#ffffff',
          dark: '#1d1d1f',
        },
        secondary: {
          light: '#f5f5f7',
          dark: '#2d2d2f',
        },
        accent: '#0071e3',
        category: {
          essentials: '#34c759',
          wants: '#ff9f0a',
          culture: '#5856d6',
          extras: '#ff2d55',
        },
      },
    },
  },
  plugins: [],
}

