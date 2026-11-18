/**
 * Offline regression checks for the domain confirmed by the portfolio owner.
 * They validate portfolio content, not future uptime of the external website.
 * Primary-page HTTP/title/content verification is recorded separately in QA.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readHtml, textContent } from './helpers/html.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const { elements } = readHtml(html);
const i18n = createRequire(import.meta.url)('../i18n.js');
const confirmedDomain = 'breathewithoutfear.org';
const screenshotPath = 'assets/breathe-without-fear-site.jpg';
const obsoleteDomain = /\bbreathwithoutfear\.org\b/i;
const waitingState = /coming[\s-]*soon|waiting page|in preparation|under construction|in development|page d['’]attente|en pr[ée]paration|en d[ée]veloppement|bient[oô]t disponible|pr[oó]ximo lanzamiento|pr[oó]ximamente|p[aá]gina de espera|en preparaci[oó]n|en desarrollo/i;

function descendants(node) {
  return node.children.flatMap(child => [child, ...descendants(child)]);
}

function websiteCard() {
  const cards = elements.filter(node => node.tag === 'article' && node.attrs.class?.split(/\s+/).includes('website-card'));
  const matches = cards.filter(card => descendants(card).some(node => node.tag === 'h3' && /breathe.*fear/i.test(textContent(node))));
  assert.equal(matches.length, 1, 'Expected one identifiable Breathe Without Fear website card');
  return matches[0];
}

function assertActiveCopy(value, label) {
  assert.equal(typeof value, 'string', 'Missing text: ' + label);
  assert(value.trim(), 'Empty text: ' + label);
  assert(!obsoleteDomain.test(value), 'Obsolete domain in ' + label);
  assert(!waitingState.test(value), 'Outdated coming-soon status in ' + label + ': ' + value);
}

function jpegDimensions(buffer) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8, 'The website capture must be an actual JPEG file');
  const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 3 < buffer.length) {
    assert.equal(buffer[offset], 0xff, 'Invalid JPEG segment marker');
    while (buffer[offset] === 0xff) offset++;
    const marker = buffer[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = buffer.readUInt16BE(offset);
    assert(length >= 2 && offset + length <= buffer.length, 'Truncated JPEG segment');
    if (frameMarkers.has(marker)) {
      assert(length >= 8, 'Invalid JPEG frame');
      return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  throw new Error('No JPEG frame dimensions found');
}

test('public HTML uses the confirmed Breathe Without Fear domain, not the earlier spelling', () => {
  assert(!obsoleteDomain.test(html), 'The old domain remains in public markup or an inline translation');
  const links = descendants(websiteCard()).filter(node => node.tag === 'a' && node.attrs.href);
  const matching = links.filter(node => {
    try {
      const url = new URL(node.attrs.href);
      return url.protocol === 'https:' && url.hostname === confirmedDomain;
    } catch { return false; }
  });
  assert(matching.length > 0, 'The Breathe Without Fear card must link to the confirmed HTTPS website');
});

test('Breathe Without Fear card has complete FR/EN/ES copy without a coming-soon claim', () => {
  const nodes = [websiteCard(), ...descendants(websiteCard())];
  const translated = nodes.filter(node => Object.hasOwn(node.attrs, 'data-fr') && Object.hasOwn(node.attrs, 'data-en'));
  assert(translated.some(node => node.tag === 'p'), 'Expected a localized description of the live website');
  for (const node of nodes) {
    if (node.ownText.trim()) assertActiveCopy(node.ownText, 'visible ' + node.tag);
    for (const attribute of ['aria-label', 'title', 'alt']) {
      if (node.attrs[attribute]) assertActiveCopy(node.attrs[attribute], attribute);
    }
  }
  for (const node of translated) {
    const element = { getAttribute: name => node.attrs[name] ?? null };
    for (const language of ['fr', 'en', 'es']) assertActiveCopy(i18n.lookupInline(element, language), node.tag + '/' + language);
  }
});

test('dynamic Breathe Without Fear labels do not restore the obsolete preparation status', () => {
  const messages = [
    ...i18n.TEXT_BINDINGS.filter(([selector]) => selector.includes('.breathe-browser')).map(([selector, message]) => [selector, message]),
    ...i18n.ATTRIBUTE_BINDINGS.filter(([selector]) => selector.includes('.breathe-browser')).map(([selector, attribute, message]) => [selector + '/' + attribute, message]),
    ...(i18n.ASSETS['breathe-without-fear-site.jpg'] ? [[screenshotPath + '/alt', i18n.ASSETS['breathe-without-fear-site.jpg']]] : [])
  ];
  assert(messages.length > 0, 'Breathe Without Fear accessible labels must remain localized');
  for (const [label, message] of messages) {
    for (const language of ['fr', 'en', 'es']) assertActiveCopy(message[language], label + '/' + language);
  }
});

test('Breathe Without Fear shows the actual website capture with matching intrinsic dimensions', () => {
  const images = descendants(websiteCard()).filter(node => node.tag === 'img' && node.attrs.src === screenshotPath);
  assert.equal(images.length, 1, 'The Breathe Without Fear card must contain its real website screenshot');
  const image = images[0];
  const actual = jpegDimensions(readFileSync(resolve(root, screenshotPath)));
  assert(actual.width > 0 && actual.height > 0);
  assert.deepEqual({ width: Number(image.attrs.width), height: Number(image.attrs.height) }, actual, 'Screenshot HTML dimensions do not match the JPEG');
  assert.match(image.attrs.alt ?? '', /breathe/i, 'The screenshot needs a meaningful project-specific alt');
  const alt = i18n.ASSETS['breathe-without-fear-site.jpg'];
  for (const language of ['fr', 'en', 'es']) assertActiveCopy(alt?.[language], 'screenshot alt/' + language);
  const manifest = JSON.parse(readFileSync(resolve(root, 'assets-manifest.json'), 'utf8'));
  const record = manifest.images.find(item => item.path === screenshotPath);
  assert(record, 'The website screenshot must be documented in the asset manifest');
  assert.deepEqual({ width: record.width, height: record.height }, actual, 'Screenshot manifest dimensions do not match the JPEG');
  const source = new URL(record.sourceUrl);
  assert.equal(source.protocol, 'https:');
  assert.equal(source.hostname, confirmedDomain, 'The screenshot source must be the confirmed website');
});
