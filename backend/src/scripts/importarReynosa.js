/**
 * Imports bunker_reynosa.xlsx into Bunker Reynosa (id=1).
 * Usage: node src/scripts/importarReynosa.js [path/to/file.xlsx]
 */
require('dotenv').config();
const path  = require('path');
const xlsx  = require('xlsx');
const mysql = require('mysql2/promise');

const XLSX_PATH = process.argv[2] || path.join(__dirname, '../../../bunker_reynosa.xlsx');
const BUNKER_ID = 1;

const CATEGORY_RULES = [
  [/cable|plug|rj.?45|conector/i,       'Materiales Técnicos'],
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
function parseCantidad(raw) {
  const n = parseInt(String(raw ?? '').replace(/[^0-9]/g, ''), 10);
  return isNaN(n) || n < 1 ? 1 : n;
}
function inferUnidad(raw, descripcion) {
  const s = String(raw).toLowerCase();
  if (/mt|m$/.test(s)) return 'MT';
  if (/caja/i.test(descripcion)) return 'CAJA';
  return 'PZA';
}
function clean(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' || s.toUpperCase() === 'N/A' ? null : s;
}
const norm = (s) => String(s ?? '').trim().toLowerCase();

async function main() {
  const wb      = xlsx.readFile(XLSX_PATH);
  const sheet   = wb.Sheets[wb.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const rows    = rawRows.slice(1).filter(r => r.length >= 2);

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

  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'bunkers',
    port:     parseInt(process.env.DB_PORT || '3306'),
  });

  console.log(`\n📂 Leyendo: ${XLSX_PATH}`);
  console.log(`📊 Filas encontradas: ${rows.length}`);
  console.log(`🔀 Grupos únicos (producto+fabricante+modelo): ${groups.size}`);
  console.log('\nImportando...');

  let created = 0, updated = 0;

  try {
    await conn.beginTransaction();

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
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          g.nombre,
          g.condiciones.size ? `${g.descripcion} [${[...g.condiciones].join(', ')}]` : g.descripcion,
          cat.id, g.unidad, g.fabricante, g.modelo,
        ]);
        producto = { id: r.insertId };
        created++;
      }

      const [[existing]] = await conn.execute(
        'SELECT id, cantidad FROM inventario WHERE bunker_id = ? AND producto_id = ?',
        [BUNKER_ID, producto.id]
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
          [BUNKER_ID, producto.id, g.cantidad, minimo]
        );
        invId = res.insertId;
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

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }

  console.log(`\n✅ Productos nuevos creados : ${created}`);
  console.log(`🔄 Inventario upserted      : ${updated}`);
  console.log('\n📋 Resumen de grupos importados:');
  for (const [, g] of groups) {
    const flag = g.condiciones.size ? ' ⚠️  ' + [...g.condiciones].join(', ') : '';
    console.log(`   ${String(g.cantidad).padStart(3)} × ${g.nombre} [${g.fabricante ?? 'N/A'} ${g.modelo ?? ''}]${flag}`);
  }
  console.log('\n🎉 Importación completada');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
