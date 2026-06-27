/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clutch: {
          bg: '#0A0A0F',
          surface: '#13131A',
          card: '#1C1C27',
          border: '#2A2A3D',
          accent: '#6C63FF',
          accentHover: '#5A52E0',
          accentGlow: 'rgba(108,99,255,0.15)',
          green: '#00E5A0',
          amber: '#FFB547',
          red: '#FF5C5C',
          textPrimary: '#F0F0FF',
          textSecondary: '#8888AA',
          textMuted: '#55556A'
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        glow: '0 0 30px rgba(108,99,255,0.2)',
        'glow-sm': '0 0 15px rgba(108,99,255,0.15)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'blob': 'blob 7s infinite'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' }
        }
      }
    }
  },
  plugins: []
}
