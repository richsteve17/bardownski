/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ice-black': '#050505',
        'puck-grey': '#1a1a1a',
        'goal-red': '#ff3b3b',
        'tape-blue': '#0070f3',
        'momentum-gold': '#ffb000',
      },
    },
  },
  plugins: [],
}
