# Plan d’exports Canva — portfolio de Gloria

Vérification du 18 novembre 2026, en lecture seule. Aucun design, droit de partage, document public ou fichier d’image du portfolio n’a été modifié par cette inspection.

## Résultat opérationnel

Les 23 identifiants Canva correspondant au manifeste ont été confirmés avec `read_design` : leurs métadonnées et pages sont lisibles dans le compte connecté. Le connecteur exposé comporte 37 outils Canva, mais aucun outil `export-design`, `get-export-formats` ou téléchargement de design.

Les données effectivement renvoyées ne constituent pas des exports :

- Les métadonnées des 23 designs proposent des liens de consultation et d’édition, pas de lien de téléchargement.
- `get_design_pages` renvoie une miniature de 375 × 532 px pour le calendrier mural dont les dimensions de page sont 1815 × 2571 px.
- `read_design` avec le champ `thumbnails` renvoie une miniature de 596 × 335 px pour la charte Agorafrik dont les pages sont de 1920 × 1080 px.
- Les paramètres de ces URL signées n’ont pas été modifiés. Aucun agrandissement de miniature ne doit être présenté comme un export HD.

**Route réalisable :** télécharger les pages choisies depuis l’interface officielle Canva, si la session et les droits de téléchargement le permettent. Le navigateur est géré séparément par l’agent principal. Une demande de connexion ou une restriction de téléchargement doit être résolue normalement ; aucune récupération de jeton ni contournement n’est prévu.

## Sélection initiale pour remplacer les 23 aperçus

Les dimensions ci-dessous sont celles déclarées par les pages Canva, en pixels : ce ne sont pas encore les dimensions de fichiers exportés. Les pages sont numérotées à partir de 1. « PNG p. 1 » vise uniquement le visuel déjà sélectionné pour le portfolio ; cela ne valide pas la publication de l’ensemble du document. Le format reste à vérifier dans le menu de téléchargement propre à chaque design.

