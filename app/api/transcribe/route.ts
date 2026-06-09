import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ text: '' });
  }

  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;

    if (!audio || audio.size < 1000) {
      return NextResponse.json({ text: '' });
    }

    const openaiForm = new FormData();
    openaiForm.append('file', audio, 'chunk.webm');
    openaiForm.append('model', 'whisper-1');
    openaiForm.append('language', 'es');
    openaiForm.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: openaiForm,
    });

    if (!response.ok) {
      return NextResponse.json({ text: '' });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text || '' });
  } catch {
    return NextResponse.json({ text: '' });
  }
}
