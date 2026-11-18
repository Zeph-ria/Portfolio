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
import { test } from 'node:test';
import vm from 'node:vm';
import { readHtml, decodeEntities } from './helpers/html.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const markup = readFileSync(resolve(root, 'index.html'), 'utf8');
const source = readFileSync(resolve(root, 'script.js'), 'utf8');
const baseURL = 'https://portfolio.example/';

function descendants(element) {
  return element.children.flatMap(child => [child, ...descendants(child)]);
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
  get textContent() { return decodeEntities(this.ownText + this.children.map(child => child.textContent).join(' ')); }
  set textContent(value) { this.ownText = String(value); this.children = []; }
  get href() { return this.attributes.href ? new URL(this.attributes.href, baseURL).href : ''; }
  set href(value) { this.attributes.href = String(value); }
  get src() { return this.attributes.src ? new URL(this.attributes.src, baseURL).href : ''; }
  set src(value) {
    this.attributes.src = String(value);
    const original = this.ownerDocument.imageSources.get(new URL(value, baseURL).pathname);
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
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  matches(selector) {
    if (selector === '[hidden]') return this.hidden;
    const match = selector.match(/^([a-z][a-z0-9]*)?(?:\.([\w-]+))?(?:\[([\w-]+)(?:(\^?=)"([^"]*)")?\])?$/);
    if (!match) throw new Error('Unmodeled selector in logic fixture: ' + selector);
    const [, tag, className, attribute, operator, value] = match;
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    if (className && !this.classList.contains(className)) return false;
    if (attribute) {
      const actual = this.getAttribute(attribute);
      if (actual === null || (operator === '=' && actual !== value) || (operator === '^=' && !actual.startsWith(value))) return false;
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

function fixture({ nativeDialog = true } = {}) {
  const document = {
    readyState: 'complete',
    imageSources: new Map(),
    listeners: new Map(),
    createElement(tag) { return new Element(document, tag); },
    querySelectorAll(selector) { return document.root.querySelectorAll(selector); },
    querySelector(selector) { return document.querySelectorAll(selector)[0] ?? null; },
    getElementById(id) { return descendants(document.root).find(element => element.getAttribute('id') === id) ?? null; },
    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(listener);
    },
    emit(type) { for (const listener of this.listeners.get(type) || []) listener({ type }); }
  };
  function build(node) {
    const element = new Element(document, node.tag, node.attrs);
    element.ownText = node.ownText;
    for (const child of node.children) element.appendChild(build(child));
    if (element.tagName === 'IMG' && element.getAttribute('src')) document.imageSources.set(new URL(element.src).pathname, { width: element.naturalWidth, height: element.naturalHeight });
    return element;
  }
  document.root = build(readHtml(markup).elements.find(element => element.tag === 'html'));
  document.body = document.querySelector('body');
  document.activeElement = document.body;
  if (!nativeDialog) document.getElementById('design-dialog').showModal = undefined;
  let language = 'fr';
  const window = {
    PortfolioI18n: {
      t(key, values = {}) {
        const templates = {
          preview: { fr: 'Agrandir la création', en: 'Enlarge design' },
          count: { fr: '{current} sur {total}', en: '{current} of {total}' },
          itemCount: { fr: '{count} créations', en: '{count} designs' }
        };
        return (templates[key]?.[language] ?? key).replace(/\{(\w+)\}/g, (_, name) => values[name]);
      }
    }
  };
  vm.runInNewContext(source, { document, window, Date }, { filename: 'script.js' });
  return {
    document,
    all: selector => document.querySelectorAll(selector),
    one: selector => document.querySelector(selector),
    id: value => document.getElementById(value),
    language(value) { language = value; document.emit('portfolio:languagechange'); }
  };
}

function select(f, attribute, value) {
  return f.one('[' + attribute + '="' + value + '"]').emit('click');
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
  assert.equal(f.id('preview-image').src, trigger.querySelector('img').src);
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
    assert(trigger.href.startsWith('https://www.canva.com/d/'));
  }
});

test('open preview title, alt, labels and counters refresh when the interface language changes', () => {
  const f = fixture();
  const trigger = f.all('.design-tile')[0];
  trigger.emit('click');
  trigger.querySelector('b').textContent = 'Wall calendar';
  trigger.querySelector('img').alt = 'Carrigrès wall calendar';
  f.language('en');
  assert.equal(f.id('preview-title').textContent, 'Wall calendar');
  assert.equal(f.id('preview-image').alt, 'Carrigrès wall calendar');
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
  assert(trigger.href.startsWith('https://www.canva.com/d/'));
  assert.equal(f.id('design-status').textContent, '18 créations');
});
