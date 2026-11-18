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

## Typographie : enquête de provenance approfondie

Complément du 18 novembre 2026. Aucun compte créé, contact envoyé, contrat accepté, fichier de police installé ou fichier du dépôt remplacé. Les anciennes fontes publiques ont uniquement été lues en mémoire pour comparaison technique.

### Référence Nice People : distinguer la police du site et le logotype

Le grand masthead actuel est une image `NicePeople_MainLogo_Horizontal.png` de 2634 × 432 pixels. Un élément d'image ne permet pas de retrouver sa police source en lisant la CSS du texte voisin.

La recherche historique apporte une preuve supplémentaire : le code du site officiel archivé le 3 février 2023 charge bien **Wremena** dans `WebFontConfig`, avec Nitti. Il comporte cependant des fichiers de logotype séparés. Un ancien `NicePeople_Logo_v1_L.svg`, référencé par ce site officiel, contient neuf tracés vectoriels, sans élément de texte ni nom de police, et a été exporté par Adobe Illustrator. Cela confirme l'utilisation historique de Wremena sur le site, pas l'identité exacte du dessin du masthead actuel.

Les profils publiés par Nice People et Amber Asay ont également été consultés. Aucun crédit primaire nommant la police source ou le dessinateur précis de ce masthead n'a été trouvé. Ne pas transformer la présence de Wremena dans une configuration de site en preuve de la police du logotype. Ne pas reprendre la marque Nice People elle-même.

Sources primaires :

