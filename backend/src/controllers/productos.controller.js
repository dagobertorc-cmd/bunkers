const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const listar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const cond   = req.query.categoria_id ? 'AND p.categoria_id = ?' : '';
    const search = req.query.q ? 'AND p.nombre LIKE ?' : '';
    const params = [];
    if (req.query.categoria_id) params.push(req.query.categoria_id);
    if (req.query.q) params.push(`%${req.query.q}%`);

    const [data] = await pool.execute(`
      SELECT p.*, c.nombre AS categoria FROM productos p
      JOIN categorias_productos c ON p.categoria_id = c.id
      WHERE p.activo = 1 ${cond} ${search}
      ORDER BY p.nombre
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    const [[{ c }]] = await pool.execute(`
      SELECT COUNT(*) as c FROM productos p WHERE p.activo = 1 ${cond} ${search}
    `, params);

    return ok(res, paginatedResponse(data, Number(c), page, limit));
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const pool = getDB();
    const [[row]] = await pool.execute(`
      SELECT p.*, c.nombre AS categoria FROM productos p
      JOIN categorias_productos c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (!row) return notFound(res, 'Producto no encontrado');
    return ok(res, row);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, descripcion, categoria_id, unidad_medida, marca, modelo, num_parte } = req.body;
    const [result] = await pool.execute(`
      INSERT INTO productos (nombre, descripcion, categoria_id, unidad_medida, marca, modelo, num_parte)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [nombre, descripcion || null, categoria_id, unidad_medida || 'PZA',
        marca || null, modelo || null, num_parte || null]);
    return created(res, { id: result.insertId }, 'Producto creado');
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, descripcion, categoria_id, unidad_medida, marca, modelo, num_parte, activo } = req.body;
    await pool.execute(`
      UPDATE productos SET nombre=?, descripcion=?, categoria_id=?, unidad_medida=?,
      marca=?, modelo=?, num_parte=?, activo=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `, [nombre, descripcion || null, categoria_id, unidad_medida || 'PZA',
        marca || null, modelo || null, num_parte || null, activo ?? 1, req.params.id]);
    return ok(res, null, 'Producto actualizado');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    const pool = getDB();
    await pool.execute('UPDATE productos SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    return ok(res, null, 'Producto eliminado');
  } catch (err) { next(err); }
};

const seriales = async (req, res, next) => {
  try {
    const pool = getDB();
    const [data] = await pool.execute(`
      SELECT s.*, i.bunker_id, b.nombre AS bunker
      FROM seriales s
      JOIN inventario i ON s.inventario_id = i.id
      JOIN bunkers b    ON i.bunker_id     = b.id
      WHERE i.producto_id = ?
      ORDER BY s.serie
    `, [req.params.id]);
    return ok(res, data);
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, seriales };
