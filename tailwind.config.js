/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Fredoka One', 'cursive'],
      },
      colors: {
        primary: { DEFAULT: '#6C5CE7', light: '#A29BFE' },
        secondary: { DEFAULT: '#00CEC9', light: '#81ECEC' },
        accent: { DEFAULT: '#FD79A8', light: '#FDA7DF' },
        success: '#00B894',
        error: '#FF6B6B',
        warning: '#FDCB6E',
        info: '#74B9FF',
      },
      fontSize: {
        'word-jr': '48px',
        'word-md': '36px',
        'word-sr': '28px',
      },
    },
  },
  plugins: [],
};
