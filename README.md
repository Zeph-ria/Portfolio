# Gloria Tumsifu Kasunzu — Portfolio

Portfolio professionnel en français, anglais et espagnol, publié sur [GitHub Pages](https://zeph-ria.github.io/Portfolio/) depuis le dépôt [Zeph-ria/Portfolio](https://github.com/Zeph-ria/Portfolio).

## Sélection du 20 novembre 2026

Le portfolio présente **11 projets, 77 pages de réalisations, 4 calendriers et 6 captures de sites web**. Les **87 pages** se consultent dans des présentations et une visionneuse locales. La sélection explique les objectifs, les choix, les livrables et le rôle de Gloria. Les liens Canva sont facultatifs et limités aux documents dont l’ensemble peut être montré.

| Projet | Pages | Angle présenté |
| --- | ---: | --- |
| Carrigrès | 6 | Identité, communication, WordPress et collecte des demandes de devis |
| UTEX Empreinte | 5 | Conception d’un programme ESG, architecture des actions et communication pédagogique |
| Agorafrik | 12 | Logo, charte actualisée, photographie et applications |
| Re-vendre | 15 | Identité, silhouettes et campagne carte cadeau |
| L’Atelier Nail Salon | 10 | Identité, manucure et série de conseils |
| Wali | 10 | Mise en scène produit, matières et nuanciers |
| Bloom Atelier | 4 | Roses préservées et contenus de marque |
| Ardhi Organic | 6 | Stratégie de notoriété et direction de contenu |
| Luminary | 3 | Storyboard, structure narrative et script |
| Annieck’s | 4 | Gamme, couleurs et silhouettes |
| UTEX / TEXAF | 2 | Communication événementielle |

La section édition réunit les quatre calendriers Carrigrès : mural, table, triptyque et sous-main. Les sites Carrigrès et Breathe & Rise Without Fear disposent chacun de trois captures réelles, avec accès au site public.

Les projets exclus par Gloria ne figurent plus dans l’interface ni dans les traductions. Les créations du parcours Kadea sont présentées comme des projets de marque ou des concepts, avec leur contexte et leur rôle.

## Direction artistique conservée

La feuille `styles.css` et les fichiers Wremena restent identiques à la version validée. Bordeaux `#652936`, noir `#0e0e0e`, blanc, Wremena et DM Sans sont conservés. Les deux feuilles complémentaires organisent les présentations, la navigation mobile et la visionneuse. Les titres ont un ajustement ciblé sous 360 px pour éviter leur découpe.

La navigation a trois destinations : **Travaux, À propos, Contact**. Sur téléphone, le bouton Menu ouvre une liste accessible au clavier ; Échap ferme le menu et rend le focus. Les liens de compétences réaffichent les projets éventuellement masqués par un filtre.

## Présentations et visionneuse

- Feuilletage par boutons, clavier ou défilement horizontal natif.
- Agrandissement de chaque page directement dans le portfolio.
- Calendriers en aperçu plein cadre ; image complète et non déformée dans la visionneuse.
- Zoom à la définition originale, téléchargement du fichier local et lien Canva facultatif.
- Retour du focus au visuel à la fermeture.
- FR/EN/ES pour l’interface, les légendes, les descriptions d’images et les études de cas ; les créations conservent leur langue d’origine.
- Préférence linguistique conservée ; les paramètres `?lang=fr`, `?lang=en` et `?lang=es` sont pris en charge.

Les documents sources qui contiennent des budgets, coordonnées, notes internes ou pages non finalisées ne sont pas proposés dans l’interface. Les seules pages sélectionnées et contrôlées sont exportées. Un visuel dont l’attribution personnelle n’est pas établie n’est pas présenté comme une création de Gloria.

## Données éditoriales et provenance

`content/projects.json` contient les textes FR/EN/ES et la sélection. `assets-manifest.json` documente les **88 fichiers originaux affichés** (87 pages de la visionneuse et un visuel de composition d’accueil distinct) et **82 variantes de cartes**, avec dimensions, taille et SHA-256.

Le reporting Carrigrès utilisé couvre janvier–septembre 2025 ; les données Google couvrent cinq mois depuis l’indexation. Le parcours documenté est WordPress → Tally → Google Sheets → suivi commercial. Aucune génération automatique de devis ni vente n’est déduite des conversations WhatsApp.

Les sources de travail complètes et les reçus d’import locaux ne sont pas destinés à la publication. Les sources publiques retenues figurent dans le contenu et le manifeste. La provenance typographique reste dans `docs/FONT_PROVENANCE.md`.

## Mise à jour des contenus

Aucune dépendance JavaScript ni étape de compilation n’est requise pour servir le site. Pour régénérer les sections après une modification du JSON ou un export contrôlé :

```bash
python scripts/build_portfolio.py --strict
python scripts/update_asset_manifest.py
```

Pillow est utilisé pour l’import et la mesure des images. Les imports conservent la composition entière dans les originaux et créent séparément les variantes légères.

## Vérification

```bash
node --test tests/static-contracts.mjs tests/interactions.test.mjs tests/i18n.test.cjs tests/domain.test.mjs
node tests/smoke.mjs
git diff --check
```

**44/44 tests réussis**, smoke test et contrôle du diff réussis. La première passe réelle dans le navigateur a parcouru 82 pages, contrôlé les quatre calendriers sur petit écran, le menu, le zoom, les filtres, les trois langues et un téléchargement identique au fichier original. Une passe complémentaire a contrôlé les cinq pages UTEX Empreinte, le zoom, le lien depuis les compétences et les textes FR/EN/ES à 320 px. Les observations et captures figurent dans `QA_REPORT.md` et `docs/qa/2026-11-20-curation/`.

`node tests/browser.mjs` est une suite d’acceptation autonome pour un environnement disposant de Playwright et Chromium. Elle n’installe rien et retourne le code 2 si l’infrastructure est indisponible. Elle n’a pas été exécutée dans cet environnement ; les contrôles réels rapportés proviennent de CUA et sont distingués des tests Node.
