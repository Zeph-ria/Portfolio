import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { readHtml, textContent, normalizeForExclusions } from './helpers/html.mjs';
import { imageDimensions } from './helpers/image.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');
const localization = readFileSync(join(root, 'i18n.js'), 'utf8');
const { elements, errors } = readHtml(html);
const byTag = tag => elements.filter(node => node.tag === tag);
const withAttr = key => elements.filter(node => Object.hasOwn(node.attrs, key));
const ids = new Map(withAttr('id').map(node => [node.attrs.id, node]));
const localPath = reference => decodeURIComponent(reference.split(/[?#]/)[0]);
const hasClass = (node, value) => node.attrs.class?.split(/\s+/).includes(value);
const descendants = node => node.children.flatMap(child => [child, ...descendants(child)]);
const ancestor = (node, predicate) => {
  let current = node.parent;
  while (current && !predicate(current)) current = current.parent;
  return current;
};
const localStylePaths = byTag('link').filter(node => node.attrs.rel === 'stylesheet' && !/^https?:/i.test(node.attrs.href || '')).map(node => localPath(node.attrs.href));
const stylesheets = localStylePaths.filter(path => existsSync(resolve(root, path))).map(path => ({ path, css: readFileSync(resolve(root, path), 'utf8') }));

function assertLocalFile(reference, label = 'Resource') {
  const filename = resolve(root, localPath(reference));
  assert(filename.startsWith(root + '/'), `${label} escapes repository: ${reference}`);
  assert(existsSync(filename), `Missing ${label.toLowerCase()}: ${reference}`);
  assert(statSync(filename).isFile() && statSync(filename).size > 0, `Empty or invalid ${label.toLowerCase()}: ${reference}`);
  return filename;
}

function assertSlideLabels(slide) {
  const title = descendants(slide).find(node => Object.hasOwn(node.attrs, 'data-slide-title'));
  assert(title && textContent(title).trim(), 'Each artwork needs a short localized title');
  const caption = descendants(slide).find(node => Object.hasOwn(node.attrs, 'data-slide-caption'));
  for (const language of ['fr', 'en', 'es']) {
    assert(title.attrs[`data-${language}`]?.trim(), `Missing ${language} artwork title`);
    if (caption) assert(caption.attrs[`data-${language}`]?.trim(), `Missing ${language} translation for the optional caption`);
  }
}

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
  const menu = ids.get('main-menu');
  assert(menu?.tag === 'nav', 'The primary menu must be a native navigation landmark');
  const destinations = descendants(menu).filter(node => node.tag === 'a').map(node => node.attrs.href);
  assert.deepEqual(destinations, ['#realisations', '#galerie', '#apropos', '#contact'], 'The navigation must reach Work, Gallery, About and Contact');
  const menuToggle = ids.get('menu-toggle');
  assert.equal(menuToggle?.tag, 'button');
  assert.equal(menuToggle?.attrs['aria-controls'], 'main-menu');
  assert.equal(menuToggle?.attrs['aria-expanded'], 'false', 'The mobile disclosure starts closed');
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
    if (node.attrs['data-full-src']) references.push(node.attrs['data-full-src']);
    if (node.tag === 'link' && node.attrs.href) references.push(node.attrs.href);
    if (Object.hasOwn(node.attrs, 'data-preview')) references.push(node.attrs.href);
  }
  for (const stylesheet of stylesheets) {
    for (const [, reference] of stylesheet.css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      if (!/^(?:https?:|data:|#)/i.test(reference)) references.push(join(dirname(stylesheet.path), reference));
    }
  }
  for (const reference of references) {
    if (/^(https?:|data:|#)/i.test(reference)) continue;
    assertLocalFile(reference);
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

test('Published scripts and styles use versions matching their current contents', () => {
  const resources = [
    ...byTag('script').map(node => node.attrs.src),
    ...byTag('link').filter(node => node.attrs.rel === 'stylesheet').map(node => node.attrs.href)
  ].filter(reference => reference && !/^https?:/i.test(reference));
  assert.equal(resources.length, 5, 'All local runtime resources must be checked');
  for (const reference of resources) {
    const filename = assertLocalFile(reference, 'Runtime resource');
    const expected = createHash('sha256').update(readFileSync(filename)).digest('hex').slice(0, 12);
    const actual = new URL(reference, 'https://portfolio.example/').searchParams.get('v');
    assert.equal(actual, expected, `Stale browser-cache version for ${reference}; regenerate the portfolio before publishing`);
  }
});

test('Portfolio exclusions and private contact guardrails are enforced', () => {
  // Translated strings are part of the public page too. Removing a card must not
  // leave its old copy available when the visitor changes language.
  const publicCopy = html + '\n' + localization;
  const corpus = normalizeForExclusions(publicCopy);
  for (const forbidden of ['generation', 'prayer machine', 'just1pulse', 'just one pulse', 'quoakoo', 'gloria os']) {
    assert(!corpus.includes(forbidden), `Excluded project remains: ${forbidden}`);
  }
  assert(!/\b(?:exercices?|exercises?|ejercicios?)\b/.test(corpus), 'Professional presentation must not be labelled as exercises');
  assert(!publicCopy.toLowerCase().includes('gzephrine@gmail.com'), 'Unapproved personal email exposed');
  for (const node of elements) {
    for (const reference of [node.attrs.href, node.attrs['data-source']]) {
      assert(!/https?:\/\/(?:www\.)?canva\.com(?:[/?#]|$)/i.test(reference ?? ''), 'The public portfolio must not link to complete Canva documents');
    }
  }
});

test('Thumbnails and full-size originals match their files and asset manifest', () => {
  const manifest = JSON.parse(readFileSync(join(root, 'assets-manifest.json'), 'utf8'));
  const records = new Map();
  for (const image of manifest.images) {
    assert(!records.has(image.path), `Duplicate asset manifest path: ${image.path}`);
    assert(Number(image.bytes) > 0 && /^[a-f0-9]{64}$/.test(image.sha256 || ''), `Missing image integrity metadata: ${image.path}`);
    records.set(image.path, image);
    for (const variant of image.variants || []) {
      assert(!records.has(variant.path), `Duplicate asset manifest path: ${variant.path}`);
      assert(Number(variant.bytes) > 0 && /^[a-f0-9]{64}$/.test(variant.sha256 || ''), `Missing variant integrity metadata: ${variant.path}`);
      records.set(variant.path, variant);
    }
  }
  for (const node of byTag('img').filter(node => /\.(?:webp|png|jpe?g)$/i.test(node.attrs.src || ''))) {
    const actual = imageDimensions(readFileSync(assertLocalFile(node.attrs.src, 'Image')));
    assert.deepEqual({ width: Number(node.attrs.width), height: Number(node.attrs.height) }, actual, `Incorrect intrinsic dimensions: ${node.attrs.src}`);
    assert(records.has(node.attrs.src), `Displayed image is absent from asset manifest: ${node.attrs.src}`);
    const fullPath = node.attrs['data-full-src'];
    if (fullPath) {
      const original = manifest.images.find(image => image.path === fullPath);
      assert(original, `Full-size original is absent from asset manifest: ${fullPath}`);
      assert(original.path === node.attrs.src || original.variants?.some(variant => variant.path === node.attrs.src), `Thumbnail belongs to a different original: ${node.attrs.src}`);
      const fullSize = imageDimensions(readFileSync(assertLocalFile(fullPath, 'Original')));
      assert.deepEqual({ width: Number(node.attrs['data-full-width']), height: Number(node.attrs['data-full-height']) }, fullSize, `Incorrect full-size dimensions: ${fullPath}`);
      if (node.attrs['data-asset-quality']) assert.equal(node.attrs['data-asset-quality'], original.quality, `Incorrect original quality: ${fullPath}`);
    }
  }
  for (const image of records.values()) {
    const buffer = readFileSync(assertLocalFile(image.path, 'Manifest image'));
    if (/\.(?:webp|png|jpe?g)$/i.test(image.path)) {
      const actual = imageDimensions(buffer);
      assert.deepEqual({ width: image.width, height: image.height }, actual, `Stale asset manifest dimensions: ${image.path}`);
    }
    if (image.bytes !== undefined) assert.equal(image.bytes, buffer.length, `Stale asset byte count: ${image.path}`);
    if (image.sha256 !== undefined) assert.equal(image.sha256, createHash('sha256').update(buffer).digest('hex'), `Asset hash differs from manifest: ${image.path}`);
  }
});

test('Project filters represent actual work without empty or unreachable categories', () => {
  const controls = withAttr('data-filter');
  const cards = byTag('article').filter(node => hasClass(node, 'project-card'));
  assert(cards.length > 0, 'Selected projects are required');
  const controlValues = new Set(controls.map(node => node.attrs['data-filter']));
  const categories = new Set(cards.flatMap(node => (node.attrs['data-category'] || '').trim().split(/\s+/).filter(Boolean)));
  assert.deepEqual(controlValues, new Set(['all', 'branding', 'communication', 'research']), 'The filters must match the visual selection');
  assert.equal(controlValues.size, controls.length, 'Filter choices must be unique');
  assert.equal(controls.filter(node => node.attrs['aria-pressed'] === 'true').length, 1, 'Exactly one selected filter on load');
  for (const category of categories) assert(controlValues.has(category), `Unreachable category: ${category}`);
  for (const value of controlValues) assert(value === 'all' || categories.has(value), `Empty filter: ${value}`);
  const names = cards.map(card => card.attrs['data-project']);
  assert(names.every(Boolean), 'Every project needs a stable identity');
  assert.equal(new Set(names).size, names.length, 'Project identities must be unique');
  assert(names.includes('recherche-graphique'), 'Graphic exploration must have its own project');
  assert(!names.includes('ardhi') && !names.includes('luminary'), 'Documentary case studies must not return as project cards');
  for (const className of ['featured-project', 'project-insight', 'case-study']) {
    assert(!elements.some(node => hasClass(node, className)), `The simplified presentation must not contain .${className}`);
  }
  for (const card of cards) {
    assert(descendants(card).some(node => node.tag === 'h3' && textContent(node)), `Project ${card.attrs['data-project']} lacks its title`);
    assert(descendants(card).some(node => Object.hasOwn(node.attrs, 'data-slideshow')), `Project ${card.attrs['data-project']} lacks local artwork`);
  }
});

test('Project slides have local originals, accessible labels and viewer controls', () => {
  const carousels = withAttr('data-slideshow');
  assert(carousels.length > 0, 'Selected work must be presented within the portfolio');
  let hasMultiplePages = false;
  for (const carousel of carousels) {
    assert(!ancestor(carousel, node => Object.hasOwn(node.attrs, 'data-slideshow')), 'Project sequences must not be nested');
    const track = descendants(carousel).find(node => hasClass(node, 'slide-track'));
    assert.equal(track?.tag, 'ol', 'A project sequence is an ordered set of pages');
    const slides = descendants(track).filter(node => Object.hasOwn(node.attrs, 'data-slide'));
    assert(slides.length > 0, 'A project sequence cannot be empty');
    hasMultiplePages ||= slides.length > 1;
    for (const slide of slides) {
      assert.equal(ancestor(slide, node => Object.hasOwn(node.attrs, 'data-slideshow')), carousel);
      const previews = descendants(slide).filter(node => Object.hasOwn(node.attrs, 'data-preview'));
      assert.equal(previews.length, 1, 'Each selected page has one local preview');
      const preview = previews[0];
      assert.equal(preview.tag, 'a');
      assert(/^assets\/.+\.(?:webp|png|jpe?g)$/i.test(preview.attrs.href || ''), 'The primary preview must open a local original, not Canva');
      assert(!preview.attrs.target || preview.attrs.target === '_self', 'The primary preview should keep visitors in the portfolio');
      assertLocalFile(preview.attrs.href, 'Preview');
      const image = descendants(preview).find(node => node.tag === 'img');
      assert(image, 'Every selected page must have a visible image');
      assert.equal(image.attrs['data-full-src'] || image.attrs.src, preview.attrs.href, 'The preview and original download must refer to the same artwork');
      for (const language of ['fr', 'en', 'es']) {
        assert(image.attrs[`data-alt-${language}`]?.trim(), `Missing ${language} alternative text on ${image.attrs.src}`);
      }
      assertSlideLabels(slide);
      assert(!preview.attrs['data-source'], 'Artwork must not expose the complete source document');
    }
    if (slides.length > 1) {
      for (const attribute of ['data-slide-prev', 'data-slide-next']) {
        assert(descendants(carousel).some(node => node.tag === 'button' && Object.hasOwn(node.attrs, attribute)), 'Multipage work needs accessible navigation controls');
      }
      assert(descendants(carousel).some(node => Object.hasOwn(node.attrs, 'data-slide-count')), 'A project sequence needs a page count');
    }
  }
  assert(hasMultiplePages, 'The portfolio must show more than document covers');
  assert.equal(ids.get('design-dialog')?.tag, 'dialog', 'Local artwork needs an accessible native viewer');
  for (const id of ['preview-close', 'preview-prev', 'preview-next', 'preview-zoom']) assert.equal(ids.get(id)?.tag, 'button', `Viewer control ${id} is missing`);
});

test('The gallery keeps a generous set of local artwork links accessible in document order', () => {
  const galleries = withAttr('data-gallery');
  assert.equal(galleries.length, 1, 'A dedicated visual gallery is required');
  const gallery = galleries[0];
  assert.equal(ancestor(gallery, node => node.attrs.id === 'galerie'), ids.get('galerie'));
  assert(!Object.hasOwn(gallery.attrs, 'data-slideshow'), 'The gallery must not become a single-slide carousel');
  const grid = descendants(gallery).find(node => hasClass(node, 'gallery-grid'));
  assert.equal(grid?.tag, 'ul', 'Gallery artwork must be a list');
  const tiles = grid.children.filter(node => Object.hasOwn(node.attrs, 'data-slide'));
  assert(tiles.length >= 50, 'The visual gallery must contain at least 50 selected images');
  for (const tile of tiles) {
    const preview = descendants(tile).filter(node => Object.hasOwn(node.attrs, 'data-preview'));
    assert.equal(preview.length, 1, 'Each gallery tile needs one original artwork link');
    const link = preview[0];
    assert.equal(link.tag, 'a');
    assert.match(link.attrs.href || '', /^assets\/.+\.(?:webp|png|jpe?g)$/i);
    assertLocalFile(link.attrs.href, 'Gallery original');
    assert(!link.attrs['data-source'], 'The gallery must not link to a complete source document');
    const image = descendants(link).find(node => node.tag === 'img');
    assert(image, 'Each gallery tile needs an image');
    assert.match(image.attrs.src || '', /^assets\//);
    assert.equal(image.attrs['data-full-src'] || image.attrs.src, link.attrs.href);
    for (const language of ['fr', 'en', 'es']) assert(image.attrs[`data-alt-${language}`]?.trim(), `Missing ${language} gallery alt text`);
    assertSlideLabels(tile);
    for (let node = link; node; node = node.parent) {
      assert(!Object.hasOwn(node.attrs, 'hidden') && !Object.hasOwn(node.attrs, 'inert') && node.attrs['aria-hidden'] !== 'true', 'Gallery links must remain accessible before enhancement');
    }
    assert.notEqual(link.attrs.tabindex, '-1', 'Each gallery original must be keyboard reachable');
  }
});

test('Approved Wremena files and the original palette are retained', () => {
  const fonts = {
    'assets/Wremena-Regular.woff': '7e06b3641d48bdf6a816e3539ae685ed9f0323da8c670a1d4d45e7ca86f487ed',
    'assets/Wremena-Bold.woff': 'ae7996a3a935f2958241cd9765c025dac3f0492ecb0974c3544b2d7eabac797f'
  };
  for (const [path, expected] of Object.entries(fonts)) {
    assert.equal(createHash('sha256').update(readFileSync(assertLocalFile(path, 'Font'))).digest('hex'), expected, `Approved font file changed: ${path}`);
  }
  const expectedTokens = { ink: '#0e0e0e', paper: '#fff', wine: '#652936' };
  for (const [name, expected] of Object.entries(expectedTokens)) {
    const declarations = [...stylesheets.flatMap(sheet => [...sheet.css.matchAll(new RegExp(`--${name}\\s*:\\s*([^;}]+)`, 'g'))])];
    assert(declarations.length > 0, `Approved palette token --${name} is missing`);
    assert(declarations.every(match => match[1].trim().toLowerCase() === expected), `Approved palette token --${name} changed`);
  }
  // Exact visual size, layout and computed fonts remain browser acceptance work.
});

test('The four calendar formats and requested website section remain present', () => {
  const sources = new Set(byTag('img').map(node => node.attrs['data-full-src'] || node.attrs.src));
  for (const format of ['mural', 'table', 'triptyque', 'sous-main']) {
    assert(sources.has(`assets/carrigres-calendrier-${format}.webp`), `Missing calendar format ${format}`);
  }
  assert(ids.has('sites'), 'Dedicated website section removed');
  assert(byTag('a').some(node => node.attrs.href === 'https://breathewithoutfear.org/'), 'The confirmed website domain must be retained');
  assert(css.includes('prefers-reduced-motion'), 'Reduced-motion preference must be respected');
  assert(css.includes(':focus-visible'), 'Visible keyboard focus must be styled');
});
