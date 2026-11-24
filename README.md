# Portfolio de Gloria Tumsifu Kasunzu

Portfolio statique en français, anglais et espagnol. Site public : https://zeph-ria.github.io/Portfolio/.

## Présentation actuelle

L'édition de novembre 2026 met en avant **trois contributions principales**, puis une sélection de travaux complémentaires. La direction artistique approuvée, la typographie Wremena et la palette bordeaux restent inchangées.

- **Carrigrès** : communication digitale, visibilité web et structuration d'un parcours de demande de devis vers le suivi commercial. Les chiffres publiés proviennent du bilan 2025 et ne sont pas présentés comme des ventes.
- **Agorafrik** : langage visuel articulé autour de l'identité, du choix photographique et des applications graphiques.
- **UTEX Empreinte** : conception d'une **proposition** de programme ESG, avec identité et pistes de déploiement. Les documents de travail internes ne sont pas publiés et la proposition n'est pas présentée comme un programme déjà exécuté.
- **Autres travaux** : Re-vendre, L’Atelier, Wali, Bloom, Annieck’s, UTEX/TEXAF et recherche graphique restent consultables, ainsi que les 93 créations de la galerie.
- **Compétences** : trois champs de pratique rédigés en texte, *Stratégie & communication*, *Identité & expériences digitales* et *Systèmes & pilotage*, en FR/EN/ES. Ils remplacent l'ancienne liste numérotée de huit items.
- **Carrigrès, calendriers** : 16 vues natives pour chaque format de table et triptyque, incluant les 15 pages du PDF, et lien discret vers l'original haute définition.

Les images et supports originaux n'ont pas été modifiés par la réécriture éditoriale.

## Direction artistique

La famille Wremena, les fichiers de police et la feuille `styles.css` sont ceux de la référence approuvée `7154a95`. Les titres de projets reviennent **sous les images**, avec la règle d’origine `400 clamp(31px, 3.5vw, 55px) / 1.1`. Les surcharges qui agrandissaient les titres sur téléphone et les présentations en deux colonnes image/texte ont été supprimées.

La palette bordeaux `#652936`, noir `#0e0e0e` et blanc ainsi que la composition de l’accueil sont conservées. Les images de cette composition montrent désormais des créations finies. La galerie utilise Wremena pour ses légendes de marque ; elle ne modifie pas les titres existants.

## Navigation et images

Le menu présente strictement **Travaux, Compétences et Me contacter**. La section Compétences est uniquement textuelle : elle reprend les compétences de l'ancien portfolio, complétées par les acquis documentés en automatisation, suivi commercial, outils métier et IA appliquée. Un lien WhatsApp vérifié (terminaison 65) est disponible dans la section Contact. Les filtres de projets n’affectent pas la galerie. Toutes ses images restent dans le document et accessibles au clavier, y compris pendant la consultation en grand.

La visionneuse ouvre l’original choisi, permet de parcourir les visuels de la même galerie ou du même projet, affiche la taille réelle et propose le téléchargement du fichier local. La fermeture rend le focus au lien exact ayant ouvert l’image. Les formats d’origine sont préservés dans la galerie et la visionneuse. Les images des cartes utilisent des variantes légères séparées.

Les versions `?lang=fr`, `?lang=en` et `?lang=es` sont prises en charge ; le choix est mémorisé. Les textes de l’interface, les titres descriptifs et les alternatives des images sont traduits. Les créations elles-mêmes restent dans leur langue d’origine.

## Calendriers en carrousels

Les 15 pages du calendrier de table et les 15 pages du triptyque ont été rendues à partir des PDF d'impression originaux, proportionnellement et **sans recadrage**. Elles sont stockées au format WebP dans `assets/calendars/`, documentées avec dimensions, provenance et SHA-256 dans `assets-manifest.json`. Ces aperçus légers ne remplacent pas les PDF en haute définition ; les liens originaux sont conservés dans `portfolio-refinements.js`.

Les 30 feuillets sont gérés par `content/projects.json` et `scripts/build_portfolio.py`, accessibles via les mêmes flèches, le défilement tactile et la visionneuse que les autres créations, et chargés progressivement pour préserver les performances.

## Chargement des images

Le HTML ne télécharge plus simultanément les images des slides non visibles. Les visuels affichés directement (couvertures en haut et quatre aperçus de galerie) conservent leur URL et leur priorité. Les autres vignettes ont un `data-deferred-src`, puis sont chargées lorsqu'elles approchent de l'écran via `IntersectionObserver`, ou avant la navigation au clavier et avec les flèches du carrousel.

