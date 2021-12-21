// esbuild.config.js

const path = require('path')
const sassPlugin = require('esbuild-plugin-sass')
const { styleLoaderPlugin } = require("./esbuild.style.loader.plugin");

require("esbuild").build({
  entryPoints: [
    'application.js',
    'react/hello_react.js',
    'styles/index.css'
  ],
  bundle: true,
  logLevel: 'info',
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  watch: process.argv.includes("--watch"),
  publicPath: '/assets',
  loader: {
    '.js': 'jsx',
    '.png': 'file'
  },
  plugins: [
    styleLoaderPlugin,
    sassPlugin()
  ],
}).catch(() => process.exit(1))
