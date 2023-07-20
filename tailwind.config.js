const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Note: screen sizes ('sm', 'md', etc) need to be wrapped
    // in quotes. So if auto-format saves without quotes, please
    // save this file without auto-formatting.
    screens: {
      xs: "390px",
      sm: "640px",
      md: "905px",
      lg: "1024px",
    },
    // Add three custom colors to the default Tailwind palette
    colors: {
      primary: "var(--pan-primary-color)",
      secondary: "var(--pan-secondary-color)",
      tertiary: "var(--pan-tertiary-color)",
      red: colors.red,
      rose: colors.rose,
      orange: colors.orange,
      indigo: colors.indigo,
      white: colors.white,
      blue: colors.blue,
      gray: colors.gray,
      green: colors.green,
      slate: colors.slate,
      yellow: colors.yellow,
      amber: colors.amber,
      orange: colors.orange,
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
