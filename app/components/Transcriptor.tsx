'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Trash2, WifiOff, ShieldAlert, MonitorSpeaker, Monitor, Loader2 } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';

const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported']);

const MIC_ERROR_MESSAGES: Record<string, { icon: React.ReactNode; text: string }> = {
  'not-allowed': {
    icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
    text: 'Permiso de micrófono denegado. Ve a Configuración del navegador → Permisos del sitio y permite el micrófono.',
  },
  'service-not-allowed': {
    icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
    text: 'Permiso de micrófono denegado. Ve a Configuración del navegador → Permisos del sitio y permite el micrófono.',
  },
  'audio-capture': {
    icon: <MonitorSpeaker className="w-5 h-5 text-red-400" />,
    text: 'No se encontró micrófono. Conecta uno y recarga la página.',
  },
  'network': {
    icon: <WifiOff className="w-5 h-5 text-amber-400" />,
    text: 'Sin conexión a internet. Chrome necesita enviar el audio a Google para transcribir.',
  },
  'language-not-supported': {
    icon: <MicOff className="w-5 h-5 text-amber-400" />,
    text: 'Idioma es-MX no disponible. Reintentando con español genérico…',
  },
};

async function transcribeChunk(blob: Blob): Promise<string> {
  try {
    const form = new FormData();
    form.append('audio', blob, 'chunk.webm');
    const res = await fetch('/api/transcribe', { method: 'POST', body: form });
    if (!res.ok) return '';
    const data = await res.json();
    return data.text || '';
  } catch {
    return '';
  }
}

