import { listarPendientes, marcarSincronizada } from './actasDb';
import { upsertActa } from './api';

// Empuja al backend todas las actas locales pendientes (idempotente por uuid).
// Las fotos/firmas viajan dentro de form_data; la subida a storage por separado
// se agregará en una iteración posterior.
export async function sincronizarTodo() {
  const pendientes = await listarPendientes();
  let ok = 0;
  for (const acta of pendientes) {
    const payload = {
      local_uuid: acta.uuid,
      estado: acta.estado,
      form_data: acta.formData || {},
      nombre_adulto_mayor: acta.nombreAdultoMayor || null,
      fecha_visita: acta.fecha || null
    };
    const res = await upsertActa(payload);
    await marcarSincronizada(acta.id, res.id);
    ok += 1;
  }
  return { total: pendientes.length, ok };
}
