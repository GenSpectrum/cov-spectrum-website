const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  important: true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      indigo: colors.indigo,
      red: colors.rose,
      yellow: colors.amber,
      blue: colors.blue,
      eth: {
        DEFAULT: '#1F407A',
        light: '#1269B0',
      },
    },
    extend: {},
  },
  variants: {
    extend: {
      animation: ['hover', 'focus'],
    },
  },
  plugins: [],
};
