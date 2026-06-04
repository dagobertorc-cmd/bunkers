const { getDB } = require('../config/database');
const xlsx      = require('xlsx');

function toExcel(res, rows, sheetName, filename) {
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(rows), sheetName);
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
}

const inventario = async (req, res, next) => {
  try {
    const pool = getDB();
    const cond   = req.query.bunker_id ? 'AND i.bunker_id = ?' : '';
    const params = req.query.bunker_id ? [req.query.bunker_id] : [];

    const [rows] = await pool.execute(`
      SELECT b.nombre AS Bunker, c.nombre AS Categoria,
             p.nombre AS Producto, p.marca AS Marca, p.modelo AS Modelo,
             i.cantidad AS Cantidad, i.stock_minimo AS StockMinimo,
             i.stock_maximo AS StockMaximo, p.unidad_medida AS Unidad,
             i.ubicacion AS Ubicacion,
             DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i') AS Actualizado
      FROM inventario i
      JOIN bunkers b              ON i.bunker_id    = b.id
      JOIN productos p            ON i.producto_id  = p.id
      JOIN categorias_productos c ON p.categoria_id = c.id
      WHERE p.activo = 1 ${cond}
      ORDER BY b.nombre, c.nombre, p.nombre
    `, params);

    toExcel(res, rows, 'Inventario', `inventario_${Date.now()}.xlsx`);
  } catch (err) { next(err); }
};

const movimientos = async (req, res, next) => {
  try {
    const pool = getDB();
    const conds  = ['1=1'];
    const params = [];

    if (req.query.bunker_id)   { conds.push('m.bunker_id = ?');     params.push(req.query.bunker_id); }
    if (req.query.fecha_desde) { conds.push('m.fecha_hora >= ?');   params.push(req.query.fecha_desde); }
    if (req.query.fecha_hasta) { conds.push('m.fecha_hora <= ?');   params.push(req.query.fecha_hasta); }

    const [rows] = await pool.execute(`
      SELECT m.folio AS Folio,
             DATE_FORMAT(m.fecha_hora, '%Y-%m-%d %H:%i') AS Fecha,
             tm.nombre AS TipoMovimiento,
             b.nombre  AS Bunker,
             p.nombre  AS Producto,
             m.cantidad AS Cantidad,
             u.nombre  AS Ingeniero,
             t.nombre  AS TiendaDestino,
             bd.nombre AS BunkerDestino,
             tk.numero AS Ticket,
             m.observaciones AS Observaciones
      FROM movimientos m
      JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
      JOIN bunkers b           ON m.bunker_id          = b.id
      JOIN productos p         ON m.producto_id        = p.id
      JOIN usuarios u          ON m.usuario_id         = u.id
      LEFT JOIN tiendas t      ON m.tienda_destino_id  = t.id
      LEFT JOIN bunkers bd     ON m.bunker_destino_id  = bd.id
      LEFT JOIN tickets tk     ON m.ticket_id          = tk.id
      WHERE ${conds.join(' AND ')}
      ORDER BY m.fecha_hora DESC
      LIMIT 10000
    `, params);

    toExcel(res, rows, 'Movimientos', `movimientos_${Date.now()}.xlsx`);
  } catch (err) { next(err); }
};

const stockCritico = async (req, res, next) => {
  try {
    const pool   = getDB();
    const cond   = req.query.bunker_id ? 'AND i.bunker_id = ?' : '';
    const params = req.query.bunker_id ? [req.query.bunker_id] : [];

    const [rows] = await pool.execute(`
      SELECT b.nombre AS Bunker, c.nombre AS Categoria,
             p.nombre AS Producto, i.cantidad AS Cantidad,
             i.stock_minimo AS StockMinimo,
             ROUND(i.cantidad * 100.0 / i.stock_minimo, 1) AS PorcentajeStock,
             p.unidad_medida AS Unidad
      FROM inventario i
      JOIN bunkers b              ON i.bunker_id    = b.id
      JOIN productos p            ON i.producto_id  = p.id
      JOIN categorias_productos c ON p.categoria_id = c.id
      WHERE i.cantidad <= i.stock_minimo ${cond}
      ORDER BY (i.cantidad * 1.0 / i.stock_minimo) ASC
    `, params);

    toExcel(res, rows, 'Stock Crítico', `stock_critico_${Date.now()}.xlsx`);
  } catch (err) { next(err); }
};

module.exports = { inventario, movimientos, stockCritico };
