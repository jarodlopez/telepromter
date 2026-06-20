'use client';
import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { getAnalyses, type AnalysisRecord } from '@/lib/firestore';
import { PostCallAnalysis } from '@/app/components/PostCallAnalysis';
import { Loader2, ChevronDown, ChevronUp, Calendar, User as UserIcon } from 'lucide-react';

const DICTAMEN_STYLE: Record<string, string> = {
  Excelente:         'bg-emerald-100 text-emerald-800',
  Bueno:             'bg-blue-100 text-blue-800',
  Aceptable:         'bg-yellow-100 text-yellow-800',
  'Requiere Mejora': 'bg-orange-100 text-orange-800',
  Crítico:           'bg-red-100 text-red-800',
};

const TIPO_LEAD_LABEL: Record<string, string> = {
  upper:    '⚡ Upper',
  gancho:   '🎣 Gancho',
  expirado: '🔄 Expirado',
  longtrack:'✅ Long Track',
};

const SCORE_COLOR = (n: number) =>
  n >= 80 ? 'text-emerald-400' : n >= 60 ? 'text-amber-400' : 'text-red-400';

interface Props {
  user: User;
  refreshKey: number;
}

export default function HistorialTab({ user, refreshKey }: Props) {
  const [records,     setRecords]     = useState<AnalysisRecord[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [expandedId,  setExpandedId]  = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getAnalyses(user.uid)
      .then((data) => { if (!cancelled) setRecords(data); })
      .catch((e) => { if (!cancelled) setError(e.message ?? 'Error al cargar historial.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user.uid, refreshKey]);

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">Cargando historial...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-4 text-red-400 text-sm">
      {error}
    </div>
  );

  if (!records.length) return (
    <div className="text-center py-20 text-slate-500 text-sm">
      No hay análisis guardados aún. Realiza tu primer análisis en la pestaña <strong>Nuevo Análisis</strong>.
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
        {records.length} análisis registrados
      </p>

      {records.map((rec) => {
        const isOpen  = expandedId === rec.id;
        const fecha   = rec.timestamp?.toDate?.()?.toLocaleDateString('es-MX', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        }) ?? '—';
        const score   = rec.analysis.calificacionFinal ?? 0;
        const dictamen = rec.analysis.dictamen ?? '—';

        return (
          <div
            key={rec.id}
            className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden"
          >
            {/* Row header */}
            <button
              onClick={() => setExpandedId(isOpen ? null : rec.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-700/50 transition"
            >
              {/* Score */}
              <div className="text-center flex-shrink-0 w-12">
                <p className={`text-2xl font-black leading-none ${SCORE_COLOR(score)}`}>{score}</p>
                <p className="text-slate-500 text-[10px] font-bold">/100</p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${DICTAMEN_STYLE[dictamen] ?? 'bg-slate-700 text-slate-300'}`}>
                    {dictamen}
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                    {TIPO_LEAD_LABEL[rec.tipoLead] ?? rec.tipoLead}
                  </span>
                  {rec.analysis.tipoInteraccion && (
                    <span className="text-[11px] text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded-full">
                      {rec.analysis.tipoInteraccion}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    {rec.cliente || '—'} · {rec.asesor || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {fecha}
                  </span>
                </div>
              </div>

              {/* Expand icon */}
              <div className="text-slate-400 flex-shrink-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Expanded analysis */}
            {isOpen && (
              <div className="border-t border-slate-700 px-5 pb-5 bg-slate-50">
                <div className="[&_.mt-6]:mt-4">
                  <PostCallAnalysis analysis={rec.analysis} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
