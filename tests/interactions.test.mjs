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
    this.scrollLeft = 0;
    this.scrollTop = 0;
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
  get hidden() { return Object.hasOwn(this.attributes, 'hidden'); }
  set hidden(value) { if (value) this.attributes.hidden = ''; else delete this.attributes.hidden; }
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
  hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
  contains(element) { return element === this || descendants(this).includes(element); }
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
  focus() { if (!this.closest('[inert]') && !this.closest('[hidden]')) this.ownerDocument.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit('close'); }
  scrollTo({ left = 0, top = 0 } = {}) { this.scrollLeft = left; this.scrollTop = top; this.emit('scroll'); }
  getBoundingClientRect() {
    const width = this.ownerDocument.viewportWidth;
    if (Object.hasOwn(this.attributes, 'data-slide')) {
      const track = this.closest('.slide-track');
      const index = track.querySelectorAll('[data-slide]').indexOf(this);
      const left = 10 + index * width - track.scrollLeft;
      return { left, top: 10, right: left + width, bottom: 790, width, height: 780 };
    }
    return { left: 10, top: 10, right: 10 + width, bottom: 790, width, height: 780 };
  }
}

function fixture({ nativeDialog = true, baseURI = baseURL, viewportWidth = 390 } = {}) {
  const document = {
    readyState: 'complete',
    baseURI,
    viewportWidth,
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
    if (element.tagName === 'IMG' && (element.getAttribute('src') || element.getAttribute('data-deferred-src'))) {
      const previewPath = element.getAttribute('src') || element.getAttribute('data-deferred-src');
      document.imageSources.set(new URL(previewPath, baseURI).pathname, { width: element.naturalWidth, height: element.naturalHeight });
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
  const listeners = new Map();
  const mediaListeners = [];
  const mobile = { matches: viewportWidth <= 700, addEventListener(type, listener) { if (type === 'change') mediaListeners.push(listener); } };
  const window = {
    location: new URL(baseURI),
    innerWidth: viewportWidth,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    matchMedia(query) { return query.includes('max-width') ? mobile : { matches: true }; },
    requestAnimationFrame(callback) { callback(); return 1; },
    addEventListener(type, listener) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(listener); },
    setTimeout, clearTimeout
  };
  window.PortfolioI18n = createController({ document, window, storage: null }).init();
  vm.runInNewContext(source, { document, window, Date, URL }, { filename: 'script.js' });
  return {
    document,
    i18n: window.PortfolioI18n,
    all: selector => document.querySelectorAll(selector),
    one: selector => document.querySelector(selector),
    id: value => document.getElementById(value),
    language(value) { return window.PortfolioI18n.setLanguage(value); },
    resize(width) {
      const previous = mobile.matches;
      window.innerWidth = document.viewportWidth = width;
      mobile.matches = width <= 700;
      if (previous !== mobile.matches) mediaListeners.forEach(listener => listener({ matches: mobile.matches }));
      (listeners.get('resize') || []).forEach(listener => listener());
    },
    event(type, overrides = {}) {
      const event = { type, target: document.body, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...overrides };
      document.dispatchEvent(event);
      return event;
    }
  };
}

function select(f, attribute, value) {
  return f.one('[' + attribute + '="' + value + '"]').emit('click');
}

function originalUrl(image) {
  return new URL(image.getAttribute('data-full-src') || image.src, image.ownerDocument.baseURI).href;
}


// The fixture uses synthetic coordinates only to exercise scrolling decisions.
// No assertion below is evidence that actual CSS, font loading or touch swipes work.
function sequences(f) { return f.all('[data-slideshow]'); }
function pages(group) { return group.querySelectorAll('[data-slide]'); }
function trigger(page) { return page.querySelector('a[data-preview]'); }
function activePage(group) { return pages(group).findIndex(page => page.getAttribute('aria-hidden') === 'false'); }
function multiple(f) { return sequences(f).find(group => pages(group).length > 2); }
function click(group, attribute) { return group.querySelector('[' + attribute + ']').emit('click'); }
function openPage(f, group, index = 0) {
  if (!group.hasAttribute('data-gallery')) {
    while (activePage(group) < index) click(group, 'data-slide-next');
    while (activePage(group) > index) click(group, 'data-slide-prev');
  }
  const opener = trigger(pages(group)[index]);
  opener.emit('click');
  return opener;
}

function assertGalleryAvailable(group, originalTiles) {
  const tiles = pages(group);
  assert.equal(tiles.length, originalTiles.length, 'Viewer navigation must not remove gallery tiles');
  tiles.forEach((tile, index) => {
    assert.equal(tile, originalTiles[index], 'Viewer navigation must not reorder or replace gallery tiles');
    assert.equal(tile.hidden, false);
    assert.equal(tile.hasAttribute('inert'), false);
    assert.notEqual(tile.getAttribute('aria-hidden'), 'true');
    const link = trigger(tile);
    assert.equal(link.closest('[hidden]'), null);
    assert.equal(link.closest('[inert]'), null);
    assert.notEqual(link.getAttribute('tabindex'), '-1');
  });
}

test('enhancement preserves every primary local link and identifies the actual project pages', () => {
  const f = fixture();
  const parsed = readHtml(markup).elements.filter(node => node.tag === 'a' && Object.hasOwn(node.attrs, 'data-preview'));
  assert(parsed.length > 0);
  assert.equal(f.all('a[data-preview]').length, parsed.length);
  f.all('a[data-preview]').forEach((link, index) => {
    assert.equal(link.getAttribute('href'), parsed[index].attrs.href);
    assert.equal(link.getAttribute('aria-controls'), 'design-dialog');
    assert.equal(link.getAttribute('aria-haspopup'), 'dialog');
    assert.match(link.getAttribute('href'), /^assets\//);
  });
  for (const group of sequences(f)) {
    assert.equal(activePage(group), 0);
    pages(group).forEach((page, index) => assert.equal(page.hasAttribute('inert'), index !== 0));
    assert.equal(group.querySelector('[data-slide-count]').textContent, `1 sur ${pages(group).length}`);
  }
});

test('mobile menu opens, changes language, closes with Escape and restores focus', () => {
  const f = fixture();
  assert.deepEqual(f.all('#main-menu a').map(link => link.getAttribute('href')), ['#realisations', '#competences', '#contact']);
  const button = f.id('menu-toggle');
  assert.equal(button.hidden, false);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  button.emit('click');
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(f.one('.site-header').classList.contains('nav-open'), true);
  f.language('en');
  assert.equal(button.getAttribute('aria-label'), 'Close navigation');
  assert.equal(button.querySelector('[data-menu-label]').textContent, 'Close');
  const event = f.event('keydown', { key: 'Escape' });
  assert.equal(event.defaultPrevented, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(f.document.activeElement, button);
  assert.equal(button.querySelector('[data-menu-label]').textContent, 'Menu');
});

test('navigation activation, outside click and desktop resize close the mobile disclosure', () => {
  const f = fixture();
  const button = f.id('menu-toggle');
  button.emit('click');
  f.one('#main-menu a[href="#competences"]').emit('click');
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(f.document.activeElement, f.id('competences'));
  button.emit('click');
  f.event('click', { target: f.id('language-select') });
  assert.equal(button.getAttribute('aria-expanded'), 'true', 'Controls inside the header do not dismiss it');
  f.event('click', { target: f.document.body });
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  button.emit('click');
  f.resize(1440);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(f.one('.site-header').classList.contains('nav-open'), false);
  f.resize(390);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
});

test('filters show the matching projects and announce counts from actual content', () => {
  const f = fixture();
  const cards = f.all('article.project-card[data-category]');
  assert.deepEqual(f.all('[data-filter]').map(button => button.dataset.filter), ['all', 'branding', 'communication', 'research']);
  for (const button of f.all('[data-filter]')) {
    const category = button.dataset.filter;
    button.emit('click');
    assert.deepEqual(f.all('[data-filter]').filter(control => control.getAttribute('aria-pressed') === 'true'), [button]);
    for (const card of cards) assert.equal(!card.hidden, category === 'all' || card.dataset.category.split(/\s+/).includes(category));
    assert.equal(f.id('project-status').textContent, `${cards.filter(card => !card.hidden).length} projets`);
  }
  select(f, 'data-filter', 'all');
  assert(cards.every(card => !card.hidden));
});

test('gallery navigation opens the chosen artwork, wraps inside the gallery and preserves every tile', () => {
  const f = fixture();
  const gallery = f.one('[data-gallery]');
  assert(gallery, 'The visual gallery is required');
  const originalTiles = pages(gallery);
  const total = originalTiles.length;
  assert(total >= 50, 'The gallery needs a generous selection');
  const originalLinks = originalTiles.map(tile => trigger(tile).getAttribute('href'));
  const project = multiple(f);
  const projectIndex = activePage(project);
  const track = gallery.querySelector('.gallery-grid');
  const originalScroll = { left: track.scrollLeft, top: track.scrollTop };
  assertGalleryAvailable(gallery, originalTiles);
  for (const tile of originalTiles) {
    trigger(tile).focus();
    assert.equal(f.document.activeElement, trigger(tile), 'Every gallery link must remain focusable');
  }

  const index = Math.floor(total / 2);
  const opener = openPage(f, gallery, index);
  assert.equal(f.id('design-dialog').open, true);
  assert.equal(f.id('preview-counter').textContent, `${index + 1} sur ${total}`);
  assert.equal(f.id('preview-image').src, originalUrl(opener.querySelector('img')));
  f.id('preview-next').emit('click');
  assert.equal(f.id('preview-image').src, originalUrl(trigger(originalTiles[index + 1]).querySelector('img')));
  assert.equal(f.id('preview-download').href, f.id('preview-image').src);
  assertGalleryAvailable(gallery, originalTiles);
  assert.equal(activePage(project), projectIndex, 'Gallery navigation must not advance a project carousel');
  f.id('preview-close').emit('click');
  assert.equal(f.document.activeElement, opener, 'Closing must return to the exact tile that opened the viewer');
  assertGalleryAvailable(gallery, originalTiles);

  openPage(f, gallery, total - 1);
  f.id('preview-next').emit('click');
  assert.equal(f.id('preview-image').src, originalUrl(trigger(originalTiles[0]).querySelector('img')));
  assert.equal(f.id('preview-counter').textContent, `1 sur ${total}`);
  f.id('preview-prev').emit('click');
  assert.equal(f.id('preview-image').src, originalUrl(trigger(originalTiles[total - 1]).querySelector('img')));
  f.id('preview-close').emit('click');
  assert.equal(f.document.activeElement, trigger(originalTiles[total - 1]));
  assert.deepEqual(pages(gallery).map(tile => trigger(tile).getAttribute('href')), originalLinks);
  assert.deepEqual({ left: track.scrollLeft, top: track.scrollTop }, originalScroll, 'The gallery must not scroll like a carousel');
  for (const button of f.all('[data-filter]')) {
    button.emit('click');
    assertGalleryAvailable(gallery, originalTiles);
  }
});

test('FR, EN and ES translate the open gallery without changing its artwork or accessibility', () => {
  const f = fixture();
  const gallery = f.one('[data-gallery]');
  const originalTiles = pages(gallery);
  const index = 2;
  const selected = originalTiles[index];
  const opener = openPage(f, gallery, index);
  const original = originalUrl(opener.querySelector('img'));
  for (const [language, name, count] of [['en', 'Gallery', 'of'], ['es', 'Galería', 'de'], ['fr', 'Galerie', 'sur']]) {
    f.language(language);
    assert.equal(gallery.getAttribute('aria-label'), name);
    assert.equal(f.id('preview-title').textContent, selected.querySelector('[data-slide-title]').getAttribute('data-' + language));
    const expectedCaption = selected.querySelector('[data-slide-caption]')?.getAttribute('data-' + language)?.trim() || '';
    assert.equal(f.id('preview-caption').textContent, expectedCaption);
    assert.equal(f.id('preview-caption').hidden, !expectedCaption, 'The viewer must hide an absent caption');
    assert.equal(f.id('preview-image').alt, opener.querySelector('img').getAttribute('data-alt-' + language));
    assert.equal(f.id('preview-counter').textContent, `${index + 1} ${count} ${originalTiles.length}`);
    assert.equal(f.id('preview-image').src, original);
    assert.equal(f.id('preview-download').href, original);
    for (const link of f.all('#main-menu a')) assert.equal(link.textContent.trim(), link.getAttribute('data-' + language));
    assertGalleryAvailable(gallery, originalTiles);
  }
  f.id('preview-close').emit('click');
  assert.equal(f.document.activeElement, opener);
  assert.deepEqual(f.i18n.diagnostics, []);
});

test('inline page navigation stays in its project and stops at both ends', () => {
  const f = fixture();
  const group = multiple(f);
  assert(group, 'The delivered portfolio contains multipage work');
  const peer = sequences(f).find(value => value !== group && pages(value).length > 1);
  assert(peer);
  const total = pages(group).length;
  assert.equal(group.querySelector('[data-slide-prev]').disabled, true);
  for (let index = 1; index < total; index++) {
    click(group, 'data-slide-next');
    assert.equal(activePage(group), index);
    assert.equal(group.querySelector('[data-slide-count]').textContent, `${index + 1} sur ${total}`);
    assert.equal(activePage(peer), 0, 'Another project must not advance');
  }
  assert.equal(group.querySelector('[data-slide-next]').disabled, true);
  for (let index = total - 2; index >= 0; index--) {
    click(group, 'data-slide-prev');
    assert.equal(activePage(group), index);
  }
  assert.equal(group.querySelector('[data-slide-prev]').disabled, true);
});

test('keyboard navigation and native-scroll events update the selected page and focusability', () => {
  const f = fixture();
  const group = multiple(f);
  const track = group.querySelector('.slide-track');
  track.emit('keydown', { key: 'ArrowRight' });
  assert.equal(activePage(group), 1);
  assert.equal(f.document.activeElement, track);
  assert.equal(pages(group)[0].hasAttribute('inert'), true);
  assert.equal(pages(group)[1].hasAttribute('inert'), false);
  track.emit('keydown', { key: 'End' });
  assert.equal(activePage(group), pages(group).length - 1);
  track.emit('keydown', { key: 'Home' });
  assert.equal(activePage(group), 0);
  track.scrollLeft = f.document.viewportWidth * 2;
  track.emit('scroll');
  assert.equal(activePage(group), 2);
  assert.equal(group.querySelector('[data-slide-count]').textContent, `3 sur ${pages(group).length}`);
});

test('the viewer opens the chosen page, stays within that sequence and restores the opener', () => {
  const f = fixture();
  const group = multiple(f);
  const total = pages(group).length;
  const opener = openPage(f, group, 1);
  assert.equal(f.id('design-dialog').open, true);
  assert.equal(f.document.activeElement, f.id('preview-close'));
  assert.equal(f.id('preview-counter').textContent, `2 sur ${total}`);
  assert.equal(f.id('preview-image').src, originalUrl(opener.querySelector('img')));
  for (let index = 2; index <= total; index++) {
    f.id('preview-next').emit('click');
    const selected = index % total;
    assert.equal(f.id('preview-image').src, originalUrl(trigger(pages(group)[selected]).querySelector('img')));
    assert.equal(f.id('preview-counter').textContent, `${selected + 1} sur ${total}`);
  }
  f.id('preview-prev').emit('click');
  assert.equal(f.id('preview-counter').textContent, `${total} sur ${total}`);
  f.id('preview-close').emit('click');
  assert.equal(f.id('design-dialog').open, false);
  assert.equal(f.document.activeElement, opener);
  assert.equal(activePage(group), 1, 'The opener must be made reachable again');
  assert.equal(f.document.body.classList.contains('preview-open'), false);
});

test('download always follows the displayed original and supports repository subpaths', () => {
  const f = fixture({ baseURI: 'https://portfolio.example/Portfolio/index.html?lang=fr' });
  for (const group of sequences(f)) {
    openPage(f, group);
    for (const page of pages(group)) {
      const image = trigger(page).querySelector('img');
      const expected = originalUrl(image);
      assert.equal(f.id('preview-image').src, expected);
      assert.equal(f.id('preview-download').href, expected);
      assert.equal(f.id('preview-download').getAttribute('download'), expected.split('/').pop());
      assert.equal(f.id('preview-download').hidden, false);
      assert.equal(f.id('preview-image').width, Number(image.dataset.fullWidth));
      assert.equal(f.id('preview-image').height, Number(image.dataset.fullHeight));
      f.id('preview-next').emit('click');
    }
    f.id('preview-close').emit('click');
  }
});

test('local artwork clears any stale complete-document link from the viewer', () => {
  const f = fixture();
  assert(f.all('a[data-preview]').every(link => !link.dataset.source), 'The published selection must not expose source documents');
  // Seed stale UI state without requiring a real source link in public content.
  f.id('preview-document').href = 'https://www.canva.com/design/STALE_REFERENCE/view';
  f.id('preview-document').hidden = false;
  openPage(f, multiple(f));
  assert.equal(f.id('preview-document').hidden, true);
  assert.equal(f.id('preview-document').getAttribute('href'), null);
  f.id('preview-close').emit('click');
  openPage(f, f.one('[data-gallery]'), 1);
  assert.equal(f.id('preview-document').hidden, true);
  assert.equal(f.id('preview-document').getAttribute('href'), null);
  assert.equal(f.id('preview-download').hidden, false);
});

test('invalid source links and remote or unsafe downloads are not offered', () => {
  const f = fixture();
  const group = multiple(f);
  const opener = trigger(pages(group)[0]);
  const image = opener.querySelector('img');
  for (const unsafe of ['https://other.example/art.webp', 'https://portfolio.example/private.webp', 'data:image/png;base64,AA==']) {
    image.setAttribute('data-full-src', unsafe);
    opener.setAttribute('data-source', 'https://www.canva.com/design/EXAMPLE/edit');
    opener.emit('click');
    assert.equal(f.id('preview-download').hidden, true);
    assert.equal(f.id('preview-download').getAttribute('href'), null);
    assert.equal(f.id('preview-document').hidden, true);
    assert.equal(f.id('preview-document').getAttribute('href'), null);
    f.id('preview-close').emit('click');
  }
});

test('zoom changes viewer state, permits image-region arrow scrolling and resets on another page', () => {
  const f = fixture();
  const group = multiple(f);
  openPage(f, group);
  const zoom = f.id('preview-zoom');
  assert.equal(zoom.disabled, false);
  assert.equal(zoom.getAttribute('aria-pressed'), 'false');
  zoom.emit('click');
  assert.equal(zoom.getAttribute('aria-pressed'), 'true');
  assert.equal(f.id('design-dialog').classList.contains('is-zoomed'), true);
  const media = f.one('.preview-media');
  assert.equal(media.getAttribute('tabindex'), '0');
  const oldCounter = f.id('preview-counter').textContent;
  const event = f.id('design-dialog').emit('keydown', { key: 'ArrowRight', target: media });
  assert.equal(event.defaultPrevented, false, 'Image scrolling must not be hijacked by page navigation');
  assert.equal(f.id('preview-counter').textContent, oldCounter);
  f.id('preview-next').emit('click');
  assert.equal(zoom.getAttribute('aria-pressed'), 'false');
  assert.equal(media.getAttribute('tabindex'), null);
  assert.equal(f.id('design-dialog').classList.contains('is-zoomed'), false);
});

test('an open viewer keeps its page and zoom while titles, captions, alt text and counts translate', () => {
  const f = fixture();
  const group = multiple(f);
  const opener = openPage(f, group, 1);
  const page = pages(group)[1];
  f.id('preview-zoom').emit('click');
  for (const [language, count, label] of [['en', 'of', 'Fit to screen'], ['es', 'de', 'Ajustar a la pantalla'], ['fr', 'sur', 'Ajuster à l’écran']]) {
    f.language(language);
    assert(f.id('preview-title').textContent.endsWith(page.querySelector('[data-slide-title]').getAttribute('data-' + language)));
    const expectedCaption = page.querySelector('[data-slide-caption]')?.getAttribute('data-' + language)?.trim() || '';
    assert.equal(f.id('preview-caption').textContent, expectedCaption);
    assert.equal(f.id('preview-caption').hidden, !expectedCaption);
    assert.equal(f.id('preview-image').alt, opener.querySelector('img').getAttribute('data-alt-' + language));
    assert.equal(f.id('preview-counter').textContent, `2 ${count} ${pages(group).length}`);
    assert.equal(f.id('preview-zoom').textContent, label);
    assert.equal(f.id('preview-zoom').getAttribute('aria-pressed'), 'true');
    assert.equal(f.id('preview-download').href, originalUrl(opener.querySelector('img')));
  }
  assert.deepEqual(f.i18n.diagnostics, []);
});

test('image errors expose a recoverable state and the next page clears it', () => {
  const f = fixture();
  const group = multiple(f);
  openPage(f, group);
  f.id('preview-image').emit('error');
  assert.equal(f.id('preview-image').hidden, true);
  assert.equal(f.id('preview-error').hidden, false);
  assert.equal(f.id('preview-download').hidden, true);
  assert.equal(f.id('preview-zoom').disabled, true);
  f.id('preview-next').emit('click');
  assert.equal(f.id('preview-image').hidden, false);
  assert.equal(f.id('preview-error').hidden, true);
  assert.equal(f.id('preview-download').hidden, false);
  assert.equal(f.id('preview-zoom').disabled, false);
});

test('a backdrop click closes the viewer but its own content does not', () => {
  const f = fixture();
  const opener = openPage(f, multiple(f));
  f.id('design-dialog').emit('click', { clientX: 30, clientY: 30 });
  assert.equal(f.id('design-dialog').open, true);
  f.id('design-dialog').emit('click', { clientX: 0, clientY: 0 });
  assert.equal(f.id('design-dialog').open, false);
  assert.equal(f.document.activeElement, opener);
});

test('modified clicks and browsers without native dialog retain local-link navigation', () => {
  const f = fixture();
  for (const group of [multiple(f), f.one('[data-gallery]')]) {
    const opener = trigger(pages(group)[0]);
    for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      assert.equal(opener.emit('click', modifiers).defaultPrevented, false);
      assert.equal(f.id('design-dialog').open, false);
    }
  }
  const fallback = fixture({ nativeDialog: false });
  for (const group of [multiple(fallback), fallback.one('[data-gallery]')]) {
    const link = trigger(pages(group)[0]);
    assert.equal(link.emit('click').defaultPrevented, false);
    assert.equal(link.getAttribute('aria-haspopup'), null);
    assert.match(link.getAttribute('href'), /^assets\//);
  }
  assert.equal(fallback.id('design-dialog').open, false);
});
