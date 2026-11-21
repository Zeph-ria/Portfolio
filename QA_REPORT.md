# Vérification du portfolio — 21 novembre 2026

## Version corrigée

Cette vérification remplace le rapport de la sélection précédente. La correction répond à la demande de Gloria : retrouver les titres approuvés, raccourcir les descriptions, montrer les créations finies et ouvrir une galerie transversale.

- 10 projets, chacun présenté par un titre et une phrase ; 33 vues sélectionnées.
- 89 visuels dans la galerie, dont dix compositions Annieck’s et douze L’Atelier.
- Quatre calendriers Carrigrès et deux sites, avec trois captures par site.
- UTEX Empreinte limité à sa signature visuelle ; Recherche graphique remplace les présentations stratégiques.
- Pages techniques de construction, documents stratégiques et liens vers les documents Canva complets retirés de la publication courante.

## Contrôles automatiques

**48 tests Node sur 48 réussis**, smoke test réussi et diff sans anomalie.

```bash
node --test tests/static-contracts.mjs tests/interactions.test.mjs tests/i18n.test.cjs tests/domain.test.mjs
node tests/smoke.mjs
git diff --check
```

Ces tests couvrent les traductions, les destinations, la navigation, les filtres, les séquences d’images, le téléchargement de l’original choisi, le retour du focus, les chemins locaux, les dimensions et les empreintes des ressources. Le manifeste mesure 95 originaux affichés et 89 variantes de cartes. Les URL CSS et JavaScript portent les versions calculées de leur contenu.

## Typographie et mise en page

`styles.css`, `Wremena-Regular.woff` et `Wremena-Bold.woff` sont identiques à la référence approuvée `7154a95`. Les surcharges éditoriales agrandissant les titres sur téléphone ont été supprimées. Les titres de projets retrouvent leur place sous les images et la règle originale `400 clamp(31px, 3.5vw, 55px) / 1.1`.

La famille Wremena est chargée dans le navigateur. La composition d’accueil et le bordeaux `#652936` sont conservés. Les ajustements déjà présents sous 360 px pour les autres sections sont maintenus.

La passe visuelle a révélé un débordement horizontal provoqué par les légendes masquées d’un diaporama. Le positionnement relatif de leur figure le corrige sans modifier la typographie. À 1363 px de fenêtre, le document mesure désormais 1348 px utiles et 1348 px de contenu.

## Vérification dans un navigateur réel

L’aperçu local a été contrôlé en français, anglais et espagnol à quatre largeurs d’iframe, soit douze configurations :

| Largeur demandée | Largeur utile et contenu | Titre de projet | Colonnes de galerie |
| --- | --- | --- | --- |
| 320 px | 305 px | 31 px | 2 |
| 390 px | 375 px | 31 px | 2 |
| 768 px | 753 px | 31 px | 3 |
| 1280 px | 1265 px | 44,8 px | 4 |

Dans chaque configuration, les 10 projets et les 89 visuels sont présents ; aucun débordement horizontal de page n’a été mesuré. Les observations de bureau et les captures visuelles confirment les titres sous les images, les descriptions courtes et les images entières dans la galerie.

À 390 px, le menu ouvre ses quatre destinations et se ferme à l’activation de Galerie. Le lien Annieck’s « Une allure pour chacun » ouvre le bon original 1080 × 1350, en position 3 sur 89. Le contrôle suivant passe à l’image Bloom en position 4 ; le bouton de fermeture ferme effectivement le dialogue.

À 320 px, le calendrier de table s’ouvre dans son format entier : original 2000 × 1382, affiché à 258 × 178,27 px avec `object-fit: contain`. Le titre et les actions restent dans le cadre. Les aperçus de la section Calendriers restent recadrés ; la galerie et la visionneuse conservent les formats complets.

## Sélection et provenance

Les compositions de la galerie ont été inspectées visuellement. Les pages Annieck’s retenues proviennent du document courant : 1, 2, 3, 5, 7, 8, 9, 10, 13 et 14. La présentation du projet utilise les pages 1, 3, 5 et 10.

Les nouveaux originaux sont des exports PNG officiels, convertis en WebP sans perte ; les miniatures sont séparées. Aucun original n’est reconstruit. Quatre des six images auparavant manquantes ont été récupérées : Wali matières 7 et 30, L’Atelier campagnes 22 et 26. Les deux compositions L’Atelier 6 et 12 sont exclues, Canva signalant des médias non importés qui empêchent leur export. Les documents source n’ont pas été modifiés pour contourner cette erreur.

La composition L’Atelier « Évolution du logo » a été vérifiée : il s’agit d’une annonce visuelle avant/après du changement de marque, avec les logos finis, et non d’une planche expliquant leur construction.

## Périmètre publié

`_config.yml` exclut les dossiers de documentation, de tests, de scripts et de catalogue, les rapports de travail et les manifestes techniques du site GitHub Pages. Les ressources nécessaires au navigateur ne sont pas exclues. Le dépôt GitHub public et son historique restent inchangés dans leur niveau d’accès ; cette mesure ne prétend pas les rendre privés.

## Limites

Les observations responsive proviennent d’un navigateur à largeurs contrôlées, pas de téléphones physiques. Chromium n’étant pas installé pour les suites terminal `tests/browser.mjs` et `tests/navigation-gallery.test.mjs`, leur réussite n’est pas revendiquée. La vérification du rendu a utilisé le navigateur CUA. Aucune mesure Lighthouse ni validation de navigateurs non testés n’est annoncée.
