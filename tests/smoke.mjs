import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');
const js = readFileSync(join(root, 'script.js'), 'utf8');
const localization = readFileSync(join(root, 'i18n.js'), 'utf8');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs');
for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
  assert(ids.includes(anchor), `Missing anchor target: #${anchor}`);
}
for (const [, path] of html.matchAll(/(?:href|src)="([^"#][^"]+)"/g)) {
  if (!/^https?:/.test(path)) assert(existsSync(join(root, decodeURIComponent(path.split(/[?#]/)[0]))), `Missing asset: ${path}`);
}
for (const [, path] of css.matchAll(/url\(["']?([^"')]+\.woff)["']?\)/g)) {
  assert(existsSync(join(root, path)), `Missing font: ${path}`);
}
assert(html.includes('lang="fr"'));
assert(html.includes('name="viewport"'));
assert(html.includes('id="project-grid"'));
assert(html.includes('id="language-select"'));
assert(/src="i18n\.js\?v=[a-f0-9]{12}"/.test(html));
assert(html.includes('id="design-dialog"'));
assert(html.includes('id="main-menu"'));
assert(html.includes('id="menu-toggle"'));
assert(html.includes('id="preview-zoom"'));
assert(!html.includes('gzephrine@gmail.com'), 'Personal email unexpectedly exposed');
const projects = [...html.matchAll(/\bdata-project="([^"]+)"/g)].map(match => match[1]);
assert(projects.length > 0 && new Set(projects).size === projects.length, 'Unique project identities are required');
assert(html.includes('data-slideshow'), 'Local project presentations missing');
assert(html.includes('data-preview'), 'Local artwork links missing');
assert(html.includes('id="sites"'), 'Dedicated websites section missing');
assert(!html.includes('Just1Pulse'), 'Excluded project unexpectedly shown');
for (const [, path] of html.matchAll(/src="(assets\/[^"]+\.webp)"/g)) {
  assert(existsSync(join(root, path)), `Missing design thumbnail: ${path}`);
}
assert(!/Prayer Machine|Génération|Quoakoo|Gloria OS/i.test(html + '\n' + localization), 'Excluded project found');
assert(js.trim().length > 0, 'Interaction script missing');
assert(css.includes('prefers-reduced-motion'), 'Reduced-motion support missing');
console.log('Portfolio smoke checks passed.');
