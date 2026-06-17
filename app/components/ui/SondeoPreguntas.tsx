'use client';
import React from 'react';
import { List, Lightbulb } from 'lucide-react';
import { getSondeoPreguntas } from '@/lib/scripts';

export function SondeoPreguntas({ tipoLead }: { tipoLead: 'upper' | 'gancho' | 'expirado' | 'longtrack' }) {
  const preguntas = getSondeoPreguntas(tipoLead);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-1">
        <List className="w-3 h-3" /> Preguntas clave de perfilamiento
      </p>
      <ul className="space-y-4">
        {preguntas.map((p, i) => (
          <li key={i} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0">
                {p.objetivo}
              </span>
            </div>
            <p className="text-sm text-slate-800 flex gap-2 leading-relaxed">
              <span className="text-indigo-400 font-bold flex-shrink-0">→</span>
              <span className="font-medium">{p.pregunta}</span>
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 flex gap-1.5 items-start leading-relaxed ml-5">
              <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
              {p.tecnica}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
