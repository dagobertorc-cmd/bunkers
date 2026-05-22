const { getDB }  = require('../config/database');
const { hash }   = require('../utils/bcrypt.utils');
const { ok, created, notFound } = require('../utils/response.utils');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const listar = (req, res, next) => {
  try {
    const db = getDB();
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const data = db.prepare(`
      SELECT u.id, u.nombre, u.email, u.telefono, u.activo, u.ultimo_login,
             r.nombre AS rol, b.nombre AS bunker
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      LEFT JOIN bunkers b ON u.bunker_id = b.id
      ORDER BY u.nombre
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as c FROM usuarios').get().c;
    return ok(res, paginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const db = getDB();
    const { nombre, email, password, rol_id, bunker_id, telefono } = req.body;
    const hashed = await hash(password);
    const result = db.prepare(`
      INSERT INTO usuarios (nombre, email, password, rol_id, bunker_id, telefono)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nombre, email, hashed, rol_id, bunker_id || null, telefono || null);
    return created(res, { id: result.lastInsertRowid }, 'Usuario creado');
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const db = getDB();
    const { nombre, email, rol_id, bunker_id, telefono, activo } = req.body;
    db.prepare(`
      UPDATE usuarios SET nombre=?, email=?, rol_id=?, bunker_id=?, telefono=?,
      activo=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(nombre, email, rol_id, bunker_id || null, telefono || null, activo ?? 1, req.params.id);
    const user = db.prepare('SELECT id, nombre, email FROM usuarios WHERE id = ?').get(req.params.id);
    if (!user) return notFound(res, 'Usuario no encontrado');
    return ok(res, user, 'Usuario actualizado');
  } catch (err) { next(err); }
};

const desactivar = (req, res, next) => {
  try {
    const db = getDB();
    db.prepare('UPDATE usuarios SET activo = 0 WHERE id = ?').run(req.params.id);
    return ok(res, null, 'Usuario desactivado');
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, desactivar };
