/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette drawn from Samarkand majolica tilework (full scale)
        majolica: {
          50: '#eef4fb', 100: '#d6e4f5', 200: '#a9c6ea', 300: '#7aa6db',
          400: '#3f7bc4', 500: '#2b64ab', 600: '#1e4f8f', 700: '#173e73',
          800: '#123156', 900: '#0f2647', 950: '#0a1a33',
        },
        ochre: { 300: '#ecc06b', 400: '#e0a43b', 500: '#c98a24', 600: '#a86f16', 700: '#855812' },
        sand: '#f7f4ee',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,38,71,0.06), 0 12px 28px -14px rgba(15,38,71,0.16)',
        soft: '0 1px 2px rgba(15,38,71,0.05)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 0)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'fade-up': 'fade-up 0.4s ease-out both' },
    },
  },
  plugins: [],
};
