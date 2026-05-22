/**
 * Run once: initializes DB, runs schema + seed, creates hashed admin user.
 * Usage: node src/scripts/initDB.js
 */
require('dotenv').config();
const path   = require('path');
const fs     = require('fs');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const DB_PATH    = process.env.DB_PATH || path.join(__dirname, '../../database/bunkers.db');
const schemaPath = path.join(__dirname, '../../database/schema.sql');
const seedPath   = path.join(__dirname, '../../database/seed.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('📦 Inicializando base de datos...');

// Schema
db.exec(fs.readFileSync(schemaPath, 'utf8'));
console.log('✅ Schema aplicado');

// Seed (only if empty)
const count = db.prepare('SELECT COUNT(*) as c FROM roles').get().c;
if (count === 0) {
  db.exec(fs.readFileSync(seedPath, 'utf8'));
  console.log('✅ Datos iniciales cargados');
} else {
  console.log('ℹ️  Datos ya existentes, omitiendo seed');
}

// Admin user
const existing = db.prepare("SELECT id FROM usuarios WHERE email = 'admin@bunkers.local'").get();
if (!existing) {
  const hashed = bcrypt.hashSync('Admin2024!', 10);
  db.prepare(`
    INSERT INTO usuarios (nombre, email, password, rol_id, bunker_id)
    VALUES ('Administrador Sistema', 'admin@bunkers.local', ?, 1, NULL)
  `).run(hashed);
  console.log('✅ Usuario admin creado: admin@bunkers.local / Admin2024!');
} else {
  console.log('ℹ️  Usuario admin ya existe');
}

// Sample inventory for Bunker Reynosa
const invCount = db.prepare('SELECT COUNT(*) as c FROM inventario').get().c;
if (invCount === 0) {
  const rows = [
    [1,1,3,2,10],[1,2,5,3,15],[1,3,4,2,10],[1,4,8,4,20],
    [1,5,10,5,30],[1,9,15,10,50],[1,12,100,50,200],
    [1,13,200,100,500],[1,16,2,1,5],[1,17,2,1,5],
  ];
  const stmt = db.prepare(
    'INSERT INTO inventario (bunker_id,producto_id,cantidad,stock_minimo,stock_maximo) VALUES (?,?,?,?,?)'
  );
  rows.forEach(r => stmt.run(...r));
  console.log('✅ Inventario inicial cargado');
}

console.log('🎉 Base de datos lista');
db.close();
