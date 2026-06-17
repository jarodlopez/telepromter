export interface ScriptText {
  id: string;
  titulo: string;
  contenido: string;
}

// ─── SALUDO / PRESENTACIÓN ────────────────────────────────────────────────────

export const getGreetingText = (
  cliente: string,
  tipoLead: 'upper' | 'gancho' | 'expirado' | 'longtrack',
  asesor: string
): string => {
  const c = cliente || '[Nombre del Cliente]';
  const a = asesor || '[Tu Nombre]';

  if (tipoLead === 'longtrack') {
    return `Hola ${c}, soy ${a}, tu asesor financiero de MultiMoney, ¿cómo te va?\n\nTe llamo porque concluiste el proceso biométrico en la web. Antes de continuar, te comento que esta llamada será grabada por motivos de calidad.\n\n¿Cuál es el uso que le brindarás al crédito?`;
  }

  if (tipoLead === 'expirado') {
    return `Hola ${c}, soy ${a}, tu asesor financiero de MultiMoney, ¿cómo te va?\n\nHace un tiempo aprobaste un crédito con nosotros, pero no concluiste tu proceso. Afortunadamente podemos reactivarlo sin empezar desde cero. Antes de continuar, te comento que esta llamada será grabada por motivos de calidad.\n\nCuéntame: ¿Qué fue lo que originalmente te llevó a interesarte en un crédito con nosotros, y cómo está tu situación hoy?`;
  }

  if (tipoLead === 'gancho') {
    return `Hola ${c}, soy ${a}, tu asesor financiero de MultiMoney, ¿cómo te va?\n\nTe marco porque revisé tu perfil y tengo buenas noticias: logramos mejorar la oferta que en su momento dejaste pasar, y quiero que la conozcas hoy. Te comento que esta llamada será grabada por motivos de calidad.\n\nVeo que la vez anterior platicaste con nosotros sobre [motivo registrado en la nota previa]. Cuéntame, ¿esa necesidad sigue vigente o hay algo distinto que necesites solventar?`;
  }

  // upper (default)
  return `Hola ${c}, me presento, soy ${a}, tu asesor financiero de MultiMoney, ¿cómo te va?\n\nTe marco por tu interés en nuestros créditos personales. Antes de comenzar, te comento que esta llamada será grabada por motivos de calidad.\n\nCuéntame, ¿qué te llevó a solicitar este crédito?`;
};

// ─── BENEFICIOS (aplica a los 4 tipos) ───────────────────────────────────────

export const getBeneficiosText = (): string => {
  return `• Recibes el depósito en máximo 2 horas — ideal para que no detengas tu proyecto.\n• Manejamos un plazo cómodo de hasta 60 meses; aportaciones a capital sin penalización.\n• A partir de tu tercer pago puntual tienes acceso a una ampliación.\n• Todo el proceso es 100% en línea, sin filas ni papeleo.\n• MultiMoney es un respaldo para cualquier emergencia o proyecto que deseas llevar a cabo. ¿Qué proyecto te gustaría realizar?`;
};

// ─── PREGUNTAS DE SONDEO ──────────────────────────────────────────────────────

export interface PreguntaSondeo {
  objetivo: string; // qué dato perfilamos (etiqueta corta)
  pregunta: string; // guion natural que el asesor lee al cliente
  tecnica: string;  // por qué funciona / cómo mantenerla no intrusiva
}

