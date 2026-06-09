'use client';
import React from 'react';
import { PlayCircle } from 'lucide-react';

export function ScriptBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="script-block">
      <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs mb-4 uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-full">
        <PlayCircle className="w-4 h-4 inline mr-1" /> Lee con tono consultivo
      </div>
      <p className="text-slate-800 text-[1.15rem] leading-relaxed font-medium whitespace-pre-wrap">
        {children}
      </p>
    </div>
  );
}
