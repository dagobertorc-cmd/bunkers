const { getDB } = require('../config/database');
const { ok, created, notFound } = require('../utils/response.utils');

const listar = async (req, res, next) => {
  try {
    const pool = getDB();
    const conditions = ['t.activa = 1'];
    const params = [];
    if (req.query.bunker_id)  { conditions.push('t.bunker_id = ?');  params.push(req.query.bunker_id); }
    if (req.query.formato_id) { conditions.push('t.formato_id = ?'); params.push(req.query.formato_id); }
    const where = conditions.join(' AND ');
    const [data] = await pool.execute(`
      SELECT t.*, b.nombre AS bunker_nombre, f.nombre AS formato_nombre
      FROM tiendas t
      JOIN bunkers b ON t.bunker_id = b.id
      LEFT JOIN formatos f ON t.formato_id = f.id
      WHERE ${where} ORDER BY t.nombre
    `, params);
    return ok(res, data);
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const pool = getDB();
    const [[tienda]] = await pool.execute('SELECT * FROM tiendas WHERE id = ?', [req.params.id]);
    if (!tienda) return notFound(res, 'Tienda no encontrada');
    return ok(res, tienda);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, numero, ciudad, direccion, bunker_id, formato_id } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO tiendas (nombre, numero, ciudad, direccion, bunker_id, formato_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, numero || null, ciudad, direccion || null, bunker_id, formato_id || null]
    );
    return created(res, { id: result.insertId }, 'Tienda creada');
  } catch (err) { next(err); }
};

const ingenieros = async (req, res, next) => {
  try {
    const pool = getDB();
    const [data] = await pool.execute(`
      SELECT u.id, u.nombre, u.email, r.nombre AS rol
      FROM ingeniero_tiendas it
      JOIN usuarios u ON it.usuario_id = u.id
      JOIN roles r    ON u.rol_id      = r.id
      WHERE it.tienda_id = ?
      ORDER BY u.nombre
    `, [req.params.id]);
    return ok(res, data);
  } catch (err) { next(err); }
};

const asignarIngeniero = async (req, res, next) => {
  try {
    const pool = getDB();
    await pool.execute(
      'INSERT IGNORE INTO ingeniero_tiendas (usuario_id, tienda_id) VALUES (?, ?)',
      [req.body.usuario_id, req.params.id]
    );
    return ok(res, null, 'Ingeniero asignado');
  } catch (err) { next(err); }
};

const desasignarIngeniero = async (req, res, next) => {
  try {
    const pool = getDB();
    await pool.execute(
      'DELETE FROM ingeniero_tiendas WHERE tienda_id = ? AND usuario_id = ?',
      [req.params.id, req.params.userId]
    );
    return ok(res, null, 'Ingeniero desasignado');
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const pool = getDB();
    const { nombre, numero, ciudad, direccion, bunker_id, activa } = req.body;
    await pool.execute(
      'UPDATE tiendas SET nombre=?, numero=?, ciudad=?, direccion=?, bunker_id=?, activa=? WHERE id=?',
      [nombre, numero || null, ciudad, direccion || null, bunker_id, activa ?? 1, req.params.id]
    );
    return ok(res, null, 'Tienda actualizada');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    const pool = getDB();
    await pool.execute('UPDATE tiendas SET activa = 0 WHERE id = ?', [req.params.id]);
    return ok(res, null, 'Tienda desactivada');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, ingenieros, asignarIngeniero, desasignarIngeniero };
