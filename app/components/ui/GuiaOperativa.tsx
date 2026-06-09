'use client';
import React from 'react';
import { AlertCircle } from 'lucide-react';

export function GuiaOperativa({ children }: { children: React.ReactNode }) {
  return (
    <div className="guia-operativa">
      <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
      <div className="font-medium leading-relaxed">{children}</div>
    </div>
  );
}
