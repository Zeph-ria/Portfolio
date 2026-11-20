/**
 * Logic tests for the actual interaction script, using the actual HTML.
 * The small DOM fixture models state/events only; it is NOT evidence of browser
 * layout, image decoding, native focus trapping or assistive-technology support.
 * Run alongside the real-browser suite when browser infrastructure is available.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import { readHtml, decodeEntities } from './helpers/html.mjs';

const { createController } = createRequire(import.meta.url)('../i18n.js');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const markup = readFileSync(resolve(root, 'index.html'), 'utf8');
const source = readFileSync(resolve(root, 'script.js'), 'utf8');
const baseURL = 'https://portfolio.example/';

function descendants(element) {
  return element.children.flatMap(child => [child, ...descendants(child)]);
}

// Only the selector grammar used by the actual scripts is modeled here.
// Splitting outside quoted attributes supports the i18n catalog without
// replacing it with a separate, potentially stale translation stub.
function selectorParts(selector) {
  const parts = [];
  let token = '';
  let quote = '';
  let depth = 0;
  for (const character of selector) {
    if (quote) {
      token += character;
      if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") { quote = character; token += character; continue; }
    if (character === '[' || character === '(') depth++;
    if (character === ']' || character === ')') depth--;
    if (!depth && (/\s/.test(character) || character === '>')) {
      if (token) { parts.push(token); token = ''; }
      if (character === '>') parts.push('>');
    } else token += character;
  }
  if (token) parts.push(token);
  return parts;
}

class Element {
  constructor(document, tag, attributes = {}) {
    this.ownerDocument = document;
    this.tagName = tag.toUpperCase();
    this.attributes = { ...attributes };
    this.children = [];
    this.parentElement = null;
    this.listeners = new Map();
    this.style = {};
    this.ownText = '';
    this.hidden = Object.hasOwn(attributes, 'hidden');
    this.disabled = false;
    this.open = false;
    this.complete = true;
    this.naturalWidth = Number(attributes.width) || 0;
    this.naturalHeight = Number(attributes.height) || 0;
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: name => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), name])].join(' '); },
      remove: name => { this.className = this.className.split(/\s+/).filter(value => value !== name).join(' '); },
      toggle: (name, force) => {
        const selected = force ?? !this.classList.contains(name);
        this.classList[selected ? 'add' : 'remove'](name);
        return selected;
      }
    };
  }
  get className() { return this.attributes.class || ''; }
  set className(value) { this.attributes.class = value; }
  get dataset() {
    return Object.fromEntries(Object.entries(this.attributes).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value]));
  }
  get textContent() { return decodeEntities(this.ownText + this.children.map(child => child.textContent).join('')); }
  set textContent(value) { this.ownText = String(value); this.children = []; }
  get href() { return this.attributes.href ? new URL(this.attributes.href, this.ownerDocument.baseURI).href : ''; }
  set href(value) { this.attributes.href = String(value); }
  get src() { return this.attributes.src ? new URL(this.attributes.src, this.ownerDocument.baseURI).href : ''; }
  set src(value) {
    this.attributes.src = String(value);
    const original = this.ownerDocument.imageSources.get(new URL(value, this.ownerDocument.baseURI).pathname);
    this.naturalWidth = original?.width ?? 0;
    this.naturalHeight = original?.height ?? 0;
  }
  get alt() { return this.attributes.alt || ''; }
  set alt(value) { this.attributes.alt = String(value); }
  get previousElementSibling() {
    const index = this.parentElement?.children.indexOf(this) ?? -1;
    return index > 0 ? this.parentElement.children[index - 1] : null;
  }
  get isConnected() {
    let ancestor = this;
    while (ancestor.parentElement) ancestor = ancestor.parentElement;
    return ancestor === this.ownerDocument.root;
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; }
  appendChild(child) {
    if (child.tagName === '#FRAGMENT') {
      for (const entry of [...child.children]) this.appendChild(entry);
      child.children = [];
      return child;
    }
    child.parentElement = this; this.children.push(child); return child;
  }
  replaceChildren(...children) {
    for (const child of this.children) child.parentElement = null;
    this.children = []; this.ownText = '';
    children.forEach(child => this.appendChild(child));
  }
  matches(selector) {
    const parts = selectorParts(selector);
    if (parts.length > 1) {
      const last = parts.pop();
      if (!this.matches(last)) return false;
      if (parts.at(-1) === '>') {
        parts.pop();
        return Boolean(this.parentElement?.matches(parts.join(' ')));
      }
      return Boolean(this.parentElement?.closest(parts.join(' ')));
    }
    let rest = parts[0] || '';
    const tag = rest.match(/^[a-z][a-z0-9]*/i)?.[0];
    if (tag) {
      if (this.tagName !== tag.toUpperCase()) return false;
      rest = rest.slice(tag.length);
    }
    while (rest) {
      const classOrId = rest.match(/^([.#])([\w-]+)/);
      const attribute = rest.match(/^\[([\w-]+)(?:([\^$]?=)"([^"]*)")?\]/);
      const position = rest.match(/^:(first-child|last-child|nth-child\((\d+)\))/);
      if (classOrId) {
        if (classOrId[1] === '.' ? !this.classList.contains(classOrId[2]) : this.getAttribute('id') !== classOrId[2]) return false;
        rest = rest.slice(classOrId[0].length);
      } else if (attribute) {
        const [, name, operator, value] = attribute;
        const actual = name === 'hidden' ? (this.hidden ? '' : null) : this.getAttribute(name);
        if (actual === null || (operator === '=' && actual !== value) ||
            (operator === '^=' && !actual.startsWith(value)) || (operator === '$=' && !actual.endsWith(value))) return false;
        rest = rest.slice(attribute[0].length);
      } else if (position) {
        const siblings = this.parentElement?.children.filter(child => !child.tagName.startsWith('#')) || [];
        const index = siblings.indexOf(this);
        if ((position[1] === 'first-child' && index !== 0) ||
            (position[1] === 'last-child' && index !== siblings.length - 1) ||
            (position[2] && index !== Number(position[2]) - 1)) return false;
        rest = rest.slice(position[0].length);
      } else throw new Error('Unmodeled selector in logic fixture: ' + selector);
    }
    return true;
  }
  querySelectorAll(selector) {
    if (selector.startsWith(':scope > ')) return this.children.filter(child => child.matches(selector.slice(9)));
    const alternatives = selector.split(',').map(part => part.trim());
    return descendants(this).filter(element => alternatives.some(candidate => element.matches(candidate)));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  closest(selector) {
    for (let element = this; element; element = element.parentElement) if (element.matches(selector)) return element;
    return null;
  }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  emit(type, overrides = {}) {
    const event = { target: this, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...overrides };
    for (const listener of this.listeners.get(type) || []) listener(event);
    return event;
  }
  focus() { this.ownerDocument.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit('close'); }
  getBoundingClientRect() { return { left: 10, top: 10, right: 990, bottom: 790 }; }
}

function fixture({ nativeDialog = true, baseURI = baseURL } = {}) {
  const document = {
    readyState: 'complete',
    baseURI,
    imageSources: new Map(),
    listeners: new Map(),
    createElement(tag) { return new Element(document, tag); },
    createDocumentFragment() { return new Element(document, '#fragment'); },
    createTextNode(text) { const node = new Element(document, '#text'); node.ownText = String(text); return node; },
    querySelectorAll(selector) { return document.root.querySelectorAll(selector); },
    querySelector(selector) { return document.querySelectorAll(selector)[0] ?? null; },
    getElementById(id) { return descendants(document.root).find(element => element.getAttribute('id') === id) ?? null; },
    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(listener);
    },
    dispatchEvent(event) { for (const listener of this.listeners.get(event.type) || []) listener(event); return true; }
  };
  function build(node) {
    const element = new Element(document, node.tag, node.attrs);
    element.ownText = node.ownText;
    for (const child of node.children) element.appendChild(build(child));
    if (element.tagName === 'IMG' && element.getAttribute('src')) {
      document.imageSources.set(new URL(element.src).pathname, { width: element.naturalWidth, height: element.naturalHeight });
      if (element.dataset.fullSrc) document.imageSources.set(new URL(element.dataset.fullSrc, baseURI).pathname, {
        width: Number(element.dataset.fullWidth), height: Number(element.dataset.fullHeight)
      });
    }
    return element;
  }
  document.root = build(readHtml(markup).elements.find(element => element.tag === 'html'));
  document.documentElement = document.root;
  document.body = document.querySelector('body');
  document.activeElement = document.body;
  if (!nativeDialog) document.getElementById('design-dialog').showModal = undefined;
  const window = {
    location: new URL(baseURI),
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  };
  window.PortfolioI18n = createController({ document, window, storage: null }).init();
  vm.runInNewContext(source, { document, window, Date, URL }, { filename: 'script.js' });
  return {
    document,
    i18n: window.PortfolioI18n,
    all: selector => document.querySelectorAll(selector),
    one: selector => document.querySelector(selector),
    id: value => document.getElementById(value),
    language(value) { return window.PortfolioI18n.setLanguage(value); }
  };
}

function select(f, attribute, value) {
  return f.one('[' + attribute + '="' + value + '"]').emit('click');
}

function originalUrl(image) {
  return new URL(image.getAttribute('data-full-src') || image.src, image.ownerDocument.baseURI).href;
}

test('initialization creates only valid project preview buttons and localized counts', () => {
  const f = fixture();
  assert.equal(f.all('.artwork-preview').length, 3);
  for (const button of f.all('.artwork-preview')) {
    assert.equal(button.type, 'button');
    assert(button.getAttribute('aria-label').startsWith('Agrandir la création'));
    assert.equal(button.getAttribute('aria-controls'), 'design-dialog');
  }
  assert.equal(f.id('project-status').textContent, '6 créations');
  assert.equal(f.id('design-status').textContent, '18 créations');
  assert.equal(f.id('year').textContent, String(new Date().getFullYear()));
});

test('project and gallery filters stay independent and represent the actual matching cards', () => {
  const f = fixture();
  for (const button of f.all('[data-filter]')) {
    const category = button.dataset.filter;
    select(f, 'data-filter', category);
    assert.deepEqual(f.all('[data-filter]').filter(item => item.getAttribute('aria-pressed') === 'true'), [button]);
    for (const card of f.all('[data-category]')) assert.equal(card.hidden, category !== 'all' && !card.dataset.category.split(/\s+/).includes(category));
  }
  const before = f.all('[data-category]').map(card => card.hidden);
  for (const button of f.all('[data-design-filter]')) {
    const category = button.dataset.designFilter;
    select(f, 'data-design-filter', category);
    assert.deepEqual(f.all('[data-design-filter]').filter(item => item.getAttribute('aria-pressed') === 'true'), [button]);
    for (const card of f.all('[data-design-category]')) assert.equal(card.hidden, category !== 'all' && !card.dataset.designCategory.split(/\s+/).includes(category));
    assert.deepEqual(f.all('[data-category]').map(card => card.hidden), before);
    assert.equal(f.id('design-status').textContent, f.all('[data-design-category]').filter(card => !card.hidden).length + ' créations');
  }
});

test('gallery filters hide empty groups, their headings, and unrelated case-study context', () => {
  const f = fixture();
  select(f, 'data-design-filter', 'academy');
  assert.equal(f.id('design-grid').hidden, true);
  assert.equal(f.id('design-grid').previousElementSibling.hidden, true);
  assert.equal(f.one('.gallery-case').hidden, true);
  select(f, 'data-design-filter', 'print');
  assert.equal(f.id('design-grid').hidden, false);
  assert.equal(f.id('design-grid').previousElementSibling.hidden, false);
  select(f, 'data-design-filter', 'all');
  for (const group of f.all('.design-grid')) {
    assert.equal(group.hidden, false);
    assert.equal(group.previousElementSibling.hidden, false);
  }
  assert.equal(f.one('.gallery-case').hidden, false);
});

test('gallery preview preserves document links, wraps navigation and restores opener state', () => {
  const f = fixture();
  const trigger = f.all('.design-tile')[0];
  const click = trigger.emit('click');
  assert.equal(click.defaultPrevented, true);
  assert.equal(f.id('design-dialog').open, true);
  assert.equal(f.document.body.classList.contains('preview-open'), true);
  assert.equal(f.document.activeElement, f.id('preview-close'));
  assert.equal(f.id('preview-document').href, trigger.href);
  assert.equal(f.id('preview-image').src, originalUrl(trigger.querySelector('img')));
  assert.equal(f.id('preview-counter').textContent, '1 sur 18');
  f.id('preview-next').emit('click');
  assert.equal(f.id('preview-counter').textContent, '2 sur 18');
  f.id('preview-prev').emit('click');
  f.id('design-dialog').emit('keydown', { key: 'ArrowLeft' });
  assert.equal(f.id('preview-counter').textContent, '18 sur 18');
  f.id('design-dialog').emit('keydown', { key: 'ArrowRight' });
  assert.equal(f.id('preview-counter').textContent, '1 sur 18');
  f.id('preview-close').emit('click');
  assert.equal(f.id('design-dialog').open, false);
  assert.equal(f.document.body.classList.contains('preview-open'), false);
  assert.equal(f.document.activeElement, trigger);
});

test('local download starts unavailable and follows the displayed gallery artwork and filename', () => {
  const f = fixture();
  const download = f.id('preview-download');
  assert(download, 'The dialog footer must contain #preview-download');
  assert.equal(download.hidden, true);
  assert.equal(download.getAttribute('href'), null);
  assert.equal(download.textContent, 'Télécharger le visuel');
  const designs = f.all('.design-tile');
  designs[0].emit('click');
  for (const design of designs) {
    const displayed = f.id('preview-image').src;
    assert.equal(download.hidden, false);
    assert.equal(download.href, displayed);
    const gridImage = design.querySelector('img');
    assert.equal(download.href, originalUrl(gridImage));
    if (gridImage.dataset.fullSrc) {
      assert.notEqual(displayed, gridImage.src, 'The preview must use the original rather than the optimized grid image');
      assert.equal(f.id('preview-image').width, Number(gridImage.dataset.fullWidth));
      assert.equal(f.id('preview-image').height, Number(gridImage.dataset.fullHeight));
      assert.equal(f.id('preview-image').naturalWidth, Number(gridImage.dataset.fullWidth));
      assert.equal(f.id('preview-image').naturalHeight, Number(gridImage.dataset.fullHeight));
    } else {
      assert.equal(displayed, gridImage.src, 'A preview-only artwork must retain its original fallback');
    }
    assert.equal(new URL(download.href).origin, new URL(baseURL).origin);
    assert.equal(download.getAttribute('download'), new URL(displayed).pathname.split('/').pop());
    assert.equal(download.getAttribute('target'), null, 'Local download must not open Canva or another tab');
    assert.equal(f.id('preview-document').href, design.href, 'Canva source must remain independent');
    f.id('preview-next').emit('click');
  }
  assert.equal(download.getAttribute('download'), 'carrigres-calendrier-mural.webp');
  f.id('preview-prev').emit('click');
  assert.equal(download.href, originalUrl(designs.at(-1).querySelector('img')));
  assert.equal(download.emit('click').defaultPrevented, false, 'Use native browser download behavior');
  assert.equal(f.id('design-dialog').open, true);
});

test('project and archive downloads point to their own local artwork, not the Canva source', () => {
  const f = fixture();
  for (const selector of ['.artwork-preview', '.archive-item']) {
    const triggers = f.all(selector);
    triggers[0].emit('click');
    for (const trigger of triggers) {
      const artwork = selector === '.artwork-preview'
        ? trigger.closest('.project-card').querySelector('.real-artwork')
        : trigger.querySelector('img');
      assert.equal(f.id('preview-download').href, originalUrl(artwork));
      assert.equal(f.id('preview-download').getAttribute('download'), new URL(originalUrl(artwork)).pathname.split('/').pop());
      assert(f.id('preview-document').href.startsWith('https://www.canva.com/'));
      f.id('preview-next').emit('click');
    }
    f.id('preview-close').emit('click');
  }
});

test('actual FR/EN/ES localization translates the download action without changing its target', () => {
  const f = fixture();
  f.all('.design-tile')[0].emit('click');
  const download = f.id('preview-download');
  const href = download.href;
  const filename = download.getAttribute('download');
  download.focus();
  for (const [locale, label] of [['fr', 'Télécharger le visuel'], ['en', 'Download artwork'], ['es', 'Descargar diseño'], ['fr', 'Télécharger le visuel']]) {
    f.language(locale);
    assert.equal(f.document.documentElement.lang, locale);
    assert.equal(download.textContent, label);
    assert.equal(download.href, href);
    assert.equal(download.getAttribute('download'), filename);
    assert.equal(f.document.activeElement, download);
    assert.equal(f.id('preview-title').textContent, f.all('.design-tile')[0].querySelector('b').textContent);
    assert.deepEqual(f.i18n.diagnostics, []);
  }
});

test('thumbnail captions follow image quality across navigation and real FR/EN/ES translation', () => {
  const f = fixture();
  const leaflet = f.one('img[src$="atelier-prospectus.webp"]');
  const rollup = f.one('img[src$="atelier-rollup.webp"]');
  assert.equal(leaflet.dataset.assetQuality, 'canva-preview');
  assert.equal(rollup.dataset.assetQuality, 'canva-preview');
  assert.equal(leaflet.getAttribute('data-full-src'), null, 'A genuine original is not yet available for this preview');
  assert.equal(rollup.getAttribute('data-full-src'), null, 'A genuine original is not yet available for this preview');
  const source = leaflet.closest('.design-tile');
  source.emit('click');
  const caption = f.id('preview-caption');
  const download = f.id('preview-download');
  const translations = [
    ['fr', 'Miniature disponible. Le document source peut nécessiter une connexion à Canva.', 'Aperçu de la création. Le document source peut nécessiter une connexion à Canva.', 'Télécharger le visuel'],
    ['en', 'Thumbnail available. The source document may require a Canva login.', 'Design preview. The source document may require a Canva login.', 'Download artwork'],
    ['es', 'Miniatura disponible. El documento original puede requerir iniciar sesión en Canva.', 'Vista previa del diseño. El documento original puede requerir iniciar sesión en Canva.', 'Descargar diseño']
  ];
  for (const [locale, thumbnailText, originalText, downloadText] of translations) {
    f.language(locale);
    assert.equal(caption.getAttribute('data-i18n'), 'thumbnailCaption');
    assert.equal(caption.textContent, thumbnailText);
    assert.equal(download.textContent, downloadText);
    assert.equal(download.href, leaflet.src);
    assert.equal(download.getAttribute('download'), 'atelier-prospectus.webp');
    assert.equal(f.id('preview-document').href, source.href);
    f.id('preview-next').emit('click');
    assert.equal(caption.textContent, thumbnailText);
    assert.equal(download.href, rollup.src);
    assert.equal(download.textContent, downloadText);
    f.id('preview-next').emit('click');
    assert.equal(caption.getAttribute('data-i18n'), 'assetCaption');
    assert.equal(caption.textContent, originalText);
    assert.match(download.getAttribute('download'), /^utex-halloween\.(?:webp|png)$/);
    assert.equal(download.textContent, downloadText);
    f.id('preview-prev').emit('click');
    assert.equal(caption.textContent, thumbnailText);
    f.id('preview-prev').emit('click');
    assert.equal(download.href, leaflet.src);
    assert.deepEqual(f.i18n.diagnostics, []);
  }
});

test('original and current-image fallback downloads resolve under a GitHub Pages subpath', () => {
  const f = fixture({ baseURI: 'https://portfolio.example/portfolio/index.html' });
  const trigger = f.all('.design-tile')[0];
  const gridImage = trigger.querySelector('img');
  const currentSrc = gridImage.src + '?v=2';
  gridImage.currentSrc = currentSrc;
  trigger.emit('click');
  assert.equal(f.id('preview-download').href, 'https://portfolio.example/portfolio/assets/carrigres-calendrier-mural.webp');
  assert.equal(f.id('preview-image').src, originalUrl(gridImage));
  assert.equal(f.id('preview-image').width, Number(gridImage.dataset.fullWidth));
  assert.equal(f.id('preview-image').height, Number(gridImage.dataset.fullHeight));
  f.id('preview-close').emit('click');
  for (const attribute of ['data-full-src', 'data-full-width', 'data-full-height']) gridImage.removeAttribute(attribute);
  trigger.emit('click');
  assert.equal(f.id('preview-download').href, currentSrc);
  assert.equal(f.id('preview-image').src, currentSrc);
  assert.equal(f.id('preview-image').width, Number(gridImage.getAttribute('width')));
  assert.equal(f.id('preview-image').height, Number(gridImage.getAttribute('height')));
  assert.equal(f.id('preview-download').getAttribute('download'), 'carrigres-calendrier-mural.webp');
  assert.equal(f.id('preview-download').hidden, false);
});

test('local PNG downloads preserve their original filename and real FR/EN/ES artwork labels', () => {
  const f = fixture();
  const artwork = f.one('img[data-full-src="assets/utex-halloween.png"]');
  assert(artwork, 'The real Halloween thumbnail must reference its original PNG');
  assert.equal(artwork.getAttribute('src'), 'assets/thumbs/utex-halloween.webp');
  artwork.closest('.design-tile').emit('click');
  for (const [locale, label, alt, downloadText] of [
    ['fr', 'Campagne Halloween', 'Affiche Halloween UTEX aux couleurs sombres', 'Télécharger le visuel'],
    ['en', 'Halloween campaign', 'UTEX Halloween poster in dark colours', 'Download artwork'],
    ['es', 'Campaña de Halloween', 'Cartel de Halloween de UTEX en tonos oscuros', 'Descargar diseño']
  ]) {
    f.language(locale);
    assert.equal(f.id('preview-download').hidden, false);
    assert.equal(f.id('preview-download').href, baseURL + 'assets/utex-halloween.png');
    assert.equal(f.id('preview-download').getAttribute('download'), 'utex-halloween.png');
    assert.equal(f.id('preview-download').textContent, downloadText);
    assert.equal(f.id('preview-image').src, originalUrl(artwork));
    assert.notEqual(f.id('preview-image').src, artwork.src);
    assert.equal(f.id('preview-image').alt, alt);
    assert.equal(f.id('preview-title').textContent, label);
    assert.deepEqual(f.i18n.diagnostics, []);
  }
  f.id('preview-next').emit('click');
  assert.notEqual(f.id('preview-download').getAttribute('download'), 'utex-halloween.png');
  f.id('preview-prev').emit('click');
  assert.equal(f.id('preview-download').getAttribute('download'), 'utex-halloween.png');
});

test('the confirmed Agorafrik conclusion page has an accurate alt in all three languages', () => {
  const f = fixture();
  const artwork = f.one('img[src$="agorafrik-pitch.webp"]');
  artwork.closest('.design-tile').emit('click');
  for (const [locale, alt] of [
    ['fr', 'Page de conclusion du pitch deck Agorafrik, avec portrait artistique et motifs bordeaux et orange'],
    ['en', 'Conclusion page of the Agorafrik pitch deck, with an artistic portrait and burgundy and orange motifs'],
    ['es', 'Página de conclusión de la presentación de Agorafrik, con un retrato artístico y motivos en burdeos y naranja']
  ]) {
    f.language(locale);
    assert.equal(artwork.alt, alt);
    assert.equal(f.id('preview-image').alt, alt);
  }
});

test('non-local or unsupported original and fallback sources cannot leave a stale download link', () => {
  for (const sourceType of ['original', 'fallback']) {
  for (const currentSrc of ['https://cdn.example/artwork.webp', 'https://cdn.example/artwork.png', 'https://portfolio.example/private/artwork.webp', 'https://portfolio.example/private/artwork.png', 'https://portfolio.example/assets/artwork.pdf', 'https://portfolio.example/assets/artwork.jpg', 'data:image/webp;base64,AA==']) {
    const f = fixture();
    const designs = f.all('.design-tile');
    designs[0].emit('click');
    assert.equal(f.id('preview-download').hidden, false);
    const gridImage = designs[1].querySelector('img');
    if (sourceType === 'original') gridImage.setAttribute('data-full-src', currentSrc);
    else {
      gridImage.removeAttribute('data-full-src');
      gridImage.currentSrc = currentSrc;
    }
    f.id('preview-next').emit('click');
    assert.equal(f.id('preview-download').hidden, true, currentSrc);
    assert.equal(f.id('preview-download').getAttribute('href'), null);
    assert.equal(f.id('preview-download').getAttribute('download'), null);
    assert.equal(f.id('preview-document').href, designs[1].href);
    f.id('preview-prev').emit('click');
    assert.equal(f.id('preview-download').hidden, false);
    assert.equal(f.id('preview-download').href, originalUrl(designs[0].querySelector('img')));
  }
  }
});

test('preview navigation respects current gallery filters and never visits hidden designs', () => {
  const f = fixture();
  select(f, 'data-design-filter', 'academy');
  const visible = f.all('.design-tile').filter(element => !element.hidden);
  visible[0].emit('click');
  assert.equal(visible.length, 3);
  for (let index = 0; index < visible.length; index++) {
    assert.equal(f.id('preview-document').href, visible[index].href);
    assert.equal(f.id('preview-counter').textContent, (index + 1) + ' sur 3');
    f.id('preview-next').emit('click');
  }
  assert.equal(f.id('preview-document').href, visible[0].href);
});

test('modified link activation preserves browser-native source-document navigation', () => {
  for (const modifier of ['ctrlKey', 'metaKey', 'altKey', 'shiftKey']) {
    const f = fixture();
    const trigger = f.all('.design-tile')[0];
    const event = trigger.emit('click', { [modifier]: true });
    assert.equal(event.defaultPrevented, false, modifier);
    assert.equal(f.id('design-dialog').open, false);
    assert.match(trigger.href, /^https:\/\/www\.canva\.com\/(?:d\/[^/?#]+|design\/[^/?#]+\/view)(?:[?#].*)?$/);
  }
});

test('open preview title, alt, labels and counters refresh when the interface language changes', () => {
  const f = fixture();
  const trigger = f.all('.design-tile')[0];
  trigger.emit('click');
  f.language('en');
  assert.equal(f.id('preview-title').textContent, 'Wall calendar');
  assert.equal(f.id('preview-image').alt, trigger.querySelector('img').alt);
  assert.match(f.id('preview-image').alt, /Carrigrès 2026 wall calendar/);
  assert.equal(f.id('preview-counter').textContent, '1 of 18');
  assert.equal(trigger.getAttribute('aria-label'), 'Enlarge design — Wall calendar');
  assert.equal(f.id('design-status').textContent, '18 designs');
});

test('project and archive previews navigate within their own groups', () => {
  const f = fixture();
  const project = f.all('.artwork-preview')[0];
  project.emit('click');
  assert.equal(f.id('preview-counter').textContent, '1 sur 3');
  assert.equal(f.id('preview-title').textContent, 'Carrigrès');
  f.id('preview-close').emit('click');
  f.all('.archive-item')[0].emit('click');
  assert.equal(f.id('preview-counter').textContent, '1 sur 2');
  f.id('preview-next').emit('click');
  assert.equal(f.id('preview-document').href, f.all('.archive-item')[1].href);
});

test('image failure has a visible error state while retaining the original document link', () => {
  const f = fixture();
  const trigger = f.all('.design-tile')[0];
  trigger.emit('click');
  f.id('preview-image').emit('error');
  assert.equal(f.id('preview-image').hidden, true);
  assert.equal(f.id('preview-error').hidden, false);
  assert.equal(f.id('preview-document').href, trigger.href);
  f.id('preview-image').emit('load');
  assert.equal(f.id('preview-image').hidden, false);
  assert.equal(f.id('preview-error').hidden, true);
});

test('backdrop closes the preview, but a click on the dialog itself does not', () => {
  const f = fixture();
  f.all('.design-tile')[0].emit('click');
  f.id('design-dialog').emit('click', { clientX: 30, clientY: 30 });
  assert.equal(f.id('design-dialog').open, true);
  f.id('design-dialog').emit('click', { clientX: 0, clientY: 0 });
  assert.equal(f.id('design-dialog').open, false);
});

test('unsupported native dialog falls back to intact source links without adding dead buttons', () => {
  const f = fixture({ nativeDialog: false });
  assert.equal(f.all('.artwork-preview').length, 0);
  const trigger = f.all('.design-tile')[0];
  assert.equal(trigger.emit('click').defaultPrevented, false);
  assert.equal(trigger.getAttribute('aria-haspopup'), null);
  assert.match(trigger.href, /^https:\/\/www\.canva\.com\/(?:d\/[^/?#]+|design\/[^/?#]+\/view)(?:[?#].*)?$/);
  assert.equal(f.id('design-status').textContent, '18 créations');
});
