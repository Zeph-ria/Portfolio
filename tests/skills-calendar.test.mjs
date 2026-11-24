import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readHtml } from './helpers/html.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(resolve(root, 'index.html'), 'utf8');
const content = JSON.parse(readFileSync(resolve(root, 'content/projects.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(root, 'assets-manifest.json'), 'utf8'));
const { elements, errors } = readHtml(page);
const children = node => node.children.flatMap(child => [child, ...children(child)]);

test('Only Work, Skills and Contact remain in the top navigation', () => {
  assert.deepEqual(errors, []);
  const nav = elements.find(node => node.attrs.id === 'main-menu');
  const hrefs = children(nav).filter(node => node.tag === 'a').map(node => node.attrs.href);
  assert.deepEqual(hrefs, ['#realisations','#competences','#contact']);
  assert.equal(elements.filter(node => node.attrs.id === 'competences').length, 1);
});

test('Skills are substantial text-only content in all three languages', () => {
  const section = elements.find(node => node.attrs.id === 'competences');
  const blocks = children(section).filter(node => node.attrs.class?.split(/\s+/).includes('expertise-pillar'));
  assert.equal(blocks.length, 3);
  assert.equal(children(section).filter(node => node.tag === 'img').length, 0, 'Skills should be text-only');
  for (const block of blocks) {
    const title = children(block).find(node => node.tag === 'h3');
    const copy = children(block).find(node => node.tag === 'p');
    assert(title && copy, 'Each skill needs a title and explanatory paragraph');
    for(const locale of ['fr','en','es']) {
      assert(title.attrs['data-'+locale]?.trim());
      assert(copy.attrs['data-'+locale]?.trim());
    }
  }
  assert(!elements.some(node => node.attrs.id === 'explorations'), 'Remove disconnected archive layout');
});

test('Contact offers the verified WhatsApp link without disclosing any client messages', () => {
  const link = elements.find(node => node.tag === 'a' && node.attrs.href === 'https://wa.me/243815128665');
  assert(link, 'Professional WhatsApp contact is required');
  assert.equal(link.attrs.target, '_blank');
  assert(link.attrs.rel?.includes('noopener') && link.attrs.rel?.includes('noreferrer'));
  assert(!page.includes('gzephrine@gmail.com'), 'Private email should not be exposed');
});

test('Both desk calendars include all 15 PDF pages in the native slide sequence', () => {
  const lookup = new Map(manifest.images.map(item => [item.path,item]));
  for(const kind of ['table','triptyque']) {
    const calendar = content.calendars.find(item => item.id === kind);
    assert.equal(calendar.slides.length,16,'One printed overview and 15 original pages');
    const card = elements.find(node => node.attrs.id === 'calendrier-'+kind);
    const slides = children(card).filter(node => Object.hasOwn(node.attrs,'data-slide'));
    assert.equal(slides.length,16,'16 pages must be present in the public HTML');
    for(let i=1;i<calendar.slides.length;i++) {
      const slide = calendar.slides[i];
      assert.equal(slide.path,'assets/calendars/'+kind+'-p'+String(i).padStart(2,'0')+'.webp');
      assert(existsSync(resolve(root,slide.path)));
      assert(lookup.has(slide.path));
      assert.equal(slide.path,slide.thumb);
      assert(slide.width>0 && slide.height>0);
    }
  }
});
