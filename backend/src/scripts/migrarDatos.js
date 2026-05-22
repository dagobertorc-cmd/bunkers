/**
 * Migration: applies new schema additions and seeds real data.
 * - Adds formatos, ingeniero_tiendas tables
 * - Adds formato_id column to tiendas if missing
 * - Replaces placeholder bunkers/tiendas with real data from bunkers-tiendas.png
 * - Creates all 27 users with hashed passwords
 * Run: node src/scripts/migrarDatos.js
 */
require('dotenv').config();
const path   = require('path');
const fs     = require('fs');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/bunkers.db');
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// ── Apply schema (idempotent) ────────────────────────────────────────────────
const schemaPath = path.join(__dirname, '../../database/schema.sql');
db.exec(fs.readFileSync(schemaPath, 'utf8'));
console.log('✅ Schema aplicado');

// ── Add formato_id column if not yet present ─────────────────────────────────
const cols = db.prepare("PRAGMA table_info(tiendas)").all().map(c => c.name);
if (!cols.includes('formato_id')) {
  db.prepare('ALTER TABLE tiendas ADD COLUMN formato_id INTEGER REFERENCES formatos(id)').run();
  console.log('✅ Columna formato_id agregada a tiendas');
}

// ── Formatos ──────────────────────────────────────────────────────────────────
const fmtList = [
  { nombre: 'HEB',  descripcion: 'Tienda formato HEB' },
  { nombre: 'MTA',  descripcion: 'Tienda formato MTA (Mi Tienda del Ahorro)' },
  { nombre: 'OTRO', descripcion: 'Otro formato' },
];
const insertFmt = db.prepare('INSERT OR IGNORE INTO formatos (nombre, descripcion) VALUES (?, ?)');
fmtList.forEach(f => insertFmt.run(f.nombre, f.descripcion));
const getFmt = (nombre) => db.prepare("SELECT id FROM formatos WHERE nombre = ?").get(nombre)?.id;
console.log('✅ Formatos creados');

// ── Helper: get or create bunker ──────────────────────────────────────────────
const getBunker = (nombre, ciudad) => {
  let b = db.prepare('SELECT id FROM bunkers WHERE nombre = ?').get(nombre);
  if (!b) {
    const r = db.prepare('INSERT INTO bunkers (nombre, ciudad) VALUES (?, ?)').run(nombre, ciudad);
    b = { id: r.lastInsertRowid };
  }
  return b.id;
};

