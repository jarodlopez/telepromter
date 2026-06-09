import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function getDictamen(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 80) return 'Bueno';
  if (score >= 70) return 'Aceptable';
  if (score >= 60) return 'Requiere Mejora';
  return 'Crítico';
}

function mockAnalysis(crmData: any, callData: any, callDuration: number) {
  const tieneRefs = !!(callData.refFamiliar && callData.refAmistad);
  const objecionesSuficientes = callData.objecionesRebatidas >= 3;
  const duracionOk = callDuration >= 180;
  const tieneMotivoCredito = !!callData.motivo;

  const apertura = tieneMotivoCredito ? 5 : 3;
  const descubrimiento = tieneMotivoCredito ? 5 : 3;
  const pitch = crmData.monto ? 15 : 10;
  const objeciones = objecionesSuficientes ? 22 : 14;
  const cierre = tieneRefs ? 17 : 10;
  const despedida = duracionOk ? 14 : 10;
  const calificacionFinal = apertura + descubrimiento + pitch + objeciones + cierre + despedida;

  return {
    _demo: true,
    calificacionFinal,
    dictamen: getDictamen(calificacionFinal),
    resumenEjecutivo: `Llamada de ${formatTime(callDuration)} con ${crmData.cliente || 'el cliente'} (lead ${crmData.tipoLead?.toUpperCase()}). ${tieneRefs ? 'Se obtuvieron las 2 referencias requeridas.' : 'Las referencias obligatorias no fueron completadas.'} Análisis de demo — agrega OPENAI_API_KEY para evaluación real con IA.`,
    categorias: {
      apertura: {
        calificacion: apertura,
        maximo: 6,
        hallazgos: tieneMotivoCredito
          ? 'El asesor identificó el motivo del crédito. Verificar que se mencionó la grabación de la llamada y que el abordaje fue directo.'
          : 'No se registró motivo del crédito. Revisar si el asesor preguntó "¿Qué te llevó a solicitar este crédito?" según el script.',
      },
      descubrimiento: {
        calificacion: descubrimiento,
        maximo: 6,
        hallazgos: tieneMotivoCredito
          ? 'Se indagó el propósito del crédito. Confirmar si se preguntó la fecha esperada de depósito y la situación financiera actual.'
          : 'Sondeo incompleto. Faltó preguntar: fecha de depósito esperada, ocupación e ingresos comprobables.',
      },
      pitchComercial: {
        calificacion: pitch,
        maximo: 21,
        hallazgos: crmData.monto
          ? `Oferta presentada: $${crmData.monto} a ${crmData.tasa || '—'}. Verificar si se explicaron todos los beneficios: depósito en 2h, 60 meses, ampliación a partir del 3er pago.`
          : 'No se registró monto ni condiciones de la oferta. El pitch debe incluir monto, tasa y beneficios diferenciales.',
      },
      manejoObjeciones: {
        calificacion: objeciones,
        maximo: 28,
        hallazgos: objecionesSuficientes
          ? `${callData.objecionesRebatidas} objeciones manejadas correctamente. Confirmar que se usó el marco REA (Reconoce/Empatiza/Asegura) en cada una.`
          : `Solo ${callData.objecionesRebatidas || 0} objeciones registradas. El playbook exige un mínimo de 3 intentos de cierre ante objeciones.`,
      },
      cierre: {
        calificacion: cierre,
        maximo: 21,
        hallazgos: tieneRefs
          ? `Referencias obtenidas: familiar (${callData.refFamiliar}) y conocido (${callData.refAmistad}). Verificar recapitulación de monto, cuota y fecha de primer pago.`
          : 'Referencias no completadas. Son OBLIGATORIAS para el hand-off con Riesgos. Sin ellas no se puede proceder al siguiente paso.',
      },
      despedida: {
        calificacion: despedida,
        maximo: 18,
        hallazgos: duracionOk
          ? callData.fechaSeguimiento
            ? `Seguimiento agendado para ${callData.fechaSeguimiento}. Buena gestión del cierre de llamada.`
            : 'Duración adecuada pero no se agendó seguimiento. Toda llamada debe cerrar con fecha concreta.'
          : 'Llamada breve — riesgo de no haber completado todas las etapas del script. Agendar seguimiento con fecha y hora.',
      },
    },
    fortalezas: [
      crmData.monto ? `Oferta concreta presentada ($${crmData.monto})` : 'Uso del teleprompter estructurado',
      tieneRefs ? 'Se obtuvieron las 2 referencias obligatorias' : 'Flujo de llamada completado',
      objecionesSuficientes ? `Manejo de ${callData.objecionesRebatidas} objeciones registradas` : 'Llamada completada con el script de MultiMoney',
    ],
    oportunidadesMejora: [
      !tieneRefs ? 'URGENTE: Completar referencias familiar y de amistad — son requisito de Riesgos' : 'Solicitar referencias al inicio del cierre, no al final',
      !objecionesSuficientes ? 'Aplicar el marco REA completo en al menos 3 objeciones por llamada' : 'Documentar el tipo de objeción manejada para análisis de patrones',
      !callData.fechaSeguimiento ? 'Agendar seguimiento concreto — sin fecha no hay pipeline' : 'Confirmar seguimiento por WhatsApp inmediatamente al colgar',
    ],
    riesgosDetectados: [
      ...(!tieneRefs ? ['Referencias no obtenidas — impide avanzar en el proceso de Riesgos'] : []),
      ...(!callData.fechaSeguimiento ? ['Sin seguimiento agendado — riesgo de perder el lead'] : []),
      ...(callDuration < 120 ? ['Llamada muy corta — posible incumplimiento del script completo'] : []),
    ],
    coachingRecomendado: `En la próxima llamada, enfocarse en: (1) Completar las referencias al momento del cierre, antes del hand-off. (2) ${objecionesSuficientes ? 'Mantener el marco REA en cada objeción' : 'Practicar el marco REA: Reconoce → Empatiza → Asegura, con al menos 3 intentos'}. (3) Terminar SIEMPRE con una fecha de seguimiento confirmada y registrada en HubSpot.`,
    veredictoFinal: `Calificación de demo (${calificacionFinal}/100) basada en datos del sistema. ${!tieneRefs ? 'El factor más crítico: falta de referencias.' : ''} ${!objecionesSuficientes ? 'El manejo de objeciones necesita refuerzo.' : ''} Agrega OPENAI_API_KEY para un análisis real sobre la transcripción de la llamada.`,
  };
}

