# Documentación Técnica del Proyecto
## Sistema de Control de Tienda — Arquitectura Cliente-Servidor

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Equipo:** [Nombre del equipo — máx. 5 integrantes]

---

## 1. Resumen ejecutivo

El **Sistema de Control de Tienda** es una aplicación web con arquitectura **cliente-servidor** que permite gestionar el inventario de productos de una tienda, registrar usuarios con roles (administrador y cliente), y procesar pedidos con descuento automático de stock.

El proyecto está desarrollado con:

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript vanilla |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Autenticación | JWT (JSON Web Tokens) + bcrypt |

---

## 2. Objetivos del proyecto

### 2.1 Objetivo general
Desarrollar un sistema cliente-servidor que permita gestionar de forma eficiente los productos, usuarios y pedidos de una tienda, aplicando buenas prácticas de desarrollo web, seguridad y diseño de bases de datos.

### 2.2 Objetivos específicos
- Implementar un CRUD completo de productos con control de acceso por rol.
- Permitir el registro y autenticación segura de usuarios.
- Gestionar pedidos con transacciones que garanticen la integridad del inventario.
- Aplicar una arquitectura en capas (presentación, lógica, datos).
- Documentar el sistema para su uso, mantenimiento y evaluación.

---

## 3. Alcance del sistema

### 3.1 Funcionalidades incluidas
- Registro e inicio de sesión con contraseñas cifradas (bcrypt).
- Roles diferenciados: `admin` y `cliente`.
- CRUD de productos (solo admin).
- Catálogo de productos visible para clientes.
- Carrito de compras en el navegador.
- Creación de pedidos con validación de stock.
- Descuento automático de inventario al confirmar un pedido.
- Consulta de pedidos por usuario (cliente) o todos (admin).
- Cambio de estado de pedidos (pendiente, pagado, entregado, cancelado).

### 3.2 Funcionalidades NO incluidas (fuera de alcance)
- Pasarela de pago real.
- Envío de correos electrónicos.
- Gestión de envíos y logística.
- Panel de reportes estadísticos avanzados.
- Multi-tienda o multi-sucursal.

---

## 4. Arquitectura del sistema

### 4.1 Vista general

```
┌─────────────────────┐
│     NAVEGADOR       │
│  (HTML + CSS + JS)  │
└──────────┬──────────┘
           │ HTTP/JSON
           ▼
┌─────────────────────┐
│   SERVIDOR EXPRESS  │
│  Node.js + Express  │
│  ├── Rutas API REST │
│  ├── Middleware JWT │
│  └── Lógica negocio │
└──────────┬──────────┘
           │ SQL (pg)
           ▼
┌─────────────────────┐
│     POSTGRESQL      │
│  Base de datos      │
│  relacional         │
└─────────────────────┘
```

### 4.2 Patrón cliente-servidor
- **Cliente:** navegador web. Consume la API REST mediante `fetch()`. Almacena el token JWT en `localStorage`.
- **Servidor:** API REST con Express. Valida tokens, aplica reglas de negocio y ejecuta consultas SQL.
- **Base de datos:** PostgreSQL. Garantiza integridad referencial y transacciones ACID.

### 4.3 Comunicación
- Protocolo: **HTTP** (localhost en desarrollo).
- Formato: **JSON**.
- Autenticación: header `Authorization: Bearer <token>`.

---

## 5. Tecnologías utilizadas

| Capa | Tecnología | Versión | Uso |
|------|-----------|---------|-----|
| Runtime | Node.js | 18 LTS | Ejecución del backend |
| Framework | Express | 4.x | Servidor HTTP y rutas |
| BD | PostgreSQL | 14+ | Almacenamiento |
| Driver | pg | 8.x | Conexión Node ↔ PostgreSQL |
| Seguridad | bcryptjs | 2.4 | Hash de contraseñas |
| Seguridad | jsonwebtoken | 9.x | Tokens JWT |
| Config | dotenv | 16.x | Variables de entorno |
| CORS | cors | 2.8 | Permitir peticiones cruzadas |
| Frontend | HTML/CSS/JS | — | Interfaz de usuario |

---

## 6. Estructura del proyecto

```
tienda/
├── backend/
│   ├── package.json          # Dependencias y scripts
│   ├── server.js             # Punto de entrada del servidor
│   ├── db.js                 # Pool de conexión a PostgreSQL
│   ├── schema.sql            # DDL de la base de datos
│   ├── seed.sql              # Datos de prueba
│   ├── crear-admin.js        # Script para crear/actualizar admin
│   ├── .env                  # Variables de entorno (no versionar)
│   ├── middleware/
│   │   └── auth.js           # Verificación JWT y roles
│   └── routes/
│       ├── auth.js           # Registro y login
│       ├── productos.js      # CRUD productos
│       └── pedidos.js        # Gestión pedidos
├── frontend/
│   ├── index.html            # Login / registro
│   ├── tienda.html           # Catálogo + carrito
│   ├── admin.html            # Panel administración
│   ├── pedidos.html          # Lista de pedidos
│   ├── styles.css            # Estilos compartidos
│   ├── api.js                # Helpers fetch + auth
│   ├── login.js              # Lógica de login
│   ├── tienda.js             # Lógica de catálogo
│   ├── admin.js              # Lógica de admin
│   └── pedidos.js            # Lógica de pedidos
└── docs/
    ├── manual-instalacion.md
    ├── manual-tecnico.md
    ├── manual-usuario.md
    └── DER.md
```

