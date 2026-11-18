# Rapport de vérification du portfolio

Date de la passe : **18 novembre 2026**

Branche contrôlée : `feat/editorial-portfolio-2026`

Périmètre : fichiers locaux de la branche et prévisualisation locale servie par le mécanisme Sites, observée dans un vrai navigateur via CUA.

## Conclusion

Les **34 tests unitaires et contrats**, ainsi que le smoke test, réussissent. Les vérifications interactives ont confirmé les langues FR/EN/ES, leur mémorisation, le filtrage de la galerie et le fonctionnement du dialogue. Les 23 fichiers d'image uniques se chargent dans le navigateur avec des dimensions naturelles non nulles. Les débordements réellement détectés dans la première passe responsive ont été corrigés ; la seconde passe ne les retrouve pas dans les 12 combinaisons contrôlées.

Ce résultat n'est ni une garantie d'absence de toute erreur, ni une validation de publication finale. La qualité HD des œuvres, les droits de diffusion, l'accès public aux documents, la redistribution des polices et le domaine officiel de Breathe Without Fear restent des validations distinctes. Aucune mise en production finale n'est attestée par ce rapport.

## Inventaire contrôlé

| Élément | Quantité ou état |
| --- | --- |
| Projets sélectionnés | 6 |
| Galerie filtrable | 18 créations |
| Archives complémentaires | 2 créations |
| Section « Sites web » | 3 projets |
| Fichiers WebP uniques | 23, tous recensés dans `assets-manifest.json` |
| Images sources dans le HTML | 25 occurrences ; deux œuvres sont réutilisées dans le bandeau |
| Image du dialogue | 1 élément dynamique, sans `src` initial ; source et dimensions affectées à l'ouverture |
| Calendriers Carrigrès | 4 fichiers distincts : mural, table, triptyque, sous-main |
| Langues d'interface | FR, EN, ES |

Les dimensions déclarées des 25 images sources et celles du manifeste correspondent aux dimensions lues directement dans les en-têtes des 23 WebP. Cette vérification établit les proportions et la cohérence des fichiers ; elle ne transforme pas les miniatures en exports HD.

Les créations Agorafrik, Ardhi Organic et Kadea sont présentes. Les projets Génération, Prayer Machine et Just1Pulse ne figurent pas dans le contenu public de la page. L'adresse personnelle interdite par les garde-fous du projet n'est pas réintroduite ; le contact proposé reste LinkedIn.

## Vérifications automatisées réellement exécutées

Commandes depuis la racine du dépôt :

```bash
node --test tests/static-contracts.mjs tests/interactions.test.mjs tests/i18n.test.cjs
node tests/smoke.mjs
git diff --check
```

| Suite | Résultat | Ce qu'elle vérifie |
| --- | --- | --- |
| `tests/i18n.test.cjs` | 16/16 réussis | Couverture FR/EN/ES, légendes et alt, métadonnées, mémoire de langue, stockage refusé, interpolation et rendu sûr |
| `tests/interactions.test.mjs` | 11/11 réussis | Vrai script exécuté sur fixture DOM : filtres, groupes, navigation d'aperçu, liens sources, langue, fermeture et états d'erreur |
| `tests/static-contracts.mjs` | 7/7 réussis | Structure HTML, références d'ID, cibles de liens, ressources, dimensions WebP, exclusions et catégories |
| `tests/smoke.mjs` | Réussi | Contrôles structurels complémentaires et invariants de contenu |
| `git diff --check` | Aucune anomalie signalée | Erreurs d'espacement et de patch dans le diff suivi |

La fixture DOM teste les états et les événements, pas le moteur de rendu, le décodage réel des images ou l'accessibilité avec un lecteur d'écran. Les tests statiques ne sont pas un validateur HTML normatif complet ni un audit de sécurité exhaustif.

## Vérifications dans le vrai navigateur

La prévisualisation a été servie localement par Sites puis ouverte via CUA. Ces observations sont distinctes de la suite Playwright.

| Scénario | Observation confirmée |
| --- | --- |
| Changement de langue | FR, EN et ES sélectionnables ; légendes, alt et métadonnées traduits |
| Rechargement | Langue choisie conservée après rechargement |
| Filtre « Identités » | 4 créations affichées ; les calendriers et leur titre sont masqués |
| Calendriers sur desktop | Les 4 formats sont visibles sur une même rangée de 4 colonnes |
| Ouverture d'un aperçu Agorafrik | Titre et lien source correspondant exactement à la création choisie |
| Navigation du dialogue | Compteur observé : `2/4 → 3/4 → 2/4` |
| Fermeture | Échap ferme le dialogue et restitue le focus au déclencheur |
| Médias | 23/23 fichiers uniques chargés via les groupes de la visionneuse ; `naturalWidth` et `naturalHeight` strictement positifs, aucun échec de chargement constaté |