const SYSTEM_PROMPT = `Eres COACH-MM, evaluador experto de calidad de llamadas de ventas para MultiMoney México — fintech de créditos personales.

## SCRIPTS DE REFERENCIA POR ETAPA

**UPPER (solicitud nueva):** Saludo → presentación + mención de grabación + motivo → preguntas de perfilamiento (motivación, fecha depósito, ingresos, ocupación) → oferta con monto y tasa → cierre pidiendo identificación.

**GANCHO (lead que no avanzó):** Rescata la objeción anterior, menciona mejora de oferta → sondeo de situación actual → oferta superior → cierre.

**EXPIRADO (no completó el proceso):** Reactivar sin empezar de cero → sondeo de por qué no avanzó → nueva oferta → confirmar teléfono/correo para OTP.

**LONG TRACK (biométrico completado):** Validar CURP → confirmar datos personales → expectativas de pago y ampliación → cierre con recapitulación → 2 referencias → hand-off a Riesgo.

## RÚBRICA DE EVALUACIÓN (Total: 100 puntos)

### APERTURA — máx 6 pts
1. Se presentó con nombre + apellido y mencionó MultiMoney con cordialidad (tono, vocabulario) → 2 pts
2. Indicó motivo de la llamada según el tipo de lead → 2 pts
3. Abordó al cliente directamente, sin solicitar permiso → 2 pts

### DESCUBRIMIENTO — máx 6 pts
4. Preguntó qué motivó al cliente a solicitar el crédito → 2 pts
5. Preguntó para cuándo necesita disponer del crédito → 2 pts
6. Indagó ocupación e ingresos comprobables → 2 pts

### PITCH COMERCIAL — máx 21 pts
7. Explicó condiciones del préstamo (monto, tasa, plazo) → 3 pts
8. Mencionó propuesta de valor: depósito en máx 2h, 100% en línea → 3 pts
9. Realizó desglose de beneficios / promoción de temporada → 3 pts
10. Resaltó otros beneficios: ampliación a partir del 3er pago, sin penalización por capital → 3 pts
11. Usó testimonios personales o casos de éxito → 3 pts
12. Estableció expectativas claras sobre ampliación de crédito → 3 pts
13. Realizó pregunta de cierre (respuesta esperada: Sí o aceptación explícita) → 3 pts

### MANEJO DE OBJECIONES — máx 28 pts
(Incluye educación del cliente)
14. Explicó proceso a seguir: biométricos, CLABE, documentos → 4 pts
15. Reafirmó el monto aprobado → 4 pts
16. Explicó interés y cuotas según plazo → 4 pts
17. Explicó beneficio de représtamo / ampliación futura → 4 pts
18. Confirmó documentación válida: INE ambos lados, selfie sin accesorios, comprobante domicilio (CFE/Telmex/Megacable/etc.) → 4 pts
19. Despejó las dudas que planteó el cliente → 4 pts
20. Ejemplificó cómo utilizar la línea de crédito → 4 pts

### CIERRE — máx 21 pts
21. Resumen detallado de beneficios antes del cierre → 3 pts
22. Indicó vigencia de la oferta → 3 pts
23. Debatió objeciones con el marco REA (Reconoce/Empatiza/Asegura) mínimo 3 intentos → 3 pts
24. Indicó formas de pago disponibles → 3 pts
25. Informó período de depósito (máximo 2 horas) → 3 pts
26. Aplicó técnica de cierre efectiva → 3 pts
27. Identificó y aprovechó oportunidad de cierre → 3 pts

### DESPEDIDA — máx 18 pts
28. Vocalizó bien: tono, vocabulario, claridad durante toda la llamada → 3 pts
29. Se despidió recordando su propio nombre → 3 pts
30. Apego al script oficial de MultiMoney → 3 pts
31. Agendó seguimiento con fecha y hora concreta → 3 pts
32. Tipificó / registró correctamente en el sistema → 3 pts
33. Generó interés efectivo — el cliente termina con una expectativa clara → 3 pts

## DICTAMEN
- 90-100 → Excelente
- 80-89 → Bueno
- 70-79 → Aceptable
- 60-69 → Requiere Mejora
- 0-59 → Crítico

## RIESGOS DETECTADOS — menciona si el asesor:
- No informó que la llamada sería grabada
- Prometió algo fuera del script oficial (tasas, montos, plazos no estándar)
- No aplicó el marco REA ante objeciones
- No pidió las 2 referencias al cerrar (familiar + conocido)
- No validó CURP en Long Track
- Usó vocabulario inapropiado o tono poco profesional
- No agendó seguimiento

## INSTRUCCIONES
Responde ÚNICAMENTE con JSON válido, sin markdown ni texto extra:
{
  "calificacionFinal": <0-100>,
  "dictamen": "<Excelente|Bueno|Aceptable|Requiere Mejora|Crítico>",
  "resumenEjecutivo": "<2-3 oraciones sobre el desempeño general>",
  "categorias": {
    "apertura":         { "calificacion": <0-6>,  "maximo": 6,  "hallazgos": "<texto concreto>" },
    "descubrimiento":   { "calificacion": <0-6>,  "maximo": 6,  "hallazgos": "<texto concreto>" },
    "pitchComercial":   { "calificacion": <0-21>, "maximo": 21, "hallazgos": "<texto concreto>" },
    "manejoObjeciones": { "calificacion": <0-28>, "maximo": 28, "hallazgos": "<texto concreto>" },
    "cierre":           { "calificacion": <0-21>, "maximo": 21, "hallazgos": "<texto concreto>" },
    "despedida":        { "calificacion": <0-18>, "maximo": 18, "hallazgos": "<texto concreto>" }
  },
  "fortalezas": ["<fortaleza 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "oportunidadesMejora": ["<mejora más urgente>", "<mejora 2>", "<mejora 3>"],
  "riesgosDetectados": ["<riesgo o incumplimiento detectado>"],
  "coachingRecomendado": "<párrafo específico sobre qué practicar en próximas llamadas>",
  "veredictoFinal": "<párrafo explicando por qué obtuvo esa calificación>"
}`;

