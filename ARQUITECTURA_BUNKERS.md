# 🏗️ BUNKERS DE REFACCIONES — ARQUITECTURA COMPLETA

> Sistema de Inventario Técnico Distribuido  
> Cadena de Supermercados Tamaulipas · 17 Tiendas · 4 Bunkers  
> Stack: React + TailwindCSS + Node.js + Express + SQLite → MySQL

---

## 1. ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    BUNKERS DE REFACCIONES                    │
│                   Arquitectura Local / Web                   │
└─────────────────────────────────────────────────────────────┘

  ┌─────────────┐        HTTP/REST        ┌─────────────────┐
  │   FRONTEND  │◄──────────────────────►│    BACKEND      │
  │  React +    │     Puerto 5173         │  Node.js +      │
  │  Tailwind   │                         │  Express        │
  │  Vite       │     Puerto 3001         │  Puerto 3001    │
  └─────────────┘                         └────────┬────────┘
                                                   │
                                         ┌─────────▼────────┐
                                         │   BASE DE DATOS  │
                                         │   SQLite (dev)   │
                                         │   MySQL (prod)   │
                                         └──────────────────┘
```

### Flujo de Autenticación

```
Usuario → Login Form → POST /api/auth/login → Validar credenciales
        → Generar JWT → Guardar en localStorage → Redirect Dashboard
        → Cada request → Middleware verifyToken → Autorizar por rol
```

### Roles del Sistema

```
SUPERADMIN  → Acceso total, configuración del sistema
ADMIN       → Gestión de inventario, reportes, catálogos
SUPERVISOR  → Ver dashboards, aprobar movimientos, alertas
INGENIERO   → Registrar entradas/salidas, ver su historial
CONSULTA    → Solo lectura de inventarios y reportes
```

---

## 2. ESTRUCTURA DE CARPETAS COMPLETA

```
bunkers-refacciones/
│
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   ├── database.js          # Conexión SQLite/MySQL
│   │   │   ├── env.js               # Variables de entorno
│   │   │   └── constants.js         # Constantes del sistema
│   │   │
│   │   ├── 📁 controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── usuarios.controller.js
│   │   │   ├── bunkers.controller.js
│   │   │   ├── tiendas.controller.js
│   │   │   ├── productos.controller.js
│   │   │   ├── categorias.controller.js
│   │   │   ├── inventario.controller.js
│   │   │   ├── movimientos.controller.js
│   │   │   ├── tickets.controller.js
│   │   │   ├── alertas.controller.js
│   │   │   └── dashboard.controller.js
│   │   │
│   │   ├── 📁 models/
│   │   │   ├── usuario.model.js
│   │   │   ├── bunker.model.js
│   │   │   ├── tienda.model.js
│   │   │   ├── producto.model.js
│   │   │   ├── categoria.model.js
│   │   │   ├── inventario.model.js
│   │   │   ├── movimiento.model.js
│   │   │   ├── ticket.model.js
│   │   │   └── alerta.model.js
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── index.js             # Router principal
│   │   │   ├── auth.routes.js
│   │   │   ├── usuarios.routes.js
│   │   │   ├── bunkers.routes.js
│   │   │   ├── tiendas.routes.js
│   │   │   ├── productos.routes.js
│   │   │   ├── categorias.routes.js
│   │   │   ├── inventario.routes.js
│   │   │   ├── movimientos.routes.js
│   │   │   ├── tickets.routes.js
│   │   │   ├── alertas.routes.js
│   │   │   └── dashboard.routes.js
│   │   │
│   │   ├── 📁 middlewares/
│   │   │   ├── auth.middleware.js    # Verificar JWT
│   │   │   ├── roles.middleware.js   # Verificar permisos por rol
│   │   │   ├── validate.middleware.js# Validación de schemas
│   │   │   ├── upload.middleware.js  # Multer para fotos/evidencias
│   │   │   ├── logger.middleware.js  # Logging de requests
│   │   │   └── errorHandler.js      # Manejador global de errores
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── auth.service.js
│   │   │   ├── inventario.service.js # Lógica de negocio inventario
│   │   │   ├── movimientos.service.js
│   │   │   ├── alertas.service.js    # Evaluación stock mínimo
│   │   │   ├── dashboard.service.js  # Agregaciones para KPIs
│   │   │   └── email.service.js      # Notificaciones futuras
│   │   │
│   │   ├── 📁 validators/
│   │   │   ├── movimiento.validator.js
│   │   │   ├── usuario.validator.js
│   │   │   └── producto.validator.js
│   │   │
│   │   └── 📁 utils/
│   │       ├── jwt.utils.js
│   │       ├── bcrypt.utils.js
│   │       ├── response.utils.js    # Formato estándar de respuestas
│   │       └── pagination.utils.js
│   │
│   ├── 📁 database/
│   │   ├── schema.sql               # DDL completo
│   │   ├── seed.sql                 # Datos iniciales
│   │   └── migrations/              # Para versiones futuras
│   │       └── 001_initial.sql
│   │
│   ├── 📁 uploads/                  # Fotos de evidencias
│   │   └── evidencias/
│   │
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js                    # Entry point
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   └── favicon.ico
│   │
│   ├── 📁 src/
│   │   ├── 📁 assets/
│   │   │   └── logo.svg
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   ├── 📁 ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   └── Pagination.jsx
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── StockCritico.jsx
│   │   │   │   ├── MovimientosRecientes.jsx
│   │   │   │   ├── ConsumoPorBunker.jsx
│   │   │   │   └── ProductosMasUsados.jsx
│   │   │   │
│   │   │   └── 📁 forms/
│   │   │       ├── MovimientoForm.jsx
│   │   │       ├── ProductoForm.jsx
│   │   │       └── UsuarioForm.jsx
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventario.jsx
│   │   │   ├── Movimientos.jsx
│   │   │   ├── NuevoMovimiento.jsx
│   │   │   ├── Historial.jsx
│   │   │   ├── Productos.jsx
│   │   │   ├── Bunkers.jsx
│   │   │   ├── Tiendas.jsx
│   │   │   ├── Usuarios.jsx
│   │   │   ├── Tickets.jsx
│   │   │   ├── Alertas.jsx
│   │   │   └── Reportes.jsx
│   │   │
│   │   ├── 📁 hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useInventario.js
│   │   │   ├── useMovimientos.js
│   │   │   └── useAlertas.js
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── auth.service.js
│   │   │   ├── inventario.service.js
│   │   │   ├── movimientos.service.js
│   │   │   └── dashboard.service.js
│   │   │
│   │   ├── 📁 store/
│   │   │   ├── index.js             # Zustand store
│   │   │   ├── authStore.js
│   │   │   └── uiStore.js
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                     # Root: scripts para dev conjunto
```

---

## 3. MODELO ENTIDAD-RELACIÓN

```
┌──────────────┐       ┌──────────────┐
│   roles      │       │  tipos_movi  │
│──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │
│ nombre       │       │ nombre       │
│ permisos     │       │ descripcion  │
│ descripcion  │       └──────────────┘
└──────┬───────┘              │
       │ 1:N                  │ 1:N
