/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pm: "#4a5878",
        sc: "#505050",
        bc: "#2c2c2c",
      },
    },
  },
  plugins: [],
}

