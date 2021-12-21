# Rails 7 with React, TailwindCSS and Bootstrap 5 Example

Rails 7 with React, TailwindCSS and Bootstrap 5 Example
- Rails 7.0.0
- SQLite
- Node v14.15.0
- NPM 6.14.8
- Yarn 1.22.17
- TailwindCSS 3
- Bootstrap 5
- React 17.0.2

## Setup Rails 7 project
**Create Rails 7 project**
```bash
rails _7.0.0_ new Rails7WithReactTailwindCSSBootstrapExample -j esbuild -c tailwind
```

**Install node packages**
```bash
yarn add @tailwindcss/forms @tailwindcss/typography bootstrap @popperjs/core jquery postcss-flexbugs-fixes postcss-import postcss-nested postcss-preset-env react react-dom prop-types
```

**Create PostCSS config file `postcss.config.js`**
```js
module.exports = {
  plugins: [
    require("autoprefixer"),
    require("postcss-import"),
    require("tailwindcss"),
    require("postcss-nested"),
    require("postcss-flexbugs-fixes"),
    require("postcss-preset-env")({
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
    }),
  ],
};

```

**Create esbuild plugin to load css file `esbuild.style.loader.plugin.js`**
```js
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

```

**Create file `esbuild.config.js`**
```js
// esbuild.config.js

const path = require('path')
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
    styleLoaderPlugin
  ],
}).catch(() => process.exit(1))

```

**Add build script to `package.json`**
```json
// ...
"scripts": {
    "build": "node esbuild.config.js",
    "build:css": "tailwindcss --postcss -i ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css"
},
// ...
```

**Generate tailwindcss config**
```
rm tailwind.config.js
npx tailwindcss init --full
```

**Update Tailwind config `tailwind.config.js`**
```js
// ...
content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js'
],
prefix: 'tw-',
// ...
```

**Create custom styles `app/assets/stylesheets/styles.css`**
```css
/* app/assets/stylesheets/styles.css */

/* Custom Styles */

/* this line is used for the case if prioritizes Bootstrap later */
/* @import "bootstrap/dist/css/bootstrap.css"; */

.my-styles {
  font-weight: 600;
  color: green;
}

```

**Update file `application.tailwind.css`**
```css
/* @tailwind base;
@tailwind components;
@tailwind utilities; */

/* this line is used for the case if prioritizes Bootstrap first */
@import "bootstrap/dist/css/bootstrap.css";

@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* this line is used for the case if prioritizes Bootstrap later */
/* @import "bootstrap/dist/css/bootstrap.css"; */
@import "./styles";

```

Copy images to `app/assets/images/` base on this project
- app/assets/images/beams.jpeg
- app/assets/images/grid.svg
- app/assets/images/logo.svg

## Generate home, hello_react pages
```
./bin/rails g controller pages home hello_react

```

## Update `route.rb`
```rb
Rails.application.routes.draw do
  root 'pages#home'
  get '/hello_react' => 'pages#hello_react'
end
```

## Setup Bootstrap and jQuery
```
mkdir app/javascript/libs
touch app/javascript/libs/bootstrap.js
touch app/javascript/libs/jquery.js
touch app/javascript/libs/index.js
```

**Create bootstrap config `app/javascript/libs/bootstrap.js`**
```js
// app/javascript/libs/bootstrap.js

// import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.bundle.js"

const bootstrap = require("bootstrap/dist/js/bootstrap.bundle.js")
const popoverElements = document.querySelector('[data-bs-toggle="popover"]')
if (popoverElements) new bootstrap.Popover(popoverElements, { trigger: 'hover' })

```

**Create jQuery config `app/javascript/libs/jquery.js`**
```js
// app/javascript/libs/jquery.js
import jquery from 'jquery';
window.jQuery = jquery;
window.$ = jquery;

```

Create file index.js to include bootstrap and jquery `app/javascript/libs/index.js`
```js
// app/javascript/libs/index.js
import "./jquery";
import "./bootstrap";
```

