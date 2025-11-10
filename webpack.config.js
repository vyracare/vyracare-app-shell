const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  output: { uniqueName: "vyracare-app-shell", publicPath: "auto" },
  optimization: { runtimeChunk: false },
  plugins: [
    new ModuleFederationPlugin({
      shared: ["@angular/core", "@angular/common", "@angular/router"]
    })
  ],
};
