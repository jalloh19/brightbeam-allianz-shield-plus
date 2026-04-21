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
        primary: '#1e40af',
        secondary: '#7c3aed',
        accent: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
