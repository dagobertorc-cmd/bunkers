const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const listar = (req, res, next) => {
  try {
    const db = getDB();
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const cond   = req.query.categoria_id ? 'AND p.categoria_id = ?' : '';
    const search = req.query.q ? `AND (p.nombre LIKE ? OR p.codigo LIKE ?)` : '';
    const params = [];
    if (req.query.categoria_id) params.push(req.query.categoria_id);
    if (req.query.q) { params.push(`%${req.query.q}%`); params.push(`%${req.query.q}%`); }

    const data = db.prepare(`
      SELECT p.*, c.nombre AS categoria FROM productos p
      JOIN categorias_productos c ON p.categoria_id = c.id
      WHERE p.activo = 1 ${cond} ${search}
      ORDER BY p.nombre
      LIMIT ? OFFSET ?
    `).all([...params, limit, offset]);

    const total = db.prepare(`
      SELECT COUNT(*) as c FROM productos p WHERE p.activo = 1 ${cond} ${search}
    `).get(params).c;

    return ok(res, paginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

const obtener = (req, res, next) => {
  try {
    const db  = getDB();
    const row = db.prepare(`
      SELECT p.*, c.nombre AS categoria FROM productos p
      JOIN categorias_productos c ON p.categoria_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);
    if (!row) return notFound(res, 'Producto no encontrado');
    return ok(res, row);
  } catch (err) { next(err); }
};

const crear = (req, res, next) => {
  try {
    const db = getDB();
    const { codigo, nombre, descripcion, categoria_id, unidad_medida, marca, modelo, num_parte } = req.body;
    const result = db.prepare(`
      INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, marca, modelo, num_parte)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(codigo, nombre, descripcion || null, categoria_id, unidad_medida || 'PZA',
           marca || null, modelo || null, num_parte || null);
    return created(res, { id: result.lastInsertRowid }, 'Producto creado');
  } catch (err) { next(err); }
};

const actualizar = (req, res, next) => {
  try {
    const db = getDB();
    const { codigo, nombre, descripcion, categoria_id, unidad_medida, marca, modelo, num_parte, activo } = req.body;
    db.prepare(`
      UPDATE productos SET codigo=?, nombre=?, descripcion=?, categoria_id=?, unidad_medida=?,
      marca=?, modelo=?, num_parte=?, activo=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(codigo, nombre, descripcion || null, categoria_id, unidad_medida || 'PZA',
           marca || null, modelo || null, num_parte || null, activo ?? 1, req.params.id);
    return ok(res, null, 'Producto actualizado');
  } catch (err) { next(err); }
};

const eliminar = (req, res, next) => {
  try {
    const db = getDB();
    // Soft-delete: mark inactive
    db.prepare('UPDATE productos SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
    return ok(res, null, 'Producto eliminado');
  } catch (err) { next(err); }
};

// GET /api/productos/:id/seriales
const seriales = (req, res, next) => {
  try {
    const db = getDB();
    const data = db.prepare(`
      SELECT s.*, i.bunker_id, b.nombre AS bunker
      FROM seriales s
      JOIN inventario i ON s.inventario_id = i.id
      JOIN bunkers b    ON i.bunker_id     = b.id
      WHERE i.producto_id = ?
      ORDER BY s.serie
    `).all(req.params.id);
    return ok(res, data);
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, seriales };
