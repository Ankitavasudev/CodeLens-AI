/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: { 950:'#050510', 900:'#0a0a1a', 800:'#12122a', 700:'#1a1a3a', 600:'#252550', 500:'#3a3a6a', 400:'#6b6b9a', 300:'#9d9dc8' },
        lens: { purple:'#a855f7', blue:'#3b82f6', cyan:'#06b6d4', green:'#10b981', pink:'#ec4899' },
      },
      animation: { 'glow': 'glow 2s ease-in-out infinite alternate' },
      keyframes: { glow: { '0%': { boxShadow: '0 0 20px rgba(168,85,247,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(168,85,247,0.6)' } } },
    },
  },
  plugins: [],
}
