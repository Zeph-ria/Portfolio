(() => {
  'use strict';
  const langButton = document.getElementById('lang-toggle');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-category]')];
  const designFilters = [...document.querySelectorAll('[data-design-filter]')];
  const designs = [...document.querySelectorAll('[data-design-category]')];
  let language = 'fr';

  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'fr';
    document.documentElement.lang = language;
    document.querySelectorAll('[data-fr][data-en]').forEach(element => {
      const value = element.dataset[language];
      if (value.includes('<em>') || value.includes('<br>')) {
        // Both translations are literal, reviewed editorial content in this file.
        element.innerHTML = value;
      } else {
        element.textContent = value;
      }
    });
    langButton.textContent = language === 'fr' ? 'EN' : 'FR';
    langButton.setAttribute('aria-label', language === 'fr' ? 'Switch to English' : 'Passer en français');
    document.querySelector('.filters').setAttribute('aria-label', language === 'fr' ? 'Filtrer les projets' : 'Filter projects');
    document.querySelector('.design-filters').setAttribute('aria-label', language === 'fr' ? 'Filtrer la galerie' : 'Filter gallery');
  }

  function filterProjects(category) {
    filterButtons.forEach(button => {
      const selected = button.dataset.filter === category;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    projects.forEach(project => {
      project.hidden = category !== 'all' && !project.dataset.category.split(' ').includes(category);
    });
  }

  function filterDesigns(category) {
    designFilters.forEach(button => {
      const selected = button.dataset.designFilter === category;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    designs.forEach(design => {
      design.hidden = category !== 'all' && !design.dataset.designCategory.split(' ').includes(category);
    });
    document.querySelector('.gallery-series').hidden = category !== 'all' && category !== 'print';
  }

  langButton.addEventListener('click', () => setLanguage(language === 'fr' ? 'en' : 'fr'));
  filterButtons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  designFilters.forEach(button => button.addEventListener('click', () => filterDesigns(button.dataset.designFilter)));
  document.getElementById('year').textContent = String(new Date().getFullYear());
  setLanguage('fr');
})();
