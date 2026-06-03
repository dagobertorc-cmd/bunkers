const { getDB }  = require('../config/database');
const { hash }   = require('../utils/bcrypt.utils');
const { ok, created, notFound } = require('../utils/response.utils');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const listar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const [data] = await pool.execute(`
      SELECT u.id, u.nombre, u.email, u.telefono, u.activo, u.ultimo_login,
             r.nombre AS rol, b.nombre AS bunker
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      LEFT JOIN bunkers b ON u.bunker_id = b.id
      ORDER BY u.nombre
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    const [[{ c }]] = await pool.execute('SELECT COUNT(*) as c FROM usuarios');
    return ok(res, paginatedResponse(data, Number(c), page, limit));
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, email, password, rol_id, bunker_id, telefono } = req.body;
    const hashed = await hash(password);
    const [result] = await pool.execute(`
      INSERT INTO usuarios (nombre, email, password, rol_id, bunker_id, telefono)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nombre, email, hashed, rol_id, bunker_id || null, telefono || null]);
    return created(res, { id: result.insertId }, 'Usuario creado');
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, email, rol_id, bunker_id, telefono, activo } = req.body;
    await pool.execute(`
      UPDATE usuarios SET nombre=?, email=?, rol_id=?, bunker_id=?, telefono=?,
      activo=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `, [nombre, email, rol_id, bunker_id || null, telefono || null, activo ?? 1, req.params.id]);
    const [[user]] = await pool.execute('SELECT id, nombre, email FROM usuarios WHERE id = ?', [req.params.id]);
    if (!user) return notFound(res, 'Usuario no encontrado');
    return ok(res, user, 'Usuario actualizado');
  } catch (err) { next(err); }
};

const desactivar = async (req, res, next) => {
  try {
    const pool = getDB();
    await pool.execute('UPDATE usuarios SET activo = 0 WHERE id = ?', [req.params.id]);
    return ok(res, null, 'Usuario desactivado');
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, desactivar };
