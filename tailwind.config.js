const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--pan-primary-color)",
        secondary: "var(--pan-secondary-color)",
        tertiary: "var(--pan-tertiary-color)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
