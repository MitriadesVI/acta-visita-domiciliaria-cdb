import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Pencil, Plus, RefreshCw } from 'lucide-react';
import { listarActas, eliminarActa, cambiarEstado, ESTADOS } from '@/lib/actasDb';

const colorEstado = {
  borrador: 'bg-gray-200 text-gray-800',
  en_hold: 'bg-amber-200 text-amber-900',
  lista: 'bg-blue-200 text-blue-900',
  impresa: 'bg-green-200 text-green-900'
};

const MisActas = ({ onAbrir, onNueva, actaActivaId }) => {
  const [actas, setActas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const recargar = async () => {
    setCargando(true);
    setActas(await listarActas());
    setCargando(false);
  };

  useEffect(() => {
    recargar();
  }, []);

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar esta acta? No se puede deshacer.')) {
      await eliminarActa(id);
      recargar();
    }
  };

  const handleEstado = async (id, estado) => {
    await cambiarEstado(id, estado);
    recargar();
  };

  const formatFecha = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  };

  return (
    <div className="bg-white p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Mis Actas</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={recargar}
            className="flex items-center text-sm bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
          >
            <RefreshCw size={16} className="mr-1" /> Actualizar
          </button>
          <button
            type="button"
            onClick={onNueva}
            className="flex items-center text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            <Plus size={16} className="mr-1" /> Nueva acta
          </button>
        </div>
      </div>

      {cargando ? (
        <p className="text-gray-500">Cargando…</p>
      ) : actas.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <FileText size={40} className="mx-auto mb-2 opacity-50" />
          <p>No tienes actas guardadas todavía.</p>
          <p className="text-sm">Crea una nueva y se guardará automáticamente en este dispositivo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actas.map((acta) => (
            <div
              key={acta.id}
              className={`border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 ${
                acta.id === actaActivaId ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{acta.nombreAdultoMayor || 'Sin nombre'}</p>
                <p className="text-sm text-gray-500">
                  {acta.fecha ? `Visita: ${acta.fecha} · ` : ''}Editada: {formatFecha(acta.lastUpdated)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={acta.estado}
                  onChange={(e) => handleEstado(acta.id, e.target.value)}
                  className={`text-xs font-medium rounded px-2 py-1 border-0 ${colorEstado[acta.estado] || colorEstado.borrador}`}
                  title="Cambiar estado"
                >
                  {Object.entries(ESTADOS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onAbrir(acta.id)}
                  className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700"
                >
                  <Pencil size={14} className="mr-1" /> Abrir
                </button>
                <button
                  type="button"
                  onClick={() => handleEliminar(acta.id)}
                  className="text-red-500 hover:text-red-700 p-1.5"
                  title="Eliminar acta"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisActas;
