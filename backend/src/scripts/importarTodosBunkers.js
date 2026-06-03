/**
 * Imports all BUNKER *.xlsx files from inventory_by_bunker/ into the DB.
 * Usage: node src/scripts/importarTodosBunkers.js
 */
require('dotenv').config();
const path  = require('path');
const fs    = require('fs');
const xlsx  = require('xlsx');
const mysql = require('mysql2/promise');

const INVENTORY_DIR = path.join(__dirname, '../../../../inventory_by_bunker');

const CATEGORY_RULES = [
  [/cable|plug|rj.?45|conector/i,       'Materiales Técnicos'],
  [/fusor|filmina|carro.*impr|cartucho/i,'Refacciones'],
  [/consumible|rollo|cinta|papel|toner/i,'Consumibles'],
  [/pesa|termometro|termómetro|multimetro/i,'Herramientas'],
  [/epp|señali|seguridad/i,             'Seguridad'],
];

function inferCategory(desc, nombre) {
  const txt = `${desc} ${nombre}`.toLowerCase();
  for (const [re, cat] of CATEGORY_RULES) if (re.test(txt)) return cat;
  return 'Equipos';
}
function parseCantidad(raw) {
  const n = parseInt(String(raw ?? '').replace(/[^0-9]/g, ''), 10);
  return isNaN(n) || n < 1 ? 1 : n;
}
function clean(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' || s.toUpperCase() === 'N/A' ? null : s;
}
const norm = (s) => String(s ?? '').trim().toLowerCase();

const FILE_TO_CIUDAD = {
  'Reynosa':  'Reynosa',
  'Matamoros':'Matamoros',
  'Laredo':   'Nuevo Laredo',
  'Tampico':  'Tampico',
  'Saltillo': 'Saltillo',
  'Torr':     'Torreón',
  'Monclova': 'Monclova',
  'Piedras':  'Piedras Negras',
  'Quer':     'Querétaro',
  'León':     'León',
  'Leon':     'León',
  'San Luis': 'San Luis Potosí',
  'Irapuato': 'Irapuato',
  'Victoria': 'Victoria',
};

function ciudadFromFilename(filename) {
  for (const [key, ciudad] of Object.entries(FILE_TO_CIUDAD)) {
    if (filename.includes(key)) return ciudad;
  }
  return null;
}

async function importFile(conn, filePath, bunkerId) {
  const wb      = xlsx.readFile(filePath);
  const sheet   = wb.Sheets[wb.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const rows    = rawRows.slice(1).filter(r => r.length >= 2 && r[1]);

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

  let created = 0, updated = 0;

  for (const [, g] of groups) {
    let [[cat]] = await conn.execute(
      'SELECT id FROM categorias_productos WHERE LOWER(nombre) = LOWER(?)', [g.categoria]
    );
    if (!cat) {
      const [r] = await conn.execute('INSERT INTO categorias_productos (nombre) VALUES (?)', [g.categoria]);
      cat = { id: r.insertId };
    }

    let [[producto]] = await conn.execute(`
      SELECT id FROM productos
      WHERE LOWER(nombre) = LOWER(?)
        AND LOWER(COALESCE(marca,''))  = LOWER(COALESCE(?,''))
        AND LOWER(COALESCE(modelo,'')) = LOWER(COALESCE(?,''))
    `, [g.nombre, g.fabricante ?? '', g.modelo ?? '']);

    if (!producto) {
      const [r] = await conn.execute(`
        INSERT INTO productos (nombre, descripcion, categoria_id, unidad_medida, marca, modelo)
        VALUES (?, ?, ?, 'PZA', ?, ?)
      `, [g.nombre, g.descripcion, cat.id, g.fabricante, g.modelo]);
      producto = { id: r.insertId };
      created++;
    }

    const [[existing]] = await conn.execute(
      'SELECT id FROM inventario WHERE bunker_id = ? AND producto_id = ?', [bunkerId, producto.id]
    );
    let invId;
    if (existing) {
      await conn.execute(
        'UPDATE inventario SET cantidad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [g.cantidad, existing.id]
      );
      invId = existing.id;
    } else {
      const minimo = Math.max(1, Math.floor(g.cantidad * 0.3));
      const [res] = await conn.execute(
        'INSERT INTO inventario (bunker_id, producto_id, cantidad, stock_minimo) VALUES (?, ?, ?, ?)',
        [bunkerId, producto.id, g.cantidad, minimo]
      );
      invId = res.insertId;
      created++;
    }
    updated++;

    for (const serie of g.series) {
      const condicion = g.condiciones.size ? [...g.condiciones][0] : 'Buen estado';
      await conn.execute(
        'INSERT IGNORE INTO seriales (inventario_id, serie, condicion) VALUES (?, ?, ?)',
        [invId, serie, condicion]
      );
    }
  }

  return { rows: rows.length, groups: groups.size, created, updated };
}

async function main() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'bunkers',
    port:     parseInt(process.env.DB_PORT || '3306'),
  });

  const files = fs.readdirSync(INVENTORY_DIR)
    .filter(f => f.endsWith('.xlsx') && !f.startsWith('~'));

  let totalImported = 0;

  try {
    for (const file of files) {
      const ciudad = ciudadFromFilename(file);
      if (!ciudad) { console.log(`⚠️  No matching city for: ${file}`); continue; }

      const [[bunker]] = await conn.execute(
        'SELECT id, nombre FROM bunkers WHERE ciudad = ? AND es_crearh = 0 LIMIT 1', [ciudad]
      );
      if (!bunker) { console.log(`⚠️  No bunker found for ciudad="${ciudad}" (file: ${file})`); continue; }

      await conn.beginTransaction();
      try {
        const result = await importFile(conn, path.join(INVENTORY_DIR, file), bunker.id);
        await conn.commit();
        console.log(`✅ ${bunker.nombre} (${ciudad}) — ${result.rows} filas, ${result.groups} grupos`);
        totalImported += result.groups;
      } catch (err) {
        await conn.rollback();
        console.error(`❌ Error en ${file}:`, err.message);
      }
    }
  } finally {
    await conn.end();
  }

  console.log(`\n🎉 Importación completada — ${totalImported} registros de inventario procesados`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
