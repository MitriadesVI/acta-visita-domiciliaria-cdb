import React, { useEffect, useState } from 'react';
import { RefreshCw, LogIn, LogOut, CloudUpload } from 'lucide-react';
import { login, getMe, getToken, clearToken } from '@/lib/api';
import { sincronizarTodo } from '@/lib/sync';

// Barra de sesión + sincronización. El trabajo local-first funciona SIN sesión;
// iniciar sesión solo es necesario para sincronizar con el servidor.
const SyncBar = ({ onSynced }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (getToken()) {
      getMe()
        .then(setUser)
        .catch(() => clearToken());
    }
  }, []);

  const doLogin = async () => {
    setBusy(true);
    setMsg('');
    try {
      await login(email.trim(), password);
      setUser(await getMe());
      setPassword('');
    } catch (e) {
      setMsg(e.message || 'No se pudo iniciar sesión');
    } finally {
      setBusy(false);
    }
  };

  const doSync = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await sincronizarTodo();
      setMsg(r.total === 0 ? 'Todo al día' : `Sincronizadas ${r.ok}/${r.total}`);
      if (onSynced) onSynced();
    } catch (e) {
      setMsg(e.message === 'NO_AUTH' ? 'Inicia sesión para sincronizar' : 'Error al sincronizar');
    } finally {
      setBusy(false);
    }
  };

  const doLogout = () => {
    clearToken();
    setUser(null);
    setMsg('');
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
      {user ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-gray-600">
            Conectado: <span className="font-medium">{user.email}</span>{' '}
            <span className="text-xs text-gray-400">({user.rol})</span>
          </span>
          <div className="flex items-center gap-2">
            {msg && <span className="text-xs text-gray-500">{msg}</span>}
            <button
              type="button"
              onClick={doSync}
              disabled={busy}
              className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-60"
            >
              <CloudUpload size={15} className="mr-1" /> {busy ? 'Sincronizando…' : 'Sincronizar'}
            </button>
            <button
              type="button"
              onClick={doLogout}
              className="flex items-center text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300"
            >
              <LogOut size={15} className="mr-1" /> Salir
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm p-1.5 border text-sm"
              placeholder="tu@correo"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doLogin()}
              className="rounded-md border-gray-300 shadow-sm p-1.5 border text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="button"
            onClick={doLogin}
            disabled={busy}
            className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            <LogIn size={15} className="mr-1" /> {busy ? '…' : 'Iniciar sesión'}
          </button>
          <span className="text-xs text-gray-500 self-center">
            {msg || 'Opcional: solo para sincronizar con el servidor.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default SyncBar;
