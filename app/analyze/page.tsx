'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  ClipboardPaste,
  User,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTeleprompterStore } from '@/lib/store';
import { Toast } from '@/app/components/ui/Toast';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${(score / 10) * 251.2} 251.2`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400 font-bold">/10</span>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const { crmData, setCrmData, analysis, setAnalysis, isAnalyzing, setIsAnalyzing, showToast } =
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
    // Sync context fields to store so PostCallAnalysis has them
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

  const isDemo = analysis && (analysis as any)._demo === true;
  const scoreColor =
    !analysis ? ''
    : analysis.puntuacion >= 8 ? 'text-emerald-600'
    : analysis.puntuacion >= 6 ? 'text-amber-600'
    : 'text-red-500';

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

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Context row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              <User className="w-3 h-3 inline mr-1" />Cliente
            </label>
            <input
              type="text"
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
              type="text"
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
            {wordCount > 0 && (
              <span className="text-xs text-slate-400">{wordCount} palabras</span>
            )}
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
              <><Loader2 className="w-5 h-5 animate-spin" /> Analizando llamada...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Analizar con IA</>
            )}
          </button>
        </div>

        {/* Loading */}
        {isAnalyzing && (
          <div className="bg-slate-800 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-white font-bold">Analizando con IA...</p>
            <p className="text-slate-400 text-sm">GPT-4o-mini está evaluando la llamada</p>
          </div>
        )}

        {/* Results */}
        {analysis && !isAnalyzing && (
          <div className="space-y-4 animate-fade-in">
            {isDemo && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-3 flex gap-2 items-start">
                <span className="text-amber-400 flex-shrink-0">⚠️</span>
                <p className="text-xs text-amber-300 leading-relaxed">
                  <strong>Modo demo</strong> — análisis automático sin IA. Agrega{' '}
                  <code className="bg-amber-900/50 px-1 rounded">OPENAI_API_KEY</code> en Vercel para coaching real.
                </p>
              </div>
            )}

            {/* Score + resumen */}
            <div className="bg-slate-800 rounded-2xl p-6 flex items-center gap-6">
              <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
                <ScoreRing score={analysis.puntuacion} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                  Evaluación · Coaching MultiMoney
                </p>
                <p className="text-slate-200 text-sm leading-relaxed">{analysis.resumen}</p>
              </div>
            </div>

            {/* Puntos fuertes / Áreas mejora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Puntos fuertes
                </p>
                <ul className="space-y-2">
                  {analysis.puntosFuertes?.map((p, i) => (
                    <li key={i} className="text-sm text-emerald-200 flex gap-2">
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/60 border border-amber-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Áreas de mejora
                </p>
                <ul className="space-y-2">
                  {analysis.areasMejora?.map((a, i) => (
                    <li key={i} className="text-sm text-amber-200 flex gap-2">
                      <span className="text-amber-500 font-bold flex-shrink-0">→</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recomendación */}
            <div className="bg-indigo-950/60 border border-indigo-800 rounded-2xl p-5">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Siguiente acción recomendada
              </p>
              <p className="text-slate-200 text-sm leading-relaxed">{analysis.recomendacion}</p>
            </div>
          </div>
        )}
      </div>

      <Toast />
    </div>
  );
}
