const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const listar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const cond   = req.query.estado ? 'WHERE t.estado = ?' : 'WHERE 1=1';
    const params = req.query.estado ? [req.query.estado] : [];

    const [data] = await pool.execute(`
      SELECT t.*, ti.nombre AS tienda, u.nombre AS usuario_nombre
      FROM tickets t
      LEFT JOIN tiendas ti ON t.tienda_id  = ti.id
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      ${cond}
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    const [[{ c }]] = await pool.execute(`SELECT COUNT(*) as c FROM tickets t ${cond}`, params);
    return ok(res, paginatedResponse(data, Number(c), page, limit));
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const pool = getDB();
    const [[ticket]] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (!ticket) return notFound(res, 'Ticket no encontrado');
    return ok(res, ticket);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const pool = getDB();
    const { descripcion, tienda_id, prioridad } = req.body;
    const [[{ c }]] = await pool.execute('SELECT COUNT(*) as c FROM tickets');
    const numero = `TKT-${new Date().getFullYear()}-${String(Number(c) + 1).padStart(5, '0')}`;
    const [result] = await pool.execute(`
      INSERT INTO tickets (numero, descripcion, tienda_id, usuario_id, prioridad)
      VALUES (?, ?, ?, ?, ?)
    `, [numero, descripcion, tienda_id || null, req.user.id, prioridad || 'MEDIA']);
    return created(res, { id: result.insertId, numero }, 'Ticket creado');
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { descripcion, estado, prioridad } = req.body;
    await pool.execute(`
      UPDATE tickets SET descripcion=?, estado=?, prioridad=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `, [descripcion, estado, prioridad, req.params.id]);
    return ok(res, null, 'Ticket actualizado');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar };
