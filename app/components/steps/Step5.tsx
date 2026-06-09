'use client';
import React from 'react';
import { CheckCircle2, User } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { getCierreText, getNoAplicaText } from '@/lib/scripts';
import { ScriptBlock } from '../ui/ScriptBlock';
import { GuiaOperativa } from '../ui/GuiaOperativa';

export function Step5() {
  const { crmData, callData, setCallData } = useTeleprompterStore();
  const { cliente, monto, cuota, plazo, fechaPrimerPago } = crmData;
  const { motivo, refFamiliar, refAmistad } = callData;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
        <CheckCircle2 className="w-6 h-6 text-indigo-600" /> 5. Cierre y Referencias
      </h2>
      <GuiaOperativa>
        Las 2 referencias telefónicas son <strong>OBLIGATORIAS</strong> para el equipo de Riesgo. No puedes
        colgar sin ellas. Si el cliente duda, vuelve a destacar la rapidez del depósito.
      </GuiaOperativa>

      <ScriptBlock>
        {getCierreText(cliente, motivo, monto, cuota, plazo, fechaPrimerPago)}
      </ScriptBlock>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
        <div className="card-base">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
            <User className="w-4 h-4 text-indigo-500" /> 1. Referencia Familiar
          </label>
          <input
            type="text"
            value={refFamiliar}
            onChange={(e) => setCallData({ refFamiliar: e.target.value })}
            placeholder="Nombre completo y Teléfono"
            className="input-standard"
          />
        </div>
        <div className="card-base">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
            <User className="w-4 h-4 text-indigo-500" /> 2. Amistad o Conocido
          </label>
          <input
            type="text"
            value={refAmistad}
            onChange={(e) => setCallData({ refAmistad: e.target.value })}
            placeholder="Nombre completo y Teléfono"
            className="input-standard"
          />
        </div>
      </div>

      <ScriptBlock>
        Perfecto. Con esta información envío tu expediente a Riesgo. En breve recibirás un mensaje con la
        liga segura para subir tu documentación biométrica.
      </ScriptBlock>

      <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
          ⚠️ Si el cliente NO APLICA (rechazado por Riesgo)
        </p>
        <p className="text-sm text-red-800 italic leading-relaxed">
          "{getNoAplicaText(cliente)}"
        </p>
      </div>
    </div>
  );
}
