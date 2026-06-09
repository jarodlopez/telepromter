'use client';
import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Loader2, GraduationCap, Star } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import type { CategoryScore } from '@/lib/store';

const DICTAMEN_STYLES: Record<string, string> = {
  Excelente:      'bg-emerald-100 text-emerald-800 border-emerald-300',
  Bueno:          'bg-blue-100 text-blue-800 border-blue-300',
  Aceptable:      'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Requiere Mejora': 'bg-orange-100 text-orange-800 border-orange-300',
  Crítico:        'bg-red-100 text-red-800 border-red-300',
};

const SCORE_COLOR = (score: number) =>
  score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-500';

function CategoryBar({ label, data }: { label: string; data: CategoryScore }) {
  const pct = Math.round((data.calificacion / data.maximo) * 100);
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="text-slate-500 font-mono">{data.calificacion}/{data.maximo}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-600 leading-snug">{data.hallazgos}</p>
    </div>
  );
}

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

  const isDemo = (analysis as any)._demo === true;
  const scoreColor = SCORE_COLOR(analysis.calificacionFinal);
  const dictamenStyle = DICTAMEN_STYLES[analysis.dictamen] ?? DICTAMEN_STYLES['Aceptable'];
  const cats = analysis.categorias;

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      {isDemo && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex gap-2 items-start">
          <span className="text-amber-500 flex-shrink-0">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Modo demo</strong> — análisis automático sin IA.
            Agrega <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> en Vercel para evaluación real.
          </p>
        </div>
      )}

      {/* Resultado general */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Resultado General</p>
        <div className="flex items-center gap-4">
          <div className="text-center flex-shrink-0">
            <p className={`text-5xl font-black leading-none ${scoreColor}`}>{analysis.calificacionFinal}</p>
            <p className="text-xs text-slate-400 font-bold mt-0.5">/100</p>
          </div>
          <div className="flex-1 space-y-2">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${dictamenStyle}`}>
              {analysis.dictamen}
            </span>
            <p className="text-slate-700 text-sm leading-relaxed">{analysis.resumenEjecutivo}</p>
          </div>
        </div>
      </div>

      {/* Evaluación por categoría */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Evaluación por Categoría</p>
        {cats && (
          <div className="space-y-4">
            <CategoryBar label="Apertura" data={cats.apertura} />
            <CategoryBar label="Descubrimiento" data={cats.descubrimiento} />
            <CategoryBar label="Pitch Comercial" data={cats.pitchComercial} />
            <CategoryBar label="Manejo de Objeciones" data={cats.manejoObjeciones} />
            <CategoryBar label="Cierre" data={cats.cierre} />
            <CategoryBar label="Despedida" data={cats.despedida} />
          </div>
        )}
      </div>

      {/* Fortalezas / Oportunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Fortalezas
          </p>
          <ul className="space-y-2">
            {analysis.fortalezas?.map((f, i) => (
              <li key={i} className="text-sm text-emerald-900 flex gap-2">
                <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>{f}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Oportunidades de Mejora
          </p>
          <ul className="space-y-2">
            {analysis.oportunidadesMejora?.map((o, i) => (
              <li key={i} className="text-sm text-amber-900 flex gap-2">
                <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>{o}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Riesgos */}
      {analysis.riesgosDetectados?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Riesgos Detectados
          </p>
          <ul className="space-y-1">
            {analysis.riesgosDetectados.map((r, i) => (
              <li key={i} className="text-sm text-red-900 flex gap-2">
                <span className="text-red-500 font-bold flex-shrink-0">!</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coaching */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1">
          <GraduationCap className="w-3 h-3" /> Coaching Recomendado
        </p>
        <p className="text-sm text-blue-900 leading-relaxed">{analysis.coachingRecomendado}</p>
      </div>

      {/* Veredicto */}
      <div className="bg-slate-800 text-white rounded-xl p-4">
        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-1">
          <Star className="w-3 h-3" /> Veredicto Final
        </p>
        <p className="text-sm text-slate-200 leading-relaxed">{analysis.veredictoFinal}</p>
      </div>
    </div>
  );
}
