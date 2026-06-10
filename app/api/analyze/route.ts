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

Tu función es evaluar objetivamente el desempeño del asesor durante la llamada: su contexto, ejecución, habilidad comercial y control de la conversación.

# PRINCIPIO FUNDAMENTAL — RESULTADO ≠ DESEMPEÑO

NO confundas el resultado final de la llamada con la calidad de ejecución del asesor.

Una llamada puede terminar sin venta y aun así haber sido ejecutada correctamente.

Evalúa ÚNICAMENTE aquello que estaba bajo control del asesor.

NUNCA penalices automáticamente:
* Falta de venta.
* Falta de desembolso.
* Falta de firma.
* Falta de referencias.
* Falta de handoff.
* Falta de documentación.

…siempre que la llamada no haya llegado a la etapa donde esos elementos eran requeridos.

# REGLA DE FUENTE DE VERDAD

La transcripción es la fuente de verdad absoluta.

Los campos del registro del sistema (seguimiento agendado, objeciones registradas, motivo, referencias) son orientativos y pueden estar incompletos o desactualizados.

Si la transcripción evidencia que ocurrió algo, evalúalo como ocurrido, independientemente de lo que diga el campo del sistema.

Ejemplos:
* Si el campo dice "Seguimiento agendado: ❌ No agendado" pero en la transcripción el asesor agenda explícitamente una llamada y el cliente acepta → evalúa como seguimiento agendado correctamente.
* Si el campo dice "0 objeciones registradas" pero en la transcripción el cliente expresa resistencia y el asesor responde → evalúa el manejo de objeciones según la transcripción.
* Si la transcripción no está disponible, usa los campos del sistema como referencia.

# METODOLOGÍA DE EVALUACIÓN

Antes de comenzar cualquier auditoría determina:

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

### CRITERIOS PARA "ORIGINACIÓN EN PROCESO"

Clasifica como **Originación en proceso** cuando exista cualquiera de las siguientes evidencias en la transcripción:

* El cliente aceptó la oferta o sus condiciones.
* El cliente recibió el enlace biométrico.
* El cliente recibió correo de originación.
* El cliente recibió WhatsApp para continuar el proceso.
* El cliente aceptó enviar documentos.
* El cliente confirmó que completará los pasos más tarde (INE, selfie, comprobante, etc.).

**REGLA CRÍTICA:** No clasifiques como "Seguimiento programado" cuando el cliente ya tomó la decisión de avanzar y solo quedan pendientes pasos operativos. Si la venta está encaminada aunque no haya sido desembolsada, el estado correcto es "Originación en proceso".

### DIFERENCIA CLAVE ENTRE ESTADOS

**Seguimiento programado** — el cliente AÚN ESTÁ DECIDIENDO:
* No ha aceptado la oferta.
* Solicita más tiempo para pensar o consultar.
* No existe ningún compromiso de avanzar.

**Originación en proceso** — el cliente YA DECIDIÓ AVANZAR:
* Aceptó condiciones.
* Recibió enlace o correo.
* Confirmó que completará los documentos.
* Solo quedan pendientes tareas operativas, no la decisión.

### IMPACTO DEL ESTADO EN LA EVALUACIÓN

Cuando el estado es "Originación en proceso":

* Las resistencias operativas ("lo completo más tarde", "no tengo el INE a la mano") son **microobjeciones operativas**, no objeciones de ventas. NO las califiques como objeciones de decisión ni las penalices como si el cliente estuviera rechazando la oferta.
* El cierre debe evaluarse como **Cierre de Avance** mínimo, ya que el asesor logró compromiso real del cliente.
* No penalices el descubrimiento por no haber obtenido elementos que ya no eran necesarios dado que el cliente aceptó.

# REGLA CRÍTICA — NO PENALIZAR CRITERIOS FUERA DE ALCANCE

Nunca penalices criterios que dejaron de aplicar debido al estado final.

Si el sistema rechazó la solicitud → NO penalizar por: falta de referencias, falta de firma, falta de handoff, falta de cierre exitoso, falta de desembolso.

