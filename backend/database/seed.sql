-- Seed data — populated by initDB.js (passwords are hashed there)

INSERT INTO roles (nombre, permisos, descripcion) VALUES
('SUPERADMIN', '{"all":true}', 'Acceso total al sistema'),
('ADMIN',      '{"inventario":true,"movimientos":true,"catalogos":true,"reportes":true}', 'Administrador de sistema'),
('SUPERVISOR', '{"inventario":{"read":true},"movimientos":{"read":true,"approve":true},"alertas":true,"dashboard":true}', 'Supervisor de soporte técnico'),
('INGENIERO',  '{"movimientos":{"read":true,"create":true},"inventario":{"read":true},"tickets":{"read":true,"create":true}}', 'Ingeniero de campo'),
('CONSULTA',   '{"inventario":{"read":true},"movimientos":{"read":true},"reportes":{"read":true}}', 'Solo lectura');

INSERT INTO tipos_movimiento (nombre, descripcion) VALUES
('ENTRADA',    'Ingreso de material al bunker'),
('SALIDA',     'Salida de material del bunker'),
('TRASLADO',   'Transferencia entre bunkers'),
('AJUSTE',     'Corrección de inventario por conteo físico'),
('PRESTAMO',   'Préstamo temporal de herramienta o equipo'),
('DEVOLUCION', 'Devolución de material o herramienta prestada');

INSERT INTO bunkers (nombre, ciudad, responsable) VALUES
('Bunker Reynosa',      'Reynosa',      'Por asignar'),
('Bunker Matamoros',    'Matamoros',    'Por asignar'),
('Bunker Laredo',      'Nuevo Laredo', 'Por asignar'),
('Bunker Tampico',      'Tampico',      'Por asignar');

INSERT INTO tiendas (nombre, numero, ciudad, bunker_id) VALUES
('Tienda Reynosa Centro',      'REY-01', 'Reynosa',      1),
('Tienda Reynosa Norte',       'REY-02', 'Reynosa',      1),
('Tienda Reynosa Sur',         'REY-03', 'Reynosa',      1),
('Tienda Reynosa Oriente',     'REY-04', 'Reynosa',      1),
('Tienda Reynosa Poniente',    'REY-05', 'Reynosa',      1),
('Tienda Río Bravo',           'RBR-01', 'Río Bravo',    1),
('Tienda Díaz Ordaz',          'DOZ-01', 'Díaz Ordaz',   1),
('Tienda Matamoros Centro',    'MAT-01', 'Matamoros',    2),
('Tienda Matamoros Norte',     'MAT-02', 'Matamoros',    2),
('Tienda Matamoros Sur',       'MAT-03', 'Matamoros',    2),
('Tienda Nuevo Laredo Centro', 'NLD-01', 'Nuevo Laredo', 3),
('Tienda Nuevo Laredo Norte',  'NLD-02', 'Nuevo Laredo', 3),
('Tienda Nuevo Laredo Sur',    'NLD-03', 'Nuevo Laredo', 3),
('Tienda Tampico Centro',      'TAM-01', 'Tampico',      4),
('Tienda Tampico Norte',       'TAM-02', 'Tampico',      4),
('Tienda Tampico Sur',         'TAM-03', 'Tampico',      4),
('Tienda Altamira',            'ALT-01', 'Altamira',     4);

INSERT INTO categorias_productos (nombre, descripcion, icono) VALUES
('Equipos',             'Equipos completos: básculas, terminales, impresoras', 'monitor'),
('Refacciones',         'Partes y refacciones para equipos específicos',       'tool'),
('Consumibles',         'Rollos, cintas, papel, tóner y similares',            'package'),
('Materiales Técnicos', 'Cable, canaletas, conectores, herramientas eléctricas','zap'),
('Herramientas',        'Herramientas manuales y de medición',                 'wrench'),
('Seguridad',           'EPP, etiquetas, señalización',                        'shield');

INSERT INTO productos (nombre, categoria_id, unidad_medida, marca, modelo) VALUES
('Báscula de mostrador',             1, 'PZA',   'Mettler',  'BC-300'),
('Terminal POS',                     1, 'PZA',   'Ingenico', 'iCT220'),
('Impresora de etiquetas',           1, 'PZA',   'Zebra',    'ZD220'),
('Lector de código de barras',       1, 'PZA',   'Honeywell','1950'),
('Cabezal de impresión Zebra ZD220', 2, 'PZA',   'Zebra',    'P1080383-401'),
('Fuente de poder báscula BC-300',   2, 'PZA',   'Mettler',  'PS-BC300'),
('Cable de datos USB-B 1.8m',        2, 'PZA',   'Genérico', NULL),
('Batería terminal POS',             2, 'PZA',   'Ingenico', 'BAT-ICT220'),
('Rollo de papel térmico 80x80',     3, 'CAJA',  'Genérico', NULL),
('Cinta de impresión Zebra 110mm',   3, 'PIEZA', 'Zebra',    'ZD220-RIB'),
('Etiquetas autoadheribles 50x25mm', 3, 'ROLLO', 'Genérico', NULL),
('Cable UTP cat6 metro',             4, 'MT',    'Belden',   NULL),
('Conector RJ45',                    4, 'PZA',   'Panduit',  NULL),
('Canaleta 40x25 tramo 2m',          4, 'PZA',   'Dexson',   NULL),
('Brida plástica 30cm',              4, 'CAJA',  'Genérico', NULL),
('Multímetro digital',               5, 'PZA',   'Fluke',    '115'),
('Ponchadora RJ45',                  5, 'PZA',   'Platinum', NULL),
('Destornillador de precisión jgo',  5, 'JGO',   'Wiha',     NULL),
('Pistola de calor',                 5, 'PZA',   'Bosch',    'GHG 500-2');
