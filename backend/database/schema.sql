-- Bunkers de Refacciones — Schema
-- Compatible: SQLite 3 (dev) / MySQL 8 (prod)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  permisos    TEXT         NOT NULL DEFAULT '{}',
  descripcion VARCHAR(255),
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_roles_nombre ON roles(nombre);

CREATE TABLE IF NOT EXISTS tipos_movimiento (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  activo      BOOLEAN      DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bunkers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  ciudad      VARCHAR(100) NOT NULL,
  direccion   TEXT,
  responsable VARCHAR(150),
  telefono    VARCHAR(20),
  activo      BOOLEAN      DEFAULT 1,
  es_crearh   BOOLEAN      DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bunkers_ciudad ON bunkers(ciudad);

CREATE TABLE IF NOT EXISTS tiendas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     VARCHAR(150) NOT NULL,
  numero     VARCHAR(20)  UNIQUE,
  ciudad     VARCHAR(100) NOT NULL,
  direccion  TEXT,
  bunker_id  INTEGER      NOT NULL REFERENCES bunkers(id) ON DELETE RESTRICT,
  formato_id INTEGER      REFERENCES formatos(id),
  activa     BOOLEAN      DEFAULT 1,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tiendas_bunker ON tiendas(bunker_id);
CREATE INDEX IF NOT EXISTS idx_tiendas_ciudad ON tiendas(ciudad);

CREATE TABLE IF NOT EXISTS usuarios (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  rol_id       INTEGER      NOT NULL REFERENCES roles(id),
  bunker_id    INTEGER      REFERENCES bunkers(id),
  telefono     VARCHAR(20),
  activo       BOOLEAN      DEFAULT 1,
  ultimo_login DATETIME,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usuarios_email  ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol    ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_bunker ON usuarios(bunker_id);

CREATE TABLE IF NOT EXISTS categorias_productos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  icono       VARCHAR(50),
  activo      BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS productos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo        VARCHAR(50)  NOT NULL UNIQUE,
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
CREATE INDEX IF NOT EXISTS idx_productos_codigo    ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_nombre    ON productos(nombre);

CREATE TABLE IF NOT EXISTS inventario (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  bunker_id    INTEGER NOT NULL REFERENCES bunkers(id)   ON DELETE CASCADE,
  producto_id  INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad     INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  stock_maximo INTEGER,
  ubicacion    VARCHAR(100),
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bunker_id, producto_id)
);
CREATE INDEX IF NOT EXISTS idx_inventario_bunker   ON inventario(bunker_id);
CREATE INDEX IF NOT EXISTS idx_inventario_producto ON inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_inventario_stock    ON inventario(cantidad);

CREATE TABLE IF NOT EXISTS tickets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  numero      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion TEXT         NOT NULL,
  tienda_id   INTEGER      REFERENCES tiendas(id),
  usuario_id  INTEGER      REFERENCES usuarios(id),
  estado      VARCHAR(30)  DEFAULT 'ABIERTO',
  prioridad   VARCHAR(20)  DEFAULT 'MEDIA',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tickets_numero ON tickets(numero);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_tienda ON tickets(tienda_id);

CREATE TABLE IF NOT EXISTS movimientos (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  folio              VARCHAR(50)  UNIQUE,
  tipo_movimiento_id INTEGER      NOT NULL REFERENCES tipos_movimiento(id),
  bunker_id          INTEGER      NOT NULL REFERENCES bunkers(id),
  tienda_destino_id  INTEGER      REFERENCES tiendas(id),
  bunker_destino_id  INTEGER      REFERENCES bunkers(id),
  producto_id        INTEGER      NOT NULL REFERENCES productos(id),
  cantidad           INTEGER      NOT NULL CHECK (cantidad > 0),
  usuario_id         INTEGER      NOT NULL REFERENCES usuarios(id),
  ticket_id          INTEGER      REFERENCES tickets(id),
  observaciones      TEXT,
  foto_evidencia     VARCHAR(500),
  fecha_hora         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mov_bunker   ON movimientos(bunker_id);
CREATE INDEX IF NOT EXISTS idx_mov_producto ON movimientos(producto_id);
CREATE INDEX IF NOT EXISTS idx_mov_usuario  ON movimientos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mov_ticket   ON movimientos(ticket_id);
CREATE INDEX IF NOT EXISTS idx_mov_fecha    ON movimientos(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_mov_tipo     ON movimientos(tipo_movimiento_id);

CREATE TABLE IF NOT EXISTS alertas_stock (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  inventario_id INTEGER     NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
  tipo_alerta   VARCHAR(50) NOT NULL,
  mensaje       TEXT        NOT NULL,
  leida         BOOLEAN     DEFAULT 0,
  leida_por     INTEGER     REFERENCES usuarios(id),
  leida_at      DATETIME,
  created_at    DATETIME    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alertas_inventario ON alertas_stock(inventario_id);
CREATE INDEX IF NOT EXISTS idx_alertas_leida      ON alertas_stock(leida);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo       ON alertas_stock(tipo_alerta);

-- Serial numbers per inventory item (one row per physical unit)
CREATE TABLE IF NOT EXISTS seriales (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  inventario_id INTEGER NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
  serie       VARCHAR(100) NOT NULL,
  condicion   VARCHAR(100) DEFAULT 'Buen estado',
  activo      BOOLEAN DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_seriales_inventario ON seriales(inventario_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seriales_serie ON seriales(serie) WHERE serie != 'N/A';

-- Formatos de tienda (HEB, MTA, etc.)
CREATE TABLE IF NOT EXISTS formatos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  activo      BOOLEAN DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ingeniero ↔ Tienda (many-to-many)
CREATE TABLE IF NOT EXISTS ingeniero_tiendas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tienda_id  INTEGER NOT NULL REFERENCES tiendas(id)  ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, tienda_id)
);
CREATE INDEX IF NOT EXISTS idx_ing_tiendas_usuario ON ingeniero_tiendas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ing_tiendas_tienda  ON ingeniero_tiendas(tienda_id);

-- Requisiciones: supply orders from bunkers to CREARH
CREATE TABLE IF NOT EXISTS requisiciones (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  folio        VARCHAR(50)  NOT NULL UNIQUE,
  bunker_id    INTEGER      NOT NULL REFERENCES bunkers(id),
  usuario_id   INTEGER      NOT NULL REFERENCES usuarios(id),
  estado       VARCHAR(30)  NOT NULL DEFAULT 'PENDIENTE',
  observaciones TEXT,
  fecha_requerida DATE,
  atendida_por INTEGER      REFERENCES usuarios(id),
  atendida_at  DATETIME,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_req_bunker  ON requisiciones(bunker_id);
CREATE INDEX IF NOT EXISTS idx_req_estado  ON requisiciones(estado);
CREATE INDEX IF NOT EXISTS idx_req_usuario ON requisiciones(usuario_id);

CREATE TABLE IF NOT EXISTS requisicion_items (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  requisicion_id  INTEGER NOT NULL REFERENCES requisiciones(id) ON DELETE CASCADE,
  producto_id     INTEGER NOT NULL REFERENCES productos(id),
  cantidad_pedida INTEGER NOT NULL CHECK (cantidad_pedida > 0),
  cantidad_surtida INTEGER DEFAULT 0,
  observaciones   TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_req_items_req     ON requisicion_items(requisicion_id);
CREATE INDEX IF NOT EXISTS idx_req_items_producto ON requisicion_items(producto_id);
