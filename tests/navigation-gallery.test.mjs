/** Browser acceptance for the revised portfolio, using its real page and assets.
 * Run: node tests/navigation-gallery.test.mjs
 * Optional PORTFOLIO_BASE_URL and PORTFOLIO_BROWSER_EXECUTABLE.
 * Exit 2 means no browser ran; it must never be reported as a passing check.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let server;
let browser;
let baseURL = process.env.PORTFOLIO_BASE_URL;
let passed = 0;
let failed = 0;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.json': 'application/json' };

async function run(name, check) {
  try { await check(); passed++; console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name + '\n' + error.stack); }
}

try {
  const { chromium } = require('playwright');
  browser = await chromium.launch({ headless: true, ...(process.env.PORTFOLIO_BROWSER_EXECUTABLE ? { executablePath: process.env.PORTFOLIO_BROWSER_EXECUTABLE } : {}) });
  if (!baseURL) {
    server = createServer(async (request, response) => {
      try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
        if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) { response.writeHead(404).end(); return; }
        response.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
        response.end(await readFile(file));
      } catch { response.writeHead(404).end(); }
    });
    await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
    baseURL = `http://127.0.0.1:${server.address().port}/`;
  }
} catch (error) {
  console.error('BROWSER QA UNAVAILABLE — no browser checks ran.\n' + error.message);
  process.exitCode = 2;
}

if (browser) {
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

    await run('three navigation destinations; mobile menu closes and returns focus', async () => {
      assert.deepEqual(await page.locator('#main-menu a').evaluateAll(links => links.map(link => link.getAttribute('href'))), ['#realisations', '#competences', '#contact']);
      assert.equal(await page.locator('#menu-toggle').isVisible(), false);
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(await page.locator('#main-menu').isVisible(), false);
        const header = await page.locator('.site-header').boundingBox();
        assert(header.height <= 100, `Header occupies ${header.height}px at ${width}px`);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Page overflows horizontally');
        await page.locator('#menu-toggle').click();
        assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
        assert.equal(await page.locator('#main-menu').isVisible(), true);
        assert(await page.locator('#main-menu a').first().evaluate(link => document.activeElement === link), 'Opening navigation must reach its first link');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#main-menu').isVisible(), false);
        assert(await page.locator('#menu-toggle').evaluate(button => document.activeElement === button));
      }
      await page.locator('#menu-toggle').click();
      await page.locator('#main-menu a[href="#competences"]').click();
      assert.equal(await page.locator('#main-menu').isVisible(), false);
      assert(await page.locator('#competences').evaluate(section => document.activeElement === section));
      await page.setViewportSize({ width: 1440, height: 1000 });
      assert.equal(await page.locator('#main-menu').isVisible(), true);
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
      await page.locator('#main-menu a').first().focus();
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator('#main-menu').isVisible(), false);
      assert(await page.locator('#menu-toggle').evaluate(button => document.activeElement === button), 'Collapsing navigation must not leave focus on a hidden link');
      await page.locator('#menu-toggle').click();
      await page.locator('.hero-bottom a').focus();
      assert.equal(await page.locator('#main-menu').isVisible(), false, 'Leaving the header by keyboard must close the disclosure');
      await page.setViewportSize({ width: 1440, height: 1000 });
    });

    await run('project filters match actual categories and preserve one selected control', async () => {
      const categories = await page.locator('[data-filter]').evaluateAll(buttons => buttons.map(button => button.dataset.filter));
      assert.deepEqual(categories, ['all', 'branding', 'communication', 'research']);
      for (const category of categories) {
        await page.locator(`[data-filter="${category}"]`).click();
        const mismatches = await page.locator('article.project-card[data-category]').evaluateAll((cards, category) => cards.filter(card => card.hidden === (category === 'all' || card.dataset.category.split(/\s+/).includes(category))).length, category);
        assert.equal(mismatches, 0);
        assert.equal(await page.locator('[data-filter][aria-pressed="true"]').count(), 1);
      }
      await page.locator('[data-filter="all"]').click();
    });

    await run('a project fragment reveals work hidden by the research filter', async () => {
      const targetId = await page.locator('article.project-card[data-category]').evaluateAll(cards => cards.find(card => !card.dataset.category.split(/\s+/).includes('research'))?.id);
      assert(targetId, 'The selection needs a project outside graphic exploration');
      await page.locator('[data-filter="research"]').click();
      assert.equal(await page.locator('#' + targetId).isVisible(), false);
      await page.evaluate(id => { location.hash = '#' + id; }, targetId);
      await page.locator('#' + targetId).waitFor({ state: 'visible' });
      assert.equal(await page.locator('[data-filter="all"]').getAttribute('aria-pressed'), 'true');
    });

    await run('four artwork previews reveal an accessible categorized gallery', async () => {
      const gallery = page.locator('[data-gallery]');
      assert.equal(await gallery.count(), 1);
      const teaser = gallery.locator('.gallery-teaser > [data-slide]');
      assert.equal(await teaser.count(), 4, 'Four selected artworks appear immediately');
      const more = gallery.locator('.gallery-more-button');
      assert.equal(await more.getAttribute('aria-expanded'), 'false');
      assert(await teaser.evaluateAll(tiles => tiles.every(tile => tile.getClientRects().length > 0)));
      await more.click();
      assert.equal(await more.getAttribute('aria-expanded'), 'true');
      const tiles = gallery.locator('.gallery-grid > [data-slide]');
      const total = await tiles.count();
      assert(total >= 50, 'Expanded gallery retains the original large selection');
      const originals = await tiles.evaluateAll(items =>
        items.map(item => item.querySelector('a[data-preview]').getAttribute('href')));
      assert(originals.every(url => url.startsWith('assets/') &&
        /[.](?:webp|png|jpg|jpeg)$/i.test(url)), 'Artwork URLs remain local');
      const visibleCount = () => tiles.evaluateAll(items =>
        items.filter(item => !item.hidden && item.getClientRects().length > 0).length);
      await gallery.locator('[data-gallery-category="mockups"]').click();
      const count = await visibleCount();
      assert(count > 0 && count < total, 'Mockups filter reduces the gallery');
      const misclassified = await tiles.evaluateAll(items =>
        items.filter(item => !item.hidden &&
          /Annieck/i.test(item.querySelector('.gallery-brand')?.textContent || '')).length);
      assert.equal(misclassified, 0, 'Anniecks product photos must not be mockups');
      await gallery.locator('[data-gallery-category="all"]').click();
      assert.equal(await visibleCount(), total);
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const index = Math.floor(total / 2);
        const trigger = tiles.nth(index).locator('a[data-preview]');
        await trigger.click();
        assert.equal(await page.locator('#preview-image').getAttribute('src'), originals[index]);
        await page.locator('#preview-next').click();
        const nextSrc = await page.locator('#preview-image').getAttribute('src');
        assert.notEqual(nextSrc, originals[index], 'Next moves to a different artwork');
        await page.keyboard.press('Escape');
        assert(await trigger.evaluate(link => document.activeElement === link),
          'Closing restores focus to the exact artwork');
      }
    });

    await run('Agorafrik photography and UTEX identity pages are published without the internal ESG deck', async () => {
      const ag = page.locator('#projet-agorafrik');
      const ut = page.locator('#projet-utex-empreinte');
      assert.equal(await ag.locator('[data-slide]').count(), 12);
      assert.equal(await ut.locator('[data-slide]').count(), 3);
      const paths = [
        'assets/projects/agorafrik-photo-p25.webp',
        'assets/projects/agorafrik-photo-p26.webp',
        'assets/projects/agorafrik-photo-p27.webp',
        'assets/projects/utex-empreinte-p01.webp',
        'assets/projects/utex-empreinte-p19.webp'
      ];
      for (const path of paths) {
        const img = page.locator('img[data-full-src="' + path + '"]').first();
        assert(await img.count(), 'Portfolio is missing artwork: ' + path);
        const ok = await img.evaluate(async image => {
          image.loading = 'eager';
          if (image.dataset.deferredSrc) { image.src = image.dataset.deferredSrc; delete image.dataset.deferredSrc; }
          try { await image.decode(); return image.naturalWidth > 0 && image.naturalHeight > 0; }
          catch { return false; }
        });
        assert(ok, 'Cannot decode artwork: ' + path);
      }
      assert.equal(await page.locator('a[href*="Revisé%20-%20ESG"], a[href*="DAG4l6UmPgY"]').count(), 0,
        'The complete confidential Canva deck must not be linked');
    });

    await run('project pages remain local, navigate within the project and restore focus', async () => {
      const carousel = page.locator('[data-slideshow]').filter({ has: page.locator('[data-slide]:nth-child(2)') }).first();
      const total = await carousel.locator('[data-slide]').count();
      assert(total > 1, 'A multipage project is required');
      await carousel.locator('[data-slide-next]').click();
      assert.match(await carousel.locator('[data-slide-count]').textContent(), new RegExp(`^2 sur ${total}$`));
      const trigger = carousel.locator('[data-slide]').nth(1).locator('a[data-preview]');
      const file = await trigger.getAttribute('href');
      assert(file.startsWith('assets/'), 'The primary link must stay in the portfolio');
      await trigger.click();
      assert.equal(await page.locator('#design-dialog').isVisible(), true);
      assert.equal(await page.locator('#preview-counter').textContent(), `2 sur ${total}`);
      const expected = await trigger.locator('img').getAttribute('data-full-src') || file;
      assert.equal(await page.locator('#preview-image').getAttribute('src'), expected);
      await page.locator('#preview-image').evaluate(image => image.decode());
      assert.equal(await page.locator('#preview-download').getAttribute('download'), expected.split('/').pop());
      await page.locator('#preview-prev').click();
      assert.equal(await page.locator('#preview-counter').textContent(), `1 sur ${total}`);
      await page.locator('#preview-prev').click();
      assert.equal(await page.locator('#preview-counter').textContent(), `${total} sur ${total}`);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#design-dialog').isVisible(), false);
      assert(await trigger.evaluate(async link => {
        for (let frame = 0; frame < 3 && document.activeElement !== link; frame++)
          await new Promise(requestAnimationFrame);
        return document.activeElement === link;
      }), 'Viewer focus must return to its original image link');
      assert.equal(await carousel.locator('[data-slide]').nth(1).getAttribute('aria-hidden'), 'false');
    });

    await run('calendars fill their cards and show complete images with optional actual-size zoom', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      const calendar = page.locator('#calendrier-mural a[data-preview]').first();
      assert(await calendar.count(), 'Wall calendar missing');
      const imageFit = await calendar.locator('img').evaluate(image => getComputedStyle(image).objectFit);
      assert.equal(imageFit, 'contain');
      await calendar.click();
      await page.locator('#preview-image').evaluate(image => image.decode());
      const fitted = await page.locator('#preview-image').evaluate(image => {
        const bounds = image.getBoundingClientRect();
        const frame = image.closest('.preview-media').getBoundingClientRect();
        return bounds.width <= frame.width + 1 && bounds.height <= frame.height + 1;
      });
      assert(fitted, 'The complete image must fit the available viewer area');
      await page.locator('#preview-zoom').click();
      assert.equal(await page.locator('#preview-zoom').getAttribute('aria-pressed'), 'true');
      const fullSize = await page.locator('#preview-image').evaluate(image => Math.abs(image.getBoundingClientRect().width - image.naturalWidth) < 1);
      assert(fullSize, 'Actual-size mode must retain original resolution');
      await page.locator('#preview-zoom').click();
      assert.equal(await page.locator('#preview-zoom').getAttribute('aria-pressed'), 'false');
      await page.locator('#preview-close').click();
    });

    await run('FR, EN and ES refresh the menu and open gallery without changing the selected image', async () => {
      const gallery = page.locator('[data-gallery]');
      const tile = gallery.locator('[data-slide]').nth(2);
      const trigger = tile.locator('a[data-preview]');
      const original = await trigger.getAttribute('href');
      const total = await gallery.locator('[data-slide]').count();
      await trigger.click();
      for (const [language, name, count, zoomText] of [['en', 'Gallery', 'of', 'View actual size'], ['es', 'Galería', 'de', 'Ver tamaño real'], ['fr', 'Galerie', 'sur', 'Afficher à taille réelle']]) {
        await page.evaluate(language => window.PortfolioI18n.setLanguage(language), language);
        assert.equal(await page.locator('html').getAttribute('lang'), language);
        assert.equal(await gallery.getAttribute('aria-label'), name);
        assert.equal(await page.locator('#preview-image').getAttribute('src'), original);
        assert.equal(await page.locator('#preview-image').getAttribute('alt'), await trigger.locator('img').getAttribute('data-alt-' + language));
        assert((await page.locator('#preview-title').textContent()).includes(await tile.locator('[data-slide-title]').getAttribute('data-' + language)));
        assert((await page.locator('#preview-counter').textContent()).endsWith(' ' + count + ' ' + total));
        assert.equal(await page.locator('#preview-zoom').textContent(), zoomText);
        assert(await page.locator('#main-menu a').evaluateAll((links, language) => links.length === 3 && links.every(link => link.textContent.trim() === link.getAttribute('data-' + language)), language));
      }
      await page.locator('#preview-close').click();
      assert(await trigger.evaluate(link => document.activeElement === link));
    });

    await run('without JavaScript, navigation and original image links remain available', async () => {
      const fallback = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
      try {
        const plain = await fallback.newPage();
        await plain.goto(baseURL, { waitUntil: 'domcontentloaded' });
        assert.equal(await plain.locator('#main-menu').isVisible(), true);
        const references = await plain.locator('a[data-preview]').evaluateAll(links => links.map(link => link.getAttribute('href')));
        assert(references.length > 4);
        assert(references.every(reference => reference.startsWith('assets/')), 'No preview should require Canva');
        const gallery = plain.locator('[data-gallery] .gallery-grid a[data-preview]');
        assert(await gallery.count() >= 50);
        assert(await gallery.evaluateAll(links => links.every(link => link.getClientRects().length > 0 && link.tabIndex >= 0 && !link.closest('[hidden], [inert], [aria-hidden="true"]'))), 'Every gallery original must remain reachable without JavaScript');
      } finally { await fallback.close(); }
    });
    await run('no uncaught browser errors', async () => assert.deepEqual(errors, []));
    await context.close();
    console.log(`${passed} browser acceptance checks passed; ${failed} failed.`);
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
}