┌──────▼───────┐       ┌──────▼───────────────────────────────┐
│   usuarios   │       │            movimientos                │
│──────────────│       │──────────────────────────────────────│
│ id (PK)      │◄──────│ id (PK)                              │
│ nombre       │ 1:N   │ tipo_movimiento_id (FK)              │
│ email        │       │ bunker_id (FK)                       │
│ password     │       │ tienda_destino_id (FK) nullable      │
│ rol_id (FK)  │       │ producto_id (FK)                     │
│ bunker_id FK │       │ cantidad                             │
│ activo       │       │ usuario_id (FK) → ingeniero          │
└──────────────┘       │ ticket_id (FK) nullable              │
                       │ observaciones                        │
┌──────────────┐       │ foto_evidencia nullable              │
│   bunkers    │◄──────│ fecha_hora                           │
│──────────────│ 1:N   │ created_at                           │
│ id (PK)      │       └──────────────────────────────────────┘
│ nombre       │              │
│ ciudad       │              │ FK
│ responsable  │       ┌──────▼───────┐
│ activo       │       │   tickets    │
└──────┬───────┘       │──────────────│
       │               │ id (PK)      │
       │ 1:N           │ numero       │
┌──────▼───────┐       │ descripcion  │
│  inventario  │       │ estado       │
│──────────────│       │ bunker_id FK │
│ id (PK)      │       │ usuario_id FK│
│ bunker_id FK │       │ created_at   │
│ producto_id  │       └──────────────┘
│ cantidad     │
│ stock_minimo │       ┌──────────────┐
│ updated_at   │       │   tiendas    │
└──────────────┘       │──────────────│
                       │ id (PK)      │
┌──────────────┐       │ nombre       │
│   productos  │       │ ciudad       │
│──────────────│       │ bunker_id FK │
│ id (PK)      │       │ activa       │
│ codigo       │       └──────────────┘
│ nombre       │
│ descripcion  │       ┌──────────────────┐
│ categoria_id │       │  alertas_stock   │
│ unidad_medida│       │──────────────────│
│ activo       │       │ id (PK)          │
└──────────────┘       │ inventario_id FK │
                       │ tipo_alerta      │
┌──────────────┐       │ mensaje          │
│  categorias  │       │ leida            │
│──────────────│       │ created_at       │
│ id (PK)      │       └──────────────────┘
│ nombre       │
│ descripcion  │
└──────────────┘
```

---

## 4. SCRIPTS SQL COMPLETOS

```sql
-- ============================================================
-- BUNKERS DE REFACCIONES — Schema Completo
-- Compatible: SQLite 3 (dev) / MySQL 8 (prod)
-- ============================================================

PRAGMA foreign_keys = ON; -- Solo SQLite

-- ------------------------------------------------------------
-- ROLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  permisos    TEXT         NOT NULL DEFAULT '{}', -- JSON string
  descripcion VARCHAR(255),
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_nombre ON roles(nombre);

-- ------------------------------------------------------------
-- TIPOS DE MOVIMIENTO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipos_movimiento (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      VARCHAR(50)  NOT NULL UNIQUE, -- ENTRADA, SALIDA, TRASLADO, AJUSTE
  descripcion VARCHAR(255),
  activo      BOOLEAN      DEFAULT 1
);

-- ------------------------------------------------------------
-- BUNKERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bunkers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       VARCHAR(100) NOT NULL,
  ciudad       VARCHAR(100) NOT NULL,
  direccion    TEXT,
  responsable  VARCHAR(150),
  telefono     VARCHAR(20),
  activo       BOOLEAN      DEFAULT 1,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bunkers_ciudad ON bunkers(ciudad);