| Priorité | Fichier actuel | Identifiant Canva vérifié | Pages du document | Dimensions Canva | Premier export proposé | Revue avant PDF ou pages supplémentaires |
| --- | --- | --- | ---: | --- | --- | --- |
| 1 | `carrigres-calendrier-mural.webp` | `DAG6SKNUtdc` | 2 | 1815 × 2571 | PNG p. 1 ; PDF p. 1 | Comparer les 2 versions avant de choisir le PDF final. |
| 1 | `carrigres-calendrier-table.webp` | `DAG6SNqAtV8` | 16 | 794 × 549 | PNG p. 1 ; PDF p. 1 | Trier les pages de production ; ne pas inclure automatiquement les 16 pages. |
| 1 | `carrigres-calendrier-triptyque.webp` | `DAG6SAkW8x4` | 16 | P. 1–2 : 1228 × 3024 ; p. 3–16 : 1115 × 605 | PNG p. 1 ; PDF p. 1 | Formats de page mixtes : distinguer vue d’ensemble et panneaux avant tout PDF complet. |
| 1 | `carrigres-calendrier-sous-main.webp` | `DAG6SM-rZg0` | 2 | 2268 × 1512 | PNG p. 1 ; PDF p. 1 | Comparer les deux pages et sélectionner la version finale. |
| 2 | `agorafrik-charte.webp` | `DAGLZB_FIOI` | 41 | 1920 × 1080 | PNG p. 1 | Charte longue : valider les pages de marque publiables, sans annexes internes par défaut. |
| 2 | `agorafrik-visuels.webp` | `DAGafR69dyw` | 9 | 1920 × 1080 | PNG p. 1 | Choisir ensuite les créations finales ; vérifier notes, brouillons et éléments tiers. |
| 2 | `agorafrik-publication.webp` | `DAGazb6JFFc` | 5 | 1080 × 1350 | PNG p. 1 | Vérifier l’état de publication et les droits de chaque déclinaison. |
| 2 | `agorafrik-pitch.webp` | `DAGWf-5mlgI` | 18 | 1920 × 1080 | PNG p. 1 | Pitch : revue nécessaire pour informations commerciales, projections et coordonnées éventuelles. |
| 2 | `ardhi-organic-strategie.webp` | `DAGN7a7mBuA` | 18 | 1920 × 1080 | PNG p. 1 | Document stratégique : ne pas diffuser objectifs, ciblage ou planification sans validation. |
| 2 | `kadea-storytelling.webp` | `DAGMPtVOboA` | 12 | 1920 × 1080 | PNG p. 1 | Exercice de formation : vérifier attribution, contenus tiers et données personnelles avant PDF. |
| 2 | `kadea-growth-hacking.webp` | `DAGJv1dVEEU` | 13 | 1920 × 1080 | PNG p. 1 | Même revue des crédits, cas présentés et éventuelles données de tiers. |
| 2 | `kadea-affiche.webp` | `DAGOTeAnLi0` | 7 | 794 × 1123 | PNG p. 1 | Le titre Canva reprend un intitulé de modèle différent : contrôler visuellement les 7 pages avant sélection élargie. |
| 3 | `carrigres-brochure.webp` | `DAGeqT9Hvco` | 4 | 2382 × 1123 | PNG p. 1 | Vérifier que les 4 pages et leurs contacts/informations institutionnelles sont destinés au public. |
| 3 | `carrigres-charte.webp` | `DAGY8DbdOfk` | 33 | 1920 × 1080 | PNG p. 1 | Éviter la publication automatique de toute la charte interne. |
| 3 | `bloom-publication.webp` | `DAHXR2GjJVc` | 15 | 1080 × 1350 | PNG p. 1 | Sélectionner les publications finales et valider les droits photos. |
| 3 | `anniecks-campagne.webp` | `DAHZEBxh0sA` | 25 | P. 13–14 : 1080 × 1920 ; autres : 1080 × 1350 | **PNG p. 3 uniquement** | Conserver la sélection initiale p. 3 ; les autres pages ne sont pas validées. Formats mixtes et slogans à revoir. |
| 3 | `revendre-lookbook.webp` | `DAGv-S68mys` | 23 | 794 × 1123 | PNG p. 1 | Droits des photographies, personnes représentées, prix/contacts éventuels ; PDF intégral à valider. |
| 3 | `revendre-carte-cadeau.webp` | `DAGf9aiAXCg` | 7 | 560 × 397 | PNG p. 1 ; PDF p. 1 | Vérifier montants, codes, destinataires ou conditions propres à chaque version. |
| 3 | `atelier-prospectus.webp` | `DAGjq8ows78` | 3 | 560 × 794 | PNG p. 1 ; PDF p. 1 | Vérifier tarifs, coordonnées publiques et version finale. |
| 3 | `atelier-rollup.webp` | `DAGgUM90OG8` | 3 | 2646 × 7560 | PNG p. 1 ; PDF p. 1 | Vérifier la version finale et les coordonnées ; préserver le format vertical. |
| 3 | `utex-identite.webp` | `DAG6QM73mFc` | 4 | P. 1–3 : 794 × 560 ; p. 4 : 794 × 1123 | PNG p. 1 | Formats mixtes ; vérifier que les supports et coordonnées sont publics. |
| 3 | `utex-halloween.webp` | `DAG1BKvRHUw` | 8 | P. 1–3 : 794 × 1123 ; p. 4–8 : 1920 × 1080 | PNG p. 1 ; PDF p. 1 | Événementiel et formats mixtes : ne pas publier toutes les variantes ou informations internes. |
| 3 | `utex-centenaire.webp` | `DAGx6hlsUKI` | 12 | 794 × 1123 | PNG p. 1 | Le document contient des propositions : valider les créations finales et les droits de marque. |

Les risques de la dernière colonne sont des points de contrôle, pas l’affirmation que chacune de ces pages contient effectivement des données confidentielles. Aucun contenu stratégique détaillé, montant, nom de tiers ou coordonnée privée n’est reproduit ici. L’inspection des métadonnées et des miniatures n’est pas une validation exhaustive de confidentialité.

## Procédure d’export et de mise à disposition

