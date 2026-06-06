import React, { useEffect, useState } from 'react';
import { UserPlus, RefreshCw } from 'lucide-react';
import { listUsuarios, createUsuario, updateUsuario } from '@/lib/api';

const ROLES = [
  { v: 'admin', label: 'Administrador' },
  { v: 'coordinador', label: 'Coordinador' },
  { v: 'tecnico', label: 'Técnico (campo)' }
];

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', nombre: '', rol: 'tecnico', password: '' });
  const [creando, setCreando] = useState(false);

  const recargar = async () => {
    setCargando(true);
    setError('');
    try {
      setUsuarios(await listUsuarios());
    } catch (e) {
      setError(e.message === 'NO_AUTH' ? 'Inicia sesión como admin' : e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    recargar();
  }, []);

  const crear = async () => {
    if (!form.email || !form.password) {
      setError('Email y contraseña son obligatorios');
      return;
    }
    setCreando(true);
    setError('');
    try {
      await createUsuario(form);
      setForm({ email: '', nombre: '', rol: 'tecnico', password: '' });
      recargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreando(false);
    }
  };

  const cambiarRol = async (id, rol) => {
    await updateUsuario(id, { rol });
    recargar();
  };

  const toggleActivo = async (u) => {
    await updateUsuario(u.id, { activo: !u.activo });
    recargar();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Usuarios y roles</h2>
        <button onClick={recargar} className="flex items-center text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300">
          <RefreshCw size={15} className="mr-1" /> Actualizar
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {/* Crear usuario */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-5">
        <h3 className="font-medium mb-2 flex items-center"><UserPlus size={16} className="mr-1" /> Nuevo usuario</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <input className="rounded-md border-gray-300 border p-2 text-sm" placeholder="Email (login)"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="rounded-md border-gray-300 border p-2 text-sm" placeholder="Nombre"
            value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <select className="rounded-md border-gray-300 border p-2 text-sm"
            value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            {ROLES.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
          </select>
          <input type="password" className="rounded-md border-gray-300 border p-2 text-sm" placeholder="Contraseña"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button onClick={crear} disabled={creando}
            className="bg-indigo-600 text-white rounded-md px-3 py-2 text-sm hover:bg-indigo-700 disabled:opacity-60">
            {creando ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </div>

      {/* Lista */}
      {cargando ? (
        <p className="text-gray-500">Cargando…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Email</th>
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 pr-2">Rol</th>
                <th className="py-2 pr-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2 pr-2">{u.email}</td>
                  <td className="py-2 pr-2">{u.nombre}</td>
                  <td className="py-2 pr-2">
                    <select value={u.rol} onChange={(e) => cambiarRol(u.id, e.target.value)}
                      className="rounded border-gray-300 border p-1 text-xs">
                      {ROLES.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <button onClick={() => toggleActivo(u)}
                      className={`text-xs px-2 py-1 rounded ${u.activo ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
