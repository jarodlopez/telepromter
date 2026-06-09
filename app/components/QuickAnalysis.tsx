'use client';
import React, { useState } from 'react';
import { ClipboardPaste, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { PostCallAnalysis } from '@/app/components/PostCallAnalysis';

export function QuickAnalysis() {
  const { crmData, setAnalysis, isAnalyzing, setIsAnalyzing, analysis, showToast } =
    useTeleprompterStore();

  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState('');

  const analyze = async () => {
    if (!transcript.trim()) {
      showToast('Pega la transcripción antes de analizar.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          crmData,
          callData: { motivo: '', refFamiliar: '', refAmistad: '', fechaSeguimiento: '', objecionesRebatidas: 0, curpValidada: false },
          callDuration: 0,
        }),
      });

      if (!res.ok) throw new Error('Error del servidor');
      const data = await res.json();
      setAnalysis(data);
    } catch {
      showToast('No se pudo analizar. Intenta de nuevo.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto mt-4">
      {/* Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Analizar Transcripción de HubSpot con IA
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="bg-white rounded-b-2xl shadow-xl border border-slate-200 p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Pega la transcripción generada por HubSpot. Si llenaste los datos del cliente arriba,
            el análisis los tomará en cuenta.
          </p>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Pega aquí la transcripción de HubSpot..."
            rows={10}
            className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400"
          />

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              {transcript.trim() ? `${transcript.trim().split(/\s+/).length} palabras` : ''}
            </p>
            <button
              onClick={analyze}
              disabled={isAnalyzing || !transcript.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analizando...</>
              ) : (
                <><ClipboardPaste className="w-4 h-4" /> Analizar con IA</>
              )}
            </button>
          </div>

          <PostCallAnalysis />
        </div>
      )}
    </div>
  );
}