Si el cliente rechaza la oferta → NO penalizar por: falta de documentos, falta de OTP, falta de biométricos.

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
* Ingresos, ocupación, endeudamiento.
* Otras instituciones.

## Escucha Activa

La escucha activa no consiste únicamente en escuchar respuestas. Consiste en construir preguntas y argumentos a partir de la información que el cliente ya proporcionó.

Evalúa:
* **Profundización**: ¿El asesor indagó más allá de la respuesta superficial?
* **Personalización**: ¿Usó el nombre, la situación y los datos del cliente para personalizar la conversación?
* **Construcción sobre respuestas previas**: ¿Las preguntas siguientes surgieron de lo que el cliente dijo antes?
* **Integración**: ¿El asesor demostró que escuchó y recordó lo que el cliente compartió?

No sobrevalorar preguntas básicas de formulario. Un asesor que pregunta nombre, monto y ocupación pero no profundiza ni personaliza tiene escucha activa baja.

## Empatía

Calibra el nivel de empatía requerido según el contexto emocional real de la llamada.

Contexto de alta carga emocional (enfermedad, fallecimiento, desempleo, crisis familiar):
* La empatía tiene máximo peso. Ausencia o respuesta mecánica es una falla grave.

Contexto de carga emocional media (estrés financiero, frustración con deudas, preocupación por el monto):
* El asesor debe validar la situación antes de continuar. Un "entiendo tu situación" sincero es Adecuada.

Contexto sin carga emocional relevante (conversación puramente comercial, cliente neutral):
* No penalices la empatía. Si el asesor mantiene trato cordial y personalizado, califica como Adecuada.

Clasifica: Excelente / Adecuada / Insuficiente / Ausente.

REGLA: Si el cliente NO comparte una situación emocional grave, el nivel de referencia es Adecuada. Para calificar como Insuficiente debe haber un momento claro donde el asesor debió validar emocionalmente y no lo hizo.

## Presentación de Oferta
Evalúa:
* Claridad, personalización, explicación de beneficios y condiciones.

No penalices porque el monto aprobado sea inferior al solicitado. En ese caso evalúa:
* ¿Explicó el beneficio del monto aprobado?
* ¿Cuantificó el ahorro o impacto financiero?
* ¿Ofreció una estrategia para llegar al monto objetivo?
* ¿Defendió la oferta con argumentos concretos?

Penaliza solo si el asesor no argumentó ni defendió la oferta parcial.

## Manejo de Objeciones

Una objeción existe cuando el cliente expresa duda, resistencia, preocupación, inconformidad, comparación, necesidad de pensar o cuestiona la conveniencia de la oferta — independientemente de cómo lo exprese.

**Señales de objeción que debes detectar:**
* "Lo voy a pensar." / "Más adelante." / "No es el momento."
* "Traigo otras cosas." / "Lo voy a revisar."
* "No sé si me conviene." / "Es mucho." / "Es poco."
* "Tengo que hablar con mi esposa/familia."
* "Ya tengo otro crédito." / "Me ofrecieron mejor tasa en otro lado."
* Cualquier señal de duda, pausa evaluativa o falta de compromiso.

Detecta automáticamente todas las objeciones presentes en la transcripción.

Si el asesor responde intentando justificar la oferta, resolver la preocupación o dar argumentos, ESO ES manejo de objeción, aunque no logre superarla completamente.

**Clasificación por objeción:**
* **Exitoso** — el asesor identifica, explora, argumenta y logra avanzar al cliente.
* **Parcial** — el asesor identifica y argumenta, pero no logra superar la objeción completamente. Calificación: 6-8.
* **Deficiente** — el asesor reconoce pero responde de forma superficial o poco relacionada. Calificación: 3-5.
* **Sin manejo** — el asesor ignora completamente la objeción. Calificación: 1-3.

NUNCA clasifiques como "no hubo manejo de objeciones" si el cliente expresó resistencia y el asesor intentó responder. En ese caso es Parcial o Deficiente, nunca ausente.

CALIBRACIÓN GLOBAL:
* Manejo exitoso → 8-10
* Manejo parcial → 6-8
* Manejo deficiente → 3-5
* Sin manejo ante objeciones existentes → 1-3