-- ------------------------------------------------------------
-- TIENDAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tiendas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     VARCHAR(150) NOT NULL,
  numero     VARCHAR(20)  UNIQUE,
  ciudad     VARCHAR(100) NOT NULL,
  direccion  TEXT,
  bunker_id  INTEGER      NOT NULL REFERENCES bunkers(id) ON DELETE RESTRICT,
  activa     BOOLEAN      DEFAULT 1,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tiendas_bunker ON tiendas(bunker_id);
CREATE INDEX idx_tiendas_ciudad ON tiendas(ciudad);

-- ------------------------------------------------------------
-- USUARIOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,             -- bcrypt hash
  rol_id       INTEGER      NOT NULL REFERENCES roles(id),
  bunker_id    INTEGER      REFERENCES bunkers(id), -- bunker asignado
  telefono     VARCHAR(20),
  activo       BOOLEAN      DEFAULT 1,
  ultimo_login DATETIME,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email    ON usuarios(email);
CREATE INDEX idx_usuarios_rol      ON usuarios(rol_id);
CREATE INDEX idx_usuarios_bunker   ON usuarios(bunker_id);

-- ------------------------------------------------------------
-- CATEGORIAS DE PRODUCTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias_productos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  icono       VARCHAR(50),
  activo      BOOLEAN DEFAULT 1
);

-- ------------------------------------------------------------
-- PRODUCTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo         VARCHAR(50)  NOT NULL UNIQUE,
  nombre         VARCHAR(200) NOT NULL,
  descripcion    TEXT,
  categoria_id   INTEGER      NOT NULL REFERENCES categorias_productos(id),
  unidad_medida  VARCHAR(30)  DEFAULT 'PZA', -- PZA, KG, LT, MT, CAJA, JGO
  marca          VARCHAR(100),
  modelo         VARCHAR(100),
  num_parte      VARCHAR(100),
  activo         BOOLEAN      DEFAULT 1,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_productos_codigo    ON productos(codigo);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_nombre    ON productos(nombre);

-- ------------------------------------------------------------
-- INVENTARIO (stock por bunker)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventario (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  bunker_id     INTEGER NOT NULL REFERENCES bunkers(id) ON DELETE CASCADE,
  producto_id   INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad      INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  stock_minimo  INTEGER NOT NULL DEFAULT 5,
  stock_maximo  INTEGER,
  ubicacion     VARCHAR(100), -- Estante/Cajón dentro del bunker
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bunker_id, producto_id)  -- Un producto por bunker
);

CREATE INDEX idx_inventario_bunker   ON inventario(bunker_id);
CREATE INDEX idx_inventario_producto ON inventario(producto_id);
CREATE INDEX idx_inventario_stock    ON inventario(cantidad); -- Para alertas rápidas

-- ------------------------------------------------------------
-- TICKETS DE SOPORTE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  numero       VARCHAR(50)  NOT NULL UNIQUE, -- Ej: TKT-2024-00123
  descripcion  TEXT         NOT NULL,
  tienda_id    INTEGER      REFERENCES tiendas(id),
  usuario_id   INTEGER      REFERENCES usuarios(id),
  estado       VARCHAR(30)  DEFAULT 'ABIERTO', -- ABIERTO, EN_PROCESO, CERRADO
  prioridad    VARCHAR(20)  DEFAULT 'MEDIA',   -- BAJA, MEDIA, ALTA, CRITICA
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_numero  ON tickets(numero);
CREATE INDEX idx_tickets_estado  ON tickets(estado);
CREATE INDEX idx_tickets_tienda  ON tickets(tienda_id);

