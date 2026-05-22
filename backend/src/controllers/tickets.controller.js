const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const listar = (req, res, next) => {
  try {
    const db = getDB();
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const cond   = req.query.estado ? 'WHERE t.estado = ?' : 'WHERE 1=1';
    const params = req.query.estado ? [req.query.estado] : [];

    const data = db.prepare(`
      SELECT t.*, ti.nombre AS tienda, u.nombre AS usuario_nombre
      FROM tickets t
      LEFT JOIN tiendas t2 ON t.tienda_id  = t2.id
      LEFT JOIN tiendas ti ON t.tienda_id  = ti.id
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      ${cond}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `).all([...params, limit, offset]);

    const total = db.prepare(`SELECT COUNT(*) as c FROM tickets t ${cond}`).get(params).c;
    return ok(res, paginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

const obtener = (req, res, next) => {
  try {
    const db     = getDB();
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    if (!ticket) return notFound(res, 'Ticket no encontrado');
    return ok(res, ticket);
  } catch (err) { next(err); }
};

const crear = (req, res, next) => {
  try {
    const db = getDB();
    const { descripcion, tienda_id, prioridad } = req.body;
    const count  = db.prepare('SELECT COUNT(*) as c FROM tickets').get();
    const numero = `TKT-${new Date().getFullYear()}-${String(count.c + 1).padStart(5, '0')}`;
    const result = db.prepare(`
      INSERT INTO tickets (numero, descripcion, tienda_id, usuario_id, prioridad)
      VALUES (?, ?, ?, ?, ?)
    `).run(numero, descripcion, tienda_id || null, req.user.id, prioridad || 'MEDIA');
    return created(res, { id: result.lastInsertRowid, numero }, 'Ticket creado');
  } catch (err) { next(err); }
};

const actualizar = (req, res, next) => {
  try {
    const db = getDB();
    const { descripcion, estado, prioridad } = req.body;
    db.prepare(`
      UPDATE tickets SET descripcion=?, estado=?, prioridad=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(descripcion, estado, prioridad, req.params.id);
    return ok(res, null, 'Ticket actualizado');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar };
