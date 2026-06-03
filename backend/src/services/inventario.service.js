const { getDB } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const listar = async (filtros = {}) => {
  const pool = getDB();
  const { page, limit, offset } = paginate(filtros.page, filtros.limit);

  const conditions = ['1=1'];
  const params     = [];

  if (filtros.bunker_id)    { conditions.push('i.bunker_id = ?');    params.push(filtros.bunker_id); }
  if (filtros.producto_id)  { conditions.push('i.producto_id = ?');  params.push(filtros.producto_id); }
  if (filtros.categoria_id) { conditions.push('p.categoria_id = ?'); params.push(filtros.categoria_id); }

  const where = conditions.join(' AND ');

  const [data] = await pool.execute(`
    SELECT i.id, i.cantidad, i.stock_minimo, i.stock_maximo, i.ubicacion, i.updated_at,
           p.id AS producto_id, p.nombre AS producto, p.unidad_medida,
           c.nombre AS categoria,
           b.id AS bunker_id, b.nombre AS bunker
    FROM inventario i
    JOIN productos p            ON i.producto_id  = p.id
    JOIN categorias_productos c ON p.categoria_id = c.id
    JOIN bunkers b              ON i.bunker_id    = b.id
    WHERE ${where}
    ORDER BY b.nombre, c.nombre, p.nombre
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  const [[{ c }]] = await pool.execute(`
    SELECT COUNT(*) as c FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    WHERE ${where}
  `, params);

  return paginatedResponse(data, Number(c), page, limit);
};

const critico = async (bunkerId) => {
  const pool = getDB();
  const cond   = bunkerId ? 'AND i.bunker_id = ?' : '';
  const params = bunkerId ? [bunkerId] : [];

  const [rows] = await pool.execute(`
    SELECT i.id, i.cantidad, i.stock_minimo,
           p.nombre AS producto, p.unidad_medida,
           b.nombre AS bunker
    FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    JOIN bunkers   b ON i.bunker_id   = b.id
    WHERE i.cantidad <= i.stock_minimo ${cond}
    ORDER BY (i.cantidad * 1.0 / i.stock_minimo) ASC
  `, params);

  return rows;
};

const actualizar = async (id, { stock_minimo, stock_maximo, ubicacion }) => {
  const pool = getDB();
  await pool.execute(`
    UPDATE inventario SET stock_minimo = ?, stock_maximo = ?, ubicacion = ?,
    updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `, [stock_minimo, stock_maximo || null, ubicacion || null, id]);

  const [[row]] = await pool.execute('SELECT * FROM inventario WHERE id = ?', [id]);
  return row;
};

const crearh = async (filtros = {}) => {
  const pool = getDB();
  const { page, limit, offset } = paginate(filtros.page, filtros.limit);
  const conds  = ['b.es_crearh = 1'];
  const params = [];

  if (filtros.categoria_id) { conds.push('p.categoria_id = ?'); params.push(filtros.categoria_id); }
  if (filtros.buscar) {
    conds.push('LOWER(p.nombre) LIKE LOWER(?)');
    params.push(`%${filtros.buscar}%`);
  }

  const where = conds.join(' AND ');

  const [data] = await pool.execute(`
    SELECT i.id, i.cantidad, i.stock_minimo, i.stock_maximo, i.ubicacion, i.updated_at,
           p.id AS producto_id, p.nombre AS producto, p.unidad_medida, p.marca, p.modelo,
           c.nombre AS categoria,
           b.id AS bunker_id, b.nombre AS bunker
    FROM inventario i
    JOIN productos p            ON i.producto_id  = p.id
    JOIN categorias_productos c ON p.categoria_id = c.id
    JOIN bunkers b              ON i.bunker_id    = b.id
    WHERE ${where}
    ORDER BY c.nombre, p.nombre
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  const [[{ c }]] = await pool.execute(`
    SELECT COUNT(*) as c FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    JOIN bunkers b   ON i.bunker_id   = b.id
    WHERE ${where}
  `, params);

  return paginatedResponse(data, Number(c), page, limit);
};

module.exports = { listar, critico, actualizar, crearh };