-- ------------------------------------------------------------
-- MOVIMIENTOS (tabla central del sistema)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimientos (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  folio                VARCHAR(50)  UNIQUE, -- Ej: MOV-REY-2024-00001
  tipo_movimiento_id   INTEGER      NOT NULL REFERENCES tipos_movimiento(id),
  bunker_id            INTEGER      NOT NULL REFERENCES bunkers(id),
  tienda_destino_id    INTEGER      REFERENCES tiendas(id),    -- Nullable: solo en salidas
  bunker_destino_id    INTEGER      REFERENCES bunkers(id),    -- Nullable: solo en traslados
  producto_id          INTEGER      NOT NULL REFERENCES productos(id),
  cantidad             INTEGER      NOT NULL CHECK (cantidad > 0),
  usuario_id           INTEGER      NOT NULL REFERENCES usuarios(id), -- Ingeniero responsable
  ticket_id            INTEGER      REFERENCES tickets(id),           -- Opcional
  observaciones        TEXT,
  foto_evidencia       VARCHAR(500),  -- Path al archivo subido
  fecha_hora           DATETIME     DEFAULT CURRENT_TIMESTAMP,
  created_at           DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mov_bunker    ON movimientos(bunker_id);
CREATE INDEX idx_mov_producto  ON movimientos(producto_id);
CREATE INDEX idx_mov_usuario   ON movimientos(usuario_id);
CREATE INDEX idx_mov_ticket    ON movimientos(ticket_id);
CREATE INDEX idx_mov_fecha     ON movimientos(fecha_hora);
CREATE INDEX idx_mov_tipo      ON movimientos(tipo_movimiento_id);

-- ------------------------------------------------------------
-- ALERTAS DE STOCK
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alertas_stock (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  inventario_id  INTEGER     NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
  tipo_alerta    VARCHAR(50) NOT NULL, -- STOCK_CRITICO, STOCK_MINIMO, SIN_STOCK
  mensaje        TEXT        NOT NULL,
  leida          BOOLEAN     DEFAULT 0,
  leida_por      INTEGER     REFERENCES usuarios(id),
  leida_at       DATETIME,
  created_at     DATETIME    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alertas_inventario ON alertas_stock(inventario_id);
CREATE INDEX idx_alertas_leida      ON alertas_stock(leida);
CREATE INDEX idx_alertas_tipo       ON alertas_stock(tipo_alerta);
```

---

## 5. DATOS INICIALES (SEED)

```sql
-- ============================================================
-- SEED DATA — Bunkers de Refacciones
-- ============================================================

-- Roles
INSERT INTO roles (nombre, permisos, descripcion) VALUES
('SUPERADMIN', '{"all":true}', 'Acceso total al sistema'),
('ADMIN',      '{"inventario":true,"movimientos":true,"catalogos":true,"reportes":true}', 'Administrador de sistema'),
('SUPERVISOR', '{"inventario":{"read":true},"movimientos":{"read":true,"approve":true},"alertas":true,"dashboard":true}', 'Supervisor de soporte técnico'),
('INGENIERO',  '{"movimientos":{"read":true,"create":true},"inventario":{"read":true},"tickets":{"read":true,"create":true}}', 'Ingeniero de campo'),
('CONSULTA',   '{"inventario":{"read":true},"movimientos":{"read":true},"reportes":{"read":true}}', 'Solo lectura');

-- Tipos de movimiento
INSERT INTO tipos_movimiento (nombre, descripcion) VALUES
('ENTRADA',   'Ingreso de material al bunker (resurtido desde almacén central)'),
('SALIDA',    'Salida de material del bunker hacia tienda o atención'),
('TRASLADO',  'Transferencia entre bunkers'),
('AJUSTE',    'Corrección de inventario por conteo físico'),
('PRESTAMO',  'Préstamo temporal de herramienta o equipo'),
('DEVOLUCION','Devolución de material o herramienta prestada');

-- Bunkers
INSERT INTO bunkers (nombre, ciudad, responsable) VALUES
('Bunker Reynosa',      'Reynosa',      'Por asignar'),
('Bunker Matamoros',    'Matamoros',    'Por asignar'),
('Bunker Nuevo Laredo', 'Nuevo Laredo', 'Por asignar'),
('Bunker Tampico',      'Tampico',      'Por asignar');

-- Tiendas (17 en total)
INSERT INTO tiendas (nombre, numero, ciudad, bunker_id) VALUES
-- Reynosa (7 tiendas) → bunker_id=1
('Tienda Reynosa Centro',      'REY-01', 'Reynosa',      1),
('Tienda Reynosa Norte',       'REY-02', 'Reynosa',      1),
('Tienda Reynosa Sur',         'REY-03', 'Reynosa',      1),
('Tienda Reynosa Oriente',     'REY-04', 'Reynosa',      1),
('Tienda Reynosa Poniente',    'REY-05', 'Reynosa',      1),
('Tienda Río Bravo',           'RBR-01', 'Río Bravo',    1),
('Tienda Díaz Ordaz',          'DOZ-01', 'Díaz Ordaz',   1),
-- Matamoros (3 tiendas) → bunker_id=2
('Tienda Matamoros Centro',    'MAT-01', 'Matamoros',    2),
('Tienda Matamoros Norte',     'MAT-02', 'Matamoros',    2),
('Tienda Matamoros Sur',       'MAT-03', 'Matamoros',    2),
-- Nuevo Laredo (3 tiendas) → bunker_id=3
('Tienda Nuevo Laredo Centro', 'NLD-01', 'Nuevo Laredo', 3),
('Tienda Nuevo Laredo Norte',  'NLD-02', 'Nuevo Laredo', 3),
('Tienda Nuevo Laredo Sur',    'NLD-03', 'Nuevo Laredo', 3),
-- Tampico (3 tiendas) → bunker_id=4
('Tienda Tampico Centro',      'TAM-01', 'Tampico',      4),
('Tienda Tampico Norte',       'TAM-02', 'Tampico',      4),
('Tienda Tampico Sur',         'TAM-03', 'Tampico',      4),
('Tienda Altamira',            'ALT-01', 'Altamira',     4);

-- Categorías de productos
INSERT INTO categorias_productos (nombre, descripcion, icono) VALUES
('Equipos',             'Equipos completos: básculas, terminales, impresoras', 'monitor'),
('Refacciones',         'Partes y refacciones para equipos específicos',       'tool'),
('Consumibles',         'Rollos, cintas, papel, tóner y similares',            'package'),
('Materiales Técnicos', 'Cable, canaletas, conectores, herramientas eléctricas','zap'),
('Herramientas',        'Herramientas manuales y de medición',                 'wrench'),
('Seguridad',           'EPP, etiquetas, señalización',                        'shield');

-- Productos de ejemplo
INSERT INTO productos (codigo, nombre, categoria_id, unidad_medida, marca, modelo) VALUES
('EQ-001', 'Báscula de mostrador',             1, 'PZA', 'Mettler',  'BC-300'),
('EQ-002', 'Terminal POS',                     1, 'PZA', 'Ingenico', 'iCT220'),
('EQ-003', 'Impresora de etiquetas',           1, 'PZA', 'Zebra',    'ZD220'),
('EQ-004', 'Lector de código de barras',       1, 'PZA', 'Honeywell','1950'),
('REF-001','Cabezal de impresión Zebra ZD220', 2, 'PZA', 'Zebra',    'P1080383-401'),
('REF-002','Fuente de poder báscula BC-300',   2, 'PZA', 'Mettler',  'PS-BC300'),
('REF-003','Cable de datos USB-B 1.8m',        2, 'PZA', 'Genérico', NULL),
('REF-004','Batería terminal POS',             2, 'PZA', 'Ingenico', 'BAT-ICT220'),
('CON-001','Rollo de papel térmico 80x80',     3, 'CAJA','Genérico', NULL),
('CON-002','Cinta de impresión Zebra 110mm',   3, 'PIEZA','Zebra',   'ZD220-RIB'),
('CON-003','Etiquetas autoadheribles 50x25mm', 3, 'ROLLO','Genérico',NULL),
('MAT-001','Cable UTP cat6 metro',             4, 'MT',  'Belden',   NULL),
('MAT-002','Conector RJ45',                    4, 'PZA', 'Panduit',  NULL),
('MAT-003','Canaleta 40x25 tramo 2m',          4, 'PZA', 'Dexson',   NULL),
('MAT-004','Brida plástica 30cm',              4, 'CAJA','Genérico', NULL),
('HER-001','Multímetro digital',               5, 'PZA', 'Fluke',    '115'),
('HER-002','Ponchadora RJ45',                  5, 'PZA', 'Platinum', NULL),
('HER-003','Destornillador de precisión jgo',  5, 'JGO', 'Wiha',     NULL),
('HER-004','Pistola de calor',                 5, 'PZA', 'Bosch',    'GHG 500-2');

-- Usuario superadmin inicial
-- Password: Admin2024! (hash bcrypt rounds=10)
INSERT INTO usuarios (nombre, email, password, rol_id, bunker_id) VALUES
('Administrador Sistema', 'admin@bunkers.local',
 '$2b$10$YourHashHere', -- REEMPLAZAR con bcrypt real al iniciar
 1, NULL);

-- Inventario inicial (ejemplo Bunker Reynosa)
INSERT INTO inventario (bunker_id, producto_id, cantidad, stock_minimo, stock_maximo) VALUES
(1, 1,  3,  2, 10),  -- Báscula: 3 pzas, mínimo 2
(1, 2,  5,  3, 15),  -- Terminal POS: 5 pzas
(1, 3,  4,  2, 10),  -- Impresora etiquetas: 4 pzas
(1, 4,  8,  4, 20),  -- Lectores: 8 pzas
(1, 5,  10, 5, 30),  -- Cabezales Zebra: 10 pzas
(1, 9,  15, 10,50),  -- Rollos papel: 15 cajas
(1, 12, 100,50,200), -- Cable UTP: 100 metros
(1, 13, 200,100,500),-- Conectores RJ45: 200 pzas
(1, 16, 2,  1,  5),  -- Multímetros: 2 pzas
(1, 17, 2,  1,  5);  -- Ponchadora: 2 pzas
```

---

## 6. BACKEND — ARCHIVOS CLAVE

### server.js
```javascript
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const helmet  = require('helmet');
require('dotenv').config();

const routes        = require('./src/routes');
const errorHandler  = require('./src/middlewares/errorHandler');
const logger        = require('./src/middlewares/logger.middleware');
const { initDB }    = require('./src/config/database');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Seguridad ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

// ── Body parsers ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logger ──────────────────────────────────────────────────
app.use(logger);

// ── Archivos estáticos (fotos de evidencia) ─────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rutas API ───────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// ── Manejador global de errores ─────────────────────────────
app.use(errorHandler);

// ── Iniciar servidor ─────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Bunkers API corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Error al inicializar DB:', err);
  process.exit(1);
});
```

### src/config/database.js
```javascript
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH  = process.env.DB_PATH || path.join(__dirname, '../../database/bunkers.db');
let   db;

