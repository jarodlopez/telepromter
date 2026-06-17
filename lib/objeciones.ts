export interface Objecion {
  id: string;
  title: string;
  categoria: 'precio' | 'monto' | 'tiempo' | 'necesidad' | 'capacidad' | 'desconfianza' | 'otro';
  r: string;
  e: string;
  a: string;
  tips: string[];
}

// Banco de objeciones de CAMPO — frases reales que el cliente dice por teléfono,
// resueltas con el marco REA (Reconoce / Empatiza / Asegura).
//
// REGLA DE ORO: tasa, monto, plazo y cuota los define el sistema. El asesor NUNCA
// ofrece moverlos para rebatir una objeción. Las objeciones se resuelven con la
// propuesta de valor (depósito en 2 h, 100% en línea, abono a capital sin
// penalización, saldo insoluto, ampliación al 3er pago) y con los propios datos
// que el cliente entregó en el perfilamiento.
export const objecionesData: Objecion[] = [
  {
    id: 'desconfianza-fraude',
    title: '🛡️ "¿Cómo sé que no es un fraude?"',
    categoria: 'desconfianza',
    r: 'Te entiendo perfectamente: hoy circulan muchos fraudes y haces bien en verificar antes de compartir cualquier dato.',
    e: 'De hecho, me da confianza que seas precavido; así actúan los clientes que cuidan su dinero, y es justo lo que yo haría.',
    a: 'Permíteme darte certeza: MultiMoney es una financiera regulada y esta llamada queda grabada y registrada. Nunca te pediremos un depósito, anticipo ni "comisión para liberar tu crédito"; si alguien lo hace, eso sí es fraude. El dinero llega a TU cuenta, a la CLABE que TÚ proporcionas, nunca al revés. Puedes verificarnos en este momento buscándonos en Google o en nuestras redes oficiales mientras continuamos. ¿Te parece si lo confirmas y seguimos?',
    tips: [
      'Valida la pregunta, nunca te incomodes',
      'Recalca: jamás se pide depósito por adelantado',
      'El dinero llega a la CLABE del cliente, no al revés',
      'Invítalo a verificar la empresa en el momento',
    ],
  },
  {
    id: 'mandame-whatsapp',
    title: '📲 "Mándamelo por WhatsApp y lo reviso"',
    categoria: 'otro',
    r: 'Claro, con gusto te dejo todo por escrito para que lo tengas a la mano.',
    e: 'Sé que el día se va rápido y prefieres revisarlo con calma; lo entiendo.',
    a: 'Te soy transparente: tu oferta está aprobada y reservada a tu nombre, pero las condiciones las recalcula el sistema y por mensaje no puedo garantizarte que mañana se mantengan igual. En tres minutos te explico los números exactos, resuelvo tus dudas al momento y, hecho eso, te envío el resumen por WhatsApp para que lo conserves. ¿Lo revisamos ahora y así decides con toda la información?',
    tips: [
      'No envíes y cuelgues: ahí se pierde el lead',
      'La urgencia es real: el sistema puede recalcular',
      'Ofrece el WhatsApp DESPUÉS de explicar, no antes',
      'Acota el tiempo: "son tres minutos"',
    ],
  },
  {
    id: 'mal-momento',
    title: '⏰ "Estoy ocupado / trabajando"',
    categoria: 'tiempo',
    r: 'Te entiendo, te encuentro en medio de tus actividades.',
    e: 'Lo último que quiero es restarte tiempo mientras estás ocupado con tu trabajo.',
    a: 'Justo por eso seré breve: en una frase, tienes un crédito aprobado que se deposita hoy mismo, 100% en línea. Si me regalas dos minutos, lo dejamos encaminado; y si en este momento no se puede, dime a qué hora te queda mejor y te marco con puntualidad. ¿Cómo lo prefieres?',
    tips: [
      'No insistas a la fuerza: ofrece reagendar',
      'Entrega el gancho principal en una sola frase',
      'Si reagenda, fija hora exacta y cúmplela',
      'Confirma su número y mejor horario',
    ],
  },
  {
    id: 'datos-telefono',
    title: '🔒 "No doy mis datos por teléfono"',
    categoria: 'desconfianza',
    r: 'Me parece correcto: tus datos son tuyos y debes cuidarlos.',
    e: 'Pienso igual; nadie debería compartir su información a la ligera.',
    a: 'Quiero que te quede claro: en esta llamada no te pediré contraseñas, NIP de tu tarjeta ni códigos que te lleguen por mensaje; eso jamás. Tu INE, tu selfie y tu CLABE los cargas TÚ mismo en una liga segura y cifrada, no me los dictas a mí. Yo solo te acompaño en el proceso; el control es tuyo en todo momento. ¿Te muestro cómo funciona la liga para que veas que es segura?',
    tips: [
      'Aclara qué NUNCA pides (NIP, contraseñas, OTP)',
      'El cliente carga sus documentos, no los dicta',
      'Enfatiza que la liga es cifrada y segura',
      'Devuélvele el control de la información',
    ],
  },
  {
    id: 'tasa-alta',
    title: '💸 "La tasa de interés es muy alta"',
    categoria: 'precio',
    r: 'Entiendo, la tasa es de lo primero que se revisa y haces bien en cuestionarla.',
    e: 'Es completamente válido: estás cuidando tu dinero y mereces saber con exactitud qué pagas y por qué.',
    a: 'Déjame ponerlo en su justo contexto: esta tasa corresponde a un crédito sin garantía, sin aval y sin que comprometas ningún bien, con el dinero en tu cuenta hoy en menos de dos horas y 100% en línea. Frente a un crédito de este mismo tipo —no contra una hipoteca o un crédito de auto— es una tasa competitiva. Y juega a tu favor: calculamos intereses sobre saldo insoluto, así que si abonas a capital pagas menos y sin penalización; tú controlas cuánto terminas pagando. ¿Calculamos tu pago mensual exacto para que lo valores con números reales?',
    tips: [
      'NO concedas que la tasa es alta ni que "no eres el más barato"',
      'Reencuadra: crédito sin garantía ni aval, no comparable con banca tradicional',
      'Ancla en el pago mensual y el saldo insoluto, no en el %',
      'La tasa la define el sistema: no ofrezcas bajarla',
    ],
  },
  {
    id: 'cuota-alta',
    title: '📅 "La mensualidad está muy alta para mí"',
    categoria: 'capacidad',
    r: 'Entiendo: quieres asegurarte de que la mensualidad se acomode a tu presupuesto.',
    e: 'Es lo más responsable: confirmar que cada mes te quede cómodo antes de comprometerte.',
    a: 'Déjame darte certeza de cómo está construida tu oferta: es un pago fijo, sin sorpresas, y como no penalizamos el pago anticipado, cualquier mes que tengas holgura puedes abonar a capital, reducir el saldo y terminar antes pagando menos intereses. Y si tu objetivo es ordenar deudas, comparemos: este pago único sustituye los varios que hoy haces por separado. ¿Cuánto sumas hoy entre todos tus pagos mensuales? Hagamos el comparativo con tus números.',
    tips: [
      'La cuota es parte de la oferta del sistema: NO ofrezcas modificarla',
      'Apóyate en el abono a capital sin penalización',
      'Si es consolidación, compara el pago único vs. la suma actual',
      'Argumenta con las cifras del propio cliente',
    ],
  },
  {
    id: 'ya-tengo-deudas',
    title: '😰 "Ya tengo muchas deudas"',
    categoria: 'capacidad',
    r: 'Te entiendo: sientes que sumar otro pago sería más peso encima.',
    e: 'Es una preocupación muy real; manejar varias deudas a la vez desgasta a cualquiera.',
    a: 'Aquí es justo donde esto puede ayudarte en lugar de estorbarte: la idea no es que pagues más, sino consolidar esas deudas en un solo lugar. En vez de seguir varias fechas y varios intereses, lo concentras en un pago ordenado y con fecha fija. ¿Cuánto pagas hoy en total entre todas tus deudas? Hagamos números y veamos si te conviene reunirlas en una sola.',
    tips: [
      'Reencuadra: consolidación, no más deuda',
      'Suma lo que paga hoy vs. un solo pago',
      'Vende orden y control financiero',
      'Pide cifras para sustentar el comparativo',
    ],
  },
  {
    id: 'miedo-atraso',
    title: '🤲 "¿Y si un mes no puedo pagar?"',
    categoria: 'capacidad',
    r: 'Muy buena pregunta: te anticipas a un imprevisto, y eso es ser responsable.',
    e: 'A cualquiera puede tocarle un mes complicado; es completamente humano planteárselo.',
    a: 'Por eso lo primero es tomar una decisión informada hoy, con un pago que estés seguro de poder cubrir. Si en algún momento se te complica, lo peor es aislarte: me contactas directamente y vemos cómo acomodarlo antes de que escale. Y mientras pagas puntual, construyes historial y se te habilita la ampliación al tercer pago. ¿Revisamos los números para que quedes plenamente seguro de tu pago mensual?',
    tips: [
      'Promueve una decisión informada, no presionada',
      'Ofrécete como contacto directo ante problemas',
      'No inventes seguros ni beneficios inexistentes',
      'Liga la puntualidad con la ampliación',
    ],
  },
  {
    id: 'pensar',
    title: '🤔 "Lo tengo que pensar"',
    categoria: 'tiempo',
    r: 'Claro, es una decisión financiera y quieres estar seguro antes de darme el sí.',
    e: 'Lo entiendo; nadie debería comprometerse sin sentirse tranquilo.',
    a: 'Y justo para que decidas con tranquilidad estoy aquí. Casi siempre que alguien necesita pensarlo es porque quedó una duda puntual sin resolver. Seamos directos: ¿qué es lo que aún no te cuadra: el monto, la mensualidad, el costo o la confianza en nosotros? Si lo resolvemos ahora, ya no queda nada pendiente. Y un dato importante: las condiciones de hoy las puede recalcular el sistema más adelante, por eso conviene aprovecharlas. ¿Qué es lo que te detiene?',
    tips: [
      'Descubre la duda REAL detrás del "lo pienso"',
      'Ofrece las posibles dudas para que elija una',
      'Urgencia real: el sistema recalcula condiciones',
      'Resuelve la objeción en el momento',
    ],
  },
  {
    id: 'consultar-pareja',
    title: '💑 "Lo tengo que consultar con mi pareja"',
    categoria: 'tiempo',
    r: 'Me parece perfecto: las decisiones importantes se toman en conjunto.',
    e: 'Y habla bien de ti consultarlo; así se construye la confianza en casa.',
    a: 'Justo por eso conviene que llegues con la información completa y no a medias. Tenemos dos opciones: si tu pareja está cerca, hacemos una llamada de tres vías y resolvemos cualquier duda al momento; o, si prefieres, te dejo los números exactos para que se los presentes con claridad. ¿Qué dudas crees que pondría? Vamos preparándolas para que llegues con la respuesta lista. ¿Se encuentra disponible ahora?',
    tips: [
      'Ofrece llamada de tres vías en el momento',
      'Anticipen juntos las posibles dudas de la pareja',
      'No lo dejes irse con información incompleta',
      'Pregunta si la pareja está disponible ya',
    ],
  },
  {
    id: 'monto-bajo',
    title: '📉 "El monto aprobado está muy bajo"',
    categoria: 'monto',
    r: 'Entiendo: esperabas un monto mayor para lo que tienes en mente.',
    e: 'Es válido; cuando traes un plan, quieres los recursos completos de una vez.',
    a: 'Permíteme explicarte cómo funciona: el monto de hoy es tu punto de entrada, no tu techo. A partir del tercer pago puntual se habilita la ampliación, sin repetir todo el proceso desde cero. Es decir, entre más pronto arrancas, más pronto accedes a un monto mayor. ¿Para qué destino necesitabas el monto completo? Veamos qué resuelves ya con esta oferta y dejamos sembrada la ampliación para el siguiente paso.',
    tips: [
      'Encuadra el monto como entrada, no como techo',
      'Explica la ampliación al 3er pago puntual',
      'Prioriza qué resuelve ya con lo aprobado',
      'El monto lo define el sistema: no prometas subirlo',
    ],
  },
  {
    id: 'comparacion-banco',
    title: '🏦 "Mi banco me da mejor tasa"',
    categoria: 'precio',
    r: 'Qué bueno que tengas esa opción sobre la mesa; te da con qué comparar.',
    e: 'Y haces bien en comparar; es tu dinero y mereces la mejor decisión.',
    a: 'Te pregunto directo: ¿tu banco ya te aprobó y te deposita hoy, o todavía tienes que acudir, llevar papeles y esperar resolución? Ahí está la diferencia real. Una tasa un poco menor sirve de poco si tu necesidad es hoy y la respuesta del banco llega en una semana, si es que la aprueban. Con nosotros ya está hecho: aprobado y depositado en menos de dos horas. ¿Tu necesidad puede esperar, o la quieres resuelta hoy?',
    tips: [
      'Pregunta si el banco YA lo aprobó',
      'Tiempo-valor: una semana vs. dos horas',
      'No compitas por tasa, compite por inmediatez',
      'Aterriza la urgencia de SU necesidad',
    ],
  },
  {
    id: 'no-necesito',
    title: '🙅 "Ya no lo necesito"',
    categoria: 'necesidad',
    r: 'Buena noticia: significa que ya resolviste lo que traías pendiente.',
    e: 'Me da gusto, y respeto que tu situación haya cambiado.',
    a: 'Permíteme plantearte algo: tener un crédito aprobado y disponible no te obliga a usarlo, pero te deja un respaldo para cuando surja una emergencia, una oportunidad o un imprevisto. Y como no cobramos por pago anticipado, lo conservas sin presión. Además, usarlo y pagarlo puntual te construye historial para montos mayores más adelante. ¿Hay algún proyecto que hayas dejado en pausa por falta de liquidez: una reparación, un pendiente, capital para algo?',
    tips: [
      'Reencuadra como fondo de respaldo',
      'Explora proyectos que dejó en pausa',
      'Sin costo por mantenerlo disponible',
      'Vende el beneficio del historial crediticio',
    ],
  },
];
