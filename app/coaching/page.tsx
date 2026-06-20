'use client';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Sparkles, PlusCircle, History, BarChart2, LogOut, Loader2 } from 'lucide-react';
import { Toast } from '@/app/components/ui/Toast';
import LoginGate from './components/LoginGate';
import AnalysisBlock from './components/AnalysisBlock';
import HistorialTab from './components/HistorialTab';
import KPIDashboard from './components/KPIDashboard';

type Tab = 'nuevo' | 'historial' | 'kpis';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'nuevo',    label: 'Nuevo Análisis', icon: <PlusCircle className="w-3.5 h-3.5" /> },
  { id: 'historial',label: 'Historial',      icon: <History    className="w-3.5 h-3.5" /> },
  { id: 'kpis',    label: 'Dashboard',       icon: <BarChart2  className="w-3.5 h-3.5" /> },
];

export default function CoachingPage() {
  const [user,       setUser]       = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab,        setTab]        = useState<Tab>('nuevo');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  if (authLoading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
    </div>
  );

  if (!user) return <LoginGate />;

  return (
    <div className="min-h-screen bg-slate-900 font-sans">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-4 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-black text-sm">Coaching IA</span>
            <span className="text-slate-600 text-xs hidden sm:inline">· MultiMoney</span>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 flex-shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                  tab === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* User + logout */}
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[160px]">{user.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {tab === 'nuevo' && (
          <AnalysisBlock
            user={user}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
        )}
        {tab === 'historial' && (
          <HistorialTab user={user} refreshKey={refreshKey} />
        )}
        {tab === 'kpis' && (
          <KPIDashboard user={user} refreshKey={refreshKey} />
        )}
      </div>

      <Toast />
    </div>
  );
}
