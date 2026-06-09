'use client';
import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';

export function PostCallAnalysis() {
  const { analysis, isAnalyzing } = useTeleprompterStore();

  if (isAnalyzing) {
    return (
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        <span className="text-slate-600 font-medium text-sm">Analizando llamada con IA...</span>
      </div>
    );
  }

  if (!analysis) return null;

  const scoreColor =
    analysis.puntuacion >= 8
      ? 'text-emerald-600'
      : analysis.puntuacion >= 6
      ? 'text-amber-600'
      : 'text-red-500';

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
            Análisis IA · Coaching MultiMoney
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">{analysis.resumen}</p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className={`text-4xl font-black leading-none ${scoreColor}`}>{analysis.puntuacion}</p>
          <p className="text-xs text-slate-400 font-bold mt-0.5">/10</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Puntos fuertes
          </p>
          <ul className="space-y-2">
            {analysis.puntosFuertes?.map((p: string, i: number) => (
              <li key={i} className="text-sm text-emerald-900 flex gap-2">
                <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Áreas de mejora
          </p>
          <ul className="space-y-2">
            {analysis.areasMejora?.map((a: string, i: number) => (
              <li key={i} className="text-sm text-amber-900 flex gap-2">
                <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5">→</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-800 text-white rounded-xl p-4">
        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-1">
          <ArrowRight className="w-3 h-3" /> Siguiente contacto
        </p>
        <p className="text-sm text-slate-200 leading-relaxed">{analysis.recomendacion}</p>
      </div>
    </div>
  );
}
