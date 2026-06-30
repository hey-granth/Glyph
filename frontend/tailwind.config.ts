import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', 'serif'],
        body: ['"Avenir Next"', '"Segoe UI"', 'sans-serif'],
        mono: ['"SF Mono"', '"Cascadia Code"', 'monospace'],
      },
      colors: {
        ink: '#0f1415',
        mist: '#edf3ef',
        graphite: '#1d2425',
        mint: '#9fd8bf',
        amber: '#caa167',
        rose: '#cb8d8b',
      },
      boxShadow: {
        glass: '0 18px 60px rgba(0, 0, 0, 0.18)',
        lift: '0 12px 30px rgba(18, 24, 23, 0.14)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
