# Exports et images du portfolio

## Sélection du 21 novembre 2026

Le catalogue courant associe dix projets courts, 33 vues dans leurs présentations et une galerie de 89 visuels finis. Les quatre calendriers Carrigrès sont aussi réunis dans une section dédiée. Six captures réelles illustrent les deux sites web.

Seules deux compositions L’Atelier, pages 6 et 12 du document de campagnes, sont omises en raison de médias non importés dans leur source Canva. Les pages 22 et 26 sont exportables et intégrées ; la galerie conserve douze autres visuels L’Atelier.

Les nouveaux visuels proviennent d’exports PNG officiels des pages sélectionnées, en qualité élevée. Les originaux sont importés en WebP sans perte, sans recadrage. Les dimensions mesurées du PNG exporté sont enregistrées ; elles peuvent différer des dimensions arrondies fournies par l’API Canva pour un format d’impression. Les miniatures sont des fichiers séparés de 900 ou 1100 pixels au maximum sur le côté long. Le PNG Halloween fourni reste intact.

Le manifeste technique inventorie seulement les images affichées, leurs dimensions, octets et SHA-256. Il reste dans le dépôt source et est exclu du site publié. Les reçus d’import complets ne sont pas publiés. Aucun lien vers un document Canva entier n’est exposé dans le site ou dans son catalogue.

Les quatre calendriers sont des pièces d’édition distinctes. Le triptyque montre l’habillage d’impression destiné à recevoir des feuillets mensuels séparés ; il n’est pas présenté comme une photographie du calendrier assemblé.

## Actualiser une sélection

1. Inspecter les créations finies et vérifier leur attribution.
2. Choisir des pages représentatives, en excluant les documents internes et les constructions techniques.
3. Exporter uniquement les pages retenues depuis Canva.
4. Importer avec `scripts/import_canva_export.py`, en conservant l’original entier.
5. Mettre à jour `content/projects.json` avec des titres courts et des alternatives FR/EN/ES.
6. Exécuter `scripts/build_portfolio.py --strict`, puis `scripts/update_asset_manifest.py`.
7. Vérifier les fichiers, les proportions et le rendu avant publication.

Les fichiers retirés de cette sélection ne doivent pas rester accessibles comme copies techniques dans le déploiement courant. Cette règle n’implique pas de réécrire l’historique Git.

## Périmètre du site publié

La configuration Jekyll `_config.yml` exclut du site GitHub Pages les dossiers `docs`, `tests`, `scripts` et `content`, les documents de travail à la racine, `assets-manifest.json` et `assets/sites/manifest.json`. Les fichiers nécessaires au navigateur restent servis : HTML, CSS, JavaScript, images et polices. Ces exclusions ne rendent pas privés les fichiers conservés dans le dépôt GitHub public.
