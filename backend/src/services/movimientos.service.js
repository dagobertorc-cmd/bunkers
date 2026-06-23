const { getDB, withTransaction } = require('../config/database');
const alertasService   = require('./alertas.service');
const { getTipos }     = require('./tiposMovimiento');
const { invalidate }   = require('../utils/memcache');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const TIPOS_SALIDA  = new Set(['SALIDA', 'TRASLADO', 'PRESTAMO']);
const TIPOS_ENTRADA = new Set(['ENTRADA', 'DEVOLUCION', 'AJUSTE']);

const crear = async (datos) => {
  const {
    tipo_movimiento_id, bunker_id, tienda_destino_id,
    bunker_destino_id, producto_id, cantidad,
    usuario_id, ticket_id, observaciones, foto_evidencia,
  } = datos;

  const { byId } = await getTipos();
  const tipoNombre = byId.get(Number(tipo_movimiento_id));
  if (!tipoNombre) throw { type: 'BUSINESS_ERROR', message: 'Tipo de movimiento inválido' };

  const resultado = await withTransaction(async (conn) => {
    if (TIPOS_SALIDA.has(tipoNombre)) {
      const [[inv]] = await conn.execute(
        'SELECT cantidad FROM inventario WHERE bunker_id = ? AND producto_id = ?',
        [bunker_id, producto_id]
      );
      if (!inv || inv.cantidad < cantidad) {
        throw {
          type: 'BUSINESS_ERROR',
          message: `Stock insuficiente. Disponible: ${inv?.cantidad || 0}, Solicitado: ${cantidad}`,
        };
      }
      await conn.execute(`
        UPDATE inventario SET cantidad = cantidad - ?, updated_at = CURRENT_TIMESTAMP
        WHERE bunker_id = ? AND producto_id = ?
      `, [cantidad, bunker_id, producto_id]);
    }

    if (TIPOS_ENTRADA.has(tipoNombre)) {
      const [[existing]] = await conn.execute(
        'SELECT id FROM inventario WHERE bunker_id = ? AND producto_id = ?',
        [bunker_id, producto_id]
      );
      if (existing) {
        await conn.execute(`
          UPDATE inventario SET cantidad = cantidad + ?, updated_at = CURRENT_TIMESTAMP
          WHERE bunker_id = ? AND producto_id = ?
        `, [cantidad, bunker_id, producto_id]);
      } else {
        await conn.execute(
          'INSERT INTO inventario (bunker_id, producto_id, cantidad) VALUES (?, ?, ?)',
          [bunker_id, producto_id, cantidad]
        );
      }
    }

    if (tipoNombre === 'TRASLADO' && bunker_destino_id) {
      const [[existingDest]] = await conn.execute(
        'SELECT id FROM inventario WHERE bunker_id = ? AND producto_id = ?',
        [bunker_destino_id, producto_id]
      );
      if (existingDest) {
        await conn.execute(`
          UPDATE inventario SET cantidad = cantidad + ?, updated_at = CURRENT_TIMESTAMP
          WHERE bunker_id = ? AND producto_id = ?
        `, [cantidad, bunker_destino_id, producto_id]);
      } else {
        await conn.execute(
          'INSERT INTO inventario (bunker_id, producto_id, cantidad) VALUES (?, ?, ?)',
          [bunker_destino_id, producto_id, cantidad]
        );
      }
    }

    // Insert first, then generate folio from AUTO_INCREMENT id (evita race condition)
    const [result] = await conn.execute(`
      INSERT INTO movimientos (
        tipo_movimiento_id, bunker_id, tienda_destino_id,
        bunker_destino_id, producto_id, cantidad, usuario_id,
        ticket_id, observaciones, foto_evidencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tipo_movimiento_id, bunker_id, tienda_destino_id || null,
      bunker_destino_id || null, producto_id, cantidad, usuario_id,
      ticket_id || null, observaciones || null, foto_evidencia || null,
    ]);

    const id    = result.insertId;
    const folio = `MOV-${String(id).padStart(7, '0')}`;
    await conn.execute('UPDATE movimientos SET folio = ? WHERE id = ?', [folio, id]);

    return { id, folio };
  });

  // Fuera de la transacción: alertas y caché no bloquean el movimiento
  try {
    await alertasService.evaluarStock(bunker_id, producto_id);
  } catch (e) {
    console.warn('⚠️ Error al evaluar alertas:', e.message);
  }
  invalidate('kpis', 'consumoPorBunker');

  return resultado;
};

const listar = async (filtros) => {
  const pool = getDB();
  const { page, limit, offset } = paginate(filtros.page, filtros.limit);

  const conditions = ['1=1'];
  const params     = [];

  if (filtros.bunker_id)       { conditions.push('m.bunker_id = ?');       params.push(filtros.bunker_id); }
  if (filtros.producto_id)     { conditions.push('m.producto_id = ?');     params.push(filtros.producto_id); }
  if (filtros.usuario_id)      { conditions.push('m.usuario_id = ?');      params.push(filtros.usuario_id); }
  if (filtros.ticket_id)       { conditions.push('m.ticket_id = ?');       params.push(filtros.ticket_id); }
  if (filtros.fecha_desde)     { conditions.push('m.fecha_hora >= ?');     params.push(filtros.fecha_desde); }
  if (filtros.fecha_hasta)     { conditions.push('m.fecha_hora <= ?');     params.push(filtros.fecha_hasta); }
  if (filtros.tipo_movimiento) { conditions.push('tm.nombre = ?');         params.push(filtros.tipo_movimiento); }

  const where = conditions.join(' AND ');

  const [data] = await pool.execute(`
    SELECT m.id, m.folio, tm.nombre AS tipo_movimiento,
           b.nombre AS bunker, p.nombre AS producto,
           m.cantidad, u.nombre AS ingeniero,
           t.nombre AS tienda_destino, bd.nombre AS bunker_destino,
           tk.numero AS ticket,
           m.observaciones, m.foto_evidencia, m.fecha_hora
    FROM movimientos m
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    JOIN bunkers b           ON m.bunker_id          = b.id
    JOIN productos p         ON m.producto_id        = p.id
    JOIN usuarios u          ON m.usuario_id         = u.id
    LEFT JOIN tiendas t      ON m.tienda_destino_id  = t.id
    LEFT JOIN bunkers bd     ON m.bunker_destino_id  = bd.id
    LEFT JOIN tickets tk     ON m.ticket_id          = tk.id
    WHERE ${where}
    ORDER BY m.fecha_hora DESC
    LIMIT ${limit} OFFSET ${offset}
  `, params);

  const [[{ c }]] = await pool.execute(`
    SELECT COUNT(*) as c FROM movimientos m
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    WHERE ${where}
  `, params);

  return paginatedResponse(data, Number(c), page, limit);
};

const obtenerPorId = async (id) => {
  const pool = getDB();
  const [[row]] = await pool.execute(`
    SELECT m.*, tm.nombre AS tipo_movimiento,
           b.nombre AS bunker, p.nombre AS producto,
           u.nombre AS ingeniero, t.nombre AS tienda_destino,
           bd.nombre AS bunker_destino, tk.numero AS ticket
    FROM movimientos m
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    JOIN bunkers b           ON m.bunker_id          = b.id
    JOIN productos p         ON m.producto_id        = p.id
    JOIN usuarios u          ON m.usuario_id         = u.id
    LEFT JOIN tiendas t      ON m.tienda_destino_id  = t.id
    LEFT JOIN bunkers bd     ON m.bunker_destino_id  = bd.id
    LEFT JOIN tickets tk     ON m.ticket_id          = tk.id
    WHERE m.id = ?
  `, [id]);
  return row;
};

module.exports = { crear, listar, obtenerPorId };
