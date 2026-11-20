const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const i18n = require('../i18n.js');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// A small start-tag tokenizer keeps quoted <em>/<br> translations intact.
// A [^>]* expression would silently skip headings containing HTML in attributes.
const decode = value => value.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/g, entity => ({
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&#x27;': "'"
})[entity]);
const tags = [...html.matchAll(/<([a-z][\w:-]*)(\s+(?:[^"'<>]|"[^"]*"|'[^']*')*)?\s*\/?>/gi)].map(match => {
  const attributes = Object.create(null);
  for (const attr of (match[2] || '').matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attributes[attr[1]] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '');
  }
  return { name: match[1].toLowerCase(), attributes };
});

test('all public message groups contain nonempty FR, EN and ES', () => {
  for (const [key, message] of Object.entries(i18n.UI)) i18n.validateTriple(message, key);
  for (const [key, message] of Object.entries(i18n.ASSETS)) i18n.validateTriple(message, key);
  for (const [key, message] of Object.entries(i18n.ARCHIVE_LABELS)) i18n.validateTriple(message, key);
  for (const [key, messages] of Object.entries(i18n.DESIGN_LABELS)) messages.forEach((message, i) => i18n.validateTriple(message, key + i));
  for (const [selector, message] of i18n.TEXT_BINDINGS) i18n.validateTriple(message, selector);
  for (const [selector, attribute, message] of i18n.ATTRIBUTE_BINDINGS) i18n.validateTriple(message, selector + attribute);
});

test('every HTML inline FR/EN translation has an explicit Spanish translation', () => {
  const missing = [];
  const entries = tags.filter(tag => 'data-fr' in tag.attributes || 'data-en' in tag.attributes);
  assert(entries.length > 50, 'Expected the bilingual page content to be present');
  assert(entries.some(tag => tag.attributes['data-fr'].includes('<em>')), 'Rich headings must be checked too');
  for (const { attributes } of entries) {
    const fr = attributes['data-fr'];
    const en = attributes['data-en'];
    assert(fr?.trim() && en?.trim(), 'Empty or missing FR/EN translation');
    if (!Object.hasOwn(i18n.SPANISH, fr) && !attributes['data-es']?.trim()) missing.push(fr);
  }
  assert.deepEqual(missing, [], 'Missing ES inline translations: ' + missing.join(' | '));
});

test('every visible source image has a localized alt in the asset catalog or HTML', () => {
  const missing = [];
  for (const { attributes } of tags.filter(tag => tag.name === 'img')) {
    const src = attributes.src;
    const alt = attributes.alt;
    if (alt === '') continue; // Explicitly decorative image.
    assert.notEqual(alt, undefined, 'Image missing alt: ' + src);
    const filename = src?.split('/').pop();
    if (!Object.hasOwn(i18n.ASSETS, filename) && !attributes['data-i18n-alt'] && !attributes['data-alt-es']) missing.push(filename);
  }
  assert.deepEqual(missing, []);
});

test('HTML keyed translations refer to complete registered UI messages', () => {
  for (const { attributes } of tags) {
    for (const name of ['data-i18n', 'data-i18n-aria', 'data-i18n-alt', 'data-i18n-title', 'data-i18n-placeholder']) {
      if (name in attributes) assert(Object.hasOwn(i18n.UI, attributes[name]), 'Unknown UI key: ' + attributes[name]);
    }
    for (const attr of ['alt', 'aria-label', 'title']) {
      const keys = i18n.LOCALES.map(locale => `data-${attr}-${locale}`);
      if (keys.some(key => key in attributes)) assert(keys.every(key => attributes[key]?.trim()), 'Incomplete attribute translation: ' + attr);
    }
  }
});

test('Spanish map permits only reviewed em/br rich text tags', () => {
  for (const value of Object.values(i18n.SPANISH)) {
    assert.equal(value.replace(/<br>|<\/?em>/g, '').includes('<'), false, value);
  }
});

test('stored preference is reused, and invalid values are ignored', () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  assert.equal(i18n.savePreference(storage, 'es'), true);
  assert.equal(i18n.readPreference(storage), 'es');
  memory.set(i18n.STORAGE_KEY, '<script>');
  assert.equal(i18n.readPreference(storage), null);
  assert.equal(i18n.savePreference(storage, 'pt'), false);
});

test('blocked or unavailable localStorage never breaks language switching', () => {
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } };
  assert.equal(i18n.readPreference(denied), null);
  assert.equal(i18n.savePreference(denied, 'en'), false);
  assert.equal(i18n.readPreference(null), null);
  assert.equal(i18n.savePreference(null, 'fr'), false);
});

