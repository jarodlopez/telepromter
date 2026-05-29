export interface FAQ {
  q: string;
  a: string;
  categoria: 'tiempo' | 'documentacion' | 'pagos' | 'fondos' | 'ampliacion' | 'otro';
  icon: string;
}

export const faqData: FAQ[] = [
  {
    icon: '⏱️',
    q: '¿Cuánto tardan en depositar el dinero?',
    categoria: 'tiempo',
    a: 'Una vez que completes la validación biométrica y apruebes el contrato digital, el área de Riesgo libera los fondos a tu cuenta en un MÁXIMO DE 2 HORAS HÁBILES. Este es uno de nuestros principales diferenciales en el mercado.',
  },
  {
    icon: '📋',
    q: '¿Qué documentación necesito para el proceso biométrico?',
    categoria: 'documentacion',
    a: 'Necesitas 3 cosas: (1) Tu INE original en plástico — tomaremos fotos claras por ambos lados, (2) Un comprobante de domicilio RECIENTE de: CFE, Telmex, Mega Cable, Total Play, IZZI, Axtel, Telcel o AT&T, (3) Tu CLABE de 18 dígitos de la cuenta donde recibirás el depósito. TODO es 100% digital, sin necesidad de ir a una oficina.',
  },
  {
    icon: '💳',
    q: '¿Cómo y dónde se hacen los pagos?',
    categoria: 'pagos',
    a: 'Para tu comodidad, los pagos se realizan mediante DOMICILIACIÓN AUTOMÁTICA a la cuenta CLABE que nos proporciones en el contrato. También puedes hacer transferencias directas por SPEI o pagos en ventanilla bancaria si deseas abonar DIRECTAMENTE A CAPITAL — sin penalización alguna.',
  },
  {
    icon: '🔍',
    q: '¿Revisan el Buró de Crédito?',
    categoria: 'fondos',
    a: 'Sí, como institución financiera regulada, revisamos tu historial de crédito. La pre-aprobación que tenemos para ti YA CONSIDERÓ tu perfil crediticio, así que la oferta que ves es específica para tu situación. No hay sorpresas: ya fuiste evaluado.',
  },
  {
    icon: '💰',
    q: '¿Me cobran comisión por apertura?',
    categoria: 'pagos',
    a: 'La comisión por desembolso YA VIENE FINANCIADA dentro de la cuota mensual que te mencioné. No tienes que desembolsar ABSOLUTAMENTE NADA por adelantado. El monto aprobado es lo que recibirás completo en tu cuenta.',
  },
  {
    icon: '🚫',
    q: '¿Hay penalización por pagar antes?',
    categoria: 'pagos',
    a: 'NO. Uno de nuestros grandes beneficios es que NO COBRAMOS PENALIZACIÓN por pago anticipado. Si quieres abonar DIRECTAMENTE A CAPITAL en cualquier momento, lo haces sin ningún costo adicional. Así el interés disminuye considerablemente si lo decides.',
  },
  {
    icon: '📈',
    q: '¿Cuándo puedo solicitar una ampliación?',
    categoria: 'ampliacion',
    a: 'A partir de tu TERCER PAGO PUNTUAL, tienes acceso automático a una ampliación de tu línea de crédito. No necesitas volver a pasar por toda la evaluación — tu buen desempeño con nosotros te abre la puerta a montos mayores rápidamente.',
  },
  {
    icon: '⚠️',
    q: '¿Qué pasa si no puedo pagar alguna cuota?',
    categoria: 'pagos',
    a: 'Lo importante es que lo hagas saber. Contáctanos al número que viene en tu contrato o vía WhatsApp. Según tu situación, podemos analizar opciones como refinanciamiento o reestructura. Lo que NUNCA queremos es que dejes de comunicarte — ese es el primer paso para resolver cualquier problema.',
  },
  {
    icon: '🛡️',
    q: '¿Es seguro el proceso biométrico?',
    categoria: 'documentacion',
    a: 'Totalmente. Utilizamos tecnología de encriptación estándar bancaria para proteger tus datos. Tu información se guarda de forma segura y solo se usa para validación de identidad conforme a regulaciones financieras mexicanas. No compartimos tus datos con terceros sin tu autorización.',
  },
  {
    icon: '📱',
    q: '¿Puedo solicitar la ampliación desde mi celular?',
    categoria: 'ampliacion',
    a: 'Sí. Cuando llegues a tu tercer pago puntual, recibirás una notificación automática con acceso a solicitar la ampliación. El proceso es igual de simple: accedes desde tu app o vía link seguro que te enviamos por WhatsApp.',
  },
  {
    icon: '🔄',
    q: '¿Puedo cambiar mi fecha de pago?',
    categoria: 'pagos',
    a: 'Puedes solicitar un cambio de fecha de pago contactando directamente a nuestro equipo. Evaluaremos tu solicitud y, según tu historial de pagos, podemos autorizar el cambio. Lo ideal es que mantengas una fecha consistente para facilitar tu administración mensual.',
  },
  {
    icon: '❓',
    q: '¿Qué pasa si pierdo mi CLABE o necesito cambiar de cuenta?',
    categoria: 'pagos',
    a: 'Si necesitas cambiar la cuenta de depósito o pago, contáctanos con tu folio de crédito. Validaremos tu identidad y actualizaremos la cuenta registrada. Es importante mantener esta información actualizada para evitar problemas con depósitos o cobros.',
  },
];