// ── Real bunkers + tiendas from image ────────────────────────────────────────
const BUNKERS_DATA = [
  {
    nombre: 'Bunker Reynosa', ciudad: 'Reynosa', codigo: '2987',
    tiendas: [
      { nombre: 'MTA Bugambilias',   numero: '2931', ciudad: 'Reynosa',       fmt: 'MTA' },
      { nombre: 'MTA Periférico',    numero: '2969', ciudad: 'Reynosa',       fmt: 'MTA' },
      { nombre: 'MTA Río Bravo',     numero: '2972', ciudad: 'Río Bravo',     fmt: 'MTA' },
      { nombre: 'MTA Aeropuerto',    numero: '2995', ciudad: 'Reynosa',       fmt: 'MTA' },
      { nombre: 'MTA San Fernando',  numero: '5107', ciudad: 'San Fernando',  fmt: 'MTA' },
      { nombre: 'HEB Monclova',      numero: '2960', ciudad: 'Reynosa',       fmt: 'HEB' },
      { nombre: 'HEB Las Fuentes',   numero: '2987', ciudad: 'Reynosa',       fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Tampico', ciudad: 'Tampico', codigo: '2964',
    tiendas: [
      { nombre: 'HEB Madero',   numero: '2936', ciudad: 'Tampico', fmt: 'HEB' },
      { nombre: 'HEB Ejercito', numero: '2964', ciudad: 'Tampico', fmt: 'HEB' },
      { nombre: 'HEB Hidalgo',  numero: '2973', ciudad: 'Tampico', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Victoria', ciudad: 'Victoria', codigo: '2928',
    tiendas: [
      { nombre: 'HEB Victoria', numero: '2928', ciudad: 'Victoria', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Querétaro', ciudad: 'Querétaro', codigo: '2918',
    tiendas: [
      { nombre: 'HEB Mirador',           numero: '2915', ciudad: 'Querétaro',    fmt: 'HEB' },
      { nombre: 'HEB Obaid',             numero: '2913', ciudad: 'Querétaro',    fmt: 'HEB' },
      { nombre: 'HEB Juriquilla',        numero: '2882', ciudad: 'Querétaro',    fmt: 'HEB' },
      { nombre: 'HEB Bernardo Quintana', numero: '5150', ciudad: 'Querétaro',    fmt: 'HEB' },
      { nombre: 'HEB Refugio',           numero: '2997', ciudad: 'Querétaro',    fmt: 'HEB' },
      { nombre: 'HEB San Juan del Río',  numero: '9105', ciudad: 'San Juan del Río', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker San Luis', ciudad: 'San Luis Potosí', codigo: '2912',
    tiendas: [
      { nombre: 'HEB Las Lomas',      numero: '2912', ciudad: 'San Luis Potosí', fmt: 'HEB' },
      { nombre: 'HEB Carretera 57',   numero: '2932', ciudad: 'San Luis Potosí', fmt: 'HEB' },
      { nombre: 'HEB Los Pinos',      numero: '2940', ciudad: 'San Luis Potosí', fmt: 'HEB' },
      { nombre: 'HEB San Luis Potosí',numero: '2986', ciudad: 'San Luis Potosí', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Irapuato', ciudad: 'Irapuato', codigo: null,
    tiendas: [
      { nombre: 'HEB Irapuato', numero: '2918', ciudad: 'Irapuato', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Matamoros', ciudad: 'Matamoros', codigo: '2930',
    tiendas: [
      { nombre: 'MTA Las Brisas',   numero: '2906', ciudad: 'Matamoros', fmt: 'MTA' },
      { nombre: 'MTA Lauro Villar', numero: '2930', ciudad: 'Matamoros', fmt: 'MTA' },
      { nombre: 'HEB Matamoros',    numero: '2962', ciudad: 'Matamoros', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Laredo', ciudad: 'Nuevo Laredo', codigo: '2968',
    tiendas: [
      { nombre: 'MTA Reforma',    numero: '2911', ciudad: 'Nuevo Laredo', fmt: 'MTA' },
      { nombre: 'MTA Revolución', numero: '2948', ciudad: 'Nuevo Laredo', fmt: 'MTA' },
      { nombre: 'HEB Laredo',     numero: '2968', ciudad: 'Nuevo Laredo', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker León', ciudad: 'León', codigo: '2960',
    tiendas: [
      { nombre: 'HEB Torres Landa',  numero: '2957', ciudad: 'León', fmt: 'HEB' },
      { nombre: 'HEB Cerro Gordo',   numero: '2937', ciudad: 'León', fmt: 'HEB' },
      { nombre: 'HEB López Mateos',  numero: '2984', ciudad: 'León', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Aguascalientes', ciudad: 'Aguascalientes', codigo: '2980',
    tiendas: [
      { nombre: 'HEB Maestros',        numero: '2913', ciudad: 'Aguascalientes', fmt: 'HEB' },
      { nombre: 'HEB Aguascalientes',  numero: '2980', ciudad: 'Aguascalientes', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Saltillo', ciudad: 'Saltillo', codigo: '2954',
    tiendas: [
      { nombre: 'MTA Satélite',      numero: '2938', ciudad: 'Saltillo', fmt: 'MTA' },
      { nombre: 'HEB La Nogalera',   numero: '2989', ciudad: 'Saltillo', fmt: 'HEB' },
      { nombre: 'MTA Fundadores',    numero: '2991', ciudad: 'Saltillo', fmt: 'MTA' },
      { nombre: 'HEB San Patricio',  numero: '2993', ciudad: 'Saltillo', fmt: 'HEB' },
      { nombre: 'HEB República',     numero: '2954', ciudad: 'Saltillo', fmt: 'HEB' },
      { nombre: 'MTA Colosio',       numero: '9115', ciudad: 'Saltillo', fmt: 'MTA' },
    ],
  },
  {
    nombre: 'Bunker Torreón', ciudad: 'Torreón', codigo: '2933',
    tiendas: [
      { nombre: 'HEB Revolución',   numero: '2953', ciudad: 'Torreón', fmt: 'HEB' },
      { nombre: 'HEB Senderos',     numero: '2934', ciudad: 'Torreón', fmt: 'HEB' },
      { nombre: 'HEB Independencia',numero: '5476', ciudad: 'Torreón', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Monclova', ciudad: 'Monclova', codigo: '2927',
    tiendas: [
      { nombre: 'HEB Pape', numero: '2927', ciudad: 'Monclova', fmt: 'HEB' },
    ],
  },
  {
    nombre: 'Bunker Piedras Negras', ciudad: 'Piedras Negras', codigo: '2971',
    tiendas: [
      { nombre: 'HEB Piedras Negras', numero: '2971', ciudad: 'Piedras Negras', fmt: 'HEB' },
    ],
  },
];

// Remove old placeholder tiendas and replace bunkers
const migrateBunkersTx = db.transaction(() => {
  // Clear old placeholder tiendas (those with old numero format REY-01, MAT-01, etc.)
  db.prepare("DELETE FROM tiendas WHERE numero LIKE '%-0%'").run();

  for (const bdata of BUNKERS_DATA) {
    // Update or create bunker
    const existing = db.prepare('SELECT id FROM bunkers WHERE nombre = ?').get(bdata.nombre);
    let bunkerId;
    if (existing) {
      db.prepare('UPDATE bunkers SET ciudad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(bdata.ciudad, existing.id);
      bunkerId = existing.id;
    } else {
      const r = db.prepare('INSERT INTO bunkers (nombre, ciudad) VALUES (?, ?)').run(bdata.nombre, bdata.ciudad);
      bunkerId = r.lastInsertRowid;
    }

    // Insert tiendas
    for (const t of bdata.tiendas) {
      const fmtId = getFmt(t.fmt);
      const existsTienda = db.prepare('SELECT id FROM tiendas WHERE numero = ?').get(t.numero);
      if (!existsTienda) {
        db.prepare(`
          INSERT INTO tiendas (nombre, numero, ciudad, bunker_id, formato_id)
          VALUES (?, ?, ?, ?, ?)
        `).run(t.nombre, t.numero, t.ciudad, bunkerId, fmtId);
      } else {
        db.prepare('UPDATE tiendas SET nombre=?, ciudad=?, bunker_id=?, formato_id=? WHERE id=?')
          .run(t.nombre, t.ciudad, bunkerId, fmtId, existsTienda.id);
      }
    }
  }
});

migrateBunkersTx();
console.log('✅ Bunkers y tiendas actualizados (14 bunkers, 44 tiendas)');

// ── Users ─────────────────────────────────────────────────────────────────────
const USUARIOS = [
  // [username, password, rol_id]  roles: 1=SUPERADMIN, 2=ADMIN, 3=SUPERVISOR, 4=INGENIERO
  ['Darodriguez', 'DarodriguezH3B!', 1],
  ['Admin',       'SopTecH3B',       2],
  ['Arcantu',     'ArcantuH3B',      3],
  ['Jcazares',    'JcazaresH3B',     3],
  ['Dmartinez',   'DmartinezH3B',    3],
  ['Jegonzalez',  'JegonzalezH3B',   3],
  ['Ljimenez',    'LjimenezH3B',     3],
  ['Rolague',     'RolagueH3B',      3],
  ['Amendoza',    'AmendozaH3B',     4],
  ['Anino',       'AninoH3B',        4],
  ['Fbetancourt', 'FbetancourtH3B',  4],
  ['Langeles',    'LangelesH3B',     4],
  ['Masanchez',   'MasanchezH3B',    4],
  ['Oalmazan',    'OalmazanH3B',     4],
  ['Arngutierez', 'ArngutierrezH3B', 4],
  ['Cugarcia',    'CugarciaH3B',     4],
  ['Dchevaile',   'DchevaileH3B',    4],
  ['Emramirez',   'EmramirezH3B',    4],
  ['Fnoriega',    'FnoriegaH3B',     4],
  ['Gbolanos',    'GbolanosH3B',     4],
  ['Jsaludes',    'JsaludesH3B',     4],
  ['Asaldivar',   'AsaldivarH3B',    4],
  ['Ccortinas',   'CcortinasH3B',    4],
  ['Erherrera',   'ErherreraH3B',    4],
  ['Lcarlos',     'LcarlosH3B',      4],
  ['Orodrigue',   'OrodriguezH3B',   4],
  ['Ebriceno',    'EbricenoH3B',     4],
];

const upsertUser = db.prepare(`
  INSERT INTO usuarios (nombre, email, password, rol_id)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(email) DO UPDATE SET
    nombre   = excluded.nombre,
    password = excluded.password,
    rol_id   = excluded.rol_id,
    updated_at = CURRENT_TIMESTAMP
`);

let usersCreated = 0;
for (const [username, password, rolId] of USUARIOS) {
  const email  = `${username.toLowerCase()}@bunkers.local`;
  const hashed = bcrypt.hashSync(password, 10);
  upsertUser.run(username, email, hashed, rolId);
  usersCreated++;
  console.log(`  👤 ${username} (${['','SUPERADMIN','ADMIN','SUPERVISOR','INGENIERO'][rolId]}) → ${email}`);
}
console.log(`✅ ${usersCreated} usuarios creados/actualizados`);

// ── Summary ───────────────────────────────────────────────────────────────────
const totalBunkers = db.prepare('SELECT COUNT(*) as c FROM bunkers WHERE activo=1').get().c;
const totalTiendas = db.prepare('SELECT COUNT(*) as c FROM tiendas WHERE activa=1').get().c;
const totalUsers   = db.prepare('SELECT COUNT(*) as c FROM usuarios WHERE activo=1').get().c;
const totalFmts    = db.prepare('SELECT COUNT(*) as c FROM formatos').get().c;

console.log(`\n📊 Estado final:`);
console.log(`   Bunkers  : ${totalBunkers}`);
console.log(`   Tiendas  : ${totalTiendas}`);
console.log(`   Usuarios : ${totalUsers}`);
console.log(`   Formatos : ${totalFmts}`);
console.log('\n🎉 Migración completada');
db.close();
