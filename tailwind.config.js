/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chiado: {
          green: "#79AA45",
          cream: "#F2E7DC",
          bg: "#070707",
          panel: "#0B0B0B",
          border: "#1A1A1A",
          text: "#FFFFFF",
          muted: "#A1A1AA",
        },
      },
    },
  },
  plugins: [],
}
