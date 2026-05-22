const { getDB } = require('../config/database');

const kpis = () => {
  const db = getDB();
  const totalProductos  = db.prepare('SELECT COUNT(*) as c FROM productos WHERE activo = 1').get().c;
  const totalMovHoy     = db.prepare("SELECT COUNT(*) as c FROM movimientos WHERE DATE(fecha_hora) = DATE('now')").get().c;
  const alertasPendientes = db.prepare('SELECT COUNT(*) as c FROM alertas_stock WHERE leida = 0').get().c;
  const stockCritico    = db.prepare('SELECT COUNT(*) as c FROM inventario WHERE cantidad <= stock_minimo').get().c;

  return { totalProductos, totalMovHoy, alertasPendientes, stockCritico };
};

const consumoPorBunker = () => {
  const db = getDB();
  return db.prepare(`
    SELECT b.nombre AS bunker,
           COUNT(m.id) AS total_movimientos,
           SUM(CASE WHEN tm.nombre = 'SALIDA' THEN m.cantidad ELSE 0 END) AS unidades_salidas
    FROM bunkers b
    LEFT JOIN movimientos m     ON b.id = m.bunker_id
    LEFT JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    WHERE b.activo = 1
    GROUP BY b.id, b.nombre
    ORDER BY unidades_salidas DESC
  `).all();
};

const topProductos = (limit = 10) => {
  const db = getDB();
  return db.prepare(`
    SELECT p.id, p.nombre AS producto,
           SUM(m.cantidad) AS total_salidas
    FROM movimientos m
    JOIN productos p ON m.producto_id = p.id
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    WHERE tm.nombre = 'SALIDA'
    GROUP BY p.id, p.nombre
    ORDER BY total_salidas DESC
    LIMIT ?
  `).all(limit);
};

const movimientosRecientes = (limit = 10) => {
  const db = getDB();
  return db.prepare(`
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
  `).all(limit);
};

module.exports = { kpis, consumoPorBunker, topProductos, movimientosRecientes };