---

## 7. Diseño de la base de datos

### 7.1 Modelo Entidad-Relación (DER)

```
┌────────────┐         ┌────────────┐
│  USUARIOS  │         │ PRODUCTOS  │
├────────────┤         ├────────────┤
│ id (PK)    │         │ id (PK)    │
│ nombre     │         │ nombre     │
│ email (U)  │         │ descripcion│
│ password   │         │ precio     │
│ rol        │         │ stock      │
└─────┬──────┘         │ categoria  │
      │1               └─────┬──────┘
      │                      │1
      │N                     │N
┌─────▼──────┐         ┌─────▼──────┐
│  PEDIDOS   │         │  DETALLE_  │
├────────────┤   1   N │  PEDIDO    │
│ id (PK)    │─────────┼────────────┤
│ usuario_id │         │ id (PK)    │
│ fecha      │         │ pedido_id  │
│ estado     │         │producto_id │
│ total      │         │ cantidad   │
└────────────┘         │precio_unit │
                       └────────────┘
```

### 7.2 Diccionario de datos

#### Tabla `usuarios`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre completo |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Correo electrónico |
| password | VARCHAR(255) | NOT NULL | Hash bcrypt |
| rol | VARCHAR(20) | CHECK (admin/cliente) | Rol del usuario |

#### Tabla `productos`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | SERIAL | PK | Identificador |
| nombre | VARCHAR(150) | NOT NULL | Nombre del producto |
| descripcion | TEXT | — | Descripción libre |
| precio | NUMERIC(10,2) | >= 0 | Precio unitario |
| stock | INTEGER | >= 0 | Existencia disponible |
| categoria | VARCHAR(80) | — | Categoría |

#### Tabla `pedidos`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | SERIAL | PK | Identificador |
| usuario_id | INTEGER | FK → usuarios | Cliente que pidió |
| fecha | TIMESTAMP | DEFAULT now() | Fecha del pedido |
| estado | VARCHAR(20) | CHECK (pendiente/pagado/entregado/cancelado) | Estado |
| total | NUMERIC(10,2) | DEFAULT 0 | Total del pedido |

#### Tabla `detalle_pedido`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | SERIAL | PK | Identificador |
| pedido_id | INTEGER | FK → pedidos | Pedido al que pertenece |
| producto_id | INTEGER | FK → productos | Producto vendido |
| cantidad | INTEGER | > 0 | Cantidad |
| precio_unitario | NUMERIC(10,2) | NOT NULL | Precio al momento de la compra |

### 7.3 Relaciones
- **usuarios 1:N pedidos** — un usuario puede crear muchos pedidos.
- **pedidos 1:N detalle_pedido** — un pedido contiene varios productos.
- **productos 1:N detalle_pedido** — un producto puede aparecer en varios pedidos.

---

## 8. API REST — Endpoints

### 8.1 Autenticación

| Método | Ruta | Acceso | Body | Respuesta |
|--------|------|--------|------|-----------|
| POST | `/api/auth/registro` | Público | `{nombre, email, password}` | `{id}` |
| POST | `/api/auth/login` | Público | `{email, password}` | `{token, rol, nombre}` |

### 8.2 Productos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/productos` | Público | Lista todos los productos |
| POST | `/api/productos` | Admin | Crea producto |
| PUT | `/api/productos/:id` | Admin | Actualiza producto |
| DELETE | `/api/productos/:id` | Admin | Elimina producto |

### 8.3 Pedidos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/pedidos` | Cliente | Crea un pedido con items |
| GET | `/api/pedidos` | Ambos | Admin ve todos / cliente los suyos |
| PATCH | `/api/pedidos/:id/estado` | Admin | Cambia estado del pedido |

### 8.4 Ejemplo de request/response

**POST** `/api/auth/login`

```json
// Request
{ "email": "admin@tienda.com", "password": "admin123" }

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "rol": "admin",
  "nombre": "Administrador"
}

// Response 401
{ "error": "Credenciales inválidas" }
```

**POST** `/api/pedidos` (con header `Authorization: Bearer <token>`)

```json
// Request
{
  "items": [
    { "producto_id": 2, "cantidad": 2 },
    { "producto_id": 3, "cantidad": 1 }
  ]
}

// Response 200
{ "id": 5 }
```

---

## 9. Seguridad implementada

### 9.1 Hash de contraseñas
- Librería: `bcryptjs`, con **10 rondas de salt**.
- Nunca se guarda la contraseña en texto plano.
- El login compara con `bcrypt.compare(password, hash)`.

