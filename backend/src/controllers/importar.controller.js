const xlsx     = require('xlsx');
const { getDB } = require('../config/database');
const { ok, badRequest } = require('../utils/response.utils');

const CATEGORY_RULES = [
  [/cable|plug|rj.?45|conector/i,       'Materiales Técnicos'],
  [/fusor|filmina|carro.*impr|cartucho/i,'Refacciones'],
  [/consumible|rollo|cinta|papel|toner/i,'Consumibles'],
  [/pesa|termometro|termómetro|multimetro/i,'Herramientas'],
  [/epp|señali|seguridad/i,              'Seguridad'],
];
function inferCategory(desc, nombre) {
  const txt = `${desc} ${nombre}`.toLowerCase();
  for (const [re, cat] of CATEGORY_RULES) if (re.test(txt)) return cat;
  return 'Equipos';
}
const clean   = (v) => { const s = String(v ?? '').trim(); return s === '' || s.toUpperCase() === 'N/A' ? null : s; };
const normKey = (s) => String(s ?? '').trim().toLowerCase();
const parseCantidad = (v) => { const n = parseInt(String(v ?? '1').replace(/\D/g, ''), 10); return isNaN(n) || n < 1 ? 1 : n; };

const importarXlsx = (req, res, next) => {
  try {
    if (!req.file) return badRequest(res, 'Se requiere un archivo .xlsx');
    const bunkerId = parseInt(req.body.bunker_id);
    if (!bunkerId) return badRequest(res, 'bunker_id requerido');

    const db = getDB();
    const bunker = db.prepare('SELECT id FROM bunkers WHERE id = ?').get(bunkerId);
    if (!bunker) return badRequest(res, 'Bunker no encontrado');

    const wb      = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet   = wb.Sheets[wb.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const rows    = rawRows.slice(1).filter(r => r.length >= 2);

    // Group
    const groups = new Map();
    for (const r of rows) {
      const [rawQty, nombre, descripcion, fabricante, modelo, serie, condicion] = r;
      const key = `${normKey(nombre)}|${normKey(fabricante)}|${normKey(modelo)}`;
      if (!groups.has(key)) {
        groups.set(key, {
          nombre: String(nombre ?? '').trim(),
          descripcion: String(descripcion ?? nombre ?? '').trim(),
          fabricante: clean(fabricante),
          modelo:     clean(modelo),
          categoria:  inferCategory(String(descripcion ?? ''), String(nombre ?? '')),
          unidad:     'PZA',
          cantidad:   0,
          series:     [],
          condiciones: new Set(),
        });
      }
      const g = groups.get(key);
      g.cantidad += parseCantidad(rawQty);
      const s = clean(serie);
      if (s) g.series.push(s);
      if (condicion && String(condicion).trim().toLowerCase() !== 'buen estado')
        g.condiciones.add(String(condicion).trim());
    }

    let productosCreados = 0, inventarioActualizado = 0;

    const tx = db.transaction(() => {
      for (const [, g] of groups) {
        // find/create category
        let cat = db.prepare('SELECT id FROM categorias_productos WHERE LOWER(nombre)=LOWER(?)').get(g.categoria);
        if (!cat) {
          const r = db.prepare('INSERT INTO categorias_productos (nombre) VALUES (?)').run(g.categoria);
          cat = { id: r.lastInsertRowid };
        }

        // find/create product
        let prod = db.prepare(`
          SELECT id FROM productos
          WHERE LOWER(nombre)=LOWER(?) AND LOWER(COALESCE(marca,''))=LOWER(COALESCE(?,'')) AND LOWER(COALESCE(modelo,''))=LOWER(COALESCE(?,''))
        `).get(g.nombre, g.fabricante ?? '', g.modelo ?? '');

        if (!prod) {
          const r = db.prepare(`
            INSERT INTO productos (nombre,descripcion,categoria_id,unidad_medida,marca,modelo)
            VALUES (?,?,?,?,?,?)
          `).run(g.nombre, g.descripcion, cat.id, g.unidad, g.fabricante, g.modelo);
          prod = { id: r.lastInsertRowid };
          productosCreados++;
        }

        // upsert inventario
        const inv = db.prepare('SELECT id FROM inventario WHERE bunker_id=? AND producto_id=?').get(bunkerId, prod.id);
        let invId;
        if (inv) {
          db.prepare('UPDATE inventario SET cantidad=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(g.cantidad, inv.id);
          invId = inv.id;
        } else {
          const r = db.prepare('INSERT INTO inventario (bunker_id,producto_id,cantidad,stock_minimo) VALUES (?,?,?,?)').run(bunkerId, prod.id, g.cantidad, Math.max(1, Math.floor(g.cantidad * 0.3)));
          invId = r.lastInsertRowid;
        }
        inventarioActualizado++;

        // seriales
        for (const serie of g.series) {
          db.prepare('INSERT OR IGNORE INTO seriales (inventario_id,serie,condicion) VALUES (?,?,?)').run(invId, serie, g.condiciones.size ? [...g.condiciones][0] : 'Buen estado');
        }
      }
    });

    tx();

    return ok(res, {
      filas: rows.length,
      grupos: groups.size,
      productosCreados,
      inventarioActualizado,
    }, `Importación completada: ${groups.size} productos procesados`);
  } catch (err) { next(err); }
};

module.exports = { importarXlsx };
