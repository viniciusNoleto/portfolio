
import {
  PRIMARY_COLOR_PALETTE,
} from './common/constants/colors';


/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.vue',
    './components/*.vue',
    './layouts/*.vue',
    './pages/**/*.vue',
    './pages/*.vue',
    './app/**/*.vue'
  ],
  theme: {
    fontSize: {
      '4xs': 'clamp(0.4rem, 0.3286rem + 0.1786vw, 0.5rem)',
      '3xs': 'clamp(0.5rem, 0.4286rem + 0.1786vw, 0.6rem)',
      '2xs': 'clamp(0.6rem, 0.5286rem + 0.1786vw, 0.7rem)',
      xs: 'clamp(0.7rem, 0.6286rem + 0.1786vw, 0.8rem)',
      sm: 'clamp(0.8rem, 0.7286rem + 0.1786vw, 0.9rem)',
      md: 'clamp(0.9rem, 0.8286rem + 0.1786vw, 1rem)',
      base: 'clamp(0.9rem, 0.8286rem + 0.1786vw, 1rem)',
      lg: 'clamp(1rem, 0.8929rem + 0.2679vw, 1.15rem)',
      xl: 'clamp(1.15rem, 1.0786rem + 0.1786vw, 1.25rem)',
      '2xl': 'clamp(1.25rem, 1.0264rem + 0.5589vw, 1.563rem)',
      '3xl': 'clamp(1.563rem, 1.2844rem + 0.6964vw, 1.953rem)',
      '4xl': 'clamp(1.953rem, 1.6044rem + 0.8714vw, 2.441rem)',
      '5xl': 'clamp(2.441rem, 2.0046rem + 1.0911vw, 3.052rem)',
      '6xl': 'clamp(3.052rem, 2.507rem + 1.3625vw, 3.815rem)',
      '7xl': 'clamp(3.815rem, 3.1343rem + 1.7018vw, 4.768rem)',
      '8xl': 'clamp(4.768rem, 3.9166rem + 2.1286vw, 5.96rem)',
      '9xl': 'clamp(5.96rem, 4.895rem + 2.6625vw, 7.451rem)',
    },
    extend: {
      colors: {
        default: {
          light: '#27272a',
          dark: '#fafafa',
        },
        primary: PRIMARY_COLOR_PALETTE,
      },
      backgroundImage: {
        'gradient-circle': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      flexGrow: {
        max: '999'
      }
    }
  },
};
