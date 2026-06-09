import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CRMData {
  asesor: string;
  cliente: string;
  ingresos: string;
  ocupacion: string;
  monto: string;
  tasa: string;
  cuota: string;
  plazo: string;
  fechaPrimerPago: string;
  tipoLead: 'upper' | 'gancho' | 'expirado' | 'longtrack';
}

export interface CallData {
  motivo: string;
  refFamiliar: string;
  refAmistad: string;
  fechaSeguimiento: string;
  objecionesRebatidas: number;
  curpValidada: boolean;
}

export interface Checklist {
  tarea: boolean;
  estatus: boolean;
  nota: boolean;
}

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface CategoryScore {
  calificacion: number;
  maximo: number;
  hallazgos: string;
}

export interface CallAnalysis {
  calificacionFinal: number;
  dictamen: string;
  resumenEjecutivo: string;
  categorias: {
    apertura: CategoryScore;
    descubrimiento: CategoryScore;
    pitchComercial: CategoryScore;
    manejoObjeciones: CategoryScore;
    cierre: CategoryScore;
    despedida: CategoryScore;
  };
  fortalezas: string[];
  oportunidadesMejora: string[];
  riesgosDetectados: string[];
  coachingRecomendado: string;
  veredictoFinal: string;
  _demo?: boolean;
}

interface TeleprompterStore {
  crmData: CRMData;
  setCrmData: (data: Partial<CRMData>) => void;

  callData: CallData;
  setCallData: (data: Partial<CallData>) => void;

  checklist: Checklist;
  setChecklist: (data: Partial<Checklist>) => void;

  appState: 'setup' | 'call';
  setAppState: (state: 'setup' | 'call') => void;

  step: number;
  setStep: (step: number) => void;

  callDuration: number;
  incrementCallDuration: () => void;
  resetCallDuration: () => void;

  activeToolTab: 'objeciones' | 'faq' | 'transcripcion';
  setActiveToolTab: (tab: 'objeciones' | 'faq' | 'transcripcion') => void;

  activeObjection: string | null;
  setActiveObjection: (id: string | null) => void;

  activeFaq: number | null;
  setActiveFaq: (idx: number | null) => void;

  isMobileToolsOpen: boolean;
  setIsMobileToolsOpen: (open: boolean) => void;

  confirmingReset: boolean;
  setConfirmingReset: (v: boolean) => void;

  transcript: string;
  addToTranscript: (text: string) => void;
  clearTranscript: () => void;

  analysis: CallAnalysis | null;
  isAnalyzing: boolean;
  setAnalysis: (analysis: CallAnalysis | null) => void;
  setIsAnalyzing: (v: boolean) => void;

  toast: Toast | null;
  showToast: (message: string, type?: Toast['type']) => void;
  clearToast: () => void;

  resetAll: () => void;
}

const initialCrmData: CRMData = {
  asesor: '',
  cliente: '',
  ingresos: '',
  ocupacion: '',
  monto: '',
  tasa: '',
  cuota: '',
  plazo: '60',
  fechaPrimerPago: '',
  tipoLead: 'upper',
};

const initialCallData: CallData = {
  motivo: '',
  refFamiliar: '',
  refAmistad: '',
  fechaSeguimiento: '',
  objecionesRebatidas: 0,
  curpValidada: false,
};

const initialChecklist: Checklist = {
  tarea: false,
  estatus: false,
  nota: false,
};

export const useTeleprompterStore = create<TeleprompterStore>()(
  persist(
    (set) => ({
      crmData: initialCrmData,
      setCrmData: (data) =>
        set((state) => ({ crmData: { ...state.crmData, ...data } })),

      callData: initialCallData,
      setCallData: (data) =>
        set((state) => ({ callData: { ...state.callData, ...data } })),

      checklist: initialChecklist,
      setChecklist: (data) =>
        set((state) => ({ checklist: { ...state.checklist, ...data } })),

      appState: 'setup',
      setAppState: (state) => set({ appState: state }),

      step: 1,
      setStep: (step) => set({ step }),

      callDuration: 0,
      incrementCallDuration: () =>
        set((state) => ({ callDuration: state.callDuration + 1 })),
      resetCallDuration: () => set({ callDuration: 0 }),

      activeToolTab: 'objeciones',
      setActiveToolTab: (tab) => set({ activeToolTab: tab }),

      activeObjection: null,
      setActiveObjection: (id) => set({ activeObjection: id }),

      activeFaq: null,
      setActiveFaq: (idx) => set({ activeFaq: idx }),

      isMobileToolsOpen: false,
      setIsMobileToolsOpen: (open) => set({ isMobileToolsOpen: open }),

      confirmingReset: false,
      setConfirmingReset: (v) => set({ confirmingReset: v }),

      transcript: '',
      addToTranscript: (text) =>
        set((state) => ({ transcript: state.transcript + text })),
      clearTranscript: () => set({ transcript: '' }),

      analysis: null,
      isAnalyzing: false,
      setAnalysis: (analysis) => set({ analysis }),
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),

      toast: null,
      showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3500);
      },
      clearToast: () => set({ toast: null }),

      resetAll: () =>
        set({
          crmData: initialCrmData,
          callData: initialCallData,
          checklist: initialChecklist,
          appState: 'setup',
          step: 1,
          callDuration: 0,
          activeToolTab: 'objeciones',
          activeObjection: null,
          activeFaq: null,
          isMobileToolsOpen: false,
          confirmingReset: false,
          transcript: '',
          analysis: null,
          isAnalyzing: false,
          toast: null,
        }),
    }),
    {
      name: 'teleprompter-state',
      partialize: (state) => ({
        crmData: state.crmData,
        callData: state.callData,
        checklist: state.checklist,
        appState: state.appState,
        step: state.step,
        callDuration: state.callDuration,
        activeToolTab: state.activeToolTab,
        transcript: state.transcript,
        analysis: state.analysis,
      }),
    }
  )
);
