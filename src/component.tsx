import { render } from 'preact-render-to-string';
import css from './component.css.json' with { type: 'json' };

console.log(render(
  <div id={css.warning}></div>
));
