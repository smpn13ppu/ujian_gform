/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#133E59',
          dark: '#0e2d42',
          light: '#1b5275',
        },
        forest: {
          DEFAULT: '#1A936F',
          hover: '#147C5D',
          active: '#0F6B4F',
          light: '#E8F5F2',
        },
        teal: {
          accent: '#147C5D',
          muted: '#5CA08E',
        },
        sky: {
          DEFAULT: '#00ACED',
        },
        coral: {
          DEFAULT: '#E95950',
        },
        danger: {
          DEFAULT: '#CC0001',
        },
        neutral: {
          surface: '#FFFFFF',
          bg: '#F3F3F3',
          border: '#DDDDDD',
          darkText: '#222222',
        }
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'button': '5px',
        'card': '10px',
        'input': '0px',
        'pill': '100px',
      },
      boxShadow: {
        'btn': 'rgba(0, 0, 0, 0.25) 0px 10px 20px -10px',
        'btn-hover': 'rgba(0, 0, 0, 0.35) 0px 10px 20px -10px',
        'card-hover': 'rgba(0, 0, 0, 0.1) 0px 4px 12px 0px',
        'elevation-large': 'rgba(0, 0, 0, 0.25) 0px 20px 40px -10px',
        'elevation-xl': 'rgba(0, 0, 0, 0.2) 4px 4px 20px 0px',
      }
    },
  },
  plugins: [],
}
