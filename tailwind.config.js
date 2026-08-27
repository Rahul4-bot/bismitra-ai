/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0A2540',
          navyDark: '#071A2E',
          navyLight: '#143C65',
          blue: '#1D4ED8',
          blueLight: '#EFF6FF',
          gold: '#D97706',
          goldLight: '#FEF3C7',
          saffron: '#FF9933',
          green: '#047857',
          greenLight: '#D1FAE5',
          slate: '#334155',
          bgLight: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gov-sm': '0 1px 3px rgba(10, 37, 64, 0.08), 0 1px 2px rgba(10, 37, 64, 0.04)',
        'gov-md': '0 4px 12px rgba(10, 37, 64, 0.08), 0 2px 4px rgba(10, 37, 64, 0.04)',
        'gov-lg': '0 12px 28px rgba(10, 37, 64, 0.12), 0 4px 10px rgba(10, 37, 64, 0.06)',
      }
    },
  },
  plugins: [],
}
