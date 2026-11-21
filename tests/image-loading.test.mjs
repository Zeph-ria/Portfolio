import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readHtml } from './helpers/html.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const { elements, errors } = readHtml(html);
const images = elements.filter(node => node.tag === 'img');
const deferred = images.filter(node => node.attrs['data-deferred-src']);
const ancestors = node => {
  const values = [];
  for (let current = node.parent; current; current = current.parent) values.push(current);
  return values;
};

test('unseen artwork uses a deferred thumbnail without losing the original media reference', () => {
  assert.deepEqual(errors, []);
  assert(deferred.length >= 140, 'Most unseen thumbnails must be deferred from initial loading');
  for (const image of deferred) {
    assert(!image.attrs.src, 'The browser must not start fetching a deferred thumbnail from its HTML src');
    assert(/^assets\//.test(image.attrs['data-deferred-src']));
    assert(/^assets\//.test(image.attrs['data-full-src']));
    assert(Number(image.attrs.width) > 0 && Number(image.attrs.height) > 0, 'Preserve image intrinsic dimensions');
    const link = ancestors(image).find(node => node.tag === 'a' && Object.hasOwn(node.attrs, 'data-preview'));
    assert(link, 'Every deferred artwork must remain inside its original interactive preview');
    assert.equal(link.attrs.href, image.attrs['data-full-src'], 'Viewer must keep the untouched original source');
    for (const lang of ['fr', 'en', 'es']) assert(image.attrs['data-alt-' + lang]?.trim(), 'Missing localized alternative text');
  }
});

test('all deferred art has a matching native fallback for browsers without JavaScript', () => {
  assert(/<html\b[^>]*class="no-js"/.test(html));
  assert(html.includes('document.documentElement.classList.remove("no-js")'));
  for (const image of deferred) {
    const link = ancestors(image).find(node => node.tag === 'a' && Object.hasOwn(node.attrs, 'data-preview'));
    const fallbacks = link.children.filter(node => node.tag === 'noscript')
      .flatMap(node => node.children).filter(node => node.tag === 'img');
    assert.equal(fallbacks.length, 1, 'Deferred artwork must have exactly one no-script image');
    assert.equal(fallbacks[0].attrs.src, image.attrs['data-deferred-src']);
    assert.equal(fallbacks[0].attrs.alt, image.attrs.alt);
  }
});

test('the four gallery teaser images retain their immediate original previews', () => {
  const expected = ['agorafrik-identite-p35.webp','wali-visuels-p13.webp',
    'atelier-campagnes-p22.webp','revendre-styles-p39.webp'];
  const gallery=elements.find(node => node.tag === 'div' && Object.hasOwn(node.attrs, 'data-gallery'));
  const getDescendants = node => node.children.flatMap(child => [child,...getDescendants(child)]);
  const pictures = getDescendants(gallery).filter(node => node.tag === 'img' && node.attrs['data-full-src']);
  for (const suffix of expected) {
    const matches=pictures.filter(img => img.attrs['data-full-src'].endsWith(suffix));
    assert.equal(matches.length, 1, 'Each featured design must be selected exactly once: '+suffix);
    assert(matches[0].attrs.src, 'Teaser must be ready to load when the gallery appears');
    assert(!matches[0].attrs['data-deferred-src']);
  }
});
