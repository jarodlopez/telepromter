'use client';
import React from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, Loader2,
  GraduationCap, Star, Ear, Heart, MessageSquare, Lightbulb,
  Target, CheckCircle2, BookOpen, UserCheck,
} from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';

const DICTAMEN_STYLE: Record<string, string> = {
  Excelente:         'bg-emerald-100 text-emerald-800 border-emerald-300',
  Bueno:             'bg-blue-100 text-blue-800 border-blue-300',
  Aceptable:         'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Requiere Mejora': 'bg-orange-100 text-orange-800 border-orange-300',
  Crítico:           'bg-red-100 text-red-800 border-red-300',
};

const EMPATIA_STYLE: Record<string, string> = {
  Excelente:    'text-emerald-600 bg-emerald-50 border-emerald-200',
  Adecuada:     'text-blue-600 bg-blue-50 border-blue-200',
  Insuficiente: 'text-amber-600 bg-amber-50 border-amber-200',
  Ausente:      'text-red-600 bg-red-50 border-red-200',
};

const SCORE_COLOR = (n: number) =>
  n >= 8 ? 'text-emerald-600' : n >= 6 ? 'text-amber-500' : 'text-red-500';

const GLOBAL_COLOR = (n: number) =>
  n >= 80 ? 'text-emerald-500' : n >= 60 ? 'text-amber-500' : 'text-red-500';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  apertura:           <UserCheck className="w-3.5 h-3.5" />,
  descubrimiento:     <MessageSquare className="w-3.5 h-3.5" />,
  escuchaActiva:      <Ear className="w-3.5 h-3.5" />,
  empatia:            <Heart className="w-3.5 h-3.5" />,
  presentacionOferta: <BookOpen className="w-3.5 h-3.5" />,
  manejoObjeciones:   <Target className="w-3.5 h-3.5" />,
  cierre:             <CheckCircle2 className="w-3.5 h-3.5" />,
};

const CATEGORY_LABEL: Record<string, string> = {
  apertura:           'Apertura',
  descubrimiento:     'Descubrimiento',
  escuchaActiva:      'Escucha Activa',
  empatia:            'Empatía',
  presentacionOferta: 'Presentación de Oferta',
  manejoObjeciones:   'Manejo de Objeciones',
  cierre:             'Cierre',
};

function CategoryCard({ id, data }: { id: string; data: any }) {
  const pct = data.calificacion * 10;
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          {CATEGORY_ICONS[id]}
          {CATEGORY_LABEL[id]}
          {id === 'empatia' && data.nivel && (
            <span className={`ml-1 px-2 py-0.5 rounded-full border text-xs font-bold ${EMPATIA_STYLE[data.nivel] ?? ''}`}>
              {data.nivel}
            </span>
          )}
        </span>
        <span className={`font-black text-sm ${SCORE_COLOR(data.calificacion)}`}>
          {data.calificacion}/10
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{data.hallazgos}</p>
    </div>
  );
}

export function PostCallAnalysis() {
  const { analysis, isAnalyzing } = useTeleprompterStore();

  if (isAnalyzing) {
    return (
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center">
        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        <p className="text-slate-600 font-medium text-sm">Auditando llamada con IA...</p>
        <p className="text-slate-400 text-xs">Analizando transcripción, empatía y evidencia textual</p>
      </div>
    );
  }

  if (!analysis) return null;

  const isDemo = (analysis as any)._demo === true;
  const cats = analysis.categorias;

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      {isDemo && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex gap-2 items-start">
          <span className="text-amber-500 flex-shrink-0">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Modo demo</strong> — análisis automático sin IA.
            Agrega <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> en Vercel para auditoría real.
          </p>
        </div>
      )}

      {/* 1. Estado Final */}
      {analysis.estadoFinal && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado Final:</span>
          <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">
            {analysis.estadoFinal}
          </span>
        </div>
      )}

      {/* 2. Calificación General */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Resultado General</p>
        <div className="flex items-center gap-5">
          <div className="text-center flex-shrink-0">
            <p className={`text-6xl font-black leading-none ${GLOBAL_COLOR(analysis.calificacionFinal)}`}>
              {analysis.calificacionFinal}
            </p>
            <p className="text-xs text-slate-400 font-bold mt-1">/100</p>
          </div>
          <div className="flex-1 space-y-2">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${DICTAMEN_STYLE[analysis.dictamen] ?? ''}`}>
              {analysis.dictamen}
            </span>
            <p className="text-slate-700 text-sm leading-relaxed">{analysis.resumenEjecutivo}</p>
          </div>
        </div>
      </div>

      {/* 3. Fortalezas */}
      {analysis.fortalezas?.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Fortalezas
          </p>
          <ul className="space-y-3">
            {analysis.fortalezas.map((f: any, i: number) => (
              <li key={i} className="space-y-0.5">
                <p className="text-sm text-emerald-900 flex gap-2">
                  <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                  {typeof f === 'string' ? f : f.punto}
                </p>
                {f.evidencia && (
                  <p className="text-xs text-emerald-700 italic ml-5 bg-emerald-100/60 px-2 py-1 rounded">
                    "{f.evidencia}"
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Oportunidades de Mejora */}
      {analysis.oportunidadesMejora?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Oportunidades de Mejora
          </p>
          <ul className="space-y-3">
            {analysis.oportunidadesMejora.map((o: any, i: number) => (
              <li key={i} className="space-y-1">
                <p className="text-sm text-amber-900 flex gap-2">
                  <span className="text-amber-600 font-bold flex-shrink-0">{i + 1}.</span>
                  {typeof o === 'string' ? o : o.punto}
                </p>
                {o.evidencia && (
                  <p className="text-xs text-amber-700 italic ml-5 bg-amber-100/60 px-2 py-1 rounded">
                    "{o.evidencia}"
                  </p>
                )}
                {o.sugerencia && (
                  <p className="text-xs text-amber-800 ml-5 bg-amber-200/50 border border-amber-300 px-2 py-1.5 rounded flex gap-1.5 items-start">
                    <Lightbulb className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    {o.sugerencia}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Evaluación por Categoría */}
      {cats && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Evaluación por Categoría</p>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(CATEGORY_LABEL) as string[]).map((id) =>
              cats[id as keyof typeof cats] ? (
                <CategoryCard key={id} id={id} data={cats[id as keyof typeof cats]} />
              ) : null
            )}
          </div>
        </div>
      )}

      {/* 6. Riesgos Detectados */}
      {analysis.riesgosDetectados?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Riesgos Detectados
          </p>
          <ul className="space-y-1">
            {analysis.riesgosDetectados.map((r: string, i: number) => (
              <li key={i} className="text-sm text-red-900 flex gap-2">
                <span className="text-red-500 font-bold flex-shrink-0">!</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. Coaching */}
      {(analysis.coaching || (analysis as any).coachingRecomendado) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Coaching
          </p>
          <p className="text-sm text-blue-900 leading-relaxed">
            {analysis.coaching ?? (analysis as any).coachingRecomendado}
          </p>
        </div>
      )}

      {/* 8. Veredicto Final */}
      {analysis.veredictoFinal && (
        <div className="bg-slate-800 text-white rounded-xl p-4">
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Star className="w-3 h-3" /> Veredicto Final
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">{analysis.veredictoFinal}</p>
        </div>
      )}
    </div>
  );
}
