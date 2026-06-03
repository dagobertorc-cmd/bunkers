const { getDB }        = require('../config/database');
const { TIPOS_ALERTA } = require('../config/constants');

const evaluarStock = async (bunkerId, productoId) => {
  const pool = getDB();
  const [[inv]] = await pool.execute(
    'SELECT id, cantidad, stock_minimo FROM inventario WHERE bunker_id = ? AND producto_id = ?',
    [bunkerId, productoId]
  );

  if (!inv) return;

  let tipo, mensaje;
  if (inv.cantidad === 0) {
    tipo    = TIPOS_ALERTA.SIN_STOCK;
    mensaje = `Sin stock: producto #${productoId} en bunker #${bunkerId}`;
  } else if (inv.cantidad <= Math.floor(inv.stock_minimo * 0.5)) {
    tipo    = TIPOS_ALERTA.STOCK_CRITICO;
    mensaje = `Stock crítico: ${inv.cantidad} unidades (mínimo ${inv.stock_minimo})`;
  } else if (inv.cantidad <= inv.stock_minimo) {
    tipo    = TIPOS_ALERTA.STOCK_MINIMO;
    mensaje = `Stock mínimo alcanzado: ${inv.cantidad} unidades`;
  } else {
    return;
  }

  const [[existing]] = await pool.execute(`
    SELECT id FROM alertas_stock
    WHERE inventario_id = ? AND tipo_alerta = ? AND leida = 0
  `, [inv.id, tipo]);

  if (!existing) {
    await pool.execute(
      'INSERT INTO alertas_stock (inventario_id, tipo_alerta, mensaje) VALUES (?, ?, ?)',
      [inv.id, tipo, mensaje]
    );
  }
};

const listar = async ({ leida, page, limit, offset }) => {
  const pool = getDB();
  const conditions = leida !== undefined ? `WHERE a.leida = ${leida ? 1 : 0}` : '';

  const [data] = await pool.execute(`
    SELECT a.*, i.cantidad, i.stock_minimo,
           p.nombre AS producto,
           b.nombre AS bunker
    FROM alertas_stock a
    JOIN inventario i ON a.inventario_id = i.id
    JOIN productos  p ON i.producto_id   = p.id
    JOIN bunkers    b ON i.bunker_id     = b.id
    ${conditions}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);

  const [[{ c }]] = await pool.execute(`SELECT COUNT(*) as c FROM alertas_stock a ${conditions}`);
  return { data, total: Number(c), page, limit, pages: Math.ceil(Number(c) / limit) };
};

const marcarLeida = async (id, userId) => {
  const pool = getDB();
  await pool.execute(`
    UPDATE alertas_stock SET leida = 1, leida_por = ?, leida_at = CURRENT_TIMESTAMP WHERE id = ?
  `, [userId, id]);
  const [[row]] = await pool.execute('SELECT * FROM alertas_stock WHERE id = ?', [id]);
  return row;
};

module.exports = { evaluarStock, listar, marcarLeida };
