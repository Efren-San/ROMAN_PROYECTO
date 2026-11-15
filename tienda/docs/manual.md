# Manual de Instalación
## Sistema de Control de Tienda — Arquitectura Cliente-Servidor

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Stack:** Node.js + Express + PostgreSQL + HTML/CSS/JS

---

## 1. Introducción

Este manual describe paso a paso cómo instalar y poner en marcha el **Sistema de Control de Tienda** en un equipo con **Linux (Ubuntu/Debian)** o **WSL2 en Windows**.

El sistema permite:
- Gestión de productos (crear, actualizar, eliminar)
- Registro de usuarios (clientes y administradores)
- Realización de pedidos con descuento automático de stock
- Consulta y cambio de estado de pedidos

---

## 2. Requisitos del sistema

### 2.1 Hardware mínimo
| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| RAM | 4 GB | 8 GB |
| Disco | 5 GB libres | 10 GB libres |
| CPU | 2 núcleos | 4 núcleos |

### 2.2 Software
| Software | Versión mínima |
|----------|----------------|
| Sistema operativo | Ubuntu 20.04 / WSL2 / Debian 11 |
| Node.js | 18 LTS |
| npm | 9+ |
| PostgreSQL | 14+ |
| Navegador | Chrome / Firefox / Edge actualizado |

---

## 3. Instalación de dependencias del sistema

### 3.1 Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 Instalar Node.js 18 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

Verificar:

```bash
node --version   # v18.x.x
npm --version    # 9.x.x o superior
```

### 3.3 Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

Verificar que está corriendo:

```bash
sudo service postgresql status
```

Debe mostrar `active (running)`.

### 3.4 Instalar herramientas de compilación (opcional, por si acaso)

```bash
sudo apt install -y build-essential
```

---

## 4. Configuración de la base de datos

### 4.1 Crear la base de datos y el usuario

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

> ⚠️ **Importante (PostgreSQL 15+):** el último `GRANT ... ON SCHEMA public` es **obligatorio**. Sin él, el usuario no puede crear tablas.

### 4.2 Probar la conexión

```bash
psql -h localhost -U tienda_user -d tienda -c "SELECT version();"
```

Debe mostrar la versión de PostgreSQL instalada. Te pedirá la contraseña `tienda_pass`.

---

## 5. Instalación del proyecto

### 5.1 Clonar o copiar el proyecto

```bash
cd ~
git clone <URL_DEL_REPOSITORIO> ROMAN_PROYECTO
cd ROMAN_PROYECTO/tienda
```

Si no usas git, copia la carpeta manualmente.

### 5.2 Estructura esperada

```
tienda/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── db.js
│   ├── schema.sql
│   ├── seed.sql
│   ├── crear-admin.js
│   ├── .env
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       ├── productos.js
│       └── pedidos.js
├── frontend/
│   ├── index.html
│   ├── tienda.html
│   ├── admin.html
│   ├── pedidos.html
│   ├── styles.css
│   ├── api.js
│   ├── login.js
│   ├── tienda.js
│   ├── admin.js
│   └── pedidos.js
└── docs/
    ├── manual-instalacion.md
    ├── manual-tecnico.md
    ├── manual-usuario.md
    └── DER.md
```

### 5.3 Instalar dependencias del backend

```bash
cd backend
npm install
```

Debe instalar express, pg, bcryptjs, jsonwebtoken, cors y dotenv.

### 5.4 Crear el archivo `.env`

```bash
nano .env
```

Contenido:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=tienda_user
DB_PASSWORD=tienda_pass
DB_NAME=tienda
JWT_SECRET=clave_secreta_tienda_cambiar_en_produccion
```

Guardar con `Ctrl+O`, Enter y salir con `Ctrl+X`.

### 5.5 Crear las tablas

```bash
psql -h localhost -U tienda_user -d tienda -f schema.sql
```

Verificar que las 4 tablas se crearon:

```bash
psql -h localhost -U tienda_user -d tienda -c "\dt"
```

Debe mostrar: `usuarios`, `productos`, `pedidos`, `detalle_pedido`.

### 5.6 Cargar datos de prueba (opcional pero recomendado)

```bash
psql -h localhost -U tienda_user -d tienda -f seed.sql
```

Esto crea:
- 3 usuarios de prueba
- 10 productos de ejemplo
- 1 pedido de muestra

---

## 6. Crear el usuario administrador

### Opción A — Script automático (recomendado)

```bash
node crear-admin.js
```

Salida esperada:

```
✅ Admin actualizado: admin@tienda.com / admin123
```

### Opción B — Manual desde la web + SQL

1. Abrir `http://localhost:3000`
2. Registrarse normalmente (queda como `cliente`)
3. Convertirlo en admin:

