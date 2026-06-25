import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const SUPPORTED = new Set(['flac','m4a','mp3','mp4','mpeg','mpga','oga','ogg','wav','webm']);
const MAX_BYTES  = 25 * 1024 * 1024;

const DIARIZE_PROMPT = `Eres un asistente especializado en llamadas de ventas de crédito personal de MultiMoney México.

Recibirás la transcripción en bruto de una llamada telefónica entre UN ASESOR FINANCIERO y UN CLIENTE. Whisper transcribió el audio como un bloque sin distinguir hablantes.

TU TAREA: separar la transcripción en turnos de conversación y etiquetar cada turno con "Asesor:" o "Cliente:".

REGLAS:
1. El ASESOR: habla de créditos, tasas, montos aprobados, plazos, beneficios, hace preguntas de perfilamiento, presenta la oferta, rebate objeciones, pide documentos.
2. El CLIENTE: responde preguntas, expresa dudas, da información personal, pone objeciones ("está caro", "lo pienso", "no lo necesito"), acepta o rechaza.
3. Cada turno de conversación en su propia línea con el formato exacto:
   Asesor: [texto del turno]
   Cliente: [texto del turno]
4. No modifiques el contenido, solo añade las etiquetas.
5. Si hay ambigüedad, asigna según el contexto más probable.
6. Si detectas frases de saludo estándar de MultiMoney, son del Asesor.

SOLO devuelve el transcript etiquetado, sin explicaciones adicionales.`;

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY no configurada en el servidor.' },
      { status: 500 },
    );
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const formData = await req.formData();
    const audio    = formData.get('audio') as File | null;

    if (!audio || audio.size < 100) {
      return NextResponse.json({ error: 'Archivo de audio no válido o vacío.' }, { status: 400 });
    }
    if (audio.size > MAX_BYTES) {
      return NextResponse.json({ error: 'El archivo supera el límite de 25 MB de Whisper.' }, { status: 400 });
    }

    const ext = audio.name.split('.').pop()?.toLowerCase() ?? '';
    if (!SUPPORTED.has(ext)) {
      return NextResponse.json(
        { error: `Formato no soportado (.${ext}). Usa MP3, M4A, WAV, OGG o WebM.` },
        { status: 400 },
      );
    }

    // ── Step 1: Whisper transcription ────────────────────────────────────────
    const wForm = new FormData();
    wForm.append('file', audio, audio.name);
    wForm.append('model', 'whisper-1');
    wForm.append('language', 'es');
    wForm.append('response_format', 'text');
    wForm.append(
      'prompt',
      'Llamada de ventas de crédito personal MultiMoney. Vocabulario: tasa de interés, monto aprobado, ' +
      'cuota mensual, CLABE interbancaria, originación, biométricos, INE, saldo insoluto, plazo, asesor financiero.',
    );

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method:  'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body:    wForm,
    });

    if (!whisperRes.ok) {
      const detail = await whisperRes.json().catch(() => ({}));
      throw new Error(detail?.error?.message ?? `Whisper devolvió error ${whisperRes.status}`);
    }

    const rawText = (await whisperRes.text()).trim();
    if (!rawText) throw new Error('Whisper no devolvió texto. Verifica que el audio tenga voz clara.');

    // ── Step 2: GPT speaker diarization ──────────────────────────────────────
    const gptRes = await client.chat.completions.create({
      model:       'gpt-4o-mini',
      temperature: 0.1,
      max_tokens:  4096,
      messages: [
        { role: 'system', content: DIARIZE_PROMPT },
        { role: 'user',   content: rawText },
      ],
    });

    const labeled = gptRes.choices[0]?.message?.content?.trim() ?? rawText;

    return NextResponse.json({
      text: labeled,
      rawText,  // also return raw in case the client wants it
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error al transcribir. Intenta de nuevo.' },
      { status: 500 },
    );
  }
}
