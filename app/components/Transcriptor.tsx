'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Trash2 } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';

export function Transcriptor() {
  const { transcript, addToTranscript, clearTranscript } = useTeleprompterStore();
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState(true);
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

  const startRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX';

    recognition.onresult = (event: any) => {
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
      if (e.error !== 'aborted') {
        setInterim('');
      }
    };

    // Auto-restart on natural end so it keeps recording through silences
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
      isListeningRef.current = false;
      setIsListening(false);
      setInterim('');
      recognitionRef.current?.stop();
    } else {
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-white sticky top-0">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
              <MicOff className="w-4 h-4" /> Detener
            </>
          ) : (
            <><Mic className="w-4 h-4" /> Transcribir</>
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 text-sm text-slate-700 leading-relaxed space-y-1">
        {!transcript && !interim && !isListening && (
          <p className="text-slate-400 text-center mt-10 text-xs px-4">
            Presiona "Transcribir" para capturar la conversación.<br />
            El texto se guardará aunque cambies de pestaña.
          </p>
        )}
        {transcript && <p className="whitespace-pre-wrap">{transcript}</p>}
        {interim && (
          <p className="text-slate-400 italic">{interim}</p>
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
