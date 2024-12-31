/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      colors: {
        category: {
          housing: {
            start: "#3b82f6", // blue-500
            end: "#6366f1", // indigo-500
          },
          subscriptions: {
            start: "#a855f7", // purple-500
            end: "#ec4899", // pink-500
          },
          daily: {
            start: "#22c55e", // green-400
            end: "#14b8a6", // teal-400
          },
          wants: {
            start: "#facc15", // yellow-400
            end: "#fb923c", // orange-500
          },
          leisure: {
            start: "#f472b6", // pink-500
            end: "#ef4444", // red-500
          },
          unexpected: {
            start: "#f87171", // red-400
            end: "#991b1b", // red-700
          },
        },
      },
    },
  },
  plugins: [],
};
