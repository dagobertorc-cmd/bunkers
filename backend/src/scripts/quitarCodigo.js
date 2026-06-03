/**
 * Migration: elimina la columna `codigo` de la tabla `productos`.
 * Uso: node src/scripts/quitarCodigo.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'bunkers',
    port:     parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    console.log('Iniciando migración: eliminar columna codigo de productos...');

    const [[{ cnt }]] = await conn.execute(`
      SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'productos' AND COLUMN_NAME = 'codigo'
    `);

    if (Number(cnt) === 0) {
      console.log('La columna codigo ya no existe. Nada que hacer.');
      return;
    }

    await conn.execute('ALTER TABLE productos DROP COLUMN codigo');
    console.log('Migración completada: columna codigo eliminada.');
  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