## REGLA DE PROFUNDIZACIÓN ANTE RESPUESTAS AMBIGUAS

Cuando el cliente exprese frases como "lo voy a pensar", "más adelante", "no es el momento", "traigo otras cosas" o cualquier respuesta evasiva o vaga, el asesor DEBE intentar descubrir la razón real.

Si el asesor no profundiza ante estas frases, registra esto como oportunidad de mejora.

Ejemplo de buena práctica:
* Cliente: "Lo voy a pensar."
* Asesor debería preguntar: "¿Qué es específicamente lo que te genera duda en este momento?" o "¿Hay algo de la oferta que no se adapta a lo que necesitas?"

Si el asesor simplemente acepta la respuesta sin explorarla, penaliza en descubrimiento y manejo de objeciones.

## Cierre

**Cierre Exitoso**: el cliente acepta la oferta, avanza a originación, carga documentos o firma.

**Cierre de Avance**: el cliente acepta seguimiento específico, agenda próxima llamada, acepta revisar la propuesta, confirma comunicación por WhatsApp, acepta envío de información o da cualquier compromiso concreto. Esto es un resultado válido y positivo en una llamada de ventas.

**Cierre Fallido**: no existe ningún compromiso futuro.

REGLA: No califiques automáticamente como deficiente un cierre porque no hubo venta. En ventas, conseguir la siguiente conversación es un cierre válido.

CALIBRACIÓN:
* Cierre Exitoso (venta / originación) → 9-10
* Cierre de Avance (compromiso específico con fecha, hora o acción concreta) → 7-8
* Cierre parcial (seguimiento vago, sin compromiso específico) → 5-6
* Sin ningún tipo de cierre o avance → 1-4

# ESCALA DE CALIFICACIÓN

90-100 = Excelente
80-89  = Bueno
70-79  = Aceptable
60-69  = Requiere Mejora
0-59   = Crítico

# REGLAS DE PUNTUACIÓN

Una sola área débil NO puede arrastrar toda la evaluación.

Una llamada no debe recibir menos de 60 puntos únicamente porque no se concretó la venta.

Para estar por debajo de 60 deben existir fallas graves como:
* Mala actitud hacia el cliente.
* Información incorrecta sobre el producto.
* Ausencia total de descubrimiento.
* Falta de empatía ante situación emocional clara.
* Omisión de procesos críticos del flujo.
* Ignorar objeciones importantes de forma reiterada.

Si el asesor descubre correctamente la necesidad, mantiene control, explica la oferta, maneja objeciones y sigue el proceso, la llamada normalmente debe ubicarse entre 70 y 85 puntos incluso si no se concreta la venta.

# EVIDENCIA OBLIGATORIA

Cada hallazgo debe incluir evidencia textual.

Cumple — cita directa: "Asesor: ¿Cuántas tarjetas quieres liquidar?"
Incumple — indicación de ausencia: "No se identificó pregunta sobre fecha esperada de depósito."

# SUGERENCIAS POR OPORTUNIDAD DE MEJORA

Cada oportunidad de mejora debe incluir una sugerencia concreta de lo que el asesor pudo haber hecho en ese momento específico de la llamada.

Las sugerencias deben ser ejemplos de diálogo o frases accionables, no generalidades.

Incorrecto: "Debe mejorar el manejo de objeciones."
Correcto: "Cuando el cliente dijo 'lo voy a pensar', el asesor pudo preguntar: '¿Hay algo específico de la propuesta que no te convence en este momento?' para descubrir la objeción real."

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
    { "punto": "<descripción>", "evidencia": "<cita o indicación de ausencia>", "sugerencia": "<frase o acción concreta que el asesor pudo haber hecho>" }
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
  "coaching": "<párrafo específico y accionable con ejemplos de diálogo>",
  "veredictoFinal": "<párrafo explicando la calificación en contexto del estado de la llamada>"
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
      max_tokens: 3000,
    });

    const content = completion.choices[0].message.content ?? '{}';
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error('OpenAI analyze error:', err);
    return NextResponse.json({ error: 'Error al analizar la llamada.' }, { status: 500 });
  }
}
