# StylIA — Prompt-maître complet

> Ce document est le cahier des charges exhaustif de StylIA. Il peut servir de
> prompt unique pour (re)générer l'application de zéro, de référence pour
> onboarder un développeur, ou de spécification pour toute évolution.
> Langue de travail : français. Interface : trilingue FR / EN / ES.

---

## 0. RÔLE & MISSION

Agis en tant qu'**Ingénieur Full-Stack Senior et Architecte de solutions IA**.
Tu construis **StylIA**, une application SaaS mondiale de **stylisme automatisé**
(design de mode) et de **modélisme paramétrique** (patronnage / coupe à plat).

L'objectif : transformer **une photo + quelques mesures corporelles** en un
**patron de couture au millimètre**, tracé selon les formules classiques du
modélisme (méthode de coupe à plat, réf. Teresa Gilewska « Le modélisme de
mode » vol. 1 & 2), rendu en **SVG interactif**, et exporté **prêt à imprimer**
(y compris en taille réelle).

Exigences transverses non négociables :
- **Responsive** (mobile-first, testé jusqu'à 390 px de large).
- **Trilingue** : français, anglais, espagnol — tout texte visible passe par i18n.
- **Bi-unités** : centimètres et pouces (1 pouce = 2,54 cm exactement), avec
  conversion en direct dans les formulaires.
- **UI haut de gamme « fashion-tech »** : palette ivoire d'atelier + encre +
  fil d'or, typographie serif de titrage (Cormorant Garamond) et sans-serif de
  corps (Jost).
- **Architecture modulaire** : ajouter un vêtement, une langue ou une étape de
  guide ne doit toucher qu'un seul fichier de registre.

---

## 1. STACK TECHNIQUE

| Couche | Choix |
|---|---|
| Framework | **Next.js 14** (App Router, TypeScript strict) |
| UI | **Tailwind CSS** (thème custom), composants React |
| Back-end | Route handlers Next.js (runtime Node) |
| Base de données | **SQLite** via `better-sqlite3` — schéma SQL pur, portable vers PostgreSQL |
| Auth | Email + mot de passe (bcrypt), sessions par jeton opaque en cookie HttpOnly |
| Paiement | **Stripe** (mode maquette d'abord, bascule native par variables d'env) |
| IA vision | **API Claude** (`claude-opus-4-8`, sorties structurées) pour classifier la photo |
| Moteur de patron | **TypeScript pur** — formules paramétriques, aucune dépendance |
| Export | Générateur **PDF vectoriel sans dépendance** (A4 / US Letter / A0 en mosaïque, ou taille réelle sur une feuille) + SVG imprimable (1 unité SVG = 1 mm) |

Principe directeur : **le moteur de patron est du TypeScript pur et testable**,
totalement découplé du rendu (SVG canvas, SVG fichier, PDF partagent la même
géométrie `Segment[]`).

---

## 2. SCHÉMA DE DONNÉES & AUTHENTIFICATION

Toutes les mesures linéaires sont **stockées en centimètres** (unité canonique,
précision 0,1 mm) ; l'UI convertit à la volée vers les pouces.

### Tables

**`users`** (profils)
- `id`, `email` (unique), `password_hash`, `display_name`
- `role` : `'hobbyist'` (Passionné) | `'professional'` (Tailleur professionnel)
- `unit` : `'cm'` | `'inch'` — préférence d'affichage
- `paper_format` : `'A4'` | `'USLetter'` | `'A0'`
- `locale` : `'fr'` | `'en'` | `'es'`
- `subscription_status` : `'none'` | `'active'` | `'past_due'` | `'canceled'`
- `created_at`

**`sessions`** — jetons de session opaques
- `id`, `user_id` (FK), `token_hash` (SHA-256 du jeton brut), `expires_at`, `created_at`
- Le cookie `stylia_session` HttpOnly / SameSite=Lax porte le jeton brut ;
  seul son hash est stocké.

**`measurements`** — un profil de mesures corporelles ("Moi-même", "Cliente X")
- `id`, `user_id` (FK), `profile_name`, `unit`
- `bust_circ` (tour de poitrine), `waist_circ` (tour de taille),
  `hip_circ` (tour de bassin), `waist_to_hip_height` (hauteur taille-bassin),
  `total_length` (longueur totale)
- `small_hip_circ` (tour des petites hanches, optionnel),
  `small_hip_height` (hauteur des petites hanches, optionnel)
- `created_at`, `updated_at`
- Contraintes CHECK : toutes les valeurs > 0.

**`projects`** — un travail de patronnage (photo → croquis → patron)
- `id`, `user_id` (FK), `measurement_id` (FK nullable)
- `name`, `garment_type` (slug du registre de vêtements)
- `status` : `'draft'` | `'generated'`
- `input_photo_url` (data URL de la photo), `output_svg_url`
- `textile_tags` (JSON array de slugs), `paid` (0/1 — export taille réelle débloqué)
- `created_at`, `updated_at`

**`textiles`** — base de connaissances tissus (Conseiller intelligent)
- `id`, `slug` (unique)
- `name_fr`, `name_en`, `name_es`
- `drape_type` : `'fluid'` | `'rigid'`
- `wash_shrinkage` (% de retrait), `iron_temp` (°C)
- `tips_fr`, `tips_en`, `tips_es`
- **Seed obligatoire (7 tissus)** : Coton, Lin, Soie, Viscose, Polyester,
  Laine, Denim — avec retrait, température de repassage et conseils dans les
  3 langues.

**`payments`** — sessions de checkout Stripe (maquette ou natives)
- `id`, `user_id` (FK), `project_id` (FK nullable)
- `stripe_session_id` (unique), `amount_cents`, `currency` (`'eur'`)
- `status` : `'pending'` | `'paid'` | `'failed'` | `'expired'`
- `created_at`, `updated_at`

### Migrations

La connexion applique le schéma + le seed en lazy au premier accès (le
`npm run dev` fonctionne sans étape manuelle). Une fonction de migration
additive ajoute les colonnes nouvelles (ex. `small_hip_circ`) aux bases
créées avant leur introduction.

### Authentification & rôles

- **Inscription** : email + mot de passe (min. 8 car.) + nom + rôle. Hash bcrypt (coût 10).
- **Connexion** : vérifie les identifiants, crée une session (30 jours).
- **Garde de route** : `getCurrentUser()` lit le cookie et résout l'utilisateur ;
  `requireUser()` lève une erreur 401 pour les routes API.
- Deux rôles distincts : **Passionné** (Hobbyist) et **Tailleur professionnel**
  (Professional Tailor), qui pilotent le gating d'export (voir §7).

---

## 3. BARÈME DES TAILLES (SOURCE DE CONNAISSANCE)

Table de mensurations standard françaises (IFTH), tailles **34 à 48**, stature
168–172 cm, utilisée pour :
1. les **préréglages de taille** du formulaire (préremplissage éditable),
2. l'**interpolation** des mesures secondaires du corsage (interpolation
   linéaire entre tailles, car le barème progresse linéairement),
