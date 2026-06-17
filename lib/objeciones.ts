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
export const objecionesData: Objecion[] = [
  {
    id: 'desconfianza-fraude',
    title: '🛡️ "¿Cómo sé que no es un fraude?"',
    categoria: 'desconfianza',
    r: 'Te entiendo perfecto: hoy circulan muchos fraudes y haces bien en ponerte alerta antes de dar cualquier dato.',
    e: 'De hecho me da gusto que seas precavido — así son los clientes que cuidan su dinero, y es justo lo que yo haría en tu lugar.',
    a: 'Déjame darte certeza: MultiMoney es una financiera regulada, y por eso esta llamada está grabada y queda registro de todo. NUNCA te vamos a pedir un depósito, anticipo ni "comisión para liberar tu crédito"; si alguien te lo pide, ESO sí es fraude. El dinero llega a TU cuenta, a una CLABE que TÚ me das — nunca al revés. Puedes verificarnos ahorita mismo: busca "MultiMoney" en Google o en redes mientras seguimos. ¿Lo revisas y continuamos?',
    tips: [
      'Nunca te molestes por la pregunta: valídala',
      'Recalca: jamás pedimos depósito por adelantado',
      'El dinero llega a la CLABE del cliente, no al revés',
      'Invítalo a verificar la empresa en el momento',
    ],
  },
  {
    id: 'mandame-whatsapp',
    title: '📲 "Mándamelo por WhatsApp y lo reviso"',
    categoria: 'otro',
    r: 'Claro, con gusto te dejo todo por escrito para que lo tengas a la mano.',
    e: 'Sé que el día se va volando y prefieres revisarlo con calma, lo entiendo.',
    a: 'Te soy honesto: la oferta que tienes hoy está aprobada y reservada A TU NOMBRE, pero los montos y tasas se actualizan, y por WhatsApp no te garantizo que mañana siga igual. Son 3 minutos: te explico los números exactos, resuelvo tus dudas en caliente y, eso sí, te mando el resumen por WhatsApp para que lo conserves. ¿Te late si lo vemos rapidito ahora y ya con eso decides con todo claro?',
    tips: [
      'No mandes y cuelgues: ahí pierdes el lead',
      'Crea urgencia real (la oferta puede recalcularse)',
      'Ofrece el WhatsApp DESPUÉS de explicar, no antes',
      'Acota el tiempo: "son 3 minutos"',
    ],
  },
  {
    id: 'mal-momento',
    title: '⏰ "Ahorita estoy ocupado / trabajando"',
    categoria: 'tiempo',
    r: 'Te entiendo, te agarré en medio de tus labores.',
    e: 'Lo último que quiero es quitarte tiempo cuando estás al tiro con tu trabajo.',
    a: 'Justo por eso esto es rápido: en lo que sigues con lo tuyo, déjame decirte en una frase para qué te marco — tienes un crédito aprobado que se deposita HOY mismo. Si me regalas 2 minutos ahorita lo dejamos encaminado; y si de plano no se puede, dime a qué hora te cae mejor y yo te marco puntual. ¿Qué prefieres?',
    tips: [
      'No insistas a la fuerza: ofrece reagendar',
      'Da el gancho principal en una sola frase',
      'Si reagenda, fija HORA exacta y cúmplela',
      'Confirma su número y mejor horario',
    ],
  },
  {
    id: 'datos-telefono',
    title: '🔒 "No doy mis datos por teléfono"',
    categoria: 'desconfianza',
    r: 'Me parece muy bien: tus datos son tuyos y debes cuidarlos.',
    e: 'Yo opino igual, nadie debería andar repartiendo su información a la ligera.',
    a: 'Que te quede claro: en esta llamada NO te voy a pedir contraseñas, NIP de tu tarjeta ni códigos que te lleguen por mensaje. Eso jamás. Tu INE, tu selfie y tu CLABE los subes TÚ MISMO en una liga segura y cifrada — no me los dictas a mí. Yo solo te acompaño en el proceso; tú tienes el control en todo momento. ¿Te muestro cómo funciona la liga para que veas que es seguro?',
    tips: [
      'Aclara qué NUNCA pides (NIP, contraseñas, OTP)',
      'El cliente sube sus documentos, no los dicta',
      'Enfatiza que la liga es cifrada y segura',
      'Devuélvele el control: "tú decides todo"',
    ],
  },
  {
    id: 'tasa-alta',
    title: '💸 "Está muy cara la tasa / son un robo"',
    categoria: 'precio',
    r: 'Te escucho: sientes que la tasa pega fuerte y quieres saber que vale la pena.',
    e: 'Y tienes razón en fijarte — es tu dinero y debes cuidar cada peso.',
    a: 'Te voy a ser franco: no somos los más baratos del mercado, y no te voy a mentir diciendo que sí. Lo que SÍ te doy es lo que un banco no: el dinero en tu cuenta HOY, en menos de 2 horas, sin filas, sin que te pidan mil papeles ni esperar una semana a que un comité decida. Y un dato clave: cobramos sobre saldo, así que si abonas de más, pagas MENOS intereses, sin penalización. ¿Hacemos el cálculo de tu pago real, no el del miedo?',
    tips: [
      'Sé honesto: no eres el más barato',
      'Vende rapidez y certeza, no precio',
      'Explica el saldo insoluto (pago anticipado)',
      'Aterriza el número real, no el imaginado',
    ],
  },
  {
    id: 'cuota-alta',
    title: '📅 "La mensualidad está muy alta para mí"',
    categoria: 'capacidad',
    r: 'Entiendo: lo que te preocupa es que la cuota mensual no te apriete el presupuesto.',
    e: 'Y es lo más sano que puedes hacer — pensar primero si te va a quedar cómodo cada mes.',
    a: 'Trabajemos en eso juntos. Tenemos plazo de hasta 60 meses: si lo estiramos, la cuota baja y se acomoda a lo que sí te queda cómodo al mes. También puedo ajustar el monto a lo que realmente necesitas, no más. Y recuerda: como no hay penalización, los meses que te sobre puedes abonar de más y terminar antes. Dime, ¿de cuánto sería un pago mensual que SÍ manejarías sin presión? Armamos la estructura desde ahí.',
    tips: [
      'Ajusta el plazo para bajar la cuota',
      'Pregunta el pago cómodo y construye hacia atrás',
      'Reduce el monto si hace falta',
      'Recuerda: abonos a capital sin penalización',
    ],
  },
  {
    id: 'ya-tengo-deudas',
    title: '😰 "Ya tengo muchas deudas"',
    categoria: 'capacidad',
    r: 'Te entiendo: sientes que sumar otro pago sería echarte más peso encima.',
    e: 'Y es una preocupación muy real — traer varias deudas a la vez agota a cualquiera.',
    a: 'Justo aquí es donde esto te puede AYUDAR, no estorbar. La idea no es que pagues más, sino que JUNTES esas deudas en un solo lugar: en vez de perseguir tres o cuatro fechas y tres o cuatro intereses, lo dejamos en UN solo pago, ordenado y con fecha fija. Mucha gente hasta termina pagando menos al mes al consolidar. Cuéntame, ¿cuánto pagas hoy entre todas tus deudas? Hagamos números y veamos si te conviene juntarlas.',
    tips: [
      'Reencuadra: consolidación, no más deuda',
      'Suma lo que paga hoy vs. un solo pago',
      'Vende orden y tranquilidad mental',
      'Pide cifras para demostrar el ahorro',
    ],
  },
  {
    id: 'miedo-atraso',
    title: '🤲 "¿Y si un mes no puedo pagar?"',
    categoria: 'capacidad',
    r: 'Muy buena pregunta: te estás poniendo en el escenario de un imprevisto, y eso es ser responsable.',
    e: 'A todos nos puede pasar un mes flojo, es completamente humano preguntarlo.',
    a: 'Por eso lo importante es que la cuota quede a tu medida desde el inicio, para que el pago normal nunca te ahogue — y eso lo cuidamos juntos hoy. Si algún día se te complica, lo peor es esconderte: me marcas A MÍ y vemos cómo acomodarlo antes de que se haga bola. No estás solo en esto. Y mientras pagues puntual, generas historial y se te abre la ampliación al tercer pago. ¿Dejamos la cuota en un monto que estés MUY seguro de poder cubrir?',
    tips: [
      'Calibra la cuota a un nivel seguro',
      'Ofrécete como contacto directo ante problemas',
      'No inventes seguros o beneficios que no existen',
      'Liga la puntualidad con la ampliación',
    ],
  },
  {
    id: 'pensar',
    title: '🤔 "Déjame pensarlo"',
    categoria: 'tiempo',
    r: 'Claro, es una decisión de dinero y quieres estar seguro antes de dar el sí.',
    e: 'Lo entiendo — yo tampoco brinco a algo sin sentirme tranquilo.',
    a: 'Y justo para que decidas tranquilo estoy yo aquí. Casi siempre que alguien dice "déjame pensarlo" es porque quedó UNA duda dando vueltas. Sé honesto conmigo: ¿qué es lo que todavía no te termina de cuadrar? ¿El monto, la cuota, los intereses, o la confianza en nosotros? Si lo resolvemos ahorita, ya no tienes nada que pensar. Y algo importante: esta oferta está reservada para hoy, mañana el sistema puede recalcular. ¿Qué es lo que te frena?',
    tips: [
      'Descubre la duda REAL detrás del "lo pienso"',
      'Ofrece opciones de la duda para que elija una',
      'Urgencia real, sin presión agresiva',
      'Resuelve EN EL MOMENTO',
    ],
  },
  {
    id: 'consultar-pareja',
    title: '💑 "Lo tengo que consultar con mi pareja"',
    categoria: 'tiempo',
    r: 'Me parece perfecto: las decisiones importantes en pareja se toman juntos.',
    e: 'Y habla bien de ti que lo consultes — así se construye la confianza en casa.',
    a: 'Justamente por eso, mejor que llegues con TODA la información clara, no a medias. Dos opciones: si tu pareja está cerca, hacemos una llamada rápida los tres y resolvemos cualquier duda al momento; o si prefieres, te doy los números exactos para que se los presentes bien explicados. ¿Qué dudas crees que te va a poner? Vamos preparándolas para que llegues con la respuesta lista. ¿Está por ahí ahorita?',
    tips: [
      'Ofrece llamada de tres vías en el momento',
      'Arma juntos las posibles dudas de la pareja',
      'No lo dejes irse "a medias informado"',
      'Pregunta si la pareja está disponible ya',
    ],
  },
  {
    id: 'monto-bajo',
    title: '📉 "El monto aprobado está muy bajo"',
    categoria: 'monto',
    r: 'Entiendo, esperabas un monto más alto para lo que tienes en mente.',
    e: 'Y se vale — cuando uno trae un plan quiere los recursos completos de una vez.',
    a: 'Mira cómo funciona esto: el monto de hoy es tu PUNTO DE ENTRADA, no tu techo. A partir del TERCER PAGO PUNTUAL se te abre la ampliación automática, sin volver a empezar todo el proceso. O sea, entre más pronto arrancas, más pronto llegas a un monto mayor. ¿Para qué necesitabas el monto completo? Veamos qué resuelves YA con esto y dejamos sembrada la ampliación para lo que sigue.',
    tips: [
      'Encuadra el monto como entrada, no como techo',
      'Explica la ampliación al 3er pago puntual',
      'Prioriza qué resuelve ya con lo aprobado',
      'Siembra la siguiente meta de monto',
    ],
  },
  {
    id: 'comparacion-banco',
    title: '🏦 "Mi banco me da mejor tasa"',
    categoria: 'precio',
    r: 'Qué bueno que tengas esa opción sobre la mesa, eso te da con qué comparar.',
    e: 'Y haces bien en comparar — es tu dinero y mereces lo mejor.',
    a: 'Te pregunto algo directo: ¿tu banco ya te APROBÓ y te deposita hoy, o todavía tienes que ir, llevar papeles y esperar a que te resuelvan? Ahí está la diferencia real. Una tasa un poquito más baja no sirve de mucho si tu necesidad es HOY y la respuesta del banco llega en una semana —si es que la aprueban—. Contigo ya está hecho: aprobado y depositado en 2 horas. ¿Tu necesidad puede esperar a que el banco resuelva, o la quieres resuelta hoy?',
    tips: [
      'Pregunta si el banco YA lo aprobó',
      'Tiempo-valor: una semana vs. 2 horas',
      'No pelees la tasa, pelea la inmediatez',
      'Aterriza la urgencia de SU necesidad',
    ],
  },
  {
    id: 'no-necesito',
    title: '🙅 "Ya no lo necesito"',
    categoria: 'necesidad',
    r: 'Qué buena noticia, eso significa que ya resolviste lo que traías.',
    e: 'Me da gusto de verdad, y respeto que tu situación haya cambiado.',
    a: 'Déjame plantearte algo: tener un crédito APROBADO y disponible no te obliga a usarlo, pero te deja un COLCHÓN para cuando la vida sorprende — una emergencia, una oportunidad, un imprevisto —. Y como no cobramos por pago anticipado, lo tienes ahí sin presión. Además, usarlo y pagarlo bien te construye historial para montos mayores después. ¿Hay algo que hayas dejado en pausa por falta de liquidez? Una reparación, un gusto pendiente, capital para algo...',
    tips: [
      'Reencuadra como fondo de respaldo',
      'Explora proyectos que dejó en pausa',
      'Sin costo por mantenerlo disponible',
      'Vende el beneficio del historial crediticio',
    ],
  },
];
