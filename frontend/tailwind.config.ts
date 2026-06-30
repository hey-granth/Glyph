import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Avenir Next"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', 'serif'],
        mono: ['"SF Mono"', '"Cascadia Code"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: '#0d0d0d',
        surface: '#0f0f0f',
        'surface-raised': '#161616',
        mist: '#e8ede9',
        graphite: '#1a1a1a',
        border: 'rgba(255,255,255,0.07)',
        mint: '#9fd8bf',
        amber: '#caa167',
        rose: '#cb8d8b',
        'mint-dim': 'rgba(159,216,191,0.15)',
      },
      backgroundOpacity: {
        8: '0.08',
      },
      boxShadow: {
        'panel': '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04)',
        'dropdown': '0 16px 48px rgba(0,0,0,0.5)',
        'toast': '0 8px 24px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        'xs': ['11px', '16px'],
        'sm': ['12px', '18px'],
        'base': ['13px', '20px'],
        'md': ['14px', '20px'],
        'lg': ['15px', '22px'],
        'xl': ['17px', '24px'],
      },
      keyframes: {
        'spin-smooth': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'spin-smooth': 'spin-smooth 0.8s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
