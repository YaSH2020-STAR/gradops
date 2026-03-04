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
        primary: '#FF8975',
        dark: '#0E0E0E',
        darkBg: '#141414',
        light: '#FFFFFF',
        gray1: '#ACAFB9',
        gray2: '#D5D5D5',
        gray3: '#606165',
        stroke: '#2C2C2C',
      },
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
