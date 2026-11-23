/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinth: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff5e1e', // Zinth Labs signature orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#ff5e1e',
        },
        ink: {
          950: '#0a0f1c',
          900: '#0f1526',
          800: '#171f33',
          700: '#232c44',
        },
      },
      // Slightly larger, roomier type scale than Tailwind's defaults.
      // Most of the UI uses text-xs / text-sm, so this lifts readability app-wide.
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],    // 15px
        base: ['1rem', { lineHeight: '1.6rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.375rem', { lineHeight: '1.9rem' }],
        '2xl': ['1.625rem', { lineHeight: '2.1rem' }],
        '3xl': ['2rem', { lineHeight: '2.4rem' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px -2px rgba(15, 23, 42, 0.06)',
        lift: '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 12px 32px -8px rgba(15, 23, 42, 0.10)',
        glow: '0 8px 24px -6px rgba(255, 94, 30, 0.45)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'pop-in': {
          from: { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'pop-in': 'pop-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
