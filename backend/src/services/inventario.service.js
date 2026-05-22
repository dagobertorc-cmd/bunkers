const { getDB } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const listar = (filtros = {}) => {
  const db = getDB();
  const { page, limit, offset } = paginate(filtros.page, filtros.limit);

  const conditions = ['1=1'];
  const params     = [];

  if (filtros.bunker_id)   { conditions.push('i.bunker_id = ?');   params.push(filtros.bunker_id); }
  if (filtros.producto_id) { conditions.push('i.producto_id = ?'); params.push(filtros.producto_id); }
  if (filtros.categoria_id){ conditions.push('p.categoria_id = ?');params.push(filtros.categoria_id); }

  const where = conditions.join(' AND ');

  const data = db.prepare(`
    SELECT i.id, i.cantidad, i.stock_minimo, i.stock_maximo, i.ubicacion, i.updated_at,
           p.id AS producto_id, p.codigo, p.nombre AS producto, p.unidad_medida,
           c.nombre AS categoria,
           b.id AS bunker_id, b.nombre AS bunker
    FROM inventario i
    JOIN productos p         ON i.producto_id = p.id
    JOIN categorias_productos c ON p.categoria_id = c.id
    JOIN bunkers b           ON i.bunker_id   = b.id
    WHERE ${where}
    ORDER BY b.nombre, c.nombre, p.nombre
    LIMIT ? OFFSET ?
  `).all([...params, limit, offset]);

  const total = db.prepare(`
    SELECT COUNT(*) as c FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    WHERE ${where}
  `).get(params).c;

  return paginatedResponse(data, total, page, limit);
};

const critico = (bunkerId) => {
  const db = getDB();
  const cond = bunkerId ? 'AND i.bunker_id = ?' : '';
  const params = bunkerId ? [bunkerId] : [];

  return db.prepare(`
    SELECT i.id, i.cantidad, i.stock_minimo,
           p.codigo, p.nombre AS producto, p.unidad_medida,
           b.nombre AS bunker
    FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    JOIN bunkers   b ON i.bunker_id   = b.id
    WHERE i.cantidad <= i.stock_minimo ${cond}
    ORDER BY (i.cantidad * 1.0 / i.stock_minimo) ASC
  `).all(params);
};

const actualizar = (id, { stock_minimo, stock_maximo, ubicacion }) => {
  const db = getDB();
  db.prepare(`
    UPDATE inventario SET stock_minimo = ?, stock_maximo = ?, ubicacion = ?,
    updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(stock_minimo, stock_maximo || null, ubicacion || null, id);
  return db.prepare('SELECT * FROM inventario WHERE id = ?').get(id);
};

const crearh = (filtros = {}) => {
  const db = getDB();
  const { page, limit, offset } = paginate(filtros.page, filtros.limit);
  const conds = ['b.es_crearh = 1'];
  const params = [];

  if (filtros.categoria_id) { conds.push('p.categoria_id = ?'); params.push(filtros.categoria_id); }
  if (filtros.buscar) {
    conds.push('(LOWER(p.nombre) LIKE LOWER(?) OR LOWER(p.codigo) LIKE LOWER(?))');
    params.push(`%${filtros.buscar}%`, `%${filtros.buscar}%`);
  }

  const where = conds.join(' AND ');

  const data = db.prepare(`
    SELECT i.id, i.cantidad, i.stock_minimo, i.stock_maximo, i.ubicacion, i.updated_at,
           p.id AS producto_id, p.codigo, p.nombre AS producto, p.unidad_medida, p.marca, p.modelo,
           c.nombre AS categoria,
           b.id AS bunker_id, b.nombre AS bunker
    FROM inventario i
    JOIN productos p            ON i.producto_id  = p.id
    JOIN categorias_productos c ON p.categoria_id = c.id
    JOIN bunkers b              ON i.bunker_id    = b.id
    WHERE ${where}
    ORDER BY c.nombre, p.nombre
    LIMIT ? OFFSET ?
  `).all([...params, limit, offset]);

  const total = db.prepare(`
    SELECT COUNT(*) as c FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    JOIN bunkers b   ON i.bunker_id   = b.id
    WHERE ${where}
  `).get(params).c;

  return paginatedResponse(data, total, page, limit);
};

module.exports = { listar, critico, actualizar, crearh };
