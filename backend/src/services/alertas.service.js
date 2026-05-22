const { getDB }       = require('../config/database');
const { TIPOS_ALERTA } = require('../config/constants');

const evaluarStock = async (bunkerId, productoId) => {
  const db  = getDB();
  const inv = db.prepare(
    'SELECT id, cantidad, stock_minimo FROM inventario WHERE bunker_id = ? AND producto_id = ?'
  ).get(bunkerId, productoId);

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
    return; // Stock OK, no alertar
  }

  // Solo crear alerta si no hay una no leída del mismo tipo
  const existing = db.prepare(`
    SELECT id FROM alertas_stock
    WHERE inventario_id = ? AND tipo_alerta = ? AND leida = 0
  `).get(inv.id, tipo);

  if (!existing) {
    db.prepare(
      'INSERT INTO alertas_stock (inventario_id, tipo_alerta, mensaje) VALUES (?, ?, ?)'
    ).run(inv.id, tipo, mensaje);
  }
};

const listar = ({ leida, page, limit, offset }) => {
  const db = getDB();
  const conditions = leida !== undefined ? `WHERE a.leida = ${leida ? 1 : 0}` : '';

  const data = db.prepare(`
    SELECT a.*, i.cantidad, i.stock_minimo,
           p.nombre AS producto, p.codigo,
           b.nombre AS bunker
    FROM alertas_stock a
    JOIN inventario i ON a.inventario_id = i.id
    JOIN productos  p ON i.producto_id   = p.id
    JOIN bunkers    b ON i.bunker_id     = b.id
    ${conditions}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = db.prepare(`SELECT COUNT(*) as c FROM alertas_stock a ${conditions}`).get().c;
  return { data, total, page, limit, pages: Math.ceil(total / limit) };
};

const marcarLeida = (id, userId) => {
  const db = getDB();
  db.prepare(`
    UPDATE alertas_stock SET leida = 1, leida_por = ?, leida_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(userId, id);
  return db.prepare('SELECT * FROM alertas_stock WHERE id = ?').get(id);
};

module.exports = { evaluarStock, listar, marcarLeida };
