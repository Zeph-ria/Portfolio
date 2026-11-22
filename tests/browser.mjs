/**
 * End-to-end acceptance against the real portfolio and its selected files.
 * This suite does not install a browser or substitute a DOM mock for rendering.
 *
 * Run: node tests/browser.mjs
 * Optional PORTFOLIO_BASE_URL points to an authorised preview of this checkout.
 * Optional PORTFOLIO_BROWSER_EXECUTABLE selects an already available Chromium.
 * Without BASE_URL a temporary, read-only HTTP server serves the checkout.
 * Exit 2 means browser/server infrastructure was unavailable: no checks passed.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { imageDimensions } from './helpers/image.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.json': 'application/json' };
const languages = ['fr', 'en', 'es'];

async function localServer() {
  const instance = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
      if (!(await stat(file)).isFile()) { response.writeHead(404).end(); return; }
      response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      response.end(await readFile(file));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((done, reject) => { instance.once('error', reject); instance.listen(0, '127.0.0.1', done); });
  return instance;
}

async function main() {
  const content = JSON.parse(await readFile(resolve(root, 'content/projects.json'), 'utf8'));
  const captures = JSON.parse(await readFile(resolve(root, 'assets/sites/manifest.json'), 'utf8')).images;
  const groups = [
    ...content.projects.map(project => ({ type: 'project', id: project.id, name: project.name, slides: project.slides })),
    { type: 'gallery', name: 'Galerie', slides: content.gallery },
    ...content.calendars.map(calendar => ({ type: 'calendar', id: calendar.id, name: calendar.name.fr, slides: [calendar.slide] })),
    ...[...new Set(captures.map(capture => capture.project))].map(name => ({ type: 'website', name, slides: captures.filter(capture => capture.project === name) }))
  ];
  const expectedSlides = groups.flatMap(group => group.slides);
  assert(groups.length > 0 && expectedSlides.length > 0, 'No reviewed portfolio selection found');
  assert(content.gallery.length >= 50, 'The visual gallery must contain at least 50 selected images');
  const originals = new Map();
  for (const slide of expectedSlides) {
    assert.match(slide.path, /^assets\//, 'Selected artwork must be served by the portfolio');
    const file = resolve(root, slide.path);
    assert(file.startsWith(root + sep), 'Selected file leaves the checkout');
    if (!originals.has(slide.path)) {
      const bytes = await readFile(file);
      originals.set(slide.path, { ...imageDimensions(bytes), sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }

  let browser;
  let server;
  let baseURL = process.env.PORTFOLIO_BASE_URL;
  try {
    const { chromium } = require('playwright');
    browser = await chromium.launch({ headless: true, ...(process.env.PORTFOLIO_BROWSER_EXECUTABLE ? { executablePath: process.env.PORTFOLIO_BROWSER_EXECUTABLE } : {}) });
    if (!baseURL) {
      server = await localServer();
      baseURL = `http://127.0.0.1:${server.address().port}/`;
    }
  } catch (error) {
    console.error(`BROWSER QA UNAVAILABLE — no browser acceptance checks ran.\n${error.message}`);
    if (browser) await browser.close();
    if (server) await new Promise(done => server.close(done));
    process.exitCode = 2;
    return;
  }

  let passed = 0;
  let failed = 0;
  let decoded = 0;
  const pageErrors = new Set();
  const resourceFailures = new Set();
  const origin = new URL(baseURL).origin;
  const groupElement = (page, group) => group.type === 'gallery' ? page.locator('[data-gallery]') : group.type === 'website'
    ? page.locator('.website-card').filter({ has: page.getByRole('heading', { name: group.name, exact: true }) }).locator('[data-slideshow]')
    : page.locator(group.type === 'project' ? `[data-project="${group.id}"] [data-slideshow]` : `#calendrier-${group.id} [data-slideshow]`);
  const urlFor = path => new URL(path, baseURL).href;

  async function run(name, action, options = {}) {
    let context;
    try {
      context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true, ...options });
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      page.on('pageerror', error => pageErrors.add(error.message));
      page.on('response', response => {
        if (new URL(response.url()).origin === origin && response.status() >= 400) resourceFailures.add(`${response.status()} ${response.url()}`);
      });
      page.on('requestfailed', request => {
        // Closing a scenario may cancel lazy requests; that is not an asset error.
        if (new URL(request.url()).origin === origin && request.failure()?.errorText !== 'net::ERR_ABORTED') resourceFailures.add(`${request.failure()?.errorText} ${request.url()}`);
      });
      await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
      await action(page, context);
      passed++;
      console.log(`PASS ${name}`);
    } catch (error) {
      failed++;
      console.error(`FAIL ${name}\n${error.stack ?? error}`);
    } finally { if (context) await context.close(); }
  }

  async function closePreview(page) {
    if (await page.locator('#design-dialog').evaluate(dialog => dialog.open)) await page.locator('#preview-close').click();
  }

  async function settleFonts(page) {
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(done => setTimeout(done, 5000))]));
  }

  async function decodePreview(page) {
    await page.locator('#preview-image').evaluate(async image => {
      let timeout;
      try {
        await Promise.race([image.decode(), new Promise((_, reject) => {
          timeout = setTimeout(() => reject(new Error('The original artwork did not decode within 12 seconds')), 12000);
        })]);
      } finally { clearTimeout(timeout); }
    });
  }

  async function openFirst(page, group) {
    const element = groupElement(page, group);
    const trigger = element.locator('[data-slide]').first().locator('a[data-preview]');
    await trigger.click();
    assert.equal(await page.locator('#design-dialog').evaluate(dialog => dialog.open), true, `${group.name}: viewer did not open`);
    return trigger;
  }

  try {
    await run('approved typography, burgundy and selected project structure remain intact', async page => {
      await settleFonts(page);
      const style = await page.evaluate(() => ({
        wremenaLoaded: [...document.fonts].some(face => face.family.replace(/["']/g, '') === 'Wremena' && face.status === 'loaded'),
        heading: getComputedStyle(document.querySelector('h1')).fontFamily,
        headingSize: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
        burgundy: getComputedStyle(document.querySelector('.feature')).backgroundColor,
        body: getComputedStyle(document.body).fontFamily
      }));
      assert(style.wremenaLoaded, 'The actual Wremena font file did not load');
      assert.match(style.heading, /^Wremena(?:,|$)/);
      assert.match(style.body, /DM Sans/);
      assert(Math.abs(style.headingSize - 148.32) < 0.1, 'Approved hero sizing changed at 1440px');
      assert.equal(style.burgundy, 'rgb(101, 41, 54)');
      assert.deepEqual(await page.locator('article.project-card[data-project]').evaluateAll(cards => cards.map(card => card.dataset.project)), content.projects.map(project => project.id));
      assert.equal(await page.locator('[data-slideshow]').count(), groups.filter(group => group.type !== 'gallery').length);
      assert.equal(await page.locator('[data-gallery]').count(), 1);
      assert.equal(await page.locator('a[data-preview]').count(), expectedSlides.length);
      assert.equal(await page.locator('.featured-project, .project-insight, .case-study').count(), 0, 'The public presentation must remain visual and concise');
    });

    await run('every selected artwork opens locally at full definition and stays within its collection', async (page, context) => {
      const portfolioURL = page.url();
      for (const group of groups) {
        const element = groupElement(page, group);
        assert.equal(await element.count(), 1, `${group.name}: missing or duplicated sequence`);
        assert.equal(await element.locator('[data-slide]').count(), group.slides.length, `${group.name}: missing selected pages`);
        const trigger = await openFirst(page, group);
        try {
          for (const [index, slide] of group.slides.entries()) {
            if (index) await page.locator('#preview-next').click();
            await decodePreview(page);
            const image = await page.locator('#preview-image').evaluate(image => ({ src: image.src, width: image.naturalWidth, height: image.naturalHeight }));
            assert.equal(image.src, urlFor(slide.path), `${group.name} / page ${index + 1}: wrong original`);
            const expected = originals.get(slide.path);
            assert.deepEqual({ width: image.width, height: image.height }, { width: expected.width, height: expected.height });
            assert.equal(await page.locator('#preview-counter').textContent(), `${index + 1} sur ${group.slides.length}`);
            const caption = element.locator('[data-slide]').nth(index).locator('[data-slide-caption]');
            const expectedCaption = await caption.count() ? (await caption.textContent()).trim() : '';
            assert.equal(await page.locator('#preview-caption').textContent(), expectedCaption, 'Optional captions must not acquire replacement text');
            assert.equal(await page.locator('#preview-download').getAttribute('href'), image.src);
            assert.equal(await page.locator('#preview-document').isVisible(), false, 'Public artwork must not expose a complete source document');
            assert.equal(await page.locator('#preview-document').getAttribute('href'), null);
            decoded++;
          }
          if (group.slides.length > 1) {
            await page.locator('#preview-next').click();
            assert.equal(await page.locator('#preview-image').getAttribute('src'), group.slides[0].path, 'Next must wrap inside the same project');
          }
          assert.equal(context.pages().length, 1, 'Previewing artwork opened an external tab');
          assert.equal(page.url(), portfolioURL, 'Previewing artwork left the portfolio');
          await page.keyboard.press('Escape');
          assert(await trigger.evaluate(link => document.activeElement === link), 'The opener did not regain focus');
        } finally { await closePreview(page); }
      }
      assert.equal(decoded, expectedSlides.length);
    });

    await run('mobile navigation fits, reaches its links and closes without losing keyboard focus', async page => {
      assert.deepEqual(await page.locator('#main-menu a').evaluateAll(links => links.map(link => link.getAttribute('href'))), ['#realisations', '#competences', '#contact']);
      assert.equal(await page.locator('#menu-toggle').isVisible(), false);
      for (const width of [320, 390, 700]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(await page.locator('#main-menu').isVisible(), false);
        assert((await page.locator('.site-header').boundingBox()).height <= 100, `Mobile header takes too much space at ${width}px`);
        await page.locator('#menu-toggle').click();
        assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
        assert(await page.locator('#main-menu a').first().evaluate(link => document.activeElement === link));
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#main-menu').isVisible(), false);
        assert(await page.locator('#menu-toggle').evaluate(button => document.activeElement === button));
      }
      await page.locator('#menu-toggle').click();
      await page.locator('#main-menu a[href="#competences"]').click();
      assert.equal(await page.locator('#main-menu').isVisible(), false);
      assert(await page.locator('#competences').evaluate(section => document.activeElement === section));
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.locator('#main-menu a').first().focus();
      await page.setViewportSize({ width: 390, height: 844 });
      assert(await page.locator('#menu-toggle').evaluate(button => document.activeElement === button), 'Resizing left focus on a hidden link');
      await page.locator('#menu-toggle').click();
      await page.locator('.hero-bottom a').focus();
      assert.equal(await page.locator('#main-menu').isVisible(), false, 'Menu remains open after keyboard focus leaves the header');
    });

    await run('filters show the right work and direct project URLs reveal a hidden project', async page => {
      const categories = await page.locator('[data-filter]').evaluateAll(buttons => buttons.map(button => button.dataset.filter));
      assert.deepEqual(categories, ['all', 'branding', 'communication', 'research']);
      for (const category of categories) {
        await page.locator(`[data-filter="${category}"]`).click();
        const expected = content.projects.filter(project => category === 'all' || project.categories.includes(category)).map(project => project.id);
        assert.deepEqual(await page.locator('article.project-card[data-project]:visible').evaluateAll(cards => cards.map(card => card.dataset.project)), expected);
        assert.equal(await page.locator('[data-filter][aria-pressed="true"]').count(), 1);
        assert.equal(await page.locator('#project-status').textContent(), `${expected.length} projets`);
      }
      let pair;
      for (const project of content.projects) {
        const category = categories.find(category => category !== 'all' && !project.categories.includes(category));
        if (category) { pair = { project, category }; break; }
      }
      assert(pair, 'The selection needs a project outside a category');
      const target = page.locator(`#projet-${pair.project.id}`);
      await page.locator(`[data-filter="${pair.category}"]`).click();
      assert.equal(await target.isVisible(), false);
      await page.evaluate(() => { location.hash = '#apropos'; });
      await page.evaluate(id => { location.hash = '#projet-' + id; }, pair.project.id);
      await target.waitFor({ state: 'visible' });
      assert.equal(await page.locator('[data-filter="all"]').getAttribute('aria-pressed'), 'true');
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await target.isVisible(), true, 'A direct project URL lost its destination');
    });

    await run('FR, EN and ES persist and translate both the page and an already open viewer', async page => {
      const group = groups.find(group => group.type === 'project');
      const first = group.slides[0];
      for (const language of languages) {
        await page.locator('#language-select').selectOption(language);
        assert.equal(await page.locator('html').getAttribute('lang'), language);
        assert.equal(await page.evaluate(() => localStorage.getItem('gtk-lang')), language);
        assert.equal(await groupElement(page, group).locator('[data-slide-title]').first().textContent(), first.title[language]);
        assert((await page.locator('meta[name="description"]').getAttribute('content')).length > 30);
        await page.reload({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('#language-select').inputValue(), language);
      }
      await page.locator('#language-select').selectOption('fr');
      const trigger = await openFirst(page, group);
      try {
        const actions = { fr: 'Télécharger le visuel', en: 'Download artwork', es: 'Descargar diseño' };
        for (const language of languages) {
          // The public language controller also supports updates while the native
          // modal makes the underlying select intentionally inert.
          await page.evaluate(language => window.PortfolioI18n.setLanguage(language), language);
          assert((await page.locator('#preview-title').textContent()).includes(first.title[language]));
          const caption = groupElement(page, group).locator('[data-slide]').first().locator('[data-slide-caption]');
          const expectedCaption = await caption.count() ? (await caption.getAttribute('data-' + language)).trim() : '';
          assert.equal(await page.locator('#preview-caption').textContent(), expectedCaption);
          assert.equal(await page.locator('#preview-image').getAttribute('alt'), await trigger.locator('img').getAttribute('alt'));
          assert.equal(await page.locator('#preview-download').textContent(), actions[language]);
          assert.deepEqual(await page.evaluate(() => window.PortfolioI18n.diagnostics), []);
        }
      } finally { await closePreview(page); }
    });

    await run('calendar previews fill their frames and open complete images with readable zoom', async page => {
      await page.setViewportSize({ width: 390, height: 844 });
      for (const group of groups.filter(group => group.type === 'calendar')) {
        const trigger = groupElement(page, group).locator('a[data-preview]');
        const fill = await trigger.evaluate(link => {
          const frame = link.getBoundingClientRect();
          const image = link.querySelector('img');
          const bounds = image.getBoundingClientRect();
          return { fit: getComputedStyle(image).objectFit, width: Math.abs(bounds.width - frame.width), height: Math.abs(bounds.height - frame.height) };
        });
        assert.equal(fill.fit, 'cover');
        assert(fill.width <= 1 && fill.height <= 1, `${group.name}: preview does not fill its frame`);
        await trigger.click();
        try {
          await decodePreview(page);
          for (const language of languages) {
            await page.evaluate(language => window.PortfolioI18n.setLanguage(language), language);
            const layout = await page.locator('#design-dialog').evaluate(dialog => {
              const image = dialog.querySelector('#preview-image');
              const box = image.getBoundingClientRect();
              const media = image.closest('.preview-media').getBoundingClientRect();
              const bounds = dialog.getBoundingClientRect();
              const actions = [...dialog.querySelectorAll('button, .preview-actions a')].filter(item => item.getClientRects().length);
              return {
                fit: getComputedStyle(image).objectFit,
                inside: box.left >= media.left - 1 && box.right <= media.right + 1 && box.top >= media.top - 1 && box.bottom <= media.bottom + 1,
                ratioError: Math.abs(box.width / box.height - image.naturalWidth / image.naturalHeight),
                size: Math.min(box.width, box.height),
                clippedActions: actions.filter(item => { const r = item.getBoundingClientRect(); return r.left < bounds.left - 1 || r.right > bounds.right + 1 || r.top < bounds.top - 1 || r.bottom > bounds.bottom + 1 || r.height < 44; }).map(item => item.id),
                overflow: dialog.scrollWidth > dialog.clientWidth + 1
              };
            });
            assert.equal(layout.fit, 'contain');
            assert(layout.inside && layout.size > 0 && layout.ratioError < 0.02, `${group.name}/${language}: full artwork is cropped or distorted`);
            assert.deepEqual(layout.clippedActions, [], `${group.name}/${language}: viewer actions clipped`);
            assert.equal(layout.overflow, false);
          }
          await page.locator('#preview-zoom').click();
          assert.equal(await page.locator('#preview-zoom').getAttribute('aria-pressed'), 'true');
          assert(await page.locator('#preview-image').evaluate(image => Math.abs(image.getBoundingClientRect().width - image.naturalWidth) < 1), 'Zoom does not expose original detail');
          const media = page.locator('.preview-media');
          assert(await media.evaluate(element => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight), 'Actual-size artwork cannot be panned');
          await media.focus();
          const before = await page.locator('#preview-image').getAttribute('src');
          await page.keyboard.press('ArrowRight');
          assert.equal(await page.locator('#preview-image').getAttribute('src'), before, 'Panning zoomed artwork changed pages');
          await page.locator('#preview-zoom').click();
          assert.equal(await page.locator('#preview-zoom').getAttribute('aria-pressed'), 'false');
          for (let step = 0; step < 8; step++) {
            await page.keyboard.press('Tab');
            assert(await page.locator('#design-dialog').evaluate(dialog => dialog.contains(document.activeElement)), 'Focus escaped the native modal');
          }
        } finally { await closePreview(page); }
      }
    });

    await run('a local download preserves the displayed original byte for byte', async page => {
      const group = groups.find(group => group.slides.some(slide => slide.path.endsWith('.png'))) || groups[0];
      const selectedIndex = Math.max(0, group.slides.findIndex(slide => slide.path.endsWith('.png')));
      const selected = group.slides[selectedIndex];
      await openFirst(page, group);
      try {
        for (let index = 0; index < selectedIndex; index++) await page.locator('#preview-next').click();
        await decodePreview(page);
        const link = page.locator('#preview-download');
        assert.equal(await link.getAttribute('href'), urlFor(selected.path));
        const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
        assert.equal(download.suggestedFilename(), selected.path.split('/').pop());
        assert.equal(download.url(), urlFor(selected.path));
        assert.equal(await download.failure(), null);
        const destination = await download.path();
        assert(destination, 'No downloaded file was saved by the browser');
        const bytes = await readFile(destination);
        assert.equal(createHash('sha256').update(bytes).digest('hex'), originals.get(selected.path).sha256, 'Download altered the original file');
        assert.equal(await page.locator('#design-dialog').evaluate(dialog => dialog.open), true);
      } finally { await closePreview(page); }
    });

    await run('all languages retain unclipped page headings and controls across mobile and desktop widths', async page => {
      for (const language of languages) {
        await page.locator('#language-select').selectOption(language);
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          await settleFonts(page);
          const result = await page.evaluate(() => {
            const width = document.documentElement.clientWidth;
            const items = [...document.querySelectorAll('h1,h2,h3,.hero h1>span,.main-nav a,.header-actions,.filters,.slide-controls,.is-current [data-slide-title]')];
            const clipped = items.filter(element => {
              if (!element.getClientRects().length || element.closest('[aria-hidden="true"]')) return false;
              const rect = element.getBoundingClientRect();
              return rect.left < -1 || rect.right > width + 1 || (element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 2);
            }).map(element => element.textContent.trim().slice(0, 90));
            return { overflow: document.documentElement.scrollWidth > width + 1, clipped };
          });
          assert.equal(result.overflow, false, `${width}px/${language}: page scrolls sideways`);
          assert.deepEqual(result.clipped, [], `${width}px/${language}: heading or controls are clipped`);
        }
      }
    });

    await run('without JavaScript, navigation and every original artwork remain available locally', async page => {
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator('#main-menu').isVisible(), true);
      assert.equal(await page.locator('#menu-toggle').isVisible(), false);
      assert.equal(await page.locator('#design-dialog').isVisible(), false);
      const references = await page.locator('a[data-preview]').evaluateAll(links => links.map(link => link.getAttribute('href')));
      assert.deepEqual(references, expectedSlides.map(slide => slide.path));
      assert(await page.locator('[data-gallery] .gallery-grid a[data-preview]').evaluateAll(links => links.length >= 50 && links.every(link => link.getClientRects().length > 0 && link.tabIndex >= 0 && !link.closest('[hidden], [inert], [aria-hidden="true"]'))), 'Gallery originals must remain accessible without JavaScript');
      const first = page.locator('a[data-preview]').first();
      await first.click();
      assert.equal(page.url(), urlFor(expectedSlides[0].path), 'No-script reading requires an external application');
    }, { javaScriptEnabled: false });

    // Runtime and asset errors are collected from all the preceding journeys.
    if (pageErrors.size || resourceFailures.size) {
      failed++;
      console.error(`FAIL no uncaught errors or failed local resources\n${JSON.stringify({ pageErrors: [...pageErrors], resourceFailures: [...resourceFailures] }, null, 2)}`);
    } else {
      passed++;
      console.log('PASS no uncaught errors or failed local resources');
    }
    console.log(`Browser acceptance: ${passed} passed, ${failed} failed. Decoded selected pages: ${decoded}/${expectedSlides.length}.`);
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
    if (server) await new Promise(done => server.close(done));
  }
}

main().catch(error => { console.error(`FAIL browser acceptance setup\n${error.stack ?? error}`); process.exitCode = 1; });
