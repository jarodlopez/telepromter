import { create } from 'zustand';

interface CRMData {
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

interface CallData {
  motivo: string;
  refFamiliar: string;
  refAmistad: string;
  fechaSeguimiento: string;
  objecionesRebatidas: number;
  curpValidada: boolean;
}

interface Checklist {
  tarea: boolean;
  estatus: boolean;
  nota: boolean;
}

interface TeleprompterStore {
  // CRM Data
  crmData: CRMData;
  setCrmData: (data: Partial<CRMData>) => void;

  // Call Data
  callData: CallData;
  setCallData: (data: Partial<CallData>) => void;

  // Checklist
  checklist: Checklist;
  setChecklist: (data: Partial<Checklist>) => void;

  // UI State
  appState: 'setup' | 'call';
  setAppState: (state: 'setup' | 'call') => void;

  step: number;
  setStep: (step: number) => void;

  callDuration: number;
  incrementCallDuration: () => void;
  resetCallDuration: () => void;

  // Tools Panel
  activeToolTab: 'objeciones' | 'faq';
  setActiveToolTab: (tab: 'objeciones' | 'faq') => void;

  activeObjection: string | null;
  setActiveObjection: (id: string | null) => void;

  activeFaq: number | null;
  setActiveFaq: (idx: number | null) => void;

  isMobileToolsOpen: boolean;
  setIsMobileToolsOpen: (open: boolean) => void;

  // Reset
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

export const useTeleprompterStore = create<TeleprompterStore>((set) => ({
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
    }),
}));
