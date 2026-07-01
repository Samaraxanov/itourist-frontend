/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette drawn from Samarkand majolica tilework
        majolica: {
          50: '#eef4fb', 100: '#d6e4f5', 200: '#a9c6ea',
          400: '#3f7bc4', 600: '#1e4f8f', 700: '#173e73', 900: '#0f2647',
        },
        ochre: { 400: '#e0a43b', 500: '#c98a24', 600: '#a86f16' },
        sand: '#f7f4ee',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
