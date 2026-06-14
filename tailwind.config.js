/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: { DEFAULT: '#2D5016', light: '#4a7a2a', dark: '#1a3a0e' },
        earth: { DEFAULT: '#8B6914', light: '#d4a357', dark: '#5a4510' },
        warm: { DEFAULT: '#E8A317', light: '#f0c04a', dark: '#b8820f' },
        stream: { DEFAULT: '#4A8B9C', light: '#7ab5c4', dark: '#2a5a66' },
        bark: { DEFAULT: '#1a1208', light: '#2a1e10' },
        moss: { DEFAULT: '#4a7a2a', light: '#7dc97d' },
        snow: { DEFAULT: '#F0F4F8', dark: '#c0c8d0' },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
