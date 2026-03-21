import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts,html}'],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0a66c2',
          light: '#70b5f9',
          dark: '#004182',
          bg: '#f3f2ef',
        },
        score: {
          low: '#ef4444',
          mid: '#f59e0b',
          high: '#22c55e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.16,1,0.3,1)',
        'score-fill': 'scoreFill 1s ease-out forwards',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        scoreFill: { from: { strokeDashoffset: '283' }, to: {} },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