3. des **valeurs de repli** : tour des petites hanches = bassin − 11 cm
   (offset constant du barème) ; ligne des petites hanches ≈ moitié de la
   hauteur du bassin.

Séries stockées (34→48) : tour de poitrine, tour de taille, tour des petites
hanches, tour du bassin, hauteur petites hanches, hauteur bassin, écart de
poitrine, carrure dos, carrure devant, tour d'encolure, longueur d'épaule,
longueur taille dos, hauteur de poitrine.

---

## 4. PAGES & PARCOURS UTILISATEUR

### Page d'accueil (`/`)
Hero éditorial (titre serif, sous-titre, deux CTA), trois cartes de
fonctionnalités (modélisme paramétrique, conseiller textile, export prêt à
imprimer). Sélecteur de langue dans l'en-tête.

### Auth (`/login`, `/register`)
Formulaires avec choix du rôle à l'inscription (Passionné / Tailleur pro).
Messages d'erreur localisés (identifiants invalides, compte déjà existant).

### Tableau de bord (`/dashboard`)
- **Grille des projets** : vignette (photo en niveaux de gris → couleur au
  survol, ou icône ciseaux), nom, badge de statut (Brouillon / Généré), lien
  vers le guide.
- **Profils de mesures enregistrés** : cartes récapitulant tour de taille,
  bassin, longueur.
- **CTA principal « Nouveau projet »**.

