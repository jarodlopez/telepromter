'use client';
import React from 'react';
import { FileText } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { getEducacionText } from '@/lib/scripts';
import { ScriptBlock } from '../ui/ScriptBlock';
import { GuiaOperativa } from '../ui/GuiaOperativa';

export function Step4() {
  const { crmData } = useTeleprompterStore();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
        <FileText className="w-6 h-6 text-indigo-600" /> 4. Educación de Documentos
      </h2>
      <GuiaOperativa>
        Haz el proceso de carga <strong>en línea con el cliente siempre que sea posible</strong>. Si no tiene
        los documentos a la mano, explica los requisitos a detalle para evitar rechazos en Riesgo. Sé muy
        preciso con CFE/Telmex y la selfie.
      </GuiaOperativa>
      <ScriptBlock>{getEducacionText()}</ScriptBlock>

      {crmData.tipoLead === 'longtrack' && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-4 text-teal-900 text-sm font-medium">
          ✅ <strong>Long Track:</strong> El cliente ya subió sus documentos. Este paso es para resolver
          dudas adicionales sobre pagos, fechas y ampliaciones —{' '}
          <strong>no solicitar docs de nuevo</strong>.
        </div>
      )}
    </div>
  );
}