export const getSondeoPreguntas = (
  tipoLead: 'upper' | 'gancho' | 'expirado' | 'longtrack'
): PreguntaSondeo[] => {
  // REGLA DE ORO: tasa, monto, plazo y cuota los define el sistema. El perfilamiento
  // NO sirve para negociar números, sino para obtener datos suficientes que permitan
  // rebatir objeciones con la información del cliente, adaptar el pitch a su necesidad
  // y avanzar al siguiente paso del proceso.
  if (tipoLead === 'gancho' || tipoLead === 'expirado') {
    // Preguntas a perfilar oficiales para reactivación (Gancho / Expirados).
    return [
      {
        objetivo: 'Motivo de no avanzar',
        pregunta:
          'Antes de platicarte lo que tengo hoy para ti, me gustaría entender algo de tu experiencia previa. En tu contacto anterior decidiste no continuar, y eso es totalmente normal. ¿Qué fue lo que te detuvo en ese momento?',
        tecnica:
          'Identifica la objeción raíz previa y resuélvela de entrada, antes de que reaparezca en el cierre.',
      },
      {
        objetivo: 'Estatus de la necesidad',
        pregunta:
          'Te entiendo, gracias por la confianza de contármelo. Y de aquel tema en concreto: ¿lograste resolverlo por otro medio, o ese gasto o deuda sigue pendiente hoy?',
        tecnica:
          'Si continúa pendiente, la urgencia sigue viva. Si ya lo resolvió, pivota hacia fondo de respaldo o un nuevo objetivo.',
      },
      {
        objetivo: 'Inconveniente con otras instituciones',
        pregunta:
          'Lo tengo claro. Déjame hacerte una pregunta rápida que me ayuda a entender mejor tu panorama: ¿tuviste algún inconveniente para que te aprobaran un crédito en otra institución?',
        tecnica:
          'Revela fricción con la competencia. Contrasta con tu aprobación ya lista y el proceso 100% en línea.',
      },
      {
        objetivo: 'Nuevo gasto / estrés financiero',
        pregunta:
          'Perfecto, me queda claro. Y cuéntame, porque las cosas cambian con el tiempo: de aquel momento a la fecha, ¿ha surgido algún otro gasto que te esté generando presión financiera?',
        tecnica:
          'Reactiva el dolor financiero vigente: es el anclaje para adaptar el pitch y justificar avanzar hoy.',
      },
      {
        objetivo: 'Nivel de urgencia',
        pregunta:
          'Te entiendo perfectamente. Para enfocarnos en lo que de verdad te conviene: ¿qué tan urgente es para ti resolver esta necesidad en este momento?',
        tecnica:
          'Calibra la urgencia. A mayor urgencia, refuerza la inmediatez del depósito para avanzar al siguiente paso.',
      },
    ];
  }

  // Preguntas a perfilar oficiales (Upper / Long Track), ordenadas de lo menos
  // sensible a lo más sensible. Cada técnica indica cómo se USA el dato:
  // rebatir objeciones, adaptar el pitch o avanzar. Nunca para mover tasa/monto.
  return [
    {
      objetivo: 'Ocupación actual',
      pregunta:
        'Para tener tu expediente completo y darte un buen acompañamiento, cuéntame un poco de ti: ¿cuál es tu actividad laboral actual? ¿Eres empleado, trabajas de forma independiente o tienes un negocio propio?',
      tecnica:
        'Pregunta de apertura, bajo riesgo. Define el origen del ingreso y qué comprobantes se solicitarán en originación. Si es independiente, indaga el giro del negocio.',
    },
    {
      objetivo: 'Ingresos comprobables mensuales',
      pregunta:
        'Perfecto, gracias. Ahora un dato que el área de riesgo necesita validar: ¿cuál es tu ingreso mensual comprobable? Puede ser por nómina, estados de cuenta o declaración fiscal.',
      tecnica:
        'Solicita ingresos comprobables, no percibidos. Sirve para calibrar si la cuota del sistema es proporcional y anticipar objeciones de capacidad de pago.',
    },
    {
      objetivo: 'Fecha y monto de depósito',
      pregunta:
        'Muy bien. Y para organizar los tiempos de tu proceso, dime: ¿para qué fecha necesitas disponer del recurso y qué monto tienes contemplado?',
      tecnica:
        'Mide urgencia (clave para el cierre) y expectativa de monto. Si hay urgencia alta, ancla el depósito en menos de 2 horas para avanzar hoy.',
    },
    {
      objetivo: 'Créditos existentes',
      pregunta:
        'Entiendo. Te hago otra pregunta que me da un panorama claro de tu situación: ¿tienes créditos, tarjetas u otros financiamientos activos en este momento? ¿Y cuánto sumas hoy en pagos mensuales?',
      tecnica:
        'Dimensiona capacidad de pago real. Sus propias cifras son el argumento para rebatir "cuota alta" y abrir el caso de consolidación.',
    },
    {
      objetivo: 'Otras instituciones',
      pregunta:
        'Gracias por la confianza. Una más, para asegurarme de darte la mejor atención: ¿estás gestionando esta necesidad con alguna otra institución financiera en este momento?',
      tecnica:
        'Detecta competencia activa. Si compara con otra institución, no discutas la tasa: contrasta tiempos de aprobación y disposición (2 horas vs. días).',
    },
    {
      objetivo: 'Necesidades adicionales',
      pregunta:
        'Excelente, ya tengo un panorama muy completo. Y para cerrar este punto: además de lo de hoy, ¿tienes algún otro proyecto o necesidad financiera en mente para los próximos meses?',
      tecnica:
        'Habilita segunda necesidad y siembra la ampliación al 3er pago puntual. Convierte la operación en una relación de largo plazo.',
    },
  ];
};

// ─── PITCH / OFERTA ───────────────────────────────────────────────────────────

