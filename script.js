/* Progressive enhancement: the portfolio and source links work without JavaScript. */
(function () {
  'use strict';

  function init() {
    const all = selector => Array.from(document.querySelectorAll(selector));
    const text = (key, values = {}) => window.PortfolioI18n
      ? window.PortfolioI18n.t(key, values)
      : ({
          preview: 'Agrandir la création', count: '{current} sur {total}', itemCount: '{count} créations',
          assetCaption: 'Aperçu de la création. Le document source peut nécessiter une connexion à Canva.',
          thumbnailCaption: 'Miniature disponible. Le document source peut nécessiter une connexion à Canva.'
        }[key] || key)
        .replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
    const projectButtons = all('[data-filter]');
    const projects = all('[data-category]');
    const designButtons = all('[data-design-filter]');
    const designs = all('[data-design-category]');
    const groups = all('.design-grid');
    const projectStatus = document.getElementById('project-status');
    const designStatus = document.getElementById('design-status');
    const galleryCase = document.querySelector('.gallery-case');

    function announce() {
      if (projectStatus) projectStatus.textContent = text('itemCount', { count: projects.filter(item => !item.hidden).length });
      if (designStatus) designStatus.textContent = text('itemCount', { count: designs.filter(item => !item.hidden).length });
    }

    function filter(category, buttons, items, buttonKey, itemKey) {
      buttons.forEach(button => {
        const selected = button.dataset[buttonKey] === category;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      items.forEach(item => {
        item.hidden = category !== 'all' && !item.dataset[itemKey].split(/\s+/).includes(category);
      });
      announce();
    }

    projectButtons.forEach(button => button.addEventListener('click', () => {
      filter(button.dataset.filter, projectButtons, projects, 'filter', 'category');
    }));
    designButtons.forEach(button => button.addEventListener('click', () => {
      const category = button.dataset.designFilter;
      filter(category, designButtons, designs, 'designFilter', 'designCategory');
      groups.forEach(group => {
        const isEmpty = !Array.from(group.querySelectorAll('[data-design-category]')).some(item => !item.hidden);
        group.hidden = isEmpty;
        const heading = group.previousElementSibling;
        if (heading && heading.classList.contains('gallery-series')) heading.hidden = isEmpty;
      });
      if (galleryCase) galleryCase.hidden = !['all', 'branding', 'digital'].includes(category);
    }));

    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    const dialog = document.getElementById('design-dialog');
    const image = document.getElementById('preview-image');
    const title = document.getElementById('preview-title');
    const counter = document.getElementById('preview-counter');
    const caption = document.getElementById('preview-caption');
    const source = document.getElementById('preview-document');
    const download = document.getElementById('preview-download');
    const previous = document.getElementById('preview-prev');
    const next = document.getElementById('preview-next');
    const close = document.getElementById('preview-close');
    const error = document.getElementById('preview-error');
    const entries = [];
    let active = [];
    let current = 0;
    let opener = null;

    function entryTitle(entry) {
      if (entry.group === 'project') return entry.trigger.closest('.project-card').querySelector('h3').textContent.trim();
      return (entry.trigger.querySelector('b') || entry.trigger.querySelector(':scope > span')).textContent.replace(/↗/g, '').trim();
    }

    function refreshLabels() {
      entries.forEach(entry => entry.trigger.setAttribute('aria-label', text('preview') + ' — ' + entryTitle(entry)));
      announce();
      if (dialog && dialog.open) renderPreview(false);
    }

    function updateDownload(artworkUrl) {
      if (!download) return;
      try {
        const artwork = new URL(artworkUrl, document.baseURI);
        const assets = new URL('assets/', document.baseURI);
        const filename = decodeURIComponent(artwork.pathname.split('/').pop());
        // Download only the displayed file served by this portfolio. A remote
        // image or source document must never silently become a download link.
        if (/^https?:$/.test(artwork.protocol) && artwork.origin === assets.origin &&
            artwork.pathname.startsWith(assets.pathname) && /^[a-z0-9][a-z0-9._-]*\.(?:webp|png)$/i.test(filename)) {
          download.href = artwork.href;
          download.setAttribute('download', filename);
          download.hidden = false;
          return;
        }
      } catch (_) {
        // A malformed or unsupported source keeps the optional link unavailable.
      }
      download.hidden = true;
      download.removeAttribute('href');
      download.removeAttribute('download');
    }

    function renderPreview(changeImage = true) {
      const entry = active[current];
      if (!entry) return;
      title.textContent = entryTitle(entry);
      counter.textContent = text('count', { current: current + 1, total: active.length });
      if (caption) {
        const captionKey = entry.image.dataset.assetQuality === 'canva-preview' ? 'thumbnailCaption' : 'assetCaption';
        caption.setAttribute('data-i18n', captionKey);
        caption.textContent = text(captionKey);
      }
      source.href = entry.href;
      // Grid images may be lightweight derivatives. Always preview and download
      // the explicit original when one exists; retain the normal image fallback.
      const artworkUrl = entry.image.dataset.fullSrc || entry.image.currentSrc || entry.image.src;
      updateDownload(artworkUrl);
      image.alt = entry.image.alt;
      previous.disabled = next.disabled = active.length < 2;
      if (!changeImage) return;
      const width = Number(entry.image.dataset.fullWidth) || Number(entry.image.getAttribute('width')) || entry.image.naturalWidth;
      const height = Number(entry.image.dataset.fullHeight) || Number(entry.image.getAttribute('height')) || entry.image.naturalHeight;
      if (width && height) {
        image.width = width;
        image.height = height;
        image.style.maxWidth = width + 'px';
      }
      error.hidden = true;
      image.hidden = true;
      image.src = artworkUrl;
      if (image.complete) {
        image.hidden = image.naturalWidth === 0;
        error.hidden = image.naturalWidth !== 0;
      }
    }

    function openPreview(entry) {
      active = entries.filter(item => item.group === entry.group && !item.trigger.closest('[hidden]'));
      current = active.indexOf(entry);
      if (current < 0) return;
      opener = entry.trigger;
      renderPreview();
      dialog.showModal();
      document.body.classList.add('preview-open');
      close.focus({ preventScroll: true });
    }

    function movePreview(direction) {
      if (!active.length) return;
      current = (current + direction + active.length) % active.length;
      renderPreview();
    }

    if (dialog && typeof dialog.showModal === 'function') {
      all('.design-tile, .archive-item').forEach(trigger => {
        const artwork = trigger.querySelector('img');
        if (!artwork) return;
        const entry = { trigger, image: artwork, href: trigger.href, group: trigger.classList.contains('design-tile') ? 'gallery' : 'archive' };
        entries.push(entry);
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', 'design-dialog');
        trigger.addEventListener('click', event => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          openPreview(entry);
        });
      });
      projects.forEach(project => {
        const artwork = project.querySelector('.real-artwork');
        const link = project.querySelector('a[href^="https://www.canva.com/"]');
        if (!artwork || !link) return;
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'artwork-preview';
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', 'design-dialog');
        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '+';
        trigger.appendChild(icon);
        artwork.parentElement.appendChild(trigger);
        const entry = { trigger, image: artwork, href: link.href, group: 'project' };
        entries.push(entry);
        trigger.addEventListener('click', () => openPreview(entry));
      });
      image.addEventListener('load', () => { image.hidden = false; error.hidden = true; });
      image.addEventListener('error', () => { image.hidden = true; error.hidden = false; });
      previous.addEventListener('click', () => movePreview(-1));
      next.addEventListener('click', () => movePreview(1));
      close.addEventListener('click', () => dialog.close());
      dialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          movePreview(event.key === 'ArrowLeft' ? -1 : 1);
        }
      });
      dialog.addEventListener('click', event => {
        const bounds = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
      });
      dialog.addEventListener('close', () => {
        document.body.classList.remove('preview-open');
        if (opener && opener.isConnected && !opener.closest('[hidden]')) opener.focus({ preventScroll: true });
      });
    }
    document.addEventListener('portfolio:languagechange', refreshLabels);
    refreshLabels();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
