const path = require("path");

module.exports = {
  plugins: {
    tailwindcss: { config: path.resolve("client/tailwind.config.cjs") },
    autoprefixer: {},
  },
}