export const getPitchText = (
  cliente: string,
  monto: string,
  tasa: string,
  cuota: string,
  motivo: string,
  tipoLead: 'upper' | 'gancho' | 'expirado' | 'longtrack'
): string => {
  const c = cliente || '[Cliente]';
  const baseAmount = monto ? `$${monto}` : '[Monto]';
  const baseTasa = tasa || '[Tasa]';
  const baseCuota = cuota ? `$${cuota}` : '[Cuota]';
  const baseMotivo = motivo || '[su proyecto]';

  if (tipoLead === 'gancho') {
    return `${c}, tengo una EXCELENTE NOTICIA para ti: trabajamos en tu perfil y logramos liberarte una oferta SUPERIOR a la que te presentamos antes — quedaste pre-aprobado por ${baseAmount} con una tasa preferencial del ${baseTasa}%. Esta es una oferta especial: no la presentamos a cualquier cliente, y por eso quiero que tú seas el primero en conocerla.\n\nEsta línea cuenta con un plazo de 60 meses, por lo que tu cuota quedaría en ${baseCuota}, la cual ya incluye la comisión por desembolso.\n\nLa principal ventaja es que te permite avanzar con ${baseMotivo} de forma INMEDIATA, ya que el depósito se realiza en tu cuenta en menos de 2 HORAS.\n\n"El siguiente paso es completar tu solicitud para que recibas tu depósito hoy mismo. ¿Tienes tu identificación a la mano?"`;
  }

  if (tipoLead === 'expirado') {
    return `${c}, la mejor noticia es que sigues siendo candidato para una oferta con nosotros. Solo debemos validar un par de datos para generarte una nueva oferta — incluso con la posibilidad de que sea mejor que la que conociste antes.\n\nQuedaste pre-aprobado por ${baseAmount} con una tasa preferencial del ${baseTasa}%. Es una oferta que diseñamos pensando justo en clientes con tu perfil.\n\n"El siguiente paso es completar tu solicitud para que recibas tu depósito hoy mismo. ¿Tienes tu identificación a la mano?"\n\n⚠️ Cuando el cliente acepte reactivar la oferta, confirma su número de teléfono y correo electrónico para generar el OTP. Una vez que proporcione el PIN de 4 dígitos, procede a originar la nueva oferta.`;
  }

  // upper (default)
  return `${c}, tengo EXCELENTES NOTICIAS para ti: quedaste pre-aprobado por ${baseAmount} con una tasa preferencial del ${baseTasa}%. Es una oferta que diseñamos pensando justo en clientes con tu perfil.\n\nEsta línea cuenta con un plazo estructurado de 60 meses, por lo que tu cuota quedaría en ${baseCuota}, la cual ya incluye la comisión por desembolso.\n\nLa principal ventaja es que te permite avanzar con ${baseMotivo} de forma INMEDIATA, ya que el depósito se realiza en tu cuenta en MENOS DE 2 HORAS.\n\n"El siguiente paso es completar tu solicitud para que recibas tu depósito hoy mismo. ¿Tienes tu identificación a la mano?"`;
};

// ─── EDUCACIÓN DE DOCUMENTOS / BIOMÉTRICOS ───────────────────────────────────

export const getEducacionText = (): string => {
  return `"En el link que te mandé procederemos a hacer tu carga de biométricos. Lo que necesitas ingresar en el sistema es tu clave interbancaria a donde haremos el depósito, fotos de tu INE por el frente y el reverso, una selfie y comprobante de domicilio. Con gusto te ayudo a subir tus documentos para que el proceso te sea lo más sencillo posible."\n\n📋 CHECKLIST DE DOCUMENTOS:\n\n1️⃣ CLABE — número de 18 dígitos de la cuenta donde recibirá el depósito.\n\n2️⃣ INE ORIGINAL (plástico) — fotos claras, sin destellos ni sombras, que salga completa por ambos lados. Evitar fondo blanco.\n\n3️⃣ SELFIE — rostro completo, sin accesorios que bloqueen la cara; evitar contraluz o sombra excesiva.\n\n4️⃣ COMPROBANTE DE DOMICILIO — aceptamos únicamente:\n   • CFE, Telmex, Mega Cable, Total Play, IZZI, Axtel (no necesitan estar a nombre del cliente)\n   • Telcel y AT&T (SÍ deben estar a nombre del cliente)\n   • Si usa la INE como comprobante, debe coincidir con el domicilio capturado en originación.\n\nPor comodidad, tus pagos mensuales se realizarán mediante DOMICILIACIÓN AUTOMÁTICA. NO cobramos penalización por pago anticipado.`;
};

// ─── LONGTRACK: VALIDACIÓN CURP / DATOS ──────────────────────────────────────

