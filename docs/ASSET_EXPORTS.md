# Exports et images du portfolio

## État courant — 20 novembre 2026

La sélection affichée est documentée dans `assets-manifest.json` : **82 originaux Canva et 6 captures de sites**, accompagnés de **82 variantes de cartes**. Les 87 pages de la visionneuse sont servies localement ; un visuel de composition d’accueil distinct complète cet inventaire.

Les nouveaux exports Canva ont été importés sans recadrage et enregistrés en WebP sans perte. Les variantes des cartes sont séparées, à 900 ou 1100 px au maximum sur le côté long. Le PNG Halloween original est conservé intact, y compris ses métadonnées.

Les fichiers de pleine définition totalisent **64 919 942 octets** ; les variantes totalisent **7 643 204 octets**. Ces sommes couvrent l’inventaire complet, pas le poids initial de la page. Les images de pleine définition se chargent à l’ouverture de la visionneuse ; les miniatures sont chargées paresseusement.

Les captures Carrigrès et Breathe & Rise Without Fear proviennent des pages publiques. Le formulaire de devis présenté est vide. Leurs URLs et légendes sont dans `assets/sites/manifest.json`.

## Actualiser une sélection

1. Inspecter les pages à montrer et vérifier leur contribution au projet.
2. Exporter uniquement les pages retenues depuis Canva.
3. Importer avec `scripts/import_canva_export.py` ; les reçus locaux d’import sont ignorés par Git.
4. Mettre à jour `content/projects.json` dans les trois langues.
5. Exécuter `scripts/build_portfolio.py --strict`, puis `scripts/update_asset_manifest.py`.
6. Vérifier les fichiers, le rendu et l’intégrité avant publication.

Les URLs de documents complets ne sont publiées que lorsqu’elles sont présentes dans la sélection éditoriale contrôlée. Un export ne doit pas introduire un accès aux autres pages d’un document de travail.
