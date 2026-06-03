const { getDB } = require('../config/database');
const { ok, created } = require('../utils/response.utils');

const listar = async (_req, res, next) => {
  try {
    const pool = getDB();
    const [data] = await pool.execute('SELECT * FROM categorias_productos WHERE activo = 1 ORDER BY nombre');
    return ok(res, data);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, descripcion, icono } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO categorias_productos (nombre, descripcion, icono) VALUES (?, ?, ?)',
      [nombre, descripcion || null, icono || null]
    );
    return created(res, { id: result.insertId }, 'Categoría creada');
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, descripcion, icono, activo } = req.body;
    await pool.execute(
      'UPDATE categorias_productos SET nombre=?, descripcion=?, icono=?, activo=? WHERE id=?',
      [nombre, descripcion || null, icono || null, activo ?? 1, req.params.id]
    );
    return ok(res, null, 'Categoría actualizada');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    const pool = getDB();
    await pool.execute('UPDATE categorias_productos SET activo = 0 WHERE id = ?', [req.params.id]);
    return ok(res, null, 'Categoría eliminada');
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, eliminar };
