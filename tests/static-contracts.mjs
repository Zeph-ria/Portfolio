import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readHtml, textContent, normalizeForExclusions } from './helpers/html.mjs';
import { webpDimensions } from './helpers/webp.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');
const { elements, errors } = readHtml(html);
const byTag = tag => elements.filter(node => node.tag === tag);
const withAttr = key => elements.filter(node => Object.hasOwn(node.attrs, key));
const ids = new Map(withAttr('id').map(node => [node.attrs.id, node]));
const localPath = reference => decodeURIComponent(reference.split(/[?#]/)[0]);

test('HTML nesting, landmarks and ID references are valid', () => {
  assert.deepEqual(errors, []);
  assert.equal(byTag('h1').length, 1, 'Exactly one primary heading is required');
  assert.equal(byTag('main').length, 1, 'Exactly one main landmark is required');
  assert.equal(ids.size, withAttr('id').length, 'IDs must be unique');
  assert.equal(byTag('html')[0]?.attrs.lang, 'fr', 'No-script default must remain French');
  for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for']) {
    for (const node of withAttr(attr)) {
      for (const id of node.attrs[attr].trim().split(/\s+/)) assert(ids.has(id), `${attr} references missing #${id}`);
    }
  }
  for (const node of elements.filter(n => ['a', 'button'].includes(n.tag))) {
    let parent = node.parent;
    while (parent) {
      assert(!['a', 'button'].includes(parent.tag), `Nested interactive <${node.tag}> inside <${parent.tag}>`);
      parent = parent.parent;
    }
  }
});

test('Navigation, buttons and external links have safe, real targets', () => {
  const skip = byTag('a').find(node => node.attrs.class?.split(/\s+/).includes('skip-link'));
  assert(skip?.attrs.href?.startsWith('#'), 'Keyboard skip link is required');
  assert(ids.has(skip.attrs.href.slice(1)));
  for (const node of byTag('button')) {
    assert.equal(node.attrs.type, 'button', `Explicit type=button missing on ${node.attrs.id ?? textContent(node)}`);
    assert(textContent(node) || node.attrs['aria-label'] || node.attrs['aria-labelledby'], 'Button has no accessible name');
  }
  for (const node of byTag('a')) {
    const href = node.attrs.href;
    let inactiveDialog = node.parent;
    while (inactiveDialog && !(inactiveDialog.tag === 'dialog' && !Object.hasOwn(inactiveDialog.attrs, 'open'))) inactiveDialog = inactiveDialog.parent;
    // The initially closed preview has no active source until a real design is
    // selected. Its runtime href is asserted by the browser acceptance test.
    if (!href && inactiveDialog) continue;
    assert(href && href !== '#', `Empty or placeholder link: ${node.attrs.id ?? textContent(node)}`);
    assert(!/^javascript:/i.test(href), 'JavaScript URL is not a legitimate link');
    if (href.startsWith('#')) assert(ids.has(href.slice(1)), `Missing target ${href}`);
    if (/^https?:/i.test(href)) {
      assert.equal(new URL(href).protocol, 'https:', `Insecure external link ${href}`);
      if (node.attrs.target === '_blank') {
        const rel = node.attrs.rel?.split(/\s+/) ?? [];
        assert(rel.includes('noopener') && rel.includes('noreferrer'), `External link missing protection: ${href}`);
      }
    }
  }
});

test('Local scripts, styles, media and fonts exist and are non-empty', () => {
  const references = [];
  for (const node of elements) {
    if (node.attrs.src) references.push(node.attrs.src);
    if (node.tag === 'link' && node.attrs.href) references.push(node.attrs.href);
  }
  for (const [, reference] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) references.push(reference);
  for (const reference of references) {
    if (/^(https?:|data:|#)/i.test(reference)) continue;
    const filename = resolve(root, localPath(reference));
    assert(filename.startsWith(root + '/'), `Resource escapes repository: ${reference}`);
    assert(existsSync(filename), `Missing resource: ${reference}`);
    assert(statSync(filename).size > 0, `Empty resource: ${reference}`);
  }
  for (const node of byTag('img').filter(node => node.attrs.src)) {
    assert(Object.hasOwn(node.attrs, 'alt'), `Image lacks alt: ${node.attrs.src}`);
    assert(node.attrs.alt.trim().length > 0, `Content image has empty alt: ${node.attrs.src}`);
    assert(Number(node.attrs.width) > 0 && Number(node.attrs.height) > 0, `Explicit image dimensions required: ${node.attrs.src}`);
  }
  for (const node of byTag('script').filter(node => node.attrs.src)) {
    assert(Object.hasOwn(node.attrs, 'defer') || node.attrs.type === 'module', `Script should not block parser: ${node.attrs.src}`);
  }
});

test('Portfolio exclusions and private contact guardrails are enforced', () => {
  const corpus = normalizeForExclusions(html);
  for (const forbidden of ['generation', 'prayer machine', 'just1pulse', 'just one pulse']) {
    assert(!corpus.includes(forbidden), `Excluded project remains: ${forbidden}`);
  }
  assert(!html.toLowerCase().includes('gzephrine@gmail.com'), 'Unapproved personal email exposed');
  for (const node of byTag('a')) {
    assert(!/canva\.com\/(?:design\/[^/]+\/edit|d\/.*[?&](?:edit|mode=edit))/i.test(node.attrs.href ?? ''), 'Do not publish a Canva editing URL');
  }
});

test('Declared image dimensions match the actual local WebP files', () => {
  for (const node of byTag('img').filter(node => node.attrs.src?.endsWith('.webp'))) {
    const actual = webpDimensions(readFileSync(resolve(root, node.attrs.src)));
    assert.deepEqual({ width: Number(node.attrs.width), height: Number(node.attrs.height) }, actual, `Incorrect intrinsic dimensions: ${node.attrs.src}`);
  }
  const manifestPath = join(root, 'assets-manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const image of manifest.images.filter(image => image.path.endsWith('.webp'))) {
      const actual = webpDimensions(readFileSync(resolve(root, image.path)));
      assert.deepEqual({ width: image.width, height: image.height }, actual, `Stale asset manifest dimensions: ${image.path}`);
    }
  }
});

test('Every filter corresponds to content and every category is reachable', () => {
  for (const [filterAttribute, cardAttribute] of [['data-filter', 'data-category'], ['data-design-filter', 'data-design-category']]) {
    const controls = withAttr(filterAttribute);
    const cards = withAttr(cardAttribute);
    const controlValues = new Set(controls.map(node => node.attrs[filterAttribute]));
    const categories = new Set(cards.flatMap(node => node.attrs[cardAttribute].split(/\s+/)));
    assert(controlValues.has('all'), `${filterAttribute} needs an all option`);
    assert.equal(controls.filter(node => node.attrs['aria-pressed'] === 'true').length, 1, 'Exactly one selected filter on load');
    for (const category of categories) assert(controlValues.has(category), `Unreachable category: ${category}`);
    for (const value of controlValues) assert(value === 'all' || categories.has(value), `Empty filter: ${value}`);
  }
});

test('The four calendar formats and requested website section remain present', () => {
  const sources = new Set(byTag('img').map(node => node.attrs.src));
  for (const format of ['mural', 'table', 'triptyque', 'sous-main']) {
    assert(sources.has(`assets/carrigres-calendrier-${format}.webp`), `Missing calendar format ${format}`);
  }
  assert(ids.has('sites'), 'Dedicated website section removed');
  assert(byTag('a').some(node => node.attrs.href === 'https://breathewithoutfear.org/'), 'The confirmed website domain must be retained');
  assert(css.includes('prefers-reduced-motion'), 'Reduced-motion preference must be respected');
  assert(css.includes(':focus-visible'), 'Visible keyboard focus must be styled');
});
