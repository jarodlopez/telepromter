import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function mockAnalysis(crmData: any, callData: any, callDuration: number) {
  const tieneRefs = callData.refFamiliar && callData.refAmistad;
  const objecionesSuficientes = callData.objecionesRebatidas >= 3;
  const duracionOk = callDuration >= 180;
  const puntuacion = 5 + (tieneRefs ? 2 : 0) + (objecionesSuficientes ? 1 : 0) + (duracionOk ? 1 : 0) + (callData.motivo ? 1 : 0);

  return {
    _demo: true,
    resumen: `Llamada de ${formatTime(callDuration)} con ${crmData.cliente || 'el cliente'} (lead ${crmData.tipoLead.toUpperCase()}). ${tieneRefs ? 'Se obtuvieron las 2 referencias requeridas.' : 'No se completaron las referencias obligatorias.'} Este es un análisis de demostración — agrega OPENAI_API_KEY para análisis real.`,
    puntosFuertes: [
      crmData.monto ? `Oferta concreta presentada: $${crmData.monto} a ${crmData.tasa}` : 'Datos de oferta registrados en el sistema',
      callData.motivo ? `Motivo del crédito identificado: ${callData.motivo}` : 'Flujo de llamada completado con el teleprompter',
      duracionOk ? `Duración adecuada de ${formatTime(callDuration)} para una llamada de ventas` : 'Uso correcto del script estructurado',
    ],
    areasMejora: [
      !tieneRefs ? 'Referencias telefónicas incompletas — son OBLIGATORIAS para Riesgo, no se puede cerrar sin ellas' : 'Mantener el hábito de pedir referencias al inicio del cierre, no al final',
      !objecionesSuficientes ? `Solo ${callData.objecionesRebatidas}/3 objeciones registradas — el playbook exige mínimo 3 para calidad` : 'Continuar aplicando el framework REA completo en cada objeción',
      !callData.fechaSeguimiento ? 'No se agendó seguimiento — toda llamada debe cerrar con una fecha concreta, incluso si no hubo conversión' : 'Confirmar el seguimiento por WhatsApp inmediatamente después de colgar',
    ],
    recomendacion: callData.fechaSeguimiento
      ? `Contactar el ${callData.fechaSeguimiento}. Preparar argumentos adicionales sobre ${callData.motivo || 'el destino del crédito'} y confirmar disponibilidad de documentos.`
      : `Agendar seguimiento de inmediato. El cliente mostró interés en $${crmData.monto || 'el monto aprobado'} — llamar en menos de 24 horas para no perder el momentum.`,
    puntuacion: Math.min(10, Math.max(1, puntuacion)),
  };
}

export async function POST(req: NextRequest) {
  const { transcript, crmData, callData, callDuration } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    await new Promise((r) => setTimeout(r, 900)); // simulate latency so demo feels real
    return NextResponse.json(mockAnalysis(crmData, callData, callDuration));
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `Eres un coach de ventas experto de MultiMoney, institución financiera mexicana.
Analizas llamadas de ejecutivos de crédito personal y das retroalimentación constructiva y accionable en español.
Responde ÚNICAMENTE con JSON válido con esta estructura exacta (sin markdown ni texto extra):
{
  "puntosFuertes": ["punto 1", "punto 2", "punto 3"],
  "areasMejora": ["área 1", "área 2", "área 3"],
  "recomendacion": "recomendación concreta para el siguiente contacto con este cliente",
  "puntuacion": 7,
  "resumen": "resumen ejecutivo de la llamada en 2 oraciones"
}`;

  const userPrompt = `Analiza esta llamada de venta de crédito personal:

DATOS DE LA LLAMADA:
- Tipo de lead: ${crmData.tipoLead.toUpperCase()}
- Cliente: ${crmData.cliente || 'No registrado'}
- Monto: $${crmData.monto || '—'} | Tasa: ${crmData.tasa || '—'} | Cuota: $${crmData.cuota || '—'}
- Duración: ${formatTime(callDuration)}
- Objeciones manejadas: ${callData.objecionesRebatidas}/3 (mínimo requerido por el playbook)
- Motivo del crédito: ${callData.motivo || 'No registrado'}
- Referencia familiar: ${callData.refFamiliar ? `✅ ${callData.refFamiliar}` : '❌ No obtenida'}
- Referencia amistad: ${callData.refAmistad ? `✅ ${callData.refAmistad}` : '❌ No obtenida'}
${crmData.tipoLead === 'longtrack' ? `- CURP validada: ${callData.curpValidada ? '✅ Sí' : '❌ Pendiente'}` : ''}
- Seguimiento agendado: ${callData.fechaSeguimiento || 'No agendado'}

TRANSCRIPCIÓN:
${transcript?.trim() || '(Sin transcripción — evalúa solo con los datos de arriba)'}

Evalúa: calidad de la apertura, sondeo de necesidades, pitch de la oferta, manejo de objeciones (framework REA), cierre, obtención de referencias obligatorias, registro en CRM.
Puntuación: 1=pésimo, 5=regular, 8=buena llamada, 10=llamada perfecta según el playbook MultiMoney.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = completion.choices[0].message.content ?? '{}';
    const analysis = JSON.parse(content);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error('OpenAI analyze error:', err);
    return NextResponse.json({ error: 'Error al analizar la llamada. Verifica tu API key.' }, { status: 500 });
  }
}
