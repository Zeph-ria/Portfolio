# Audit des visuels, de la référence et des domaines

## Décision de livraison — 20 novembre 2026

Le point de provenance des fichiers Wremena est résolu par l’intégration des **WOFF officiels historiques** : Regular archivé en 2018 et Bold archivé en 2019, inchangés. Les deux conversions tierces CDNFonts ont été remplacées. La déclaration de diffusion officielle archivée en 2018 et 2022, les URL des binaires et leurs empreintes sont consignées dans [docs/FONT_PROVENANCE.md](docs/FONT_PROVENANCE.md).

La famille Wremena, les tailles et les couleurs sont conservées. Les 119 caractères utilisés et déjà couverts gardent les mêmes avances horizontales. L’enquête du 18 novembre reproduite ci-dessous décrit l’état antérieur à cette décision ; les paragraphes qui indiquent qu’aucun fichier n’a été remplacé se rapportent à cette ancienne passe.

Les deux miniatures L’Atelier restent une limite de qualité des sources disponibles. Elles sont identifiées dans la visionneuse et n’empêchent pas la présentation des 23 créations.

État des visuels actualisé le **19 novembre 2026**. L’enquête typographique et la vérification du domaine ci-dessous datent du 18 novembre. Cette mise à jour distingue les exports obtenus, les deux miniatures encore utilisées et la provenance des polices existantes.

## Visuels intégrés

Le portfolio présente **23 créations : 21 vrais exports Canva et 2 miniatures L’Atelier**. Les images de pleine définition sont conservées dans `assets/` ; les variantes de cartes sont séparées dans `assets/thumbs/`. Le manifeste associe les fichiers à leur ID Canva, à la page sélectionnée, à leurs dimensions réelles et à leurs empreintes.

| Ensemble | État au 19 novembre 2026 |
| --- | --- |
| Quatre calendriers Carrigrès | Exports obtenus : mural 1815 × 2571, table 2000 × 1382, triptyque 1228 × 3024, sous-main 2268 × 1512 |
| Agorafrik | Charte, visuels, publication et pitch exportés ; page 17 retenue pour le pitch après exclusion de la couverture portant un filigrane |
| Ardhi Organic et Kadea | Exports obtenus ; page 3 retenue pour l’affiche Kadea |
| Carrigrès, Bloom, Annieck, Re-vendre, UTEX | Pages sélectionnées exportées ; Annieck conserve la page 3 |
| Halloween UTEX | PNG original 1414 × 2000 intact, présenté comme création historique de 2025 |
| L’Atelier | Prospectus 375 × 533 et roll-up 264 × 755 conservés comme miniatures ; export bloqué par des médias source manquants |
| Breathe & Rise Without Fear | Capture réelle du site confirmé, 1348 × 926 |

Les cartes utilisent des variantes WebP limitées à 900 px sur le côté long pour réduire les données chargées. La visionneuse et le téléchargement utilisent le fichier de pleine définition. La limitation de qualité des deux miniatures L’Atelier reste signalée.

## Provenance et choix de sélection

L’accès Canva a été rétabli après l’échec de connexion décrit dans la première version de cet audit. Les exports proviennent du téléchargement officiel des pages sélectionnées, sans modification des paramètres d’URL de miniatures. Les dimensions retenues sont celles des fichiers téléchargés, et non des anciennes métadonnées de page.

Les 20 WebP de pleine définition sont des conversions des exports PNG sans changement de dimensions ni recadrage. Le PNG Halloween est conservé intact avec ses données de provenance. Cette conservation ne vaut pas vérification indépendante de sa signature C2PA. Les variantes légères sont identifiées séparément dans le manifeste.

Pour le pitch Agorafrik, la page 1 portant un filigrane a été écartée ; la page 17 de conclusion est utilisée sans modification du portrait. Pour Kadea, l’affiche finalisée de la page 3 remplace la sélection provisoire. Les autres pages retenues et les exceptions sont détaillées dans [EXPORT_PLAN.md](EXPORT_PLAN.md) et [docs/ASSET_EXPORTS.md](docs/ASSET_EXPORTS.md).

L’affichage et le téléchargement du visuel local ne demandent pas de connexion Canva. Les liens des documents sources restent distincts et peuvent demander une session Canva. Leurs permissions de partage n’ont pas changé.

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

## Périmètre de cette mise à jour

Les constats ci-dessus décrivent les fichiers réellement intégrés et les pages sélectionnées pour le portfolio. Ils ne transforment pas l’inventaire de 296 pages en publication intégrale des documents Canva. Les nouveaux exports, les variantes et les dimensions sont vérifiables dans `assets-manifest.json` ; les contrôles de code et de navigateur sont consignés dans `QA_REPORT.md`.

La palette bordeaux, la typographie et les tailles validées sont conservées pendant cette intégration. L’enquête Wremena reste un constat daté de provenance : aucun fichier de police n’a été remplacé, aucune licence n’a été acceptée et aucune mise en production n’est attestée par cet audit.
