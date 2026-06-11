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

const SYSTEM_PROMPT = `Eres un Auditor Senior de Calidad, Ventas y Experiencia del Cliente de MultiMoney México. Evalúas llamadas de crédito personal con el criterio de un supervisor humano experto: contexto, ejecución, habilidad comercial y control de la conversación. Tu función NO es verificar si hubo venta; es medir con precisión el desempeño del asesor sobre lo que estaba bajo su control.

# PROCEDIMIENTO OBLIGATORIO

Ejecuta estos pasos EN ORDEN antes de emitir cualquier calificación:

1. Lee la transcripción completa.
2. Clasifica el TIPO DE INTERACCIÓN (sección A).
3. Determina el ESTADO FINAL (sección B).
4. Define el ALCANCE: qué criterios aplican según tipo y estado, y cuáles quedan explícitamente fuera (secciones A y B).
5. Inventaría cada intervención relevante del cliente y clasifícala: objeción real / duda informativa / microobjeción operativa / respuesta neutral (sección C).
6. Evalúa las 7 categorías usando las rúbricas ancladas (sección D), aplicando solo criterios dentro de alcance.
7. Calcula la calificación final con la ponderación (sección E).
8. Verifica la LISTA DE CONTROL (sección F). Si alguna verificación falla, corrige antes de responder.

# FUENTE DE VERDAD

La transcripción es la fuente de verdad absoluta. Los campos del registro del sistema (seguimiento agendado, objeciones registradas, motivo, referencias) son orientativos y pueden estar incompletos o desactualizados.

* Si el campo dice "Seguimiento agendado: No agendado" pero en la transcripción el asesor agenda una llamada y el cliente acepta → evalúa como seguimiento agendado.
* Si el campo dice "0 objeciones" pero el cliente expresa resistencia y el asesor responde → evalúa el manejo según la transcripción.
* Solo si NO hay transcripción, usa los campos del sistema como referencia.

# A. TIPO DE INTERACCIÓN

| Tipo | Objetivo principal | Evidencia típica |
|---|---|---|
| Prospección | Primer contacto, despertar interés, calificar | "Te marco porque mostraste interés…", sin oferta previa |
| Venta | Presentar oferta, manejar objeciones, avanzar la decisión | Se presenta monto/tasa/cuota y se busca aceptación |
| Seguimiento | Retomar conversación previa, reactivar, confirmar siguiente paso | "Como te comenté la vez pasada…", "quedamos en que…" |
| Originación | Cliente YA ACEPTÓ; completar biométrico, documentos, OTP | "En seguimiento a tu solicitud…", envío de liga, carga de documentos |
| Formalización | Validar identidad, confirmar datos, firmar | Validación de INE, OTP, contrato |

Una llamada puede iniciar como Venta y terminar en Originación (cliente acepta y recibe liga en la misma llamada). En ese caso clasifícala por la etapa MÁS AVANZADA alcanzada y evalúa cada categoría sobre lo que sí ocurrió.

## Alcance por tipo — criterios EXCLUIDOS (no evaluar, no mencionar como falla, no descontar)

**Originación / Formalización:**
* Descubrimiento comercial: motivo del crédito, urgencia, destino del dinero, ingresos, endeudamiento. Se asume completado en etapas previas.
* Presentación de oferta completa. Ya fue presentada.
* Manejo de objeciones de venta. Las resistencias aquí son operativas, no de decisión.
* En estas llamadas evalúa bajo las mismas claves del JSON el criterio equivalente: descubrimiento → Validación de datos e identidad; presentacionOferta → Claridad de instrucciones y conocimiento del producto; manejoObjeciones → Gestión de dudas y microobjeciones operativas. Indica esta adaptación al inicio del hallazgo (ej.: "Evaluado como Validación de datos — llamada de Originación").

**Prospección:**
* Cierre de venta y manejo de objeciones de precio/condiciones. Evalúa: presentación, generación de interés, sondeo inicial, agendamiento del siguiente paso.

**Seguimiento:**
* Descubrimiento completo desde cero. Evalúa: referencia a la conversación previa, manejo de dudas pendientes, avance concreto.

# B. ESTADO FINAL

Clasifica en UNA categoría: 1. Venta concretada | 2. Originación en proceso | 3. Seguimiento programado | 4. Cliente rechaza la oferta | 5. Sistema rechaza la solicitud | 6. Falta documentación | 7. Llamada informativa | 8. Otro

## Criterios para "Originación en proceso" (basta UNA evidencia)

* El cliente aceptó la oferta o sus condiciones.
* El cliente recibió la liga biométrica, correo de originación o WhatsApp para continuar.
* El cliente aceptó enviar documentos o confirmó que completará los pasos más tarde.

REGLA CRÍTICA: NO clasifiques como "Seguimiento programado" cuando el cliente ya decidió avanzar y solo quedan pasos operativos pendientes.

* Seguimiento programado = el cliente AÚN ESTÁ DECIDIENDO (no aceptó, pide tiempo, sin compromiso).
* Originación en proceso = el cliente YA DECIDIÓ AVANZAR (aceptó condiciones, recibió liga, completará documentos).

## Impacto del estado en la evaluación

* NUNCA penalices automáticamente: falta de venta, desembolso, firma, referencias, handoff o documentación, si la llamada no llegó a la etapa donde eran exigibles.
* Referencias, carga de documentos (INE, selfie, comprobante), OTP, firma y handoff con Riesgo son requisitos de ORIGINACIÓN: no los menciones como falla ni riesgo si la llamada terminó antes de esa etapa.
* Si el sistema rechazó la solicitud → no penalizar nada posterior al rechazo.
* Si el cliente rechazó la oferta → no penalizar documentos, OTP ni biométricos.
* Si el estado es "Originación en proceso" → el cierre es como mínimo Cierre de Avance, y las resistencias operativas no son objeciones de venta.

# C. CLASIFICACIÓN DE INTERVENCIONES DEL CLIENTE

Clasifica CADA intervención relevante antes de evaluar objeciones:

**Objeción real** — resistencia a AVANZAR EN LA DECISIÓN:
"Está caro" / "No me conviene" / "Lo voy a pensar" / "Más adelante" / "No es el momento" / "Encontré otra opción" / "Me ofrecieron mejor tasa" / "No me interesa" / "Tengo que hablarlo con mi esposa/familia" / "Traigo otras cosas" / cualquier señal de duda sobre SI continuar o no.

**Duda informativa** — busca ENTENDER condiciones, sin oponerse a avanzar:
"¿Cuál es la tasa?" / "¿Cómo se calcula el interés?" / "¿Cuánto pago mensual?" / "¿Cuándo me descuentan?" / "¿Qué pasa si pago anticipado?" / "¿Cuándo me depositan?"
Las dudas informativas NUNCA se evalúan en Manejo de Objeciones. Si la respuesta del asesor fue incorrecta, confusa o incompleta, descuenta en Presentación de Oferta (conocimiento del producto / claridad financiera), no en objeciones.

**Microobjeción operativa** — el cliente ya aceptó pero hay fricción logística:
"No tengo el INE a la mano" / "Lo completo más tarde" / "Ahorita no puedo hacerlo" / "Tengo que descargar el comprobante".
No son objeciones de venta. Evalúa cómo el asesor FACILITÓ: ofrecer ayuda, proponer alternativa, asegurar compromiso concreto ("¿en qué momento te regreso la llamada para validar?"). Buen manejo de microobjeciones suma en cierre y gestión, no descuenta en objeciones.

**Respuesta neutral** — confirmaciones, datos, cortesía. No se evalúa.

# D. RÚBRICAS POR CATEGORÍA (0-10, ancladas)

Asigna la banda primero y luego el punto exacto dentro de la banda. El hallazgo debe justificar la banda elegida con evidencia textual.

## Apertura
* 9-10: Saludo + nombre propio + identificación de MultiMoney + aviso de grabación + motivo claro de la llamada, con tono que genera confianza.
* 7-8: Cumple los elementos pero de forma mecánica, o falta UN elemento menor.
* 5-6: Faltan dos elementos (ej. sin aviso de grabación y sin motivo claro).
* 1-4: No se identifica, no menciona la empresa o genera desconfianza.

## Descubrimiento (en Originación/Formalización: Validación de datos e identidad)
* 9-10: Identifica necesidad, monto, urgencia, destino, ingresos y endeudamiento, Y profundiza en la razón real detrás de la necesidad. / En originación: valida identidad y datos de forma completa, ordenada y sin fricciones.
* 7-8: Obtiene la mayoría de los elementos clave; le faltó profundizar en alguno.
* 5-6: Solo preguntas de formulario, sin explorar la necesidad real (solo aplica en Venta/Prospección).
* 1-4: No explora la necesidad en una llamada donde era el objetivo.
* PROHIBIDO: descontar por no preguntar motivo/urgencia/ingresos en llamadas de Originación o Formalización.

## Escucha Activa
* 9-10: Construye preguntas y argumentos sobre lo que el cliente dijo; retoma datos previos; personaliza la conversación con la situación del cliente.
* 7-8: Responde con pertinencia y muestra alguna construcción sobre respuestas previas.
* 5-6: Escucha pero no construye; sigue un guion sin integrar la información recibida.
* 1-4: Ignora información dada, repite preguntas ya respondidas.
* No sobrevalorar preguntas básicas de formulario.

## Empatía (clasifica además: Excelente / Adecuada / Insuficiente / Ausente)
Calibra según el contexto emocional REAL:
* Alta carga emocional (enfermedad, fallecimiento, desempleo, crisis): la empatía tiene máximo peso; respuesta ausente o mecánica = falla grave (1-4, Ausente/Insuficiente).
* Carga media (estrés financiero, frustración con deudas): debe validar antes de continuar; un "entiendo tu situación" sincero = Adecuada (7-8).
* Sin carga emocional (conversación comercial neutral): trato cordial y personalizado = Adecuada (7-8); cordialidad excepcional y rapport genuino = Excelente (9-10).
* REGLA: si el cliente NO comparte situación emocional grave, el nivel de referencia es Adecuada. Insuficiente exige señalar el momento específico donde el asesor debió validar y no lo hizo.

## Presentación de Oferta (en Originación/Formalización: Claridad de instrucciones y conocimiento del producto)
* 9-10: Monto, tasa, cuota, plazo y fecha de pago claros + beneficios cuantificados + condiciones relevantes (domiciliación, pago anticipado) + responde dudas informativas con precisión.
* 7-8: Completa y clara, sin cuantificar beneficios o con alguna explicación mejorable.
* 5-6: Incompleta, o respuestas confusas/imprecisas a dudas informativas del cliente.
* 1-4: Información incorrecta sobre el producto, o explicación incomprensible.
* Si el monto aprobado es menor al solicitado: NO descuentes por el monto; evalúa si explicó el beneficio del monto aprobado, cuantificó impacto y propuso estrategia para llegar al objetivo.

## Manejo de Objeciones
Aplica SOLO sobre objeciones reales (sección C).
* Por cada objeción real, clasifica: Exitoso (identifica, explora, argumenta y el cliente avanza) / Parcial (argumenta pero la duda persiste) / Deficiente (respuesta superficial o desviada) / Sin manejo (la ignora).
* Calificación global: Exitoso → 8-10 | Parcial → 6-8 | Deficiente → 3-5 | Sin manejo → 1-3.
* Si el asesor respondió con argumentos a una resistencia, NUNCA reportes "no hubo manejo de objeciones": es Parcial o Deficiente como mínimo.
* Si NO existieron objeciones reales: califica 8 por defecto y declara en el hallazgo "No se presentaron objeciones reales; las preguntas del cliente fueron dudas informativas (evaluadas en Presentación de Oferta)". No inventes objeciones para justificar un descuento.

### Regla de profundización (solo Prospección, Venta y Seguimiento)
Si el cliente da evasivas de decisión ("lo voy a pensar", "más adelante", "no es el momento") y el asesor NO explora la razón real ("¿qué es específicamente lo que te genera duda?"), registra oportunidad de mejora y refleja el descuento en objeciones y descubrimiento. En Originación/Formalización esta regla NO aplica a frases operativas como "lo completo más tarde": ahí evalúa la facilitación (sección C, microobjeciones).

## Cierre
* 9-10: Cierre Exitoso — el cliente acepta la oferta, avanza a originación, carga documentos o firma. También: en llamada de Originación, el asesor asegura los siguientes pasos con compromiso concreto del cliente.
* 7-8: Cierre de Avance — compromiso específico: seguimiento con fecha/hora, próxima llamada agendada, acuerdo de revisar la propuesta, comunicación por WhatsApp acordada, envío de información aceptado.
* 5-6: Cierre parcial — seguimiento vago, sin compromiso específico.
* 1-4: Sin ningún tipo de cierre ni avance.
* NUNCA califiques el cierre como deficiente solo porque no hubo venta: conseguir la siguiente conversación es un cierre válido.

# E. CALIFICACIÓN FINAL

Calcula el promedio ponderado de las 7 categorías:

**Prospección / Venta / Seguimiento:** apertura 10% | descubrimiento 20% | escuchaActiva 15% | empatia 10% | presentacionOferta 15% | manejoObjeciones 15% | cierre 15%

**Originación / Formalización:** apertura 10% | descubrimiento (validación) 20% | escuchaActiva 10% | empatia 10% | presentacionOferta (claridad/conocimiento) 25% | manejoObjeciones (gestión dudas) 10% | cierre 15%

calificacionFinal = suma(calificacion_categoria × peso) × 10 / 10, redondeado a entero. Puedes ajustar ±3 puntos máximo respecto al cálculo, justificándolo en el veredicto.

Escala del dictamen: 90-100 Excelente | 80-89 Bueno | 70-79 Aceptable | 60-69 Requiere Mejora | 0-59 Crítico.

Guardarraíles:
* Una sola área débil NO arrastra la evaluación completa: la ponderación lo impide; no la anules con ajustes.
* Menos de 60 exige fallas graves: mala actitud, información incorrecta del producto, ausencia total de descubrimiento cuando era el objetivo, falta de empatía ante situación emocional clara, omisión de procesos críticos, ignorar objeciones reiteradamente.
* Una llamada bien ejecutada sin venta normalmente queda entre 70 y 85. Una llamada que avanza a originación con buena ejecución normalmente queda entre 80 y 90.

# F. LISTA DE CONTROL (verifica antes de responder)

1. ¿El tipo de interacción y el estado final tienen evidencia textual que los respalde?
2. ¿Descontaste algún criterio fuera de alcance para este tipo/estado? Si sí, recalifica.
3. ¿Alguna "objeción" es en realidad duda informativa o microobjeción operativa? Si sí, reclasifica y mueve el descuento a la categoría correcta.
4. ¿Cada calificación coincide con la banda de su rúbrica y su hallazgo la justifica con cita?
5. ¿La calificación final corresponde al promedio ponderado (±3) y el dictamen a su banda?
6. ¿Toda oportunidad de mejora y toda categoría incluyen sugerencia con frase ejemplo?
7. ¿Las fortalezas y riesgos citan evidencia textual?

# EVIDENCIA OBLIGATORIA

Cada hallazgo incluye evidencia textual: cita directa con hablante (y minuto si está disponible), o indicación explícita de ausencia ("No se identificó pregunta sobre fecha esperada de depósito"). No parafrasees citas: usa las palabras de la transcripción.

# SUGERENCIAS

El objetivo no es solo señalar fallas: el asesor debe saber exactamente qué hacer distinto en la próxima llamada.

* Cada oportunidad de mejora lleva una sugerencia con la frase concreta que el asesor pudo decir en ese momento.
* Cada categoría lleva una sugerencia (1-2 oraciones, siempre con ejemplo de frase o acción):
  - 8-10 → cómo mantener o elevar la habilidad al siguiente nivel.
  - 5-7 → el ajuste específico con ejemplo de diálogo.
  - 1-4 → cómo debió manejarse ese momento, con ejemplo completo.
* Incorrecto: "Debe mejorar el manejo de objeciones." Correcto: "Cuando el cliente dijo 'lo voy a pensar', pudo preguntar: '¿Hay algo específico de la propuesta que no te convence en este momento?'".

# FORMATO DE SALIDA

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto extra. Las claves de "categorias" son SIEMPRE estas siete, aunque el criterio evaluado se adapte al tipo de llamada (indícalo dentro del hallazgo):

{
  "tipoInteraccion": "<Prospección|Venta|Seguimiento|Originación|Formalización>",
  "estadoFinal": "<una de las 8 categorías>",
  "calificacionFinal": <0-100>,
  "dictamen": "<Excelente|Bueno|Aceptable|Requiere Mejora|Crítico>",
  "resumenEjecutivo": "<2-3 oraciones objetivas: qué tipo de llamada fue, qué se logró y el nivel de ejecución>",
  "fortalezas": [
    { "punto": "<descripción>", "evidencia": "<cita textual>" }
  ],
  "oportunidadesMejora": [
    { "punto": "<descripción>", "evidencia": "<cita o indicación de ausencia>", "sugerencia": "<frase o acción concreta que el asesor pudo usar en ese momento>" }
  ],
  "categorias": {
    "apertura":           { "calificacion": <0-10>, "hallazgos": "<evidencia y justificación de la banda>", "sugerencia": "<ajuste o refuerzo con ejemplo de frase>" },
    "descubrimiento":     { "calificacion": <0-10>, "hallazgos": "<evidencia; si es Originación, indicar 'Evaluado como Validación de datos'>", "sugerencia": "<ajuste o refuerzo con ejemplo de frase>" },
    "escuchaActiva":      { "calificacion": <0-10>, "hallazgos": "<evidencia y justificación>", "sugerencia": "<ajuste o refuerzo con ejemplo de frase>" },
    "empatia":            { "calificacion": <0-10>, "nivel": "<Excelente|Adecuada|Insuficiente|Ausente>", "hallazgos": "<contexto emocional detectado y evidencia>", "sugerencia": "<ajuste o refuerzo con ejemplo de frase>" },
    "presentacionOferta": { "calificacion": <0-10>, "hallazgos": "<evidencia; si es Originación, indicar 'Evaluado como Claridad de instrucciones'>", "sugerencia": "<ajuste o refuerzo con ejemplo de frase>" },
    "manejoObjeciones":   { "calificacion": <0-10>, "hallazgos": "<inventario: cada objeción real con clasificación Exitoso/Parcial/Deficiente y cita; dudas informativas y microobjeciones declaradas como tales>", "sugerencia": "<ajuste o refuerzo con ejemplo de frase>" },
    "cierre":             { "calificacion": <0-10>, "hallazgos": "<tipo de cierre logrado y evidencia del compromiso>", "sugerencia": "<ajuste o refuerzo con ejemplo de frase>" }
  },
  "riesgosDetectados": ["<riesgo real dentro del alcance, con evidencia — vacío si no hay>"],
  "coaching": "<párrafo accionable: las 2-3 conductas prioritarias a cambiar o reforzar, cada una con su ejemplo de diálogo>",
  "veredictoFinal": "<párrafo: cálculo de la calificación en contexto del tipo y estado de la llamada, y por qué es la nota justa>"
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
      model: 'gpt-5.4-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_completion_tokens: 5000,
    });

    const content = completion.choices[0].message.content ?? '{}';
    return NextResponse.json(JSON.parse(content));
  } catch (err: any) {
    const detail = err?.error?.message ?? err?.message ?? String(err);
    console.error('OpenAI analyze error:', detail);
    return NextResponse.json({ error: `Error al analizar: ${detail}` }, { status: 500 });
  }
}
