const { getDB } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

function nextFolio(db) {
  const row = db.prepare(
    "SELECT MAX(CAST(SUBSTR(folio, 5) AS INTEGER)) as m FROM requisiciones WHERE folio LIKE 'REQ-%'"
  ).get();
  const n = (row?.m ?? 0) + 1;
  return `REQ-${String(n).padStart(5, '0')}`;
}

const listar = (filtros = {}) => {
  const db = getDB();
  const { page, limit, offset } = paginate(filtros.page, filtros.limit);
  const conds = ['1=1'];
  const params = [];

  if (filtros.bunker_id) { conds.push('r.bunker_id = ?'); params.push(filtros.bunker_id); }
  if (filtros.estado)    { conds.push('r.estado = ?');    params.push(filtros.estado); }

  const where = conds.join(' AND ');

  const data = db.prepare(`
    SELECT r.id, r.folio, r.estado, r.observaciones, r.fecha_requerida,
           r.created_at, r.updated_at, r.atendida_at,
           b.nombre AS bunker,
           u.nombre AS solicitante,
           ua.nombre AS atendida_por_nombre,
           COUNT(ri.id) AS num_items
    FROM requisiciones r
    JOIN bunkers  b  ON r.bunker_id   = b.id
    JOIN usuarios u  ON r.usuario_id  = u.id
    LEFT JOIN usuarios ua ON r.atendida_por = ua.id
    LEFT JOIN requisicion_items ri ON ri.requisicion_id = r.id
    WHERE ${where}
    GROUP BY r.id
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all([...params, limit, offset]);

  const total = db.prepare(`
    SELECT COUNT(*) as c FROM requisiciones r WHERE ${where}
  `).get(params).c;

  return paginatedResponse(data, total, page, limit);
};

const obtener = (id) => {
  const db = getDB();
  const req = db.prepare(`
    SELECT r.id, r.folio, r.estado, r.observaciones, r.fecha_requerida,
           r.created_at, r.updated_at, r.atendida_at,
           b.id AS bunker_id, b.nombre AS bunker,
           u.nombre AS solicitante,
           ua.nombre AS atendida_por_nombre
    FROM requisiciones r
    JOIN bunkers  b ON r.bunker_id  = b.id
    JOIN usuarios u ON r.usuario_id = u.id
    LEFT JOIN usuarios ua ON r.atendida_por = ua.id
    WHERE r.id = ?
  `).get(id);
  if (!req) return null;

  req.items = db.prepare(`
    SELECT ri.id, ri.cantidad_pedida, ri.cantidad_surtida, ri.observaciones,
           p.id AS producto_id, p.nombre AS producto, p.unidad_medida, p.marca, p.modelo,
           c.nombre AS categoria,
           COALESCE(inv.cantidad, 0) AS stock_crearh
    FROM requisicion_items ri
    JOIN productos p ON ri.producto_id = p.id
    JOIN categorias_productos c ON p.categoria_id = c.id
    LEFT JOIN bunkers crearh ON crearh.es_crearh = 1
    LEFT JOIN inventario inv ON inv.producto_id = p.id AND inv.bunker_id = crearh.id
    WHERE ri.requisicion_id = ?
    ORDER BY p.nombre
  `).all(id);

  return req;
};

const crear = (datos) => {
  const db = getDB();
  const { bunker_id, usuario_id, observaciones, fecha_requerida, items } = datos;

  if (!items || items.length === 0)
    throw Object.assign(new Error('La requisición debe tener al menos un producto'), { type: 'BUSINESS_ERROR' });

  const folio = nextFolio(db);

  const tx = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO requisiciones (folio, bunker_id, usuario_id, observaciones, fecha_requerida)
      VALUES (?, ?, ?, ?, ?)
    `).run(folio, bunker_id, usuario_id, observaciones || null, fecha_requerida || null);

    const reqId = result.lastInsertRowid;

    for (const item of items) {
      db.prepare(`
        INSERT INTO requisicion_items (requisicion_id, producto_id, cantidad_pedida, observaciones)
        VALUES (?, ?, ?, ?)
      `).run(reqId, item.producto_id, item.cantidad_pedida, item.observaciones || null);
    }

    return reqId;
  });

  const reqId = tx();
  return obtener(reqId);
};

const actualizar = (id, datos) => {
  const db = getDB();
  const { estado, observaciones, atendida_por, items } = datos;

  const req = db.prepare('SELECT id, estado FROM requisiciones WHERE id = ?').get(id);
  if (!req) throw Object.assign(new Error('Requisición no encontrada'), { type: 'NOT_FOUND' });

  const VALID_ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'SURTIDA', 'CANCELADA'];
  if (estado && !VALID_ESTADOS.includes(estado))
    throw Object.assign(new Error('Estado inválido'), { type: 'BUSINESS_ERROR' });

  const tx = db.transaction(() => {
    const atendidaAt = (estado === 'SURTIDA' || estado === 'CANCELADA') ? 'CURRENT_TIMESTAMP' : 'atendida_at';
    db.prepare(`
      UPDATE requisiciones SET
        estado = COALESCE(?, estado),
        observaciones = COALESCE(?, observaciones),
        atendida_por = COALESCE(?, atendida_por),
        atendida_at = CASE WHEN ? IN ('SURTIDA','CANCELADA') THEN CURRENT_TIMESTAMP ELSE atendida_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(estado || null, observaciones || null, atendida_por || null, estado || null, id);

    if (items) {
      for (const item of items) {
        if (item.id) {
          db.prepare(`
            UPDATE requisicion_items SET
              cantidad_surtida = COALESCE(?, cantidad_surtida),
              observaciones = COALESCE(?, observaciones)
            WHERE id = ? AND requisicion_id = ?
          `).run(item.cantidad_surtida ?? null, item.observaciones || null, item.id, id);
        }
      }
    }
  });

  tx();
  return obtener(id);
};

const cancelar = (id, usuario_id) => {
  return actualizar(id, { estado: 'CANCELADA', atendida_por: usuario_id });
};

module.exports = { listar, obtener, crear, actualizar, cancelar };