test('message interpolation inserts only explicitly supplied values', () => {
  assert.equal(i18n.interpolate('{current} of {total}', { current: 2, total: 23 }), '2 of 23');
  assert.equal(i18n.interpolate('{unknown}', {}), '{unknown}');
  assert.equal(i18n.interpolate('{constructor}', {}), '{constructor}');
});

class Node {
  constructor(tag = 'span', attributes = {}) {
    this.tagName = tag.toUpperCase(); this.attributes = { ...attributes }; this.children = []; this.listeners = new Map(); this.value = '';
    this.classList = { toggle() {} };
  }
  getAttribute(key) { return Object.prototype.hasOwnProperty.call(this.attributes, key) ? this.attributes[key] : null; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  get textContent() { return this.children.map(child => typeof child === 'string' ? child : child.textContent).join(''); }
  set textContent(value) { this.children = [String(value)]; }
  addEventListener(type, callback) { this.listeners.set(type, callback); }
  querySelectorAll() { return []; }
}
function fixture() {
  const translated = new Node('a', { 'data-fr': 'Réalisations', 'data-en': 'Work' });
  const rich = new Node('h2', { 'data-fr': 'LE TRAVAIL<br><em>PARLE.</em>', 'data-en': 'THE WORK<br><em>SPEAKS.</em>' });
  const localizedKey = new Node('button', { 'data-i18n': 'close' });
  const image = new Node('img', { 'src': 'assets/carrigres-brochure.webp', 'alt': 'French placeholder' });
  const language = new Node('select');
  const meta = new Node('meta');
  const ogTitle = new Node('meta');
  const ogDescription = new Node('meta');
  const doc = {
    documentElement: new Node('html'),
    title: '',
    events: [],
    createDocumentFragment: () => new Node('fragment'),
    createElement: tag => new Node(tag),
    createTextNode: text => { const node = new Node('#text'); node.textContent = text; return node; },
    getElementById: id => id === 'language-select' ? language : null,
    querySelector: selector => ({
      'meta[name="description"]': meta,
      'meta[property="og:title"]': ogTitle,
      'meta[property="og:description"]': ogDescription
    })[selector] || null,
    querySelectorAll: selector => {
      if (selector === '[data-fr][data-en]') return [translated, rich];
      if (selector === '[data-i18n]') return [localizedKey];
      if (selector === 'img[src$="carrigres-brochure.webp"]') return [image];
      return [];
    },
    dispatchEvent: event => doc.events.push(event)
  };
  return { doc, translated, rich, localizedKey, image, language, meta, ogTitle, ogDescription };
}

test('controller updates text, rich heading, image alt, metadata, selector and event across all locales', () => {
  const f = fixture();
  const memory = new Map();
  const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  const view = { location: { search: '' }, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } } };
  const controller = i18n.createController({ document: f.doc, window: view, storage });
  controller.init();
  assert.equal(f.translated.textContent, 'Réalisations');
  controller.setLanguage('en');
  assert.equal(f.doc.documentElement.lang, 'en');
  assert.equal(f.translated.textContent, 'Work');
  assert.equal(f.rich.textContent, 'THE WORKSPEAKS.');
  assert.equal(f.localizedKey.textContent, 'Close');
  assert.match(f.image.getAttribute('alt'), /company brochure/);
  assert.match(f.meta.getAttribute('content'), /strategy/);
  assert.equal(f.language.value, 'en');
  assert.equal(memory.get(i18n.STORAGE_KEY), 'en');
  controller.setLanguage('es');
  assert.equal(f.translated.textContent, 'Proyectos');
  assert.equal(f.localizedKey.textContent, 'Cerrar');
  assert.match(f.image.getAttribute('alt'), /Folleto/);
  assert.equal(f.doc.title, 'Gloria Tumsifu Kasunzu — Portafolio');
  assert.equal(f.doc.events.at(-1).type, 'portfolio:languagechange');
  assert.equal(f.doc.events.at(-1).detail.language, 'es');
  controller.setLanguage('fr');
  assert.equal(f.translated.textContent, 'Réalisations');
  assert.deepEqual(controller.diagnostics, []);
});