Les tests unitaires apportent une couverture supplémentaire des clics Ctrl/Cmd, des erreurs d'image et du repli sans dialogue natif ; cette couverture ne doit pas être présentée comme une campagne manuelle sur plusieurs navigateurs.

### Journaux du navigateur

Les journaux récupérés contenaient 60 erreurs attribuées à une extension Chrome. Aucun message d'erreur ou d'avertissement attribué à l'application n'a été identifié dans ces journaux. Cela décrit les messages effectivement récupérés, pas une promesse de zéro bug ni une collecte exhaustive de toutes les erreurs possibles.

### Accès aux documents sources

Le lien Canva du [calendrier mural Carrigrès](https://www.canva.com/d/4Yteo_gyYVViINO) a été testé sans session connectée : il redirige vers la page de connexion. Le dialogue indique donc qu'un compte Canva peut être nécessaire.

Ce constat ne doit être étendu ni à la disponibilité ni à l'indisponibilité de tous les autres documents, qui n'ont pas fait l'objet d'une vérification anonyme exhaustive. Avant de promettre un accès public, obtenir un lien de consultation autorisé ou un PDF publiable et le vérifier sans session. Aucun changement implicite des droits de partage n'est autorisé par cette vérification.

## Responsive : 12 combinaisons contrôlées

La vérification utilise des iframes de largeur fixée dans le navigateur réel. La barre de défilement occupe 15 pixels dans cet environnement ; la largeur intérieure mesurée diffère donc de la largeur de l'iframe.

| Largeur de l'iframe | Largeur intérieure mesurée | FR | EN | ES |
| --- | --- | --- | --- | --- |
| 360 px | 345 px | Sans débordement détecté après correction | Sans débordement détecté après correction | Sans débordement détecté après correction |
| 390 px | 375 px | Sans débordement détecté après correction | Sans débordement détecté après correction | Sans débordement détecté après correction |
| 768 px | 753 px | Sans débordement détecté après correction | Sans débordement détecté après correction | Sans débordement détecté après correction |
| 1440 px | 1425 px | Sans débordement détecté après correction | Sans débordement détecté après correction | Sans débordement détecté après correction |

Le contrôle porte sur les titres, la navigation, le texte des compositions de produits et des aperçus web, ainsi que leur dépassement des conteneurs. Il ne se limite pas à l'absence de barre de défilement horizontale : un parent avec `overflow:hidden` peut masquer une coupure.

### Défauts détectés puis corrigés dans cette passe

- **Composition Gloria OS :** débordement du texte dans les formats étroits. Espacement, taille de la lettre et contraintes de largeur ajustés.
- **Grands titres espagnols :** débordements de certaines formes plus longues, notamment les rubriques d'archives, résultats et parcours. Échelles mobiles adaptées aux chaînes espagnoles.
- **Titre de contact anglais :** débordement en petit format. Taille mobile ajustée pour cette langue.

La matrice complète a été contrôlée à nouveau après les corrections, sans retrouver de débordement dans les éléments couverts. Cette méthode ne constitue pas un test sur téléphone physique : elle ne couvre pas les variations Safari/iOS, clavier virtuel, zoom utilisateur ou toutes les largeurs intermédiaires.

## Accessibilité et amélioration progressive

Les contrôles effectués couvrent les landmarks, l'unicité des ID, les références ARIA, les noms accessibles des commandes, les alt des images, le lien d'évitement, les états `aria-pressed`, les commandes du dialogue et le retour de focus observé après Échap. Les animations respectent la préférence de réduction du mouvement.

Le focus des liens sur le bandeau bordeaux a été renforcé par un contour blanc. Les dimensions d'image sont explicites pour réduire les changements de mise en page au chargement.

Les cartes conservent leurs URL sources. Le code n'intercepte que l'activation simple lorsque le dialogue natif est disponible ; sinon les documents restent accessibles par leurs liens, sous réserve de connexion et d'autorisation Canva. Cela a été vérifié dans les tests de logique, sans prétendre à un test manuel de tous les environnements sans JavaScript.

Une revue complète avec lecteur d'écran, zoom élevé, navigation exclusivement au clavier et plusieurs navigateurs reste à effectuer si elle est requise pour la publication.

## Suite navigateur disponible mais non exécutée

`tests/browser.mjs` contient une campagne Playwright pour le chargement des polices et des médias, les filtres, le dialogue, les langues, les dimensions responsive, le stockage refusé et le repli sans JavaScript.

La tentative de lancement dans l'environnement de tests a rencontré l'absence du navigateur Chromium attendu. La suite a explicitement indiqué qu'aucun test navigateur n'avait été exécuté et a renvoyé le code 2. Aucun navigateur n'a été installé pour contourner cette contrainte. Les vérifications CUA décrites plus haut sont la preuve de navigateur réellement obtenue dans cette passe ; elles ne sont pas un résultat Playwright.

N'ont pas été exécutés :

- Lighthouse, mesure des Core Web Vitals ou test de charge ;
- campagne automatisée Playwright complète ;
- campagne Safari/Firefox ou appareils physiques ;
- audit exhaustif au lecteur d'écran ;
- vérification anonyme de chaque document Canva et de toutes ses pages.

## Qualité éditoriale et validations avant publication

| Sujet | État et prochaine validation |
| --- | --- |
| Exports HD | Les 23 WebP sont des miniatures Canva. Recevoir des exports autorisés avant de présenter les œuvres comme détaillées ou HD. |
| Accès public aux documents | Le calendrier mural testé anonymement demande une connexion. Valider les liens de consultation ou PDF autorisés, sans promettre l'accès public sur la seule présence d'une URL. |
| Documents et confidentialité | Les liens ne prouvent pas l'autorisation client. Vérifier les pages réellement publiables sans changer les permissions de partage de manière implicite. |
| Police exacte de la référence | Non établie. Le logotype Nice People observé est une image ; Wremena ne doit pas être annoncée comme sa police identifiée avec certitude. |
| Licence des WOFF | L'auto-hébergement et la redistribution des fichiers actuels dans le dépôt restent à confirmer. Voir `AUDIT_ASSETS.md`. |
| Domaine Breathe Without Fear | Conserver l'adresse fournie `https://breathwithoutfear.org/`, observée en page d'attente, jusqu'à confirmation de l'adresse officielle. Ne pas substituer le domaine voisin par déduction. |
| Représentation des sites | Les compositions éditoriales sont identifiées comme telles ; elles ne sont pas des captures des sites réels. |
| Données du portfolio | Faire confirmer les rôles, chiffres, périodes et le contact professionnel par Gloria. |
| Mise en production | Non attestée par cette passe. Suivre séparément le workflow de revue et de publication du dépôt externe. |

Les observations et sources détaillées relatives aux œuvres, aux polices et aux domaines sont centralisées dans [AUDIT_ASSETS.md](AUDIT_ASSETS.md).

## Captures et traçabilité

Les captures suivantes proviennent de la prévisualisation contrôlée et doivent accompagner le rapport dans le dépôt :

| Preuve | Fichier |
| --- | --- |
| Vue desktop | [desktop.jpg](docs/qa/desktop.jpg) |
| Vue mobile 360 px | [mobile-360.jpg](docs/qa/mobile-360.jpg) |
| Galerie des quatre calendriers | [calendar-gallery.jpg](docs/qa/calendar-gallery.jpg) |
| Dialogue d'aperçu | [lightbox.jpg](docs/qa/lightbox.jpg) |

Les dimensions des captures correspondent à la fenêtre de prévisualisation. La largeur mobile testée est celle de l'iframe ; elle ne doit pas être déduite de la largeur du fichier JPEG.

<!-- QA_EVIDENCE_APPENDIX: compléter si un commit ou de nouvelles preuves sont ajoutés après cette passe. -->

- [x] Dimensions et provenance déclarée des 23 fichiers documentées dans le manifeste.
- [x] Chargement et dimensions naturelles des 23 fichiers uniques contrôlés dans le navigateur réel.
- [x] Quatre colonnes de calendriers observées et capture enregistrée.
- [x] Captures desktop, mobile, galerie et dialogue enregistrées.
- [ ] Associer le commit final contrôlé lorsque les changements sont enregistrés dans Git.

Le rapport porte sur l'état de travail testé. Toute modification ultérieure de contenu, de CSS, de traduction ou de média nécessite les contrôles correspondants ; la présence des captures ne valide pas automatiquement un état plus récent.
