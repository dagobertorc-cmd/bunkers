const { getDB } = require('../config/database');

const kpis = async () => {
  const pool = getDB();
  const [[{ totalProductos }]]    = await pool.execute('SELECT COUNT(*) as totalProductos FROM productos WHERE activo = 1');
  const [[{ totalMovHoy }]]       = await pool.execute("SELECT COUNT(*) as totalMovHoy FROM movimientos WHERE DATE(fecha_hora) = CURDATE()");
  const [[{ alertasPendientes }]] = await pool.execute('SELECT COUNT(*) as alertasPendientes FROM alertas_stock WHERE leida = 0');
  const [[{ stockCritico }]]      = await pool.execute('SELECT COUNT(*) as stockCritico FROM inventario WHERE cantidad <= stock_minimo');

  return {
    totalProductos:    Number(totalProductos),
    totalMovHoy:       Number(totalMovHoy),
    alertasPendientes: Number(alertasPendientes),
    stockCritico:      Number(stockCritico),
  };
};

const consumoPorBunker = async () => {
  const pool = getDB();
  const [rows] = await pool.execute(`
    SELECT b.nombre AS bunker,
           COUNT(m.id) AS total_movimientos,
           SUM(CASE WHEN tm.nombre = 'SALIDA' THEN m.cantidad ELSE 0 END) AS unidades_salidas
    FROM bunkers b
    LEFT JOIN movimientos m      ON b.id = m.bunker_id
    LEFT JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    WHERE b.activo = 1
    GROUP BY b.id, b.nombre
    ORDER BY unidades_salidas DESC
  `);
  return rows;
};

const topProductos = async (limit = 10) => {
  const pool = getDB();
  const [rows] = await pool.execute(`
    SELECT p.id, p.nombre AS producto,
           SUM(m.cantidad) AS total_salidas
    FROM movimientos m
    JOIN productos p ON m.producto_id = p.id
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    WHERE tm.nombre = 'SALIDA'
    GROUP BY p.id, p.nombre
    ORDER BY total_salidas DESC
    LIMIT ?
  `, [Number(limit)]);
  return rows;
};

const movimientosRecientes = async (limit = 10) => {
  const pool = getDB();
  const [rows] = await pool.execute(`
    SELECT m.id, m.folio, tm.nombre AS tipo,
           b.nombre AS bunker, p.nombre AS producto,
           m.cantidad, u.nombre AS ingeniero, m.fecha_hora
    FROM movimientos m
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    JOIN bunkers b           ON m.bunker_id          = b.id
    JOIN productos p         ON m.producto_id        = p.id
    JOIN usuarios u          ON m.usuario_id         = u.id
    ORDER BY m.fecha_hora DESC
    LIMIT ?
  `, [Number(limit)]);
  return rows;
};

module.exports = { kpis, consumoPorBunker, topProductos, movimientosRecientes };
