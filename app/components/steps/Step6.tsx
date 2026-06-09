'use client';
import React from 'react';
import { Settings, CheckSquare, Copy } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { getSeguimientoText } from '@/lib/scripts';
import { GuiaOperativa } from '../ui/GuiaOperativa';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function Step6() {
  const {
    crmData,
    callData,
    setCallData,
    checklist,
    setChecklist,
    callDuration,
    resetAll,
    showToast,
    confirmingReset,
    setConfirmingReset,
  } = useTeleprompterStore();

  const isLongTrack = crmData.tipoLead === 'longtrack';

  const generarNota = () => {
    const nota = `--- AUDITORÍA: LLAMADA MULTIMONEY ---
👤 Cliente: ${crmData.cliente} | Base: ${crmData.tipoLead.toUpperCase()}
💼 Perfil: Ingresos $${crmData.ingresos || 'N/D'} | Ocupación: ${crmData.ocupacion || 'N/D'}
🎯 Destino del crédito: ${callData.motivo || 'No especificado'}
💰 Oferta Presentada: $${crmData.monto} | Tasa: ${crmData.tasa} | Cuota: $${crmData.cuota} | Plazo: ${crmData.plazo} meses
🛡️ Objeciones manejadas (REA): ${callData.objecionesRebatidas}/3
⏱️ Duración de llamada: ${formatTime(callDuration)}
📞 Referencias:
   - Familiar: ${callData.refFamiliar || 'Pendiente'}
   - Conocido: ${callData.refAmistad || 'Pendiente'}
${isLongTrack ? `✅ CURP Validada: ${callData.curpValidada ? 'Sí' : 'Pendiente'}\n` : ''}📅 Seguimiento: ${callData.fechaSeguimiento || 'Cerrado o No aplica'}
✅ Checklist CRM: ${checklist.tarea && checklist.estatus && checklist.nota ? 'Completado' : 'Incompleto'}
-------------------------------------`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(nota)
        .then(() => showToast('Nota copiada al portapapeles. Pégala en el CRM.', 'success'))
        .catch(() =>
          showToast('No se pudo copiar automáticamente. Selecciona y copia manualmente.', 'error')
        );
    } else {
      showToast('Tu navegador no soporta copia automática. Copia manualmente.', 'info');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
        <Settings className="w-6 h-6 text-indigo-600" /> 6. Seguimiento y Registro CRM
      </h2>
      <GuiaOperativa>
        Documenta <strong>SIEMPRE</strong> la llamada en el CRM, independientemente del resultado, para
        trazabilidad y auditoría de calidad.
      </GuiaOperativa>

      <div className="card-base mb-6">
        <h3 className="font-bold text-slate-800 mb-3 text-lg border-b pb-2">
          Si el cliente NO cerró hoy:
        </h3>
        <p className="text-slate-600 mb-4 font-medium italic">"{getSeguimientoText()}"</p>
        <input
          type="text"
          value={callData.fechaSeguimiento}
          onChange={(e) => setCallData({ fechaSeguimiento: e.target.value })}
          placeholder="Ej. Mañana a las 16:00 hrs"
          className="input-standard"
        />
      </div>

      <div className="bg-indigo-900 text-white p-8 rounded-xl shadow-lg border border-indigo-800">
        <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-indigo-300">
          <CheckSquare className="w-6 h-6" /> Tareas Administrativas Finales
        </h3>
        <div className="space-y-4 mb-8">
          {[
            { key: 'tarea' as const, label: 'Generé la Tarea de seguimiento en el CRM' },
            { key: 'estatus' as const, label: 'Tipifiqué la etapa correcta del embudo' },
            { key: 'nota' as const, label: 'Llené todos los datos en esta App' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-4 cursor-pointer group bg-indigo-800/50 p-3 rounded-lg hover:bg-indigo-800 transition"
            >
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={(e) => setChecklist({ [item.key]: e.target.checked })}
                className="w-6 h-6 rounded text-indigo-500 bg-slate-800 border-slate-600"
              />
              <span className="text-slate-200 font-medium">{item.label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={generarNota}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-4 rounded-xl flex justify-center items-center gap-2 transition shadow-lg shadow-emerald-500/20 text-lg"
        >
          <Copy className="w-6 h-6" /> Copiar Nota Estructurada
        </button>

        {confirmingReset ? (
          <div className="mt-4 bg-slate-800 rounded-xl p-4 text-center">
            <p className="text-slate-300 font-medium mb-3 text-sm">
              ¿Finalizar llamada y comenzar una nueva?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmingReset(false); resetAll(); }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg transition text-sm"
              >
                Sí, finalizar
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingReset(true)}
            className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition"
          >
            🔄 Finalizar y Nueva Llamada
          </button>
        )}
      </div>
    </div>
  );
}