1. Ouvrir le design correspondant à son ID vérifié, sans dupliquer, modifier ou changer son partage.
2. Dans le téléchargement Canva, sélectionner explicitement la page proposée. Ne pas garder « toutes les pages » par défaut. Pour Annieck, sélectionner la page 3.
3. Pour les aperçus web, privilégier un PNG rendu depuis le design. Utiliser la taille native, ou une résolution supérieure seulement si Canva l’offre réellement dans la formule actuelle. Un export PDF de la page est préférable à l’agrandissement artificiel d’une petite miniature pour préserver le texte et les éléments vectoriels.
4. Pour les documents publics, exporter uniquement les pages relues et autorisées. Choisir un PDF de consultation, ou un PDF pour impression si ce choix est disponible et nécessaire. Écarter les repères d’impression inutiles pour le portfolio. Une copie PDF sélective évite de rendre tout le document de travail Canva accessible.
5. Après téléchargement, vérifier le fichier réel : format, dimensions, proportions, page sélectionnée, lisibilité du texte, absence de filigrane, absence de données privées et crédits/droits applicables. Ne pas annoncer « HD » avant cette vérification.
6. Publier ensuite seulement les fichiers validés à une adresse stable du portfolio. Les liens de téléchargement temporaires Canva ne doivent pas être intégrés au code ni servir de liens permanents. Mettre à jour le manifeste avec le fichier, ses dimensions et sa vraie provenance ; générer les variantes web à partir de cet original, jamais à partir de l’ancienne miniature.

Les permissions de partage Canva restent inchangées. Un lien de consultation retourné par le compte connecté ne prouve pas qu’un visiteur anonyme peut consulter le document. Pour un lien Canva conservé, vérifier séparément son accès anonyme avant de le présenter comme public.

## Limite des anciennes URLs du manifeste

Les quatre URLs `/d/…` des calendriers ont été essayées avec `resolve_shortlink` : « Shortlink not found ». L’URL du mural donnée à `read_design` a également été refusée comme format invalide. Les recherches Canva renvoient de nouvelles URLs `/d/…` pour les mêmes IDs. Cela ne prouve pas à lui seul un défaut d’accès dans un navigateur ; cela empêche simplement de considérer ces alias comme des identifiants stables ou comme une preuve de partage public.

Les IDs ci-dessus proviennent de la correspondance initiale conservée par l’agent principal puis ont été vérifiés par `read_design`. Ils évitent les ambiguïtés entre copies : par exemple, plusieurs documents Ardhi portent le même titre, mais le portfolio pointe ici vers `DAGN7a7mBuA` ; le pitch Agorafrik retenu est `DAGWf-5mlgI`, pas l’autre pitch plus récent.

## Références officielles et disponibilité

- [Canva — `get-export-formats`](https://www.canva.dev/docs/apps/mcp/tools/get-export-formats/) : l’outil officiel permet de contrôler formats et pages exportables, mais n’est pas exposé dans cette session.
- [Canva — `export-design`](https://www.canva.dev/docs/apps/mcp/tools/export-design/) : renvoie des liens de téléchargement d’un véritable export ; outil absent de cette session. Les URL signées expirent.
- [Canva — création d’un export par API REST](https://www.canva.dev/docs/apps/rest-apis/reference/exports/create-design-export-job/) : route officielle PNG/JPG/PDF avec sélection de pages et OAuth. Elle nécessite une intégration autorisée ; aucun jeton n’a été recherché, extrait ou réutilisé hors du connecteur. La documentation indique que les liens de résultat durent 24 heures.

## Résultat de la tentative d’export par le navigateur

Une connexion Google a été choisie par l’utilisatrice dans le formulaire sécurisé. La validation par clé d’accès a ensuite renvoyé une erreur générique « Something went wrong ». Les tentatives automatiques ont été arrêtées à ce premier échec, sans changer de méthode, rechercher de jeton ou modifier la sécurité du compte. L’option de confiance durable dans ce navigateur n’a pas été activée.

État au 18 novembre 2026 : **sélection et procédure prêtes ; aucun export HD/PDF obtenu**. La reprise nécessite un accès Canva fonctionnel ou la fourniture des exports retenus. Aucun changement des permissions de partage n’a été effectué. Le domaine confirmé et la typographie sont documentés séparément dans `AUDIT_ASSETS.md`.
