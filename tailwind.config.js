/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#F2FBF5',
          100: '#E8F7EE',
          200: '#A7D7B5',
          300: '#7FD4A0',
          400: '#45B86A',
          500: '#2E9E52',
          600: '#217A3C',
          700: '#1A6B34',
          800: '#145228',
          900: '#0D3B1F',
        },
        orange: {
          100: '#FFFDE6',
          400: '#F7DB4A',
          500: '#F3CD03',
          600: '#D4AE02',
        },
        gold: '#E8A838',
      },
    },
  },
  plugins: [],
};
