/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '390px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: '#2a2420',
        secondary: '#b8a89a',
        accent: '#a89880',
        'accent-light': '#e8d8d0',
        'text-dark': '#1a1a1a',
        'text-light': '#f5f5f5',
        light: '#F5F5F5',
        success: '#6B9E7F',
        error: '#C1666B',
        warning: '#D4A373',
        info: '#7B9FC9',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        lato: ['Lato', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        trebuchet: ['Trebuchet MS', 'Arial', 'sans-serif'],
        'tt-commons': ['Trebuchet MS', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
