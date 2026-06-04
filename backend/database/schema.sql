-- Bunkers de Refacciones — Schema MySQL 8

CREATE TABLE IF NOT EXISTS roles (
  id          INT           NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50)   NOT NULL,
  permisos    VARCHAR(2000) NOT NULL DEFAULT '{}',
  descripcion VARCHAR(255),
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tipos_movimiento (
  id          INT         NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  activo      TINYINT(1)  DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipos_mov_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS formatos (
  id          INT         NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  activo      TINYINT(1)  DEFAULT 1,
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_formatos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bunkers (
  id          INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  ciudad      VARCHAR(100) NOT NULL,
  direccion   TEXT,
  responsable VARCHAR(150),
  telefono    VARCHAR(20),
  activo      TINYINT(1)   DEFAULT 1,
  es_crearh   TINYINT(1)   DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bunkers_ciudad (ciudad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tiendas (
  id         INT          NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(150) NOT NULL,
  numero     VARCHAR(20),
  ciudad     VARCHAR(100) NOT NULL,
  direccion  TEXT,
  bunker_id  INT          NOT NULL,
  formato_id INT,
  activa     TINYINT(1)   DEFAULT 1,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tiendas_numero (numero),
  KEY idx_tiendas_bunker (bunker_id),
  KEY idx_tiendas_ciudad (ciudad),
  CONSTRAINT fk_tiendas_bunker  FOREIGN KEY (bunker_id)  REFERENCES bunkers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tiendas_formato FOREIGN KEY (formato_id) REFERENCES formatos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id           INT          NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  password     VARCHAR(255) NOT NULL,
  rol_id       INT          NOT NULL,
  bunker_id    INT,
  telefono     VARCHAR(20),
  activo       TINYINT(1)   DEFAULT 1,
  ultimo_login DATETIME,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email),
  KEY idx_usuarios_rol (rol_id),
  KEY idx_usuarios_bunker (bunker_id),
  CONSTRAINT fk_usuarios_rol    FOREIGN KEY (rol_id)    REFERENCES roles(id),
  CONSTRAINT fk_usuarios_bunker FOREIGN KEY (bunker_id) REFERENCES bunkers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categorias_productos (
  id          INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  icono       VARCHAR(50),
  activo      TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categorias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
  id            INT          NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  categoria_id  INT          NOT NULL,
  unidad_medida VARCHAR(30)  DEFAULT 'PZA',
  marca         VARCHAR(100),
  modelo        VARCHAR(100),
  num_parte     VARCHAR(100),
  activo        TINYINT(1)   DEFAULT 1,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_productos_categoria (categoria_id),
  KEY idx_productos_nombre (nombre),
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventario (
  id           INT      NOT NULL AUTO_INCREMENT,
  bunker_id    INT      NOT NULL,
  producto_id  INT      NOT NULL,
  cantidad     INT      NOT NULL DEFAULT 0,
  stock_minimo INT      NOT NULL DEFAULT 5,
  stock_maximo INT,
  ubicacion    VARCHAR(100),
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_inventario_bunker_producto (bunker_id, producto_id),
  KEY idx_inventario_bunker (bunker_id),
  KEY idx_inventario_producto (producto_id),
  KEY idx_inventario_stock (cantidad),
  CONSTRAINT fk_inv_bunker FOREIGN KEY (bunker_id)   REFERENCES bunkers(id)   ON DELETE CASCADE,
  CONSTRAINT fk_inv_prod   FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  CHECK (cantidad >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
  id          INT         NOT NULL AUTO_INCREMENT,
  numero      VARCHAR(50) NOT NULL,
  descripcion TEXT        NOT NULL,
  tienda_id   INT,
  usuario_id  INT,
  estado      VARCHAR(30) DEFAULT 'ABIERTO',
  prioridad   VARCHAR(20) DEFAULT 'MEDIA',
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tickets_numero (numero),
  KEY idx_tickets_estado (estado),
  KEY idx_tickets_tienda (tienda_id),
  CONSTRAINT fk_tickets_tienda  FOREIGN KEY (tienda_id)  REFERENCES tiendas(id),
  CONSTRAINT fk_tickets_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS movimientos (
  id                 INT          NOT NULL AUTO_INCREMENT,
  folio              VARCHAR(50),
  tipo_movimiento_id INT          NOT NULL,
  bunker_id          INT          NOT NULL,
  tienda_destino_id  INT,
  bunker_destino_id  INT,
  producto_id        INT          NOT NULL,
  cantidad           INT          NOT NULL,
  usuario_id         INT          NOT NULL,
  ticket_id          INT,
  observaciones      TEXT,
  foto_evidencia     VARCHAR(500),
  fecha_hora         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_movimientos_folio (folio),
  KEY idx_mov_bunker (bunker_id),
  KEY idx_mov_producto (producto_id),
  KEY idx_mov_usuario (usuario_id),
  KEY idx_mov_ticket (ticket_id),
  KEY idx_mov_fecha (fecha_hora),
  KEY idx_mov_tipo (tipo_movimiento_id),
  CHECK (cantidad > 0),
  CONSTRAINT fk_mov_tipo    FOREIGN KEY (tipo_movimiento_id) REFERENCES tipos_movimiento(id),
  CONSTRAINT fk_mov_bunker  FOREIGN KEY (bunker_id)          REFERENCES bunkers(id),
  CONSTRAINT fk_mov_tda_dst FOREIGN KEY (tienda_destino_id)  REFERENCES tiendas(id),
  CONSTRAINT fk_mov_bnk_dst FOREIGN KEY (bunker_destino_id)  REFERENCES bunkers(id),
  CONSTRAINT fk_mov_prod    FOREIGN KEY (producto_id)        REFERENCES productos(id),
  CONSTRAINT fk_mov_usr     FOREIGN KEY (usuario_id)         REFERENCES usuarios(id),
  CONSTRAINT fk_mov_ticket  FOREIGN KEY (ticket_id)          REFERENCES tickets(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alertas_stock (
  id            INT         NOT NULL AUTO_INCREMENT,
  inventario_id INT         NOT NULL,
  tipo_alerta   VARCHAR(50) NOT NULL,
  mensaje       TEXT        NOT NULL,
  leida         TINYINT(1)  DEFAULT 0,
  leida_por     INT,
  leida_at      DATETIME,
  created_at    DATETIME    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_alertas_inventario (inventario_id),
  KEY idx_alertas_leida (leida),
  KEY idx_alertas_tipo (tipo_alerta),
  CONSTRAINT fk_alertas_inventario FOREIGN KEY (inventario_id) REFERENCES inventario(id) ON DELETE CASCADE,
  CONSTRAINT fk_alertas_leida_por  FOREIGN KEY (leida_por)     REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seriales (
  id            INT          NOT NULL AUTO_INCREMENT,
  inventario_id INT          NOT NULL,
  serie         VARCHAR(100) NOT NULL,
  condicion     VARCHAR(100) DEFAULT 'Buen estado',
  activo        TINYINT(1)   DEFAULT 1,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_seriales_inventario (inventario_id),
  CONSTRAINT fk_seriales_inventario FOREIGN KEY (inventario_id) REFERENCES inventario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ingeniero_tiendas (
  id         INT      NOT NULL AUTO_INCREMENT,
  usuario_id INT      NOT NULL,
  tienda_id  INT      NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ing_tiendas (usuario_id, tienda_id),
  KEY idx_ing_tiendas_usuario (usuario_id),
  KEY idx_ing_tiendas_tienda (tienda_id),
  CONSTRAINT fk_ing_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_ing_tienda  FOREIGN KEY (tienda_id)  REFERENCES tiendas(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS requisiciones (
  id              INT         NOT NULL AUTO_INCREMENT,
  folio           VARCHAR(50) NOT NULL,
  bunker_id       INT         NOT NULL,
  usuario_id      INT         NOT NULL,
  estado          VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  observaciones   TEXT,
  fecha_requerida DATE,
  atendida_por    INT,
  atendida_at     DATETIME,
  created_at      DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_requisiciones_folio (folio),
  KEY idx_req_bunker (bunker_id),
  KEY idx_req_estado (estado),
  KEY idx_req_usuario (usuario_id),
  CONSTRAINT fk_req_bunker   FOREIGN KEY (bunker_id)    REFERENCES bunkers(id),
  CONSTRAINT fk_req_usuario  FOREIGN KEY (usuario_id)   REFERENCES usuarios(id),
  CONSTRAINT fk_req_atendida FOREIGN KEY (atendida_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id          INT         NOT NULL AUTO_INCREMENT,
  usuario_id  INT,
  accion      VARCHAR(50) NOT NULL,
  tabla       VARCHAR(50) NOT NULL,
  registro_id INT,
  datos       JSON,
  ip          VARCHAR(45),
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_usuario (usuario_id),
  KEY idx_audit_tabla_reg (tabla, registro_id),
  KEY idx_audit_created (created_at),
  CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS requisicion_items (
  id               INT      NOT NULL AUTO_INCREMENT,
  requisicion_id   INT      NOT NULL,
  producto_id      INT      NOT NULL,
  cantidad_pedida  INT      NOT NULL,
  cantidad_surtida INT      DEFAULT 0,
  observaciones    TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_req_items_req (requisicion_id),
  KEY idx_req_items_producto (producto_id),
  CHECK (cantidad_pedida > 0),
  CONSTRAINT fk_req_items_req  FOREIGN KEY (requisicion_id) REFERENCES requisiciones(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_items_prod FOREIGN KEY (producto_id)    REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
