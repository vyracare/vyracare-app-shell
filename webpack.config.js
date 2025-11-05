const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  output: { uniqueName: "vyracare-app-shell", publicPath: "auto" },
  optimization: { runtimeChunk: false },
  plugins: [
    new ModuleFederationPlugin({
      remotes: {
        dashboard: "dashboard@https://cdn-url/vyracare-app-dashboard-mfe/remoteEntry.js"
      },
      shared: ["@angular/core", "@angular/common", "@angular/router"]
    })
  ],
};