Update `app/javascript/application.js`
```js
// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import "./libs"

```

## Create Tailwind components
app/views/pages/_content_home_tw.html.erb
```html
<!-- app/views/pages/_content_home_tw.html.erb -->
<div class="tw-min-h-screen tw-bg-gray-50 tw-py-6 tw-flex tw-flex-col tw-justify-center tw-relative tw-overflow-hidden sm:tw-py-12">
  <img src="<%= image_url('beams.jpg') %>" alt="" class="tw-absolute tw-top-1/2 tw-left-1/2 tw--translate-x-1/2 tw--translate-y-1/2 tw-max-w-none" width="1308" />
  <div class="tw-absolute tw-inset-0 tw-bg-[url(<%= image_url('grid.svg') %>)] tw-bg-center [mask-image:tw-linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
  <div class="tw-relative tw-px-6 tw-pt-10 tw-pb-8 tw-bg-white tw-shadow-xl tw-ring-1 tw-ring-gray-900/5 sm:tw-max-w-lg sm:tw-mx-auto sm:tw-rounded-lg sm:tw-px-10">
    <div class="tw-max-w-md tw-mx-auto">
      <img src="<%= image_url('logo.svg') %>" class="tw-h-6" />
      <div class="tw-divide-y tw-divide-gray-300/50">
        <div class="tw-py-8 tw-text-base tw-leading-7 tw-space-y-6 tw-text-gray-600">
          <p>An advanced online playground for Tailwind CSS, including support for things like:</p>
          <ul class="tw-space-y-4">
            <li class="tw-flex tw-items-center">
              <svg class="tw-w-6 tw-h-6 tw-flex-none tw-fill-sky-100 tw-stroke-sky-500 tw-stroke-2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <p class="tw-ml-4">
                Customizing your
                <code class="tw-text-sm tw-font-bold tw-text-gray-900">tailwind.config.js</code> file
              </p>
            </li>
            <li class="tw-flex tw-items-center">
              <svg class="tw-w-6 tw-h-6 tw-flex-none tw-fill-sky-100 tw-stroke-sky-500 tw-stroke-2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <p class="tw-ml-4">
                Extracting classes with
                <code class="tw-text-sm tw-font-bold tw-text-gray-900">@apply</code>
              </p>
            </li>
            <li class="tw-flex tw-items-center">
              <svg class="tw-w-6 tw-h-6 tw-flex-none tw-fill-sky-100 tw-stroke-sky-500 tw-stroke-2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <p class="tw-ml-4">Code completion with instant preview</p>
            </li>
          </ul>
          <p>Perfect for learning how the framework works, prototyping a new idea, or creating a demo to share online.</p>
        </div>
        <div class="tw-pt-8 tw-text-base tw-leading-7 tw-font-semibold">
          <p class="tw-text-gray-900">Want to dig deeper into Tailwind?</p>
          <p>
            <a href="https://tailwindcss.com/docs" class="tw-text-sky-500 hover:tw-text-sky-600">Read the docs &rarr;</a>
          </p>
        </div>
        <div class="tw-pt-8">
          <p class="my-styles">My Styles</p>
        </div>
      </div>
    </div>
  </div>
</div>

```

