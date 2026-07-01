/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // iTourist palette: clean blue (primary) + vivid orange (accent) on white.
        // Token names kept (majolica=blue, ochre=orange, sand=near-white surface)
        // so the whole app rebrands from these definitions.
        // Brand blue scale centered on #0C73FE (rgb 12,115,254) at 500.
        majolica: {
          50: '#eaf3ff', 100: '#d5e7ff', 200: '#aecfff', 300: '#7db0ff',
          400: '#4491ff', 500: '#0c73fe', 600: '#0a5ce0', 700: '#0b49b0',
          800: '#0d3d8f', 900: '#0f3372', 950: '#0a2049',
        },
        // Brand orange scale centered on #FA742D (rgb 250,116,45) at 500.
        ochre: { 300: '#ffb98c', 400: '#fd9a5c', 500: '#fa742d', 600: '#e85e18', 700: '#bf4a12' },
        sand: '#f8fafc',
      },
      fontFamily: {
        // Stapel is the brand typeface; Inter/system fonts are the web fallbacks
        // (Stapel is a commercial font, so it loads only where it's installed).
        display: ['Stapel', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Stapel', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(30,58,138,0.06), 0 12px 28px -14px rgba(30,58,138,0.18)',
        soft: '0 1px 2px rgba(30,58,138,0.06)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'fade-up': 'fade-up 0.4s ease-out both' },
    },
  },
  plugins: [],
};
