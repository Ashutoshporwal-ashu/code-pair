/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0a0a0a",       // Pitch Black (Background)
        darker: "#000000",     // Sidebar/Card (Pure Black)
        accent: "#8b5cf6",     // ✨ NEW: Royal Purple (Violet-500)
        accentHover: "#7c3aed", // Darker Purple for Hover
        textLight: "#e5e7eb",  // Soft White
        inputBg: "#1f1f1f",    // Dark Grey for Inputs
      }
    },
  },
  plugins: [],
}