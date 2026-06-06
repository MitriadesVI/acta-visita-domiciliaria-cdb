"use client";
import React, { useState } from 'react';
import { FileText, Folder, CalendarDays, Users, LogIn, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/authContext';
import ActaVisitaDomiciliaria from './ActaVisitaDomiciliaria';
import CasosPanel from './panel/CasosPanel';
import AgendaPanel from './panel/AgendaPanel';
import AdminUsuarios from './panel/AdminUsuarios';

function LoginInline() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const doLogin = async () => {
    setBusy(true);
    setErr('');
    try {
      await login(email.trim(), password);
    } catch (e) {
      setErr(e.message === 'NO_AUTH' ? 'Credenciales inválidas' : e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input className="rounded border-gray-300 border p-1.5 text-sm w-36" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className="rounded border-gray-300 border p-1.5 text-sm w-28" placeholder="Clave"
        value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doLogin()} />
      <button onClick={doLogin} disabled={busy} className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-60">
        <LogIn size={15} className="mr-1" /> {busy ? '…' : 'Entrar'}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}

function Shell() {
  const { user, logout, esAdmin, esCoordinacion } = useAuth();
  const [seccion, setSeccion] = useState('acta');

  const tabs = [
    { id: 'acta', label: 'Acta', icon: FileText, show: true },
    { id: 'casos', label: 'Casos', icon: Folder, show: esCoordinacion },
    { id: 'agenda', label: 'Agenda', icon: CalendarDays, show: esCoordinacion },
    { id: 'usuarios', label: 'Usuarios', icon: Users, show: esAdmin }
  ].filter((t) => t.show);

  const seccionValida = tabs.some((t) => t.id === seccion) ? seccion : 'acta';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación (no se imprime) */}
      <nav className="bg-white border-b shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setSeccion(t.id)}
                  className={`flex items-center text-sm px-3 py-1.5 rounded ${seccionValida === t.id ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Icon size={15} className="mr-1" /> {t.label}
                </button>
              );
            })}
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">{user.nombre || user.email} <span className="text-xs text-gray-400">({user.rol})</span></span>
                <button onClick={logout} className="flex items-center text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300">
                  <LogOut size={15} className="mr-1" /> Salir
                </button>
              </div>
            ) : (
              <LoginInline />
            )}
          </div>
        </div>
      </nav>

      <main className="py-6 px-4">
        {seccionValida === 'acta' && <ActaVisitaDomiciliaria />}
        {seccionValida !== 'acta' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6">
            {seccionValida === 'casos' && <CasosPanel />}
            {seccionValida === 'agenda' && <AgendaPanel />}
            {seccionValida === 'usuarios' && <AdminUsuarios />}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AppShell() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
