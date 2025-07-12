// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Define your custom font family here
        // The name 'playfair' will become 'font-playfair' in your HTML
        // 'Playfair Display' (in quotes) is the actual CSS font-family name
        // 'serif' is a generic fallback, good for Playfair Display
        playfair: ['"Playfair Display"', 'serif'],
        roboto : ['"Roboto"'],
        // If you still want a sans-serif default or another custom one:
        // sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}