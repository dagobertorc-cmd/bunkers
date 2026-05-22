/**
 * Imports bunker_reynosa.xlsx into Bunker Reynosa (id=1).
 * Groups individual serialized items by (nombre+fabricante+modelo),
 * sums quantities, auto-creates products and categories, then upserts inventory.
 * Usage: node src/scripts/importarReynosa.js [path/to/file.xlsx]
 */
require('dotenv').config();
const path     = require('path');
const xlsx     = require('xlsx');
const Database = require('better-sqlite3');

const XLSX_PATH = process.argv[2] ||
  path.join(__dirname, '../../../bunker_reynosa.xlsx');
const DB_PATH   = process.env.DB_PATH ||
  path.join(__dirname, '../../database/bunkers.db');
const BUNKER_ID = 1;

// ---------- category inference ------------------------------------------------
const CATEGORY_RULES = [
  [/cable|plug|rj.?45|conector/i,      'Materiales Técnicos'],
  [/fusor|filmina|carro.*impr|cartucho/i,'Refacciones'],
  [/consumible|rollo|cinta|papel|toner/i,'Consumibles'],
  [/pesa|termometro|termómetro|multimetro/i,'Herramientas'],
  [/epp|señali|seguridad/i,             'Seguridad'],
];
function inferCategory(descripcion, nombre) {
  const txt = `${descripcion} ${nombre}`.toLowerCase();
  for (const [re, cat] of CATEGORY_RULES) if (re.test(txt)) return cat;
  return 'Equipos';
}

// ---------- parse cantidad ----------------------------------------------------
function parseCantidad(raw) {
  if (raw === null || raw === undefined) return 1;
  const n = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

// ---------- unit of measure ---------------------------------------------------
function inferUnidad(raw, descripcion) {
  const s = String(raw).toLowerCase();
  if (/mt|m$/.test(s)) return 'MT';
  if (/caja/i.test(descripcion)) return 'CAJA';
  return 'PZA';
}

// ---------- clean N/A values -------------------------------------------------
function clean(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' || s.toUpperCase() === 'N/A' ? null : s;
}

// ---------- normalise a grouping key -----------------------------------------
const norm = (s) => String(s ?? '').trim().toLowerCase();

// ============= MAIN ===========================================================
const wb      = xlsx.readFile(XLSX_PATH);
const sheet   = wb.Sheets[wb.SheetNames[0]];
const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Skip header row
const rows = rawRows.slice(1).filter(r => r.length >= 2);

// ---- Group by (nombre + fabricante + modelo) --------------------------------
const groups = new Map();
for (const r of rows) {
  const [rawQty, nombre, descripcion, fabricante, modelo, serie, condicion] = r;
  const key = `${norm(nombre)}|${norm(fabricante)}|${norm(modelo)}`;

  if (!groups.has(key)) {
    groups.set(key, {
      nombre:      String(nombre ?? '').trim(),
      descripcion: String(descripcion ?? nombre ?? '').trim(),
      fabricante:  clean(fabricante),
      modelo:      clean(modelo),
      categoria:   inferCategory(String(descripcion ?? ''), String(nombre ?? '')),
      unidad:      inferUnidad(rawQty, String(descripcion ?? '')),
      cantidad:    0,
      series:      [],
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

// ============= DB =============================================================
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// Helpers
const findOrCreateCategoria = db.transaction((nombre) => {
  let row = db.prepare('SELECT id FROM categorias_productos WHERE LOWER(nombre) = LOWER(?)').get(nombre);
  if (!row) {
    const r = db.prepare(
      'INSERT INTO categorias_productos (nombre) VALUES (?)'
    ).run(nombre);
    row = { id: r.lastInsertRowid };
  }
  return row.id;
});

const getMaxCode = () => {
  const row = db.prepare(
    "SELECT MAX(CAST(SUBSTR(codigo,5) AS INTEGER)) as m FROM productos WHERE codigo LIKE 'REY-%'"
  ).get();
  return (row?.m ?? 0) + 1;
};

let codeCounter  = getMaxCode();
let created = 0, updated = 0, skipped = 0;

const importTx = db.transaction(() => {
  for (const [, g] of groups) {
    // ---- find or create categoria
    const catId = findOrCreateCategoria(g.categoria);

    // ---- find existing product by (nombre + fabricante + modelo)
    let producto = db.prepare(`
      SELECT id FROM productos
      WHERE LOWER(nombre) = LOWER(?)
        AND LOWER(COALESCE(marca,''))  = LOWER(COALESCE(?,''))
        AND LOWER(COALESCE(modelo,'')) = LOWER(COALESCE(?,''))
    `).get(g.nombre, g.fabricante ?? '', g.modelo ?? '');

    if (!producto) {
      const codigo = `REY-${String(codeCounter).padStart(3, '0')}`;
      codeCounter++;
      const r = db.prepare(`
        INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, marca, modelo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        codigo, g.nombre,
        g.condiciones.size ? `${g.descripcion} [${[...g.condiciones].join(', ')}]` : g.descripcion,
        catId, g.unidad, g.fabricante, g.modelo
      );
      producto = { id: r.lastInsertRowid };
      created++;
    }

    // ---- upsert inventario for Bunker Reynosa
    let invId;
    const existing = db.prepare(
      'SELECT id, cantidad FROM inventario WHERE bunker_id = ? AND producto_id = ?'
    ).get(BUNKER_ID, producto.id);

    if (existing) {
      db.prepare(`
        UPDATE inventario SET cantidad = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(g.cantidad, existing.id);
      invId = existing.id;
      updated++;
    } else {
      const minimo = Math.max(1, Math.floor(g.cantidad * 0.3));
      const res = db.prepare(`
        INSERT INTO inventario (bunker_id, producto_id, cantidad, stock_minimo)
        VALUES (?, ?, ?, ?)
      `).run(BUNKER_ID, producto.id, g.cantidad, minimo);
      invId = res.lastInsertRowid;
      updated++;
    }

    // ---- insert serial numbers (skip duplicates)
    for (const serie of g.series) {
      const condicion = g.condiciones.size ? [...g.condiciones][0] : 'Buen estado';
      try {
        db.prepare(`
          INSERT OR IGNORE INTO seriales (inventario_id, serie, condicion)
          VALUES (?, ?, ?)
        `).run(invId, serie, condicion);
      } catch { /* ignore unique constraint violations */ }
    }
  }
});

console.log(`\n📂 Leyendo: ${XLSX_PATH}`);
console.log(`📊 Filas encontradas: ${rows.length}`);
console.log(`🔀 Grupos únicos (producto+fabricante+modelo): ${groups.size}`);
console.log('\nImportando...');

importTx();

console.log(`\n✅ Productos nuevos creados : ${created}`);
console.log(`🔄 Inventario upserted      : ${updated}`);
console.log('\n📋 Resumen de grupos importados:');
for (const [, g] of groups) {
  const flag = g.condiciones.size ? ' ⚠️  ' + [...g.condiciones].join(', ') : '';
  console.log(`   ${String(g.cantidad).padStart(3)} × ${g.nombre} [${g.fabricante ?? 'N/A'} ${g.modelo ?? ''}]${flag}`);
}

db.close();
console.log('\n🎉 Importación completada');
