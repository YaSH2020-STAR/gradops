import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e8795c',
        primaryFrom: '#a855f7',
        primaryVia: '#c2410c',
        primaryTo: '#ea580c',
        dark: '#0E0E0E',
        darkBg: '#141414',
        light: '#FFFFFF',
        gray1: '#ACAFB9',
        gray2: '#D5D5D5',
        gray3: '#606165',
        stroke: '#2C2C2C',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #a855f7 0%, #c2410c 50%, #ea580c 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(234,88,12,0.15) 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
