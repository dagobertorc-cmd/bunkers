const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');

const listar = async (_req, res, next) => {
  try {
    const pool = getDB();
    const [data] = await pool.execute('SELECT * FROM formatos WHERE activo = 1 ORDER BY nombre');
    return ok(res, data);
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const pool = getDB();
    const [[row]] = await pool.execute('SELECT * FROM formatos WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res, 'Formato no encontrado');
    return ok(res, row);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, descripcion } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO formatos (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );
    return created(res, { id: result.insertId }, 'Formato creado');
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, descripcion, activo } = req.body;
    await pool.execute(
      'UPDATE formatos SET nombre=?, descripcion=?, activo=? WHERE id=?',
      [nombre, descripcion || null, activo ?? 1, req.params.id]
    );
    return ok(res, null, 'Formato actualizado');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    const pool = getDB();
    await pool.execute('UPDATE formatos SET activo = 0 WHERE id = ?', [req.params.id]);
    return ok(res, null, 'Formato eliminado');
  } catch (err) { next(err); }
};

const tiendas = async (req, res, next) => {
  try {
    const pool = getDB();
    const [data] = await pool.execute(`
      SELECT t.*, b.nombre AS bunker_nombre
      FROM tiendas t
      JOIN bunkers b ON t.bunker_id = b.id
      WHERE t.formato_id = ? AND t.activa = 1
      ORDER BY t.nombre
    `, [req.params.id]);
    return ok(res, data);
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, tiendas };
