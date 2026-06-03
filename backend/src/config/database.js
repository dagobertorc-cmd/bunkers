const mysql = require('mysql2/promise');

let pool;

function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      host:               process.env.DB_HOST     || 'localhost',
      user:               process.env.DB_USER     || 'root',
      password:           process.env.DB_PASS     || '',
      database:           process.env.DB_NAME     || 'bunkers',
      port:               parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
    });
  }
  return pool;
}

async function withTransaction(fn) {
  const conn = await getDB().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function initDB() {
  await getDB().query('SELECT 1');
  console.log('✅ Conexión a MySQL establecida');
  return getDB();
}

module.exports = { getDB, initDB, withTransaction };