app/views/pages/_content_tailwind_1.html.erb
```html
<div class="tw-mt-4 tw-mb-3">
  <div style="background-position:10px 10px" class="tw-not-prose tw-relative tw-bg-grid-gray-100 tw-bg-gray-50 tw-rounded-xl tw-overflow-hidden">
    <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-gray-50 tw-opacity-60"></div>
    <div class="tw-relative tw-rounded-xl tw-overflow-auto tw-p-8">
      <div class="tw-flex tw-flex-col-- tw-sm:flex-row tw-justify-center tw-gap-8 tw-sm:gap-16">
        <div class="tw-flex tw-flex-col tw-items-center tw-tw-shrink-0">
          <p class="tw-font-medium tw-text-sm tw-text-gray-500 tw-font-mono tw-text-center tw-mb-3">shadow-cyan-500/50</p>
          <button class="tw-py-2 tw-px-3 tw-bg-cyan-500 tw-text-white tw-text-sm tw-font-semibold tw-rounded-md tw-shadow-lg tw-shadow-cyan-500/50 tw-focus:outline-none">Subscribe</button>
        </div>
        <div class="tw-flex tw-flex-col tw-items-center tw-tw-shrink-0">
          <p class="tw-font-medium tw-text-sm tw-text-gray-500 tw-font-mono tw-text-center tw-mb-3">shadow-blue-500/50</p>
          <button class="tw-py-2 tw-px-3 tw-bg-blue-500 tw-text-white tw-text-sm tw-font-semibold tw-rounded-md tw-shadow-lg tw-shadow-blue-500/50 tw-focus:outline-none">Subscribe</button>
        </div>
        <div class="tw-flex tw-flex-col tw-items-center tw-tw-shrink-0">
          <p class="tw-font-medium tw-text-sm tw-text-gray-500 tw-font-mono tw-text-center tw-mb-3">shadow-indigo-500/50</p>
          <button class="tw-py-2 tw-px-3 tw-bg-indigo-500 tw-text-white tw-text-sm tw-font-semibold tw-rounded-md tw-shadow-lg tw-shadow-indigo-500/50 tw-focus:outline-none">Subscribe</button>
        </div>
      </div>
    </div>
    <div class="tw-absolute inset-0 tw-pointer-events-none tw-border tw-border-black/5 tw-rounded-xl"></div>
  </div>
</div>

```

app/views/pages/_content_tailwind_2.html.erb
```html
<div class="tw-relative tw-rounded-xl tw-overflow-auto">
  <!-- Snap Point -->
  <div class="tw-flex ml-[50%] tw-items-end tw-justify-start tw-pt-10 tw-mb-6">
    <div class="tw-ml-2 tw-rounded tw-font-mono text-[0.625rem] tw-leading-6 tw-px-1.5 tw-ring-1 tw-ring-inset tw-bg-indigo-50 tw-text-indigo-600 tw-ring-indigo-600">snap point</div>
    <div class="tw-absolute tw-top-0 tw-bottom-0 tw-left-1/2 tw-border-l tw-border-indigo-500"></div>
  </div>
  <!-- Contents -->
  <div class="tw-relative tw-w-full tw-flex tw-gap-6 tw-snap-x tw-overflow-x-auto tw-pb-14">
    <div class="tw-snap-center tw-shrink-0">
      <div class="tw-shrink-0 tw-w-4 sm:tw-w-48"></div>
    </div>
    <div class="tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
      <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
    </div>
    <div class="tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
      <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
    </div>
    <div class="tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
      <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1622890806166-111d7f6c7c97?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
    </div>
    <div class="tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
      <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
    </div>
    <div class="tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
      <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1575424909138-46b05e5919ec?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
    </div>
    <div class="tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
      <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1559333086-b0a56225a93c?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
    </div>
    <div class="tw-snap-center tw-shrink-0">
      <div class="tw-shrink-0 tw-w-4 sm:tw-w-48"></div>
    </div>
  </div>
</div>

```

