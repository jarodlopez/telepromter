'use client';
import React from 'react';
import { Zap } from 'lucide-react';
import { getBeneficiosText } from '@/lib/scripts';

export function BeneficiosBadge() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
      <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-1">
        <Zap className="w-3 h-3" /> Recordatorio de beneficios
      </p>
      <p className="text-sm text-emerald-900 whitespace-pre-line leading-relaxed">
        {getBeneficiosText()}
      </p>
    </div>
  );
}
