'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Sparkles, Loader2, ClipboardPaste, User, Target, CheckCircle2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTeleprompterStore } from '@/lib/store';
import { PostCallAnalysis } from '@/app/components/PostCallAnalysis';
import { Toast } from '@/app/components/ui/Toast';

// ─── HubSpot transcript parser ────────────────────────────────────────────────
// Format:
//   ## HubSpot\n- Advisor Name       → asesor
//   ## Contacto\n- CLIENT NAME       → cliente
//   **SPEAKER** (m:ss): text         → conversation lines
function parseHubSpot(raw: string): {
  asesor: string;
  cliente: string;
  cleanTranscript: string;
  isHubSpot: boolean;
} {
  const asesorMatch = raw.match(/##\s*HubSpot\s*\n-\s*(.+)/i);
  const clienteMatch = raw.match(/##\s*Contacto\s*\n-\s*(.+)/i);

  const asesor = asesorMatch?.[1]?.trim() ?? '';
  const cliente = clienteMatch?.[1]?.trim() ?? '';
  const isHubSpot = !!(asesor || cliente);

  if (!isHubSpot) {
    return { asesor, cliente, cleanTranscript: raw, isHubSpot: false };
  }

  const transcriptStart = raw.indexOf('# Transcripción');
  const body = transcriptStart >= 0 ? raw.slice(transcriptStart) : raw;

  const lines = body
    .split('\n')
    .map((line) => {
      // Match **SPEAKER NAME** (m:ss): spoken text
      const m = line.match(/^\*\*(.+?)\*\*\s*\(\d+:\d+\):\s*(.+)/);
      if (!m) return null;
      const [, speaker, text] = m;
      const norm = speaker.trim().toLowerCase();
      if (asesor && norm === asesor.toLowerCase()) return `Asesor: ${text.trim()}`;
      if (cliente && norm === cliente.toLowerCase()) return `Cliente: ${text.trim()}`;
      return `${speaker.trim()}: ${text.trim()}`;
    })
    .filter(Boolean) as string[];

  return { asesor, cliente, cleanTranscript: lines.join('\n'), isHubSpot: true };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const router = useRouter();
  const { crmData, setCrmData, setAnalysis, isAnalyzing, setIsAnalyzing, showToast, analysis } =
    useTeleprompterStore();

  const [rawTranscript, setRawTranscript] = useState('');
  const [cleanTranscript, setCleanTranscript] = useState('');
  const [localCliente, setLocalCliente] = useState(crmData.cliente);
  const [localAsesor, setLocalAsesor] = useState(crmData.asesor);
  const [localTipo, setLocalTipo] = useState<typeof crmData.tipoLead>(crmData.tipoLead);
  const [hubSpotDetected, setHubSpotDetected] = useState(false);

  const wordCount = cleanTranscript.trim() ? cleanTranscript.trim().split(/\s+/).length : 0;

  const handleTranscriptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setRawTranscript(value);

      const parsed = parseHubSpot(value);
      setCleanTranscript(parsed.cleanTranscript);
      setHubSpotDetected(parsed.isHubSpot);

      if (parsed.isHubSpot) {
        if (parsed.asesor) setLocalAsesor(parsed.asesor);
        if (parsed.cliente) setLocalCliente(parsed.cliente);
      }
    },
    []
  );

  const handleNuevoAnalisis = () => {
    setRawTranscript('');
    setCleanTranscript('');
    setLocalCliente('');
    setLocalAsesor('');
    setLocalTipo('upper');
    setHubSpotDetected(false);
    setAnalysis(null);
  };

  const analyze = async () => {
    if (!cleanTranscript.trim()) {
      showToast('Pega la transcripción antes de analizar.', 'error');
      return;
    }
    const merged = { ...crmData, cliente: localCliente, asesor: localAsesor, tipoLead: localTipo };
    setCrmData(merged);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: cleanTranscript,
          crmData: merged,
          callData: {
            motivo: '', refFamiliar: '', refAmistad: '',
            fechaSeguimiento: '', objecionesRebatidas: 0, curpValidada: false,
          },
          callDuration: 0,
        }),
      });
      if (!res.ok) throw new Error();
      setAnalysis(await res.json());
    } catch {
      showToast('No se pudo analizar. Intenta de nuevo.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-bold text-sm">Coaching IA · MultiMoney</span>
        </div>
        {analysis && (
          <button
            onClick={handleNuevoAnalisis}
            className="ml-auto flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" /> Nuevo Análisis
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Context fields — auto-filled when HubSpot format is detected */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              <User className="w-3 h-3 inline mr-1" />Cliente
            </label>
            <input
              value={localCliente}
              onChange={(e) => setLocalCliente(e.target.value)}
              placeholder="Se detecta automáticamente"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              <User className="w-3 h-3 inline mr-1" />Asesor
            </label>
            <input
              value={localAsesor}
              onChange={(e) => setLocalAsesor(e.target.value)}
              placeholder="Se detecta automáticamente"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              <Target className="w-3 h-3 inline mr-1" />Tipo de Lead
            </label>
            <select
              value={localTipo}
              onChange={(e) => setLocalTipo(e.target.value as typeof crmData.tipoLead)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="upper">⚡ UPPER</option>
              <option value="gancho">🎣 Gancho</option>
              <option value="expirado">🔄 Expirado</option>
              <option value="longtrack">✅ Long Track</option>
            </select>
          </div>
        </div>

        {/* Transcript input */}
        <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-indigo-400" />
              Transcripción de HubSpot
            </p>
            <div className="flex items-center gap-3">
              {hubSpotDetected && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Formato HubSpot detectado
                </span>
              )}
              {wordCount > 0 && (
                <span className="text-xs text-slate-400">{wordCount} palabras</span>
              )}
            </div>
          </div>

          <textarea
            value={rawTranscript}
            onChange={handleTranscriptChange}
            placeholder="Pega aquí la transcripción de HubSpot. Los nombres del asesor y cliente se detectan automáticamente."
            rows={12}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
          />

          {/* Preview of cleaned transcript */}
          {hubSpotDetected && cleanTranscript && (
            <details className="group">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 select-none">
                Vista previa del texto enviado a GPT ▾
              </summary>
              <pre className="mt-2 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-400 leading-5 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {cleanTranscript.slice(0, 1500)}{cleanTranscript.length > 1500 ? '\n…' : ''}
              </pre>
            </details>
          )}

          <button
            onClick={analyze}
            disabled={isAnalyzing || !cleanTranscript.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 transition"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analizando...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Analizar con IA</>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="[&_.mt-6]:mt-0">
          <PostCallAnalysis />
        </div>
      </div>

      <Toast />
    </div>
  );
}
