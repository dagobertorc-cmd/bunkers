/**
 * Imports all BUNKER *.xlsx files from inventory_by_bunker/ into the DB.
 * Maps each file to its corresponding bunker by city name.
 * Usage: node src/scripts/importarTodosBunkers.js
 */
require('dotenv').config();
const path     = require('path');
const fs       = require('fs');
const xlsx     = require('xlsx');
const Database = require('better-sqlite3');

const INVENTORY_DIR = '/Users/jrodriguezc/code/bunkers/inventory_by_bunker';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/bunkers.db');

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

function parseCantidad(raw) {
  if (raw === null || raw === undefined) return 1;
  const n = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

function clean(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' || s.toUpperCase() === 'N/A' ? null : s;
}

const norm = (s) => String(s ?? '').trim().toLowerCase();

// Map filename keywords → ciudad in DB (bunkers.ciudad)
const FILE_TO_CIUDAD = {
  'Reynosa':       'Reynosa',
  'Matamoros':     'Matamoros',
  'Laredo':        'Nuevo Laredo',
  'Tampico':       'Tampico',
  'Saltillo':      'Saltillo',
  'Torr':          'Torreón',
  'Monclova':      'Monclova',
  'Piedras':       'Piedras Negras',
  'Quer':          'Querétaro',
  'León':          'León',
  'Leon':          'León',
  'San Luis':      'San Luis Potosí',
  'Irapuato':      'Irapuato',
  'Victoria':      'Victoria',
};

function ciudadFromFilename(filename) {
  for (const [key, ciudad] of Object.entries(FILE_TO_CIUDAD)) {
    if (filename.includes(key)) return ciudad;
  }
  return null;
}

function importFile(db, filePath, bunkerId, bunkerNombre) {
  const wb       = xlsx.readFile(filePath);
  const sheet    = wb.Sheets[wb.SheetNames[0]];
  const rawRows  = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const rows     = rawRows.slice(1).filter(r => r.length >= 2 && r[1]);

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

  const prefix = bunkerNombre.replace(/[^A-Za-z]/g, '').substring(0, 5).toUpperCase();

  const findOrCreateCategoria = db.transaction((nombre) => {
    let row = db.prepare('SELECT id FROM categorias_productos WHERE LOWER(nombre) = LOWER(?)').get(nombre);
    if (!row) {
      const r = db.prepare('INSERT INTO categorias_productos (nombre) VALUES (?)').run(nombre);
      row = { id: r.lastInsertRowid };
    }
    return row.id;
  });

  const getMaxCode = () => {
    const row = db.prepare(
      `SELECT MAX(CAST(SUBSTR(codigo, LENGTH(?)+2) AS INTEGER)) as m FROM productos WHERE codigo LIKE ?`
    ).get(prefix, `${prefix}-%`);
    return (row?.m ?? 0) + 1;
  };

  let codeCounter = getMaxCode();
  let created = 0, updated = 0;

  const tx = db.transaction(() => {
    for (const [, g] of groups) {
      const catId = findOrCreateCategoria(g.categoria);

      let producto = db.prepare(`
        SELECT id FROM productos
        WHERE LOWER(nombre) = LOWER(?)
          AND LOWER(COALESCE(marca,''))  = LOWER(COALESCE(?,''))
          AND LOWER(COALESCE(modelo,'')) = LOWER(COALESCE(?,''))
      `).get(g.nombre, g.fabricante ?? '', g.modelo ?? '');

      if (!producto) {
        const codigo = `${prefix}-${String(codeCounter).padStart(3, '0')}`;
        codeCounter++;
        const r = db.prepare(`
          INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, marca, modelo)
          VALUES (?, ?, ?, ?, 'PZA', ?, ?)
        `).run(codigo, g.nombre, g.descripcion, catId, g.fabricante, g.modelo);
        producto = { id: r.lastInsertRowid };
        created++;
      }

      const existing = db.prepare(
        'SELECT id FROM inventario WHERE bunker_id = ? AND producto_id = ?'
      ).get(bunkerId, producto.id);

      let invId;
      if (existing) {
        db.prepare('UPDATE inventario SET cantidad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(g.cantidad, existing.id);
        invId = existing.id;
      } else {
        const minimo = Math.max(1, Math.floor(g.cantidad * 0.3));
        const res = db.prepare(
          'INSERT INTO inventario (bunker_id, producto_id, cantidad, stock_minimo) VALUES (?, ?, ?, ?)'
        ).run(bunkerId, producto.id, g.cantidad, minimo);
        invId = res.lastInsertRowid;
        created++;
      }
      updated++;

      for (const serie of g.series) {
        const condicion = g.condiciones.size ? [...g.condiciones][0] : 'Buen estado';
        try {
          db.prepare('INSERT OR IGNORE INTO seriales (inventario_id, serie, condicion) VALUES (?, ?, ?)')
            .run(invId, serie, condicion);
        } catch { /* skip duplicates */ }
      }
    }
  });

  tx();
  return { rows: rows.length, groups: groups.size, created, updated };
}

// ===== MAIN =====
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

const files = fs.readdirSync(INVENTORY_DIR)
  .filter(f => f.endsWith('.xlsx') && !f.startsWith('~'));

let totalImported = 0;

for (const file of files) {
  const ciudad = ciudadFromFilename(file);
  if (!ciudad) {
    console.log(`⚠️  No matching city for: ${file}`);
    continue;
  }

  const bunker = db.prepare('SELECT id, nombre FROM bunkers WHERE ciudad = ? AND es_crearh = 0 LIMIT 1').get(ciudad);
  if (!bunker) {
    console.log(`⚠️  No bunker found for ciudad="${ciudad}" (file: ${file})`);
    continue;
  }

  const filePath = path.join(INVENTORY_DIR, file);
  const result = importFile(db, filePath, bunker.id, bunker.nombre);
  console.log(`✅ ${bunker.nombre} (${ciudad}) — ${result.rows} filas, ${result.groups} grupos`);
  totalImported += result.groups;
}

db.close();
console.log(`\n🎉 Importación completada — ${totalImported} registros de inventario procesados`);
