/** @type {import('tailwindcss').Config} */
// Identidade visual RaceMarketBR: os valores vêm do design system
// (tokens.json) e ficam como variáveis CSS em src/index.css.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Selos de categoria montados com o nome da categoria (rm-badge--${categoria})
  safelist: ['rm-badge--turbo', 'rm-badge--aspirado', 'rm-badge--original', 'rm-badge--pista'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'Oswald', 'Impact', 'sans-serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        // Nomes antigos usados no código continuam funcionando
        bebas: ['"Bebas Neue"', 'Oswald', 'Impact', 'sans-serif'],
        montserrat: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
      },
      fontSize: {
        hero: ['96px', { lineHeight: '0.95', letterSpacing: '0.5px' }],
        price: ['32px', { lineHeight: '1' }],
        lead: ['18px', { lineHeight: '28px' }],
      },
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        line: v('border'),
        'line-strong': v('border-strong'),
        ink: { DEFAULT: v('ink'), muted: v('ink-muted') },
        red: { DEFAULT: v('red'), dark: v('red-dark'), text: v('red-text') },
        'on-red': v('on-red'),
        'on-category': v('on-category'),
        success: v('success'),
        warning: v('warning'),
        // Aliases dos nomes antigos -> tokens
        primary: {
          black: v('bg'),
          gray: v('surface'),
          red: v('red'),
          white: v('ink'),
        },
        turbo: { primary: v('turbo'), secondary: v('red-text'), accent: v('red-dark'), dark: v('red-dark'), light: v('red-text') },
        aspirado: { primary: v('aspirado'), secondary: v('aspirado'), accent: v('aspirado'), dark: v('aspirado'), light: v('aspirado') },
        original: { primary: v('original'), secondary: v('original'), accent: v('original'), dark: v('original'), light: v('original') },
        pista: { primary: v('pista'), secondary: v('pista'), accent: v('pista'), dark: v('pista'), light: v('pista'), black: v('bg') },
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '8px',
        xl: '12px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 12px 32px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-turbo': 'linear-gradient(90deg, rgb(var(--turbo)) 0%, rgb(var(--red-dark)) 100%)',
        'gradient-aspirado': 'linear-gradient(90deg, rgb(var(--aspirado)) 0%, rgb(var(--aspirado)) 100%)',
        'gradient-original': 'linear-gradient(90deg, rgb(var(--original)) 0%, rgb(var(--original)) 100%)',
        'gradient-pista': 'linear-gradient(90deg, rgb(var(--pista)) 0%, rgb(var(--pista)) 100%)',
      },
    },
  },
  plugins: [],
}