/**
 * Obtiene instancia singleton de la base de datos
 */
function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');   // Mejor concurrencia
    db.pragma('foreign_keys = ON');    // Integridad referencial
    db.pragma('synchronous = NORMAL'); // Balance rendimiento/seguridad
  }
  return db;
}

/**
 * Inicializa DB ejecutando el schema si no existe
 */
async function initDB() {
  const database = getDB();
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    database.exec(schema);
    console.log('✅ Schema de base de datos inicializado');
  }
  
  // Verificar si hay datos, si no, correr seed
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
```

### src/routes/index.js
```javascript
const router = require('express').Router();

const authRoutes        = require('./auth.routes');
const usuariosRoutes    = require('./usuarios.routes');
const bunkersRoutes     = require('./bunkers.routes');
const tiendasRoutes     = require('./tiendas.routes');
const productosRoutes   = require('./productos.routes');
const categoriasRoutes  = require('./categorias.routes');
const inventarioRoutes  = require('./inventario.routes');
const movimientosRoutes = require('./movimientos.routes');
const ticketsRoutes     = require('./tickets.routes');
const alertasRoutes     = require('./alertas.routes');
const dashboardRoutes   = require('./dashboard.routes');

router.use('/auth',        authRoutes);
router.use('/usuarios',    usuariosRoutes);
router.use('/bunkers',     bunkersRoutes);
router.use('/tiendas',     tiendasRoutes);
router.use('/productos',   productosRoutes);
router.use('/categorias',  categoriasRoutes);
router.use('/inventario',  inventarioRoutes);
router.use('/movimientos', movimientosRoutes);
router.use('/tickets',     ticketsRoutes);
router.use('/alertas',     alertasRoutes);
router.use('/dashboard',   dashboardRoutes);

