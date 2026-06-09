'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Trash2, WifiOff, ShieldAlert, MonitorSpeaker } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';

// Errors that cannot be recovered by restarting — stop and inform the user
const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported']);

const ERROR_MESSAGES: Record<string, { icon: React.ReactNode; text: string }> = {
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
    text: 'Sin conexión a internet. Chrome necesita enviar el audio a Google para transcribir. Verifica tu red.',
  },
  'language-not-supported': {
    icon: <MicOff className="w-5 h-5 text-amber-400" />,
    text: 'Idioma es-MX no disponible en este navegador. Reintentando con español genérico…',
  },
};

export function Transcriptor() {
  const { transcript, addToTranscript, clearTranscript } = useTeleprompterStore();
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
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

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterim('');
    recognitionRef.current?.stop();
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
          addToTranscript(result[0].transcript + ' ');
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText);
    };

    recognition.onerror = (e: any) => {
      setInterim('');
      if (FATAL_ERRORS.has(e.error)) {
        // Stop the loop — fatal errors can't be fixed by restarting
        isListeningRef.current = false;
        setIsListening(false);
        if (e.error === 'language-not-supported' && lang !== 'es') {
          // One retry with generic Spanish
          setErrorKey('language-not-supported');
          setTimeout(() => startRecognition('es'), 500);
        } else {
          setErrorKey(e.error);
        }
      }
      // non-fatal (no-speech, aborted): onend will auto-restart naturally
    };

    recognition.onend = () => {
      setInterim('');
      // Only restart if still intended to be listening AND no fatal error occurred
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

  if (!supported) {
    return (
      <div className="p-6 text-center">
        <MicOff className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-slate-500 text-sm font-medium">Transcripción no disponible</p>
        <p className="text-slate-400 text-xs mt-1">Usa Chrome o Edge para activarla.</p>
      </div>
    );
  }

  const errorInfo = errorKey ? ERROR_MESSAGES[errorKey] : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-white sticky top-0">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : errorInfo
              ? 'bg-slate-400 text-white hover:bg-slate-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
              <MicOff className="w-4 h-4" /> Detener
            </>
          ) : (
            <><Mic className="w-4 h-4" /> {errorInfo ? 'Reintentar' : 'Transcribir'}</>
          )}
        </button>

        {transcript && (
          <button
            onClick={() => { clearTranscript(); setInterim(''); }}
            className="text-slate-400 hover:text-red-500 transition p-2 rounded"
            title="Limpiar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error banner */}
      {errorInfo && (
        <div className="mx-3 mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
          {errorInfo.icon}
          <p className="text-xs text-red-800 leading-relaxed">{errorInfo.text}</p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 text-sm text-slate-700 leading-relaxed space-y-1">
        {!transcript && !interim && !isListening && !errorInfo && (
          <p className="text-slate-400 text-center mt-10 text-xs px-4">
            Presiona "Transcribir" para capturar la conversación.<br />
            El texto se guardará aunque cambies de pestaña.
          </p>
        )}
        {transcript && <p className="whitespace-pre-wrap">{transcript}</p>}
        {interim && <p className="text-slate-400 italic">{interim}</p>}
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
