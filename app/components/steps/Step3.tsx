'use client';
import React from 'react';
import { Shield, BookOpen, AlertCircle } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { getPitchText, getLongTrackValidacionText } from '@/lib/scripts';
import { ScriptBlock } from '../ui/ScriptBlock';
import { GuiaOperativa } from '../ui/GuiaOperativa';

export function Step3() {
  const { crmData, callData, setCallData } = useTeleprompterStore();
  const { tipoLead, cliente, monto, tasa, cuota, plazo } = crmData;
  const { motivo, curpValidada } = callData;

  if (tipoLead === 'longtrack') {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" /> 3. Validación de Datos (CURP)
        </h2>
        <GuiaOperativa>
          Antes del cierre, valida que toda la información capturada en originación sea correcta. Usa{' '}
          <a
            href="https://www.gob.mx/curp/"
            target="_blank"
            rel="noreferrer"
            className="underline text-amber-700 font-bold"
          >
            gob.mx/curp
          </a>{' '}
          para verificar nombre completo, fecha y entidad de nacimiento.
        </GuiaOperativa>
        <ScriptBlock>{getLongTrackValidacionText()}</ScriptBlock>
        <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={curpValidada}
              onChange={(e) => setCallData({ curpValidada: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-500"
            />
            <span className="font-bold text-slate-700 text-sm">
              ✅ CURP, nombre, domicilio y empleo validados correctamente
            </span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-indigo-600" /> 3. Pitch de la Oferta
      </h2>
      <GuiaOperativa>
        Presenta condiciones de forma transparente: monto, tasa, cuota y plazo. El cliente valora la claridad.
        Si hay objeción, abre el <strong>Panel de Objeciones</strong> a tu derecha.
      </GuiaOperativa>

      <div className="flex gap-4 mb-6">
        <div className="stat-card text-white">
          <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">Monto Aprobado</p>
          <p className="text-2xl font-black text-white mt-1">${monto}</p>
        </div>
        <div className="card-base flex-1">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tasa / Cuota / Plazo</p>
          <p className="text-xl font-black text-indigo-900 mt-1">
            {tasa} / ${cuota} / {plazo} meses
          </p>
        </div>
      </div>

      <ScriptBlock>
        {getPitchText(cliente, monto, tasa, cuota, motivo, tipoLead)}
      </ScriptBlock>

      <div className="bg-indigo-50 p-4 rounded-lg text-indigo-800 text-sm font-medium border border-indigo-100 flex gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>
          Si el cliente <strong>no tiene la identificación a la mano</strong>, agenda seguimiento con fecha
          y hora concreta, y registra nota en HubSpot.
        </p>
      </div>
    </div>
  );
}
