/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pm: "var(--color-pm)",
        sc: "var(--color-sc)",
        bc: "var(--color-bc)",
      },
    },
  },
  plugins: [],
}