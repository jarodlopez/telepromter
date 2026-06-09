'use client';
import React from 'react';
import { Shield, X, ChevronRight } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { objecionesData } from '@/lib/objeciones';
import { faqData } from '@/lib/faq';
import { Transcriptor } from './Transcriptor';

export function RightPanel() {
  const {
    activeToolTab,
    setActiveToolTab,
    activeObjection,
    setActiveObjection,
    activeFaq,
    setActiveFaq,
    callData,
    setCallData,
    isMobileToolsOpen,
    setIsMobileToolsOpen,
  } = useTeleprompterStore();

  const registrarObjecion = () => {
    if (callData.objecionesRebatidas < 3) {
      setCallData({ objecionesRebatidas: callData.objecionesRebatidas + 1 });
    }
  };

  return (
    <div
      className={`fixed lg:static inset-y-0 right-0 w-80 lg:w-96 bg-white shadow-2xl lg:shadow-none lg:border-l border-slate-200 z-40 transform transition-transform duration-300 flex flex-col ${
        isMobileToolsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" /> Centro de Apoyo
        </h2>
        <button
          className="lg:hidden p-1 bg-slate-800 rounded"
          onClick={() => setIsMobileToolsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        {([
          { key: 'objeciones', label: '🛡️ REA' },
          { key: 'faq', label: '❓ FAQ' },
          { key: 'transcripcion', label: '🎙️ Transcripción' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveToolTab(key)}
            className={`flex-1 py-3 text-xs font-bold transition ${
              activeToolTab === key
                ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
        {activeToolTab === 'transcripcion' && <Transcriptor />}

        {activeToolTab !== 'transcripcion' && (
        <div className="p-4 flex-1">
        {activeToolTab === 'objeciones' && (
          <div className="animate-fade-in space-y-4">
            <div className="card-base flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">Rebotes (Mín 3)</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">
                  Calidad Playbook
                </p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      callData.objecionesRebatidas >= i
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest text-center mt-2">
              Selecciona la objeción del cliente:
            </p>

            {objecionesData.map((obj) => (
              <div key={obj.id} className="card-base !p-0 overflow-hidden">
                <button
                  onClick={() => setActiveObjection(activeObjection === obj.id ? null : obj.id)}
                  className="w-full p-4 text-left font-bold text-slate-700 hover:bg-indigo-50 transition flex justify-between items-center"
                >
                  <span className="text-sm">{obj.title}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${
                      activeObjection === obj.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {activeObjection === obj.id && (
                  <div className="p-4 pt-0 bg-indigo-50/30 border-t border-slate-100 space-y-3">
                    <p className="text-sm text-slate-700">
                      <strong className="text-indigo-600 block mb-1">R: Reconoce</strong>
                      {obj.r}
                    </p>
                    <p className="text-sm text-slate-700">
                      <strong className="text-indigo-600 block mb-1">E: Empatiza</strong>
                      {obj.e}
                    </p>
                    <p className="text-sm text-slate-700">
                      <strong className="text-emerald-600 block mb-1">A: Asegura</strong>
                      {obj.a}
                    </p>
                    {obj.tips && obj.tips.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                        <p className="text-xs font-bold text-amber-700 uppercase mb-2">💡 Tips</p>
                        <ul className="text-xs text-amber-900 space-y-1">
                          {obj.tips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={registrarObjecion}
                      className="w-full mt-3 bg-slate-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition"
                    >
                      + Sumar Objeción Rebatida
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeToolTab === 'faq' && (
          <div className="animate-fade-in space-y-3">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest text-center mb-4 mt-2">
              Respuestas rápidas:
            </p>
            {faqData.map((faq, idx) => (
              <div key={idx} className="card-base !p-0 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-700 hover:bg-indigo-50 transition flex justify-between items-start gap-3 text-sm"
                >
                  <span className="flex-1">
                    <span className="mr-2">{faq.icon}</span>
                    {faq.q}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      activeFaq === idx ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="p-4 pt-0 bg-indigo-50/30 border-t border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
        )}
      </div>
    </div>
  );
}
