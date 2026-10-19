/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          primary: '#714B67',      // Odoo purple primary
          primaryHover: '#5B3C53',
          secondary: '#017E84',    // Odoo teal
          dark: '#212529',
          light: '#F8F9FA',
          border: '#E2E8F0',
          accent: '#875A7B'
        }
      }
    },
  },
  plugins: [],
}
