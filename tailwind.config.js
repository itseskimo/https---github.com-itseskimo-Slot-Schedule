/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs:"460px",
      sm: "500px",
      md: "708px",
      lg: "900px",    
      xl: "1200px",
    },
    extend: {
    
    
    },
  },
  plugins: [],
}