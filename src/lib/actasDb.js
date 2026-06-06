// Persistencia local-first de actas con Dexie (IndexedDB). Permite tener varias
// actas en "hold" en el dispositivo, editarlas e imprimirlas después del comité,
// y funciona sin conexión (trabajo de campo). El backend de sincronización se
// agregará después sobre esta misma base.
import Dexie from 'dexie';

// Estados del flujo de un acta.
export const ESTADOS = {
  borrador: 'Borrador',
  en_hold: 'En hold (comité)',
  lista: 'Lista para imprimir',
  impresa: 'Impresa / finalizada'
};

const nuevoUuid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Init perezosa: solo se instancia en el navegador (evita tocar IndexedDB en SSR).
let _db = null;
const getDb = () => {
  if (typeof window === 'undefined') return null;
  if (!_db) {
    _db = new Dexie('actaVisitaDB');
    _db.version(1).stores({
      // ++id autoincremental; campos indexados para listar/ordenar rápido.
      actas: '++id, estado, lastUpdated, nombreAdultoMayor, fecha'
    });
    // v2: campos para sincronización con el backend (uuid estable + estado de sync).
    _db.version(2)
      .stores({
        actas: '++id, estado, lastUpdated, nombreAdultoMayor, fecha, uuid, syncStatus'
      })
      .upgrade(async (tx) => {
        await tx.table('actas').toCollection().modify((a) => {
          if (!a.uuid) a.uuid = nuevoUuid();
          if (!a.syncStatus) a.syncStatus = 'pending';
        });
      });
  }
  return _db;
};

// ¿El formulario tiene datos reales? (para no crear actas vacías por autosave)
export const tieneDatos = (formData) => {
  if (!formData) return false;
  const am = formData.datosAdultoMayor || {};
  const dv = formData.datosVisita || {};
  const fn = formData.datosFuncionario || {};
  const firmas = formData.firmas || {};
  const algunaFirma = [
    ...(firmas.adultosMayores || []),
    ...(firmas.atendientes || []),
    ...(firmas.funcionarios || [])
  ].some((x) => x && (x.firma || x.foto || (x.nombre && x.nombre.trim())));
  return Boolean(
    (am.nombreApellido && am.nombreApellido.trim()) ||
      (am.numeroDocumento && am.numeroDocumento.trim()) ||
      (am.direccion && am.direccion.trim()) ||
      (dv.fecha && dv.fecha.trim()) ||
      (fn.nombreApellido && fn.nombreApellido.trim()) ||
      (formData.situacionEncontrada && formData.situacionEncontrada.trim()) ||
      (formData.observaciones && formData.observaciones.trim()) ||
      (formData.fotos && formData.fotos.length > 0) ||
      algunaFirma
  );
};

// Resumen para mostrar en la lista "Mis Actas".
const resumen = (formData) => ({
  nombreAdultoMayor:
    (formData?.datosAdultoMayor?.nombreApellido || '').trim() || 'Sin nombre',
  fecha: (formData?.datosVisita?.fecha || '').trim() || ''
});

// Crea o actualiza un acta. Devuelve el id.
export const guardarActa = async (formData, { id = null, estado = 'borrador' } = {}) => {
  const db = getDb();
  if (!db) return id;
  const base = id ? await db.actas.get(id) : null;
  const registro = {
    ...(base || {}),
    ...resumen(formData),
    estado: estado || base?.estado || 'borrador',
    formData,
    uuid: base?.uuid || nuevoUuid(),
    // Cualquier cambio local marca la acta como pendiente de sincronizar.
    syncStatus: 'pending',
    remoteId: base?.remoteId || null,
    lastSyncedAt: base?.lastSyncedAt || null,
    lastUpdated: new Date().toISOString(),
    createdAt: base?.createdAt || new Date().toISOString()
  };
  if (id) {
    await db.actas.put({ id, ...registro });
    return id;
  }
  return db.actas.add(registro);
};

export const listarActas = async () => {
  const db = getDb();
  if (!db) return [];
  const actas = await db.actas.toArray();
  return actas.sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
};

export const obtenerActa = async (id) => {
  const db = getDb();
  if (!db) return null;
  return db.actas.get(id);
};

export const eliminarActa = async (id) => {
  const db = getDb();
  if (!db) return;
  await db.actas.delete(id);
};

export const cambiarEstado = async (id, estado) => {
  const db = getDb();
  if (!db) return;
  // Cambiar el estado también deja la acta pendiente de re-sincronizar.
  await db.actas.update(id, { estado, syncStatus: 'pending', lastUpdated: new Date().toISOString() });
};

// --- Sincronización ---
export const listarPendientes = async () => {
  const db = getDb();
  if (!db) return [];
  return db.actas.where('syncStatus').equals('pending').toArray();
};

export const marcarSincronizada = async (id, remoteId) => {
  const db = getDb();
  if (!db) return;
  await db.actas.update(id, {
    syncStatus: 'synced',
    remoteId,
    lastSyncedAt: new Date().toISOString()
  });
};