### 9.2 Autenticación con JWT
- Al iniciar sesión se emite un token firmado con `JWT_SECRET`.
- El token expira a las **8 horas**.
- El cliente lo envía en cada petición protegida: `Authorization: Bearer <token>`.

### 9.3 Autorización por roles
- Middleware `verificarToken`: valida el token.
- Middleware `soloAdmin`: verifica `rol === 'admin'`.

### 9.4 Transacciones
- La creación de pedidos usa `BEGIN / COMMIT / ROLLBACK`.
- Se usa `SELECT ... FOR UPDATE` para bloquear filas y evitar condiciones de carrera en el stock.

### 9.5 Validaciones
- Tipo de dato en base de datos (`CHECK`, `NOT NULL`, `UNIQUE`).
- Validación de campos obligatorios en las rutas.
- Validación de stock suficiente antes de confirmar el pedido.

---

## 10. Flujo de un pedido (caso de uso)

```
1. Cliente se autentica → recibe token JWT
2. Cliente navega el catálogo (GET /api/productos)
3. Agrega productos al carrito (localStorage)
4. Pulsa "Realizar pedido"
5. POST /api/pedidos con items y token
6. Servidor:
   a. Verifica token
   b. BEGIN transacción
   c. Para cada item: SELECT ... FOR UPDATE, valida stock
   d. INSERT en pedidos
   e. INSERT en detalle_pedido
   f. UPDATE productos SET stock = stock - cantidad
   g. COMMIT
7. Devuelve id del pedido al cliente
8. Cliente limpia carrito y refresca catálogo
```

---

## 11. Pruebas realizadas

| # | Prueba | Resultado esperado | Estado |
|---|--------|--------------------|--------|
| 1 | Registro con email nuevo | Usuario creado | ✅ |
| 2 | Registro con email duplicado | Error 400 | ✅ |
| 3 | Login correcto | Token válido | ✅ |
| 4 | Login con contraseña incorrecta | Error 401 | ✅ |
| 5 | Cliente intenta crear producto | Error 403 | ✅ |
| 6 | Admin crea producto | Producto creado | ✅ |
| 7 | Admin elimina producto | Producto eliminado | ✅ |
| 8 | Cliente crea pedido válido | Stock descontado | ✅ |
| 9 | Pedido con stock insuficiente | Error 400 + rollback | ✅ |
| 10 | Admin cambia estado del pedido | Estado actualizado | ✅ |

---

## 12. Manual de usuario (resumen)

### 12.1 Como cliente
1. Registrarse en `http://localhost:3000`.
2. Iniciar sesión.
3. Navegar el catálogo, usar el buscador y filtro por categoría.
4. Agregar productos al carrito.
5. Pulsar "Realizar pedido".
6. Consultar sus pedidos en la pestaña "Mis pedidos".

### 12.2 Como administrador
1. Iniciar sesión con credenciales admin.
2. En el panel admin:
   - **Crear producto:** rellenar formulario superior y "Guardar".
   - **Editar producto:** botón ✏️ en la fila.
   - **Eliminar producto:** botón 🗑️.
3. Ver y cambiar el estado de cualquier pedido en la pestaña "Pedidos".

---

## 13. Conclusiones

El sistema cumple con los objetivos planteados:

- ✅ Implementa arquitectura **cliente-servidor** clara.
- ✅ API REST con rutas protegidas por rol.
- ✅ Base de datos relacional normalizada con integridad referencial.
- ✅ Seguridad con bcrypt y JWT.
- ✅ Transacciones ACID para consistencia del inventario.
- ✅ Interfaz usable y responsive.
- ✅ Documentación completa: instalación, técnica y usuario.

---

## 14. Trabajo futuro

- Añadir módulo de pagos (simulado o con pasarela).
- Reportes gráficos de ventas.
- Envío de correos de confirmación.
- Panel de gestión de usuarios.
- Dockerización del sistema.
- Despliegue en servidor VPS (Linux + Nginx + PM2).

---

## 15. Anexos

### 15.1 Comandos útiles

```bash
# Iniciar el proyecto
cd backend && npm start

# Ver usuarios
psql -h localhost -U tienda_user -d tienda \
  -c "SELECT id, nombre, email, rol FROM usuarios;"

# Ver productos con bajo stock
psql -h localhost -U tienda_user -d tienda \
  -c "SELECT nombre, stock FROM productos WHERE stock < 10;"

# Recargar datos de prueba
psql -h localhost -U tienda_user -d tienda -f seed.sql
```

### 15.2 Referencias

- Documentación oficial de Node.js: https://nodejs.org
- Documentación de Express: https://expressjs.com
- Documentación de PostgreSQL: https://www.postgresql.org/docs/
- Documentación de bcryptjs: https://www.npmjs.com/package/bcryptjs
- Documentación de jsonwebtoken: https://www.npmjs.com/package/jsonwebtoken

---

**Fin de la Documentación del Proyecto**