export const getLongTrackValidacionText = (): string => {
  return `Antes de proceder con la firma de tu contrato y el depósito, necesito validar que la información capturada en originación sea correcta.\n\nApóyate en https://www.gob.mx/curp/ para verificar:\n\n✅ CURP del cliente\n✅ Nombre completo (tal cual aparece en la CURP)\n✅ Fecha y entidad de nacimiento\n✅ Domicilio y datos de empleo\n\nDeja expectativas claras antes del cierre:\n• Especifica las FECHAS DE PAGO y formas de pago disponibles.\n• Los cobros se hacen por cargo domiciliado a la cuenta del depósito.\n• Para pagos a capital: cuenta en el contrato, página 6.\n• Ampliación disponible a partir del 3er pago puntual.\n• Resuelve cualquier duda antes de proceder al cierre.`;
};

// ─── CIERRE CON RECAPITULACIÓN ────────────────────────────────────────────────

export const getCierreText = (
  cliente: string,
  motivo: string,
  monto?: string,
  cuota?: string,
  plazo?: string,
  fechaPrimerPago?: string
): string => {
  const c = cliente || '[Cliente]';
  const m = monto ? `$${monto}` : '[Monto]';
  const cu = cuota ? `$${cuota}` : '[Cuota]';
  const pl = plazo || 'XX';
  const fp = fechaPrimerPago || 'DD/MM/AAAA';

  return `¡EXCELENTE DECISIÓN, ${c}! Me da mucho gusto ser parte de este paso. Te recapitulo lo que acabamos de cerrar:\n\n• Monto aprobado: ${m}\n• Pagos mensuales: ${cu} a ${pl} meses\n• Fecha de tu primer pago: ${fp}\n\nEl siguiente paso es la validación de riesgo. En caso de que nuestro analista requiera documentación adicional — recibos de nómina, estados de cuenta o constancia de situación fiscal — yo me pondré en contacto contigo personalmente. Si no se requiere documentación extra, un analista de riesgo te contactará directamente para la firma de tu contrato.\n\nPara iniciar el proceso, voy a pedirte 2 REFERENCIAS TELEFÓNICAS:\n1️⃣ Un familiar directo (nombre + teléfono)\n2️⃣ Un amigo o conocido (nombre + teléfono)\n\n¿Me las proporcionas ahora?`;
};

// ─── CLIENTE NO APLICA ────────────────────────────────────────────────────────

export const getNoAplicaText = (cliente: string): string => {
  return `Hola ${cliente || '[Cliente]'}, en este momento el crédito no pasó la validación del equipo de riesgos, por lo cual no podemos proceder con tu depósito. No te desanimes, ¡puedes volver a intentar en 3 meses!`;
};

// ─── SEGUIMIENTO (cliente no cerró hoy) ──────────────────────────────────────

export const getSeguimientoText = (): string => {
  return `Comprendo que desees evaluarlo con más tiempo. Dado que las condiciones de tu línea están APROBADAS Y LISTAS, ¿te parece adecuado si retomamos la llamada en un horario acordado?\n\n¿Cuál es la mejor fecha y hora para ti?`;
};

// ─── TESTIMONIOS ─────────────────────────────────────────────────────────────

export const getTestimonios = (tipoObjecion: string): string[] => {
  const testimonios: Record<string, string[]> = {
    tasa: [
      'Tuve un cliente que comparó nuestra tasa con la de su banco y al principio dudaba. Cuando hicimos números juntos se dio cuenta que el tiempo que iba a invertir reuniendo papeles, esperando aprobación y haciendo filas, le costaba más que la diferencia en intereses. Tomó el crédito, lo invirtió en su negocio y hoy esa inversión ya se pagó sola.',
    ],
    monto: [
      'Hace poco atendí a un cliente que sentía que el monto le quedaba corto. Le mostré que aunque no le alcanzaba para liquidar TODO, sí le permitía liberarse de las deudas principales y quedarse con un pago mensual ordenado. Al ir al corriente con sus tres primeros pagos accedió a una ampliación que usó para terminar de pagar el resto. Hoy duerme tranquilo.',
    ],
    necesidad: [
      'Una clienta me dijo exactamente que solo estaba curioseando. Le sugerí tomar el crédito como respaldo. Tres semanas después su hija tuvo una emergencia médica y me llamó a agradecer porque tenía el dinero disponible al instante, sin pedir prestado ni vender nada.',
    ],
    pensamiento: [
      'Tuve un cliente que pidió un día para pensarlo. Cuando volvió a llamar, la oferta había caducado y los criterios habían cambiado. Desde ese día, mi compromiso es resolver dudas EN EL MOMENTO.',
    ],
  };

  return (
    testimonios[tipoObjecion] || [
      'Tenemos clientes en todas las situaciones: negocios, emergencias, vacaciones, remodelaciones. Lo que todos coinciden es en la rapidez del depósito y lo claro del proceso. Eso es lo que quiero que tú vivas.',
    ]
  );
};