### Assistant de création (`/projects/new`) — 3 étapes
- **Étape 1 — Silhouette (Image → Croquis)** : composant d'upload par
  glisser-déposer **ou** capture caméra mobile (`capture="environment"`).
  Aperçu en style croquis (niveaux de gris + contraste). Dès la photo chargée,
  appel à l'**IA de détection** (§5) qui pré-sélectionne le vêtement avec un
  badge « Détecté depuis votre photo » + note de style.
- **Étape 2 — Vêtement** : menu déroulant listant les 4 vêtements du registre
  (jupe droite par défaut MVP). Champ « Nom du projet ».
- **Étape 3 — Mesures dynamiques** :
  - Toggle global **cm ↔ pouces** qui **convertit les valeurs en place**.
  - Sélecteur de **profil de mesures** existant, ou **nouveau profil**.
  - Menu **« Taille standard (FR) »** (34–48) qui pré-remplit le barème.
  - Champs : tour de poitrine, tour de taille, tour de bassin, tour des
    petites hanches (optionnel), hauteur taille-bassin, hauteur des petites
    hanches (optionnel), longueur totale.
  - Bouton **« Générer le patron »** → crée le profil de mesures + le projet
    (statut `generated`) et redirige vers le guide.

### Guide interactif (`/projects/[id]/guide`) — écran scindé
- **Gauche** : panneaux d'instructions pas à pas (cliquables). Chaque étape
  révèle progressivement des lignes du patron et affiche ses **valeurs calculées
  en direct** (dimensions, valeurs de pinces, angles…).
- **Droite** : **canvas SVG interactif** rendant le patron en temps réel,
  grille de 5 cm façon papier à patron, filigrane « STYLIA · DRAFT » tant que
  l'export n'est pas débloqué, légende (ligne de coupe pleine / construction
  en trait mixte / pince en or).
- **Boutons d'action** : « Exporter en PDF » (sélecteur A4 / US Letter / A0 /
  **Taille réelle**), « Acheter le tissu assorti ».
- **Section Conseiller textile** : tissus recommandés vs à manipuler avec soin.

### Checkout maquette (`/checkout/[sessionId]`)
Page de paiement de démonstration. « Payer maintenant (démo) » déclenche le
même webhook `checkout.session.completed` qu'un vrai Stripe.

---

## 5. IA — DE LA PHOTO AU PATRON

`POST /api/analyze-photo` — reçoit `{ photo: <data URL>, locale }`.
- Requiert `ANTHROPIC_API_KEY`. **Sans clé, dégradation gracieuse** :
  `{ available: false }`, la sélection manuelle reste opérationnelle.
- Appelle `claude-opus-4-8` en **vision + sorties structurées** (JSON schema
  strict) : classe la photo dans **exactement un** slug de vêtement draftable
  (robe/haut → corsage, jean/pantalon → pantalon droit, jupe trapèze/cercle →
  jupe évasée, jupe crayon/droite → jupe droite).
- Retourne `{ garment, confidence: 'high'|'medium'|'low', note }`, la note
  étant rédigée dans la langue de l'utilisateur.
- Gère le `stop_reason === 'refusal'` (retourne `null`).
- L'assistant pré-sélectionne le vêtement détecté à l'étape 2.

---

## 6. MOTEUR MATHÉMATIQUE (« Teresa Gilewska » / Coupe à plat)

**Système de coordonnées** commun : origine en haut à gauche du bloc, X vers la
droite, Y vers le bas, tout en **centimètres** (précision 0,01 cm). Géométrie
émise en segments typés : `move`, `line`, `quad` (Bézier quadratique). Trois
familles de lignes : **`cut`** (coupe, trait plein), **`construction`**
(trait mixte), **`dart`** (pince, or).

Helpers partagés (`pattern/types.ts`) : `curveControl` (contrôle d'un quad
passant exactement par un point à t=0.5), `verticalDart` (pince simple),
`diamondDart` (pince losange traversant une ligne), `horizontalLine`.

### 6.1 Jupe droite de base (Jupe Droite de Base) — MVP

Aisance totale = **2 cm** sur les hanches.
- Largeur totale = (H + 2) / 2
- Largeur devant = (H + 2) / 4 + 1
- Largeur dos = (H + 2) / 4 − 1
- Hauteur totale = L (longueur)
- Ligne de bassin à `waist_to_hip_height` du bord taille
- Ligne des petites hanches ≈ hauteur/2 ; la courbe de côté **passe par le
  point des petites hanches** (largeur (petites hanches + 2)/2)

