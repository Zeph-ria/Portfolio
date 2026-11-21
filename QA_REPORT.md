# Vérification du portfolio — 20 novembre 2026

Branche : `feat/portfolio-curation-2026`.

## Résultat

**44 tests Node sur 44 réussis, smoke test réussi et diff sans anomalie.** La première vérification du navigateur réel a parcouru **82 pages dans 16 présentations** ; chaque image chargée correspond au fichier et aux dimensions attendus. Le document `browser-observations.json` et les captures dans `docs/qa/2026-11-20-curation/` conservent ces observations.

## Périmètre contrôlé

| Contrôle | Résultat observé |
| --- | --- |
| Direction artistique | Wremena et bordeaux `#652936` observés ; `styles.css` et les polices conservés |
| Projets | 11 études, 77 pages consultables localement |
| Calendriers | 4 formats, aperçus plein cadre et originaux entiers dans le dialogue |
| Sites | 6 captures réelles pour Carrigrès et Breathe & Rise Without Fear |
| Fichiers | 88 originaux affichés et 82 variantes mesurés, tailles et SHA-256 vérifiés |
| Menu à 390 px | Trois destinations ; ouverture sur le premier lien ; Échap et retour au bouton |
| Filtres et compétences | Wali masqué par le filtre digital puis réaffiché par son lien de compétence, filtre Tout voir rétabli |
| Langues | FR/EN/ES, y compris titres, légendes, alternatives et contrôles |
| Zoom | Le calendrier mural revient à 1815 × 2571 px, puis au cadrage entier |
| Téléchargement | Le PNG Halloween téléchargé est identique octet pour octet à la source |

## Rendu responsive

Quatre largeurs d’iframe ont été vérifiées dans les trois langues : **320, 390, 700 et 768 px**. Les largeurs intérieures mesurées avec la barre de défilement étaient respectivement 305, 375, 685 et 753 px. Aucun débordement de page ni découpe des titres et blocs contrôlés n’a été retrouvé après les corrections ciblées sous 360 px.

La page de bureau a aussi été contrôlée en FR/EN/ES à **1363 px**. Le bordeaux observé est `rgb(101, 41, 54)` et la famille principale est Wremena.

À **320 px**, les quatre calendriers ont été ouverts en français. Le format sous-main a aussi été vérifié en anglais et en espagnol. Toutes les images tiennent entièrement dans leur zone, sans déformation ; les actions restent dans le cadre. Ces observations portent sur un navigateur avec des largeurs contrôlées, pas sur des téléphones physiques.

La première passe avait révélé un dépassement du titre Parcours à 320 px en FR/ES et du titre Contact en EN. Des adaptations limitées à moins de 360 px ont corrigé ces cas. Un titre de visionneuse répétant Carrigrès a également été corrigé.

## Contrôles exécutés

```bash
node --test tests/static-contracts.mjs tests/interactions.test.mjs tests/i18n.test.cjs tests/domain.test.mjs
node tests/smoke.mjs
node --check tests/browser.mjs
node --check tests/navigation-gallery.test.mjs
git diff --check
```

Les tests statiques contrôlent notamment les destinations, les traductions, les fichiers locaux, leur définition et leurs empreintes. Les tests d’interaction exécutent le vrai script avec une fixture DOM. La passe CUA valide séparément le rendu et les interactions dans un vrai navigateur.

## Sources et présentation

Les pages retenues ont été inspectées visuellement. Les séquences Re-vendre, L’Atelier et Wali sont présentées avec des légendes distinctes. Agorafrik utilise sa couverture actualisée et présente logo, variantes, photographie et applications. Luminary montre le storyboard, la structure et le script, au-delà de la couverture.

Les liens vers des documents complets mêlant réalisations et informations privées ou non finalisées sont retirés ; les liens de documents sûrs restent facultatifs. Les exports sélectionnés restent accessibles localement. Les pages d’une charte Ardhi dont l’attribution personnelle n’était pas établie ont été écartées de la sélection ; les six pages de stratégie signées Gloria sont conservées.

## Preuves

- `docs/qa/2026-11-20-curation/browser-observations.json`
- `docs/qa/2026-11-20-curation/mobile-menu.jpg`
- `docs/qa/2026-11-20-curation/mobile-calendar.jpg`
- `assets-manifest.json`

Le fichier téléchargé contrôlé mesure **3 846 104 octets** ; SHA-256 : `88e3b28a388e71002b7dc80d3d9dfd2cbffc726267ebc0885067f4e78835eb09`.

## Ajout UTEX Empreinte

UTEX Empreinte figure en deuxième position, avec son contexte de conception de programme, son rôle, ses objectifs, son approche et ses livrables en FR/EN/ES. Les affiches UTEX/TEXAF restent une réalisation distincte. Les cinq pages sélectionnées couvrent l’identité, la vision, les axes ESG, le concept de campagne et Green Kids. Elles ne donnent pas accès au document de travail complet.

La passe complémentaire dans le navigateur a chargé les **5/5 images à 1920 × 1080 px**, avec les fichiers attendus. L’inventaire atteint donc **87 pages dans 17 présentations**. À 320 px (305 px utiles), les textes du nouveau projet et la compétence modifiée ne débordent dans aucune des trois langues. La page des axes ESG s’affiche entière à 258 × 145,125 px, puis le zoom utilise ses 1920 × 1080 px. Après masquage par le filtre Identités, le lien UTEX Empreinte depuis les compétences réaffiche le projet et rétablit Tout voir. Les 44 tests Node et le smoke test ont été relancés avec succès après l’ajout.

Preuves complémentaires : `utex-empreinte-observations.json` et `utex-empreinte-desktop.jpg` dans le même dossier de QA.

## Limite de vérification

Le lancement de Chromium depuis le terminal est indisponible dans cet environnement. Les suites `tests/browser.mjs` et `tests/navigation-gallery.test.mjs` n’ont donc pas été annoncées comme réussies : leur syntaxe a été vérifiée, et les observations réelles ci-dessus proviennent du navigateur CUA. Aucune mesure Lighthouse ni garantie sur les navigateurs et appareils non testés n’est revendiquée.

## Publication et cache — 21 novembre 2026

La PR nº 4 a été fusionnée, puis GitHub Pages a déployé avec succès le commit `c5ec304fd730c98e3dc39aace3fdba8f68c9b31a` (exécution `44840294112`). Le contenu HTML et les fichiers téléchargés depuis le site correspondaient à leurs empreintes locales.

Un navigateur ayant ouvert le site avant cette publication conservait néanmoins l’ancien script : absence des contrôles de diaporama et du menu mobile, ouverture directe des images. Les réponses publiques ont un cache de dix minutes. Les cinq URL CSS/JavaScript portent désormais une version calculée à partir de leur contenu, actualisée par le générateur. Les créations et la direction artistique restent identiques. Un contrôle de cohérence empêche de publier une URL de ressource dont la version ne correspond plus au fichier.

Après cette correction : **45/45 tests Node réussis**, smoke test réussi et diff propre.
