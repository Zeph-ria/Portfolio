# Gloria Tumsifu Kasunzu — Portfolio

Portfolio personnel en français, anglais et espagnol, développé en HTML/CSS/JavaScript sans dépendance de build. La version courante rassemble 6 projets sélectionnés, une galerie de 18 créations, 2 pièces d'archives et une section distincte de 3 projets web.

Le dépôt [Zeph-ria/Portfolio](https://github.com/Zeph-ria/Portfolio) est la source du projet. Les changements sont préparés sur la branche `feat/editorial-portfolio-2026` et doivent être relus avant intégration. Une prévisualisation locale et des tests réussis ne constituent pas une publication finale : les validations éditoriales et de droits ci-dessous restent nécessaires.

## Aperçu local

Depuis la racine du dépôt :

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Ouvrir ensuite [http://localhost:8000](http://localhost:8000). Aucun build n'est requis. Utiliser un serveur HTTP plutôt que l'ouverture directe du fichier HTML pour retrouver un comportement cohérent des ressources et de la préférence de langue.

## Direction artistique

- Noir : `#0e0e0e`
- Blanc : `#ffffff`
- Bordeaux : `#652936`
- Titres : Wremena, fichiers WOFF locaux
- Texte courant : DM Sans, chargé via Google Fonts, avec Arial comme repli

La palette et la typographie d'affichage structurent la direction éditoriale. Les tailles et retours à la ligne sont adaptés aux contenus et aux langues, notamment sur petit écran ; il ne s'agit pas d'une reproduction pixel par pixel de la capture de référence.

**La police exacte du logotype Nice People n'est pas confirmée.** Le grand logotype observé sur le site de référence est une image, pas un titre HTML dont la famille typographique serait directement récupérable. Wremena est le choix actuellement utilisé dans ce portfolio, pas une identification certaine de la police de ce logotype.

Les fichiers Wremena avaient été obtenus via CDNFonts. L'enquête complémentaire a retrouvé Wremena sur l'ancien site officiel Nice People, les conditions historiques de la fonderie et une licence actuelle prévoyant l'usage web. Elle distingue ces éléments de la redistribution des WOFF dans un dépôt public. Les binaires locaux restent inchangés ; aucune licence n'a été acceptée et aucune autre famille n'a été substituée. Les deux voies de distribution et la comparaison technique sont documentées dans [AUDIT_ASSETS.md](AUDIT_ASSETS.md).

## Structure

| Fichier ou dossier | Responsabilité |
| --- | --- |
| `index.html` | Contenu français de référence, structure sémantique, liens sources et dialogue d'aperçu |
| `styles.css` | Direction artistique, responsive, états de focus et réduction des animations |
| `i18n.js` | Traductions FR/EN/ES, métadonnées, textes alternatifs et préférence de langue |
| `script.js` | Filtres, compteurs, aperçu des créations et navigation du dialogue |
| `assets/` | 23 aperçus WebP, une vraie capture web JPEG, polices locales et favicon |
| `assets-manifest.json` | Provenance, dimensions natives et qualité déclarée de chaque aperçu et capture |
| `tests/` | Contrats statiques, tests unitaires et scénario navigateur séparé |
| `AUDIT_ASSETS.md` | Provenance et qualité des assets, typographie, domaines et droits à confirmer |
| `EXPORT_PLAN.md` | Les 23 designs Canva vérifiés, pages à exporter, formats et contrôles avant PDF public |
| `QA_REPORT.md` | Vérifications réellement effectuées, résultats et limites |
| `docs/qa/` | Captures de la prévisualisation contrôlée |

## Langues et ajout de contenu

Le sélecteur propose FR, EN et ES. La langue choisie est conservée sous la clé `gtk-lang` dans `localStorage`. Une préférence invalide est ignorée ; un stockage indisponible ne bloque pas les contrôles. Les paramètres `?lang=fr`, `?lang=en` et `?lang=es` permettent également d'ouvrir une langue précise.

La traduction couvre les textes d'interface, les légendes de galerie, les descriptions alternatives des images, les libellés accessibles, le titre de page et les métadonnées. Les textes contenus dans les créations et dans les documents Canva conservent volontairement leur langue d'origine.

Pour toute nouvelle réalisation :

1. Fournir les trois langues. Le contenu historique `data-fr`/`data-en` possède un complément espagnol dans `i18n.js` ; pour du nouveau contenu, préférer un triplet explicite `data-fr`/`data-en`/`data-es`, ou une clé du catalogue commun.
2. Ajouter les légendes et descriptions d'image aux catalogues appropriés d'`i18n.js` lorsque l'asset entre dans la galerie.
3. Conserver les noms de marque et la langue des œuvres, sans remplacement automatique de mots dans les documents.
4. Mettre à jour `assets-manifest.json` et les attributs `width`/`height` avec les dimensions réelles de tout nouvel export.
5. Relancer les tests et vérifier les trois langues en prévisualisation.

Le contrôleur `window.PortfolioI18n` expose notamment `setLanguage`, `t`, `translate` et `registerMessages`. Il émet l'événement `portfolio:languagechange` avec `detail.language` ; les libellés et le contenu du dialogue ouvert sont alors actualisés.

## Galerie, aperçu et repli progressif

Les filtres des projets et de la galerie sont indépendants. Les cartes non retenues, les grilles vides et leurs titres sont masqués ensemble. Les quatre calendriers Carrigrès restent distincts : mural, table A5, triptyque et sous-main.

L'aperçu utilise un élément natif `<dialog>`. Il propose le visuel, son titre, un compteur, les commandes précédente/suivante et le lien du document source. La navigation respecte le groupe et les créations visibles ; les touches fléchées fonctionnent, Échap ferme l'aperçu et le focus revient au déclencheur.

Les liens d'origine ne sont pas supprimés. Sans JavaScript ou sans prise en charge du dialogue, les cartes de galerie et d'archives continuent d'ouvrir leur document Canva. Les activations Ctrl/Cmd conservent aussi la navigation native du navigateur. Les trois images de projets disposant d'un document source reçoivent un bouton d'aperçu uniquement lorsque cette amélioration est disponible.

Les 23 WebP actuels sont des **miniatures**, pas des exports HD. L'aperçu peut montrer la composition, mais ne recrée pas les détails absents du fichier source. Le document complet reste accessible par son lien, sous réserve de ses autorisations Canva.

**Un compte Canva peut être nécessaire.** Le lien du calendrier mural testé sans connexion redirige vers la page de connexion. La présence d'un lien source ne garantit donc pas un accès anonyme ; un lien de consultation autorisé ou un PDF publiable doit être validé avant de promettre un accès public aux documents.

Les 23 designs ont été relus par leur identifiant Canva (296 pages au total). [Le plan d'export](EXPORT_PLAN.md) privilégie les quatre calendriers, Agorafrik, Ardhi Organic et Kadea, en conservant la page 3 pour Annieck. Le connecteur disponible n'expose pas d'export. La tentative normale de connexion au navigateur a rencontré une erreur Google lors de la validation par clé d'accès ; elle a été arrêtée. Aucun export HD/PDF ni changement de partage n'est annoncé comme réalisé.

Le domaine **breathewithoutfear.org** a été confirmé par Gloria. La carte du site utilise désormais une capture réelle de la page active, prise le 18 novembre 2026 (1348 × 926 px), et non la composition provisoire. Sa description, son lien et ses textes accessibles sont vérifiés en FR/EN/ES.

## Tests

Les contrôles de code ne nécessitent aucune nouvelle dépendance npm :

```bash
node --test tests/static-contracts.mjs tests/interactions.test.mjs tests/i18n.test.cjs tests/domain.test.mjs
node tests/smoke.mjs
git diff --check
```

Au 18 novembre 2026, ces suites comptent 38 tests réussis, plus le smoke test. Les tests d'interaction exécutent le vrai script sur une fixture DOM limitée aux états et aux événements : ils ne remplacent pas une vérification du rendu dans un navigateur.

Une suite Playwright distincte est disponible pour un environnement où Playwright et un navigateur compatible sont déjà installés :

```bash
node tests/browser.mjs
```

Elle peut utiliser `PORTFOLIO_BROWSER_EXECUTABLE` pour désigner un navigateur déjà autorisé, ou `PORTFOLIO_BASE_URL` pour viser une prévisualisation autorisée. Sans URL, elle lance un serveur HTTP local temporaire en lecture seule. Elle n'installe pas de navigateur. **Le code de sortie 2 signale une infrastructure indisponible, pas des tests réussis.**

Une première vérification réelle via navigateur a couvert les langues, les filtres, le dialogue, les 23 œuvres et 12 combinaisons langue/largeur. La passe complémentaire couvre la nouvelle capture web et les cartes « Sites web » dans 18 combinaisons (FR/EN/ES × 360, 390, 650, 700, 768 et 1440 px). Les résultats, les corrections et les limites sont consignés dans [QA_REPORT.md](QA_REPORT.md). Ni Lighthouse, ni une campagne multi-navigateurs, ni des appareils physiques n'ont été validés dans cette passe.

## Workflow de revue et publication

1. Travailler dans une branche du dépôt externe, en préservant les modifications non liées à la tâche.
2. Contrôler les nouveaux contenus, les liens, la confidentialité et les droits de diffusion.
3. Exécuter les suites de code et vérifier la prévisualisation en FR, EN et ES.
4. Mettre à jour les audits si un asset, un domaine ou une condition de diffusion change.
5. Soumettre les changements à la revue du dépôt. Ne pas confondre mise à jour de branche, fusion et mise en production ; la publication doit suivre le workflow et les autorisations du projet.

### Validations encore nécessaires

- [ ] Recevoir les exports haute résolution autorisés et les éventuels PDF publiables, puis remplacer les miniatures sans liens d'export temporaires.
- [ ] Confirmer les droits de présentation des créations clients et l'accès souhaité aux documents. Vérifier les liens sans session Canva avant de les annoncer publics ; ne pas modifier leurs paramètres de partage sans accord.
- [ ] Confirmer la licence applicable aux WOFF Wremena présents, leur auto-hébergement et leur redistribution dans le dépôt.
- [x] Domaine du site de la sœur confirmé par Gloria : [breathewithoutfear.org](https://breathewithoutfear.org/). Ancienne adresse retirée du contenu public et vraie capture intégrée.
- [ ] Valider avec Gloria les rôles, chiffres, périodes et coordonnées professionnelles avant publication.
- [ ] Compléter, selon l'objectif de publication, la revue d'accessibilité assistive, les tests sur appareils physiques et la mesure de performance.

Les projets « Génération », « Prayer Machine » et « Just1Pulse » sont exclus. La section « Sites web » distingue Carrigrès, MASDIA en développement et Breathe & Rise Without Fear en ligne. Les visuels Carrigrès et MASDIA restent explicitement présentés comme des compositions éditoriales ; Breathe & Rise Without Fear possède une vraie capture du site.
