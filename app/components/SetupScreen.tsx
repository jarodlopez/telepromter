'use client';
import React from 'react';
import { Phone, User, Target, FileText, Settings } from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';

export function SetupScreen() {
  const { crmData, setCrmData, setAppState, resetCallDuration, showToast } = useTeleprompterStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'tipoLead') {
      setCrmData({ tipoLead: value as 'upper' | 'gancho' | 'expirado' | 'longtrack' });
    } else {
      setCrmData({ [name]: value });
    }
  };

  const iniciarLlamada = () => {
    if (!crmData.cliente || !crmData.monto) {
      showToast('Ingresa al menos el Nombre del Cliente y el Monto para iniciar.', 'error');
      return;
    }
    setAppState('call');
    resetCallDuration();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-900 p-8 text-white flex items-center gap-4">
          <Settings className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MultiMoney Teleprompter</h1>
            <p className="text-indigo-300 text-sm mt-1">
              Preparación de Llamada — Script Mayo 2026 | MultiMoney MX
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna 1 */}
            <div className="space-y-5">
              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                <User className="w-5 h-5" /> Datos de la Llamada
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Tu Nombre (Asesor)</label>
                <input
                  type="text"
                  name="asesor"
                  value={crmData.asesor}
                  onChange={handleChange}
                  placeholder="Ej. Alejandro"
                  className="input-standard"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Cliente</label>
                <input
                  type="text"
                  name="cliente"
                  value={crmData.cliente}
                  onChange={handleChange}
                  placeholder="Ej. Roberto"
                  className="input-standard"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Etapa / Tipo de Lead</label>
                <select
                  name="tipoLead"
                  value={crmData.tipoLead}
                  onChange={handleChange}
                  className="input-standard"
                >
                  <option value="upper">⚡ UPPER — Solicitud Nueva</option>
                  <option value="gancho">🎣 Gancho — Oferta Mejorada</option>
                  <option value="expirado">🔄 Expirado — Reactivar Solicitud</option>
                  <option value="longtrack">✅ Long Track — Biométrico Completado</option>
                </select>
              </div>

              {crmData.tipoLead === 'longtrack' && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800 font-medium">
                  ℹ️ El cliente ya completó el proceso biométrico. Este script se enfoca en{' '}
                  <strong>validación de datos, cierre y referencias</strong>.
                </div>
              )}
            </div>

            {/* Columna 2 */}
            <div className="space-y-5">
              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                <Target className="w-5 h-5" /> Condiciones de Crédito
              </h3>

              <div>
                <label className="text-xs font-bold text-indigo-600 uppercase">Monto Aprobado</label>
                <input
                  type="text"
                  name="monto"
                  value={crmData.monto}
                  onChange={handleChange}
                  placeholder="Ej. 150,000"
                  className="input-highlight"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tasa Asignada</label>
                  <input
                    type="text"
                    name="tasa"
                    value={crmData.tasa}
                    onChange={handleChange}
                    placeholder="Ej. 3.5%"
                    className="input-standard"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cuota Mensual</label>
                  <input
                    type="text"
                    name="cuota"
                    value={crmData.cuota}
                    onChange={handleChange}
                    placeholder="Ej. 4,200"
                    className="input-standard"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Plazo (meses)</label>
                  <input
                    type="text"
                    name="plazo"
                    value={crmData.plazo}
                    onChange={handleChange}
                    placeholder="60"
                    className="input-standard"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">1er Fecha de Pago</label>
                  <input
                    type="text"
                    name="fechaPrimerPago"
                    value={crmData.fechaPrimerPago}
                    onChange={handleChange}
                    placeholder="DD/MM/AAAA"
                    className="input-standard"
                  />
                </div>
              </div>

              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2 mt-6">
                <FileText className="w-5 h-5" /> Perfil Financiero
              </h3>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ingresos CRM</label>
                  <input
                    type="text"
                    name="ingresos"
                    value={crmData.ingresos}
                    onChange={handleChange}
                    placeholder="$25,000"
                    className="input-standard"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ocupación</label>
                  <input
                    type="text"
                    name="ocupacion"
                    value={crmData.ocupacion}
                    onChange={handleChange}
                    placeholder="Ej. Docente"
                    className="input-standard"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={iniciarLlamada}
              className="w-full flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-6 px-4 transition shadow-md"
            >
              <Phone className="w-7 h-7" />
              <span className="text-base">Iniciar Llamada</span>
              <span className="text-xs text-indigo-300 font-normal">Script + Teleprompter en vivo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