Chaque visuel différé conserve un `<noscript>` natif pour les navigateurs sans JavaScript. Le lien d’agrandissement et la source originale restent inchangés ; aucune image source n'a été recompressée pour cette optimisation.

**Mesure reproductible locale en Chromium sans cache (viewport 390 / 1440 px)** : les images transférées avant le premier arrêt réseau sont passées de 2 420 à 648 Kio sur mobile (-73 %) et de 2 153 à 648 Kio sur ordinateur (-70 %). Après ouverture de la galerie, 5 252 à 1 519 Kio sur mobile (-71 %) et 5 554 à 1 931 Kio sur ordinateur (-65 %), à position de défilement identique. Ce sont des **octets téléchargés à ces étapes**, pas une promesse de temps de chargement, et le chargement différé se produit normalement quand les autres créations sont consultées. Les captures comparatives de la galerie après chargement des quatre aperçus ont la même taille et ne présentent que 0,003 % de pixels différents, principalement liés au rendu navigateur.

Contrôles : `node --test tests/image-loading.test.mjs` en plus des tests statiques, d'interaction et de navigateur du dépôt.

## Contenu et provenance

`content/projects.json` contient les projets, la galerie, les calendriers et les métriques. Les projets comprennent un nom, une phrase, des catégories et leur sélection de visuels ; les développements éditoriaux précédents ont été retirés.

`assets-manifest.json` inventorie uniquement les originaux affichés, leurs dimensions, empreintes SHA-256 et variantes. Ce manifeste technique est conservé dans le dépôt, mais exclu du site publié. Les reçus de travail qui identifient les documents Canva complets restent hors de la publication. La provenance des polices est documentée dans `docs/FONT_PROVENANCE.md`.

Les métriques Carrigrès proviennent du bilan janvier–septembre 2025 ; les données Google couvrent les cinq mois suivant l’indexation. Le parcours documenté est WordPress → Tally → Google Sheets → suivi commercial. Les conversations WhatsApp ne sont pas assimilées à des ventes et les demandes ne sont pas présentées comme des devis générés automatiquement.

## Régénération

Le site se sert directement, sans dépendance JavaScript ni compilation. Pillow sert à importer et mesurer les images.

```bash
python scripts/build_portfolio.py --strict
python scripts/update_asset_manifest.py
```

Les imports gardent les pixels des PNG officiels dans des WebP sans perte et produisent des miniatures séparées. La taille effectivement exportée prévaut lorsque les métadonnées Canva arrondissent les dimensions d’un format d’impression. Aucune œuvre n’est recadrée ou reconstruite pour son original.

La régénération versionne les URL des scripts et styles avec leurs empreintes pour que les visiteurs chargent les fichiers correspondants après une mise à jour.

## Publication GitHub Pages

Le site utilise la publication depuis une branche GitHub Pages. Le fichier `_config.yml` exclut les dossiers `docs`, `tests`, `scripts`, `content`, les documents de travail à la racine et les deux manifestes techniques. La page HTML, les feuilles de style, les scripts du navigateur, les visuels retenus et les fichiers de police restent disponibles sur le site. Le navigateur ne dépend pas des fichiers exclus.

Ces exclusions portent uniquement sur le site servi par GitHub Pages. Le dépôt source public et son historique restent accessibles sur GitHub ; aucune suppression d’historique n’est effectuée. La provenance des polices reste consultable dans le dépôt. Le comportement d’`exclude` est documenté par [Jekyll](https://jekyllrb.com/docs/configuration/options/) et [GitHub Pages](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll).

## Vérification

```bash
node --test tests/static-contracts.mjs tests/interactions.test.mjs tests/i18n.test.cjs tests/domain.test.mjs
node tests/smoke.mjs
git diff --check
```

Les suites vérifient les liens, les fichiers, les traductions, la navigation, la galerie et la visionneuse. Les observations de rendu de cette version sont consignées dans `QA_REPORT.md`, séparément des résultats des tests automatisés.

`tests/browser.mjs` et `tests/navigation-gallery.test.mjs` sont aussi disponibles pour un environnement équipé de Playwright et Chromium ; ils n’installent pas de navigateur et retournent le code 2 lorsque l’infrastructure est absente.
