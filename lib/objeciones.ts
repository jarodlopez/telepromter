export interface Objecion {
  id: string;
  title: string;
  categoria: 'precio' | 'monto' | 'tiempo' | 'necesidad' | 'otro';
  r: string;
  e: string;
  a: string;
  tips: string[];
}

export const objecionesData: Objecion[] = [
  {
    id: 'tasa-alta',
    title: '💰 La Tasa de Interés es Muy Alta',
    categoria: 'precio',
    r: 'Escucho que la tasa de interés te genera una preocupación sobre el costo total del crédito.',
    e: 'Es completamente válido que analices el costo financiero — eso habla de que eres un cliente responsable y consciente de tus finanzas.',
    a: 'Comparado con otras opciones del mercado, nuestra tasa es competitiva. Pero lo más importante es que YA estás pre-aprobado hoy: eso significa proceso rápido, sin filas, sin trámites complicados. El valor de tener certeza y rapidez tiene un peso real. Además, si haces pagos anticipados, el interés se reduce considerablemente. ¿Te parece si calculamos juntos cuánto sería tu pago mensual real?',
    tips: [
      'Compara con otras opciones bancarias',
      'Resalta velocidad de depósito (2 horas)',
      'Menciona flexibilidad de pagos a capital',
      'Usa argumento ROI si es para negocio',
    ],
  },
  {
    id: 'monto-bajo',
    title: '📉 El Monto Aprobado es Muy Bajo',
    categoria: 'monto',
    r: 'Entiendo que mencionas que el monto aprobado te parece limitado para lo que necesitas en total.',
    e: 'Comprendo perfectamente — cuando uno tiene un proyecto en mente, quiere asegurarse de tener todos los recursos completos para ejecutarlo sin contratiempos.',
    a: 'El monto aprobado representa el PRIMER PASO de una relación crediticia con nosotros. Aquí está la buena noticia: a partir del TERCER PAGO PUNTUAL, tienes acceso automático a una ampliación de crédito, lo que te permitirá acceder a montos mayores en muy poco tiempo sin volver a pasar por toda la evaluación. Así que este es el inicio, no el límite. ¿Empezamos hoy para que llegues antes a ese objetivo?',
    tips: [
      'Indaga el uso específico del dinero',
      'Pregunta qué fases tiene el proyecto',
      'Destaca que puede fasearlo',
      'Explica el beneficio del historial crediticio',
    ],
  },
  {
    id: 'pensar',
    title: '🤔 Lo Tengo que Pensar / Consultar',
    categoria: 'tiempo',
    r: 'Claro, me comentas que necesitas un poco de tiempo para pensar o consultarlo con alguien más.',
    e: 'Completamente entendible — es una decisión financiera importante y es normal querer estar seguro antes de comprometerse.',
    a: 'Justamente por eso estoy aquí: para que tomes la decisión CON TODA LA INFORMACIÓN NECESARIA AHORA MISMO. ¿Qué es específicamente lo que te genera la duda? ¿Es el monto, el plazo, la documentación o algo más? Si podemos resolver esa duda en este momento, evitas perder tiempo valioso. La oferta de hoy puede cambiar mañana, así que realmente es mejor decidir con claridad ahora. Si necesitas hablar con tu pareja, ¿te parece si hacemos una llamada de tres vías en este momento para resolver juntos?',
    tips: [
      'Identifica la duda específica',
      'Ofrece llamada tripartita si es necesario',
      'Usa urgencia sin presionar',
      'Enfatiza que la oferta es HOY',
    ],
  },
  {
    id: 'no-necesito',
    title: '❌ Ya No Lo Necesito',
    categoria: 'necesidad',
    r: 'Entiendo que la situación que motivó tu solicitud inicial ya fue resuelta por otro medio.',
    e: 'Lo cual es excelente noticia — significa que encontraste una solución a tu necesidad.',
    a: 'Sin embargo, al tener ya el crédito APROBADO y disponible, puedes usarlo como un FONDO DE EMERGENCIA PERMANENTE o capitalizar algún otro proyecto que tengas pendiente. El hecho de que no tenga costo por apertura anticipada significa que puedes mantener la línea abierta sin presión. Además, genera historial crediticio positivo que te abre más puertas en el futuro. ¿Hay algo que hayas estado postergando por falta de liquidez? Vacaciones, reparaciones en casa, una oportunidad de negocio…',
    tips: [
      'Explora proyectos postergados',
      'Resalta concepto de "colchón financiero"',
      'Menciona beneficio crediticio',
      'Destaca flexibilidad sin costo',
    ],
  },
  {
    id: 'no-monto-completo',
    title: '✂️ No Necesito la Suma Entera',
    categoria: 'monto',
    r: 'Comprendo, me comentas que el monto completo te parece más de lo que necesitas en este momento específico.',
    e: 'Aprecio que seas tan preciso con tu planeación financiera — eso es una cualidad que te va a servir mucho en cualquier proyecto que emprendas.',
    a: 'Te entiendo, y aquí está la parte interesante: TOMAR EL MONTO MAYOR NO SIGNIFICA QUE TENGAS QUE USAR TODO DE INMEDIATO. Tener ese recurso disponible en tu cuenta te da FLEXIBILIDAD TOTAL para aprovechar oportunidades imprevistas. Además, el historial que generas con el monto completo te posiciona MEJOR para futuras ampliaciones. Cuéntame: ¿para qué ibas a usar específicamente la parte que SÍ necesitas? Así vemos si el dinero restante no podría cubrir algo más que tengas en mente.',
    tips: [
      'Indaga usos específicos actuales',
      'Identifica necesidades futuras',
      'Destaca flexibilidad de no usar todo',
      'Calcula juntos múltiples usos',
    ],
  },
  {
    id: 'rechazo-anterior',
    title: '⏮️ Ya Rechacé Esta Oferta Antes',
    categoria: 'otro',
    r: 'Veo que en una ocasión anterior decidiste no avanzar con una oferta similar que te presentamos.',
    e: 'Es completamente válido — cada momento es diferente y nuestras prioridades financieras cambian según la etapa en que nos encontremos.',
    a: 'Lo bueno es que trabajamos especialmente en tu perfil para traerte UNA OFERTA MEJORADA hoy. El monto, la tasa o los beneficios pueden haber cambiado a tu favor. Lo que te presento es diferente a lo anterior. ¿Qué fue lo que te hizo decidir no avanzar la vez anterior? Así me aseguro de que esta vez tu experiencia sea distinta.',
    tips: [
      'Revisa notas de rechazo anterior',
      'Enfatiza que es oferta mejorada',
      'Identifica motivo del rechazo previo',
      'Muestra mejora específica',
    ],
  },
  {
    id: 'comparacion-banco',
    title: '🏦 Comparé con Otros Bancos',
    categoria: 'precio',
    r: 'Entiendo que has estado comparando opciones con otros bancos o instituciones financieras.',
    e: 'Es prudente analizar diferentes opciones antes de tomar una decisión financiera importante.',
    a: 'Aquí está el diferenciador: aunque otro banco te ofrezca 0.1% más bajo en tasa, estarías en un proceso de 5-7 días, con documentos que tramitar, colas que hacer. Con nosotros: depósito en 2 HORAS, proceso 100% en línea, SIN PAPELERÍA, SIN FILAS. El valor de la rapidez y certeza tiene un costo, y es MÍNIMO comparado con el tiempo que recuperas. Además, YA ESTÁS APROBADO. Con los otros bancos estarías empezando el proceso. ¿Cuánto vale para ti resolver tu necesidad HOY versus esperar una semana?',
    tips: [
      'Reconoce que comparó opciones',
      'Resalta ventaja competitiva (velocidad)',
      'Usa argumento de tiempo-valor',
      'Enfatiza aprobación inmediata',
    ],
  },
];
