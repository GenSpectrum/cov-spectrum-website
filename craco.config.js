// craco.config.js
module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          assert: false,
        }
      }
    }
  }
};
