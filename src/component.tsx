import { render } from 'preact-render-to-string';
// Node.js does not support named imports for JSON
import css from './component.css.json' with { type: 'json' };

console.log(render(
  <div id={css.warning}></div>
));
