/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--eo-surface)',
          raised: 'var(--eo-surface-raised)',
          overlay: 'var(--eo-surface-overlay)',
        },
        ink: {
          DEFAULT: 'var(--eo-ink)',
          muted: 'var(--eo-ink-muted)',
          faint: 'var(--eo-ink-faint)',
        },
        accent: {
          DEFAULT: 'var(--eo-accent)',
          soft: 'var(--eo-accent-soft)',
          glow: 'var(--eo-accent-glow)',
        },
      },
      boxShadow: {
        glow: '0 0 60px -12px var(--eo-accent-glow)',
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
