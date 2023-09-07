
const settingsScreens = require("./src/tailwindcss/responsive-text-sizes/tailwind.settings.screens");
const settingsFontSizes = require("./src/tailwindcss/responsive-text-sizes/tailwind.settings.fontSizes");

module.exports = {
  mode: "jit",
  content: ["./src/**/*.{html,js}"],
  theme: {
    //responsive text sizes
    screens: settingsScreens,
    fontSize: settingsFontSizes,

    extend: {
      colors: {
        color1: "#22A699",
        color2: "#F2BE22",
        color3: "#EAEAEA",
        color4: "#F29727"
      },
    },
  },
  plugins: [],
};
