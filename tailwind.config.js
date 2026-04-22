/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './frontend/templates/**/*.html',
    './frontend/templates/**/*.js',
    './backend/static/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003781',
          light: '#008ed6',
          dark: '#075994',
        },
        secondary: '#006192',
        accent: '#f86200',
        success: '#1e8927',
        danger: '#dc3149',
        warning: '#efbe25',
        info: '#496ebd',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
