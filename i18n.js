/* Gloria portfolio — complete, dependency-free interface localization.
 * Artwork and linked documents keep their original language; only the interface
 * is translated. New copy must provide FR, EN and ES before release.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    const boot = () => {
      const controller = api.createController({ document: root.document, window: root });
      root.PortfolioI18n = controller;
      controller.init();
    };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  }
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const LOCALES = Object.freeze(['fr', 'en', 'es']);
  const STORAGE_KEY = 'gtk-lang';
  const DEFAULT_LOCALE = 'fr';
  const isLocale = value => LOCALES.includes(value);
  const triple = (fr, en, es) => Object.freeze({ fr, en, es });

  const UI = Object.freeze({
    language: triple('Choisir la langue', 'Choose a language', 'Elegir idioma'),
    preview: triple('Agrandir la création', 'Enlarge design', 'Ampliar diseño'),
    close: triple('Fermer', 'Close', 'Cerrar'),
    previous: triple('Précédent', 'Previous', 'Anterior'),
    next: triple('Suivant', 'Next', 'Siguiente'),
    viewDocument: triple('Consulter le document', 'View document', 'Consultar documento'),
    downloadArtwork: triple('Télécharger le visuel', 'Download artwork', 'Descargar diseño'),
    assetCaption: triple('Aperçu de la création. Le document source peut nécessiter une connexion à Canva.', 'Design preview. The source document may require a Canva login.', 'Vista previa del diseño. El documento original puede requerir iniciar sesión en Canva.'),
    thumbnailCaption: triple('Miniature disponible. Le document source peut nécessiter une connexion à Canva.', 'Thumbnail available. The source document may require a Canva login.', 'Miniatura disponible. El documento original puede requerir iniciar sesión en Canva.'),
    loading: triple('Chargement de la création…', 'Loading design…', 'Cargando diseño…'),
    error: triple('Impossible de charger cet aperçu. Vous pouvez consulter le document source.', 'This preview could not be loaded. You can open the source document.', 'No se pudo cargar esta vista previa. Puedes consultar el documento original.'),
    count: triple('{current} sur {total}', '{current} of {total}', '{current} de {total}'),
    itemCount: triple('{count} créations', '{count} designs', '{count} diseños'),
    noResults: triple('Aucune création dans cette catégorie.', 'No designs in this category.', 'No hay diseños en esta categoría.'),
    all: triple('Tout voir', 'View all', 'Ver todo'),
    print: triple('Édition & print', 'Editorial & print', 'Edición e impresión'),
    branding: triple('Identités', 'Identities', 'Identidades'),
    digital: triple('Communication', 'Communication', 'Comunicación'),
    academy: triple('Kadea Academy', 'Kadea Academy', 'Kadea Academy'),
    context: triple('Le contexte', 'Context', 'Contexto'),
    role: triple('Mon rôle', 'My role', 'Mi papel'),
    approach: triple('Mon approche', 'My approach', 'Mi enfoque'),
    deliverables: triple('Les livrables', 'Deliverables', 'Entregables'),
    results: triple('Les résultats', 'Results', 'Resultados'),
    visitWebsite: triple('Visiter le site', 'Visit website', 'Visitar sitio'),
    seeProject: triple('Découvrir le projet', 'Explore project', 'Ver proyecto'),
    originalLanguage: triple('Le document est présenté dans sa langue d’origine.', 'This document is shown in its original language.', 'Este documento se muestra en su idioma original.'),
    newWindow: triple('S’ouvre dans un nouvel onglet', 'Opens in a new tab', 'Se abre en una pestaña nueva'),
    galleryLabel: triple('Galerie des réalisations', 'Design gallery', 'Galería de diseños'),
    projectFilters: triple('Filtrer les projets', 'Filter projects', 'Filtrar proyectos'),
    designFilters: triple('Filtrer la galerie', 'Filter gallery', 'Filtrar galería'),
    description: triple('Portfolio de Gloria Tumsifu Kasunzu : stratégie, communication, design et solutions numériques. Projets et réalisations à Kinshasa.', 'Gloria Tumsifu Kasunzu’s portfolio: strategy, communication, design and digital solutions. Projects and creative work in Kinshasa.', 'Portafolio de Gloria Tumsifu Kasunzu: estrategia, comunicación, diseño y soluciones digitales. Proyectos y trabajos creativos en Kinshasa.'),
    title: triple('Gloria Tumsifu Kasunzu — Portfolio', 'Gloria Tumsifu Kasunzu — Portfolio', 'Gloria Tumsifu Kasunzu — Portafolio')
  });

  // The French source text is the stable key for legacy data-fr/data-en markup.
  // This map is checked against the HTML by tests; no keyword replacement occurs.
  const SPANISH = Object.freeze({
    'Réalisations': 'Proyectos',
    'Galerie': 'Galería',
    'Sites web': 'Sitios web',
    'À propos': 'Sobre mí',
    'Contact': 'Contacto',
    'Portfolio personnel · Kinshasa, RDC': 'Portafolio personal · Kinshasa, RD del Congo',
    'Stratégie. Créativité. Innovation.': 'Estrategia. Creatividad. Innovación.',
    'Découvrir mes réalisations': 'Descubrir mis proyectos',
    "La rencontre des idées et de l'exécution": 'Donde las ideas se convierten en realidad',
    'Je donne une forme <em>concrète</em> aux idées.': 'Doy una forma <em>concreta</em> a las ideas.',
    "Communication, design, expériences numériques et systèmes intelligents : j'aime les projets qui exigent de penser autant que de créer.": 'Comunicación, diseño, experiencias digitales y sistemas inteligentes: me gustan los proyectos que exigen pensar tanto como crear.',
    'Travaux sélectionnés': 'Trabajos seleccionados',
    'LE TRAVAIL<br><em>PARLE.</em>': 'EL TRABAJO<br><em>HABLA.</em>',
    "Une sélection de projets où se croisent stratégie, création et conception de solutions. Chaque réalisation indique clairement mon rôle et son état d'avancement.": 'Una selección de proyectos que combinan estrategia, creación y diseño de soluciones. Cada proyecto indica claramente mi papel y su estado de desarrollo.',
    'Tout voir': 'Ver todo',
    'Communication': 'Comunicación',
    'Produits & digital': 'Productos y digital',
    'Communication digitale, refonte web, campagnes et visibilité.': 'Comunicación digital, renovación web, campañas y visibilidad.',
    'Consulter la brochure': 'Consultar folleto',
    'Direction visuelle et création éditoriale pour une marque de roses stabilisées.': 'Dirección visual y creación editorial para una marca de rosas preservadas.',
    'Voir les publications': 'Ver publicaciones',
    'Cockpit de gestion multi-projets, clients et opérations. Produit en développement.': 'Panel de gestión de proyectos, clientes y operaciones. Producto en desarrollo.',
    "Plateforme d'agents IA spécialisés, conçue autour d'objectifs mesurables.": 'Plataforma de agentes de IA especializados, diseñada en torno a objetivos medibles.',
    'Contenus de marque, campagnes et parcours e-commerce.': 'Contenido de marca, campañas y experiencia de comercio electrónico.',
    'Voir les créations': 'Ver diseños',
    'Agence indépendante : communication, marketing, web et automatisation.': 'Agencia independiente: comunicación, marketing, web y automatización.',
    'AUTRES<br><em>CRÉATIONS.</em>': 'OTRAS<br><em>CREACIONES.</em>',
    'Édition, identité et supports de marque : quelques autres pièces tirées de mes archives de création.': 'Edición, identidad y materiales de marca: otras piezas seleccionadas de mi archivo creativo.',
    "Les projets numériques en développement sont représentés par des compositions éditoriales, et non des captures d'interface. Les documents consultables restent la propriété de leurs auteurs et commanditaires respectifs.": 'Los productos digitales en desarrollo se representan con composiciones editoriales, no con capturas de interfaz. Los documentos siguen siendo propiedad de sus respectivos autores y clientes.',
    'Archives de création': 'Archivo creativo',
    'ENCORE<br><em>PLUS DE DESIGN.</em>': 'MÁS<br><em>DISEÑO.</em>',
    'Des identités visuelles aux supports imprimés, des campagnes aux exercices de création : chaque pièce a son langage, son contexte et sa fonction.': 'Desde identidades visuales hasta materiales impresos, campañas y ejercicios creativos: cada pieza tiene su lenguaje, contexto y función.',
    'Tous les visuels': 'Todos los diseños',
    'Édition & print': 'Edición e impresión',
    'Identités': 'Identidades',
    'Kadea Academy': 'Kadea Academy',
    'Carrigrès — les quatre calendriers': 'Carrigrès — cuatro formatos de calendario',
    'Identités, campagnes & exercices': 'Identidades, campañas y ejercicios',
    'Sites web & expériences digitales': 'Sitios web y experiencias digitales',
    'DES IDÉES<br><em>EN LIGNE.</em>': 'IDEAS<br><em>EN LÍNEA.</em>',
    "Des sites pensés pour répondre à un objectif réel : visibilité, clarté de l'offre et expérience de navigation.": 'Sitios web diseñados para cumplir un objetivo real: visibilidad, claridad de la oferta y experiencia de navegación.',
    "Refonte et optimisation du site WordPress, visibilité SEO et présentation de l'offre.": 'Rediseño y optimización de WordPress, visibilidad SEO y presentación de la oferta.',
    'Visiter le site': 'Visitar sitio',
    'Direction artistique et conception du site de mon agence. Projet en évolution.': 'Dirección artística y diseño del sitio de mi agencia. Proyecto en desarrollo.',
    'En développement': 'En desarrollo',
    'À propos de moi': 'Sobre mí',
    "PLUS<br>QU'UNE<br><em>ÉTIQUETTE.</em>": 'MÁS<br>QUE UNA<br><em>ETIQUETA.</em>',
    'Je suis Gloria, une professionnelle de la communication qui aime aussi concevoir des produits et construire des systèmes.': 'Soy Gloria, profesional de la comunicación a la que también le encanta diseñar productos y construir sistemas.',
    "Formée en sciences politiques et relations internationales, puis en marketing digital, j'ai travaillé entre groupe industriel, suivi commercial et projets indépendants à Kinshasa. Ce parcours nourrit une approche à la fois analytique, humaine et créative.": 'Me formé en ciencias políticas y relaciones internacionales y después en marketing digital. He trabajado en un grupo industrial, seguimiento comercial y proyectos independientes en Kinshasa. Esa trayectoria alimenta un enfoque analítico, humano y creativo.',
    "J'aime comprendre les besoins réels, trouver une direction juste et la traduire en livrables utiles — du contenu à l'interface d'un outil métier.": 'Me gusta comprender las necesidades reales, encontrar la dirección adecuada y convertirla en resultados útiles: desde contenido hasta la interfaz de una herramienta de trabajo.',
    'Résultats sélectionnés': 'Resultados seleccionados',
    'DES IDÉES.<br><em>DES PREUVES.</em>': 'IDEAS.<br><em>RESULTADOS.</em>',
    'Impressions vidéo Facebook · Carrigrès': 'Impresiones de vídeo en Facebook · Carrigrès',
    'ThruPlays sur une campagne vidéo': 'ThruPlays en una campaña de vídeo',
    'Impressions organiques sur Google': 'Impresiones orgánicas en Google',
    'Abonnés LinkedIn créés organiquement': 'Seguidores de LinkedIn obtenidos de forma orgánica',
    'Parcours': 'Trayectoria',
    'LE<br><em>PARCOURS.</em>': 'LA<br><em>TRAYECTORIA.</em>',
    'Consultante indépendante / MASDIA': 'Consultora independiente / MASDIA',
    'Communication, produits digitaux et automatisations': 'Comunicación, productos digitales y automatización',
    'Suivi commercial, CRM et coordination': 'Seguimiento comercial, CRM y coordinación',
    'Communication digitale, web et campagnes': 'Comunicación digital, web y campañas',
    'Certification marketing digital · Grande distinction': 'Certificación en marketing digital · Alta distinción',
    'Échangeons': 'Hablemos',
    'FAISONS<br><em>QUELQUE CHOSE</em><br>DE BEAU.': 'CREEMOS<br><em>ALGO</em><br>CON SENTIDO.',
    'Pour une opportunité professionnelle, une mission ou une collaboration, retrouvons-nous sur LinkedIn.': 'Para una oportunidad profesional, un proyecto o una colaboración, conectemos en LinkedIn.',
    'Me contacter sur LinkedIn': 'Contactar por LinkedIn',
    'Retour en haut': 'Volver arriba'
  });

  const TEXT_BINDINGS = Object.freeze([
    ['.skip-link', triple('Aller au contenu', 'Skip to content', 'Saltar al contenido')],
    ['.art-script', triple('idées & matière', 'ideas & substance', 'ideas y materia')],
    ['[data-filter="design"]', triple('Design', 'Design', 'Diseño')],
    ['.visual-carrigres .visual-caption', triple('BROCHURE / COMMUNICATION', 'BROCHURE / COMMUNICATION', 'FOLLETO / COMUNICACIÓN')],
    ['.visual-bloom .visual-caption', triple('CRÉATION ÉDITORIALE / SOCIAL MEDIA', 'EDITORIAL DESIGN / SOCIAL MEDIA', 'DISEÑO EDITORIAL / REDES SOCIALES')],
    ['.visual-os .visual-caption', triple('PRODUCT DESIGN / OUTIL INTERNE', 'PRODUCT DESIGN / INTERNAL TOOL', 'DISEÑO DE PRODUCTO / HERRAMIENTA INTERNA')],
    ['.visual-quoakoo .visual-caption', triple('AGENTS IA / PRODUIT EN DÉVELOPPEMENT', 'AI AGENTS / PRODUCT IN DEVELOPMENT', 'AGENTES IA / PRODUCTO EN DESARROLLO')],
    ['.visual-anniecks .visual-caption', triple('MODE / E-COMMERCE / CONTENU', 'FASHION / E-COMMERCE / CONTENT', 'MODA / COMERCIO ELECTRÓNICO / CONTENIDO')],
    ['.visual-masdia .visual-caption', triple('STRATÉGIE / AUTOMATISATION / DIGITAL', 'STRATEGY / AUTOMATION / DIGITAL', 'ESTRATEGIA / AUTOMATIZACIÓN / DIGITAL')],
    ['.project-proof > span:first-child', triple('15 300 impressions SEO', '15,300 SEO impressions', '15.300 impresiones SEO')],
    ['.os-motif small', triple('TRAVAILLER. CLAIREMENT.', 'WORK. CLEARLY.', 'TRABAJAR. CON CLARIDAD.')],
    ['.design-library .section-topline > span:last-child', triple('PRINT / IDENTITÉ / DIGITAL', 'PRINT / BRANDING / DIGITAL', 'IMPRESIÓN / IDENTIDAD / DIGITAL')],
    ['.carrigres-browser .browser-content strong', triple("Pour vos grands projets d'infra\u00adstructure.", 'For your major infrastructure projects.', 'Para tus grandes proyectos de infraestructura.')],
    ['.carrigres-browser .browser-overline', triple('CARRIGRÈS · GROUPE TEXAF', 'CARRIGRÈS · TEXAF GROUP', 'CARRIGRÈS · GRUPO TEXAF')],
    ['.carrigres-browser .browser-label', triple('MATÉRIAUX DE CONSTRUCTION · KINSHASA', 'CONSTRUCTION MATERIALS · KINSHASA', 'MATERIALES DE CONSTRUCCIÓN · KINSHASA')],
    ['.masdia-browser .browser-overline', triple('COMMUNICATION · AUTOMATISATION · IA', 'COMMUNICATION · AUTOMATION · AI', 'COMUNICACIÓN · AUTOMATIZACIÓN · IA')],
    ['.masdia-browser .browser-label', triple("SITE D'AGENCE EN ÉVOLUTION", 'AGENCY WEBSITE IN DEVELOPMENT', 'SITIO DE AGENCIA EN DESARROLLO')],
    ['.specialties > span:nth-child(1)', triple('Marque & contenu', 'Brand & Content', 'Marca y contenido')],
    ['.specialties > span:nth-child(2)', triple('Stratégie digitale', 'Digital Strategy', 'Estrategia digital')],
    ['.specialties > span:nth-child(3)', triple('Conception produit', 'Product Thinking', 'Diseño de producto')],
    ['.specialties > span:nth-child(4)', triple('Automatisation & IA', 'Automation & AI', 'Automatización e IA')]
  ]);

  const ATTRIBUTE_BINDINGS = Object.freeze([
    ['.nav-brand', 'aria-label', triple('Gloria — accueil', 'Gloria — home', 'Gloria — inicio')],
    ['.main-nav', 'aria-label', triple('Navigation principale', 'Main navigation', 'Navegación principal')],
    ['.mail-link', 'aria-label', triple('Contact', 'Contact', 'Contacto')],
    ['.feature', 'aria-label', triple('Présentation', 'Introduction', 'Presentación')],
    ['.filters', 'aria-label', UI.projectFilters],
    ['.design-filters', 'aria-label', UI.designFilters],
    ['.carrigres-browser', 'aria-label', triple('Aperçu éditorial du site Carrigrès', 'Editorial representation of the Carrigrès website', 'Representación editorial del sitio Carrigrès')],
    ['.masdia-browser', 'aria-label', triple('Composition éditoriale MASDIA, site en développement', 'MASDIA editorial composition, website in development', 'Composición editorial de MASDIA, sitio en desarrollo')],
    ['.breathe-browser', 'aria-label', triple('Capture du site en ligne Breathe & Rise Without Fear', 'Screenshot of the live Breathe & Rise Without Fear website', 'Captura del sitio en línea Breathe & Rise Without Fear')]
  ]);

  // Per-asset descriptions keep every image meaningful in all interface languages.
  // Both filenames share their copy while the original PNG replaces the preview.
  const HALLOWEEN_ALT = triple('Affiche Halloween UTEX aux couleurs sombres', 'UTEX Halloween poster in dark colours', 'Cartel de Halloween de UTEX en tonos oscuros');
  const ASSETS = Object.freeze({
    'breathe-without-fear-site.jpg': triple('Capture de la page d’accueil Breathe & Rise Without Fear, avec le portrait de Marie Desy et la présentation de son initiative', 'Screenshot of the Breathe & Rise Without Fear homepage, with Marie Desy’s portrait and an introduction to her initiative', 'Captura de la página de inicio de Breathe & Rise Without Fear, con el retrato de Marie Desy y la presentación de su iniciativa'),
    'carrigres-brochure.webp': triple('Brochure de présentation Carrigrès, réalisée pour la communication institutionnelle', 'Carrigrès company brochure designed for institutional communication', 'Folleto corporativo de Carrigrès para comunicación institucional'),
    'bloom-publication.webp': triple('Création Bloom Atelier 243 présentant un bouquet de roses rouges stabilisées', 'Bloom Atelier 243 design featuring a bouquet of preserved red roses', 'Diseño de Bloom Atelier 243 con un ramo de rosas rojas preservadas'),
    'anniecks-campagne.webp': triple("Composition photographique Annieck's Business montrant des t-shirts colorés", "Annieck's Business photo composition with colourful T-shirts", "Composición fotográfica de Annieck's Business con camisetas de colores"),
    'revendre-lookbook.webp': triple('Couverture de lookbook mode Re-vendre', 'Re-vendre fashion lookbook cover', 'Portada del catálogo de moda Re-vendre'),
    'utex-identite.webp': triple("Support d'identité UTEX, une communauté unique", 'UTEX identity material, a unique community', 'Material de identidad de UTEX, una comunidad única'),
    'carrigres-calendrier-mural.webp': triple('Calendrier mural Carrigrès 2026 avec camion et grille annuelle', 'Carrigrès 2026 wall calendar with a truck and annual date grid', 'Calendario de pared Carrigrès 2026 con un camión y cuadrícula anual'),
    'carrigres-calendrier-table.webp': triple('Calendrier de table Carrigrès 2026, identité bleu et jaune', 'Carrigrès 2026 desk calendar in blue and yellow', 'Calendario de mesa Carrigrès 2026 en azul y amarillo'),
    'carrigres-calendrier-triptyque.webp': triple('Calendrier triptyque pliable Carrigrès 2026', 'Carrigrès 2026 folding triptych calendar', 'Calendario tríptico plegable Carrigrès 2026'),
    'carrigres-calendrier-sous-main.webp': triple('Sous-main de bureau Carrigrès avec calendrier 2026', 'Carrigrès desk pad with a 2026 calendar', 'Protector de escritorio Carrigrès con calendario 2026'),
    'carrigres-charte.webp': triple('Couverture de la charte graphique Carrigrès', 'Carrigrès brand guidelines cover', 'Portada del manual de identidad visual de Carrigrès'),
    'agorafrik-charte.webp': triple('Couverture orange de la charte graphique Agorafrik', 'Orange cover of the Agorafrik brand guidelines', 'Portada naranja del manual de identidad visual de Agorafrik'),
    'agorafrik-visuels.webp': triple('Couverture des créations de communication Agorafrik, rouge profond et orange', 'Agorafrik communication designs cover in deep red and orange', 'Portada de los diseños de comunicación Agorafrik en rojo oscuro y naranja'),
    'agorafrik-publication.webp': triple('Publication Agorafrik présentant une plateforme dédiée aux talents africains', 'Agorafrik post introducing a platform for African talent', 'Publicación de Agorafrik sobre una plataforma para el talento africano'),
    'ardhi-organic-strategie.webp': triple('Présentation de stratégie digitale Ardhi Organic avec couleurs orange et vert', 'Ardhi Organic digital strategy presentation in orange and green', 'Presentación de estrategia digital de Ardhi Organic en naranja y verde'),
    'kadea-storytelling.webp': triple('Présentation d’exercice Kadea Academy sur le storytelling', 'Kadea Academy storytelling exercise presentation', 'Presentación de un ejercicio de narrativa en Kadea Academy'),
    'kadea-growth-hacking.webp': triple('Présentation Kadea Academy sur le growth hacking', 'Kadea Academy growth hacking presentation', 'Presentación de growth hacking en Kadea Academy'),
    'kadea-affiche.webp': triple('Affiche de communication d’une formation Kadea Academy', 'Promotional poster for a Kadea Academy course', 'Cartel promocional de una formación de Kadea Academy'),
    'revendre-carte-cadeau.webp': triple('Carte cadeau Re-vendre avec typographie orange et ruban rouge', 'Re-vendre gift card with orange lettering and a red ribbon', 'Tarjeta regalo de Re-vendre con letras naranjas y lazo rojo'),
    'atelier-prospectus.webp': triple("Prospectus de L'Atelier, salon de manucure et pédicure", "Leaflet for L'Atelier manicure and pedicure salon", "Folleto de L'Atelier, salón de manicura y pedicura"),
    'atelier-rollup.webp': triple("Roll-up vertical de L'Atelier, prestations de manucure et pédicure", "Vertical roll-up banner for L'Atelier manicure and pedicure services", "Banner vertical de L'Atelier para servicios de manicura y pedicura"),
    'utex-halloween.webp': HALLOWEEN_ALT,
    'utex-halloween.png': HALLOWEEN_ALT,
    'utex-centenaire.webp': triple('Visuel de présentation du centenaire TEXAF', 'TEXAF centenary presentation design', 'Diseño de presentación del centenario de TEXAF'),
    'agorafrik-pitch.webp': triple('Page de conclusion du pitch deck Agorafrik, avec portrait artistique et motifs bordeaux et orange', 'Conclusion page of the Agorafrik pitch deck, with an artistic portrait and burgundy and orange motifs', 'Página de conclusión de la presentación de Agorafrik, con un retrato artístico y motivos en burdeos y naranja')
  });

  const HALLOWEEN_LABELS = Object.freeze([triple('Campagne Halloween', 'Halloween campaign', 'Campaña de Halloween'), triple('UTEX', 'UTEX', 'UTEX')]);
  const DESIGN_LABELS = Object.freeze({
    'carrigres-calendrier-mural.webp': [triple('Calendrier mural', 'Wall calendar', 'Calendario de pared'), triple('Carrigrès · 2026', 'Carrigrès · 2026', 'Carrigrès · 2026')],
    'carrigres-calendrier-table.webp': [triple('Calendrier de table A5', 'A5 desk calendar', 'Calendario de mesa A5'), triple('Carrigrès · 2026', 'Carrigrès · 2026', 'Carrigrès · 2026')],
    'carrigres-calendrier-triptyque.webp': [triple('Calendrier triptyque', 'Triptych calendar', 'Calendario tríptico'), triple('Carrigrès · 2026', 'Carrigrès · 2026', 'Carrigrès · 2026')],
    'carrigres-calendrier-sous-main.webp': [triple('Sous-main de bureau', 'Desk pad', 'Protector de escritorio'), triple('Carrigrès · 2026', 'Carrigrès · 2026', 'Carrigrès · 2026')],
    'carrigres-charte.webp': [triple('Charte graphique', 'Brand guidelines', 'Manual de identidad visual'), triple('Carrigrès', 'Carrigrès', 'Carrigrès')],
    'agorafrik-charte.webp': [triple('Charte graphique Agorafrik', 'Agorafrik brand guidelines', 'Manual de identidad de Agorafrik'), triple('Identité de marque', 'Brand identity', 'Identidad de marca')],
    'agorafrik-visuels.webp': [triple('Agorafrik — visuels', 'Agorafrik — visuals', 'Agorafrik — diseños'), triple('Direction de communication', 'Communication direction', 'Dirección de comunicación')],
    'agorafrik-publication.webp': [triple('Agorafrik — campagne', 'Agorafrik — campaign', 'Agorafrik — campaña'), triple('Réseaux sociaux', 'Social media', 'Redes sociales')],
    'ardhi-organic-strategie.webp': [triple('Ardhi Organic', 'Ardhi Organic', 'Ardhi Organic'), triple('Stratégie de notoriété', 'Brand awareness strategy', 'Estrategia de notoriedad')],
    'kadea-storytelling.webp': [triple('Storytelling', 'Storytelling', 'Narrativa'), triple('Projet Kadea Academy', 'Kadea Academy project', 'Proyecto de Kadea Academy')],
    'kadea-growth-hacking.webp': [triple('Growth hacking', 'Growth hacking', 'Growth hacking'), triple('Projet Kadea Academy', 'Kadea Academy project', 'Proyecto de Kadea Academy')],
    'kadea-affiche.webp': [triple('Affiche de formation', 'Course poster', 'Cartel de formación'), triple('Exercice Kadea Academy', 'Kadea Academy exercise', 'Ejercicio de Kadea Academy')],
    'revendre-carte-cadeau.webp': [triple('Carte cadeau', 'Gift card', 'Tarjeta regalo'), triple('Re-vendre', 'Re-vendre', 'Re-vendre')],
    'atelier-prospectus.webp': [triple('Prospectus A5', 'A5 leaflet', 'Folleto A5'), triple("L'Atelier", "L'Atelier", "L'Atelier")],
    'atelier-rollup.webp': [triple('Roll-up vitrine', 'Window roll-up banner', 'Banner para escaparate'), triple("L'Atelier", "L'Atelier", "L'Atelier")],
    'utex-halloween.webp': HALLOWEEN_LABELS,
    'utex-halloween.png': HALLOWEEN_LABELS,
    'utex-centenaire.webp': [triple('Centenaire TEXAF', 'TEXAF centenary', 'Centenario de TEXAF'), triple('UTEX / événementiel', 'UTEX / events', 'UTEX / eventos')],
    'agorafrik-pitch.webp': [triple('Pitch deck Agorafrik', 'Agorafrik pitch deck', 'Presentación de Agorafrik'), triple('Présentation de marque', 'Brand presentation', 'Presentación de marca')]
  });

  const ARCHIVE_LABELS = Object.freeze({
    'revendre-lookbook.webp': triple('Re-vendre — Lookbook', 'Re-vendre — Lookbook', 'Re-vendre — Catálogo de moda'),
    'utex-identite.webp': triple('UTEX — Identité', 'UTEX — Identity', 'UTEX — Identidad')
  });

  function readPreference(storage) {
    try { const value = storage && storage.getItem(STORAGE_KEY); return isLocale(value) ? value : null; }
    catch (_) { return null; }
  }
  function savePreference(storage, locale) {
    if (!isLocale(locale)) return false;
    try { if (!storage) return false; storage.setItem(STORAGE_KEY, locale); return true; }
    catch (_) { return false; }
  }
  function interpolate(value, parameters = {}) {
    return String(value).replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(parameters, key) ? String(parameters[key]) : match);
  }
  function validateTriple(value, label) {
    for (const locale of LOCALES) if (!value || typeof value[locale] !== 'string' || !value[locale].trim()) throw new Error(`Missing ${locale} translation: ${label}`);
  }
  function lookupInline(element, locale) {
    const fr = element.getAttribute('data-fr');
    if (locale === 'fr') return fr;
    if (locale === 'es') return element.getAttribute('data-es') || (Object.prototype.hasOwnProperty.call(SPANISH, fr) ? SPANISH[fr] : null);
    return element.getAttribute('data-en');
  }

  // Only <br> and <em> from reviewed translation strings become markup.
  // All other characters are inserted as text, never arbitrary HTML.
  function renderText(element, value, document) {
    if (!/<(?:br|\/?em)>/.test(value)) { element.textContent = value; return; }
    const fragment = document.createDocumentFragment();
    let parent = fragment;
    for (const token of String(value).split(/(<br>|<em>|<\/em>)/)) {
      if (token === '<br>') parent.appendChild(document.createElement('br'));
      else if (token === '<em>') { const em = document.createElement('em'); fragment.appendChild(em); parent = em; }
      else if (token === '</em>') parent = fragment;
      else if (token) parent.appendChild(document.createTextNode(token));
    }
    element.replaceChildren(fragment);
  }

  function createController({ document, window: view, storage: providedStorage } = {}) {
    if (!document) throw new Error('Localization requires a document');
    const runtime = view || {};
    let storage = providedStorage;
    if (storage === undefined) { try { storage = runtime.localStorage; } catch (_) { storage = null; } }
    let language = DEFAULT_LOCALE;
    let initialized = false;
    const registered = Object.assign(Object.create(null), UI);
    const diagnostics = new Set();
    const queryAll = (selector, scope = document) => {
      const elements = Array.from(scope.querySelectorAll(selector));
      if (typeof scope.matches === 'function' && scope.matches(selector)) elements.unshift(scope);
      return elements;
    };
    const get = (key, parameters) => {
      if (!registered[key]) { diagnostics.add(`Unknown translation key: ${key}`); return key; }
      return interpolate(registered[key][language], parameters);
    };

    function translate(scope = document) {
      queryAll('[data-fr][data-en]', scope).forEach(element => {
        const value = lookupInline(element, language);
        if (!value) { diagnostics.add(`Missing ${language} inline translation: ${element.getAttribute('data-fr')}`); return; }
        renderText(element, value, document);
      });
      for (const [selector, message] of TEXT_BINDINGS) queryAll(selector, scope).forEach(element => { element.textContent = message[language]; });
      for (const [selector, attribute, message] of ATTRIBUTE_BINDINGS) queryAll(selector, scope).forEach(element => element.setAttribute(attribute, message[language]));
      for (const [filename, description] of Object.entries(ASSETS)) queryAll(`img[src$="${filename}"]`, scope).forEach(element => element.setAttribute('alt', description[language]));
      for (const [filename, labels] of Object.entries(DESIGN_LABELS)) {
        queryAll(`.design-tile img[src$="${filename}"]`, scope).forEach(image => {
          const tile = image.closest('.design-tile');
          const title = tile && tile.querySelector('b');
          const category = tile && tile.querySelector('small');
          if (title) title.textContent = labels[0][language];
          if (category) category.textContent = labels[1][language];
        });
      }
      // Only these known archive captions are localized, never user documents.
      for (const [filename, captionText] of Object.entries(ARCHIVE_LABELS)) {
        queryAll(`.archive-item img[src$="${filename}"]`, scope).forEach(image => {
          const caption = image.closest('.archive-item').querySelector(':scope > span');
          if (caption) caption.textContent = captionText[language];
        });
      }
      queryAll('[data-i18n]', scope).forEach(element => renderText(element, get(element.getAttribute('data-i18n')), document));
      for (const [data, attribute] of [['data-i18n-aria', 'aria-label'], ['data-i18n-alt', 'alt'], ['data-i18n-title', 'title'], ['data-i18n-placeholder', 'placeholder']]) {
        queryAll(`[${data}]`, scope).forEach(element => element.setAttribute(attribute, get(element.getAttribute(data))));
      }
      // Optional fully translated attributes for new content outside the catalog.
      for (const attribute of ['alt', 'aria-label', 'title']) {
        queryAll(`[data-${attribute}-fr][data-${attribute}-en][data-${attribute}-es]`, scope).forEach(element => element.setAttribute(attribute, element.getAttribute(`data-${attribute}-${language}`)));
      }
    }

    function setLanguage(locale, { persist = true, notify = true } = {}) {
      if (!isLocale(locale)) return false;
      language = locale;
      document.documentElement.lang = locale;
      document.documentElement.setAttribute('lang', locale);
      document.title = get('title');
      for (const [selector, key] of [
        ['meta[name="description"]', 'description'],
        ['meta[property="og:title"]', 'title'],
        ['meta[property="og:description"]', 'description']
      ]) {
        const meta = document.querySelector(selector);
        if (meta) meta.setAttribute('content', get(key));
      }
      translate();
      const selector = document.getElementById('language-select');
      if (selector) { selector.value = locale; selector.setAttribute('aria-label', get('language')); }
      queryAll('[data-language]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-language') === locale));
        button.classList.toggle('active', button.getAttribute('data-language') === locale);
      });
      if (persist) savePreference(storage, locale);
      if (notify && typeof runtime.CustomEvent === 'function') document.dispatchEvent(new runtime.CustomEvent('portfolio:languagechange', { detail: { language: locale } }));
      return true;
    }

    function init() {
      if (initialized) return controller;
      initialized = true;
      let queryLanguage;
      try { queryLanguage = new URLSearchParams(runtime.location && runtime.location.search || '').get('lang'); } catch (_) { queryLanguage = null; }
      const initial = isLocale(queryLanguage) ? queryLanguage : readPreference(storage) || DEFAULT_LOCALE;
      const selector = document.getElementById('language-select');
      if (selector) selector.addEventListener('change', event => setLanguage(event.target.value));
      queryAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.getAttribute('data-language'))));
      setLanguage(initial, { persist: isLocale(queryLanguage), notify: true });
      return controller;
    }

    function registerMessages(messages) {
      const entries = Object.entries(messages);
      entries.forEach(([key, values]) => validateTriple(values, key));
      entries.forEach(([key, values]) => { registered[key] = { ...values }; });
    }
    const controller = Object.freeze({ init, setLanguage, translate, t: get, registerMessages, get language() { return language; }, get locale() { return language; }, get diagnostics() { return Array.from(diagnostics); } });
    return controller;
  }

  return Object.freeze({ LOCALES, STORAGE_KEY, UI, SPANISH, TEXT_BINDINGS, ATTRIBUTE_BINDINGS, ASSETS, DESIGN_LABELS, ARCHIVE_LABELS, isLocale, readPreference, savePreference, interpolate, validateTriple, lookupInline, renderText, createController });
});
