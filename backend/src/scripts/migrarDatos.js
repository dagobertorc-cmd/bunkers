/**
 * Migration: applies new schema additions and seeds real data.
 * Usage: node src/scripts/migrarDatos.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'bunkers',
    port:     parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    // ── Formatos ────────────────────────────────────────────────────────────────
    const fmtList = [
      { nombre: 'HEB',  descripcion: 'Tienda formato HEB' },
      { nombre: 'MTA',  descripcion: 'Tienda formato MTA (Mi Tienda del Ahorro)' },
      { nombre: 'OTRO', descripcion: 'Otro formato' },
    ];
    for (const f of fmtList) {
      await conn.execute('INSERT IGNORE INTO formatos (nombre, descripcion) VALUES (?, ?)', [f.nombre, f.descripcion]);
    }
    const getFmt = async (nombre) => {
      const [[row]] = await conn.execute('SELECT id FROM formatos WHERE nombre = ?', [nombre]);
      return row?.id;
    };
    console.log('✅ Formatos creados');

    // ── Bunkers + tiendas ────────────────────────────────────────────────────────
    const BUNKERS_DATA = [
      {
        nombre: 'Bunker Reynosa', ciudad: 'Reynosa',
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
        nombre: 'Bunker Tampico', ciudad: 'Tampico',
        tiendas: [
          { nombre: 'HEB Madero',   numero: '2936', ciudad: 'Tampico', fmt: 'HEB' },
          { nombre: 'HEB Ejercito', numero: '2964', ciudad: 'Tampico', fmt: 'HEB' },
          { nombre: 'HEB Hidalgo',  numero: '2973', ciudad: 'Tampico', fmt: 'HEB' },
        ],
      },
      {
        nombre: 'Bunker Victoria', ciudad: 'Victoria',
        tiendas: [{ nombre: 'HEB Victoria', numero: '2928', ciudad: 'Victoria', fmt: 'HEB' }],
      },
      {
        nombre: 'Bunker Querétaro', ciudad: 'Querétaro',
        tiendas: [
          { nombre: 'HEB Mirador',           numero: '2915', ciudad: 'Querétaro',        fmt: 'HEB' },
          { nombre: 'HEB Obaid',             numero: '2913', ciudad: 'Querétaro',        fmt: 'HEB' },
          { nombre: 'HEB Juriquilla',        numero: '2882', ciudad: 'Querétaro',        fmt: 'HEB' },
          { nombre: 'HEB Bernardo Quintana', numero: '5150', ciudad: 'Querétaro',        fmt: 'HEB' },
          { nombre: 'HEB Refugio',           numero: '2997', ciudad: 'Querétaro',        fmt: 'HEB' },
          { nombre: 'HEB San Juan del Río',  numero: '9105', ciudad: 'San Juan del Río', fmt: 'HEB' },
        ],
      },
      {
        nombre: 'Bunker San Luis', ciudad: 'San Luis Potosí',
        tiendas: [
          { nombre: 'HEB Las Lomas',       numero: '2912', ciudad: 'San Luis Potosí', fmt: 'HEB' },
          { nombre: 'HEB Carretera 57',    numero: '2932', ciudad: 'San Luis Potosí', fmt: 'HEB' },
          { nombre: 'HEB Los Pinos',       numero: '2940', ciudad: 'San Luis Potosí', fmt: 'HEB' },
          { nombre: 'HEB San Luis Potosí', numero: '2986', ciudad: 'San Luis Potosí', fmt: 'HEB' },
        ],
      },
      {
        nombre: 'Bunker Irapuato', ciudad: 'Irapuato',
        tiendas: [{ nombre: 'HEB Irapuato', numero: '2918', ciudad: 'Irapuato', fmt: 'HEB' }],
      },
      {
        nombre: 'Bunker Matamoros', ciudad: 'Matamoros',
        tiendas: [
          { nombre: 'MTA Las Brisas',   numero: '2906', ciudad: 'Matamoros', fmt: 'MTA' },
          { nombre: 'HEB Lauro Villar', numero: '2930', ciudad: 'Matamoros', fmt: 'HEB' },
          { nombre: 'HEB Matamoros',    numero: '2962', ciudad: 'Matamoros', fmt: 'HEB' },
        ],
      },
      {
        nombre: 'Bunker Laredo', ciudad: 'Nuevo Laredo',
        tiendas: [
          { nombre: 'MTA Reforma',    numero: '2911', ciudad: 'Nuevo Laredo', fmt: 'MTA' },
          { nombre: 'MTA Revolución', numero: '2948', ciudad: 'Nuevo Laredo', fmt: 'MTA' },
          { nombre: 'HEB Laredo',     numero: '2968', ciudad: 'Nuevo Laredo', fmt: 'HEB' },
        ],
      },
      {
        nombre: 'Bunker León', ciudad: 'León',
        tiendas: [
          { nombre: 'HEB Torres Landa', numero: '2957', ciudad: 'León', fmt: 'HEB' },
          { nombre: 'HEB Cerro Gordo',  numero: '2937', ciudad: 'León', fmt: 'HEB' },
          { nombre: 'HEB López Mateos', numero: '2984', ciudad: 'León', fmt: 'HEB' },
        ],
      },
      {
        nombre: 'Bunker Aguascalientes', ciudad: 'Aguascalientes',
        tiendas: [
          { nombre: 'HEB Maestros',       numero: '2913', ciudad: 'Aguascalientes', fmt: 'HEB' },
          { nombre: 'HEB Aguascalientes', numero: '2980', ciudad: 'Aguascalientes', fmt: 'HEB' },
        ],
      },
      {
        nombre: 'Bunker Saltillo', ciudad: 'Saltillo',
        tiendas: [
          { nombre: 'MTA Satélite',     numero: '2938', ciudad: 'Saltillo', fmt: 'MTA' },
          { nombre: 'HEB La Nogalera',  numero: '2989', ciudad: 'Saltillo', fmt: 'HEB' },
          { nombre: 'MTA Fundadores',   numero: '2991', ciudad: 'Saltillo', fmt: 'MTA' },
          { nombre: 'HEB San Patricio', numero: '2993', ciudad: 'Saltillo', fmt: 'HEB' },
          { nombre: 'HEB República',    numero: '2954', ciudad: 'Saltillo', fmt: 'HEB' },
          { nombre: 'MTA Colosio',      numero: '9115', ciudad: 'Saltillo', fmt: 'MTA' },
        ],
      },
      {
        nombre: 'Bunker Torreón', ciudad: 'Torreón',
        tiendas: [
          { nombre: 'HEB Revolución',    numero: '2953', ciudad: 'Torreón', fmt: 'HEB' },
          { nombre: 'HEB Senderos',      numero: '2934', ciudad: 'Torreón', fmt: 'HEB' },
          { nombre: 'HEB Independencia', numero: '5476', ciudad: 'Torreón', fmt: 'HEB' },
        ],
      },
      {
        nombre: 'Bunker Monclova', ciudad: 'Monclova',
        tiendas: [{ nombre: 'HEB Pape', numero: '2927', ciudad: 'Monclova', fmt: 'HEB' }],
      },
      {
        nombre: 'Bunker Piedras Negras', ciudad: 'Piedras Negras',
        tiendas: [{ nombre: 'HEB Piedras Negras', numero: '2971', ciudad: 'Piedras Negras', fmt: 'HEB' }],
      },
    ];

    // Remove placeholder tiendas
    await conn.execute("DELETE FROM tiendas WHERE numero LIKE '%-0%'");

    for (const bdata of BUNKERS_DATA) {
      const [[existing]] = await conn.execute('SELECT id FROM bunkers WHERE nombre = ?', [bdata.nombre]);
      let bunkerId;
      if (existing) {
        await conn.execute(
          'UPDATE bunkers SET ciudad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [bdata.ciudad, existing.id]
        );
        bunkerId = existing.id;
      } else {
        const [r] = await conn.execute(
          'INSERT INTO bunkers (nombre, ciudad) VALUES (?, ?)', [bdata.nombre, bdata.ciudad]
        );
        bunkerId = r.insertId;
      }

      for (const t of bdata.tiendas) {
        const fmtId = await getFmt(t.fmt);
        const [[existsTienda]] = await conn.execute('SELECT id FROM tiendas WHERE numero = ?', [t.numero]);
        if (!existsTienda) {
          await conn.execute(
            'INSERT INTO tiendas (nombre, numero, ciudad, bunker_id, formato_id) VALUES (?, ?, ?, ?, ?)',
            [t.nombre, t.numero, t.ciudad, bunkerId, fmtId]
          );
        } else {
          await conn.execute(
            'UPDATE tiendas SET nombre=?, ciudad=?, bunker_id=?, formato_id=? WHERE id=?',
            [t.nombre, t.ciudad, bunkerId, fmtId, existsTienda.id]
          );
        }
      }
    }
    console.log('✅ Bunkers y tiendas actualizados (14 bunkers, 44 tiendas)');

    // ── Users ────────────────────────────────────────────────────────────────────
    const USUARIOS = [
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

    let usersCreated = 0;
    for (const [username, password, rolId] of USUARIOS) {
      const email  = `${username.toLowerCase()}@bunkers.local`;
      const hashed = bcrypt.hashSync(password, 10);
      await conn.execute(`
        INSERT INTO usuarios (nombre, email, password, rol_id)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nombre     = VALUES(nombre),
          password   = VALUES(password),
          rol_id     = VALUES(rol_id),
          updated_at = CURRENT_TIMESTAMP
      `, [username, email, hashed, rolId]);
      usersCreated++;
      console.log(`  👤 ${username} (${['','SUPERADMIN','ADMIN','SUPERVISOR','INGENIERO'][rolId]}) → ${email}`);
    }
    console.log(`✅ ${usersCreated} usuarios creados/actualizados`);

    // ── Summary ──────────────────────────────────────────────────────────────────
    const [[{ b }]] = await conn.execute('SELECT COUNT(*) as b FROM bunkers WHERE activo=1');
    const [[{ t }]] = await conn.execute('SELECT COUNT(*) as t FROM tiendas WHERE activa=1');
    const [[{ u }]] = await conn.execute('SELECT COUNT(*) as u FROM usuarios WHERE activo=1');
    const [[{ f }]] = await conn.execute('SELECT COUNT(*) as f FROM formatos');

    console.log('\n📊 Estado final:');
    console.log(`   Bunkers  : ${Number(b)}`);
    console.log(`   Tiendas  : ${Number(t)}`);
    console.log(`   Usuarios : ${Number(u)}`);
    console.log(`   Formatos : ${Number(f)}`);
    console.log('\n🎉 Migración completada');
  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
