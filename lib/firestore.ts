import {
  collection, addDoc, query, where, orderBy,
  getDocs, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CallAnalysis } from './store';

// ─── Record shape stored in Firestore ────────────────────────────────────────

export interface AnalysisRecord {
  id:           string;
  asesorUid:    string;
  asesorEmail:  string;
  asesor:       string;
  cliente:      string;
  tipoLead:     string;
  callDuration: number;
  wordCount:    number;
  timestamp:    Timestamp;
  analysis:     CallAnalysis;
}

// ─── KPI output shape ────────────────────────────────────────────────────────

export interface KPIStats {
  total:           number;
  promedio:        number;
  tendencia:       number;          // delta vs. prior half
  byDictamen:      Record<string, number>;
  byCategoria:     Record<string, number>; // avg 0–10 per category
  mejorCategoria:  string;
  peorCategoria:   string;
  tasaAvance:      number;           // % of calls with positive estado
  byTipo:          Record<string, number>;
  lastTen:         { label: string; score: number }[];
}

// ─── Firestore operations ─────────────────────────────────────────────────────

export async function saveAnalysis(params: {
  uid:          string;
  email:        string;
  asesor:       string;
  cliente:      string;
  tipoLead:     string;
  callDuration: number;
  wordCount:    number;
  analysis:     CallAnalysis;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'analyses'), {
    asesorUid:    params.uid,
    asesorEmail:  params.email,
    asesor:       params.asesor,
    cliente:      params.cliente,
    tipoLead:     params.tipoLead,
    callDuration: params.callDuration,
    wordCount:    params.wordCount,
    analysis:     params.analysis,
    timestamp:    serverTimestamp(),
  });
  return ref.id;
}

export async function getAnalyses(uid: string): Promise<AnalysisRecord[]> {
  const q = query(
    collection(db, 'analyses'),
    where('asesorUid', '==', uid),
    orderBy('timestamp', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AnalysisRecord));
}

// ─── KPI computation (pure, no network) ──────────────────────────────────────

const CATEGORY_KEYS = [
  'apertura', 'descubrimiento', 'escuchaActiva',
  'empatia', 'presentacionOferta', 'manejoObjeciones', 'cierre',
] as const;

export const CATEGORY_LABEL: Record<string, string> = {
  apertura:           'Apertura',
  descubrimiento:     'Descubrimiento',
  escuchaActiva:      'Escucha Activa',
  empatia:            'Empatía',
  presentacionOferta: 'Presentación de Oferta',
  manejoObjeciones:   'Manejo de Objeciones',
  cierre:             'Cierre',
};

const POSITIVE_ESTADOS = [
  'Originación en proceso',
  'Seguimiento programado',
  'Solicitud activa',
  'En proceso de firma',
];

export function computeKPIs(records: AnalysisRecord[]): KPIStats {
  const empty: KPIStats = {
    total: 0, promedio: 0, tendencia: 0,
    byDictamen: {}, byCategoria: {}, mejorCategoria: '',
    peorCategoria: '', tasaAvance: 0, byTipo: {}, lastTen: [],
  };
  if (!records.length) return empty;

  const total  = records.length;
  const scores = records.map((r) => r.analysis.calificacionFinal ?? 0);
  const promedio = Math.round(scores.reduce((a, b) => a + b, 0) / total);

  // Tendencia: recent half vs. older half
  const mid      = Math.ceil(total / 2);
  const avgRecent = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const avgPrior  = mid < total
    ? scores.slice(mid).reduce((a, b) => a + b, 0) / (total - mid)
    : avgRecent;
  const tendencia = Math.round(avgRecent - avgPrior);

  // By dictamen
  const byDictamen: Record<string, number> = {};
  records.forEach((r) => {
    const d = r.analysis.dictamen ?? 'Sin dictamen';
    byDictamen[d] = (byDictamen[d] ?? 0) + 1;
  });

  // By category avg
  const sums: Record<string, { s: number; n: number }> = {};
  CATEGORY_KEYS.forEach((k) => { sums[k] = { s: 0, n: 0 }; });
  records.forEach((r) => {
    const cats = r.analysis.categorias;
    if (!cats) return;
    CATEGORY_KEYS.forEach((k) => {
      const val = (cats as any)[k]?.calificacion;
      if (typeof val === 'number') { sums[k].s += val; sums[k].n += 1; }
    });
  });
  const byCategoria: Record<string, number> = {};
  CATEGORY_KEYS.forEach((k) => {
    byCategoria[k] = sums[k].n ? +(sums[k].s / sums[k].n).toFixed(1) : 0;
  });

  const sorted = [...CATEGORY_KEYS].sort((a, b) => byCategoria[b] - byCategoria[a]);
  const mejorCategoria = CATEGORY_LABEL[sorted[0]] ?? '';
  const peorCategoria  = CATEGORY_LABEL[sorted[sorted.length - 1]] ?? '';

  // Tasa de avance
  const avanzados  = records.filter((r) =>
    POSITIVE_ESTADOS.some((s) => r.analysis.estadoFinal?.includes(s))
  ).length;
  const tasaAvance = Math.round((avanzados / total) * 100);

  // By tipo
  const byTipo: Record<string, number> = {};
  records.forEach((r) => {
    const t = r.analysis.tipoInteraccion ?? 'Sin clasificar';
    byTipo[t] = (byTipo[t] ?? 0) + 1;
  });

  // Last 10 for sparkline (oldest → newest for left-to-right trend)
  const lastTen = records
    .slice(0, 10)
    .reverse()
    .map((r, i) => {
      const d = r.timestamp?.toDate?.();
      const label = d
        ? d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
        : `#${i + 1}`;
      return { label, score: r.analysis.calificacionFinal ?? 0 };
    });

  return { total, promedio, tendencia, byDictamen, byCategoria, mejorCategoria, peorCategoria, tasaAvance, byTipo, lastTen };
}
