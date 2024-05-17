# server-side-rendered-css: CSS + JSON

Context:

* My use case: Use CSS from TypeScript via Preact, for server-side rendering (to do static site generation).
* CSS names (of IDs and classes) should be checked statically.
* In principle, CSS modules would be ideal, but they only work for bundling JavaScript and not with both TypeScript and Node.js. As we’ll see in a second, taking a detour via JSON fixes that problem.

I’m still in the process of thinking this fully through. Thus, it’s possible I made mistakes somewhere.

## Example

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

### What a bundler would have to do

A bundler would have to treat importing `component.css.json` as:

* A JSON import, so that we have access to CSS IDs and classes at runtime (in the browser).
* A signal to associate `component.css` with `component.ts`. It has to bundle all such CSS fragments into a single CSS file.

Additional considerations:

* The bundler should work more like a library than a framework (we call it, it doesn’t call us) because static site generation requires a lot of flexibility. Candidates: esbuild, Rollup, Rolldown, etc.
* There also needs to be a way to associate non-CSS artifacts such as SVG files and fonts with modules – in a way that Node.js doesn’t complain about.
  * One possibility: `new URL('./icon.svg', import.meta.url)`

❌ If you know of a bundler that fulfills all of these requirements (potentially in tandem with a plugin): Please let me know by filing an issue.

### How would `component.css.json` be generated?

* Initially manually.
* Soon after: automatically, somehow. There are several libraries out there that can be used.

## Benefits of this approach

* Node.js is fine with the JSON imports – in contrast to importing CSS, which doesn’t work for this use case.
* TypeScript warns us during editing if we get CSS names wrong.

## Bundlers that may be able to support CSS+JSON – with the right plugins

### esbuild

* One would have to write a plugin which forwards the single import `component.css.json` to two loaders: `json` and `css`. As far as I can tell, that is currently [not possible](https://github.com/evanw/esbuild/issues/1233).
* `new URL(...)` for artifacts is currently not supported: https://github.com/evanw/esbuild/issues/795

### Rollup

* Plugin for importing `component.css.json`: I’m not sure what a plugin would look like. I’ll have to investigate further.
* `new URL(...)` for artifacts: https://www.npmjs.com/package/@web/rollup-plugin-import-meta-assets

## FAQ

### How is CSS+JSON different from CSS modules?

It’s very similar: If Node.js and TypeScript supported CSS modules then that’s what I would use. The extra JSON file helps with both (but is not really necessary during bundling).

TypeScript tooling for CSS modules (which, alas, doesn’t solve the Node.js issues):

* [typescript-plugin-css-modules](https://github.com/mrmckeb/typescript-plugin-css-modules): TypeScript language service plugin (doesn’t help with tsc)
* [typed-css-modules](https://github.com/Quramy/typed-css-modules): creates .d.ts files from CSS Modules .css files.
