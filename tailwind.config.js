/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        card: '#26292F',
        inputtext: '#ACB8C5',
        background: '#16181C',
        primarygreen: '#1BD96A'
      }
    },
  },
  plugins: [],
}
