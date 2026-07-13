import type { Dictionary } from './en';

const fr: Dictionary = {
  meta: { localeName: 'Français' },
  nav: {
    dashboard: 'Tableau de bord',
    newProject: 'Nouveau projet',
    logout: 'Se déconnecter',
    login: 'Se connecter',
    register: 'Créer un compte',
  },
  landing: {
    tagline: 'La précision haute couture, la vitesse algorithmique.',
    heroTitle: 'Styliser. Modéliser. Couper.',
    heroSubtitle:
      'StylIA transforme une photo et cinq mesures en un patron de couture au millimètre — tracé selon les formules classiques du modélisme, rendu en SVG interactif, exporté prêt à imprimer.',
    ctaStart: 'Commencer gratuitement',
    ctaLogin: 'J’ai déjà mon atelier',
    features: {
      draft: { title: 'Modélisme paramétrique', body: 'La méthode Teresa Gilewska, encodée au millimètre.' },
      textile: { title: 'Conseiller textile', body: 'Des conseils tissu par tissu : tombé, retrait, température de repassage.' },
      export: { title: 'Export prêt à imprimer', body: 'A4, US Letter ou A0 — mise en mosaïque avec repères de coupe.' },
    },
  },
  auth: {
    email: 'E-mail',
    password: 'Mot de passe',
    displayName: 'Nom',
    role: 'Je suis…',
    roleHobbyist: 'Passionné(e)',
    roleProfessional: 'Tailleur professionnel',
    signIn: 'Se connecter',
    signUp: 'Créer mon atelier',
    noAccount: 'Pas encore de compte ?',
    haveAccount: 'Déjà un compte ?',
    errorInvalid: 'E-mail ou mot de passe invalide.',
    errorExists: 'Un compte existe déjà avec cet e-mail.',
  },
  dashboard: {
    title: 'Mon Atelier',
    projects: 'Projets',
    empty: 'Aucun projet — votre table de coupe est dégagée.',
    measurementProfiles: 'Profils de mesures',
    noProfiles: 'Aucun profil de mesures enregistré.',
    newProject: 'Nouveau projet',
    statusDraft: 'Brouillon',
    statusGenerated: 'Généré',
    openGuide: 'Ouvrir le guide',
  },
  wizard: {
    title: 'Nouveau projet',
    step1: 'Silhouette',
    step2: 'Vêtement',
    step3: 'Mesures',
    uploadTitle: 'De la photo au croquis',
    uploadHint: 'Glissez-déposez une photo, ou utilisez votre appareil',
    uploadBrowse: 'Parcourir',
    uploadCamera: 'Prendre une photo',
    uploadReplace: 'Remplacer l’image',
    garmentLabel: 'Type de vêtement',
    straightSkirt: 'Jupe Droite de Base / Standard Straight Skirt',
    aiAnalyzing: 'Analyse de votre photo…',
    aiDetected: 'Détecté depuis votre photo',
    aiUnavailable: 'Détection automatique indisponible — choisissez le vêtement manuellement.',
    projectName: 'Nom du projet',
    profileLabel: 'Profil de mesures',
    newProfile: 'Nouveau profil…',
    profileName: 'Nom du profil (ex. « Moi-même », « Cliente X »)',
    sizePreset: 'Taille standard (FR)',
    sizeCustom: 'Sur mesure — mesures personnalisées',
    bust: 'Tour de poitrine',
    waist: 'Tour de taille',
    hip: 'Tour de bassin',
    smallHip: 'Tour des petites hanches (~10 cm sous la taille, optionnel)',
    smallHipHeight: 'Hauteur des petites hanches (optionnel)',
    waistToHip: 'Hauteur taille-bassin',
    totalLength: 'Longueur totale de la jupe',
    unitToggle: 'Unités',
    back: 'Retour',
    next: 'Suivant',
    generate: 'Générer le patron',
    generating: 'Traçage du patron…',
  },
  guide: {
    stepsTitle: 'Étapes de traçage',
    canvasTitle: 'Patron — vue en direct',
    exportPdf: 'Exporter en PDF',
    buyFabric: 'Acheter le tissu assorti',
    paperFormat: 'Format papier',
    fullSize: 'Taille réelle (une seule feuille)',
    lockedTitle: 'L’export en taille réelle est verrouillé',
    lockedBody:
      'Les brouillons Passionné sont filigranés. Débloquez le patron en taille réelle, prêt à imprimer, avec un achat unique ou un abonnement Pro.',
    unlock: 'Débloquer pour 4,90 €',
    paymentSuccess: 'Paiement reçu — export débloqué !',
    steps: {
      frame: {
        title: 'Le cadre de construction',
        body: 'Tracez le rectangle A-B-C-D : largeur = (bassin + aisance) / 2, hauteur = longueur totale. La verticale A-D est le milieu dos, B-C le milieu devant.',
      },
      hipLine: {
        title: 'Lignes de bassin et des petites hanches',
        body: 'Depuis la ligne de taille, reportez la hauteur taille-bassin vers le bas et tracez la ligne de bassin horizontale. À mi-hauteur, tracez la ligne des petites hanches — la courbe de côté passera par elle.',
      },
      sideSeam: {
        title: 'Couture côté',
        body: 'Divisez le cadre en panneau dos (largeur/4 − 1 cm) et panneau devant (largeur/4 + 1 cm). La verticale de séparation est la couture côté.',
      },
      darts: {
        title: 'Pinces de taille',
        body: 'Calculez la valeur totale des pinces = demi-largeur du cadre − taille/2. Répartissez : 40 % aux courbes de côté, 35 % à la pince dos, 25 % à la pince devant.',
      },
      curves: {
        title: 'Courbes de côté',
        body: 'Galbez la couture côté de la taille à la ligne de bassin avec une courbe fluide passant par le point des petites hanches, en retirant la valeur de côté sur chaque panneau.',
      },
      finish: {
        title: 'Lignes de coupe',
        body: 'Les traits pleins sont les lignes de coupe ; les traits mixtes sont les lignes de construction. Ajoutez les marges de couture avant de couper.',
      },
    },
    legendCut: 'Ligne de coupe',
    legendConstruction: 'Ligne de construction',
    legendDart: 'Pince',
  },
  garments: {
    straight_skirt_base: {
      name: 'Jupe droite de base',
      steps: {
        frame: {
          title: 'Le cadre de construction',
          body: 'Tracez le rectangle : largeur = (bassin + aisance) / 2, hauteur = longueur totale. La verticale gauche est le milieu dos, la droite le milieu devant.',
        },
        hipLine: {
          title: 'Lignes de bassin et des petites hanches',
          body: 'Tracez la ligne de bassin à la hauteur taille-bassin, et la ligne des petites hanches à mi-hauteur — la courbe de côté passera par elle.',
        },
        sideSeam: {
          title: 'Couture côté',
          body: 'Divisez le cadre en panneau dos (largeur/4 − 1 cm) et panneau devant (largeur/4 + 1 cm). La séparation est la couture côté.',
        },
        darts: {
          title: 'Pinces de taille',
          body: 'Valeur totale des pinces = demi-largeur du cadre − taille/2, répartie : 40 % aux courbes de côté, 35 % à la pince dos, 25 % à la pince devant.',
        },
        curves: {
          title: 'Courbes de côté',
          body: 'Galbez la couture côté de la taille au bassin avec une courbe fluide passant par le point des petites hanches.',
        },
        finish: {
          title: 'Lignes de coupe',
          body: 'Les traits pleins sont les lignes de coupe ; les traits mixtes les lignes de construction. Ajoutez les marges de couture avant de couper.',
        },
      },
    },
    flared_skirt: {
      name: 'Jupe évasée',
      steps: {
        frame: {
          title: 'Cadre de base',
          body: 'Partez du cadre de la jupe droite : ligne de bassin et couture côté en place, panneaux séparés dos/devant à ±1 cm.',
        },
        pivot: {
          title: 'Fermer les pinces',
          body: 'Fendez de la pointe de chaque pince jusqu’à l’ourlet et fermez les pinces de taille — leur valeur bascule dans l’ampleur du bas.',
        },
        flare: {
          title: 'Ajouter l’évasement',
          body: 'Depuis le point de bassin, pivotez la couture côté vers l’extérieur : valeur des pinces transférée plus 6 cm d’ampleur de style de chaque côté.',
        },
        hem: {
          title: 'Courbe d’ourlet',
          body: 'Remontez l’ourlet au côté et retracez-le en courbe fluide pour qu’il reste perpendiculaire aux coutures.',
        },
        finish: {
          title: 'Lignes de coupe',
          body: 'La ligne de taille devient une légère courbe après fermeture des pinces. Ajoutez les marges de couture avant de couper.',
        },
      },
    },
    bodice_block: {
      name: 'Corsage de base',
      steps: {
        frame: {
          title: 'Le cadre de construction',
          body: 'Largeur du cadre = (poitrine + aisance) / 2, hauteur = longueur taille dos. Tracez la ligne de poitrine et la ligne d’emmanchure.',
        },
        necklines: {
          title: 'Encolures',
          body: 'Encolure dos : largeur encolure/6 + 0,5 cm, montant 2 cm. Encolure devant : même largeur, profondeur encolure/6 + 1,5 cm.',
        },
        shoulders: {
          title: 'Pentes d’épaule',
          body: 'Inclinez chaque épaule du point d’encolure jusqu’à la carrure, 4 cm sous la ligne haute.',
        },
        armhole: {
          title: 'Emmanchure',
          body: 'Courbez de chaque extrémité d’épaule jusqu’à la couture côté, à la profondeur d’emmanchure (poitrine/4 − 1 cm).',
        },
        darts: {
          title: 'Pinces de taille',
          body: 'Répartissez la réduction de taille entre les côtés et une pince par panneau ; la pince devant se place sur l’écart de poitrine.',
        },
        finish: {
          title: 'Lignes de coupe',
          body: 'Les traits pleins sont les lignes de coupe. Vérifiez que les deux longueurs d’épaule correspondent avant d’ajouter les marges.',
        },
      },
    },
    straight_trousers: {
      name: 'Pantalon droit',
      steps: {
        frame: {
          title: 'Lignes de construction',
          body: 'Tracez les horizontales : ligne de bassin, ligne de montant à bassin/4 + 3 cm, ligne de genou à mi-chemin du montant à l’ourlet.',
        },
        forks: {
          title: 'Les fourches',
          body: 'Prolongez le panneau devant de bassin/20 et le panneau dos de bassin/10 à la ligne de montant, avec une courbe de fourche fluide.',
        },
        creases: {
          title: 'Plis de repassage',
          body: 'Centrez un pli vertical sur chaque jambe — toutes les largeurs sous le montant se mesurent symétriquement autour de lui.',
        },
        legs: {
          title: 'Jambes et ourlet',
          body: 'Fuselez de la fourche et du côté vers le genou, puis descendez droit jusqu’à la largeur d’ourlet.',
        },
        darts: {
          title: 'Pinces de taille',
          body: 'Une pince par panneau absorbe la différence taille-bassin ; la taille dos est remontée de 1 cm.',
        },
        finish: {
          title: 'Lignes de coupe',
          body: 'Vérifiez que les entrejambes devant et dos ont la même longueur avant d’ajouter les marges de couture.',
        },
      },
    },
  },
  textiles: {
    title: 'Conseiller textile',
    recommended: 'Tissus recommandés',
    warnings: 'À manipuler avec soin',
    ironTemp: 'Température de repassage',
    shrinkage: 'Retrait au lavage',
    fluid: 'Tombé fluide',
    rigid: 'Tombé structuré',
    stabilizeWarning:
      'Très fluide — stabilisez avec un contre-papier de soie pendant la coupe.',
  },
  payment: {
    checkoutTitle: 'Paiement StylIA',
    payNow: 'Payer maintenant (démo)',
    cancel: 'Annuler',
    processing: 'Traitement du paiement…',
  },
  errors: {
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    unauthorized: 'Veuillez vous connecter pour continuer.',
  },
};

export default fr;
