# Portfolio de Gloria Tumsifu Kasunzu

Portfolio statique en français, anglais et espagnol. Site public : https://zeph-ria.github.io/Portfolio/.

## Présentation actuelle

La version du 21 novembre 2026 suit la correction demandée par Gloria : les créations occupent la place principale, chaque projet tient en une phrase et les titres retrouvent leur présentation précédente.

- **10 projets**, avec 33 vues sélectionnées dans leurs présentations.
- **89 visuels dans la galerie**, affichés directement dans une mosaïque transversale ; le nom de la marque est la seule légende visible sous chaque image.
- **4 formats de calendriers Carrigrès**, avec leurs originaux complets disponibles dans la visionneuse.
- **2 sites réalisés**, Carrigrès et Breathe & Rise Without Fear, avec trois captures réelles chacun et un lien vers le site public.
- **Annieck’s Business** : dix compositions du document courant, principalement issues de ses premières pages ; quatre ouvrent la présentation du projet.
- **Recherche graphique** : deux affiches sélectionnées, en remplacement des présentations documentaires de stratégie et de storytelling.
- **UTEX Empreinte** : la signature visuelle de la proposition ESG, sans les documents de conception du programme.

Deux compositions L’Atelier (pages 6 et 12 du document de campagnes) restent exclues : des médias non importés dans leur source Canva empêchent leur export. La galerie contient douze autres visuels L’Atelier ; les pages 22 et 26 ont pu être exportées.

Les pages de construction de logos, les planches techniques des chartes, les documents stratégiques et leurs anciennes copies ont été retirés des fichiers publiés. Aucun lien vers un document Canva complet n’est proposé. Les logos finalisés et les applications sélectionnées restent visibles.

## Direction artistique

La famille Wremena, les fichiers de police et la feuille `styles.css` sont ceux de la référence approuvée `7154a95`. Les titres de projets reviennent **sous les images**, avec la règle d’origine `400 clamp(31px, 3.5vw, 55px) / 1.1`. Les surcharges qui agrandissaient les titres sur téléphone et les présentations en deux colonnes image/texte ont été supprimées.

La palette bordeaux `#652936`, noir `#0e0e0e` et blanc ainsi que la composition de l’accueil sont conservées. Les images de cette composition montrent désormais des créations finies. La galerie utilise Wremena pour ses légendes de marque ; elle ne modifie pas les titres existants.

## Navigation et images

Le menu dessert **Travaux, Galerie, À propos et Contact**. Les filtres de projets n’affectent pas la galerie. Toutes ses images restent dans le document et accessibles au clavier, y compris pendant la consultation en grand.

La visionneuse ouvre l’original choisi, permet de parcourir les visuels de la même galerie ou du même projet, affiche la taille réelle et propose le téléchargement du fichier local. La fermeture rend le focus au lien exact ayant ouvert l’image. Les formats d’origine sont préservés dans la galerie et la visionneuse. Les images des cartes utilisent des variantes légères séparées.

Les versions `?lang=fr`, `?lang=en` et `?lang=es` sont prises en charge ; le choix est mémorisé. Les textes de l’interface, les titres descriptifs et les alternatives des images sont traduits. Les créations elles-mêmes restent dans leur langue d’origine.

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
