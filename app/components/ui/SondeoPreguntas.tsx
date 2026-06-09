'use client';
import React from 'react';
import { List } from 'lucide-react';
import { getSondeoPreguntas } from '@/lib/scripts';

export function SondeoPreguntas({ tipoLead }: { tipoLead: 'upper' | 'gancho' | 'expirado' | 'longtrack' }) {
  const preguntas = getSondeoPreguntas(tipoLead);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-1">
        <List className="w-3 h-3" /> Preguntas clave de perfilamiento
      </p>
      <ul className="space-y-2">
        {preguntas.map((p, i) => (
          <li key={i} className="text-sm text-slate-700 flex gap-2">
            <span className="text-indigo-400 font-bold flex-shrink-0">→</span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
