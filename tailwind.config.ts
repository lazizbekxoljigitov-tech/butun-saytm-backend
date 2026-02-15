/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff7a18',
          hover: '#e66a10',
          light: '#ffb37a',
        },
        dark: {
          DEFAULT: '#0a0a0b',
          bg: '#0a0a0b',
          light: '#161617',
          lighter: '#1f1f21',
          accent: '#2a2a2d',
          border: '#2a2a2d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(to bottom right, #0a0a0b, #161617, #0a0a0b)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(255, 122, 24, 0.15), transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
