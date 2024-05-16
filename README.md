# server-side-rendered-css

My use case:

* Use CSS from TypeScript for server-side rendering (to do static site generation).
* Thus, this is related to CSS modules but it must work with TypeScript and Node.js (in addition to during bundling).
* CSS names (of IDs and classes) should be checked statically.

I’m still in the process of thinking this fully through. Thus, it’s possible I made mistakes somewhere.

## Example code

Example – files:

```
component.tsx
component.css.json
component.css
```

`component.ts`:

```ts
import { render } from 'preact-render-to-string';
// Node.js does not support named imports for JSON
import css from './component.css.json' with { type: 'json' };

console.log(render(
  <div id={css.warning}></div>
));
```

`component.css.json`:

```json
{
  // "unmangled name of ID": "name in CSS bundle"
  "warning": "x1bz9l0f"
}
```

`component.css`:

```css
#warning { /* CSS bundle: #x1bz9l0f */
  background-color: red;
}
```

## What a bundler would have to do

A bundler would have to treat importing `component.css.json` as:

* A JSON import, so that we have access to CSS IDs and classes at runtime (in the browser).
* A signal to associate `component.css` with `component.ts`. It has to bundle all such CSS fragments into a single CSS file.
* Additionally, we need a way to associate non-CSS artifacts such as SVG files and fonts with modules – in a way that Node.js doesn’t complain about.
  * One possibility: `new URL('./icon.svg', import.meta.url)`
* The bundler should work more like a library than a framework (we call it) because static site generation requires a lot of flexibility. Candidates: esbuild, Rollup, Rolldown, etc.

❌ If you know of a bundler that can do this, please let me know by filing an issue.

### esbuild

* One would have to write a plugin which forwards the single import `component.css.json` to two loaders: `json` and `css`. As far as I can tell, that is currently [not possible](https://github.com/evanw/esbuild/issues/1233).
* `new URL(...)` for artifacts is not currently supported: https://github.com/evanw/esbuild/issues/795

### Rollup

* `new URL(...)` for artifacts: https://www.npmjs.com/package/@web/rollup-plugin-import-meta-assets
* Plugin for importing `component.css.json`: Not sure. I’ll have to investigate further.

## How would `component.css.json` be generated?

* Initially manually.
* Soon after: automatically, somehow. There are several libraries out there that can be used.

## Benefits of this approach

* Node.js is fine with the JSON imports – in contrast to importing CSS, which doesn’t work for this use case.
* TypeScript warns us during editing if we get CSS names wrong.
