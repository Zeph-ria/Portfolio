# Audit des visuels, de la référence et des domaines

Vérifications en lecture seule effectuées le 18 novembre 2026. Ce document distingue les observations vérifiées des validations encore nécessaires. Aucun design Canva, droit de partage ou domaine n'a été modifié par cet audit.

## Visuels réels présents

Les 23 fichiers WebP sont des aperçus de documents Canva, pas des exports haute définition. Le manifeste `assets-manifest.json` associe chaque fichier à ses dimensions natives et au document déjà lié dans le portfolio.

- Les grandes présentations horizontales sont généralement limitées à 596 × 336 pixels.
- Les publications portrait sont généralement limitées à 400 × 500 pixels.
- Les quatre calendriers Carrigrès sont bien distincts : mural (375 × 532), table (538 × 372), triptyque (284 × 700) et sous-main (547 × 365).
- Le roll-up L'Atelier ne mesure que 264 pixels de large ; une vue plein écran ne peut pas y rendre les petits textes lisibles.

Le fait d'avoir un lien Canva ne confirme pas l'accès anonyme, ni les droits de publication des éventuels éléments clients. Les liens ne doivent pas être rendus publics par modification des autorisations sans validation.

### Présentation honnête en attendant les originaux

Conserver les proportions, afficher les créations entières et éviter de présenter un agrandissement comme un export HD. Un agrandissement peut aider à voir la composition, mais ne restitue aucun détail perdu. Garder un accès au document source, avec une mention d'aperçu si nécessaire. Les textes légaux, la stratégie interne ou les données client éventuellement contenus dans des pages supplémentaires doivent être revus avant publication.

### Route pour obtenir la vraie qualité

Le connecteur Canva exposé pendant cet audit propose la recherche, la lecture et les miniatures de pages ; aucun outil d'export ou de téléchargement de design n'y est disponible. La documentation officielle Canva décrit bien un export PNG/JPG/PDF ainsi qu'un outil MCP `export-design`, mais sa présence dans la documentation ne le rend pas disponible dans cette session.

La prochaine étape sûre est de recevoir les exports autorisés depuis Canva, ou d'utiliser un export connecté lorsqu'il est réellement disponible. Pour le portfolio : fichiers PNG/JPG originaux des meilleures pages, et PDF autorisés pour les documents complets. Les URL d'export signées sont temporaires ; elles ne doivent pas devenir des liens permanents dans le code. Ne pas modifier les paramètres des URL de miniatures signées pour tenter d'obtenir une autre résolution.

Sources primaires :

- [Canva — export-design](https://www.canva.dev/docs/apps/mcp/tools/export-design/)
- [Canva — API d'export](https://www.canva.dev/docs/apps/rest-apis/reference/exports/create-design-export-job/)

## Typographie : ce qui est vérifié et ce qui ne l'est pas

### Référence Nice People

Le grand titre de la page Nice People actuelle est servi sous forme d'image nommée `NicePeople_MainLogo_Horizontal.png`, de 2634 × 432 pixels. Le HTML de la page le référence directement. Ce n'est donc pas un titre HTML dont on pourrait simplement copier la propriété `font-family`.

La feuille de styles actuelle indique notamment `Favorit Variable` pour les titres et le texte, ainsi que Diatype et Monument Grotesk dans d'autres règles. Aucune déclaration Wremena n'y a été identifiée. Cela ne permet pas d'identifier avec certitude la police d'origine du logotype ni de prouver qu'il n'a pas été dessiné ou modifié.

**Conséquence :** Wremena peut servir de choix stylistiquement proche pour le nom de Gloria, mais il ne faut pas la présenter comme la police exacte du logotype Nice People. Ne pas reprendre le logotype de Nice People lui-même. La capture approuvée et le site actuel peuvent aussi différer ; ce constat concerne le site public au jour de l'audit.

Sources primaires : [page Nice People](https://nicepeople.com/) et [feuille de styles publique](https://nicepeople.com/stylesheet).

### Wremena et redistribution

Les fichiers locaux sont `Wremena-Regular.woff` et `Wremena-Bold.woff`, obtenus précédemment via CDNFonts selon le README. L'audit n'a pas établi que ces fichiers tiers correspondent à la dernière distribution officielle, ni qu'ils sont accompagnés d'une autorisation de redistribution dans un dépôt public.

La fonderie The Temporary State attribue Wremena à Roman Gornitsky. Son API officielle marque la famille Light/Regular/Bold comme gratuite (`is_free: true`). Elle indique une version 1.10 publiée le 14 février 2024.

La gratuité n'est cependant pas une preuve de redistribution libre : le parcours officiel de commande précise que les polices gratuites restent assorties de conditions, et demande de contacter la fonderie avant modification, création de dérivés ou partage. Il faut donc obtenir les conditions applicables aux fichiers autorisés et confirmer l'auto-hébergement web ainsi que leur présence dans le dépôt public. Ne pas présenter Wremena comme domaine public ou sous licence OFL sur la seule foi d'un annuaire tiers.

**Point à valider avant publication :** permission/document de licence correspondant aux WOFF distribués. L'audit n'a ni remplacé la police ni contacté la fonderie. Ce constat n'établit pas une interdiction de tout usage web ; il laisse la redistribution des fichiers actuels non vérifiée.

Sources primaires :

- [Wremena — The Temporary State](https://type.tmpstate.net/preview/Wremena/Regular/overview/)
- [Métadonnées Wremena](https://type.tmpstate.net/get/fontinfo/Wremena/)
- [Catalogue des packages](https://type.tmpstate.net/get/fontpackages/)
- [Conditions affichées dans le parcours de commande](https://type.tmpstate.net/static/static/js/views/shop.js), section affichée pour les polices gratuites

## Domaine du site de la sœur

| URL | Observation vérifiée le 18 novembre 2026 | Conséquence |
| --- | --- | --- |
| `https://breathwithoutfear.org/` | Titre « Coming Soon » et nom du domaine dans la page | C'est l'adresse donnée par l'utilisatrice ; ne pas la présenter comme un site terminé en ligne. |
| `https://breathewithoutfear.org/` | Titre « Breathe & Rise Without Fear \| Women's Advocacy in Ireland » ; métadonnées indiquant Marie Desy et une initiative d'accompagnement des femmes en Irlande | Domaine très proche et actif, mais l'identité du projet doit être confirmée avant toute substitution. |

Ne pas corriger silencieusement l'URL en ajoutant le `e`. La proximité des noms et les métadonnées rendent l'hypothèse plausible, sans prouver le lien familial ni le rôle de Gloria. Une représentation graphique dans le portfolio doit être décrite comme une composition éditoriale si ce n'est pas une vraie capture du site.

## Limites de l'audit

Cet audit couvre les fichiers d'images et de polices locaux, la provenance déclarée, la disponibilité technique de l'export et les sources publiques consultées. Il ne vaut pas autorisation des clients, validation de la confidentialité de chaque page, licence typographique, ni preuve de l'accessibilité publique de tous les documents Canva.
