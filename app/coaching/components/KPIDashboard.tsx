'use client';
import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  getAnalyses, computeKPIs, CATEGORY_LABEL,
  type AnalysisRecord, type KPIStats,
} from '@/lib/firestore';
import {
  Loader2, TrendingUp, TrendingDown, Minus,
  Star, Target, PhoneCall, BarChart2, Award, AlertCircle,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DICTAMEN_COLOR: Record<string, string> = {
  Excelente:         'bg-emerald-500',
  Bueno:             'bg-blue-500',
  Aceptable:         'bg-yellow-400',
  'Requiere Mejora': 'bg-orange-500',
  Crítico:           'bg-red-500',
};

const DICTAMEN_ORDER = ['Excelente', 'Bueno', 'Aceptable', 'Requiere Mejora', 'Crítico'];

const scoreColor = (n: number) =>
  n >= 80 ? 'text-emerald-400' : n >= 60 ? 'text-amber-400' : 'text-red-400';

const barColor = (n: number) =>
  n >= 8 ? 'bg-emerald-500' : n >= 6 ? 'bg-amber-400' : 'bg-red-500';

const sparkColor = (n: number) =>
  n >= 80 ? 'bg-emerald-500' : n >= 60 ? 'bg-amber-400' : 'bg-red-500';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, color = 'text-white',
}: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon: React.ReactNode; color?: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <span className="text-slate-600">{icon}</span>
      </div>
      <p className={`text-4xl font-black leading-none ${color}`}>{value}</p>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  const pct = score * 10;
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-slate-400 w-36 flex-shrink-0 truncate">{label}</p>
      <div className="flex-1 bg-slate-700 rounded-full h-2">
        <div
          className={`${barColor(score)} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs font-bold w-8 text-right flex-shrink-0 ${barColor(score).replace('bg-', 'text-')}`}>
        {score}
      </p>
    </div>
  );
}

function Sparkline({ data }: { data: { label: string; score: number }[] }) {
  if (!data.length) return null;
  const max = 100;
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.label}: ${d.score}`}>
          <div
            className={`w-full rounded-t ${sparkColor(d.score)}`}
            style={{ height: `${(d.score / max) * 56}px`, minHeight: '4px' }}
          />
          <p className="text-[9px] text-slate-600 truncate w-full text-center hidden sm:block">{d.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  user: User;
  refreshKey: number;
}

export default function KPIDashboard({ user, refreshKey }: Props) {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [kpis,    setKpis]    = useState<KPIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getAnalyses(user.uid)
      .then((data) => {
        if (cancelled) return;
        setRecords(data);
        setKpis(computeKPIs(data));
      })
      .catch((e) => { if (!cancelled) setError(e.message ?? 'Error al cargar datos.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user.uid, refreshKey]);

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">Calculando métricas...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-4 text-red-400 text-sm">{error}</div>
  );

  if (!kpis || kpis.total === 0) return (
    <div className="text-center py-20 text-slate-500 text-sm">
      Sin datos aún. Completa tu primer análisis para ver las métricas.
    </div>
  );

  const TrendIcon = kpis.tendencia > 0
    ? TrendingUp : kpis.tendencia < 0 ? TrendingDown : Minus;
  const trendColor = kpis.tendencia > 0
    ? 'text-emerald-400' : kpis.tendencia < 0 ? 'text-red-400' : 'text-slate-400';

  const dictamenTotal = Object.values(kpis.byDictamen).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">

      {/* ── Row 1: Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Análisis"
          value={kpis.total}
          icon={<PhoneCall className="w-4 h-4" />}
        />
        <StatCard
          label="Promedio General"
          value={kpis.promedio}
          color={scoreColor(kpis.promedio)}
          icon={<Star className="w-4 h-4" />}
          sub={
            <span className={`flex items-center gap-1 font-bold ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              {kpis.tendencia > 0 ? '+' : ''}{kpis.tendencia} pts vs período anterior
            </span>
          }
        />
        <StatCard
          label="Tasa de Avance"
          value={`${kpis.tasaAvance}%`}
          color={scoreColor(kpis.tasaAvance)}
          icon={<Target className="w-4 h-4" />}
          sub="Llamadas con estado positivo"
        />
        <StatCard
          label="Área Crítica"
          value={kpis.peorCategoria}
          color="text-amber-400 text-xl"
          icon={<AlertCircle className="w-4 h-4" />}
          sub={<span className="text-emerald-400">Mejor: {kpis.mejorCategoria}</span>}
        />
      </div>

      {/* ── Row 2: Trend + Dictamen ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Sparkline */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" /> Tendencia · Últimas {kpis.lastTen.length} Llamadas
          </p>
          <Sparkline data={kpis.lastTen} />
          <div className="flex justify-between text-[10px] text-slate-600">
            <span>Más antigua</span>
            <span>Más reciente</span>
          </div>
        </div>

        {/* Dictamen distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Distribución de Dictamen
          </p>
          <div className="space-y-2">
            {DICTAMEN_ORDER.filter((d) => kpis.byDictamen[d]).map((d) => {
              const count = kpis.byDictamen[d] ?? 0;
              const pct   = Math.round((count / dictamenTotal) * 100);
              return (
                <div key={d} className="flex items-center gap-2">
                  <p className="text-xs text-slate-300 w-28 flex-shrink-0">{d}</p>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className={`${DICTAMEN_COLOR[d] ?? 'bg-slate-500'} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 w-10 text-right flex-shrink-0">{count} ({pct}%)</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Category breakdown ───────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Promedio por Categoría (0–10)
        </p>
        <div className="space-y-3">
          {Object.entries(kpis.byCategoria)
            .sort(([, a], [, b]) => b - a)
            .map(([key, score]) => (
              <CategoryBar
                key={key}
                label={CATEGORY_LABEL[key] ?? key}
                score={score}
              />
            ))
          }
        </div>
      </div>

      {/* ── Row 4: Tipo de interacción + recent table ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tipo de interacción pills */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo de Interacción</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(kpis.byTipo).sort(([, a], [, b]) => b - a).map(([tipo, count]) => (
              <span key={tipo} className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full font-medium">
                {tipo} · {count}
              </span>
            ))}
          </div>
        </div>

        {/* Recent 5 */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Últimas Llamadas</p>
          <div className="space-y-2">
            {records.slice(0, 5).map((rec) => {
              const score = rec.analysis.calificacionFinal ?? 0;
              const fecha = rec.timestamp?.toDate?.()?.toLocaleDateString('es-MX', {
                day: '2-digit', month: 'short',
              }) ?? '—';
              return (
                <div key={rec.id} className="flex items-center gap-3 text-xs">
                  <span className={`font-black w-8 text-right flex-shrink-0 ${scoreColor(score)}`}>{score}</span>
                  <span className="text-slate-300 flex-1 truncate">{rec.cliente || '—'}</span>
                  <span className="text-slate-500 flex-shrink-0">{fecha}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                    DICTAMEN_COLOR[rec.analysis.dictamen ?? '']?.replace('bg-', 'bg-opacity-20 text-') ?? 'text-slate-400'
                  }`}>
                    {rec.analysis.dictamen ?? '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
