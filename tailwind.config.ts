import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f8',
          100: '#d5dff0',
          200: '#aabfe1',
          300: '#7a98cd',
          400: '#4f75b8',
          500: '#2d5aa0',
          600: '#1e3f7a',
          700: '#162e5c',
          800: '#0f1f3f',
          900: '#080f20',
          950: '#040810',
        },
        teal: {
          50:  '#edfafa',
          100: '#d0f2f2',
          200: '#a0e5e5',
          300: '#6bd1d1',
          400: '#38b8b8',
          500: '#1e9e9e',
          600: '#137e7e',
          700: '#0d5f5f',
          800: '#083f3f',
          900: '#042020',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        cream: {
          50:  '#fafaf8',
          100: '#f5f5f0',
          200: '#ebebdf',
          300: '#deded0',
          400: '#c8c8b8',
        },
        incident: '#c0392b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.25rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.375rem' }],
        'base': ['1rem',     { lineHeight: '1.625rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.75rem' }],
      },
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        'soft':   '0 2px 12px 0 rgba(14, 30, 62, 0.06), 0 1px 3px 0 rgba(14, 30, 62, 0.04)',
        'medium': '0 4px 24px 0 rgba(14, 30, 62, 0.10), 0 2px 6px 0 rgba(14, 30, 62, 0.06)',
        'strong': '0 8px 40px 0 rgba(14, 30, 62, 0.16), 0 4px 10px 0 rgba(14, 30, 62, 0.08)',
        'teal':   '0 4px 20px 0 rgba(30, 158, 158, 0.25)',
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-ring': 'pulseRing 1.4s ease-out infinite',
        'waveform':   'waveform 0.8s ease-in-out infinite alternate',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        waveform: {
          from: { transform: 'scaleY(0.3)' },
          to:   { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
