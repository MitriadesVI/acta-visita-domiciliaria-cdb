import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { getPendientes } from '@/lib/api';

const BUCKETS = [
  ['vence_pronto', '⏰ Vence pronto / vencido', 'border-red-300'],
  ['visitas_vencidas', '📅 Visitas vencidas', 'border-red-300'],
  ['sin_agendar', '📥 Recibidos sin agendar', 'border-gray-300'],
  ['no_ubicado_sin_reagendar', '🔁 No ubicado sin reagendar', 'border-orange-300'],
  ['esperando_acta', '📋 Esperando acta', 'border-teal-300'],
  ['acta_sin_respuesta', '✉️ Acta recibida sin respuesta', 'border-amber-300'],
  ['sin_cerrar', '✔️ Resueltos sin cerrar', 'border-purple-300']
];

const TableroPanel = ({ onAbrirCasos }) => {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = async () => {
    setCargando(true);
    setError('');
    try {
      setData(await getPendientes());
    } catch (e) {
      setError(e.message === 'NO_AUTH' ? 'Inicia sesión' : e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    recargar();
  }, []);

  const fmtItem = (it) => {
    const quien = it.codigo || it.nombre || '(sin radicado)';
    const extra = it.dias != null ? ` · ${it.dias < 0 ? `en ${Math.abs(it.dias)}d` : `${it.dias}d`}` : '';
    return `${quien}${it.nombre && it.codigo ? ` — ${it.nombre}` : ''}${extra}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tablero de pendientes</h2>
        <button onClick={recargar} className="flex items-center text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300">
          <RefreshCw size={15} className="mr-1" /> Actualizar
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {cargando || !data ? (
        <p className="text-gray-500">Cargando…</p>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">Al {data.hoy}. Cada tarjeta lista lo que requiere acción para que nada se pierda.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUCKETS.map(([key, label, border]) => {
              const items = data.buckets[key] || [];
              return (
                <div key={key} className={`border-2 rounded-lg p-3 ${items.length ? border : 'border-gray-200 opacity-70'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{label}</h3>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${items.length ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}`}>
                      {items.length}
                    </span>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-400">Sin pendientes 👍</p>
                  ) : (
                    <ul className="text-sm space-y-1 max-h-56 overflow-y-auto">
                      {items.map((it, i) => (
                        <li key={i} className="text-gray-700 border-b border-gray-100 pb-1">{fmtItem(it)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
          {onAbrirCasos && (
            <button onClick={onAbrirCasos} className="mt-4 text-sm text-indigo-600 hover:underline">
              Ir a Casos para gestionar →
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default TableroPanel;
