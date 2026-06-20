'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Sparkles, Loader2, LogIn } from 'lucide-react';

export default function LoginGate() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const map: Record<string, string> = {
        'auth/user-not-found':    'Credenciales incorrectas.',
        'auth/wrong-password':    'Credenciales incorrectas.',
        'auth/invalid-credential':'Credenciales incorrectas.',
        'auth/too-many-requests': 'Demasiados intentos fallidos. Espera unos minutos.',
        'auth/network-request-failed': 'Error de red. Verifica tu conexión.',
      };
      setError(map[err.code] ?? `Error al ingresar (${err.code}).`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-black">Coaching IA</h1>
          <p className="text-slate-400 text-sm mt-1">MultiMoney · Acceso restringido</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
              placeholder="tu@multimoney.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/60 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 transition text-sm mt-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
              : <><LogIn className="w-4 h-4" /> Ingresar</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
