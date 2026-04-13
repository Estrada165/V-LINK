/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mg: {
          black: '#0a0a0a',
          dark: '#111111',
          card: '#161616',
          border: '#1f1f1f',
          muted: '#2a2a2a',
          gray: '#6b6b6b',
          light: '#a0a0a0',
          white: '#f0f0f0',
          red: '#e03030',
          'red-dark': '#b02020',
          'red-glow': 'rgba(224,48,48,0.15)',
          green: '#1db954',
          'green-glow': 'rgba(29,185,84,0.15)',
          cyan: '#00c8c8',
          'cyan-glow': 'rgba(0,200,200,0.1)',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.97)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(224,48,48,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(224,48,48,0.5)' },
        }
      }
    },
  },
  plugins: [],
}