-- ============================================================
-- SEED DE DATOS DE PRUEBA
-- Base de datos: tienda (PostgreSQL)
-- Todas las contraseñas de prueba son: password123
-- ============================================================

-- Limpiar datos previos (opcional, útil para re-ejecutar)
TRUNCATE detalle_pedido, pedidos, productos, usuarios RESTART IDENTITY CASCADE;

-- ============================================================
-- USUARIOS
-- password123 -> hash bcrypt válido
-- ============================================================
INSERT INTO usuarios (nombre, email, password, rol) VALUES
  ('Administrador',   'admin@tienda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  ('Juan Pérez',      'juan@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'cliente'),
  ('María López',     'maria@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'cliente');

-- ============================================================
-- PRODUCTOS
-- ============================================================
INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
  ('Laptop Dell Inspiron',      'Laptop 15" Intel i7, 16GB RAM, 512GB SSD',  15000.00, 10, 'Electrónica'),
  ('Mouse Logitech MX',         'Mouse inalámbrico recargable',                350.00,  50, 'Accesorios'),
  ('Teclado Mecánico RGB',      'Switches azules, retroiluminado',             850.00,  25, 'Accesorios'),
  ('Monitor LG 24"',            'Full HD 75Hz, HDMI',                         3200.00,   8, 'Electrónica'),
  ('Audífonos Sony WH-1000XM5', 'Bluetooth, cancelación de ruido',             2800.00,  15, 'Audio'),
  ('Webcam Logitech C920',      'Full HD 1080p',                              1200.00,  20, 'Accesorios'),
  ('Disco SSD Samsung 1TB',     'NVMe M.2',                                   1800.00,  30, 'Almacenamiento'),
  ('Impresora HP',              'Multifuncional WiFi',                        2500.00,   5, 'Oficina'),
  ('Silla Ergonómica',          'Soporte lumbar ajustable',                    3500.00,  12, 'Mobiliario'),
  ('Escritorio Madera',         '1.5m x 0.7m, color nogal',                    4200.00,   6, 'Mobiliario');

-- ============================================================
-- PEDIDO DE EJEMPLO (para Juan Pérez, id=2)
-- ============================================================
INSERT INTO pedidos (usuario_id, estado, total)
VALUES (2, 'pendiente', 1200.00)
RETURNING id;

-- Detalle del pedido 1 (Mouse + Teclado = 350 + 850 = 1200)
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES
  (1, 2, 1, 350.00),
  (1, 3, 1, 850.00);

-- ============================================================
-- FIN
-- ============================================================
