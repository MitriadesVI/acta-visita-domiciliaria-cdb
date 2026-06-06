import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { listCasos, createCaso, updateCaso, listUsuarios } from '@/lib/api';

const ESTADOS = [
  ['recibido', 'Recibido'],
  ['agendado', 'Agendado'],
  ['no_ubicado', 'No ubicado'],
  ['valorado', 'Valorado'],
  ['en_comite', 'En comité'],
  ['resuelto', 'Resuelto'],
  ['cerrado', 'Cerrado']
];
const RESULTADOS = [
  ['', '—'],
  ['aplica', 'Aplica'],
  ['no_aplica', 'No aplica'],
  ['remitir', 'Remitir']
];

const colorEstado = {
  recibido: 'bg-gray-200 text-gray-800',
  agendado: 'bg-blue-200 text-blue-900',
  no_ubicado: 'bg-orange-200 text-orange-900',
  valorado: 'bg-teal-200 text-teal-900',
  en_comite: 'bg-amber-200 text-amber-900',
  resuelto: 'bg-purple-200 text-purple-900',
  cerrado: 'bg-green-200 text-green-900'
};

const vacio = {
  codigo: '', nombre_adulto_mayor: '', documento: '', direccion: '', barrio: '', fecha_recibido: '', asignado_a: ''
};

const CasosPanel = () => {
  const [casos, setCasos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);

  const recargar = async () => {
    setCargando(true);
    setError('');
    try {
      const [c, u] = await Promise.all([listCasos(filtro || undefined), listUsuarios().catch(() => [])]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const crear = async () => {
    if (!form.codigo) {
      setError('El radicado (código) es obligatorio');
      return;
    }
    setError('');
    try {
      const payload = { ...form, fecha_recibido: form.fecha_recibido || null, asignado_a: form.asignado_a || null };
      await createCaso(payload);
      setForm(vacio);
      setMostrarForm(false);
      recargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const patch = async (id, data) => {
    await updateCaso(id, data);
    recargar();
  };

  const nombreTecnico = (id) => tecnicos.find((t) => t.id === id)?.nombre || tecnicos.find((t) => t.id === id)?.email || '—';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold">Casos</h2>
        <div className="flex items-center gap-2">
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded border-gray-300 border p-1.5 text-sm">
            <option value="">Todos los estados</option>
            {ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={recargar} className="flex items-center text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300">
            <RefreshCw size={15} className="mr-1" /> Actualizar
          </button>
          <button onClick={() => setMostrarForm((v) => !v)} className="flex items-center text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
            <Plus size={15} className="mr-1" /> Nuevo caso
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {mostrarForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <input className="rounded border-gray-300 border p-2 text-sm" placeholder="Radicado (ej. EXT-QUILLA-2026-0111019)"
            value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <input className="rounded border-gray-300 border p-2 text-sm" placeholder="Nombre de la persona mayor"
            value={form.nombre_adulto_mayor} onChange={(e) => setForm({ ...form, nombre_adulto_mayor: e.target.value })} />
          <input className="rounded border-gray-300 border p-2 text-sm" placeholder="Documento"
            value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          <input className="rounded border-gray-300 border p-2 text-sm sm:col-span-2" placeholder="Dirección"
            value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          <input className="rounded border-gray-300 border p-2 text-sm" placeholder="Barrio"
            value={form.barrio} onChange={(e) => setForm({ ...form, barrio: e.target.value })} />
          <label className="text-sm text-gray-600 flex items-center gap-2">Recibido:
            <input type="date" className="rounded border-gray-300 border p-1.5 text-sm flex-1"
              value={form.fecha_recibido} onChange={(e) => setForm({ ...form, fecha_recibido: e.target.value })} />
          </label>
          <select className="rounded border-gray-300 border p-2 text-sm"
            value={form.asignado_a} onChange={(e) => setForm({ ...form, asignado_a: e.target.value })}>
            <option value="">Sin asignar</option>
            {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre || t.email}</option>)}
          </select>
          <button onClick={crear} className="bg-indigo-600 text-white rounded px-3 py-2 text-sm hover:bg-indigo-700">Guardar caso</button>
        </div>
      )}

      {cargando ? (
        <p className="text-gray-500">Cargando…</p>
      ) : casos.length === 0 ? (
        <p className="text-gray-500 italic">No hay casos {filtro ? 'en ese estado' : 'todavía'}.</p>
      ) : (
        <div className="space-y-3">
          {casos.map((c) => (
            <div key={c.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{c.codigo}</p>
                  <p className="text-sm text-gray-600">{c.nombre_adulto_mayor || 'Sin nombre'}{c.documento ? ` · ${c.documento}` : ''}</p>
                  <p className="text-xs text-gray-500">{c.direccion || ''}{c.barrio ? ` · ${c.barrio}` : ''}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${colorEstado[c.estado] || ''}`}>
                  {ESTADOS.find(([v]) => v === c.estado)?.[1] || c.estado}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                <label className="text-gray-600">Estado:
                  <select value={c.estado} onChange={(e) => patch(c.id, { estado: e.target.value })}
                    className="ml-1 rounded border-gray-300 border p-1 text-xs">
                    {ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
                <label className="text-gray-600">Asignado:
                  <select value={c.asignado_a || ''} onChange={(e) => patch(c.id, { asignado_a: e.target.value || null })}
                    className="ml-1 rounded border-gray-300 border p-1 text-xs">
                    <option value="">Sin asignar</option>
                    {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre || t.email}</option>)}
                  </select>
                </label>
                <label className="text-gray-600">Resultado:
                  <select value={c.resultado || ''} onChange={(e) => patch(c.id, { resultado: e.target.value || null })}
                    className="ml-1 rounded border-gray-300 border p-1 text-xs">
                    {RESULTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
                <label className="text-gray-600 flex items-center gap-1">
                  <input type="checkbox" checked={c.enviado_juridica || false}
                    onChange={(e) => patch(c.id, { enviado_juridica: e.target.checked })} />
                  Enviado a jurídica
                </label>
              </div>

              <div className="mt-2">
                <input
                  className="w-full rounded border-gray-300 border p-1.5 text-sm"
                  placeholder="Observación / nota de cierre (ej. No aplica, remitir a Comisaría…)"
                  defaultValue={c.observacion || ''}
                  onBlur={(e) => { if (e.target.value !== (c.observacion || '')) patch(c.id, { observacion: e.target.value }); }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CasosPanel;
