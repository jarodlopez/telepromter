import { NextResponse } from 'next/server';

// Whisper supports: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
const SUPPORTED = new Set(['flac','m4a','mp3','mp4','mpeg','mpga','oga','ogg','wav','webm']);
const MAX_BYTES  = 25 * 1024 * 1024; // 25 MB — Whisper hard limit

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY no configurada en el servidor.' },
      { status: 500 },
    );
  }

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

    const wForm = new FormData();
    wForm.append('file', audio, audio.name);
    wForm.append('model', 'whisper-1');
    wForm.append('language', 'es');
    wForm.append('response_format', 'text');
    // Context hint for financial/FinTech vocabulary
    wForm.append(
      'prompt',
      'Llamada de ventas de crédito personal. Vocabulario: tasa de interés, monto aprobado, cuota mensual, ' +
      'CLABE interbancaria, originación, biométricos, INE, MultiMoney, saldo insoluto, plazo, asesor financiero.',
    );

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method:  'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body:    wForm,
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail?.error?.message ?? `Whisper devolvió error ${res.status}`);
    }

    const text = await res.text();
    return NextResponse.json({ text: text.trim() });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error al transcribir. Intenta de nuevo.' },
      { status: 500 },
    );
  }
}
