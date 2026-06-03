import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f7f7f6', 100: '#eeede9', 200: '#dddbd5', 300: '#c5c2b9',
          400: '#a8a397', 500: '#908a7b', 600: '#7d7670', 700: '#676159',
          800: '#554f49', 900: '#47423d', 950: '#262320',
        },
        gold: { 500: '#d99620', 600: '#c07615', 700: '#9f5813' },
        deal: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', badge: '#059669' },
        rise: { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239', badge: '#e11d48' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
} satisfies Config;
