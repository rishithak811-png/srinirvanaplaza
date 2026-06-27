/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          gold: '#D4AF37', // Luxury Gold
          goldDark: '#C5A028',
          bronze: '#8C6239',
          navy: '#0B132B', // Luxury Navy
          navyDark: '#070C1E',
          cream: '#F9F8F6', // Off white cream
          ivory: '#F4F1EA',
          slate: '#1C2541'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
