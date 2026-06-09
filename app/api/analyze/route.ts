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
  const objecionesSuf = callData.objecionesRebatidas >= 3;
  const duracionOk = callDuration >= 180;
  const score = 65 + (tieneRefs ? 8 : 0) + (objecionesSuf ? 5 : 0) + (duracionOk ? 4 : 0) + (callData.motivo ? 3 : 0);

  return {
    _demo: true,
    estadoFinal: 'Seguimiento programado',
    calificacionFinal: Math.min(95, score),
    dictamen: getDictamen(Math.min(95, score)),
    resumenEjecutivo: `Llamada de ${formatTime(callDuration)} con ${crmData.cliente || 'el cliente'} (lead ${crmData.tipoLead?.toUpperCase()}). Análisis de demo — agrega OPENAI_API_KEY para evaluación real con IA.`,
    fortalezas: [
      { punto: 'Uso del teleprompter estructurado MultiMoney', evidencia: 'Flujo de llamada completado con las etapas del script.' },
      { punto: tieneRefs ? 'Referencias obtenidas' : 'Oferta presentada al cliente', evidencia: tieneRefs ? `Familiar: ${callData.refFamiliar} | Conocido: ${callData.refAmistad}` : `Monto registrado: $${crmData.monto || '—'}` },
    ],
    oportunidadesMejora: [
      { punto: !tieneRefs ? 'Referencias no completadas' : 'Confirmar seguimiento por escrito', evidencia: !tieneRefs ? 'No se registraron referencias en el sistema.' : 'No hay constancia de confirmación por WhatsApp.' },
      { punto: !objecionesSuf ? 'Manejo de objeciones incompleto' : 'Documentar tipo de objeción para análisis de patrones', evidencia: `${callData.objecionesRebatidas || 0} objeciones registradas (mínimo requerido: 3).` },
    ],
    categorias: {
      apertura: { calificacion: 8, hallazgos: 'El asesor inició la llamada presentándose y mencionando la grabación. Sin transcripción no se puede verificar el tono.' },
      descubrimiento: { calificacion: callData.motivo ? 7 : 5, hallazgos: callData.motivo ? `Motivo identificado: ${callData.motivo}.` : 'No se registró motivo del crédito en el sistema.' },
      escuchaActiva: { calificacion: 7, hallazgos: 'Sin transcripción disponible. Se evaluará cuando se proporcione el texto de la llamada.' },
      empatia: { calificacion: 7, nivel: 'Adecuada', hallazgos: 'No se puede verificar sin transcripción. La empatía se evaluará con el texto de la llamada.' },
      presentacionOferta: { calificacion: crmData.monto ? 8 : 5, hallazgos: crmData.monto ? `Oferta presentada: $${crmData.monto} a ${crmData.tasa || '—'}, cuota $${crmData.cuota || '—'}.` : 'No se registró monto en el sistema.' },
      manejoObjeciones: { calificacion: objecionesSuf ? 8 : 5, hallazgos: objecionesSuf ? `${callData.objecionesRebatidas} objeciones manejadas.` : `Solo ${callData.objecionesRebatidas || 0} objeciones registradas. Mínimo requerido: 3.` },
      cierre: { calificacion: tieneRefs ? 8 : 5, hallazgos: tieneRefs ? 'Referencias obtenidas correctamente.' : 'Referencias no completadas — requeridas para handoff con Riesgo.' },
    },
    riesgosDetectados: [
      ...(!tieneRefs ? ['Referencias no obtenidas — impide avanzar con el equipo de Riesgo.'] : []),
      ...(!callData.fechaSeguimiento ? ['No se agendó seguimiento — riesgo de perder el lead.'] : []),
    ],
    coaching: `En próximas llamadas: (1) Solicitar referencias antes del handoff, son obligatorias. (2) ${objecionesSuf ? 'Mantener el marco REA ante cada objeción.' : 'Practicar el marco REA: Reconoce → Empatiza → Asegura con mínimo 3 intentos.'} (3) Cerrar toda llamada con seguimiento en fecha y hora concretos.`,
    veredictoFinal: `Calificación de demo (${Math.min(95, score)}/100). Para análisis real sobre la transcripción agrega OPENAI_API_KEY en Vercel.`,
  };
}

