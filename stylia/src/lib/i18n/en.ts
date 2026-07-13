const en = {
  meta: { localeName: 'English' },
  nav: {
    dashboard: 'Dashboard',
    newProject: 'New Project',
    logout: 'Sign out',
    login: 'Sign in',
    register: 'Create account',
  },
  landing: {
    tagline: 'Haute couture precision, algorithmic speed.',
    heroTitle: 'Design. Draft. Cut.',
    heroSubtitle:
      'StylIA turns a photo and five measurements into a millimetre-perfect sewing pattern — drafted with classic couture formulas, rendered as interactive SVG, exported print-ready.',
    ctaStart: 'Start drafting free',
    ctaLogin: 'I already have an atelier',
    features: {
      draft: { title: 'Parametric drafting', body: 'The Teresa Gilewska method, encoded to the millimetre.' },
      textile: { title: 'Textile consultant', body: 'Fabric-by-fabric guidance: drape, shrinkage, iron settings.' },
      export: { title: 'Print-ready export', body: 'A4, US Letter or A0 — tiled with crop marks.' },
    },
  },
  auth: {
    email: 'Email',
    password: 'Password',
    displayName: 'Name',
    role: 'I am a…',
    roleHobbyist: 'Hobbyist',
    roleProfessional: 'Professional Tailor',
    signIn: 'Sign in',
    signUp: 'Create my atelier',
    noAccount: 'No account yet?',
    haveAccount: 'Already have an account?',
    errorInvalid: 'Invalid email or password.',
    errorExists: 'An account with this email already exists.',
  },
  dashboard: {
    title: 'My Atelier',
    projects: 'Projects',
    empty: 'No projects yet — your cutting table is clear.',
    measurementProfiles: 'Measurement profiles',
    noProfiles: 'No saved measurement profiles.',
    newProject: 'New Project',
    statusDraft: 'Draft',
    statusGenerated: 'Generated',
    openGuide: 'Open guide',
  },
  wizard: {
    title: 'New project',
    step1: 'Silhouette',
    step2: 'Garment',
    step3: 'Measurements',
    uploadTitle: 'Image to sketch',
    uploadHint: 'Drag & drop a photo, or use your camera',
    uploadBrowse: 'Browse files',
    uploadCamera: 'Take a photo',
    uploadReplace: 'Replace image',
    garmentLabel: 'Garment type',
    straightSkirt: 'Basic Straight Skirt / Jupe Droite de Base',
    aiAnalyzing: 'Analyzing your photo…',
    aiDetected: 'Detected from your photo',
    aiUnavailable: 'Automatic detection unavailable — pick the garment manually.',
    projectName: 'Project name',
    profileLabel: 'Measurement profile',
    newProfile: 'New profile…',
    profileName: 'Profile name (e.g. “Myself”, “Client X”)',
    sizePreset: 'Standard size (FR)',
    sizeCustom: 'Custom — bespoke measurements',
    bust: 'Bust circumference',
    waist: 'Waist circumference',
    hip: 'Hip circumference',
    smallHip: 'Small-hip circumference (~10 cm below waist, optional)',
    smallHipHeight: 'Small-hip height (optional)',
    waistToHip: 'Waist-to-hip height',
    totalLength: 'Total skirt length',
    unitToggle: 'Units',
    back: 'Back',
    next: 'Next',
    generate: 'Generate pattern',
    generating: 'Drafting your pattern…',
  },
  guide: {
    stepsTitle: 'Drafting steps',
    canvasTitle: 'Pattern — live view',
    exportPdf: 'Export PDF',
    buyFabric: 'Buy Matching Fabric',
    paperFormat: 'Paper format',
    fullSize: 'Real size (single sheet)',
    lockedTitle: 'Full-size export is locked',
    lockedBody:
      'Hobbyist drafts are watermarked. Unlock the full-size, print-ready pattern with a one-time purchase or a Pro subscription.',
    unlock: 'Unlock for €4.90',
    paymentSuccess: 'Payment received — export unlocked!',
    steps: {
      frame: {
        title: 'The construction frame',
        body: 'Draw rectangle A-B-C-D: width = (hip + ease) / 2, height = total length. The vertical A-D is the centre back, B-C the centre front.',
      },
      hipLine: {
        title: 'Hip & small-hip lines',
        body: 'From the waist edge, measure the waist-to-hip height down and trace the horizontal hip line. Halfway down, trace the small-hip line — the side curve will pass through it.',
      },
      sideSeam: {
        title: 'Side seam',
        body: 'Split the frame into back panel (width/4 − 1 cm) and front panel (width/4 + 1 cm). The vertical divider is the side seam.',
      },
      darts: {
        title: 'Waist darts',
        body: 'Compute total waist reduction = half-frame width − waist/2. Distribute: 40% to the side curves, 35% to the back dart, 25% to the front dart.',
      },
      curves: {
        title: 'Side curves',
        body: 'Shape the side seam from the waist to the hip line with a smooth curve passing through the small-hip point, removing the side reduction on each panel.',
      },
      finish: {
        title: 'Cutting lines',
        body: 'Solid lines are cutting paths; dash-dotted lines are construction lines. Add seam allowances before cutting.',
      },
    },
    legendCut: 'Cutting line',
    legendConstruction: 'Construction line',
    legendDart: 'Dart',
  },
  garments: {
    straight_skirt_base: {
      name: 'Basic Straight Skirt',
      steps: {
        frame: {
          title: 'The construction frame',
          body: 'Draw the rectangle: width = (hip + ease) / 2, height = total length. The left vertical is the centre back, the right one the centre front.',
        },
        hipLine: {
          title: 'Hip & small-hip lines',
          body: 'Trace the hip line at the waist-to-hip height, and the small-hip line halfway down — the side curve will pass through it.',
        },
        sideSeam: {
          title: 'Side seam',
          body: 'Split the frame into back panel (width/4 − 1 cm) and front panel (width/4 + 1 cm). The divider is the side seam.',
        },
        darts: {
          title: 'Waist darts',
          body: 'Total waist reduction = half-frame width − waist/2, distributed 40% to the side curves, 35% to the back dart, 25% to the front dart.',
        },
        curves: {
          title: 'Side curves',
          body: 'Shape the side seam from waist to hip with a smooth curve through the small-hip point.',
        },
        finish: {
          title: 'Cutting lines',
          body: 'Solid lines are cutting paths; dash-dotted lines are construction lines. Add seam allowances before cutting.',
        },
      },
    },
    flared_skirt: {
      name: 'Flared Skirt',
      steps: {
        frame: {
          title: 'Base frame',
          body: 'Start from the straight-skirt frame: hip line and side seam in place, panels split back/front at ±1 cm.',
        },
        pivot: {
          title: 'Close the darts',
          body: 'Slash from each dart point to the hem and close the waist darts — their value pivots into hem width.',
        },
        flare: {
          title: 'Add the flare',
          body: 'From the hip point, swing the side seam outward: transferred dart value plus 6 cm of style flare on each side.',
        },
        hem: {
          title: 'Hem curve',
          body: 'Raise the hem at the side and redraw it as a smooth curve so it stays perpendicular to the seams.',
        },
        finish: {
          title: 'Cutting lines',
          body: 'The waistline becomes a gentle curve after dart closure. Add seam allowances before cutting.',
        },
      },
    },
    bodice_block: {
      name: 'Bodice Block',
      steps: {
        frame: {
          title: 'The construction frame',
          body: 'Frame width = (bust + ease) / 2, height = back waist length. Trace the bust line and the armhole-depth line.',
        },
        necklines: {
          title: 'Necklines',
          body: 'Back neckline: width neck/6 + 0.5 cm, rise 2 cm. Front neckline: same width, depth neck/6 + 1.5 cm.',
        },
        shoulders: {
          title: 'Shoulder slopes',
          body: 'Slope each shoulder from the neck point down to the across-back width, 4 cm below the top line.',
        },
        armhole: {
          title: 'Armhole',
          body: 'Curve from each shoulder end down to the side seam at the armhole-depth line (bust/4 − 1 cm).',
        },
        darts: {
          title: 'Waist darts',
          body: 'Distribute the waist reduction between the side seams and one dart per panel; the front dart sits on the bust-span line.',
        },
        finish: {
          title: 'Cutting lines',
          body: 'Solid lines are cutting paths. Verify the two shoulder lengths match before adding seam allowances.',
        },
      },
    },
    straight_trousers: {
      name: 'Straight Trousers',
      steps: {
        frame: {
          title: 'Construction lines',
          body: 'Trace the horizontals: hip line, crotch line at hip/4 + 3 cm (the montant), knee line halfway from crotch to hem.',
        },
        forks: {
          title: 'The forks',
          body: 'Extend the front panel by hip/20 and the back panel by hip/10 at the crotch line, with a smooth seat curve.',
        },
        creases: {
          title: 'Crease lines',
          body: 'Centre a vertical crease on each leg — every width below the crotch is measured symmetrically around it.',
        },
        legs: {
          title: 'Legs and hem',
          body: 'Taper from the fork and side to the knee, then run straight to the hem width.',
        },
        darts: {
          title: 'Waist darts',
          body: 'One dart per panel absorbs the waist-to-hip difference; the back waist is raised by 1 cm.',
        },
        finish: {
          title: 'Cutting lines',
          body: 'Check that front and back inseams match in length before adding seam allowances.',
        },
      },
    },
  },
  textiles: {
    title: 'Textile consultant',
    recommended: 'Recommended fabrics',
    warnings: 'Handle with care',
    ironTemp: 'Iron temperature',
    shrinkage: 'Wash shrinkage',
    fluid: 'Fluid drape',
    rigid: 'Structured drape',
    stabilizeWarning:
      'Highly fluid — stabilise with tissue paper backing during cutting.',
  },
  payment: {
    checkoutTitle: 'StylIA checkout',
    payNow: 'Pay now (mock)',
    cancel: 'Cancel',
    processing: 'Processing payment…',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    unauthorized: 'Please sign in to continue.',
  },
};

export default en;
export type Dictionary = typeof en;
