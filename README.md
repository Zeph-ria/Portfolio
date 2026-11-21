# Portfolio de Gloria Tumsifu Kasunzu

Portfolio statique en français, anglais et espagnol. Site public : https://zeph-ria.github.io/Portfolio/.

## Présentation actuelle

La version du 21 novembre 2026 présente une sélection éditoriale dans la direction artistique d'origine, avec les titres Wremena et la palette bordeaux conservés.

- **10 projets** et **93 visuels dans la galerie**, en fichiers locaux de bonne qualité. La galerie présente d'abord quatre créations originales, puis le bouton « Voir plus de créations » déploie toutes les autres et les filtres **Logos / Mockups / Visuels**.
- **Carrigrès** : quatre formats imprimés. Les originaux complets (calendrier mural, calendrier de table avec 15 pages, calendrier triptyque et sous-main) s'ouvrent dans une visionneuse PDF accessible, avec lien de secours vers le fichier partagé en lecture publique sur Google Drive.
- **L’Atelier** : crédits limités aux campagnes et créations de communication, sans prétendre à la création du logo.
- **UTEX Empreinte** : trois vues de présentation, couverture, logo et signature de clôture, accompagnées des grandes étapes de la conception du programme ESG. Aucune diapositive de stratégie confidentielle n'est publiée.
- **Re-vendre** : traitement CSS pour atténuer le blanc derrière le logo, sans modifier l'original source.
- **Kadea Storytelling** et **Chocolata Pâtisserie / Portfolio affiche Gloria** : deux petites études dépliables avec accès aux créations Canva originales. Les contenus incorporés peuvent nécessiter un partage de lecture public pour les visiteurs.
- **Agorafrik, Carrigrès, Wali, Bloom et Re-vendre** : élargissement des diaporamas avec davantage de travaux déjà exportés sur le site.

Les compositions photographiques Agorafrik (pages 25 à 27) et les vues sélectionnées d’UTEX Empreinte sont installées localement dans le site. Les cinq nouveaux aperçus sont des WebP de 596 px issus des rendus Canva, non des exports haute définition : leur définition est adaptée à une vignette, mais limitée dans une visionneuse fortement agrandie. Les autres originaux préexistants restent inchangés.

## Direction artistique

La famille Wremena, les fichiers de police et la feuille `styles.css` sont ceux de la référence approuvée `7154a95`. Les titres de projets reviennent **sous les images**, avec la règle d’origine `400 clamp(31px, 3.5vw, 55px) / 1.1`. Les surcharges qui agrandissaient les titres sur téléphone et les présentations en deux colonnes image/texte ont été supprimées.

La palette bordeaux `#652936`, noir `#0e0e0e` et blanc ainsi que la composition de l’accueil sont conservées. Les images de cette composition montrent désormais des créations finies. La galerie utilise Wremena pour ses légendes de marque ; elle ne modifie pas les titres existants.

## Navigation et images

Le menu dessert **Travaux, Galerie, À propos et Contact**. Les filtres de projets n’affectent pas la galerie. Toutes ses images restent dans le document et accessibles au clavier, y compris pendant la consultation en grand.

La visionneuse ouvre l’original choisi, permet de parcourir les visuels de la même galerie ou du même projet, affiche la taille réelle et propose le téléchargement du fichier local. La fermeture rend le focus au lien exact ayant ouvert l’image. Les formats d’origine sont préservés dans la galerie et la visionneuse. Les images des cartes utilisent des variantes légères séparées.

Les versions `?lang=fr`, `?lang=en` et `?lang=es` sont prises en charge ; le choix est mémorisé. Les textes de l’interface, les titres descriptifs et les alternatives des images sont traduits. Les créations elles-mêmes restent dans leur langue d’origine.

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