- [Nice People actuel](https://nicepeople.com/)
- [Site officiel archivé, 3 février 2023](https://web.archive.org/web/20230203155413/https://nicepeopleco.com/)
- [Ancien SVG référencé par le site officiel](https://freight.cargo.site/t/original/i/6a86b56ea56da60aff7aa67631a2aca3367020cce864193483874acb6830908d/NicePeople_Logo_v1_L.svg)
- [Portfolio publié par Nice People](https://www.behance.net/nicepeopleco) et [profil d'Amber Asay](https://www.behance.net/amberasay)

### Les conditions Wremena ont effectivement changé

Les sources contradictoires ne sont pas toutes nécessairement inventées : l'ancien site officiel portait une déclaration différente de celle du site actuel.

| Source officielle datée | Condition observée |
| --- | --- |
| Page de téléchargement du 4 janvier 2018, également vérifiée au 22 janvier 2022 | Wremena Light/Regular/Bold sont proposées avec la mention exacte : « The typefaces are provided without any copyright restrictions. » |
| Même page au 16 mai 2022 et au 30 janvier 2023 | Les fontes gratuites renvoient désormais à la licence régulière, avec utilisateurs et pages vues illimités. |
| Catalogue et parcours actuels | Le package Wremena reste marqué gratuit ; le parcours demande de contacter la fonderie avant modification, création de dérivés ou partage. |

L'ancienne déclaration constitue donc une **preuve primaire historique**, pas une autorisation reconstituée depuis un annuaire. Elle ne suffit toutefois pas à prouver que les conversions de fichiers obtenues via CDNFonts ont été distribuées dans cette chaîne précise. Une date ou un numéro de version ne constitue pas, à lui seul, une licence attachée à chaque copie. Aucun avis juridique absolu sur l'effet des changements ultérieurs n'est donné ici.

Sources : [4 janvier 2018](https://web.archive.org/web/20180104161648/http://typefaces.temporarystate.net:80/download/), [22 janvier 2022](https://web.archive.org/web/20220122195638/https://typefaces.temporarystate.net/download/), [16 mai 2022](https://web.archive.org/web/20220516142024/https://typefaces.temporarystate.net/download/), [licence régulière archivée](https://web.archive.org/web/20230130014751/https://typefaces.temporarystate.net/license/), [catalogue actuel](https://type.tmpstate.net/get/fontpackages/) et [parcours actuel](https://type.tmpstate.net/static/static/js/views/shop.js).

### Provenance des fichiers : comparaison effectuée, pas seulement le nom

Les deux WOFF locaux indiquent `001.000` dans leur table `name`, `1.0` dans `head`, The Temporary State comme auteur, et un copyright 2016. Ils ne contiennent ni texte de licence ni URL de licence dans les champs prévus (`nameID` 13 et 14). Leur provenance déclarée reste CDNFonts. Sa [CSS Wremena](https://fonts.cdnfonts.com/css/wremena) référence les mêmes noms de fichiers ; leurs tailles annoncées correspondent, avec une date de modification serveur du 5 février 2022. Cette concordance ne démontre pas à elle seule une autorisation de redistribution.

Comparaison en mémoire avec deux WOFF servis publiquement par l'ancien site officiel, archivés pendant la période de déclaration sans restrictions :

| Fichier | Version interne | Contours | Taille | Glyphes |
| --- | --- | --- | ---: | ---: |
| Regular local | 001.000 / 1.0 | CFF | 39 924 octets | 528 |
| Regular officiel, archive du 14 juin 2018 | 001.000 / 1.0 | TrueType `glyf` | 35 232 octets | 531 |
| Bold local | 001.000 / 1.0 | CFF | 43 108 octets | 528 |
| Bold officiel, archive du 19 décembre 2019 | 001.000 / 1.0 | TrueType `glyf` | 36 652 octets | 533 |

Les fichiers ne sont donc **pas identiques octet pour octet**, ni simplement le même WOFF avec une autre compression. Pour Regular 2018, 480 caractères Unicode sont communs ; les métriques diffèrent pour `*`, U+2042 et U+2051. Pour Bold 2019, 476 caractères sont communs ; six métriques diffèrent. Les avances et boîtes englobantes des capitales `A C G N O P E I R L U S M T F` sont en revanche identiques dans les deux paires sondées. Une comparaison de commandes de contours brute n'est pas probante entre courbes TrueType et CFF : elle ne doit pas être présentée comme une preuve de dessins entièrement différents.

Empreintes SHA-256 pour une vérification ultérieure :

```text
Regular local   4d7fed170fe78f5dcadf9379a9a3ba50a18a200918855c749536b1a3f3fea805
Regular 2018    7e06b3641d48bdf6a816e3539ae685ed9f0323da8c670a1d4d45e7ca86f487ed
Bold local      85e7941d25e564d3c631b6ccd18327925b8a566adf94756f951daa4d629985f1
Bold 2019       ae7996a3a935f2958241cd9765c025dac3f0492ecb0974c3544b2d7eabac797f
```

Sources binaires officielles archivées : [Regular 2018](https://web.archive.org/web/20180614161740id_/http://typefaces.temporarystate.net:80/assets/webfonts/WremenaRegular.woff), [Bold 2019](https://web.archive.org/web/20191219044444id_/http://typefaces.temporarystate.net/assets/webfonts/WremenaBold.woff). Aucun de ces fichiers n'a été copié dans le dépôt.

La [fiche officielle actuelle](https://type.tmpstate.net/get/fontinfo/Wremena/) indique une version **1.10 du 14 février 2024**, avec extension du jeu de caractères, après la version 1.00 du 28 avril 2017. Les WOFF locaux ne sont donc pas cette dernière version.

### Route actuelle explicitement prévue pour le web

La [licence officielle Single User](https://type.tmpstate.net/info/licenses/private/), dont le texte complet est disponible dans [l'API officielle des licences](https://type.tmpstate.net/get/licenses/), permet en section 2 l'usage de `@font-face` sur les sites possédés ou contrôlés par le licencié. L'option actuelle est plafonnée à 50 000 visiteurs uniques mensuels cumulés. Son résumé vise les indépendants sans salariés ou les projets personnels ; l'éligibilité de la personne doit être vérifiée.

La section 3 interdit la redistribution des fichiers à des tiers. Les licences web et la distribution du binaire dans un dépôt public ne sont donc pas la même permission. La section 6 permet la conversion de format et les sous-ensembles, mais cette permission ne remplace pas l'acquisition de la licence correspondante.

### Deux suites concrètes qui préservent Wremena

1. **Route actuelle, la plus claire pour un nouveau déploiement :** faire acquérir par la titulaire le package Wremena officiel sous la licence adaptée, conserver le justificatif, puis auto-héberger les WOFF autorisés pour le site. Écarter les binaires du dépôt public et les injecter au déploiement depuis un stockage privé adapté, sans changer la famille Wremena. Toute intégration reste à valider visuellement ; elle n'a pas été exécutée ici, et aucune licence n'a été acceptée à la place de la titulaire.
2. **Route historique à faire valider avant usage :** utiliser une distribution officielle archivée, rattachée à la déclaration historique ci-dessus, plutôt qu'une conversion tierce sans chaîne de provenance. Les sources et empreintes permettent désormais une décision documentée. Les variantes techniques détectées imposent une comparaison visuelle et FR/EN avant remplacement ; l'audit ne prétend pas que l'image serait rigoureusement inchangée.

Il n'est pas nécessaire de choisir arbitrairement une autre famille pour avancer. Ce qui demeure non résolu est l'autorisation applicable aux fichiers CDN présents et l'identification exacte du dessin du masthead Nice People, non l'existence d'une voie officielle d'usage web de Wremena.

## Domaine du site de la sœur

Gloria a explicitement confirmé le domaine voisin dans son message : « C’est le domaine voisin et travail sur les deux autres points ». L'adresse retenue est donc **https://breathewithoutfear.org/**, avec un `e` après `breath`. Ce choix ne repose plus sur une simple déduction à partir des métadonnées.

Le contrôle HTTP du 18 novembre 2026 a obtenu une réponse 200. La page rendue dans le navigateur est **https://breathewithoutfear.org/en**. Elle présente l'initiative Breathe & Rise Without Fear de Marie Desy, consacrée à la sensibilisation aux violences faites aux femmes et à l'autonomie des jeunes mères en Irlande. La capture réelle `assets/breathe-without-fear-site.jpg` mesure 1348 × 926 pixels et pèse 84 947 octets ; elle n'a été ni retouchée ni agrandie.

La carte du portfolio a été corrigée dans les trois langues, avec la vraie capture, l'URL confirmée et sans statut « en préparation ». L'attribution préexistante « Conception du site » est conservée à partir du contexte utilisateur ; les métadonnées publiques ne sont pas présentées comme une preuve de ce rôle. Les autres compositions web restent identifiées comme éditoriales.

## Avancement concret des exports

Les 23 designs du portfolio ont été relus par leurs IDs Canva. Les 296 pages et les formats mixtes sont inventoriés dans [EXPORT_PLAN.md](EXPORT_PLAN.md), sans recopier les contenus stratégiques ou coordonnées privées. La sélection initiale vise les pages déjà représentées, pas une publication automatique de tous les documents.

Aucun outil d'export n'étant exposé, une connexion normale au navigateur a été tentée avec la méthode choisie par l'utilisatrice, via le mécanisme sécurisé. Google a affiché une erreur générique à l'étape de validation par clé d'accès ; les tentatives automatiques ont été arrêtées à ce premier échec. Aucun secret n'a été recopié dans le projet, aucune permission de partage n'a changé et aucun export HD/PDF n'a été obtenu. La suite exige un accès Canva fonctionnel ou des fichiers exportés fournis par la titulaire.

## Limites de l'audit

Cet audit couvre les fichiers d'images et de polices locaux, la provenance déclarée, la disponibilité technique de l'export et les sources publiques consultées. Il ne vaut pas autorisation des clients, validation de la confidentialité de chaque page, licence typographique, ni preuve de l'accessibilité publique de tous les documents Canva.
