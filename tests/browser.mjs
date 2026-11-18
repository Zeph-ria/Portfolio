/**
 * Real-browser acceptance suite. It never installs browsers, bypasses permissions,
 * or substitutes a DOM mock for browser evidence.
 *
 * Run: node tests/browser.mjs
 * Optional: PORTFOLIO_BROWSER_EXECUTABLE=/path/to/approved/chromium
 * Optional: PORTFOLIO_BASE_URL=https://an-authorized-preview.example/
 * Without BASE_URL a temporary read-only HTTP server serves this checkout.
 * Exit 2 means browser infrastructure unavailable, NOT a passing test result.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.json': 'application/json' };
let server;
let browser;
let baseURL = process.env.PORTFOLIO_BASE_URL;
let passes = 0;
let failures = 0;

async function run(name, action) {
  try { await action(); passes++; console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.stack ?? error}`); }
}

async function localServer() {
  const instance = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
      if (!(await stat(file)).isFile()) { response.writeHead(404); response.end(); return; }
      response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      response.end(await readFile(file));
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise((done, reject) => { instance.once('error', reject); instance.listen(0, '127.0.0.1', done); });
  return instance;
}

async function settleFonts(page) {
  await page.evaluate(async () => { await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))]); });
}

async function assertFilter(page, filterAttribute, cardAttribute, category) {
  await page.locator(`[${filterAttribute}="${category}"]`).click();
  const state = await page.evaluate(({ filterAttribute, cardAttribute, category }) => ({
    pressed: [...document.querySelectorAll(`[${filterAttribute}]`)].filter(element => element.getAttribute('aria-pressed') === 'true').map(element => element.getAttribute(filterAttribute)),
    mismatches: [...document.querySelectorAll(`[${cardAttribute}]`)].filter(element => {
      const expected = category === 'all' || element.getAttribute(cardAttribute).split(/\s+/).includes(category);
      const visible = !element.hidden && getComputedStyle(element).display !== 'none';
      return visible !== expected;
    }).map(element => element.textContent.trim())
  }), { filterAttribute, cardAttribute, category });
  assert.deepEqual(state.pressed, [category]);
  assert.deepEqual(state.mismatches, []);
}

try {
  const { chromium } = require('playwright');
  if (!baseURL) {
    server = await localServer();
    baseURL = `http://127.0.0.1:${server.address().port}/`;
  }
  browser = await chromium.launch({ headless: true, ...(process.env.PORTFOLIO_BROWSER_EXECUTABLE ? { executablePath: process.env.PORTFOLIO_BROWSER_EXECUTABLE } : {}) });
} catch (error) {
  console.error(`BROWSER QA UNAVAILABLE — no browser tests ran.\n${error.message}`);
  server?.close();
  process.exitCode = 2;
}

if (browser) {
  try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const pageErrors = [];
  const failedLocalRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => { if (new URL(request.url()).origin === new URL(baseURL).origin) failedLocalRequests.push(request.url()); });
  page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).origin === new URL(baseURL).origin) failedLocalRequests.push(`${response.status()} ${response.url()}`); });
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await settleFonts(page);

  await run('font loading and local media are real, not broken placeholders', async () => {
    const typography = await page.evaluate(() => ({
      loaded: [...document.fonts].some(face => face.family.replace(/["']/g, '') === 'Wremena' && face.status === 'loaded'),
      heading: getComputedStyle(document.querySelector('h1')).fontFamily,
      featureColor: getComputedStyle(document.querySelector('.feature')).backgroundColor
    }));
    assert(typography.loaded, 'The actual Wremena font face has not loaded');
    assert.match(typography.heading, /^Wremena(?:,|$)/, 'Primary heading font changed');
    assert.equal(typography.featureColor, 'rgb(101, 41, 54)', 'Approved burgundy changed');
    const images = page.locator('img[src]').filter({ visible: true });
    for (let i = 0; i < await images.count(); i++) {
      const image = images.nth(i);
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(element => element.decode());
      assert(await image.evaluate(element => element.naturalWidth > 0 && element.naturalHeight > 0), 'Broken image');
    }
  });

  await run('project and gallery filters work independently with correct selection state', async () => {
    for (const category of ['communication', 'design', 'digital', 'all']) await assertFilter(page, 'data-filter', 'data-category', category);
    await assertFilter(page, 'data-filter', 'data-category', 'digital');
    for (const category of ['branding', 'digital', 'academy', 'print', 'all']) await assertFilter(page, 'data-design-filter', 'data-design-category', category);
    assert.equal(await page.locator('[data-filter="digital"]').getAttribute('aria-pressed'), 'true');
    await assertFilter(page, 'data-filter', 'data-category', 'all');
  });

  await run('empty calendar group and heading disappear outside the print filter', async () => {
    await assertFilter(page, 'data-design-filter', 'data-design-category', 'branding');
    assert.equal(await page.locator('#design-grid').isVisible(), false, 'Empty calendar grid consumes space');
    assert.equal(await page.locator('.gallery-series').first().isVisible(), false, 'Empty calendar group title remains');
    await assertFilter(page, 'data-design-filter', 'data-design-category', 'all');
  });

  await run('all four Carrigrès calendars share a desktop row', async () => {
    const calendars = await page.locator('#design-grid > .design-tile').evaluateAll(elements => elements.map(element => {
      const { top, left, width } = element.getBoundingClientRect();
      return { top, left, width };
    }));
    assert.equal(calendars.length, 4);
    assert(calendars.every(item => Math.abs(item.top - calendars[0].top) <= 1), 'The four calendar formats wrap at 1440px');
    for (let i = 1; i < calendars.length; i++) assert(calendars[i].left >= calendars[i - 1].left + calendars[i - 1].width, 'Calendar columns overlap');
  });

  await run('gallery opens an accessible native dialog and preserves document link', async () => {
    const trigger = page.locator('.design-tile').first();
    const originalHref = await trigger.getAttribute('href');
    await trigger.click();
    assert.equal(await page.locator('#design-dialog').evaluate(element => element.open), true);
    assert((await page.locator('#preview-title').textContent()).trim(), 'Preview title empty');
    assert.equal(await page.locator('#preview-document').getAttribute('href'), originalHref);
    await page.locator('#preview-image').evaluate(image => image.decode());
    const counter = await page.locator('#preview-counter').textContent();
    await page.locator('#preview-next').click();
    assert.notEqual(await page.locator('#preview-counter').textContent(), counter);
    await page.locator('#preview-prev').click();
    assert.equal(await page.locator('#preview-counter').textContent(), counter);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#design-dialog').evaluate(element => element.open), false);
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true, 'Focus not restored after closing preview');
  });

  await run('preview remains keyboard-contained and follows the interface language', async () => {
    const trigger = page.locator('.design-tile').first();
    await trigger.click();
    const frenchTitle = await page.locator('#preview-title').textContent();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.querySelector('#design-dialog').contains(document.activeElement)), true, 'Keyboard focus escaped the modal');
    }
    await page.evaluate(() => window.PortfolioI18n.setLanguage('en'));
    assert.notEqual(await page.locator('#preview-title').textContent(), frenchTitle, 'Open preview did not translate with the interface');
    assert.equal(await page.locator('#preview-image').getAttribute('alt'), await trigger.locator('img').getAttribute('alt'));
    assert.match(await page.locator('#preview-close').getAttribute('aria-label') ?? await page.locator('#preview-close').textContent(), /close/i);
    await page.locator('#preview-close').click();
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
    await page.locator('#language-select').selectOption('fr');
  });

  const originalAlt = await page.locator('.design-tile img').first().getAttribute('alt');
  const originalCaption = await page.locator('.design-tile b').first().textContent();
  await run('FR/EN/ES switch translates captions, alt text, metadata and survives reload', async () => {
    for (const language of ['en', 'es', 'fr']) {
      await page.locator('#language-select').selectOption(language);
      assert.equal(await page.locator('html').getAttribute('lang'), language);
      assert.equal(await page.evaluate(() => localStorage.getItem('gtk-lang')), language);
      const caption = await page.locator('.design-tile b').first().textContent();
      const alt = await page.locator('.design-tile img').first().getAttribute('alt');
      if (language !== 'fr') {
        assert.notEqual(caption, originalCaption, 'Gallery caption remains French');
        assert.notEqual(alt, originalAlt, 'Image description remains French');
      }
      const meta = await page.locator('meta[name="description"]').getAttribute('content');
      assert(meta && meta.length > 30);
      const diagnostics = await page.evaluate(() => window.PortfolioI18n.diagnostics);
      assert.deepEqual(diagnostics, [], 'Missing or unknown translations were reported');
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('html').getAttribute('lang'), language, 'Language preference did not persist');
      assert.equal(await page.locator('#language-select').inputValue(), language);
    }
  });

  for (const language of ['fr', 'en', 'es']) {
    for (const width of [360, 390, 650, 700, 768, 1440]) {
      await run(`no horizontal overflow or clipped headings at ${width}px / ${language}`, async () => {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator('#language-select').selectOption(language);
        await settleFonts(page);
        await page.evaluate(() => window.scrollTo(0, 0));
        const overflow = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          const offenders = [...document.querySelectorAll('h1, h2, h3, .hero h1 > span, .main-nav a, .header-actions, .browser-content strong, .visual-caption, .design-tile b, .design-tile small, #sites .website-card, #sites .website-details p')].filter(element => {
            if (!element.getClientRects().length) return false;
            const bounds = element.getBoundingClientRect();
            if (bounds.left < -1 || bounds.right > viewport + 1 || element.scrollWidth > element.clientWidth + 2) return true;
            for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
              if (!['hidden', 'clip'].includes(getComputedStyle(ancestor).overflowX)) continue;
              const clip = ancestor.getBoundingClientRect();
              if (bounds.left < clip.left - 1 || bounds.right > clip.right + 1) return true;
            }
            return false;
          }).map(element => element.textContent.trim().slice(0, 90));
          return { pageOverflow: document.documentElement.scrollWidth > viewport + 1, offenders };
        });
        assert.equal(overflow.pageOverflow, false, 'Page scrolls sideways');
        assert.deepEqual(overflow.offenders, [], 'Heading/nav content exceeds its visible box');
        const capture = await page.locator('.breathe-browser').evaluate(element => {
          const image = element.querySelector('img');
          const box = element.getBoundingClientRect();
          const picture = image.getBoundingClientRect();
          const bar = element.querySelector('.browser-bar').getBoundingClientRect();
          return {
            gap: box.height - picture.height - bar.height,
            ratioError: Math.abs(picture.height - picture.width * image.naturalHeight / image.naturalWidth)
          };
        });
        assert(Math.abs(capture.gap) <= 1, 'Website capture is cropped or followed by artificial empty space');
        assert(capture.ratioError <= 1, 'Website capture proportions changed');
      });
    }
  }

  await run('scripts do not throw and local resources do not fail', async () => {
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(failedLocalRequests, []);
  });

  await run('blocked storage does not break language controls', async () => {
    const deniedContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await deniedContext.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new DOMException('Storage denied', 'SecurityError'); };
      Storage.prototype.setItem = () => { throw new DOMException('Storage denied', 'SecurityError'); };
    });
    const deniedPage = await deniedContext.newPage();
    const errors = [];
    deniedPage.on('pageerror', error => errors.push(error.message));
    await deniedPage.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await deniedPage.locator('#language-select').selectOption('en');
    assert.equal(await deniedPage.locator('html').getAttribute('lang'), 'en');
    assert.deepEqual(errors, []);
    await deniedContext.close();
  });

  await run('without JavaScript, every gallery design still links to its source document', async () => {
    const fallbackContext = await browser.newContext({ javaScriptEnabled: false });
    try {
      const fallbackPage = await fallbackContext.newPage();
      await fallbackPage.goto(baseURL, { waitUntil: 'domcontentloaded' });
      assert.equal(await fallbackPage.locator('html').getAttribute('lang'), 'fr');
      const links = fallbackPage.locator('.design-tile');
      assert.equal(await links.count(), await page.locator('.design-tile').count());
      for (let i = 0; i < await links.count(); i++) {
        assert.equal(await links.nth(i).isVisible(), true);
        assert.match(await links.nth(i).getAttribute('href'), /^https:\/\/www\.canva\.com\/d\//);
      }
      assert.equal(await fallbackPage.locator('#design-dialog').isVisible(), false);
    } finally { await fallbackContext.close(); }
  });

  await context.close();
  } catch (error) {
    failures++;
    console.error(`FAIL browser suite initialization: ${error.stack ?? error}`);
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
  console.log(`Browser acceptance results: ${passes} passed, ${failures} failed.`);
  if (failures) process.exitCode = 1;
}