app/views/pages/_content_tailwind_3.html.erb
```html
<div class="tw-mt-4 tw--mb-3">
  <div class="not-prose tw-mb-4 tw-flex tw-space-x-2"><svg class="tw-flex-none tw-w-5 tw-h-5 tw-text-gray-400" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m9.813 9.25.346-5.138a1.276 1.276 0 0 0-2.54-.235L6.75 11.25 5.147 9.327a1.605 1.605 0 0 0-2.388-.085.018.018 0 0 0-.004.019l1.98 4.87a5 5 0 0 0 4.631 3.119h3.885a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3H9.813ZM3 5s.35-.47 1.25-.828m9.516-.422c2.078.593 3.484 1.5 3.484 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    <p class="tw-text-gray-700 tw-text-sm tw-font-medium">Scroll in the tw-grid of images to see the expected behaviour</p>
  </div>
  <div class="not-prose tw-relative bg-grid-gray-100 tw-bg-gray-50 tw-rounded-xl tw-overflow-hidden" style="background-position: 10px 10px;">
    <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-gray-50 tw-opacity-60"></div>
    <div class="tw-relative tw-rounded-xl tw-overflow-auto">
      <!-- Snap Point -->
      <div class="tw-flex ml-[50%] tw-items-end tw-justify-start tw-pt-10 tw-mb-6">
        <div class="tw-ml-2 tw-rounded tw-font-mono text-[0.625rem] tw-leading-6 tw-px-1.5 tw-ring-1 tw-ring-inset tw-bg-indigo-50 tw-text-indigo-600 tw-ring-indigo-600">snap point</div>
        <div class="tw-absolute tw-top-0 tw-bottom-0 tw-left-1/2 tw-border-l tw-border-indigo-500"></div>
      </div>
      <!-- Contents -->
      <div class="tw-relative tw-w-full tw-flex tw-gap-6 tw-snap-x tw-snap-mandatory tw-overflow-x-auto tw-pb-14">
        <div class="tw-snap-center tw-shrink-0">
          <div class="tw-shrink-0 tw-w-4 sm:tw-w-48"></div>
        </div>
        <div class="tw-snap-always tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
          <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-object-cover tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
        </div>
        <div class="tw-snap-always tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
          <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-object-cover tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
        </div>
        <div class="tw-snap-always tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
          <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-object-cover tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1622890806166-111d7f6c7c97?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
        </div>
        <div class="tw-snap-always tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
          <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-object-cover tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
        </div>
        <div class="tw-snap-always tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
          <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-object-cover tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1575424909138-46b05e5919ec?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
        </div>
        <div class="tw-snap-always tw-snap-center tw-shrink-0 first:tw-pl-8 last:tw-pr-8">
          <img class="tw-shrink-0 tw-w-80 tw-h-40 tw-object-cover tw-rounded-lg tw-shadow-xl tw-bg-white" src="https://images.unsplash.com/photo-1559333086-b0a56225a93c?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80">
        </div>
        <div class="tw-snap-center tw-shrink-0">
          <div class="tw-shrink-0 tw-w-4 sm:tw-w-48"></div>
        </div>
      </div>
    </div>
    <div class="tw-absolute tw-inset-0 tw-pointer-events-none tw-border tw-border-black/5 tw-rounded-xl"></div>
  </div>
</div>

```

## Create Bootstrap components
app/views/pages/_nav_bootstrap.html.erb
```html
<div class="container-fluid">
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="/" target="_top">BlogRails7</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="/" target="_top">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/hello_react" target="_top">Hello React</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Dropdown
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled">Disabled</a>
          </li>
        </ul>
        <form class="d-flex">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>
    </div>
  </nav>
</div>

```

## Create React component
app/javascript/react/components/MyClock/styles.css
```css
.Clock {
  padding: 5px;
  margin-top: 15px;
  margin-left: auto;
  margin-right: auto;
}
```

