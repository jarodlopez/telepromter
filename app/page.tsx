'use client';

import React, { useEffect, useRef } from 'react';
import {
  Phone,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Settings,
  Copy,
  Shield,
  Target,
  AlertCircle,
  FileText,
  Clock,
  PlayCircle,
  CheckSquare,
  X,
  BookOpen,
  Zap,
  List,
} from 'lucide-react';
import { useTeleprompterStore } from '@/lib/store';
import { objecionesData } from '@/lib/objeciones';
import { faqData } from '@/lib/faq';
import {
  getGreetingText,
  getBeneficiosText,
  getSondeoPreguntas,
  getPitchText,
  getEducacionText,
  getLongTrackValidacionText,
  getCierreText,
  getNoAplicaText,
  getSeguimientoText,
} from '@/lib/scripts';

export default function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const {
    appState,
    setAppState,
    step,
    setStep,
    callDuration,
    incrementCallDuration,
    resetCallDuration,
    crmData,
    setCrmData,
    callData,
    setCallData,
    checklist,
    setChecklist,
    activeToolTab,
    setActiveToolTab,
    activeObjection,
    setActiveObjection,
    activeFaq,
    setActiveFaq,
    isMobileToolsOpen,
    setIsMobileToolsOpen,
    resetAll,
  } = useTeleprompterStore();

  const isLongTrack = crmData.tipoLead === 'longtrack';

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (appState === 'call') {
      interval = setInterval(() => incrementCallDuration(), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [appState, incrementCallDuration]);

  // Auto-scroll al cambiar paso
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCrmChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'tipoLead') {
      setCrmData({ tipoLead: value as 'upper' | 'gancho' | 'expirado' | 'longtrack' });
    } else {
      setCrmData({ [name]: value });
    }
  };

  const handleCallChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCallData({ [e.target.name]: e.target.value });
  };

  const iniciarLlamada = () => {
    if (!crmData.cliente || !crmData.monto) {
      alert('Por favor, ingresa al menos el Nombre del Cliente y el Monto para iniciar.');
      return;
    }
    setAppState('call');
    resetCallDuration();
  };

  const registrarObjecion = () => {
    if (callData.objecionesRebatidas < 3) {
      setCallData({ objecionesRebatidas: callData.objecionesRebatidas + 1 });
    }
  };

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
      navigator.clipboard.writeText(nota)
        .then(() => alert('✅ Nota copiada al portapapeles. Pégala en el CRM.'))
        .catch(() => alert('No se pudo copiar automáticamente. Selecciona y copia manualmente.'));
    } else {
      alert('Tu navegador no soporta copia automática. Copia manualmente.');
    }
  };

  // ─── COMPONENTES DE BLOQUE ──────────────────────────────────────────────────

  const ScriptBlock = ({ children }: { children: React.ReactNode }) => (
    <div className="script-block">
      <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs mb-4 uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-full">
        <PlayCircle className="w-4 h-4 inline mr-1" /> Lee con tono consultivo
      </div>
      <p className="text-slate-800 text-[1.15rem] leading-relaxed font-medium whitespace-pre-wrap">
        {children}
      </p>
    </div>
  );

  const GuiaOperativa = ({ children }: { children: React.ReactNode }) => (
    <div className="guia-operativa">
      <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
      <div className="font-medium leading-relaxed">{children}</div>
    </div>
  );

  const BeneficiosBadge = () => (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
      <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-1">
        <Zap className="w-3 h-3" /> Recordatorio de beneficios
      </p>
      <p className="text-sm text-emerald-900 whitespace-pre-line leading-relaxed">
        {getBeneficiosText()}
      </p>
    </div>
  );

  const SondeoPreguntas = () => {
    const preguntas = getSondeoPreguntas(crmData.tipoLead);
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-1">
          <List className="w-3 h-3" /> Preguntas clave de perfilamiento
        </p>
        <ul className="space-y-2">
          {preguntas.map((p, i) => (
            <li key={i} className="text-sm text-slate-700 flex gap-2">
              <span className="text-indigo-400 font-bold flex-shrink-0">→</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // ─── PANTALLA DE CONFIGURACIÓN ──────────────────────────────────────────────

  if (appState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-indigo-900 p-8 text-white flex items-center gap-4">
            <Settings className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Teleprompter Elite</h1>
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
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Tu Nombre (Asesor)
                  </label>
                  <input
                    type="text"
                    name="asesor"
                    value={crmData.asesor}
                    onChange={handleCrmChange}
                    placeholder="Ej. Alejandro"
                    className="input-standard"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    name="cliente"
                    value={crmData.cliente}
                    onChange={handleCrmChange}
                    placeholder="Ej. Roberto"
                    className="input-standard"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Etapa / Tipo de Lead
                  </label>
                  <select
                    name="tipoLead"
                    value={crmData.tipoLead}
                    onChange={handleCrmChange}
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
                    ℹ️ El cliente ya completó el proceso biométrico. Este script se enfoca en <strong>validación de datos, cierre y referencias</strong>.
                  </div>
                )}
              </div>

              {/* Columna 2 */}
              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" /> Condiciones de Crédito
                </h3>

                <div>
                  <label className="text-xs font-bold text-indigo-600 uppercase">
                    Monto Aprobado
                  </label>
                  <input
                    type="text"
                    name="monto"
                    value={crmData.monto}
                    onChange={handleCrmChange}
                    placeholder="Ej. 150,000"
                    className="input-highlight"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Tasa Asignada
                    </label>
                    <input
                      type="text"
                      name="tasa"
                      value={crmData.tasa}
                      onChange={handleCrmChange}
                      placeholder="Ej. 3.5%"
                      className="input-standard"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Cuota Mensual
                    </label>
                    <input
                      type="text"
                      name="cuota"
                      value={crmData.cuota}
                      onChange={handleCrmChange}
                      placeholder="Ej. 4,200"
                      className="input-standard"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Plazo (meses)
                    </label>
                    <input
                      type="text"
                      name="plazo"
                      value={crmData.plazo}
                      onChange={handleCrmChange}
                      placeholder="60"
                      className="input-standard"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      1er Fecha de Pago
                    </label>
                    <input
                      type="text"
                      name="fechaPrimerPago"
                      value={crmData.fechaPrimerPago}
                      onChange={handleCrmChange}
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
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Ingresos CRM
                    </label>
                    <input
                      type="text"
                      name="ingresos"
                      value={crmData.ingresos}
                      onChange={handleCrmChange}
                      placeholder="$25,000"
                      className="input-standard"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Ocupación
                    </label>
                    <input
                      type="text"
                      name="ocupacion"
                      value={crmData.ocupacion}
                      onChange={handleCrmChange}
                      placeholder="Ej. Docente"
                      className="input-standard"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={iniciarLlamada}
              className="btn-primary w-full flex justify-center items-center gap-2 text-lg py-4 mt-8"
            >
              <Phone className="w-5 h-5" /> Iniciar Teleprompter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PASOS ──────────────────────────────────────────────────────────────────

  const renderStep = () => {

    // PASO 1 — Saludo / Transición
    const step1 = (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" /> 1. Saludo y Transición
        </h2>

        {crmData.tipoLead === 'upper' && (
          <GuiaOperativa>
            Tono seguro y cálido. Verifica identidad, notifica grabación y abre con pregunta de intención. Espera la respuesta del cliente antes de continuar.
          </GuiaOperativa>
        )}
        {crmData.tipoLead === 'gancho' && (
          <GuiaOperativa>
            Tono entusiasta pero profesional. Referencia la nota previa en el CRM para personalizar la apertura. Espera respuesta antes de pasar a beneficios.
          </GuiaOperativa>
        )}
        {crmData.tipoLead === 'expirado' && (
          <GuiaOperativa>
            Tono empático. El cliente dejó pasar el crédito antes — reconócelo sin juzgar. La clave es actualizar su situación actual para reencuadrar la oferta.
          </GuiaOperativa>
        )}
        {crmData.tipoLead === 'longtrack' && (
          <GuiaOperativa>
            El cliente YA completó biométricos. Este paso es breve — solo confirmar identidad, notificar grabación y conocer el uso del crédito antes de avanzar al cierre.
          </GuiaOperativa>
        )}

        <ScriptBlock>
          {getGreetingText(crmData.cliente, crmData.tipoLead, crmData.asesor)}
        </ScriptBlock>

        {/* Beneficios solo para upper, gancho, expirado */}
        {crmData.tipoLead !== 'longtrack' && <BeneficiosBadge />}
      </div>
    );

    // PASO 2 — Sondeo
    const step2 = (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" /> 2. Sondeo y Perfilamiento
        </h2>

        {(crmData.tipoLead === 'gancho' || crmData.tipoLead === 'expirado') ? (
          <GuiaOperativa>
            Este cliente ya tuvo contacto previo. Enfócate en descubrir <strong>qué cambió</strong> desde entonces y <strong>qué urgencia tiene hoy</strong>. Usa esa información en el pitch.
          </GuiaOperativa>
        ) : (
          <GuiaOperativa>
            Evita preguntar "¿cuánto necesita?". Indaga el propósito real para usarlo como anclaje emocional en el cierre.
          </GuiaOperativa>
        )}

        <SondeoPreguntas />

        {crmData.tipoLead !== 'longtrack' && (
          <>
            <ScriptBlock>
              Perfecto. Revisando tu perfil para agilizar el proceso, nos indicaste ingresos aproximados de{' '}
              <strong>${crmData.ingresos || '[Ingresos]'}</strong> y que te desempeñas como{' '}
              <strong>{crmData.ocupacion || '[Ocupación]'}</strong>. ¿Esta información sigue vigente?
              {'\n\n'}
              Comprendo. Para asegurarme de que esta línea se adapte a lo que buscas, ¿tienes pensado utilizar este crédito para consolidar alguna deuda actual o tienes algún proyecto específico en mente?
            </ScriptBlock>

            <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner mb-6">
              <label className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-indigo-500" /> Registra el propósito del crédito
              </label>
              <textarea
                name="motivo"
                value={callData.motivo}
                onChange={handleCallChange}
                placeholder="Ej. Consolidar tarjetas, Remodelación, Capital de trabajo, Emergencia médica..."
                className="input-standard h-24 resize-none"
              />
            </div>

            {callData.motivo && (
              <ScriptBlock>
                Entiendo el objetivo de{' '}
                <strong className="text-indigo-700">{callData.motivo}</strong>. Y cuéntame, ¿actualmente manejas tarjetas de crédito o algún otro préstamo bancario?
              </ScriptBlock>
            )}
          </>
        )}

        {crmData.tipoLead === 'longtrack' && (
          <div className="mt-4 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner">
            <label className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Uso declarado del crédito
            </label>
            <textarea
              name="motivo"
              value={callData.motivo}
              onChange={handleCallChange}
              placeholder="Anota el uso que el cliente mencionó..."
              className="input-standard h-20 resize-none"
            />
          </div>
        )}
      </div>
    );

    // PASO 3 — Pitch (no aplica en longtrack, que va directo a validación)
    const step3 = (
      <div className="animate-fade-in">
        {crmData.tipoLead === 'longtrack' ? (
          <>
            <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" /> 3. Validación de Datos (CURP)
            </h2>
            <GuiaOperativa>
              Antes del cierre, valida que toda la información capturada en originación sea correcta. Usa{' '}
              <a href="https://www.gob.mx/curp/" target="_blank" rel="noreferrer" className="underline text-amber-700 font-bold">
                gob.mx/curp
              </a>{' '}
              para verificar nombre completo, fecha y entidad de nacimiento.
            </GuiaOperativa>
            <ScriptBlock>{getLongTrackValidacionText()}</ScriptBlock>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={callData.curpValidada}
                  onChange={(e) => setCallData({ curpValidada: e.target.checked })}
                  className="w-5 h-5 rounded text-indigo-500"
                />
                <span className="font-bold text-slate-700 text-sm">✅ CURP, nombre, domicilio y empleo validados correctamente</span>
              </label>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" /> 3. Pitch de la Oferta
            </h2>
            <GuiaOperativa>
              Presenta condiciones de forma transparente: monto, tasa, cuota y plazo. El cliente valora la claridad. Si hay objeción, abre el{' '}
              <strong>Panel de Objeciones</strong> a tu derecha.
            </GuiaOperativa>

            <div className="flex gap-4 mb-6">
              <div className="stat-card text-white">
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">Monto Aprobado</p>
                <p className="text-2xl font-black text-white mt-1">${crmData.monto}</p>
              </div>
              <div className="card-base flex-1">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tasa / Cuota / Plazo</p>
                <p className="text-xl font-black text-indigo-900 mt-1">
                  {crmData.tasa} / ${crmData.cuota} / {crmData.plazo} meses
                </p>
              </div>
            </div>

            <ScriptBlock>
              {getPitchText(crmData.cliente, crmData.monto, crmData.tasa, crmData.cuota, callData.motivo, crmData.tipoLead)}
            </ScriptBlock>

            <div className="bg-indigo-50 p-4 rounded-lg text-indigo-800 text-sm font-medium border border-indigo-100 flex gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>
                Si el cliente <strong>no tiene la identificación a la mano</strong>, agenda seguimiento con fecha y hora concreta, y registra nota en HubSpot.
              </p>
            </div>
          </>
        )}
      </div>
    );

    // PASO 4 — Educación de docs / Biométricos
    const step4 = (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" /> 4. Educación de Documentos
        </h2>
        <GuiaOperativa>
          Haz el proceso de carga <strong>en línea con el cliente siempre que sea posible</strong>. Si no tiene los documentos a la mano, explica los requisitos a detalle para evitar rechazos en Riesgo. Sé muy preciso con CFE/Telmex y la selfie.
        </GuiaOperativa>
        <ScriptBlock>{getEducacionText()}</ScriptBlock>

        {crmData.tipoLead === 'longtrack' && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-4 text-teal-900 text-sm font-medium">
            ✅ <strong>Long Track:</strong> El cliente ya subió sus documentos. Este paso es para resolver dudas adicionales sobre pagos, fechas y ampliaciones — <strong>no solicitar docs de nuevo</strong>.
          </div>
        )}
      </div>
    );

    // PASO 5 — Cierre y Referencias
    const step5 = (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-indigo-600" /> 5. Cierre y Referencias
        </h2>
        <GuiaOperativa>
          Las 2 referencias telefónicas son <strong>OBLIGATORIAS</strong> para el equipo de Riesgo. No puedes colgar sin ellas. Si el cliente duda, vuelve a destacar la rapidez del depósito.
        </GuiaOperativa>

        <ScriptBlock>
          {getCierreText(crmData.cliente, callData.motivo, crmData.monto, crmData.cuota, crmData.plazo, crmData.fechaPrimerPago)}
        </ScriptBlock>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
          <div className="card-base">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
              <User className="w-4 h-4 text-indigo-500" /> 1. Referencia Familiar
            </label>
            <input
              type="text"
              name="refFamiliar"
              value={callData.refFamiliar}
              onChange={handleCallChange}
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
              name="refAmistad"
              value={callData.refAmistad}
              onChange={handleCallChange}
              placeholder="Nombre completo y Teléfono"
              className="input-standard"
            />
          </div>
        </div>

        <ScriptBlock>
          Perfecto. Con esta información envío tu expediente a Riesgo. En breve recibirás un mensaje con la liga segura para subir tu documentación biométrica.
        </ScriptBlock>

        {/* Cliente no aplica */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
            ⚠️ Si el cliente NO APLICA (rechazado por Riesgo)
          </p>
          <p className="text-sm text-red-800 italic leading-relaxed">
            "{getNoAplicaText(crmData.cliente)}"
          </p>
        </div>
      </div>
    );

    // PASO 6 — Seguimiento y CRM
    const step6 = (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" /> 6. Seguimiento y Registro CRM
        </h2>
        <GuiaOperativa>
          Documenta <strong>SIEMPRE</strong> la llamada en el CRM, independientemente del resultado, para trazabilidad y auditoría de calidad.
        </GuiaOperativa>

        <div className="card-base mb-6">
          <h3 className="font-bold text-slate-800 mb-3 text-lg border-b pb-2">
            Si el cliente NO cerró hoy:
          </h3>
          <p className="text-slate-600 mb-4 font-medium italic">
            "{getSeguimientoText()}"
          </p>
          <input
            type="text"
            name="fechaSeguimiento"
            value={callData.fechaSeguimiento}
            onChange={handleCallChange}
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

          <button
            onClick={() => {
              if (confirm('¿Finalizar llamada y comenzar una nueva?')) resetAll();
            }}
            className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition"
          >
            🔄 Finalizar y Nueva Llamada
          </button>
        </div>
      </div>
    );

    const stepsArr = [step1, step2, step3, step4, step5, step6];
    return stepsArr[step - 1] || step1;
  };

  const getStepButtonClass = (stepId: number): string => {
    if (step === stepId) return 'step-button-active';
    if (step > stepId) return 'step-button-completed';
    return 'step-button';
  };

  // Labels de pasos según tipo
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

  const tipoLabel: Record<string, { label: string; color: string }> = {
    upper: { label: '⚡ UPPER', color: 'bg-indigo-600' },
    gancho: { label: '🎣 Gancho', color: 'bg-emerald-600' },
    expirado: { label: '🔄 Expirado', color: 'bg-orange-600' },
    longtrack: { label: '✅ Long Track', color: 'bg-teal-600' },
  };

  // ─── INTERFAZ PRINCIPAL ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans overflow-hidden">

      {/* NAV LATERAL IZQUIERDA */}
      <div className="w-64 bg-slate-900 text-slate-300 flex-col shadow-2xl z-20 hidden lg:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <h1 className="font-black text-white text-xl tracking-tight">Teleprompter Elite</h1>
          <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase mt-1">Mayo 2026</p>
        </div>

        {/* Tipo de lead badge */}
        <div className="px-5 py-3 border-b border-slate-800">
          <span className={`text-xs font-black text-white px-3 py-1 rounded-full ${tipoLabel[crmData.tipoLead]?.color}`}>
            {tipoLabel[crmData.tipoLead]?.label}
          </span>
          <p className="text-slate-400 text-xs mt-1 truncate font-medium">{crmData.cliente || 'Sin cliente'}</p>
          <p className="text-indigo-300 text-xs font-bold">
            ${crmData.monto || '—'} · {crmData.tasa || '—'} · ${crmData.cuota || '—'}
          </p>
        </div>

        <div className="p-5 border-b border-slate-800 flex flex-col items-center justify-center bg-slate-900/80">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Duración</span>
          <span className="text-3xl font-mono text-emerald-400 font-bold flex items-center gap-2">
            <Clock className="w-6 h-6" /> {formatTime(callDuration)}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {stepLabels.map((s) => (
            <button key={s.id} onClick={() => setStep(s.id)} className={getStepButtonClass(s.id)}>
              <s.icon className="w-5 h-5" />
              <span>{s.id}. {s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA CENTRAL */}
      <div className="flex-1 flex flex-col h-screen relative bg-slate-50">

        {/* Header Mobile */}
        <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-30">
          <h1 className="font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> Teleprompter
          </h1>
          <div className="flex gap-3 items-center">
            <span className={`text-xs font-black text-white px-2 py-0.5 rounded-full ${tipoLabel[crmData.tipoLead]?.color}`}>
              {tipoLabel[crmData.tipoLead]?.label}
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

        {/* Selector pasos mobile */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-2 flex gap-1 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <button
              key={id}
              onClick={() => setStep(id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition ${
                step === id ? 'bg-indigo-600 text-white' :
                step > id ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {id}
            </button>
          ))}
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto p-5 md:p-10 pb-32">
          <div className="max-w-3xl mx-auto">

            {/* Barra Progreso */}
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

      {/* OVERLAY MOBILE */}
      {isMobileToolsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileToolsOpen(false)}
        />
      )}

      {/* PANEL LATERAL DERECHO — sin cambios (objeciones + faq intactos) */}
      <div className={`fixed lg:static inset-y-0 right-0 w-80 lg:w-96 bg-white shadow-2xl lg:shadow-none lg:border-l border-slate-200 z-40 transform transition-transform duration-300 flex flex-col ${
        isMobileToolsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> Centro de Apoyo
          </h2>
          <button className="lg:hidden p-1 bg-slate-800 rounded" onClick={() => setIsMobileToolsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveToolTab('objeciones')}
            className={`flex-1 py-3 text-sm font-bold transition ${
              activeToolTab === 'objeciones'
                ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            🛡️ Objeciones (REA)
          </button>
          <button
            onClick={() => setActiveToolTab('faq')}
            className={`flex-1 py-3 text-sm font-bold transition ${
              activeToolTab === 'faq'
                ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            ❓ FAQ
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50" ref={faqRef}>
          {activeToolTab === 'objeciones' && (
            <div className="animate-fade-in space-y-4">
              <div className="card-base flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Rebotes (Mín 3)</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Calidad Playbook</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        callData.objecionesRebatidas >= i ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
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
                    <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${activeObjection === obj.id ? 'rotate-90' : ''}`} />
                  </button>

                  {activeObjection === obj.id && (
                    <div className="p-4 pt-0 bg-indigo-50/30 border-t border-slate-100 space-y-3">
                      <p className="text-sm text-slate-700">
                        <strong className="text-indigo-600 block mb-1">R: Reconoce</strong>{obj.r}
                      </p>
                      <p className="text-sm text-slate-700">
                        <strong className="text-indigo-600 block mb-1">E: Empatiza</strong>{obj.e}
                      </p>
                      <p className="text-sm text-slate-700">
                        <strong className="text-emerald-600 block mb-1">A: Asegura</strong>{obj.a}
                      </p>
                      {obj.tips && obj.tips.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                          <p className="text-xs font-bold text-amber-700 uppercase mb-2">💡 Tips</p>
                          <ul className="text-xs text-amber-900 space-y-1">
                            {obj.tips.map((tip, i) => <li key={i}>• {tip}</li>)}
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
                      <span className="mr-2">{faq.icon}</span>{faq.q}
                    </span>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
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
      </div>
    </div>
  );
}
