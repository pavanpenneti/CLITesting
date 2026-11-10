const path = require("path");
const WebpackObfuscator = require("webpack-obfuscator");

module.exports = {
  webpack: {
    configure: (config, { env }) => {
      if (env === "production") {
        config.devtool = false; // no source maps

        config.module.rules.push({
          test: /\.(js|jsx)$/,
          include: path.resolve(__dirname, "src"),
          enforce: "post",
          use: {
            loader: WebpackObfuscator.loader,
            options: {
              compact: true,
              stringArray: true,
              stringArrayEncoding: ["base64"],
              stringArrayThreshold: 0.75,
              rotateStringArray: true,
              identifierNamesGenerator: "hexadecimal",
              renameGlobals: false,
              selfDefending: false,
            },
          },
        });
      }
      return config;
    },
  },
};