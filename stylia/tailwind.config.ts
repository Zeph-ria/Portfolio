import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // High-end fashion-tech palette: ivory atelier + ink + gold thread.
        ink: {
          DEFAULT: '#141210',
          soft: '#2b2620',
        },
        ivory: {
          DEFAULT: '#faf7f2',
          deep: '#f1ece3',
        },
        gold: {
          DEFAULT: '#b08d57',
          soft: '#d9c3a3',
        },
        blush: '#e8d5cb',
        sage: '#8a9484',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Jost"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        couture: '0 8px 40px -12px rgba(20, 18, 16, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
