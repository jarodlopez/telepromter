import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY no configurada. Agrégala en .env.local o en las variables de entorno de Vercel.' },
      { status: 500 }
    );
  }

  const { transcript, crmData, callData, callDuration } = await req.json();

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
