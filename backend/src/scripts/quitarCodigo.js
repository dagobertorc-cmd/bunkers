/**
 * Migración: elimina la columna `codigo` de la tabla `productos`.
 * Uso: node src/scripts/quitarCodigo.js
 */
require('dotenv').config();
const path     = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/bunkers.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF');

console.log('Iniciando migración: eliminar columna codigo de productos...');

const hasCodigo = db.prepare("PRAGMA table_info(productos)").all().some(c => c.name === 'codigo');
if (!hasCodigo) {
  console.log('La columna codigo ya no existe. Nada que hacer.');
  db.close();
  process.exit(0);
}

db.transaction(() => {
  db.exec(`
    CREATE TABLE productos_sin_codigo (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre        VARCHAR(200) NOT NULL,
      descripcion   TEXT,
      categoria_id  INTEGER      NOT NULL REFERENCES categorias_productos(id),
      unidad_medida VARCHAR(30)  DEFAULT 'PZA',
      marca         VARCHAR(100),
      modelo        VARCHAR(100),
      num_parte     VARCHAR(100),
      activo        BOOLEAN      DEFAULT 1,
      created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    INSERT INTO productos_sin_codigo
      (id, nombre, descripcion, categoria_id, unidad_medida, marca, modelo, num_parte, activo, created_at, updated_at)
    SELECT id, nombre, descripcion, categoria_id, unidad_medida, marca, modelo, num_parte, activo, created_at, updated_at
    FROM productos;
  `);

  db.exec('DROP TABLE productos;');
  db.exec('ALTER TABLE productos_sin_codigo RENAME TO productos;');

  db.exec('DROP INDEX IF EXISTS idx_productos_codigo;');
  db.exec('CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);');
})();

db.pragma('foreign_keys = ON');
db.close();
console.log('Migración completada: columna codigo eliminada.');
