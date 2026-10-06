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
        quran: {
          bg: '#0a1412',
          surface: '#11221e',
          card: '#162e29',
          border: '#1f3f38',
          gold: '#e6af45',
          goldLight: '#ffd67a',
          emerald: '#10b981',
          emeraldLight: '#34d399',
          emeraldDark: '#064e3b',
          textMuted: '#94a3b8',
          textPrimary: '#f8fafc'
        }
      },
      fontFamily: {
        arabic: ['"Amiri"', '"Scheherazade New"', '"Traditional Arabic"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(230, 175, 69, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
