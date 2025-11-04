export const texts = {
  navbar: {
    brand: "Easy Go",
    home: "Inicio",
    tools: "Herramientas",
    pricing: "Precios",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión",
    dashboard: "Panel",
    ariaLabels: {
      home: "Ir a la página principal",
      tools: "Explorar nuestras herramientas",
      pricing: "Ver planes de precios",
      signIn: "Acceder a tu cuenta"
    }
  },
  
  hero: {
    title: "Herramientas de productividad diseñadas para ti.",
    subtitle: "Easy Go reúne potentes herramientas de productividad en una plataforma hermosa. Simple. Intuitiva. Poderosa.",
    primaryCTA: "Explorar Herramientas",
    secondaryCTA: "Saber Más",
    benefits: [
      "Herramientas profesionales a tu alcance",
      "Interfaz limpia e intuitiva que te encantará",
      "Más herramientas próximamente"
    ],
    description: "Easy Go es tu centro de productividad. Comienza con nuestro generador de CVs con IA y mantente atento a más herramientas diseñadas para facilitar tu vida laboral."
  },
  
  tools: {
    heading: "Herramientas que funcionan tan bien como se ven.",
    intro: "Easy Go está construyendo un conjunto de herramientas de productividad. Comienza con lo disponible hoy y descubre más a medida que crecemos.",
    features: [
      {
        title: "Generador de CVs",
        subtitle: "Crea currículums profesionales con asistencia de IA.",
        benefits: [
          "Optimización de contenido con IA",
          "Plantillas compatibles con ATS",
          "Exportación instantánea a PDF"
        ],
        imageAlt: "Interfaz del Generador de CVs de Easy Go",
        available: true,
        badge: "Disponible Ahora"
      },
      {
        title: "Generador de Portfolio",
        subtitle: "Muestra tu trabajo en minutos.",
        benefits: [
          "Diseños responsive hermosos",
          "Simplicidad de arrastrar y soltar",
          "Soporte para dominio personalizado"
        ],
        imageAlt: "Generador de Portfolio de Easy Go",
        available: false,
        badge: "Próximamente"
      },
      {
        title: "Firma de Email",
        subtitle: "Firmas profesionales simplificadas.",
        benefits: [
          "Múltiples plantillas de diseño",
          "Integración con redes sociales",
          "Responsive para móviles"
        ],
        imageAlt: "Herramienta de Firma de Email de Easy Go",
        available: false,
        badge: "Próximamente"
      },
      {
        title: "Gestor de Enlaces",
        subtitle: "Todos tus enlaces en una página hermosa.",
        benefits: [
          "Enlaces ilimitados",
          "Panel de analíticas",
          "Marca personalizada"
        ],
        imageAlt: "Gestor de Enlaces de Easy Go",
        available: false,
        badge: "Próximamente"
      },
      {
        title: "Generador de Códigos QR",
        subtitle: "Crea códigos QR personalizados al instante.",
        benefits: [
          "Exportación en alta resolución",
          "Colores y logos personalizados",
          "Seguimiento de escaneos y analíticas"
        ],
        imageAlt: "Generador de Códigos QR de Easy Go",
        available: false,
        badge: "Próximamente"
      },
      {
        title: "Creador de Facturas",
        subtitle: "Facturas profesionales en segundos.",
        benefits: [
          "Plantillas personalizables",
          "Cálculos automáticos",
          "Gestión de clientes"
        ],
        imageAlt: "Creador de Facturas de Easy Go",
        available: false,
        badge: "Próximamente"
      }
    ]
  },
  
  pricing: {
    heading: "Precios simples y transparentes",
    intro: "Elige el plan que más te convenga. Comienza con nuestro Generador de CVs, gratis para siempre.",
    plans: [
      {
        name: "Gratis",
        tagline: "Perfecto para empezar.",
        price: "$0",
        features: [
          "1 CV optimizado con IA al mes",
          "Plantillas básicas",
          "Exportación a PDF",
          "Verificación de compatibilidad ATS",
          "Soporte de la comunidad"
        ],
        bestFor: "Probar el Generador de CVs o crear tu primer currículum profesional.",
        cta: "Comenzar Gratis"
      },
      {
        name: "Pro",
        tagline: "Para profesionales.",
        price: "$9/mes",
        features: [
          "CVs ilimitados con IA",
          "Todas las plantillas premium",
          "Soporte prioritario",
          "Optimización ATS avanzada",
          "Generador de cartas de presentación",
          "Acceso anticipado a nuevas herramientas"
        ],
        bestFor: "Buscadores de empleo y profesionales que necesitan múltiples CVs.",
        cta: "Obtener Pro",
        popular: true
      },
      {
        name: "Business",
        tagline: "Para equipos y agencias.",
        price: "$29/mes",
        features: [
          "Todo en Pro",
          "Colaboración en equipo (10 usuarios)",
          "Creación masiva de CVs",
          "Acceso a API",
          "Opción de marca blanca",
          "Soporte dedicado"
        ],
        bestFor: "Coaches de carrera y agencias de reclutamiento.",
        cta: "Contactar Ventas"
      }
    ],
    faq: {
      title: "Preguntas Frecuentes",
      questions: [
        {
          question: "¿Puedo cancelar mi suscripción en cualquier momento?",
          answer: "Sí. Cancela en cualquier momento sin cargos. Tus CVs permanecen accesibles hasta que termine tu período de facturación."
        },
        {
          question: "¿Hay una prueba gratuita?",
          answer: "Los planes Pro y Business incluyen una garantía de devolución de dinero de 7 días. Prueba sin riesgos."
        },
        {
          question: "¿Cómo funciona la facturación?",
          answer: "Los planes se facturan mensualmente. Puedes actualizar o cancelar desde tu panel de control."
        }
      ]
    }
  },
  
  signIn: {
    heading: "Bienvenido de nuevo a Easy Go.",
    intro: "Inicia sesión para continuar construyendo.",
    emailPlaceholder: "Ingresa tu correo electrónico",
    passwordPlaceholder: "Ingresa tu contraseña",
    submitButton: "Iniciar sesión",
    rememberMe: "Recuérdame",
    forgotPassword: "¿Olvidaste tu contraseña?",
    successMessage: "¡Bienvenido de nuevo! Redirigiendo a tu panel...",
    errorMessage: "Email o contraseña inválidos. Por favor intenta de nuevo.",
    securityNote: "Tus datos están encriptados y seguros. Nunca compartimos tu información.",
    signUpHeading: "Crea tu cuenta",
    signUpIntro: "Comienza a construir en minutos",
    confirmPasswordPlaceholder: "Confirma tu contraseña",
    signUpButton: "Crear Cuenta",
    signUpSuccess: "¡Cuenta creada! Por favor verifica tu correo electrónico.",
    passwordMismatch: "Las contraseñas no coinciden",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    toggleToSignUp: "¿No tienes cuenta? Regístrate",
    toggleToSignIn: "¿Ya tienes cuenta? Inicia Sesión",
    resetPasswordHeading: "Restablecer tu contraseña",
    resetPasswordIntro: "Ingresa tu correo para recibir un enlace de restablecimiento",
    resetPasswordButton: "Enviar Enlace",
    resetPasswordSuccess: "¡Enlace de restablecimiento enviado! Revisa tu correo.",
    backToSignIn: "Volver a Iniciar Sesión"
  },
  
  dashboard: {
    heading: "Bienvenido al Panel de Easy Go",
    greeting: "Hola",
    accountStatus: "Estado de la Cuenta",
    verified: "Verificado",
    notVerified: "No Verificado",
    stats: {
      websites: "Sitios Web IA",
      projects: "Proyectos",
      templates: "Plantillas"
    },
    actions: {
      createWebsite: "Crear Nuevo Sitio Web",
      backHome: "Volver al Inicio",
      signOut: "Cerrar Sesión"
    },
    gettingStarted: "Comenzando",
    startBuilding: "¡Comienza a crear tu primer sitio web con IA!"
  },
  
  cta: {
    headline: "¿Listo para aumentar tu productividad?",
    supporting: "Comienza con nuestro Generador de CVs hoy y mantente atento a más herramientas potentes que vienen pronto.",
    primaryCTA: "Comenzar gratis",
    secondaryCTA: "Saber más",
    reassurance: [
      "Gratis para empezar. Actualiza cuando quieras.",
      "Cancela cuando quieras. Sin compromisos.",
      "Seguridad de nivel bancario."
    ]
  },
  
  footer: {
    about: "Easy Go es una plataforma de productividad que reúne herramientas poderosas en una interfaz hermosa. Comienza con nuestro generador de CVs con IA y descubre más herramientas a medida que crecemos.",
    links: {
      about: "Acerca de",
      privacy: "Privacidad",
      terms: "Términos",
      contact: "Contacto"
    },
    social: "Síguenos en Twitter, LinkedIn y GitHub.",
    copyright: "© 2025 Easy Go. Todos los derechos reservados.",
    tagline: "Construido con ❤️ para profesionales en todas partes."
  }
};
