/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        navy: {
          950: '#050d1e',
          900: '#081529',
          850: '#0a1a30',
          800: '#0d1e3d',
          750: '#0f2347',
          700: '#122849',
          600: '#173260',
        },
        electric: {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      boxShadow: {
        'glow-sm':   '0 0 12px rgba(59,130,246,0.25)',
        'glow':      '0 0 24px rgba(59,130,246,0.30)',
        'glow-lg':   '0 0 40px rgba(59,130,246,0.20)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.40)',
      },
    },
  },
  plugins: [],
};
