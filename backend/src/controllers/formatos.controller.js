const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');

const listar = (_req, res, next) => {
  try {
    const db   = getDB();
    const data = db.prepare('SELECT * FROM formatos WHERE activo = 1 ORDER BY nombre').all();
    return ok(res, data);
  } catch (err) { next(err); }
};

const obtener = (req, res, next) => {
  try {
    const db  = getDB();
    const row = db.prepare('SELECT * FROM formatos WHERE id = ?').get(req.params.id);
    if (!row) return notFound(res, 'Formato no encontrado');
    return ok(res, row);
  } catch (err) { next(err); }
};

const crear = (req, res, next) => {
  try {
    const db = getDB();
    const { nombre, descripcion } = req.body;
    const result = db.prepare('INSERT INTO formatos (nombre, descripcion) VALUES (?, ?)').run(nombre, descripcion || null);
    return created(res, { id: result.lastInsertRowid }, 'Formato creado');
  } catch (err) { next(err); }
};

const actualizar = (req, res, next) => {
  try {
    const db = getDB();
    const { nombre, descripcion, activo } = req.body;
    db.prepare('UPDATE formatos SET nombre=?, descripcion=?, activo=? WHERE id=?')
      .run(nombre, descripcion || null, activo ?? 1, req.params.id);
    return ok(res, null, 'Formato actualizado');
  } catch (err) { next(err); }
};

const eliminar = (req, res, next) => {
  try {
    const db = getDB();
    db.prepare('UPDATE formatos SET activo = 0 WHERE id = ?').run(req.params.id);
    return ok(res, null, 'Formato eliminado');
  } catch (err) { next(err); }
};

// GET /api/formatos/:id/tiendas
const tiendas = (req, res, next) => {
  try {
    const db = getDB();
    const data = db.prepare(`
      SELECT t.*, b.nombre AS bunker_nombre
      FROM tiendas t
      JOIN bunkers b ON t.bunker_id = b.id
      WHERE t.formato_id = ? AND t.activa = 1
      ORDER BY t.nombre
    `).all(req.params.id);
    return ok(res, data);
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, tiendas };
