'use client';
import React from 'react';
import { Target } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { getGreetingText } from '@/lib/scripts';
import { ScriptBlock } from '../ui/ScriptBlock';
import { GuiaOperativa } from '../ui/GuiaOperativa';
import { BeneficiosBadge } from '../ui/BeneficiosBadge';

const guias: Record<string, string> = {
  upper:
    'Tono seguro y cálido. Verifica identidad, notifica grabación y abre con pregunta de intención. Espera la respuesta del cliente antes de continuar.',
  gancho:
    'Tono entusiasta pero profesional. Referencia la nota previa en el CRM para personalizar la apertura. Espera respuesta antes de pasar a beneficios.',
  expirado:
    'Tono empático. El cliente dejó pasar el crédito antes — reconócelo sin juzgar. La clave es actualizar su situación actual para reencuadrar la oferta.',
  longtrack:
    'El cliente YA completó biométricos. Este paso es breve — solo confirmar identidad, notificar grabación y conocer el uso del crédito antes de avanzar al cierre.',
};

export function Step1() {
  const { crmData } = useTeleprompterStore();
  const { tipoLead, cliente, asesor } = crmData;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
        <Target className="w-6 h-6 text-indigo-600" /> 1. Saludo y Transición
      </h2>
      <GuiaOperativa>{guias[tipoLead]}</GuiaOperativa>
      <ScriptBlock>{getGreetingText(cliente, tipoLead, asesor)}</ScriptBlock>
      {tipoLead !== 'longtrack' && <BeneficiosBadge />}
    </div>
  );
}
