const path = require("path");

module.exports = {
  content: [path.resolve("client/src") + "/**/*.{js,jsx}", path.resolve("client/public/index.html")],
  theme: {
    extend: {
      colors: {
        main: "#D0F4EA",
        mainIntensive: "#9CE7D2",
        complement: "#34252F",
        dark: "#444054",
        modal: "rgba(0,0,0,0.4)",
        text: "#202020"
      },
      minWidth: {
        "1/2": "50%",
        "3/4": "75%"
      },
      height: {
        "custom": "80vh"
      },
      margin: {
        "320px": "320px"
      },
      width: {
        "450": "450px"
      },
      spacing: {
        "72px": "72px"
      },
      boxShadow: {
        "sidebar": "0 2px 10px rgba(0,0,0,.3)"
      }
    },
  },
  plugins: [],
}
