'use client';
import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />,
};

const borders = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
  info: 'border-indigo-500/30',
};

export function Toast() {
  const { toast, clearToast } = useTeleprompterStore();

  if (!toast) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border bg-slate-800 shadow-2xl animate-fade-in ${borders[toast.type]}`}>
      {icons[toast.type]}
      <span className="text-white font-medium text-sm">{toast.message}</span>
      <button onClick={clearToast} className="ml-2 text-slate-400 hover:text-white transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