```bash
psql -h localhost -U tienda_user -d tienda \
  -c "UPDATE usuarios SET rol='admin' WHERE email='tu_email@ejemplo.com';"
```

---

## 7. Ejecución del sistema

### 7.1 Iniciar el backend

Desde `backend/`:

```bash
npm start
```

Salida esperada:

```
✅ Conectado a PostgreSQL
🚀 Servidor en http://localhost:3000
```

### 7.2 Abrir el sistema en el navegador

```
http://localhost:3000
```

### 7.3 Iniciar sesión

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@tienda.com | admin123 |
| Cliente | juan@example.com | password123 |

---

## 8. Verificación del sistema

Ejecutar estas comprobaciones para confirmar que todo está bien:

### 8.1 Verificar conexión a la BD

```bash
psql -h localhost -U tienda_user -d tienda -c "SELECT COUNT(*) FROM usuarios;"
```

### 8.2 Verificar endpoint de productos

```bash
curl http://localhost:3000/api/productos
```

Debe devolver un JSON con la lista de productos.

### 8.3 Verificar login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tienda.com","password":"admin123"}'
```

Debe devolver un JSON con `token`, `rol` y `nombre`.

---

## 9. Solución de problemas comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| `Cannot find module 'dotenv'` | Falta `npm install` | Ejecutar `npm install` en `backend/` |
| `Peer authentication failed` | `psql` usando socket local | Añadir `-h localhost` a los comandos `psql` |
| `permission denied for schema public` | PostgreSQL 15+ revocó permisos | `GRANT ALL ON SCHEMA public TO tienda_user;` |
| `Credenciales inválidas` en login | Hash de contraseña no corresponde | Ejecutar `node crear-admin.js` |
| `EADDRINUSE: port 3000` | Puerto ocupado | Cambiar `PORT` en `.env` o matar proceso: `sudo lsof -i :3000` |
| `database "tienda" already exists` | Base creada antes | Ignorar el error o usar `DROP DATABASE tienda;` |
| `relation "usuarios" does not exist` | No se ejecutó `schema.sql` | Ejecutar `psql ... -f schema.sql` |

---

## 10. Detener y reiniciar el sistema

### Detener el backend
`Ctrl+C` en la terminal donde corre `npm start`.

### Detener PostgreSQL (opcional)
```bash
sudo service postgresql stop
```

### Reiniciar PostgreSQL
```bash
sudo service postgresql restart
```

### Reiniciar el proyecto completo
```bash
sudo service postgresql restart
cd ~/ROMAN_PROYECTO/tienda/backend
npm start
```

---

## 11. Desinstalación

```bash
# Detener servicios
sudo service postgresql stop

# Eliminar base de datos
sudo -u postgres psql -c "DROP DATABASE tienda;"
sudo -u postgres psql -c "DROP USER tienda_user;"

# Eliminar el proyecto
rm -rf ~/ROMAN_PROYECTO/tienda

# (Opcional) desinstalar PostgreSQL
sudo apt remove --purge postgresql postgresql-contrib -y
```

---

## 12. Checklist final de instalación

- [ ] Node.js 18+ instalado y funcionando
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `tienda` creada
- [ ] Usuario `tienda_user` creado con permisos
- [ ] Proyecto copiado en `~/ROMAN_PROYECTO/tienda`
- [ ] `npm install` ejecutado sin errores
- [ ] Archivo `.env` configurado
- [ ] Tablas creadas con `schema.sql`
- [ ] Datos de prueba cargados con `seed.sql`
- [ ] Admin creado con `crear-admin.js`
- [ ] `npm start` arranca sin errores
- [ ] `http://localhost:3000` muestra la página de login
- [ ] Login con `admin@tienda.com` / `admin123` funciona

---

**Fin del Manual de Instalación**