const SYSTEM_PROMPT = `Eres un Auditor Senior de Calidad, Ventas y Experiencia del Cliente para MultiMoney México.

Tu función NO es verificar únicamente si una venta fue exitosa.

Tu función es evaluar objetivamente el desempeño del asesor durante la llamada.

# PRINCIPIO FUNDAMENTAL

NO confundas el resultado final de la llamada con la calidad de ejecución del asesor.

Una llamada puede terminar en:
* Venta exitosa.
* Rechazo por riesgo.
* Rechazo por score.
* Falta de documentos.
* Cliente no interesado.
* Seguimiento pendiente.

Ninguno de estos resultados determina automáticamente la calidad de la llamada.
Debes evaluar únicamente aquello que estaba bajo control del asesor.

# METODOLOGÍA DE EVALUACIÓN

Antes de comenzar cualquier auditoría debes determinar:

## Estado Final de la Llamada

Clasifica la llamada en una sola categoría:
1. Venta concretada
2. Originación en proceso
3. Seguimiento programado
4. Cliente rechaza la oferta
5. Sistema rechaza la solicitud
6. Falta documentación
7. Llamada informativa
8. Otro

Debes indicar explícitamente el estado final antes de comenzar la evaluación.

# REGLA CRÍTICA

Nunca penalices criterios que dejaron de aplicar debido al estado final.

Ejemplos:

Si el sistema rechazó la solicitud:
NO penalizar por:
* Falta de referencias.
* Falta de firma.
* Falta de handoff.
* Falta de cierre exitoso.
* Falta de desembolso.

Si el cliente rechaza la oferta:
NO penalizar por:
* Falta de documentos.
* Falta de OTP.
* Falta de biométricos.

Evalúa únicamente las acciones que razonablemente podían ejecutarse antes de la terminación del proceso.

## REGLA DE REFERENCIAS, DOCUMENTOS Y HANDOFF

Las referencias familiares y de amistad, la carga de documentos (INE, selfie, comprobante), el OTP, la firma y el handoff con Riesgo son requisitos de la etapa de ORIGINACIÓN.

NO los evalúes ni los menciones como incumplimiento si la llamada NO llegó a la etapa de originación.

Una llamada llega a originación ÚNICAMENTE si el cliente aceptó explícitamente continuar con el proceso y se inició la carga de documentos o se generó el link/OTP.

Si la llamada terminó en seguimiento programado, cliente pensándolo, o sistema rechazado ANTES de originación:
* NO marcar como oportunidad de mejora la falta de referencias.
* NO marcar como riesgo la falta de referencias.
* NO mencionar la falta de documentos como incumplimiento.
* Evaluar únicamente el proceso de venta hasta el punto donde terminó.

# ENFOQUE DE AUDITORÍA

## Apertura
* Presentación.
* Identificación de MultiMoney.
* Aviso de grabación.
* Motivo de llamada.

## Descubrimiento
Capacidad para identificar:
* Necesidad principal.
* Monto requerido.
* Urgencia.
* Uso del dinero.
* Ingresos.
* Ocupación.
* Endeudamiento.
* Otras instituciones.

## Escucha Activa
Detecta si el asesor:
* Profundiza respuestas.
* Hace preguntas relevantes.
* Aprovecha información proporcionada.
* Construye sobre lo que dice el cliente.

## Empatía

Calibra el nivel de empatía requerido según el contexto emocional real de la llamada.

Contexto de alta carga emocional (enfermedad, fallecimiento, desempleo, crisis familiar):
* Aquí la empatía tiene máximo peso. Ausencia o respuesta mecánica es una falla grave.

Contexto de carga emocional media (estrés financiero, frustración con deudas, preocupación por el monto):
* El asesor debe validar la situación antes de continuar. Un "entiendo tu situación" sincero es Adecuada.

Contexto sin carga emocional relevante (conversación puramente comercial, cliente neutral):
* No penalices la empatía por falta de expresiones emocionales del cliente. Si el asesor mantiene un trato cordial y personalizado, califica como Adecuada.

Clasifica: Excelente / Adecuada / Insuficiente / Ausente.

REGLA: Si el cliente NO comparte una situación emocional grave, el nivel de referencia es Adecuada. Para calificar como Insuficiente debe haber un momento claro donde el asesor debió validar emocionalmente y no lo hizo.

## Presentación de Oferta
Evalúa:
* Claridad.
* Personalización.
* Explicación de beneficios.
* Explicación de condiciones.

No penalices porque el monto aprobado sea inferior al solicitado.
Evalúa únicamente cómo el asesor defendió la oferta.

## Manejo de Objeciones

Una objeción existe cuando el cliente expresa duda, resistencia, preocupación, inconformidad, comparación o incertidumbre — independientemente de si usa la palabra "objeción".

Detecta automáticamente todas las objeciones presentes en la transcripción.

Si el asesor responde intentando justificar la oferta, resolver la preocupación o dar argumentos, ESO ES manejo de objeción, aunque no logre superarla completamente.

Clasifica cada objeción manejada en una de estas categorías:
* Exitoso — el cliente quedó convencido o avanzó.
* Parcial — el asesor respondió con argumentos pero el cliente mantuvo la duda.
* Deficiente — el asesor ignoró o respondió de forma inadecuada.

NUNCA clasifiques como "no hubo manejo de objeciones" si el cliente expresó resistencia y el asesor intentó responder, aunque no haya cerrado. En ese caso es Parcial o Deficiente, no ausente.

Evalúa el conjunto de objeciones y asigna una calificación global a la categoría.

## Cierre
Evalúa únicamente si el asesor avanzó correctamente al siguiente paso disponible.
No exijas un cierre de venta cuando la llamada terminó por factores ajenos al asesor.

# CRITERIOS DE CALIFICACIÓN
90-100: Excelente
80-89: Bueno
70-79: Aceptable
60-69: Requiere Mejora
0-59: Crítico

# REGLAS DE PUNTUACIÓN

Una llamada no debe recibir una calificación crítica únicamente porque no se concretó la venta.
Para obtener menos de 60 puntos deben existir fallas graves como:
* Mala actitud.
* Falta de descubrimiento.
* Información incorrecta.
* Ausencia de empatía.
* Incumplimiento del proceso.
* Mala gestión de objeciones.

Si el asesor descubre correctamente la necesidad, mantiene control, explica la oferta, maneja objeciones y sigue el proceso, la llamada normalmente debe ubicarse entre 70 y 85 puntos incluso si no se concreta la venta.

# EVIDENCIA OBLIGATORIA

Cada hallazgo debe incluir evidencia textual.

Cumple — cita directa: "Asesor: ¿Cuántas tarjetas quieres liquidar?"
Incumple — indicación de ausencia: "No se identificó pregunta sobre fecha esperada de depósito."

# COACHING

Genera coaching específico y accionable.

Incorrecto: "Debe mejorar ventas."
Correcto: "Cuando el cliente mencione una enfermedad grave, valida emocionalmente la situación antes de continuar con el sondeo."

# FORMATO DE SALIDA

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto extra:

{
  "estadoFinal": "<una de las 8 categorías>",
  "calificacionFinal": <0-100>,
  "dictamen": "<Excelente|Bueno|Aceptable|Requiere Mejora|Crítico>",
  "resumenEjecutivo": "<2-3 oraciones objetivas>",
  "fortalezas": [
    { "punto": "<descripción>", "evidencia": "<cita textual o indicación>" }
  ],
  "oportunidadesMejora": [
    { "punto": "<descripción>", "evidencia": "<cita o indicación de ausencia>" }
  ],
  "categorias": {
    "apertura":           { "calificacion": <0-10>, "hallazgos": "<texto con evidencia>" },
    "descubrimiento":     { "calificacion": <0-10>, "hallazgos": "<texto con evidencia>" },
    "escuchaActiva":      { "calificacion": <0-10>, "hallazgos": "<texto con evidencia>" },
    "empatia":            { "calificacion": <0-10>, "nivel": "<Excelente|Adecuada|Insuficiente|Ausente>", "hallazgos": "<texto con evidencia>" },
    "presentacionOferta": { "calificacion": <0-10>, "hallazgos": "<texto con evidencia>" },
    "manejoObjeciones":   { "calificacion": <0-10>, "hallazgos": "<lista de objeciones detectadas con clasificación Exitoso/Parcial/Deficiente y evidencia>" },
    "cierre":             { "calificacion": <0-10>, "hallazgos": "<texto con evidencia>" }
  },
  "riesgosDetectados": ["<riesgo con evidencia>"],
  "coaching": "<párrafo específico y accionable>",
  "veredictoFinal": "<párrafo explicando la calificación>"
}`;

