'use client';
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { ScriptBlock } from '../ui/ScriptBlock';
import { GuiaOperativa } from '../ui/GuiaOperativa';
import { SondeoPreguntas } from '../ui/SondeoPreguntas';

export function Step2() {
  const { crmData, callData, setCallData } = useTeleprompterStore();
  const { tipoLead, ingresos, ocupacion } = crmData;
  const { motivo } = callData;
  const isRecontact = tipoLead === 'gancho' || tipoLead === 'expirado';

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-indigo-600" /> 2. Sondeo y Perfilamiento
      </h2>

      {isRecontact ? (
        <GuiaOperativa>
          Este cliente ya tuvo contacto previo. Enfócate en descubrir <strong>qué cambió</strong> desde entonces
          y <strong>qué urgencia tiene hoy</strong>. Usa esa información en el pitch.
        </GuiaOperativa>
      ) : (
        <GuiaOperativa>
          Evita preguntar "¿cuánto necesita?". Indaga el propósito real para usarlo como anclaje emocional en el cierre.
        </GuiaOperativa>
      )}

      <SondeoPreguntas tipoLead={tipoLead} />

      {tipoLead !== 'longtrack' && (
        <>
          <ScriptBlock>
            Perfecto. Revisando tu perfil para agilizar el proceso, nos indicaste ingresos aproximados de{' '}
            <strong>${ingresos || '[Ingresos]'}</strong> y que te desempeñas como{' '}
            <strong>{ocupacion || '[Ocupación]'}</strong>. ¿Esta información sigue vigente?
            {'\n\n'}
            Comprendo. Para asegurarme de que esta línea se adapte a lo que buscas, ¿tienes pensado utilizar
            este crédito para consolidar alguna deuda actual o tienes algún proyecto específico en mente?
          </ScriptBlock>

          <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner mb-6">
            <label className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Registra el propósito del crédito
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setCallData({ motivo: e.target.value })}
              placeholder="Ej. Consolidar tarjetas, Remodelación, Capital de trabajo, Emergencia médica..."
              className="input-standard h-24 resize-none"
            />
          </div>

          {motivo && (
            <ScriptBlock>
              Entiendo el objetivo de{' '}
              <strong className="text-indigo-700">{motivo}</strong>. Y cuéntame, ¿actualmente manejas
              tarjetas de crédito o algún otro préstamo bancario?
            </ScriptBlock>
          )}
        </>
      )}

      {tipoLead === 'longtrack' && (
        <div className="mt-4 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner">
          <label className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-indigo-500" /> Uso declarado del crédito
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setCallData({ motivo: e.target.value })}
            placeholder="Anota el uso que el cliente mencionó..."
            className="input-standard h-20 resize-none"
          />
        </div>
      )}
    </div>
  );
}
