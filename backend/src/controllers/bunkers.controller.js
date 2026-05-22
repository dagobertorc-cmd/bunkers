const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');

const listar = (_req, res, next) => {
  try {
    const db   = getDB();
    const data = db.prepare('SELECT * FROM bunkers WHERE activo = 1 ORDER BY nombre').all();
    return ok(res, data);
  } catch (err) { next(err); }
};

const obtener = (req, res, next) => {
  try {
    const db     = getDB();
    const bunker = db.prepare('SELECT * FROM bunkers WHERE id = ?').get(req.params.id);
    if (!bunker) return notFound(res, 'Bunker no encontrado');
    return ok(res, bunker);
  } catch (err) { next(err); }
};

const crear = (req, res, next) => {
  try {
    const db = getDB();
    const { nombre, ciudad, direccion, responsable, telefono } = req.body;
    const result = db.prepare(
      'INSERT INTO bunkers (nombre, ciudad, direccion, responsable, telefono) VALUES (?, ?, ?, ?, ?)'
    ).run(nombre, ciudad, direccion || null, responsable || null, telefono || null);
    return created(res, { id: result.lastInsertRowid }, 'Bunker creado');
  } catch (err) { next(err); }
};

const actualizar = (req, res, next) => {
  try {
    const db = getDB();
    const { nombre, ciudad, direccion, responsable, telefono, activo } = req.body;
    db.prepare(`
      UPDATE bunkers SET nombre=?, ciudad=?, direccion=?, responsable=?, telefono=?,
      activo=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(nombre, ciudad, direccion || null, responsable || null, telefono || null, activo ?? 1, req.params.id);
    return ok(res, null, 'Bunker actualizado');
  } catch (err) { next(err); }
};

const eliminar = (req, res, next) => {
  try {
    const db = getDB();
    db.prepare('UPDATE bunkers SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
    return ok(res, null, 'Bunker desactivado');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