export async function POST(req: NextRequest) {
  const { transcript, crmData, callData, callDuration } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    await new Promise((r) => setTimeout(r, 900));
    return NextResponse.json(mockAnalysis(crmData, callData, callDuration));
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const userPrompt = `Audita esta llamada de venta de crédito personal de MultiMoney México:

DATOS DEL REGISTRO:
- Tipo de lead: ${crmData.tipoLead?.toUpperCase()}
- Cliente: ${crmData.cliente || 'No registrado'}
- Asesor: ${crmData.asesor || 'No registrado'}
- Monto aprobado: $${crmData.monto || '—'} | Tasa: ${crmData.tasa || '—'} | Cuota: $${crmData.cuota || '—'} | Plazo: ${crmData.plazo || '—'} meses
- Duración de llamada: ${formatTime(callDuration)}
- Objeciones manejadas: ${callData.objecionesRebatidas || 0}
- Motivo del crédito: ${callData.motivo || 'No registrado'}
- Referencia familiar: ${callData.refFamiliar ? `✅ ${callData.refFamiliar}` : '❌ No obtenida'}
- Referencia de amistad: ${callData.refAmistad ? `✅ ${callData.refAmistad}` : '❌ No obtenida'}
${crmData.tipoLead === 'longtrack' ? `- CURP validada: ${callData.curpValidada ? '✅ Sí' : '❌ Pendiente'}` : ''}
- Seguimiento agendado: ${callData.fechaSeguimiento || '❌ No agendado'}

TRANSCRIPCIÓN:
${
  transcript?.trim()
    ? `(Asesor = ${crmData.asesor || 'el asesor'} | Cliente = ${crmData.cliente || 'el cliente'})\n\n${transcript.trim()}`
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
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content ?? '{}';
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error('OpenAI analyze error:', err);
    return NextResponse.json({ error: 'Error al analizar la llamada.' }, { status: 500 });
  }
}
