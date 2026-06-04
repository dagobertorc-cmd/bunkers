const { getDB } = require('../config/database');

let cache = null;

const TIPOS_ESPERADOS = ['ENTRADA', 'SALIDA', 'TRASLADO', 'AJUSTE', 'PRESTAMO', 'DEVOLUCION'];

async function getTipos() {
  if (cache) return cache;
  const [rows] = await getDB().execute('SELECT id, nombre FROM tipos_movimiento WHERE activo = 1');
  cache = {
    byId:     new Map(rows.map(r => [r.id,     r.nombre])),
    byNombre: new Map(rows.map(r => [r.nombre, r.id])),
  };
  return cache;
}

async function validateTipos() {
  const { byNombre } = await getTipos();
  const faltantes = TIPOS_ESPERADOS.filter(n => !byNombre.has(n));
  if (faltantes.length) {
    throw new Error(`Tipos de movimiento faltantes en la BD: ${faltantes.join(', ')}`);
  }
}

module.exports = { getTipos, validateTipos };
