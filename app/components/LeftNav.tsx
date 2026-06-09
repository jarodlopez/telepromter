'use client';
import React from 'react';
import { Clock, User, MessageSquare, Shield, FileText, CheckCircle2, Settings, BookOpen } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const tipoLabel: Record<string, { label: string; color: string }> = {
  upper: { label: '⚡ UPPER', color: 'bg-indigo-600' },
  gancho: { label: '🎣 Gancho', color: 'bg-emerald-600' },
  expirado: { label: '🔄 Expirado', color: 'bg-orange-600' },
  longtrack: { label: '✅ Long Track', color: 'bg-teal-600' },
};

export function LeftNav() {
  const { crmData, step, setStep, callDuration } = useTeleprompterStore();
  const isLongTrack = crmData.tipoLead === 'longtrack';

  const stepLabels = isLongTrack
    ? [
        { id: 1, title: 'Saludo', icon: User },
        { id: 2, title: 'Sondeo', icon: MessageSquare },
        { id: 3, title: 'Validar CURP', icon: Shield },
        { id: 4, title: 'Docs / Dudas', icon: FileText },
        { id: 5, title: 'Cierre', icon: CheckCircle2 },
        { id: 6, title: 'Seguimiento', icon: Settings },
      ]
    : [
        { id: 1, title: 'Saludo', icon: User },
        { id: 2, title: 'Sondeo', icon: MessageSquare },
        { id: 3, title: 'Pitch Oferta', icon: BookOpen },
        { id: 4, title: 'Educar Docs', icon: FileText },
        { id: 5, title: 'Cierre', icon: CheckCircle2 },
        { id: 6, title: 'Seguimiento', icon: Settings },
      ];

  const getStepClass = (id: number) => {
    if (step === id) return 'step-button-active';
    if (step > id) return 'step-button-completed';
    return 'step-button';
  };

  const tipo = tipoLabel[crmData.tipoLead];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex-col shadow-2xl z-20 hidden lg:flex border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 bg-slate-950">
        <h1 className="font-black text-white text-xl tracking-tight">MultiMoney Teleprompter</h1>
        <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase mt-1">Mayo 2026</p>
      </div>

      <div className="px-5 py-3 border-b border-slate-800">
        <span className={`text-xs font-black text-white px-3 py-1 rounded-full ${tipo?.color}`}>
          {tipo?.label}
        </span>
        <p className="text-slate-400 text-xs mt-1 truncate font-medium">
          {crmData.cliente || 'Sin cliente'}
        </p>
        <p className="text-indigo-300 text-xs font-bold">
          ${crmData.monto || '—'} · {crmData.tasa || '—'} · ${crmData.cuota || '—'}
        </p>
      </div>

      <div className="p-5 border-b border-slate-800 flex flex-col items-center justify-center bg-slate-900/80">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Duración</span>
        <span className="text-3xl font-mono text-emerald-400 font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" /> {formatTime(callDuration)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {stepLabels.map((s) => (
          <button key={s.id} onClick={() => setStep(s.id)} className={getStepClass(s.id)}>
            <s.icon className="w-5 h-5" />
            <span>
              {s.id}. {s.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
