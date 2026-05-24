/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#111111",
        surfaceHover: "#1a1a1a",
        primary: "#ffffff",
        secondary: "#a1a1a1",
        accent: "#64748b", // Slate 500
        accentHover: "#475569", // Slate 600
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to right bottom, #334155, #475569, #64748b)',
      }
    },
  },
  plugins: [],
}
