/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      spacing: {
        20: '20px'
      },
      width: {
        260: '260px'
      },
      height: {
        80: '80px',
        200: '200px'
      },
      gridTemplateColumns: {
        auto: 'repeat(auto-fill, minmax(360px, 1fr))'
      },
      fontFamily: {
        virgil: ['Virgil', 'regular']
      },
      fontSize: {
        note: '1.05rem'
      },
      colors: {
        'ui-blue': '#1c3ffd',
        'error-red': '#ff0000'
      }
    }
  },
  plugins: []
}
