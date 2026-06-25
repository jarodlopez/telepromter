'use client';
import React, { useState, useCallback, useRef } from 'react';
import {
  Sparkles, Loader2, ClipboardPaste, User, Target,
  CheckCircle2, RotateCcw, Save, Mic, Upload, X, FileAudio,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { useTeleprompterStore } from '@/lib/store';
import { PostCallAnalysis } from '@/app/components/PostCallAnalysis';
import { saveAnalysis } from '@/lib/firestore';

// ─── HubSpot transcript parser ────────────────────────────────────────────────
function parseHubSpot(raw: string): {
  asesor: string; cliente: string; cleanTranscript: string; isHubSpot: boolean;
} {
  const asesorMatch  = raw.match(/##\s*HubSpot\s*\n-\s*(.+)/i);
  const clienteMatch = raw.match(/##\s*Contacto\s*\n-\s*(.+)/i);
  const asesor       = asesorMatch?.[1]?.trim()  ?? '';
  const cliente      = clienteMatch?.[1]?.trim() ?? '';
  const isHubSpot    = !!(asesor || cliente);

  if (!isHubSpot) return { asesor, cliente, cleanTranscript: raw, isHubSpot: false };

  const start = raw.indexOf('# Transcripción');
  const body  = start >= 0 ? raw.slice(start) : raw;
  const lines = body
    .split('\n')
    .map((line) => {
      const m = line.match(/^\*\*(.+?)\*\*\s*\(\d+:\d+\):\s*(.+)/);
      if (!m) return null;
      const [, speaker, text] = m;
      const norm = speaker.trim().toLowerCase();
      if (asesor  && norm === asesor.toLowerCase())  return `Asesor: ${text.trim()}`;
      if (cliente && norm === cliente.toLowerCase()) return `Cliente: ${text.trim()}`;
      return `${speaker.trim()}: ${text.trim()}`;
    })
    .filter(Boolean) as string[];

  return { asesor, cliente, cleanTranscript: lines.join('\n'), isHubSpot: true };
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  user: FirebaseUser;
  onSaved?: () => void;
}

export default function AnalysisBlock({ user, onSaved }: Props) {
  const { crmData, setCrmData, setAnalysis, isAnalyzing, setIsAnalyzing, showToast, analysis } =
    useTeleprompterStore();

  const [rawTranscript,   setRawTranscript]   = useState('');
  const [cleanTranscript, setCleanTranscript] = useState('');
  const [localCliente,    setLocalCliente]    = useState('');
  const [localAsesor,     setLocalAsesor]     = useState('');
  const [localTipo,       setLocalTipo]       = useState<typeof crmData.tipoLead>('upper');
  const [hubSpotDetected, setHubSpotDetected] = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [savedId,         setSavedId]         = useState<string | null>(null);

  // Audio transcription state
  const [audioFile,       setAudioFile]       = useState<File | null>(null);
  const [isTranscribing,  setIsTranscribing]  = useState(false);
  const [audioError,      setAudioError]      = useState('');
  const [dragOver,        setDragOver]        = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_AUDIO = '.mp3,.m4a,.wav,.ogg,.webm,.flac,.mp4,.mpeg';

  const handleAudioFile = (file: File) => {
    setAudioError('');
    setAudioFile(file);
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleAudioFile(file);
  };

  const transcribeAudio = async () => {
    if (!audioFile) return;
    setIsTranscribing(true);
    setAudioError('');
    try {
      const form = new FormData();
      form.append('audio', audioFile);
      const res  = await fetch('/api/transcribe', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Error al transcribir.');
      if (!data.text?.trim()) throw new Error('Whisper no devolvió texto. Verifica que el audio tenga voz clara.');
      // Populate transcript directly (not HubSpot format)
      setRawTranscript(data.text);
      setCleanTranscript(data.text);
      setHubSpotDetected(false);
      showToast('Audio transcrito correctamente.', 'success');
    } catch (err: any) {
      setAudioError(err?.message ?? 'Error al transcribir.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
    setAudioError('');
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const formatBytes = (n: number) =>
    n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;

  const wordCount = cleanTranscript.trim() ? cleanTranscript.trim().split(/\s+/).length : 0;

  const handleTranscriptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRawTranscript(value);
    const parsed = parseHubSpot(value);
    setCleanTranscript(parsed.cleanTranscript);
    setHubSpotDetected(parsed.isHubSpot);
    if (parsed.isHubSpot) {
      if (parsed.asesor)  setLocalAsesor(parsed.asesor);
      if (parsed.cliente) setLocalCliente(parsed.cliente);
    }
  }, []);

  const handleNuevo = () => {
    setRawTranscript('');
    setCleanTranscript('');
    setLocalCliente('');
    setLocalAsesor('');
    setLocalTipo('upper');
    setHubSpotDetected(false);
    setAnalysis(null);
    setSavedId(null);
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
    setSavedId(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: cleanTranscript,
          crmData: merged,
          callData: { motivo: '', refFamiliar: '', refAmistad: '', fechaSeguimiento: '', objecionesRebatidas: 0, curpValidada: false },
          callDuration: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');
      setAnalysis(data);

      // Auto-save to Firestore
      setSaving(true);
      const id = await saveAnalysis({
        uid:          user.uid,
        email:        user.email ?? '',
        asesor:       localAsesor || merged.asesor,
        cliente:      localCliente || merged.cliente,
        tipoLead:     localTipo,
        callDuration: 0,
        wordCount,
        analysis:     data,
      });
      setSavedId(id);
      onSaved?.();
      showToast('Análisis guardado en historial.', 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'No se pudo analizar. Intenta de nuevo.', 'error');
    } finally {
      setIsAnalyzing(false);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      {analysis && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {savedId
              ? <><Save className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Guardado en historial</span></>
              : saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
              : null
            }
          </div>
          <button
            onClick={handleNuevo}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" /> Nuevo Análisis
          </button>
        </div>
      )}

      {/* Context fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
            <User className="w-3 h-3 inline mr-1" />Cliente
          </label>
          <input
            value={localCliente}
            onChange={(e) => setLocalCliente(e.target.value)}
            placeholder="Se detecta automáticamente"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
            <User className="w-3 h-3 inline mr-1" />Asesor
          </label>
          <input
            value={localAsesor}
            onChange={(e) => setLocalAsesor(e.target.value)}
            placeholder="Se detecta automáticamente"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
            <Target className="w-3 h-3 inline mr-1" />Tipo de Lead
          </label>
          <select
            value={localTipo}
            onChange={(e) => setLocalTipo(e.target.value as typeof crmData.tipoLead)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="upper">⚡ UPPER</option>
            <option value="gancho">🎣 Gancho</option>
            <option value="expirado">🔄 Expirado</option>
            <option value="longtrack">✅ Long Track</option>
          </select>
        </div>
      </div>

      {/* ── Audio transcription block ──────────────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
        <p className="text-sm font-bold text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-indigo-400" />
          Transcribir Audio con IA
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleAudioDrop}
          onClick={() => !audioFile && audioInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
            dragOver
              ? 'border-indigo-400 bg-indigo-900/20'
              : audioFile
              ? 'border-emerald-600 bg-emerald-900/10 cursor-default'
              : 'border-slate-600 hover:border-indigo-500 hover:bg-slate-700/30'
          }`}
        >
          <input
            ref={audioInputRef}
            type="file"
            accept={ACCEPTED_AUDIO}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f); }}
          />

          {audioFile ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileAudio className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-emerald-300 truncate">{audioFile.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(audioFile.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearAudio(); }}
                className="text-slate-400 hover:text-red-400 transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-400">
                Arrastra el audio aquí o <span className="text-indigo-400 font-bold">selecciona archivo</span>
              </p>
              <p className="text-xs text-slate-600">MP3 · M4A · WAV · OGG · WebM · hasta 25 MB</p>
            </div>
          )}
        </div>

        {/* Error */}
        {audioError && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
            {audioError}
          </p>
        )}

        {/* Transcribe button */}
        <button
          onClick={transcribeAudio}
          disabled={!audioFile || isTranscribing}
          className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 transition text-sm"
        >
          {isTranscribing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Transcribiendo con Whisper...</>
            : <><Mic className="w-4 h-4" /> Transcribir Audio</>
          }
        </button>

        {isTranscribing && (
          <p className="text-xs text-center text-slate-500">
            Esto puede tardar 30–60 segundos dependiendo de la duración del audio.
          </p>
        )}
      </div>

      {/* ── Manual transcript input ─────────────────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-indigo-400" />
            O pega la transcripción manualmente
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
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 transition"
        >
          {isAnalyzing
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Analizando...</>
            : <><Sparkles className="w-5 h-5" /> Analizar con IA</>
          }
        </button>
      </div>

      {/* Results */}
      <div className="[&_.mt-6]:mt-0">
        <PostCallAnalysis />
      </div>
    </div>
  );
}
