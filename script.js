(() => {
  'use strict';
  const langButton = document.getElementById('lang-toggle');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-category]')];
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

  langButton.addEventListener('click', () => setLanguage(language === 'fr' ? 'en' : 'fr'));
  filterButtons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  document.getElementById('year').textContent = String(new Date().getFullYear());
  setLanguage('fr');
})();
