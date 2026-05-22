const { getDB } = require('../config/database');
const { ok, created } = require('../utils/response.utils');

const listar = (_req, res, next) => {
  try {
    const db   = getDB();
    const data = db.prepare('SELECT * FROM categorias_productos WHERE activo = 1 ORDER BY nombre').all();
    return ok(res, data);
  } catch (err) { next(err); }
};

const crear = (req, res, next) => {
  try {
    const db = getDB();
    const { nombre, descripcion, icono } = req.body;
    const result = db.prepare(
      'INSERT INTO categorias_productos (nombre, descripcion, icono) VALUES (?, ?, ?)'
    ).run(nombre, descripcion || null, icono || null);
    return created(res, { id: result.lastInsertRowid }, 'Categoría creada');
  } catch (err) { next(err); }
};

const actualizar = (req, res, next) => {
  try {
    const db = getDB();
    const { nombre, descripcion, icono, activo } = req.body;
    db.prepare('UPDATE categorias_productos SET nombre=?, descripcion=?, icono=?, activo=? WHERE id=?')
      .run(nombre, descripcion || null, icono || null, activo ?? 1, req.params.id);
    return ok(res, null, 'Categoría actualizada');
  } catch (err) { next(err); }
};

const eliminar = (req, res, next) => {
  try {
    const db = getDB();
    db.prepare('UPDATE categorias_productos SET activo = 0 WHERE id = ?').run(req.params.id);
    return ok(res, null, 'Categoría eliminada');
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, eliminar };