app/javascript/react/components/MyClock/MyClock.js
```js
import React, { Component } from 'react'
import PropTypes from 'prop-types';

export class MyClock extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-lg-12 tw-flex tw-justify-center">
            <Clock size={400} timeFormat="24hour" hourFormat="standard" />
          </div>
        </div>
      </div>
    );
  }
}

export default MyClock

export class Clock extends Component {
  constructor(props) {
    super(props);

    this.state = { time: new Date() };
    this.radius = this.props.size / 2;
    this.drawingContext = null;
    this.draw24hour = this.props.timeFormat.toLowerCase().trim() === "24hour";
    this.drawRoman = !this.draw24hour && this.props.hourFormat.toLowerCase().trim() === "roman";

  }

  componentDidMount() {
    this.getDrawingContext();
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  getDrawingContext() {
    this.drawingContext = this.refs.clockCanvas.getContext('2d');
    this.drawingContext.translate(this.radius, this.radius);
    this.radius *= 0.9;
  }

  tick() {
    this.setState({ time: new Date() });
    const radius = this.radius;
    let ctx = this.drawingContext;
    this.drawFace(ctx, radius);
    this.drawNumbers(ctx, radius);
    this.drawTicks(ctx, radius);
    this.drawTime(ctx, radius);
  }

  drawFace(ctx, radius) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    const grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    grad.addColorStop(0, "#333");
    grad.addColorStop(0.5, "white");
    grad.addColorStop(1, "#333");
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
  }

  drawNumbers(ctx, radius) {
    const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const fontBig = radius * 0.15 + "px Arial";
    const fontSmall = radius * 0.075 + "px Arial";
    let ang, num;

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (num = 1; num < 13; num++) {
      ang = num * Math.PI / 6;
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.78);
      ctx.rotate(-ang);
      ctx.font = fontBig;
      ctx.fillStyle = "black";
      ctx.fillText(this.drawRoman ? romans[num - 1] : num.toString(), 0, 0);
      ctx.rotate(ang);
      ctx.translate(0, radius * 0.78);
      ctx.rotate(-ang);

      // Draw inner numerals for 24 hour time format
      if (this.draw24hour) {
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.60);
        ctx.rotate(-ang);
        ctx.font = fontSmall;
        ctx.fillStyle = "red";
        ctx.fillText((num + 12).toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.60);
        ctx.rotate(-ang);
      }
    }

    // Write author text
    ctx.font = fontSmall;
    ctx.fillStyle = "#3D3B3D";
    ctx.translate(0, radius * 0.30);
    ctx.fillText("React Clock", 0, 0);
    ctx.translate(0, -radius * 0.30);
  }

  drawTicks(ctx, radius) {
    let numTicks, tickAng, tickX, tickY;

    for (numTicks = 0; numTicks < 60; numTicks++) {

      tickAng = (numTicks * Math.PI / 30);
      tickX = radius * Math.sin(tickAng);
      tickY = -radius * Math.cos(tickAng);

      ctx.beginPath();
      ctx.lineWidth = radius * 0.010;
      ctx.moveTo(tickX, tickY);
      if (numTicks % 5 === 0) {
        ctx.lineTo(tickX * 0.88, tickY * 0.88);
      } else {
        ctx.lineTo(tickX * 0.92, tickY * 0.92);
      }
      ctx.stroke();
    }
  }

  drawTime(ctx, radius) {
    const now = this.state.time;
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();

    // hour
    hour %= 12;
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    this.drawHand(ctx, hour, radius * 0.5, radius * 0.05);
    // minute
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    this.drawHand(ctx, minute, radius * 0.8, radius * 0.05);
    // second
    second = (second * Math.PI / 30);
    this.drawHand(ctx, second, radius * 0.9, radius * 0.02, "red");
  }

  drawHand(ctx, position, length, width, color) {
    color = color || "black";
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.rotate(position);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-position);
  }

  render() {
    return (
      <div className="Clock" style={{ width: String(this.props.size) + 'px' }}>
        <canvas width={this.props.size} height={this.props.size} ref="clockCanvas" />
      </div>
    );
  }
}

Clock.defaultProps = {
  size: 400, // size in pixels => size is length & width
  timeFormat: "24hour", // {standard | 24hour} => if '24hour', hourFormat must be 'standard'
  hourFormat: "standard" // {standard | roman}
};

Clock.propTypes = {
  size: PropTypes.number,
  timeFormat: PropTypes.string,
  hourFormat: PropTypes.string
};

```

app/javascript/react/components/App/styles.css
```css
.my_styles_3 {
  font-family: 600;
  font-size: 2rem;
  color: pink;
  text-align: center;
}
```