test('reloading restores saved locale; query locale overrides it safely', () => {
  const storage = { getItem: () => 'es', setItem() {} };
  const first = fixture();
  i18n.createController({ document: first.doc, storage }).init();
  assert.equal(first.doc.documentElement.lang, 'es');
  const query = fixture();
  i18n.createController({ document: query.doc, storage, window: { location: { search: '?lang=en' } } }).init();
  assert.equal(query.doc.documentElement.lang, 'en');
  const invalid = fixture();
  i18n.createController({ document: invalid.doc, storage, window: { location: { search: '?lang=invalid' } } }).init();
  assert.equal(invalid.doc.documentElement.lang, 'es');
});

test('Open Graph metadata remains synchronized with the translated title and description', () => {
  const f = fixture();
  const controller = i18n.createController({ document: f.doc }).init();
  for (const locale of i18n.LOCALES) {
    controller.setLanguage(locale);
    assert.equal(f.ogTitle.getAttribute('content'), f.doc.title);
    assert.equal(f.ogDescription.getAttribute('content'), f.meta.getAttribute('content'));
    assert.equal(f.ogTitle.getAttribute('content'), i18n.UI.title[locale]);
    assert.equal(f.ogDescription.getAttribute('content'), i18n.UI.description[locale]);
  }
});

test('throwing storage getter does not prevent initialization or later changes', () => {
  const f = fixture();
  const view = { get localStorage() { throw new Error('blocked'); } };
  const controller = i18n.createController({ document: f.doc, window: view }).init();
  assert.equal(controller.language, 'fr');
  assert.equal(controller.setLanguage('en'), true);
  assert.equal(controller.language, 'en');
  assert.equal(controller.setLanguage('xx'), false);
  assert.equal(controller.language, 'en');
});

test('rich renderer never interprets unapproved HTML', () => {
  const f = fixture();
  const target = new Node('h2');
  i18n.renderText(target, '<em>Safe</em><script>alert(1)</script>', f.doc);
  assert.equal(target.textContent, 'Safe<script>alert(1)</script>');
  assert.equal(target.children[0].children[0].tagName, 'EM');
  assert.equal(target.children[0].children.some(child => child.tagName === 'SCRIPT'), false);
});

test('new dynamic messages require every language and are available for lightbox UI', () => {
  const f = fixture();
  const controller = i18n.createController({ document: f.doc }).init();
  assert.throws(() => controller.registerMessages({ invalid: { fr: 'Bonjour', en: 'Hello' } }), /Missing es/);
  controller.registerMessages({ example: { fr: 'Bonjour', en: 'Hello', es: 'Hola' } });
  controller.setLanguage('es');
  assert.equal(controller.t('example'), 'Hola');
  assert.equal(controller.t('count', { current: 1, total: 23 }), '1 de 23');
});

test('subtree translation includes its root element, without changing other content', () => {
  const f = fixture();
  const controller = i18n.createController({ document: f.doc }).init();
  controller.setLanguage('es');
  const target = new Node('button', { 'data-i18n': 'close' });
  target.matches = selector => selector === '[data-i18n]';
  controller.translate(target);
  assert.equal(target.textContent, 'Cerrar');
  assert.equal(f.translated.textContent, 'Proyectos');
});

test('unknown inherited keys are not interpreted as messages', () => {
  const f = fixture();
  const controller = i18n.createController({ document: f.doc }).init();
  assert.equal(controller.t('constructor'), 'constructor');
  assert.equal(i18n.lookupInline(new Node('span', { 'data-fr': 'constructor' }), 'es'), null);
  assert(controller.diagnostics.includes('Unknown translation key: constructor'));
});
