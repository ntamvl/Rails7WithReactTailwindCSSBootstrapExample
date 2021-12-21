// esbuild.style.loader.plugin.js

const fs = require('fs');

const styleLoaderPlugin = {
  name: 'styleLoader',
  setup: build => {
    // replace CSS imports with synthetic 'loadStyle' imports
    build.onLoad({ filter: /\.css$/ }, async args => {
      return {
        contents: `
          import {loadStyle} from 'loadStyle';
          loadStyle(${JSON.stringify(args.path)});
        `,
        loader: 'js',
      };
    });

    // resolve 'loadStyle' imports to the virtual loadStyleShim namespace which is this plugin
    build.onResolve({ filter: /^loadStyle$/ }, args => {
      return { path: `loadStyle(${JSON.stringify(args.importer)})`, namespace: 'loadStyleShim' };
    });

    // define the loadStyle() function that injects CSS as a style tag
    build.onLoad({ filter: /^loadStyle\(.*\)$/, namespace: 'loadStyleShim' }, async args => {
      const match = /^loadStyle\(\"(.*)"\)$/.exec(args.path);
      const cssFilePath = match[1];
      const cssFileContents = String(fs.readFileSync(cssFilePath));
      return {
        contents: `
          export function loadStyle() {
              const style = document.createElement('style');
              style.innerText = \`${cssFileContents}\`;
              document.querySelector('head').appendChild(style);
          }
        `,
      };
    });
  },
};

module.exports = {
  styleLoaderPlugin
};
