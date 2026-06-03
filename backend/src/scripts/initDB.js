/**
 * Run once: initializes DB, runs schema + seed, creates hashed admin user.
 * Usage: node src/scripts/initDB.js
 */
require('dotenv').config();
const path   = require('path');
const fs     = require('fs');
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'bunkers',
    port:     parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true,
  });

  try {
    console.log('📦 Inicializando base de datos...');

    // Schema
    const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    await conn.query(schema);
    console.log('✅ Schema aplicado');

    // Seed (only if roles is empty)
    const [[{ c }]] = await conn.execute('SELECT COUNT(*) as c FROM roles');
    if (Number(c) === 0) {
      const seed = fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf8');
      await conn.query(seed);
      console.log('✅ Datos iniciales cargados');
    } else {
      console.log('ℹ️  Datos ya existentes, omitiendo seed');
    }

    // Admin user
    const [[existing]] = await conn.execute("SELECT id FROM usuarios WHERE email = 'admin@bunkers.local'");
    if (!existing) {
      const hashed = bcrypt.hashSync('Admin2024!', 10);
      await conn.execute(`
        INSERT INTO usuarios (nombre, email, password, rol_id, bunker_id)
        VALUES ('Administrador Sistema', 'admin@bunkers.local', ?, 1, NULL)
      `, [hashed]);
      console.log('✅ Usuario admin creado: admin@bunkers.local / Admin2024!');
    } else {
      console.log('ℹ️  Usuario admin ya existe');
    }

    // Sample inventory for Bunker Reynosa
    const [[{ inv }]] = await conn.execute('SELECT COUNT(*) as inv FROM inventario');
    if (Number(inv) === 0) {
      const rows = [
        [1,1,3,2,10],[1,2,5,3,15],[1,3,4,2,10],[1,4,8,4,20],
        [1,5,10,5,30],[1,9,15,10,50],[1,12,100,50,200],
        [1,13,200,100,500],[1,16,2,1,5],[1,17,2,1,5],
      ];
      for (const r of rows) {
        await conn.execute(
          'INSERT INTO inventario (bunker_id,producto_id,cantidad,stock_minimo,stock_maximo) VALUES (?,?,?,?,?)', r
        );
      }
      console.log('✅ Inventario inicial cargado');
    }

    console.log('🎉 Base de datos lista');
  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