app/javascript/react/components/App/index.js
```js
import React from 'react'
import MyClock from '../MyClock/MyClock'
import "./styles.css";

export const App = () => {
  return (
    <div className="container tw-bg-gray-700 tw-rounded-xl tw-py-4">
      <div className={'tw-py-4'}>
        <div className={'my_styles_3'}>Hello React!!!</div>
      </div>
      <MyClock />
    </div>
  )
}

export default App

```

app/javascript/react/hello_react.js
```js
import React from "react";
import { render } from "react-dom";
import App from "./components/App";

document.addEventListener("DOMContentLoaded", () => {
  render(<App />, document.getElementById('react-components'));
});

```


## Render Tailwind and Bootstrap 5 components
Update file `app/views/pages/home.html.erb`
```html
<%= render 'pages/nav_bootstrap' %>
<%= render 'pages/content_home_tw' %>
```

## Render React components
Update file `app/views/pages/hello_react.html.erb`
```html
<%= render 'pages/nav_bootstrap' %>
<%= render 'pages/popover_bs' %>

<div class="container mt-4 tw-rounded-xl tw-bg-gray-700">
  <h2 class="tw-text-3xl tw-text-white tw-py-4">React Components</h2>
</div>
<div id="react-components" class="tw-py-2"></div>
<%= javascript_include_tag "react/hello_react" %>

<div class="container tw-mt-8">
  <h2>Tailwind</h2>
  <%= render 'pages/content_tailwind_1' %>
  <%= render 'pages/content_tailwind_2' %>
  <%= render 'pages/content_tailwind_3' %>
  <div class="tw-py-8"></div>
</div>

```

app/javascript/styles/index.css
```css
.my-styles-2 {
  font-weight: 600;
  color: red;
}
```

## If you want to use SCSS/SASS
Add package `esbuild-plugin-sass`
```bash
yarn add esbuild-plugin-sass
```

Update `esbuild.config.js`
```js
// ....
const sassPlugin = require('esbuild-plugin-sass')

// ...
plugins: [
    styleLoaderPlugin,
    sassPlugin()
],

// ...

```

And then you can create file like `styles.scss` and import it
Example:

```scss
// styles2.scss
.my_styles_4 {
  font-family: 600;
  font-size: 2rem;
  color: red;
  text-align: center;
  cursor: pointer;
  &:hover {
    color: green;
  }
}
```

```js
import React from 'react'
import MyClock from '../MyClock/MyClock'
import "./styles2.scss";

export const App = () => {
  return (
    <div className="container tw-bg-gray-700 tw-rounded-xl tw-py-4">
      <div className={'tw-py-4'}>
        <div className={'my_styles_3'}>Hello React!!! 000</div>
        <div className={'my_styles_4'}>Styles SCSS</div>
      </div>
      <MyClock />
    </div>
  )
}
```

## Create Article
```bash
./bin/rails g scaffold Article title:string body:text
./bin/rails db:create db:migrate
```

*Use Tailwind and Bootstrap to update styles for article pages*

## Run app
```bash
./bin/dev
```

Then go to http://localhost:3000/

OR clone source and run to see the result:
```bash
cd
git clone https://github.com/ntamvl/Rails7WithReactTailwindCSSBootstrapExample.git
cd Rails7WithReactTailwindCSSBootstrapExample
bundle install
yarn install
./bin/dev
```

Screenshots:
![Rails 7 with React, TailwindCSS and Bootstrap 5 Example](https://raw.githubusercontent.com/ntamvl/Rails7WithReactTailwindCSSBootstrapExample/main/screenshot_1.png)
![Rails 7 with React, TailwindCSS and Bootstrap 5 Example](https://raw.githubusercontent.com/ntamvl/Rails7WithReactTailwindCSSBootstrapExample/main/screenshot_2.png)

Enjoy ^_^ :))

---
References:
- https://rubyonrails.org/2021/12/15/Rails-7-fulfilling-a-vision
- https://getbootstrap.com/docs/5.1/getting-started/introduction/
- https://tailwindcss.com/docs/installation
