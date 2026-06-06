import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { listVisitas, createVisita, updateVisita, deleteVisita, listCasos, listUsuarios } from '@/lib/api';

const ESTADOS = [
  ['pendiente', 'Pendiente'],
  ['realizada', 'Realizada'],
  ['no_ubicado', 'No ubicado'],
  ['cancelada', 'Cancelada'],
  ['reprogramada', 'Reprogramada']
];

const colorEstado = {
  pendiente: 'bg-amber-200 text-amber-900',
  realizada: 'bg-green-200 text-green-900',
  no_ubicado: 'bg-orange-200 text-orange-900',
  cancelada: 'bg-gray-200 text-gray-700',
  reprogramada: 'bg-blue-200 text-blue-900'
};

const hoyISO = () => new Date().toISOString().slice(0, 10);

const AgendaPanel = () => {
  const [visitas, setVisitas] = useState([]);
  const [casos, setCasos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ caso_id: '', usuario_id: '', fecha_programada: hoyISO(), hora_programada: '', notas: '' });
  const [mostrarForm, setMostrarForm] = useState(false);

  const recargar = async () => {
    setCargando(true);
    setError('');
    try {
      const [v, c, u] = await Promise.all([listVisitas(), listCasos().catch(() => []), listUsuarios().catch(() => [])]);
      setVisitas(v);
      setCasos(c);
      setTecnicos(u.filter((x) => x.rol === 'tecnico'));
    } catch (e) {
      setError(e.message === 'NO_AUTH' ? 'Inicia sesión' : e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    recargar();
  }, []);

  const caso = (id) => casos.find((c) => c.id === id);
  const tecnico = (id) => tecnicos.find((t) => t.id === id);

  const agendar = async () => {
    if (!form.caso_id || !form.fecha_programada) {
      setError('Selecciona un caso y una fecha');
      return;
    }
    setError('');
    try {
      const payload = {
        caso_id: form.caso_id,
        usuario_id: form.usuario_id || null,
        fecha_programada: form.fecha_programada,
        hora_programada: form.hora_programada || null,
        notas: form.notas || null,
        estado: 'pendiente'
      };
      await createVisita(payload);
      setForm({ caso_id: '', usuario_id: '', fecha_programada: hoyISO(), hora_programada: '', notas: '' });
      setMostrarForm(false);
      recargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const vencida = (v) => v.estado === 'pendiente' && v.fecha_programada < hoyISO();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold">Agenda de visitas</h2>
        <div className="flex items-center gap-2">
          <button onClick={recargar} className="flex items-center text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300">
            <RefreshCw size={15} className="mr-1" /> Actualizar
          </button>
          <button onClick={() => setMostrarForm((v) => !v)} className="flex items-center text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
            <Plus size={15} className="mr-1" /> Agendar visita
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {mostrarForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <select className="rounded border-gray-300 border p-2 text-sm" value={form.caso_id}
            onChange={(e) => setForm({ ...form, caso_id: e.target.value })}>
            <option value="">Selecciona caso…</option>
            {casos.map((c) => <option key={c.id} value={c.id}>{c.codigo} — {c.nombre_adulto_mayor || 's/n'}</option>)}
          </select>
          <select className="rounded border-gray-300 border p-2 text-sm" value={form.usuario_id}
            onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}>
            <option value="">Asignar técnico…</option>
            {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre || t.email}</option>)}
          </select>
          <div className="flex gap-2">
            <input type="date" className="rounded border-gray-300 border p-1.5 text-sm flex-1"
              value={form.fecha_programada} onChange={(e) => setForm({ ...form, fecha_programada: e.target.value })} />
            <input type="time" className="rounded border-gray-300 border p-1.5 text-sm"
              value={form.hora_programada} onChange={(e) => setForm({ ...form, hora_programada: e.target.value })} />
          </div>
          <input className="rounded border-gray-300 border p-2 text-sm sm:col-span-2" placeholder="Notas (opcional)"
            value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          <button onClick={agendar} className="bg-indigo-600 text-white rounded px-3 py-2 text-sm hover:bg-indigo-700">Agendar</button>
        </div>
      )}

      {cargando ? (
        <p className="text-gray-500">Cargando…</p>
      ) : visitas.length === 0 ? (
        <p className="text-gray-500 italic">No hay visitas agendadas.</p>
      ) : (
        <div className="space-y-2">
          {visitas.map((v) => {
            const c = caso(v.caso_id);
            const t = tecnico(v.usuario_id);
            return (
              <div key={v.id} className={`border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 ${vencida(v) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                <div>
                  <p className="font-medium">
                    {c ? `${c.codigo} — ${c.nombre_adulto_mayor || 's/n'}` : 'Caso'}
                    {vencida(v) && <span className="ml-2 inline-flex items-center text-xs text-red-600"><AlertTriangle size={12} className="mr-1" /> Vencida</span>}
                  </p>
                  <p className="text-sm text-gray-500">
                    {v.fecha_programada}{v.hora_programada ? ` ${v.hora_programada}` : ''} · {t ? (t.nombre || t.email) : 'sin técnico'}
                  </p>
                  {v.notas && <p className="text-xs text-gray-500">{v.notas}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select value={v.estado} onChange={(e) => updateVisita(v.id, { estado: e.target.value }).then(recargar)}
                    className={`text-xs font-medium rounded px-2 py-1 border-0 ${colorEstado[v.estado] || ''}`}>
                    {ESTADOS.map(([val, l]) => <option key={val} value={val}>{l}</option>)}
                  </select>
                  <button onClick={() => deleteVisita(v.id).then(recargar)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgendaPanel;
