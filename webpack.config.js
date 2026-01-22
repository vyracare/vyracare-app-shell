const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

const shared = {
  "@angular/core": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/core"] },
  "@angular/common": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/common"] },
  "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/common"] },
  "@angular/router": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/router"] },
  "@angular/forms": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/forms"] },
  "rxjs": { singleton: true, strictVersion: true, requiredVersion: deps["rxjs"] }
};

module.exports = {
  output: { uniqueName: "vyracare-app-shell", publicPath: "auto" },
  optimization: { runtimeChunk: false },
  plugins: [
    new ModuleFederationPlugin({
      shared
    })
  ],
};
