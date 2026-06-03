const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');

const listar = async (_req, res, next) => {
  try {
    const pool = getDB();
    const [data] = await pool.execute('SELECT * FROM bunkers WHERE activo = 1 ORDER BY nombre');
    return ok(res, data);
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const pool = getDB();
    const [[bunker]] = await pool.execute('SELECT * FROM bunkers WHERE id = ?', [req.params.id]);
    if (!bunker) return notFound(res, 'Bunker no encontrado');
    return ok(res, bunker);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, ciudad, direccion, responsable, telefono } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO bunkers (nombre, ciudad, direccion, responsable, telefono) VALUES (?, ?, ?, ?, ?)',
      [nombre, ciudad, direccion || null, responsable || null, telefono || null]
    );
    return created(res, { id: result.insertId }, 'Bunker creado');
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, ciudad, direccion, responsable, telefono, activo } = req.body;
    await pool.execute(`
      UPDATE bunkers SET nombre=?, ciudad=?, direccion=?, responsable=?, telefono=?,
      activo=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `, [nombre, ciudad, direccion || null, responsable || null, telefono || null, activo ?? 1, req.params.id]);
    return ok(res, null, 'Bunker actualizado');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    const pool = getDB();
    await pool.execute('UPDATE bunkers SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    return ok(res, null, 'Bunker desactivado');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