module.exports = router;
```

### src/middlewares/auth.middleware.js
```javascript
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');

/**
 * Middleware: verifica JWT en header Authorization
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

/**
 * Factory: verifica que el usuario tenga uno de los roles permitidos
 */
const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Sin autenticación' });
  
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: `Acceso denegado. Roles permitidos: ${roles.join(', ')}`
    });
  }
  next();
};

module.exports = { verifyToken, requireRoles };
```

### src/controllers/movimientos.controller.js
```javascript
const movimientosService = require('../services/movimientos.service');
const { validationResult } = require('express-validator');

/**
 * POST /api/movimientos
 * Registra un nuevo movimiento (entrada/salida/traslado)
 */
const crear = async (req, res, next) => {
  try {
    // Validar campos del body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const datos = {
      ...req.body,
      usuario_id:    req.user.id,            // Del JWT
      foto_evidencia: req.file?.path || null  // De multer si se adjuntó
    };

    const movimiento = await movimientosService.crear(datos);

    return res.status(201).json({
      success: true,
      message: 'Movimiento registrado correctamente',
      data: movimiento
    });
  } catch (err) {
    // Errores de negocio (stock insuficiente, etc.)
    if (err.type === 'BUSINESS_ERROR') {
      return res.status(422).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * GET /api/movimientos?bunker_id=1&tipo=SALIDA&page=1&limit=20
 */
const listar = async (req, res, next) => {
  try {
    const filtros = {
      bunker_id:         req.query.bunker_id,
      tipo_movimiento:   req.query.tipo,
      producto_id:       req.query.producto_id,
      usuario_id:        req.query.usuario_id,
      fecha_desde:       req.query.fecha_desde,
      fecha_hasta:       req.query.fecha_hasta,
      ticket_id:         req.query.ticket_id,
      page:              parseInt(req.query.page)  || 1,
      limit:             parseInt(req.query.limit) || 20
    };

    const resultado = await movimientosService.listar(filtros);
    return res.json({ success: true, ...resultado });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/movimientos/:id
 */
const obtener = async (req, res, next) => {
  try {
    const movimiento = await movimientosService.obtenerPorId(req.params.id);
    if (!movimiento) {
      return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
    }
    return res.json({ success: true, data: movimiento });
  } catch (err) {
    next(err);
  }
};

module.exports = { crear, listar, obtener };
```

### src/services/movimientos.service.js
```javascript
const { getDB }         = require('../config/database');
const alertasService    = require('./alertas.service');

/**
 * Lógica de negocio para movimientos de inventario
 */
const crear = async (datos) => {
  const db = getDB();

  const {
    tipo_movimiento_id, bunker_id, tienda_destino_id,
    bunker_destino_id,  producto_id, cantidad,
    usuario_id, ticket_id, observaciones, foto_evidencia
  } = datos;

  // ── Transacción para garantizar consistencia ────────────────
  const transaction = db.transaction(() => {

    // 1. Verificar stock disponible (solo para SALIDA y TRASLADO)
    const tipoMov = db.prepare(
      'SELECT nombre FROM tipos_movimiento WHERE id = ?'
    ).get(tipo_movimiento_id);

    if (!tipoMov) throw { type: 'BUSINESS_ERROR', message: 'Tipo de movimiento inválido' };

    if (['SALIDA', 'TRASLADO', 'PRESTAMO'].includes(tipoMov.nombre)) {
      const inv = db.prepare(
        'SELECT cantidad FROM inventario WHERE bunker_id = ? AND producto_id = ?'
      ).get(bunker_id, producto_id);

      if (!inv || inv.cantidad < cantidad) {
        throw {
          type: 'BUSINESS_ERROR',
          message: `Stock insuficiente. Disponible: ${inv?.cantidad || 0}, Solicitado: ${cantidad}`
        };
      }

      // Decrementar stock origen
      db.prepare(`
        UPDATE inventario SET cantidad = cantidad - ?, updated_at = CURRENT_TIMESTAMP
        WHERE bunker_id = ? AND producto_id = ?
      `).run(cantidad, bunker_id, producto_id);
    }

    if (['ENTRADA', 'DEVOLUCION'].includes(tipoMov.nombre)) {
      // Incrementar stock o crear registro si no existe
      const existing = db.prepare(
        'SELECT id FROM inventario WHERE bunker_id = ? AND producto_id = ?'
      ).get(bunker_id, producto_id);

      if (existing) {
        db.prepare(`
          UPDATE inventario SET cantidad = cantidad + ?, updated_at = CURRENT_TIMESTAMP
          WHERE bunker_id = ? AND producto_id = ?
        `).run(cantidad, bunker_id, producto_id);
      } else {
        db.prepare(`
          INSERT INTO inventario (bunker_id, producto_id, cantidad, stock_minimo)
          VALUES (?, ?, ?, 5)
        `).run(bunker_id, producto_id, cantidad);
      }
    }

    if (tipoMov.nombre === 'TRASLADO' && bunker_destino_id) {
      // Incrementar en bunker destino también
      const existingDest = db.prepare(
        'SELECT id FROM inventario WHERE bunker_id = ? AND producto_id = ?'
      ).get(bunker_destino_id, producto_id);

      if (existingDest) {
        db.prepare(`
          UPDATE inventario SET cantidad = cantidad + ?, updated_at = CURRENT_TIMESTAMP
          WHERE bunker_id = ? AND producto_id = ?
        `).run(cantidad, bunker_destino_id, producto_id);
      } else {
        db.prepare(`
          INSERT INTO inventario (bunker_id, producto_id, cantidad, stock_minimo)
          VALUES (?, ?, ?, 5)
        `).run(bunker_destino_id, producto_id, cantidad);
      }
    }

    // 2. Generar folio único
    const count = db.prepare('SELECT COUNT(*) as c FROM movimientos').get();
    const folio = `MOV-${Date.now()}-${String(count.c + 1).padStart(5,'0')}`;

    // 3. Insertar movimiento
    const stmt = db.prepare(`
      INSERT INTO movimientos (
        folio, tipo_movimiento_id, bunker_id, tienda_destino_id,
        bunker_destino_id, producto_id, cantidad, usuario_id,
        ticket_id, observaciones, foto_evidencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      folio, tipo_movimiento_id, bunker_id, tienda_destino_id || null,
      bunker_destino_id || null, producto_id, cantidad, usuario_id,
      ticket_id || null, observaciones || null, foto_evidencia || null
    );

    return { id: result.lastInsertRowid, folio };
  });

  // Ejecutar transacción
  const resultado = transaction();

  // 4. Evaluar alertas de stock (fuera de transacción, no crítico)
  try {
    await alertasService.evaluarStock(bunker_id, producto_id);
  } catch (e) {
    console.warn('⚠️ Error al evaluar alertas:', e.message);
  }

  return resultado;
};

const listar = async (filtros) => {
  const db = getDB();
  const { page, limit, ...where } = filtros;
  const offset = (page - 1) * limit;

  let conditions = ['1=1'];
  let params = [];

  if (where.bunker_id)       { conditions.push('m.bunker_id = ?');       params.push(where.bunker_id); }
  if (where.producto_id)     { conditions.push('m.producto_id = ?');     params.push(where.producto_id); }
  if (where.usuario_id)      { conditions.push('m.usuario_id = ?');      params.push(where.usuario_id); }
  if (where.ticket_id)       { conditions.push('m.ticket_id = ?');       params.push(where.ticket_id); }
  if (where.fecha_desde)     { conditions.push('m.fecha_hora >= ?');     params.push(where.fecha_desde); }
  if (where.fecha_hasta)     { conditions.push('m.fecha_hora <= ?');     params.push(where.fecha_hasta); }
  if (where.tipo_movimiento) {
    conditions.push('tm.nombre = ?');
    params.push(where.tipo_movimiento);
  }

  const whereClause = conditions.join(' AND ');

  const query = `
    SELECT 
      m.id, m.folio, tm.nombre AS tipo_movimiento,
      b.nombre AS bunker, p.nombre AS producto, p.codigo,
      m.cantidad, u.nombre AS ingeniero,
      t.nombre AS tienda_destino, tk.numero AS ticket,
      m.observaciones, m.foto_evidencia, m.fecha_hora
    FROM movimientos m
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    JOIN bunkers b           ON m.bunker_id          = b.id
    JOIN productos p         ON m.producto_id        = p.id
    JOIN usuarios u          ON m.usuario_id         = u.id
    LEFT JOIN tiendas t      ON m.tienda_destino_id  = t.id
    LEFT JOIN tickets tk     ON m.ticket_id          = tk.id
    WHERE ${whereClause}
    ORDER BY m.fecha_hora DESC
    LIMIT ? OFFSET ?
  `;

  const data  = db.prepare(query).all([...params, limit, offset]);
  const total = db.prepare(`
    SELECT COUNT(*) as c FROM movimientos m
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    WHERE ${whereClause}
  `).get(params).c;

  return { data, total, page, limit, pages: Math.ceil(total / limit) };
};

const obtenerPorId = async (id) => {
  const db = getDB();
  return db.prepare(`
    SELECT m.*, tm.nombre AS tipo_movimiento,
           b.nombre AS bunker, p.nombre AS producto,
           u.nombre AS ingeniero, t.nombre AS tienda_destino,
           tk.numero AS ticket
    FROM movimientos m
    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
    JOIN bunkers b           ON m.bunker_id          = b.id
    JOIN productos p         ON m.producto_id        = p.id
    JOIN usuarios u          ON m.usuario_id         = u.id
    LEFT JOIN tiendas t      ON m.tienda_destino_id  = t.id
    LEFT JOIN tickets tk     ON m.ticket_id          = tk.id
    WHERE m.id = ?
  `).get(id);
};

module.exports = { crear, listar, obtenerPorId };
```

---

## 7. API REST DOCUMENTADA

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST   | /api/auth/login | Login, retorna JWT | ✗ |
| POST   | /api/auth/logout | Invalidar sesión | ✓ |
| GET    | /api/auth/me | Datos del usuario actual | ✓ |
| GET    | /api/usuarios | Listar usuarios | ADMIN+ |
| POST   | /api/usuarios | Crear usuario | ADMIN+ |
| PUT    | /api/usuarios/:id | Editar usuario | ADMIN+ |
| DELETE | /api/usuarios/:id | Desactivar usuario | SUPERADMIN |
| GET    | /api/bunkers | Listar bunkers | ✓ |
| GET    | /api/bunkers/:id | Detalle bunker | ✓ |
| POST   | /api/bunkers | Crear bunker | ADMIN+ |
| PUT    | /api/bunkers/:id | Editar bunker | ADMIN+ |
| GET    | /api/tiendas | Listar tiendas | ✓ |
| GET    | /api/tiendas?bunker_id=1 | Tiendas por bunker | ✓ |
| POST   | /api/tiendas | Crear tienda | ADMIN+ |
| GET    | /api/productos | Listar productos | ✓ |
| GET    | /api/productos/:id | Detalle producto | ✓ |
| POST   | /api/productos | Crear producto | ADMIN+ |
| PUT    | /api/productos/:id | Editar producto | ADMIN+ |
| GET    | /api/inventario | Stock general | ✓ |
| GET    | /api/inventario?bunker_id=1 | Stock por bunker | ✓ |
| GET    | /api/inventario/critico | Items con stock bajo | ✓ |
| PUT    | /api/inventario/:id | Actualizar stock mínimo | ADMIN+ |
| GET    | /api/movimientos | Historial (con filtros) | ✓ |
| GET    | /api/movimientos/:id | Detalle movimiento | ✓ |
| POST   | /api/movimientos | Crear movimiento | INGENIERO+ |
| GET    | /api/tickets | Listar tickets | ✓ |
| POST   | /api/tickets | Crear ticket | INGENIERO+ |
| PUT    | /api/tickets/:id | Actualizar ticket | INGENIERO+ |
| GET    | /api/alertas | Listar alertas | ✓ |
| PUT    | /api/alertas/:id/leer | Marcar como leída | ✓ |
| GET    | /api/dashboard/kpis | KPIs generales | SUPERVISOR+ |
| GET    | /api/dashboard/consumo-bunker | Consumo por bunker | SUPERVISOR+ |
| GET    | /api/dashboard/top-productos | Top productos usados | SUPERVISOR+ |
| GET    | /api/dashboard/movimientos-recientes | Últimos 10 movimientos | ✓ |

---

## 8. PASOS DE INSTALACIÓN LOCAL

```bash
# 1. Prerrequisitos
# Node.js >= 18  →  https://nodejs.org
# Git            →  https://git-scm.com

# 2. Clonar / Crear el proyecto
mkdir bunkers-refacciones && cd bunkers-refacciones

# 3. Instalar backend
cd backend
npm install

# Dependencias backend:
# express, better-sqlite3, jsonwebtoken, bcryptjs,
# cors, helmet, multer, express-validator, dotenv, morgan

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env:
#   JWT_SECRET=tu_clave_secreta_muy_larga
#   PORT=3001
#   FRONTEND_URL=http://localhost:5173

# 5. Inicializar base de datos
node src/scripts/initDB.js
# Crea bunkers.db con schema + datos iniciales
# Genera password admin hasheado

# 6. Instalar frontend
cd ../frontend
npm install
# Dependencias: react, react-router-dom, axios, zustand,
# recharts, react-hook-form, tailwindcss, vite, lucide-react

# 7. Iniciar en modo desarrollo (dos terminales)
# Terminal 1 - Backend:
cd backend && npm run dev      # nodemon server.js → :3001

# Terminal 2 - Frontend:
cd frontend && npm run dev     # vite → :5173

# 8. Acceder
# http://localhost:5173
# Usuario: admin@bunkers.local
# Password: Admin2024!

# 9. (Opcional) Script raíz para levantar ambos:
# npm run dev  (desde carpeta raíz con concurrently)
```

### package.json raíz
```json
{
  "name": "bunkers-refacciones",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "install:all": "npm install --prefix backend && npm install --prefix frontend",
    "build": "npm run build --prefix frontend"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

---

## 9. SEGURIDAD — RECOMENDACIONES

```
1. JWT_SECRET     → mínimo 64 caracteres aleatorios (crypto.randomBytes(32))
2. Passwords      → bcrypt con 12 rounds mínimo en producción
3. Rate limiting  → express-rate-limit: 100 req/15min por IP
4. CORS           → solo permitir origen del frontend
5. Helmet         → headers de seguridad automáticos
6. Validación     → express-validator en TODOS los endpoints
7. SQL Injection  → solo usar prepared statements (better-sqlite3 los forza)
8. Uploads        → validar MIME type real, no solo extensión
9. Logs           → nunca loggear passwords ni tokens completos
10. .env          → jamás subir a Git (.gitignore)
```

---

## 10. HOJA DE RUTA — ESCALABILIDAD

### Migración a MySQL
```
1. Reemplazar better-sqlite3 por mysql2/promise
2. Ajustar tipos: INTEGER AUTOINCREMENT → INT AUTO_INCREMENT
3. Agregar pool de conexiones (mysql2 connection pool)
4. Variables de entorno: DB_HOST, DB_USER, DB_PASS, DB_NAME
5. El resto del código (queries, services) permanece idéntico
```

### Escalar a múltiples estados
```
1. Agregar tabla "regiones" / "estados"
2. Bunkers → agregar estado_id (FK)
3. Usuarios → asignar región para filtrar vistas
4. Dashboard → filtros por región/estado
5. API → middleware que filtra por región del usuario
```

### Migración a nube
```
Fase 1 (VPS):    Mismo stack, servidor Ubuntu, PM2, Nginx reverse proxy
Fase 2 (Cloud):  
  - Backend  → AWS EC2 o Railway.app o Render.com
  - Base de datos → AWS RDS MySQL o PlanetScale
  - Archivos → AWS S3 para fotos de evidencia
  - Frontend → Vercel o Netlify (o servido desde el mismo backend)
Fase 3 (Scale):  
  - Redis para caché de dashboards
  - Múltiples instancias con balanceador
  - Backups automáticos programados
```
