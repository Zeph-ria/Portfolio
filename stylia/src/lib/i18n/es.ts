import type { Dictionary } from './en';

const es: Dictionary = {
  meta: { localeName: 'Español' },
  nav: {
    dashboard: 'Panel',
    newProject: 'Nuevo proyecto',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    register: 'Crear cuenta',
  },
  landing: {
    tagline: 'Precisión de alta costura, velocidad algorítmica.',
    heroTitle: 'Diseñar. Trazar. Cortar.',
    heroSubtitle:
      'StylIA convierte una foto y cinco medidas en un patrón de costura con precisión milimétrica — trazado con las fórmulas clásicas del patronaje, renderizado en SVG interactivo y exportado listo para imprimir.',
    ctaStart: 'Empezar gratis',
    ctaLogin: 'Ya tengo mi taller',
    features: {
      draft: { title: 'Patronaje paramétrico', body: 'El método Teresa Gilewska, codificado al milímetro.' },
      textile: { title: 'Consultor textil', body: 'Consejos tela por tela: caída, encogimiento, temperatura de planchado.' },
      export: { title: 'Exportación lista para imprimir', body: 'A4, US Letter o A0 — en mosaico con marcas de corte.' },
    },
  },
  auth: {
    email: 'Correo electrónico',
    password: 'Contraseña',
    displayName: 'Nombre',
    role: 'Soy…',
    roleHobbyist: 'Aficionado/a',
    roleProfessional: 'Sastre profesional',
    signIn: 'Iniciar sesión',
    signUp: 'Crear mi taller',
    noAccount: '¿Aún no tienes cuenta?',
    haveAccount: '¿Ya tienes cuenta?',
    errorInvalid: 'Correo o contraseña inválidos.',
    errorExists: 'Ya existe una cuenta con este correo.',
  },
  dashboard: {
    title: 'Mi Taller',
    projects: 'Proyectos',
    empty: 'Sin proyectos — tu mesa de corte está despejada.',
    measurementProfiles: 'Perfiles de medidas',
    noProfiles: 'No hay perfiles de medidas guardados.',
    newProject: 'Nuevo proyecto',
    statusDraft: 'Borrador',
    statusGenerated: 'Generado',
    openGuide: 'Abrir guía',
  },
  wizard: {
    title: 'Nuevo proyecto',
    step1: 'Silueta',
    step2: 'Prenda',
    step3: 'Medidas',
    uploadTitle: 'De la foto al boceto',
    uploadHint: 'Arrastra y suelta una foto, o usa tu cámara',
    uploadBrowse: 'Explorar archivos',
    uploadCamera: 'Tomar una foto',
    uploadReplace: 'Reemplazar imagen',
    garmentLabel: 'Tipo de prenda',
    straightSkirt: 'Falda Recta Básica / Jupe Droite de Base',
    aiAnalyzing: 'Analizando tu foto…',
    aiDetected: 'Detectado desde tu foto',
    aiUnavailable: 'Detección automática no disponible — elige la prenda manualmente.',
    projectName: 'Nombre del proyecto',
    profileLabel: 'Perfil de medidas',
    newProfile: 'Nuevo perfil…',
    profileName: 'Nombre del perfil (p. ej. «Yo», «Clienta X»)',
    sizePreset: 'Talla estándar (FR)',
    sizeCustom: 'A medida — medidas personalizadas',
    bust: 'Contorno de pecho',
    waist: 'Contorno de cintura',
    hip: 'Contorno de cadera',
    smallHip: 'Contorno de cadera alta (~10 cm bajo la cintura, opcional)',
    smallHipHeight: 'Altura de cadera alta (opcional)',
    waistToHip: 'Altura cintura-cadera',
    totalLength: 'Largo total de la falda',
    unitToggle: 'Unidades',
    back: 'Atrás',
    next: 'Siguiente',
    generate: 'Generar patrón',
    generating: 'Trazando tu patrón…',
  },
  guide: {
    stepsTitle: 'Pasos de trazado',
    canvasTitle: 'Patrón — vista en vivo',
    exportPdf: 'Exportar PDF',
    buyFabric: 'Comprar tela a juego',
    paperFormat: 'Formato de papel',
    fullSize: 'Tamaño real (una sola hoja)',
    lockedTitle: 'La exportación a tamaño real está bloqueada',
    lockedBody:
      'Los borradores de aficionado llevan marca de agua. Desbloquea el patrón a tamaño real, listo para imprimir, con una compra única o una suscripción Pro.',
    unlock: 'Desbloquear por 4,90 €',
    paymentSuccess: '¡Pago recibido — exportación desbloqueada!',
    steps: {
      frame: {
        title: 'El marco de construcción',
        body: 'Dibuja el rectángulo A-B-C-D: ancho = (cadera + holgura) / 2, alto = largo total. La vertical A-D es el centro espalda, B-C el centro delantero.',
      },
      hipLine: {
        title: 'Líneas de cadera y cadera alta',
        body: 'Desde la línea de cintura, mide hacia abajo la altura cintura-cadera y traza la línea horizontal de cadera. A media altura, traza la línea de cadera alta — la curva lateral pasará por ella.',
      },
      sideSeam: {
        title: 'Costura lateral',
        body: 'Divide el marco en panel trasero (ancho/4 − 1 cm) y panel delantero (ancho/4 + 1 cm). La vertical divisoria es la costura lateral.',
      },
      darts: {
        title: 'Pinzas de cintura',
        body: 'Calcula la reducción total de cintura = medio ancho del marco − cintura/2. Distribuye: 40 % a las curvas laterales, 35 % a la pinza trasera, 25 % a la pinza delantera.',
      },
      curves: {
        title: 'Curvas laterales',
        body: 'Modela la costura lateral desde la cintura hasta la línea de cadera con una curva suave que pasa por el punto de cadera alta, eliminando la reducción lateral en cada panel.',
      },
      finish: {
        title: 'Líneas de corte',
        body: 'Las líneas continuas son de corte; las líneas de trazo y punto son de construcción. Añade los márgenes de costura antes de cortar.',
      },
    },
    legendCut: 'Línea de corte',
    legendConstruction: 'Línea de construcción',
    legendDart: 'Pinza',
  },
  garments: {
    straight_skirt_base: {
      name: 'Falda recta básica',
      steps: {
        frame: {
          title: 'El marco de construcción',
          body: 'Dibuja el rectángulo: ancho = (cadera + holgura) / 2, alto = largo total. La vertical izquierda es el centro espalda, la derecha el centro delantero.',
        },
        hipLine: {
          title: 'Líneas de cadera y cadera alta',
          body: 'Traza la línea de cadera a la altura cintura-cadera, y la línea de cadera alta a media altura — la curva lateral pasará por ella.',
        },
        sideSeam: {
          title: 'Costura lateral',
          body: 'Divide el marco en panel trasero (ancho/4 − 1 cm) y delantero (ancho/4 + 1 cm). La divisoria es la costura lateral.',
        },
        darts: {
          title: 'Pinzas de cintura',
          body: 'Reducción total = medio ancho del marco − cintura/2, repartida: 40 % a las curvas laterales, 35 % a la pinza trasera, 25 % a la delantera.',
        },
        curves: {
          title: 'Curvas laterales',
          body: 'Modela la costura lateral de la cintura a la cadera con una curva suave que pasa por el punto de cadera alta.',
        },
        finish: {
          title: 'Líneas de corte',
          body: 'Las líneas continuas son de corte; las de trazo y punto, de construcción. Añade los márgenes de costura antes de cortar.',
        },
      },
    },
    flared_skirt: {
      name: 'Falda evasé',
      steps: {
        frame: {
          title: 'Marco de base',
          body: 'Parte del marco de la falda recta: línea de cadera y costura lateral en su sitio, paneles separados a ±1 cm.',
        },
        pivot: {
          title: 'Cerrar las pinzas',
          body: 'Corta desde la punta de cada pinza hasta el bajo y cierra las pinzas de cintura — su valor pivota hacia el vuelo del bajo.',
        },
        flare: {
          title: 'Añadir el vuelo',
          body: 'Desde el punto de cadera, gira la costura lateral hacia fuera: valor transferido de las pinzas más 6 cm de vuelo de estilo por lado.',
        },
        hem: {
          title: 'Curva del bajo',
          body: 'Sube el bajo en el lateral y vuelve a trazarlo en curva suave para que quede perpendicular a las costuras.',
        },
        finish: {
          title: 'Líneas de corte',
          body: 'La línea de cintura queda ligeramente curvada tras cerrar las pinzas. Añade los márgenes antes de cortar.',
        },
      },
    },
    bodice_block: {
      name: 'Corpiño base',
      steps: {
        frame: {
          title: 'El marco y sus líneas',
          body: 'El marco va de los hombros hasta la línea de cadera. Traza las horizontales: línea de espalda, línea de pecho (pecho/4 + 1), línea de cintura (largo talle espalda), línea de cadera alta y línea de cadera.',
        },
        necklines: {
          title: 'Escotes',
          body: 'Escote trasero: ancho cuello/6 + 0,5 cm, subida 2 cm. Escote delantero: mismo ancho, profundidad cuello/6 + 1,5 cm.',
        },
        shoulders: {
          title: 'Hombros y sus pinzas',
          body: 'Caída de hombro: 18° en la espalda, 26° en el delantero. La espalda lleva una pinza de hombro de 2 cm a media longitud; la pinza de pecho delantera (≈ pecho/20) cierra sobre el vértice del busto.',
        },
        armhole: {
          title: 'Sisa',
          body: 'La sisa se inscribe entre las verticales de ancho de espalda y de delantero (N1, N2) y baja hasta la línea de pecho.',
        },
        darts: {
          title: 'Pinzas de cintura',
          body: 'La reducción de cintura se reparte entre el centro espalda, los laterales y dos pinzas rombo (espalda y delantero) que cruzan la línea de cintura y cierran debajo. Los laterales vuelven a abrirse hacia los anchos de cadera.',
        },
        finish: {
          title: 'Líneas de corte',
          body: 'Las líneas continuas son de corte. Verifica que los dos hombros midan lo mismo antes de añadir márgenes.',
        },
      },
    },
    straight_trousers: {
      name: 'Pantalón recto',
      steps: {
        frame: {
          title: 'Líneas de construcción',
          body: 'Traza las horizontales: línea de cadera, línea de tiro a cadera/4 + 3 cm, línea de rodilla a medio camino del tiro al bajo.',
        },
        forks: {
          title: 'Los tiros',
          body: 'Prolonga el panel delantero cadera/20 y el trasero cadera/10 en la línea de tiro, con una curva suave.',
        },
        creases: {
          title: 'Rayas de planchado',
          body: 'Centra una raya vertical en cada pierna — todos los anchos bajo el tiro se miden simétricamente respecto a ella.',
        },
        legs: {
          title: 'Piernas y bajo',
          body: 'Entalla del tiro y el lateral hacia la rodilla, y baja recto hasta el ancho del bajo.',
        },
        darts: {
          title: 'Pinzas de cintura',
          body: 'Una pinza por panel absorbe la diferencia cintura-cadera; la cintura trasera se sube 1 cm.',
        },
        finish: {
          title: 'Líneas de corte',
          body: 'Comprueba que las entrepiernas delantera y trasera midan igual antes de añadir los márgenes.',
        },
      },
    },
  },
  textiles: {
    title: 'Consultor textil',
    recommended: 'Telas recomendadas',
    warnings: 'Manipular con cuidado',
    ironTemp: 'Temperatura de planchado',
    shrinkage: 'Encogimiento al lavar',
    fluid: 'Caída fluida',
    rigid: 'Caída estructurada',
    stabilizeWarning:
      'Muy fluida — estabiliza con papel de seda durante el corte.',
  },
  payment: {
    checkoutTitle: 'Pago StylIA',
    payNow: 'Pagar ahora (demo)',
    cancel: 'Cancelar',
    processing: 'Procesando el pago…',
  },
  errors: {
    generic: 'Algo salió mal. Inténtalo de nuevo.',
    unauthorized: 'Inicia sesión para continuar.',
  },
};

export default es;
