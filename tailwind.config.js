
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bebas': ['Bebas Neue', 'cursive'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          black: '#0E0E10',
          gray: '#1A1A1D',
          red: '#DC143C',
          white: '#FFFFFF',
        },
        turbo: {
          primary: '#DC143C',
          dark: '#B71C1C',
          light: '#FF5252',
        },
        aspirado: {
          primary: '#FFD700',
          dark: '#FFA000',
          light: '#FFEB3B',
        },
        original: {
          primary: '#4CAF50',
          dark: '#2E7D32',
          light: '#81C784',
        },
        pista: {
          primary: '#FF6600',
          dark: '#E65100',
          light: '#FF8A50',
          black: '#0E0E10',
        }
      },
      backgroundImage: {
        'gradient-race': 'linear-gradient(135deg, #0E0E10 0%, #DC143C 50%, #0E0E10 100%)',
        'gradient-turbo': 'linear-gradient(90deg, #DC143C 0%, #B71C1C 100%)',
        'gradient-aspirado': 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)',
        'gradient-original': 'linear-gradient(90deg, #4CAF50 0%, #2E7D32 100%)',
        'gradient-pista': 'linear-gradient(90deg, #FF6600 0%, #E65100 100%)',
      }
    },
  },
  plugins: [],
}
