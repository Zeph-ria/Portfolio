# Gloria Tumsifu Kasunzu — Portfolio

Portfolio personnel en français, anglais et espagnol, développé en HTML/CSS/JavaScript sans dépendance de build. Il rassemble 6 projets sélectionnés, une galerie de 18 créations, 2 pièces d’archives et une section distincte de 3 projets web.

Le dépôt [Zeph-ria/Portfolio](https://github.com/Zeph-ria/Portfolio) est la source du projet. L’adresse publique est [https://zeph-ria.github.io/Portfolio/](https://zeph-ria.github.io/Portfolio/). GitHub Pages publie la branche `main`. La refonte est suivie dans la [PR #3](https://github.com/Zeph-ria/Portfolio/pull/3) et [l’objectif #2](https://github.com/Zeph-ria/Portfolio/issues/2).

## État des visuels — 19 novembre 2026

Les 23 créations utilisent désormais **21 vrais exports Canva et 2 miniatures conservées pour L’Atelier**. Les exports sont servis par le portfolio : leur agrandissement et leur téléchargement ne demandent pas de compte Canva. Les liens des documents de travail restent disponibles séparément ; leur ouverture peut demander une connexion à Canva.

Les quatre calendriers Carrigrès, les réalisations Agorafrik, Ardhi Organic et Kadea sont présents. Les sélections corrigées sont la page 17 du pitch Agorafrik et la page 3 de l’affiche Kadea ; Annieck conserve sa page 3. L’affiche Halloween UTEX reste une réalisation historique de 2025.

Les cartes utilisent des variantes WebP légères dans `assets/thumbs/`. La visionneuse et le téléchargement chargent le fichier de pleine définition. Le PNG original Halloween est conservé intact. Les deux documents L’Atelier restent indiqués comme miniatures : des médias manquent dans leurs sources Canva, ce qui a empêché leur export normal.

Les dimensions, les pages et la provenance figurent dans [assets-manifest.json](assets-manifest.json), [EXPORT_PLAN.md](EXPORT_PLAN.md) et [docs/ASSET_EXPORTS.md](docs/ASSET_EXPORTS.md).

## Aperçu local

Depuis la racine d’un clone local :

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Ouvrir [http://localhost:8000](http://localhost:8000). Aucun build n’est requis. Un serveur HTTP permet de retrouver le comportement normal des ressources, des téléchargements et de la préférence de langue. Dans un environnement disposant d’un service de prévisualisation géré, utiliser ce service.

## Direction artistique

- Noir : `#0e0e0e`
- Blanc : `#ffffff`
- Bordeaux : `#652936`
- Titres : Wremena, fichiers WOFF locaux
- Texte courant : DM Sans, chargé via Google Fonts, avec Arial comme repli

La palette, les familles typographiques et les tailles de la direction artistique validée sont conservées pendant l’intégration des exports. Les variantes d’image changent le poids des fichiers chargés, pas la mise en page des cartes.

La livraison du 20 novembre utilise les **WOFF officiels historiques de Wremena**, rattachés à la déclaration de diffusion de la fonderie à cette époque. Les sources et empreintes figurent dans [docs/FONT_PROVENANCE.md](docs/FONT_PROVENANCE.md). Ces fichiers remplacent les conversions tierces sans changer la famille, les tailles ou la palette. L’enquête antérieure sur la référence Nice People reste disponible dans [AUDIT_ASSETS.md](AUDIT_ASSETS.md).

L’adresse canonique et l’aperçu de partage utilisent le domaine GitHub Pages confirmé. L’image de partage est une capture réelle du rendu du portfolio, conservée dans `assets/share-preview.jpg`.

## Structure

| Fichier ou dossier | Responsabilité |
| --- | --- |
| `index.html` | Contenu français de référence, structure sémantique, dimensions des médias et dialogue d’aperçu |
| `styles.css` | Direction artistique, responsive, focus et réduction des animations |
| `i18n.js` | Traductions FR/EN/ES, métadonnées, textes alternatifs et préférence de langue |
| `script.js` | Filtres, compteurs, visionneuse et téléchargement du visuel affiché |
| `assets/` | 21 exports de pleine définition, 2 miniatures Canva, capture web JPEG, polices et favicon |
| `assets/thumbs/` | Variantes WebP des exports pour les cartes, de 900 px au maximum sur le côté long |
| `assets-manifest.json` | Provenance, pages, dimensions, empreintes et variantes des médias |
| `tests/` | Contrats statiques, tests unitaires et suite navigateur distincte |
| `AUDIT_ASSETS.md` | État des visuels, enquête typographique datée et domaine confirmé |
| `EXPORT_PLAN.md` | Inventaire des 23 créations et des pages sélectionnées |
| `docs/ASSET_EXPORTS.md` | Résumé technique des exports et de leur conversion |
| `QA_REPORT.md` | Contrôles réellement exécutés, résultats et limites |
| `docs/qa/` | Captures de la prévisualisation contrôlée |

## Langues et ajout de contenu

Le sélecteur propose FR, EN et ES. La langue choisie est conservée sous la clé `gtk-lang` dans `localStorage`. Une préférence invalide est ignorée ; un stockage indisponible ne bloque pas les contrôles. Les paramètres `?lang=fr`, `?lang=en` et `?lang=es` permettent d’ouvrir une langue précise.

La traduction couvre l’interface, les légendes, les descriptions alternatives des images, les libellés accessibles, le titre et les métadonnées. Les textes contenus dans les créations conservent leur langue d’origine.

Pour ajouter une réalisation :

1. Fournir les textes FR/EN/ES et les descriptions d’image dans `i18n.js` ou les attributs de traduction appropriés.
2. Conserver le nom de marque, les crédits visibles et la langue de l’œuvre.
3. Enregistrer le fichier de pleine définition et, si utile, une variante légère pour la carte.
4. Renseigner les dimensions réelles, la page sélectionnée et les variantes dans `assets-manifest.json`. Les attributs `width`/`height` décrivent l’image de la carte ; `data-full-src`, `data-full-width` et `data-full-height` désignent le fichier chargé par la visionneuse.
5. Exécuter les contrôles correspondant au changement et vérifier les trois langues.

Le contrôleur `window.PortfolioI18n` expose `setLanguage`, `t`, `translate` et `registerMessages`. L’événement `portfolio:languagechange` actualise aussi les libellés et le contenu d’une visionneuse déjà ouverte.

## Galerie et visionneuse

Les filtres des projets et de la galerie sont indépendants. Les cartes écartées, les grilles vides et leurs titres sont masqués ensemble. Les quatre formats de calendriers restent distincts : mural, table A5, triptyque et sous-main.

Le dialogue natif présente le visuel, son titre, un compteur, les commandes précédente/suivante, le téléchargement et le lien du document Canva. Les flèches du clavier naviguent dans les créations visibles du même groupe ; Échap ferme le dialogue et rend le focus au déclencheur.

Le téléchargement vise le fichier local de la création affichée. Pour L’Atelier, ce fichier reste la miniature disponible, signalée comme telle. La consultation du document complet est une action distincte et peut nécessiter une session Canva.

Sans JavaScript ou sans dialogue natif, les cartes de galerie et d’archives continuent d’ouvrir leur document Canva. Les clics Ctrl/Cmd conservent la navigation native. Les images des trois projets disposant d’un document source reçoivent un bouton d’aperçu lorsque le dialogue est pris en charge.

## Sites web

La section distingue Carrigrès, MASDIA en développement et **Breathe & Rise Without Fear** en ligne. Le domaine [breathewithoutfear.org](https://breathewithoutfear.org/) a été confirmé par Gloria. La carte utilise une capture réelle du site, prise le 18 novembre 2026 en 1348 × 926 px. Les visuels Carrigrès et MASDIA sont présentés comme des compositions éditoriales.

Les projets « Génération », « Prayer Machine » et « Just1Pulse » restent exclus.

## Vérification et suivi

Les contrôles de code ne nécessitent aucune nouvelle dépendance npm :

```bash
node --test tests/static-contracts.mjs tests/interactions.test.mjs tests/i18n.test.cjs tests/domain.test.mjs
node tests/smoke.mjs
git diff --check
```

Les résultats de la dernière passe sont consignés dans [QA_REPORT.md](QA_REPORT.md). Les tests d’interaction exécutent le vrai script sur une fixture DOM ; les observations de rendu sont rapportées séparément.

La suite `node tests/browser.mjs` est prévue pour un environnement où Playwright et un navigateur compatible sont disponibles. Elle accepte `PORTFOLIO_BROWSER_EXECUTABLE` et `PORTFOLIO_BASE_URL`. **Un code de sortie 2 signale une infrastructure indisponible, pas une réussite des tests navigateur.**

Le suivi du chantier reste centralisé dans [l’objectif #2](https://github.com/Zeph-ria/Portfolio/issues/2) et la PR #3. Les deux exports L’Atelier restent à remplacer lorsque leurs médias source seront de nouveau disponibles. Cette limite n’empêche pas leur présentation actuelle en miniature.
