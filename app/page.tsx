'use client';

import React, { useEffect, useRef } from 'react';
import {
  Clock,
  Shield,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  User,
  MessageSquare,
  BookOpen,
  FileText,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { SetupScreen } from '@/app/components/SetupScreen';
import { LeftNav } from '@/app/components/LeftNav';
import { RightPanel } from '@/app/components/RightPanel';
import { Toast } from '@/app/components/ui/Toast';
import { Step1 } from '@/app/components/steps/Step1';
import { Step2 } from '@/app/components/steps/Step2';
import { Step3 } from '@/app/components/steps/Step3';
import { Step4 } from '@/app/components/steps/Step4';
import { Step5 } from '@/app/components/steps/Step5';
import { Step6 } from '@/app/components/steps/Step6';

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

export default function App() {
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    appState,
    step,
    setStep,
    callDuration,
    incrementCallDuration,
    isMobileToolsOpen,
    setIsMobileToolsOpen,
    crmData,
  } = useTeleprompterStore();

  const isLongTrack = crmData.tipoLead === 'longtrack';

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (appState === 'call') {
      interval = setInterval(() => incrementCallDuration(), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [appState, incrementCallDuration]);

  // Auto-scroll on step change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // Keyboard navigation — ← → to move between steps (ignored when typing in inputs)
  useEffect(() => {
    if (appState !== 'call') return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' && step < 6) setStep(step + 1);
      if (e.key === 'ArrowLeft' && step > 1) setStep(step - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [appState, step, setStep]);

  if (appState === 'setup') {
    return (
      <>
        <SetupScreen />
        <Toast />
      </>
    );
  }

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

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      case 5: return <Step5 />;
      case 6: return <Step6 />;
      default: return <Step1 />;
    }
  };

  const tipo = tipoLabel[crmData.tipoLead];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans overflow-hidden">
      <LeftNav />

      {/* ÁREA CENTRAL */}
      <div className="flex-1 flex flex-col h-screen relative bg-slate-50">

        {/* Header Mobile */}
        <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-30">
          <h1 className="font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> Teleprompter
          </h1>
          <div className="flex gap-3 items-center">
            <span className={`text-xs font-black text-white px-2 py-0.5 rounded-full ${tipo?.color}`}>
              {tipo?.label}
            </span>
            <span className="font-mono text-emerald-400 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" /> {formatTime(callDuration)}
            </span>
            <button
              onClick={() => setIsMobileToolsOpen(true)}
              className="bg-slate-700 px-3 py-1 rounded text-sm font-bold flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" /> Ayuda
            </button>
          </div>
        </div>

        {/* Selector pasos mobile — con títulos */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-2 flex gap-1 overflow-x-auto">
          {stepLabels.map(({ id, title }) => (
            <button
              key={id}
              onClick={() => setStep(id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-bold text-xs transition whitespace-nowrap ${
                step === id
                  ? 'bg-indigo-600 text-white'
                  : step > id
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {id}. {title}
            </button>
          ))}
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto p-5 md:p-10 pb-32">
          <div className="max-w-3xl mx-auto">
            {/* Barra de progreso */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-8 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>

            {renderStep()}

            {/* Navegación */}
            <div className="mt-10 flex justify-between items-center border-t border-slate-200 pt-8">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" /> Anterior
              </button>
              <span className="text-xs text-slate-400 font-medium hidden lg:block">← → para navegar</span>
              <button
                onClick={() => { if (step < 6) setStep(step + 1); }}
                disabled={step === 6}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente Paso <ChevronRight className="w-5 h-5 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {isMobileToolsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileToolsOpen(false)}
        />
      )}

      <RightPanel />
      <Toast />
    </div>
  );
}
