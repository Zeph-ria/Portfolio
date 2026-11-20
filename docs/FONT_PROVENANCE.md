# Wremena — provenance de la distribution utilisée

Décision de livraison du **20 novembre 2026** : le portfolio utilise les fichiers WOFF officiels historiques de Wremena v1.00, récupérés depuis les archives du site de The Temporary State. Ils remplacent les conversions tierces CDNFonts présentes pendant la préparation.

## Sources officielles datées

La page de téléchargement officielle archivée le 4 janvier 2018 nomme Wremena Light, Regular et Bold et indique :

> The typefaces are provided without any copyright restrictions.

La même déclaration figure encore dans l’archive du 22 janvier 2022. Ces pages constituent le fondement de diffusion retenu pour les anciens fichiers ci-dessous. Cette provenance ne décrit pas les conditions des versions actuelles ou ultérieures de la famille.

- [Page officielle du 4 janvier 2018](https://web.archive.org/web/20180104161648id_/http://typefaces.temporarystate.net:80/download/)
- [Page officielle du 22 janvier 2022](https://web.archive.org/web/20220122195638id_/https://typefaces.temporarystate.net/download/)

## Fichiers effectivement intégrés

Les deux WOFF sont conservés sans conversion, modification ou sous-ensemble. Seuls leurs noms de fichiers locaux suivent les chemins déjà utilisés par le site.

| Fichier du portfolio | Source officielle archivée | Octets | SHA-256 |
| --- | --- | ---: | --- |
| `assets/Wremena-Regular.woff` | [14 juin 2018](https://web.archive.org/web/20180614161740id_/http://typefaces.temporarystate.net:80/assets/webfonts/WremenaRegular.woff) | 35 232 | `7e06b3641d48bdf6a816e3539ae685ed9f0323da8c670a1d4d45e7ca86f487ed` |
| `assets/Wremena-Bold.woff` | [19 décembre 2019](https://web.archive.org/web/20191219044444id_/http://typefaces.temporarystate.net/assets/webfonts/WremenaBold.woff) | 36 652 | `ae7996a3a935f2958241cd9765c025dac3f0492ecb0974c3544b2d7eabac797f` |

La famille et ses auteurs restent crédités à **The Temporary State** dans les métadonnées originales des fontes. La livraison ne transforme pas cette famille en création de Gloria.

## Conservation du rendu validé

Les 119 caractères du contenu qui étaient couverts par les anciennes fontes restent couverts par les fichiers officiels. Leurs avances horizontales sont identiques. Le nom CSS `Wremena`, les graisses 400/700, les tailles, les espacements et le bordeaux `#652936` sont conservés.

Les métriques verticales Regular sont identiques. Celles de Bold diffèrent ; le logo `GTK.` dispose déjà d’une hauteur de ligne explicite. Le contrôle visuel de livraison inclut ce logo et les grands titres. La correspondance avec le dessin du logotype Nice People reste une question distincte : le portfolio conserve la typographie Wremena déjà présentée et validée.

Les constatations antérieures sur les conversions tierces restent consultables dans [AUDIT_ASSETS.md](../AUDIT_ASSETS.md). La distribution retenue pour cette livraison est celle documentée ici.