export async function POST(req: NextRequest) {
  const { transcript, crmData, callData, callDuration } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    await new Promise((r) => setTimeout(r, 900));
    return NextResponse.json(mockAnalysis(crmData, callData, callDuration));
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const userPrompt = `Evalúa esta llamada de venta de crédito personal de MultiMoney:

DATOS DEL REGISTRO:
- Tipo de lead: ${crmData.tipoLead?.toUpperCase()}
- Cliente: ${crmData.cliente || 'No registrado'}
- Asesor: ${crmData.asesor || 'No registrado'}
- Monto: $${crmData.monto || '—'} | Tasa: ${crmData.tasa || '—'} | Cuota: $${crmData.cuota || '—'} | Plazo: ${crmData.plazo || '—'} meses
- Duración de llamada: ${formatTime(callDuration)}
- Objeciones manejadas: ${callData.objecionesRebatidas || 0} (mínimo requerido: 3)
- Motivo del crédito: ${callData.motivo || 'No registrado'}
- Referencia familiar: ${callData.refFamiliar ? `✅ ${callData.refFamiliar}` : '❌ No obtenida'}
- Referencia de amistad: ${callData.refAmistad ? `✅ ${callData.refAmistad}` : '❌ No obtenida'}
${crmData.tipoLead === 'longtrack' ? `- CURP validada: ${callData.curpValidada ? '✅ Sí' : '❌ Pendiente'}` : ''}
- Seguimiento agendado: ${callData.fechaSeguimiento || '❌ No agendado'}

TRANSCRIPCIÓN DE LA LLAMADA:
${
  transcript?.trim()
    ? `(Asesor = ${crmData.asesor || 'el asesor de MultiMoney'} | Cliente = ${crmData.cliente || 'el cliente'})\n\n${transcript.trim()}`
    : '(Sin transcripción — evalúa únicamente con los datos del registro)'
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content ?? '{}';
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error('OpenAI analyze error:', err);
    return NextResponse.json({ error: 'Error al analizar la llamada.' }, { status: 500 });
  }
}
