/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🌑 OLED BLACKS
        dark: {
          900: '#000000', // True Black (Background)
          800: '#0a0a0a', // Slightly Lighter (Cards)
          700: '#121212', // Borders/Separators
          600: '#1e1e1e', // Inputs
        },
        // ⚡ NEON ACCENTS
        primary: {
          DEFAULT: '#7c3aed', // Vivid Purple
          glow: 'rgba(124, 58, 237, 0.5)',
        },
        accent: {
          DEFAULT: '#00f0ff', // Cyberpunk Cyan
          glow: 'rgba(0, 240, 255, 0.5)',
        },
        success: '#00ff9d', // Neon Green
        danger: '#ff003c',  // Neon Red
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'], // Coding Font
        sans: ['"Inter"', 'sans-serif'],    // UI Font
      },
      boxShadow: {
        'neon': '0 0 10px rgba(124, 58, 237, 0.3), 0 0 20px rgba(124, 58, 237, 0.1)',
        'neon-blue': '0 0 10px rgba(0, 240, 255, 0.3), 0 0 20px rgba(0, 240, 255, 0.1)',
      }
    },
  },
  plugins: [],
}