export function Transcriptor() {
  const { transcript, addToTranscript, clearTranscript } = useTeleprompterStore();
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [clientCapture, setClientCapture] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isTranscribingClient, setIsTranscribingClient] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const clientCaptureRef = useRef(false);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const clientIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) setSupported(false);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interim]);

  useEffect(() => {
    return () => { stopClientCapture(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterim('');
    recognitionRef.current?.stop();
  };

  const stopClientCapture = () => {
    clientCaptureRef.current = false;
    setClientCapture(false);
    if (clientIntervalRef.current) {
      clearInterval(clientIntervalRef.current);
      clientIntervalRef.current = null;
    }
    recorderRef.current?.stop();
    recorderRef.current = null;
    displayStreamRef.current?.getTracks().forEach((t) => t.stop());
    displayStreamRef.current = null;
    chunksRef.current = [];
  };

  const startRecognition = (lang = 'es-MX') => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      setErrorKey(null);
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const prefix = clientCaptureRef.current ? 'Asesor: ' : '';
          addToTranscript(prefix + result[0].transcript + '\n');
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText);
    };

    recognition.onerror = (e: any) => {
      setInterim('');
      if (FATAL_ERRORS.has(e.error)) {
        isListeningRef.current = false;
        setIsListening(false);
        if (e.error === 'language-not-supported' && lang !== 'es') {
          setErrorKey('language-not-supported');
          setTimeout(() => startRecognition('es'), 500);
        } else {
          setErrorKey(e.error);
        }
      }
    };

    recognition.onend = () => {
      setInterim('');
      if (isListeningRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const toggleListening = () => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      setErrorKey(null);
      isListeningRef.current = true;
      setIsListening(true);
      startRecognition();
    }
  };

  const startClientCapture = async () => {
    setClientError(null);
    try {
      // Request tab/system audio via getDisplayMedia
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        audio: true,
        video: false,
      });

      // Stop any video tracks Chrome may have added
      stream.getVideoTracks().forEach((t: MediaStreamTrack) => t.stop());

      const audioTracks: MediaStreamTrack[] = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        setClientError('sin-audio');
        return;
      }

      displayStreamRef.current = stream;
      clientCaptureRef.current = true;
      setClientCapture(true);

      // When user stops sharing via the browser UI
      audioTracks[0].addEventListener('ended', () => stopClientCapture());

      const recorder = new MediaRecorder(new MediaStream(audioTracks));
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(200); // small slices so chunks accumulate quickly

      // Flush and transcribe every 5 seconds
      clientIntervalRef.current = setInterval(async () => {
        if (!clientCaptureRef.current) return;
        const batch = [...chunksRef.current];
        chunksRef.current = [];
        if (batch.length === 0) return;

        const blob = new Blob(batch, { type: 'audio/webm' });
        if (blob.size < 2000) return; // skip near-silent chunks

        setIsTranscribingClient(true);
        const text = await transcribeChunk(blob);
        setIsTranscribingClient(false);

        if (text?.trim()) {
          addToTranscript(`Cliente: ${text.trim()}\n`);
        }
      }, 5000);
    } catch (err: any) {
      clientCaptureRef.current = false;
      setClientCapture(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setClientError('denegado');
      } else if (err.name === 'NotSupportedError') {
        setClientError('no-soportado');
      }
    }
  };

  const toggleClientCapture = () => {
    if (clientCapture) {
      stopClientCapture();
    } else {
      startClientCapture();
    }
  };

  if (!supported) {
    return (
      <div className="p-6 text-center">
        <MicOff className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-slate-500 text-sm font-medium">Transcripción no disponible</p>
        <p className="text-slate-400 text-xs mt-1">Usa Chrome o Edge para activarla.</p>
      </div>
    );
  }

  const micError = errorKey ? MIC_ERROR_MESSAGES[errorKey] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="p-3 border-b border-slate-200 bg-white sticky top-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mic (asesor) */}
          <button
            onClick={toggleListening}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : micError
                ? 'bg-slate-400 text-white hover:bg-slate-500'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <MicOff className="w-3 h-3" /> Asesor ON
              </>
            ) : (
              <><Mic className="w-3 h-3" /> {micError ? 'Reintentar' : 'Asesor'}</>
            )}
          </button>

          {/* Client audio */}
          <button
            onClick={toggleClientCapture}
            title="Captura audio de HubSpot (requiere OPENAI_API_KEY)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition ${
              clientCapture
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            {clientCapture ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <Monitor className="w-3 h-3" /> Cliente ON
              </>
            ) : (
              <><Monitor className="w-3 h-3" /> + Cliente</>
            )}
          </button>

          {isTranscribingClient && (
            <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
          )}

          {transcript && (
            <button
              onClick={() => { clearTranscript(); setInterim(''); }}
              className="ml-auto text-slate-400 hover:text-red-500 transition p-1.5 rounded"
              title="Limpiar transcripción"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Hint text */}
        {!clientCapture && !clientError && (
          <p className="text-xs text-slate-400 leading-tight">
            "+ Cliente" captura audio de HubSpot (requiere OPENAI_API_KEY). Selecciona la pestaña de HubSpot cuando aparezca el diálogo.
          </p>
        )}

        {/* Client capture error */}
        {clientError && (
          <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800 leading-tight">
            {clientError === 'denegado' && 'Compartir pantalla cancelado. Inténtalo de nuevo y selecciona la pestaña de HubSpot. Activa "Compartir audio de la pestaña".'}
            {clientError === 'sin-audio' && 'No se detectó audio. Al seleccionar la pestaña, marca la casilla "Compartir audio de la pestaña".'}
            {clientError === 'no-soportado' && 'Tu navegador no soporta captura de pantalla. Usa Chrome o Edge.'}
          </div>
        )}
      </div>

      {/* Mic error */}
      {micError && (
        <div className="mx-3 mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
          {micError.icon}
          <p className="text-xs text-red-800 leading-relaxed">{micError.text}</p>
        </div>
      )}

      {/* Transcript display */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed">
        {!transcript && !interim && !isListening && !micError && (
          <p className="text-slate-400 text-center mt-10 text-xs px-4">
            Presiona "Asesor" para transcribir tu voz.<br />
            Usa "+ Cliente" para capturar el audio de HubSpot.
          </p>
        )}
        {transcript && (
          <div className="space-y-0.5 font-mono text-xs leading-5">
            {transcript.split('\n').filter(Boolean).map((line, i) => {
              if (line.startsWith('Cliente:')) {
                return (
                  <p key={i} className="text-emerald-700">
                    <span className="font-bold">Cliente:</span>
                    {line.slice(8)}
                  </p>
                );
              }
              if (line.startsWith('Asesor:')) {
                return (
                  <p key={i} className="text-indigo-700">
                    <span className="font-bold">Asesor:</span>
                    {line.slice(7)}
                  </p>
                );
              }
              return <p key={i} className="text-slate-700">{line}</p>;
            })}
          </div>
        )}
        {interim && (
          <p className="text-slate-400 italic text-xs mt-1">
            {clientCaptureRef.current ? 'Asesor: ' : ''}{interim}
          </p>
        )}
      </div>

      {transcript && (
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-400 font-medium">
            {transcript.trim().split(/\s+/).length} palabras capturadas
          </p>
        </div>
      )}
    </div>
  );
}
