import React, { useState } from 'react';
import { CloudUpload } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { sincronizarTodo } from '@/lib/sync';

// Acción de sincronización. La sesión se inicia en la barra superior (AppShell);
// aquí solo se dispara la subida de las actas pendientes.
const SyncBar = ({ onSynced }) => {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const doSync = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await sincronizarTodo();
      setMsg(r.total === 0 ? 'Todo al día' : `Sincronizadas ${r.ok}/${r.total}`);
      if (onSynced) onSynced();
    } catch (e) {
      setMsg(e.message === 'NO_AUTH' ? 'Inicia sesión arriba para sincronizar' : 'Error al sincronizar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm text-gray-600">
        {user ? (
          <>Conectado: <span className="font-medium">{user.email}</span></>
        ) : (
          'Trabajas en modo local. Inicia sesión arriba para sincronizar con el servidor.'
        )}
      </span>
      <div className="flex items-center gap-2">
        {msg && <span className="text-xs text-gray-500">{msg}</span>}
        <button
          type="button"
          onClick={doSync}
          disabled={busy || !user}
          className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
          title={!user ? 'Inicia sesión para sincronizar' : ''}
        >
          <CloudUpload size={15} className="mr-1" /> {busy ? 'Sincronizando…' : 'Sincronizar'}
        </button>
      </div>
    </div>
  );
};

export default SyncBar;