**Pinces de taille :**
- Valeur totale des pinces = Largeur totale − W/2
- Côté (chaque côté) = 0,4 × total / 2
- Pince dos = 0,35 × total
- Pince devant = 0,25 × total
- Longueur pince devant = 11 cm (plage 10–12) ; pince dos = 14 cm (plage 13–15)

### 6.2 Jupe évasée (Jupe Évasée)

Transformation de la jupe droite : les **pinces de taille sont fermées** et
leur valeur **bascule dans l'ampleur de l'ourlet** (slash-and-spread), plus une
ampleur de style (+6 cm par côté). Ourlet remonté au côté et retracé en courbe
fluide (perpendiculaire aux coutures). La taille devient une légère courbe.

### 6.3 Corsage / buste de base (Corsage de Base) — CONSTRUCTION COMPLÈTE

⚠️ Suit **exactement la figure du livre (FIG. 1)** — pas une simplification.

- **Cadre du haut des épaules jusqu'à la ligne du bassin**, avec toutes les
  horizontales : **ligne de carrure**, **ligne de poitrine** (poitrine/4 + 1,
  profondeur d'emmanchure), **ligne de taille** (longueur taille dos),
  **ligne des petites hanches** (taille + 10 cm), **ligne du bassin**
  (taille + 20 cm, bord inférieur).
- **Pentes d'épaule aux angles de référence** : **18° au dos, 26° au devant**.
- **Pince d'épaule au dos** : 2 cm à mi-longueur d'épaule, ~7 cm de profondeur.
- **Pince de poitrine au devant** : valeur ≈ poitrine/20, jambes se refermant
  **sur le saillant** (point de poitrine, sur l'écart de poitrine `bustSpan`).
- **Emmanchure** encadrée par les **verticales de carrure dos et devant**
  (N1, N2) et descendant jusqu'à la ligne de poitrine. Les deux moitiés se
  font face comme dans la figure.
- **Pinces de taille en losange** (`diamondDart`) : pince dos et pince devant
  **traversent la ligne de taille** et se referment en pointe au-dessus et en
  dessous. La réduction de taille se répartit : milieu dos ≈12 %, côtés ≈17 %
  chacun, pince dos ≈27 %, pince devant ≈27 %.
- **Côtés qui se ré-évasent sous la taille** pour atteindre les **largeurs de
  bassin dos/devant** (points X, Y de la figure : (H+4)/4 − 1 et +1).
- Largeurs de poitrine : dos = (poitrine+2)/4 − 0,5 ; devant = (poitrine+2)/4 + 0,5.
- **Mesures secondaires interpolées** depuis le barème (longueur taille dos,
  encolure, épaule, carrure dos/devant, hauteur de poitrine, écart de poitrine).

### 6.4 Pantalon droit (Pantalon Droit)

Panneaux devant/dos dessinés côte à côte, lignes horizontales partagées.
- Montant (crotch depth) = H/4 + 3
- Largeur panneau devant = H/4 + aisance/4 ; dos = idem + 2
- Fourche devant = H/20 ; fourche dos = H/10
- Ligne de genou = montant + (L − montant)/2 − 4
- Largeur d'ourlet ≈ 22 cm par panneau (jambe droite), fuselage depuis le genou
- Plis de repassage (crease lines) centrés sur chaque jambe
- Une pince de taille par panneau ; taille dos remontée de 1 cm

### 6.5 Registre modulaire des vêtements

`pattern/garments.ts` : un objet `GARMENTS` mappe chaque slug à `{ drape,
draft(), steps[] }`. Ajouter un vêtement = ajouter une entrée (moteur +
étapes de guide avec `lineIds` révélés et `value(computed)` en direct) +
les textes i18n. Cela l'ajoute automatiquement au menu de l'assistant, au
guide, au classifieur IA et au conseiller textile.

Slugs actuels : `straight_skirt_base`, `flared_skirt`, `bodice_block`,
`straight_trousers`.

---

## 7. CONSEILLER TEXTILE & STRIPE

### Conseiller textile intelligent

`GET /api/textiles?garment=<slug>&locale=<xx>` → payload JSON :
- **Recommandés** : selon la famille de tombé déclarée par le vêtement
  (`rigid` pour jupe droite/pantalon, `fluid` pour jupe évasée, `any` pour
  corsage). Ex. jupe droite → coton, denim, lin, laine.
- **Avertissements** : tissus très fluides (viscose, soie…) → **stabilisation
  au contre-papier de soie pendant la coupe** obligatoire.
- **Instructions thermiques** : température de repassage exacte par tissu,
  localisée.

### Intégration Stripe & gating d'export

- Fonction `createCheckoutSession` (maquette si `STRIPE_SECRET_KEY` absent,
  native sinon) → enregistre un paiement `pending`, renvoie une URL de checkout.
- Webhook `POST /api/webhooks/stripe` : sur `checkout.session.completed`,
  marque le paiement `paid` et passe `projects.paid = 1`. En mode natif,
  **vérification obligatoire de la signature** (`stripe-signature` +
  `STRIPE_WEBHOOK_SECRET`).
- **Règle de gating** (`canExportFullSize`) :
  - Tailleur professionnel → export taille réelle **toujours** autorisé.
  - Abonnement actif → toujours autorisé.
  - Passionné → doit avoir un projet `generated` **ET** payé (`paid = 1`) ;
    sinon l'export renvoie **402 Payment Required** et les aperçus sont
    filigranés.

---

## 8. EXPORT

- **SVG** (`/api/projects/[id]/svg`) : document autonome, **1 unité SVG = 1 mm**
  → impression 100 % dimensionnellement exacte. Filigrane si non débloqué.
- **PDF** (`/api/projects/[id]/export?format=…`) : générateur **vectoriel sans
  dépendance**. Formats :
  - **A4 / US Letter / A0** : mise en **mosaïque** (tiling) avec repères de
    coupe et étiquettes « ligne/colonne » pour assembler les feuilles.
  - **Taille réelle (FullSize)** : **une seule page** dimensionnée exactement
    au patron (+ marges) pour impression traceur / copy-shop à 100 %.
- Marqueurs techniques : traits pleins (coupe), traits mixtes (construction),
  or (pinces).

---

## 9. INTERNATIONALISATION & UNITÉS

- Dictionnaires `fr` / `en` / `es` typés (le type dérive de `en`, garantissant
  qu'aucune clé ne manque). Sélecteur de langue par cookie `stylia_locale`.
- **Toute** chaîne visible passe par le dictionnaire, y compris les étapes de
  guide par vêtement (`t.garments[slug].steps`).
- Conversions : `cmToInch`, `inchToCm`, `convert(value, from, to)` (arrondi
  0,01), `display(cmValue, unit)`. Stockage canonique en cm ; conversion au
  moment de l'affichage et de la saisie.

---

## 10. DESIGN SYSTEM (UI HAUT DE GAMME)

- Palette : `ink` (#141210), `ivory` (#faf7f2 / #f1ece3), `gold` (#b08d57 /
  #d9c3a3), `blush`, `sage`.
- Typo : `Cormorant Garamond` (titrage serif), `Jost` (corps).
- Composants utilitaires : `.btn-primary`, `.btn-secondary`, `.card`,
  `.field-label`, `.field-input`. Ombre `shadow-couture`.
- Responsive : flexbox/grid, testé desktop **et** mobile (390 px). Les
  contenus larges (canvas, tableaux) scrollent dans leur propre conteneur.

---

## 11. STRUCTURE DE FICHIERS

```
stylia/
  db/schema.sql              # users, sessions, measurements, projects, textiles, payments
  db/seed.sql                # 7 tissus FR/EN/ES
  scripts/init-db.mjs        # bootstrap idempotent / --reset
  src/lib/
    db.ts                    # singleton SQLite + types de lignes + migrations
    auth.ts                  # register / login / sessions / garde de rôle
    units.ts                 # cm <-> pouce
    i18n/                    # fr / en / es + helpers
    pattern/
      types.ts               # géométrie partagée (Segment, helpers de pinces)
      sizeChart.ts           # barème IFTH 34-48
      skirtBlock.ts          # jupe droite
      flaredSkirt.ts         # jupe évasée
      bodiceBlock.ts         # corsage (construction complète FIG.1)
      trousersBlock.ts       # pantalon droit
      garments.ts            # registre modulaire
      svg.ts                 # rendu SVG (1 unité = 1 mm)
    export/pdf.ts            # PDF vectoriel (mosaïque + taille réelle)
    textiles/consultant.ts   # conseiller textile
    payments/stripe.ts       # checkout, webhook, gating
    ai/analyzePhoto.ts       # classification photo (Claude vision)
  src/app/
    page.tsx                 # accueil
    login/ register/         # auth
    dashboard/               # grille projets + profils + CTA
    projects/new/            # assistant 3 étapes
    projects/[id]/guide/     # guide écran scindé + canvas
    checkout/[sessionId]/    # checkout maquette
    api/                     # auth, measurements, projects, svg, export,
                             # textiles, checkout, webhooks/stripe, analyze-photo
  src/components/            # I18nProvider, LanguageSwitcher, UnitToggle,
                             # AuthForm, NewProjectWizard, PatternCanvas,
                             # GuideClient, CheckoutClient
```

---

## 12. PROCESSUS DE DÉVELOPPEMENT & VÉRIFICATION

1. `npm install`
2. `npm run db:init` (ou init lazy au premier accès)
3. `npm run dev` → http://localhost:3000
4. `npm run build` avant tout commit non trivial.
5. **Vérification bout-en-bout** (à refaire à chaque changement du moteur) :
   inscription → création profil de mesures → génération projet → 402 sur
   export non payé → webhook maquette → export débloqué → contrôle visuel du
   patron (desktop + mobile) via captures Playwright/Chromium.
6. Chaque formule est vérifiée numériquement (ex. H=96 → largeur totale 49 cm =
   490 mm, côté à 23,5 cm, courbes de côté 2,8 cm).

---

## 13. HÉBERGEMENT (LANCEMENT GRATUIT / À MOINDRE FRAIS)

SQLite exige un **disque persistant**.
- **Railway (~5 $/mois, recommandé)** : deploy from GitHub, Root Directory
  `stylia`, ajouter un **Volume** monté sur `/app/data`, variable
  `STYLIA_DB_PATH=/app/data/stylia.db`.
- **Render (gratuit pour tester)** : Web Service, build `npm install &&
  npm run build`, start `npm start`. Limite : mise en veille + données
  effacées au redéploiement (plan à 7 $/mois avec disque pour la prod).
- **VPS (Hetzner/OVH, ~4-6 €/mois)** : contrôle total, gestion serveur manuelle.

Variables d'environnement de production : `STYLIA_DB_PATH`, `ANTHROPIC_API_KEY`
(détection photo), `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (paiement natif).

---

## 14. FEUILLE DE ROUTE (MODULARITÉ FUTURE)

Le moteur est volontairement modulaire pour :
1. **Bases (vol. 1)** : jupe évasée ✅, corsage ✅, pantalon ✅, puis manches,
   cols, poches, doublure.
2. **Transformations (vol. 2)** : vestes, kimonos, raglans, capuches, capes,
   bustiers, traînes et surjupes — toutes construites à partir des bases.
3. **Ajustements de posture** corporelle (se branchent sur les entrées du
   moteur).
4. **Algorithmes de nesting** (placement optimisé) consommant la même
   géométrie `Segment[]`.
5. **Champs de mesures avancés optionnels** pour les tailleurs pros (longueur
   de manche, tour de poignet, montant réel du pantalon, largeur d'épaules).

---

## 15. RÈGLES D'OR

- Le moteur mathématique reste **du TypeScript pur, découplé du rendu**.
- **Stockage canonique en cm** ; conversion uniquement à l'affichage/saisie.
- **Trois rendus (canvas / SVG / PDF) partagent une seule géométrie.**
- **Chaque vêtement se déclare dans un unique registre** (`garments.ts`).
- **Dégradation gracieuse** : l'IA et Stripe sont optionnels ; sans clé,
  l'application fonctionne (sélection manuelle, paiement maquette).
- **Fidélité au livre** : les constructions suivent la coupe à plat de
  référence (angles, pinces losanges, lignes jusqu'au bassin), pas des
  approximations.
- **i18n systématique** : aucune chaîne en dur dans l'UI.
