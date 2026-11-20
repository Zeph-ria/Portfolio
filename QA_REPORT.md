# Rapport de vérification du portfolio

## Préparation de la livraison — 20 novembre 2026

- Les deux WOFF officiels historiques de Wremena remplacent les conversions tierces. Les sources et empreintes sont documentées dans [docs/FONT_PROVENANCE.md](docs/FONT_PROVENANCE.md).
- La comparaison des 119 caractères couverts utilisés dans les sources ne montre aucun nouveau caractère manquant ni changement d’avance horizontale : [font-compatibility.json](docs/qa/2026-11-20/font-compatibility.json).
- La famille, les tailles et les couleurs CSS sont conservées. La différence de métriques verticales Bold est identifiée pour le contrôle visuel du logo `GTK.`.
- L’adresse publique `https://zeph-ria.github.io/Portfolio/` a été confirmée dans le navigateur. L’adresse canonique, l’URL Open Graph et une capture réelle de partage ont été ajoutées.
- Après ces changements, **46/46 tests Node**, le smoke test et `git diff --check` réussissent. Les résultats ci-dessous documentent séparément la passe visuelle du 19 novembre.
- La vérification de la version publiée et le résultat du déploiement sont suivis dans [l’objectif #2](https://github.com/Zeph-ria/Portfolio/issues/2), après la fusion de la PR #3.

Date de la passe : **19 novembre 2026**

Branche contrôlée : `feat/editorial-portfolio-2026`

Périmètre : fichiers de la branche et prévisualisation gérée, observée dans un vrai navigateur via CUA.

## Résultat de la passe

**46 tests Node sur 46 réussis, smoke test réussi et `git diff --check` sans anomalie.** Les **23 créations** ont été ouvertes et décodées dans le navigateur : 18 dans la galerie, 3 dans les projets et 2 dans les archives. La visionneuse charge les fichiers de pleine définition prévus ; les deux créations L’Atelier restent correctement identifiées comme miniatures.

Le téléchargement de l’affiche Halloween a été déclenché dans le navigateur. Le fichier reçu est **identique octet pour octet au PNG source**. Les changements de langue FR/EN/ES, la persistance de l’anglais après rechargement, les filtres, la fermeture par Échap et le retour du focus ont été contrôlés. La matrice de 18 combinaisons langue/largeur ne révèle aucun débordement dans les éléments mesurés ; la visionneuse ouverte a aussi été vérifiée à 360 px dans les trois langues.

Cette passe conserve le bordeaux `#652936`, Wremena et les tailles de la direction artistique validée. Elle établit le fonctionnement de la version testée ; elle n’atteste ni fusion dans la branche principale ni mise en production. La sauvegarde du chantier est suivie dans la [PR #3](https://github.com/Zeph-ria/Portfolio/pull/3).

## Inventaire vérifié

| Élément | État |
| --- | --- |
| Projets sélectionnés | 6, dont 3 avec création réelle ouvrable dans la visionneuse |
| Galerie filtrable | 18 créations |
| Archives complémentaires | 2 créations |
| Ensemble des créations | 23 : **21 vrais exports Canva et 2 miniatures L’Atelier** |
| Fichiers de pleine définition | 20 WebP et 1 PNG original Halloween |
| Variantes des cartes | 21 WebP, 900 px au maximum sur le côté long |
| Capture de site | JPEG réel de Breathe & Rise Without Fear, 1348 × 926 px |
| Manifeste | **45 fichiers** contrôlés : 23 créations, la capture et 21 variantes ; dimensions et SHA-256 vérifiés |
| Calendriers Carrigrès | 4 formats distincts : mural, table A5, triptyque et sous-main |
| Sites web | Carrigrès, MASDIA et Breathe & Rise Without Fear |
| Langues | FR, EN, ES |

Les choix de pages sont documentés dans [EXPORT_PLAN.md](EXPORT_PLAN.md) : page 17 du pitch Agorafrik, page 3 de l’affiche Kadea, page 3 d’Annieck, page 1 pour les autres créations. La couverture Agorafrik portant un filigrane a été écartée ; aucun filigrane n’a été effacé. Le PNG Halloween conserve ses données de provenance et son contexte historique de 2025.

Les exclusions Génération, Prayer Machine et Just1Pulse restent couvertes par les contrôles statiques. Le domaine confirmé `breathewithoutfear.org` et sa capture réelle sont conservés.

## Contrôles de code exécutés

```bash
node --test tests/static-contracts.mjs tests/interactions.test.mjs tests/i18n.test.cjs tests/domain.test.mjs
node tests/smoke.mjs
git diff --check
```

| Contrôle | Résultat | Périmètre |
| --- | --- | --- |
| Suites Node | **46/46 réussis** | Structure, ressources, dimensions, variantes et sources de pleine définition, langues, interactions, téléchargement, domaine confirmé et exclusions |
| Smoke test | Réussi | Invariants structurels et de contenu |
| Diff | Sans anomalie signalée | Espacements et validité du patch suivi |
| Fichiers du manifeste | **45/45 vérifiés** | Dimensions réelles et empreintes SHA-256 |

Les tests d’interaction exécutent le vrai script sur une fixture DOM. Ils vérifient les états et les événements ; les observations de rendu et le décodage des images ci-dessous proviennent du navigateur réel.

## Contrôles dans le navigateur réel

La prévisualisation gérée a été contrôlée via CUA. Ces observations ne sont pas présentées comme l’exécution de la suite Playwright.

| Scénario | Résultat observé |
| --- | --- |
| Galerie | **18/18 créations** décodées, avec dimensions naturelles positives et source attendue |
| Projets et archives | **5/5 créations** supplémentaires décodées : 3 projets et 2 archives |
| Agrandissement | Fichier de pleine définition utilisé lorsqu’il est disponible ; miniatures L’Atelier identifiées comme telles |
| Filtre Kadea | 3 créations attendues visibles |
| Filtre Tous | Retour aux 18 créations de galerie |
| Langues | FR, EN et ES sélectionnables ; libellés de la visionneuse actualisés |
| Persistance | Anglais conservé après rechargement d’une URL sans paramètre de langue |
| Fermeture | Échap ferme la visionneuse et rend le focus au calendrier mural qui l’avait ouverte |
| Direction artistique | Bordeaux `#652936` et Wremena observés ; fichiers de police inchangés |
| Visionneuse mobile | À 360 px en FR/EN/ES, les liens Télécharger et Consulter le document restent dans leur cadre |

Les changements CSS de cette intégration concernent le pied de la visionneuse et le repli de ses actions. Ils ne remplacent pas les familles de police, la palette ou les tailles de titres du portfolio.

### Téléchargement vérifié

Le bouton de téléchargement de l’affiche Halloween a été cliqué dans la visionneuse. Le fichier reçu et le PNG source ont la même taille et la même empreinte :

- Fichier : `utex-halloween.png`
- Taille : **3 846 104 octets**
- SHA-256 : `88e3b28a388e71002b7dc80d3d9dfd2cbffc726267ebc0885067f4e78835eb09`

Cela vérifie le téléchargement réel d’un fichier local complet, sans connexion Canva. La consultation du document Canva reste une action distincte et peut nécessiter une session Canva.

### Responsive : 18 combinaisons

La page a été chargée dans des iframes de six largeurs pour chacune des trois langues. La barre de défilement occupe 15 px dans cet environnement.

| Largeur d’iframe | Largeur intérieure mesurée | FR | EN | ES |
| --- | --- | --- | --- | --- |
| 360 px | 345 px | Aucun débordement détecté | Aucun débordement détecté | Aucun débordement détecté |
| 390 px | 375 px | Aucun débordement détecté | Aucun débordement détecté | Aucun débordement détecté |
| 650 px | 635 px | Aucun débordement détecté | Aucun débordement détecté | Aucun débordement détecté |
| 700 px | 685 px | Aucun débordement détecté | Aucun débordement détecté | Aucun débordement détecté |
| 768 px | 753 px | Aucun débordement détecté | Aucun débordement détecté | Aucun débordement détecté |
| 1440 px | 1425 px | Aucun débordement détecté | Aucun débordement détecté | Aucun débordement détecté |

Le résultat porte sur les sélecteurs effectivement contrôlés : titres, navigation, libellés des créations et éléments des cartes web. Les mesures détaillées sont conservées dans [responsive-results.json](docs/qa/2026-11-19/responsive-results.json).

Une seconde passe vérifie le **dialogue ouvert** en FR/EN/ES à 360 px. Le viewport intérieur mesure alors 360 px, la barre de défilement étant absente pendant l’ouverture ; le dialogue mesure 322 px de large. Les deux actions restent dans le cadre ; les résultats sont enregistrés dans [mobile-dialog-results.json](docs/qa/2026-11-19/mobile-dialog-results.json). Ces mesures en navigateur ne constituent pas un test sur téléphone physique.

### Journaux récupérés

Les journaux récupérés contiennent **30 erreurs attribuées à une extension Chrome**. Aucun message d’erreur attribué à l’application n’a été identifié dans cet ensemble. Cette observation ne vaut pas collecte exhaustive de tous les journaux possibles ni garantie d’absence de tout défaut.

## Poids des images et chargement

| Ensemble mesuré | Taille cumulée |
| --- | ---: |
| 21 fichiers de pleine définition | **18,716486 Mo** |
| 21 variantes utilisées pour les cartes | **1,270194 Mo** |
| Réduction du poids des images de cartes correspondantes | **93,2 %** |

Ces valeurs sont les tailles cumulées des fichiers, en mégaoctets décimaux. Elles comparent les 21 variantes aux 21 fichiers de pleine définition ; elles n’incluent pas les deux miniatures L’Atelier, la capture du site, les polices ou le code. Elles ne sont ni une mesure Lighthouse, ni un temps de chargement réseau, ni un résultat Core Web Vitals. Le fichier de pleine définition est chargé à l’ouverture de la visionneuse ou lors du téléchargement.

## Preuves conservées

| Preuve | Fichier |
| --- | --- |
| Vue ordinateur | [desktop.jpg](docs/qa/2026-11-19/desktop.jpg) |
| Vue mobile 360 px | [mobile-360.jpg](docs/qa/2026-11-19/mobile-360.jpg) |
| Quatre calendriers | [calendar-gallery.jpg](docs/qa/2026-11-19/calendar-gallery.jpg) |
| Visionneuse avec export de pleine définition | [lightbox-hd.jpg](docs/qa/2026-11-19/lightbox-hd.jpg) |
| Visionneuse mobile en français | [mobile-lightbox-fr.jpg](docs/qa/2026-11-19/mobile-lightbox-fr.jpg) |
| Décodage des 18 créations de galerie | [gallery-results.json](docs/qa/2026-11-19/gallery-results.json) |
| Décodage des 3 projets et 2 archives | [project-results.json](docs/qa/2026-11-19/project-results.json) |
| Matrice responsive | [responsive-results.json](docs/qa/2026-11-19/responsive-results.json) |
| Actions de la visionneuse mobile | [mobile-dialog-results.json](docs/qa/2026-11-19/mobile-dialog-results.json) |

Les anciennes captures directement présentes dans `docs/qa/` documentent la passe du 18 novembre. Elles ne remplacent pas les preuves datées du 19 novembre pour l’intégration des exports.

## Limites et état du chantier

Les deux designs **L’Atelier** restent les seuls exports manquants : leurs médias source indisponibles empêchent un export normal. Les miniatures sont conservées et signalées. Leurs documents Canva n’ont pas été modifiés.

La suite Playwright headless n’a pas été exécutée : le binaire Chromium attendu n’est pas disponible, ce que son code de sortie 2 signale. Les contrôles de navigateur décrits dans ce rapport sont ceux effectués via CUA. Aucune campagne Safari/Firefox, aucun test sur appareil physique, aucun audit exhaustif avec lecteur d’écran ni mesure Lighthouse n’est revendiqué.

Le rapport porte sur la version effectivement contrôlée. La sauvegarde dans la PR, la fusion et le déploiement sont des états distincts ; **aucune fusion ni mise en production n’est attestée ici**. Le chantier reste suivi dans [l’objectif #2](https://github.com/Zeph-ria/Portfolio/issues/2).
