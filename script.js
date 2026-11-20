/* The work remains readable without JavaScript. Enhancements keep each project
 * on this site; original Canva documents are optional, explicitly named links. */
(function () {
  'use strict';

  const messages = {
    menu: ['Menu', 'Menu', 'Menú'],
    closeMenu: ['Fermer', 'Close', 'Cerrar'],
    openMenuLabel: ['Ouvrir le menu', 'Open navigation', 'Abrir navegación'],
    closeMenuLabel: ['Fermer le menu', 'Close navigation', 'Cerrar navegación'],
    carousel: ['diaporama', 'slideshow', 'presentación'],
    slide: ['diapositive', 'slide', 'diapositiva'],
    previous: ['Page précédente', 'Previous page', 'Página anterior'],
    next: ['Page suivante', 'Next page', 'Página siguiente'],
    preview: ['Agrandir', 'Enlarge', 'Ampliar'],
    count: ['{current} sur {total}', '{current} of {total}', '{current} de {total}'],
    projectCount: ['{count} projets', '{count} projects', '{count} proyectos'],
    close: ['Fermer', 'Close', 'Cerrar'],
    zoom: ['Afficher à taille réelle', 'View actual size', 'Ver tamaño real'],
    fit: ['Ajuster à l’écran', 'Fit to screen', 'Ajustar a la pantalla'],
    zoomRegion: ['Image à taille réelle, défilement horizontal et vertical', 'Actual-size image, scroll horizontally and vertically', 'Imagen a tamaño real, desplazamiento horizontal y vertical'],
    download: ['Télécharger le visuel', 'Download artwork', 'Descargar diseño'],
    source: ['Approfondir sur Canva', 'Explore further on Canva', 'Ver más en Canva'],
    error: ['Ce visuel n’a pas pu se charger. Réessayez avec les flèches de navigation.', 'This image could not load. Try again using the navigation arrows.', 'No se pudo cargar esta imagen. Vuelve a intentarlo con las flechas de navegación.']
  };

  function init() {
    const all = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const locale = () => {
      const language = window.PortfolioI18n?.locale || document.documentElement.lang || 'fr';
      return ['fr', 'en', 'es'].includes(language) ? language : 'fr';
    };
    const text = (key, values = {}) => {
      const value = (messages[key] || [key, key, key])[['fr', 'en', 'es'].indexOf(locale())];
      return value.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
    };
    const frame = callback => typeof window.requestAnimationFrame === 'function'
      ? window.requestAnimationFrame(callback) : callback();
    const reducedMotion = () => typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Three ordinary navigation links, progressively collapsed on small screens. */
    const header = document.querySelector('.site-header');
    const menu = document.getElementById('main-menu');
    const menuToggle = document.getElementById('menu-toggle');
    const mobile = typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 700px)') : null;
    const onMobile = () => mobile ? mobile.matches : window.innerWidth <= 700;
    let menuOpen = false;

    function refreshMenu() {
      if (!menuToggle) return;
      const label = menuToggle.querySelector('[data-menu-label]');
      if (label) label.textContent = text(menuOpen ? 'closeMenu' : 'menu');
      menuToggle.setAttribute('aria-label', text(menuOpen ? 'closeMenuLabel' : 'openMenuLabel'));
      menuToggle.setAttribute('aria-expanded', String(menuOpen));
    }

    function setMenu(open, returnFocus = false) {
      if (!header || !menu || !menuToggle) return;
      const wasOpen = menuOpen;
      const focusWasInMenu = menu.contains(document.activeElement);
      menuOpen = Boolean(open && onMobile());
      header.classList.toggle('nav-open', menuOpen);
      refreshMenu();
      // The links precede the toggle in the source for the no-script layout.
      // Move into newly revealed navigation so keyboard users reach it too.
      if (menuOpen && !wasOpen) menu.querySelector('a[href^="#"]')?.focus({ preventScroll: true });
      else if (!menuOpen && onMobile() && (returnFocus || focusWasInMenu)) menuToggle.focus({ preventScroll: true });
    }

    if (header && menu && menuToggle) {
      menuToggle.hidden = false;
      menuToggle.addEventListener('click', () => setMenu(!menuOpen));
      all('a[href^="#"]', menu).forEach(link => link.addEventListener('click', () => {
        if (!menuOpen) return;
        setMenu(false);
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (target) {
          if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }));
      document.addEventListener('click', event => {
        if (menuOpen && !header.contains(event.target)) setMenu(false);
      });
      document.addEventListener('focusin', event => {
        if (menuOpen && !header.contains(event.target)) setMenu(false);
      });
      document.addEventListener('keydown', event => {
        if (menuOpen && event.key === 'Escape') {
          event.preventDefault();
          setMenu(false, true);
        }
      });
      if (mobile?.addEventListener) mobile.addEventListener('change', () => setMenu(false));
      else if (mobile?.addListener) mobile.addListener(() => setMenu(false));
      header.classList.add('navigation-enhanced');
      refreshMenu();
    }

    const projectButtons = all('[data-filter]');
    const projects = all('article.project-card[data-category]');
    const projectStatus = document.getElementById('project-status');
    const carousels = [];
    function announceProjects() {
      if (projectStatus) projectStatus.textContent = text('projectCount', { count: projects.filter(project => !project.hidden).length });
    }
    function filterProjects(category) {
      projectButtons.forEach(control => {
        const selected = control.dataset.filter === category;
        control.classList.toggle('active', selected);
        control.setAttribute('aria-pressed', String(selected));
      });
      projects.forEach(project => {
        project.hidden = category !== 'all' && !project.dataset.category.split(/\s+/).includes(category);
      });
      announceProjects();
      frame(() => carousels.forEach(carousel => {
        if (!carousel.root.closest('[hidden]')) carousel.go(carousel.index, false);
      }));
    }
    projectButtons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));

    // Competency links and browser history must still reach a project when a
    // previous category selection has hidden it. Retain native fragment links.
    function revealProject(hash, focus = false) {
      if (!hash || !hash.startsWith('#')) return null;
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return null; }
      const target = document.getElementById(id);
      const project = target?.closest('article.project-card[data-category]');
      if (!project) return null;
      const wasHidden = project.hidden;
      if (wasHidden) filterProjects('all');
      if (focus) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
      return { target, wasHidden };
    }
    all('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
      if ((event.button !== undefined && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      revealProject(link.getAttribute('href'), true);
    }));
    window.addEventListener('hashchange', () => {
      const revealed = revealProject(window.location?.hash);
      if (revealed?.wasHidden && typeof revealed.target.scrollIntoView === 'function') {
        revealed.target.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' });
      }
    });

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
    const zoom = document.getElementById('preview-zoom');
    const error = document.getElementById('preview-error');
    const media = dialog?.querySelector('.preview-media');
    const canPreview = Boolean(dialog && typeof dialog.showModal === 'function'
      && image && title && counter && caption && previous && next && close && error && media);
    let active = null;
    let current = 0;
    let opener = null;
    let zoomed = false;

    const slideTitle = entry => entry.slide.querySelector('[data-slide-title]')?.textContent.trim()
      || entry.image.alt || entry.carousel.name();
    const slideCaption = entry => entry.slide.querySelector('[data-slide-caption]')?.textContent.trim() || '';

    function localArtwork(entry) {
      return entry.image.dataset.fullSrc || entry.trigger.getAttribute('href') || entry.image.currentSrc || entry.image.src;
    }

    function setDownload(artworkUrl) {
      if (!download) return;
      try {
        const artwork = new URL(artworkUrl, document.baseURI);
        const assets = new URL('assets/', document.baseURI);
        const filename = decodeURIComponent(artwork.pathname.split('/').pop());
        if (/^https?:$/.test(artwork.protocol) && artwork.origin === assets.origin
            && artwork.pathname.startsWith(assets.pathname)
            && /^[a-z0-9][a-z0-9._-]*\.(?:webp|png|jpe?g)$/i.test(filename)) {
          download.href = artwork.href;
          download.setAttribute('download', filename);
          download.hidden = false;
          return;
        }
      } catch (_) { /* Invalid or remote URLs never become a download. */ }
      download.hidden = true;
      download.removeAttribute('href');
      download.removeAttribute('download');
    }

    function setSource(entry) {
      if (!source) return;
      const reference = entry.trigger.dataset.source;
      try {
        const url = new URL(reference);
        if (url.protocol === 'https:' && ['www.canva.com', 'canva.com'].includes(url.hostname)
            && /^\/design\/[A-Za-z0-9_-]+\/view\/?$/.test(url.pathname)) {
          source.href = url.href;
          source.hidden = false;
          return;
        }
      } catch (_) { /* A source link is optional; there is no invented fallback. */ }
      source.hidden = true;
      source.removeAttribute('href');
    }

    function refreshDialogLabels() {
      if (!canPreview) return;
      previous.setAttribute('aria-label', text('previous'));
      next.setAttribute('aria-label', text('next'));
      close.setAttribute('aria-label', text('close'));
      if (download) download.textContent = text('download');
      if (source) source.textContent = text('source');
      if (zoom) {
        zoom.textContent = text(zoomed ? 'fit' : 'zoom');
        zoom.setAttribute('aria-pressed', String(zoomed));
      }
      if (zoomed) media.setAttribute('aria-label', text('zoomRegion'));
      error.textContent = text('error');
    }

    function setZoom(enabled) {
      zoomed = Boolean(enabled);
      dialog.classList.toggle('is-zoomed', zoomed);
      if (zoomed) {
        media.setAttribute('tabindex', '0');
        media.setAttribute('role', 'region');
      } else {
        media.removeAttribute('tabindex');
        media.removeAttribute('role');
        media.removeAttribute('aria-label');
      }
      media.scrollLeft = 0;
      media.scrollTop = 0;
      refreshDialogLabels();
    }

    function renderPreview(changeImage = true) {
      const entry = active?.entries[current];
      if (!entry || !canPreview) return;
      const name = active.name();
      const detail = slideTitle(entry);
      const includesProject = detail === name || detail.startsWith(name + ' — ');
      title.textContent = name && !includesProject ? name + ' — ' + detail : detail;
      counter.textContent = text('count', { current: current + 1, total: active.entries.length });
      caption.textContent = slideCaption(entry);
      // The selected page's explanation replaces the old generic Canva warning.
      caption.removeAttribute('data-i18n');
      previous.disabled = next.disabled = active.entries.length < 2;
      previous.hidden = next.hidden = active.entries.length < 2;
      dialog.classList.toggle('single-image', active.entries.length < 2);
      setSource(entry);
      const artwork = localArtwork(entry);
      setDownload(artwork);
      image.alt = entry.image.alt;
      refreshDialogLabels();
      if (!changeImage) return;
      setZoom(false);
      const width = Number(entry.image.dataset.fullWidth) || Number(entry.image.getAttribute('width'));
      const height = Number(entry.image.dataset.fullHeight) || Number(entry.image.getAttribute('height'));
      if (width && height) { image.width = width; image.height = height; }
      image.removeAttribute('style');
      image.draggable = false;
      error.hidden = true;
      image.hidden = true;
      if (zoom) zoom.disabled = true;
      image.src = artwork;
      if (image.complete && image.naturalWidth > 0) {
        image.hidden = false;
        if (zoom) zoom.disabled = false;
      }
    }

    function openPreview(entry) {
      if (!canPreview || entry.carousel.root.closest('[hidden]')) return;
      active = entry.carousel;
      current = active.entries.indexOf(entry);
      if (current < 0) return;
      opener = entry.trigger;
      setMenu(false);
      renderPreview();
      if (!dialog.open) dialog.showModal();
      document.body.classList.add('preview-open');
      close.focus({ preventScroll: true });
    }

    function movePreview(direction) {
      if (!active || active.entries.length < 2) return;
      current = (current + direction + active.entries.length) % active.entries.length;
      active.go(active.entries[current].index, false);
      renderPreview();
    }

    /* Native horizontal scrolling and scroll snap provide touch interaction.
     * Buttons and keyboard controls select pages only within their own project. */
    all('[data-slideshow]').forEach(root => {
      const track = root.querySelector('.slide-track');
      const slides = track ? all('[data-slide]', track) : [];
      if (!track || !slides.length) return;
      const previousSlide = root.querySelector('[data-slide-prev]');
      const nextSlide = root.querySelector('[data-slide-next]');
      const count = root.querySelector('[data-slide-count]');
      const carousel = {
        root, track, slides, index: 0, entries: [],
        name: () => root.closest('.project-card')?.querySelector('h3')?.textContent.trim()
          || root.getAttribute('data-slideshow-title') || ''
      };
      root.classList.add('slideshow-enhanced');
      root.classList.toggle('single-slide', slides.length === 1);
      root.setAttribute('role', 'group');
      track.setAttribute('tabindex', slides.length > 1 ? '0' : '-1');
      if (count) { count.setAttribute('aria-live', 'polite'); count.setAttribute('aria-atomic', 'true'); }

      function refresh() {
        root.setAttribute('aria-roledescription', text('carousel'));
        if (carousel.name()) root.setAttribute('aria-label', carousel.name());
        if (previousSlide) { previousSlide.disabled = carousel.index === 0; previousSlide.setAttribute('aria-label', text('previous')); }
        if (nextSlide) { nextSlide.disabled = carousel.index === slides.length - 1; nextSlide.setAttribute('aria-label', text('next')); }
        const description = text('count', { current: carousel.index + 1, total: slides.length });
        if (count && count.textContent !== description) count.textContent = description;
        slides.forEach((slide, index) => {
          const selected = index === carousel.index;
          slide.setAttribute('role', 'group');
          slide.setAttribute('aria-roledescription', text('slide'));
          slide.setAttribute('aria-label', text('count', { current: index + 1, total: slides.length }));
          slide.classList.toggle('is-current', selected);
          slide.setAttribute('aria-hidden', String(!selected));
          if (selected) slide.removeAttribute('inert');
          else slide.setAttribute('inert', '');
        });
        carousel.entries.forEach(entry => entry.trigger.setAttribute('aria-label', text('preview') + ' — ' + slideTitle(entry)));
      }
      carousel.refresh = refresh;
      let navigationTarget = null;
      let settleTimer;
      function syncScroll() {
        if (root.closest('[hidden]')) return;
        const left = track.getBoundingClientRect().left;
        let nearest = 0;
        let distance = Infinity;
        slides.forEach((slide, index) => {
          const delta = Math.abs(slide.getBoundingClientRect().left - left);
          if (delta < distance) { distance = delta; nearest = index; }
        });
        if (navigationTarget !== null && nearest !== navigationTarget) return;
        if (nearest !== carousel.index) { carousel.index = nearest; refresh(); }
      }
      carousel.go = (index, smooth = true) => {
        carousel.index = Math.max(0, Math.min(slides.length - 1, index));
        refresh();
        if (root.closest('[hidden]')) return;
        const animate = smooth && !reducedMotion();
        navigationTarget = animate ? carousel.index : null;
        if (settleTimer) window.clearTimeout(settleTimer);
        if (animate) settleTimer = window.setTimeout(() => { navigationTarget = null; syncScroll(); }, 600);
        const left = track.scrollLeft + slides[carousel.index].getBoundingClientRect().left - track.getBoundingClientRect().left;
        if (typeof track.scrollTo === 'function') track.scrollTo({ left, behavior: animate ? 'smooth' : 'instant' });
        else track.scrollLeft = left;
      };

      slides.forEach((slide, index) => {
        const trigger = slide.querySelector('a[data-preview]');
        const artwork = trigger?.querySelector('img');
        if (!trigger || !artwork) return;
        const entry = { trigger, image: artwork, slide, index, carousel };
        carousel.entries.push(entry);
        if (!canPreview) return;
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', 'design-dialog');
        trigger.addEventListener('click', event => {
          if ((event.button !== undefined && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          openPreview(entry);
        });
      });
      previousSlide?.addEventListener('click', () => carousel.go(carousel.index - 1));
      nextSlide?.addEventListener('click', () => carousel.go(carousel.index + 1));
      track.addEventListener('keydown', event => {
        if (slides.length < 2 || event.altKey || event.ctrlKey || event.metaKey) return;
        let index;
        if (event.key === 'ArrowLeft') index = carousel.index - 1;
        if (event.key === 'ArrowRight') index = carousel.index + 1;
        if (event.key === 'Home') index = 0;
        if (event.key === 'End') index = slides.length - 1;
        if (index === undefined) return;
        event.preventDefault();
        track.focus({ preventScroll: true });
        carousel.go(index);
      });
      let scrollQueued = false;
      track.addEventListener('scroll', () => {
        if (scrollQueued) return;
        scrollQueued = true;
        frame(() => { scrollQueued = false; syncScroll(); });
      }, { passive: true });
      track.addEventListener('scrollend', () => { navigationTarget = null; syncScroll(); });
      track.addEventListener('pointerdown', () => { navigationTarget = null; }, { passive: true });
      carousels.push(carousel);
      refresh();
    });

    if (canPreview) {
      image.addEventListener('load', () => {
        image.hidden = false;
        error.hidden = true;
        if (zoom) zoom.disabled = false;
      });
      image.addEventListener('error', () => {
        image.hidden = true;
        error.hidden = false;
        if (download) download.hidden = true;
        if (zoom) zoom.disabled = true;
        setZoom(false);
      });
      previous.addEventListener('click', () => movePreview(-1));
      next.addEventListener('click', () => movePreview(1));
      close.addEventListener('click', () => dialog.close());
      zoom?.addEventListener('click', () => setZoom(!zoomed));
      dialog.addEventListener('keydown', event => {
        if (zoomed && (event.target === media || media.contains(event.target))) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          movePreview(event.key === 'ArrowLeft' ? -1 : 1);
        }
      });
      dialog.addEventListener('click', event => {
        const bounds = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
      });
      dialog.addEventListener('close', () => {
        document.body.classList.remove('preview-open');
        setZoom(false);
        if (active && opener && opener.isConnected && !opener.closest('[hidden]')) {
          const initial = active.entries.find(entry => entry.trigger === opener);
          if (initial) active.go(initial.index, false);
          opener.focus({ preventScroll: true });
        }
        active = null;
      });
      refreshDialogLabels();
    }

    let resizeQueued = false;
    window.addEventListener('resize', () => {
      if (!mobile && !onMobile()) setMenu(false);
      if (resizeQueued) return;
      resizeQueued = true;
      frame(() => {
        resizeQueued = false;
        carousels.forEach(carousel => {
          if (!carousel.root.closest('[hidden]')) carousel.go(carousel.index, false);
        });
      });
    });
    document.addEventListener('portfolio:languagechange', () => {
      refreshMenu();
      announceProjects();
      carousels.forEach(carousel => carousel.refresh());
      refreshDialogLabels();
      if (dialog?.open) renderPreview(false);
    });
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
    revealProject(window.location?.hash);
    announceProjects();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
