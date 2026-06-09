'use client';

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Loader2, ClipboardPaste, User, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTeleprompterStore } from '@/lib/store';
import { PostCallAnalysis } from '@/app/components/PostCallAnalysis';
import { Toast } from '@/app/components/ui/Toast';

export default function AnalyzePage() {
  const router = useRouter();
  const { crmData, setCrmData, setAnalysis, isAnalyzing, setIsAnalyzing, showToast } =
    useTeleprompterStore();

  const [transcript, setTranscript] = useState('');
  const [localCliente, setLocalCliente] = useState(crmData.cliente);
  const [localAsesor, setLocalAsesor] = useState(crmData.asesor);
  const [localTipo, setLocalTipo] = useState<typeof crmData.tipoLead>(crmData.tipoLead);

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const analyze = async () => {
    if (!transcript.trim()) {
      showToast('Pega la transcripción antes de analizar.', 'error');
      return;
    }
    setCrmData({ cliente: localCliente, asesor: localAsesor, tipoLead: localTipo });
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          crmData: { ...crmData, cliente: localCliente, asesor: localAsesor, tipoLead: localTipo },
          callData: {
            motivo: '', refFamiliar: '', refAmistad: '',
            fechaSeguimiento: '', objecionesRebatidas: 0, curpValidada: false,
          },
          callDuration: 0,
        }),
      });
      if (!res.ok) throw new Error();
      setAnalysis(await res.json());
    } catch {
      showToast('No se pudo analizar. Intenta de nuevo.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-bold text-sm">Coaching IA · MultiMoney</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              <User className="w-3 h-3 inline mr-1" />Cliente
            </label>
            <input
              value={localCliente}
              onChange={(e) => setLocalCliente(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              <User className="w-3 h-3 inline mr-1" />Asesor
            </label>
            <input
              value={localAsesor}
              onChange={(e) => setLocalAsesor(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              <Target className="w-3 h-3 inline mr-1" />Tipo de Lead
            </label>
            <select
              value={localTipo}
              onChange={(e) => setLocalTipo(e.target.value as typeof crmData.tipoLead)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="upper">⚡ UPPER</option>
              <option value="gancho">🎣 Gancho</option>
              <option value="expirado">🔄 Expirado</option>
              <option value="longtrack">✅ Long Track</option>
            </select>
          </div>
        </div>

        {/* Transcript input */}
        <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-indigo-400" />
              Transcripción de HubSpot
            </p>
            {wordCount > 0 && <span className="text-xs text-slate-400">{wordCount} palabras</span>}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Pega aquí la transcripción generada por HubSpot..."
            rows={12}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
          />
          <button
            onClick={analyze}
            disabled={isAnalyzing || !transcript.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 transition"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analizando...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Analizar con IA</>
            )}
          </button>
        </div>

        {/* Results rendered via PostCallAnalysis — uses Zustand store */}
        <div className="[&_.mt-6]:mt-0">
          <PostCallAnalysis />
        </div>
      </div>

      <Toast />
    </div>
  );
}
