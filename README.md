# Sistema de Control de Tienda

Proyecto escolar de un sistema web para gestionar productos, pedidos y usuarios de una tienda.
Está hecho con **Node.js + Express + PostgreSQL** en el backend y **HTML, CSS y JavaScript** en el frontend.

---

## ¿Qué hace el sistema?

- Los **clientes** pueden ver el catálogo, agregar productos al carrito y hacer pedidos.
- Los **administradores** pueden crear, editar y eliminar productos, y cambiar el estado de los pedidos.
- Los usuarios se registran e inician sesión con contraseñas seguras (cifradas).
- Al hacer un pedido, el stock de los productos se descuenta automáticamente.

---

## Tecnologías usadas

- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** HTML, CSS, JavaScript
- **Seguridad:** JWT y bcrypt

---

## Cómo instalarlo

### 1. Instalar lo necesario

```bash
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Crear la base de datos

```bash
sudo -u postgres psql
```

Dentro de `psql`:

```sql
CREATE DATABASE tienda;
CREATE USER tienda_user WITH PASSWORD 'tienda_pass';
GRANT ALL PRIVILEGES ON DATABASE tienda TO tienda_user;
\c tienda
GRANT ALL ON SCHEMA public TO tienda_user;
\q
```

### 3. Preparar el backend

```bash
cd backend
npm install
```

Crea el archivo `.env` con este contenido:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=tienda_user
DB_PASSWORD=tienda_pass
DB_NAME=tienda
JWT_SECRET=clave_secreta_tienda
```

### 4. Crear las tablas y datos de prueba

```bash
psql -h localhost -U tienda_user -d tienda -f schema.sql
psql -h localhost -U tienda_user -d tienda -f seed.sql
node crear-admin.js
```

### 5. Arrancar el sistema

```bash
npm start
```

Abre tu navegador en:

```
http://localhost:3000
```

---

## Usuarios de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | admin@tienda.com | admin123 |
| Cliente | juan@example.com | password123 |

---

## Cómo se usa

**Como cliente:**
1. Inicia sesión.
2. Busca productos en el catálogo.
3. Agrégalos al carrito.
4. Pulsa **"Realizar pedido"**.

**Como administrador:**
1. Inicia sesión con la cuenta admin.
2. En el panel puedes **agregar, editar o eliminar** productos.
3. En la pestaña **Pedidos** puedes cambiar el estado de cada pedido.

---

## Estructura del proyecto

```
tienda/
├── backend/       → servidor, rutas y conexión a la base de datos
├── frontend/      → páginas HTML, estilos y scripts
└── docs/          → manuales y documentación
```

---

## Documentación

Los manuales están en la carpeta `docs/`:

- `manual-instalacion.md` → cómo instalar paso a paso
- `manual-tecnico.md` → cómo está hecho por dentro
- `manual-usuario.md` → cómo usar el sistema
- `DER.md` → diagrama de la base de datos

---

## Problemas comunes

| Error | Solución |
|-------|----------|
| `Cannot find module 'dotenv'` | Ejecuta `npm install` en `backend/` |
| `Peer authentication failed` | Agrega `-h localhost` a los comandos `psql` |
| `Credenciales inválidas` | Ejecuta `node crear-admin.js` |
| `El puerto 3000 está ocupado` | Cambia `PORT` en `.env` |

Proyecto académico con fines educativos.
