const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/bunkers.db');
let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
  }
  return db;
}

async function initDB() {
  const database = getDB();
  const schemaPath = path.join(__dirname, '../../database/schema.sql');

  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    database.exec(schema);
    console.log('✅ Schema de base de datos inicializado');
  }

  const count = database.prepare('SELECT COUNT(*) as c FROM roles').get();
  if (count.c === 0) {
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      database.exec(seed);
      console.log('✅ Datos iniciales cargados');
    }
  }

  return database;
}

module.exports = { getDB, initDB };
