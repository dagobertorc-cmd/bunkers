# Bunkers de Refacciones — Sistema de Inventario Técnico

Sistema web para la gestión de inventario de refacciones y equipo técnico distribuido en bunkers (almacenes foráneos) y el centro de distribución CREARH.

---

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18 o superior (recomendado 20 LTS) | https://nodejs.org |
| npm | incluido con Node.js | — |
| MySQL Server | 8.0 o superior | https://dev.mysql.com/downloads/ |
| Git | cualquier versión reciente | https://git-scm.com |

> **Nota sobre arquitectura (Mac con Apple Silicon):** asegúrate de instalar Node.js nativo para ARM64 (no la versión Rosetta/x86). Puedes verificarlo ejecutando `node -e "console.log(process.arch)"` — debe mostrar `arm64`.

---

## Instalación en macOS / Linux

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd bunkers
```

### 2. Instalar dependencias

```bash
npm run install:all
```

Esto instala las dependencias del backend y del frontend en un solo comando.

### 3. Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

Si no existe `.env.example`, crea el archivo `backend/.env` con el siguiente contenido:

```env
PORT=3001
JWT_SECRET=cambia_esto_por_una_cadena_secreta_de_64_caracteres
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=bunkers
NODE_ENV=development
```

> **Importante:** cambia `JWT_SECRET` por una cadena aleatoria larga y ajusta las credenciales de MySQL (`DB_USER`, `DB_PASS`) antes de usar el sistema en producción.

### 4. Crear la base de datos en MySQL

Antes de inicializar, crea la base de datos en tu servidor MySQL:

```sql
CREATE DATABASE bunkers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Puedes ejecutarlo desde la consola de MySQL o desde cualquier cliente (MySQL Workbench, DBeaver, etc.).

### 5. Inicializar la base de datos

```bash
cd backend
node src/scripts/initDB.js
cd ..
```

Esto aplica el esquema en MySQL y carga los datos iniciales (roles, tipos de movimiento, bunkers base).

### 6. (Opcional) Importar inventario desde archivos Excel

Si cuentas con los archivos `.xlsx` de inventario por bunker en la carpeta `inventory_by_bunker/`:

```bash
cd backend
node src/scripts/importarTodosBunkers.js
cd ..
```

### 7. Iniciar la aplicación en modo desarrollo

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto levanta simultáneamente:
- **Backend** en `http://localhost:3001`
- **Frontend** en `http://localhost:5173`

Abre `http://localhost:5173` en tu navegador.

### Credenciales iniciales

| Campo | Valor |
|---|---|
| Email | `admin@bunkers.local` |
| Contraseña | `Admin2024!` |

---

## Instalación en Windows

### 1. Instalar Node.js

Descarga el instalador desde https://nodejs.org y selecciona la versión **20 LTS**. Durante la instalación, acepta la opción de agregar Node al PATH.

Verifica la instalación abriendo **PowerShell** o **CMD**:

```powershell
node --version
npm --version
```

### 2. Clonar el repositorio

```powershell
git clone <url-del-repositorio>
cd bunkers
```

### 3. Instalar MySQL Server

Descarga e instala **MySQL 8.0** desde https://dev.mysql.com/downloads/installer/. Durante la instalación configura la contraseña del usuario `root`.

### 4. Instalar dependencias

```powershell
npm run install:all
```

### 5. Configurar variables de entorno del backend

Crea el archivo `backend\.env` (puedes hacerlo con el Bloc de notas o cualquier editor de texto):

```env
PORT=3001
JWT_SECRET=cambia_esto_por_una_cadena_secreta_de_64_caracteres
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=bunkers
NODE_ENV=development
```

### 6. Crear la base de datos en MySQL

```sql
CREATE DATABASE bunkers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 7. Inicializar la base de datos

```powershell
cd backend
node src/scripts/initDB.js
cd ..
```

### 8. (Opcional) Importar inventario desde archivos Excel

```powershell
cd backend
node src/scripts/importarTodosBunkers.js
cd ..
```

### 9. Iniciar la aplicación en modo desarrollo

```powershell
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### Credenciales iniciales

| Campo | Valor |
|---|---|
| Email | `admin@bunkers.local` |
| Contraseña | `Admin2024!` |

---

## Estructura del proyecto

```
bunkers/
├── backend/                  # API REST (Node.js + Express + MySQL)
│   ├── database/
│   │   ├── schema.sql        # Esquema de la base de datos
│   │   └── seed.sql          # Datos iniciales
│   ├── src/
│   │   ├── config/           # Configuración de base de datos
│   │   ├── controllers/      # Lógica de cada endpoint
│   │   ├── middlewares/      # Autenticación JWT y validación
│   │   ├── routes/           # Definición de rutas de la API
│   │   ├── scripts/          # Scripts de inicialización e importación
│   │   ├── services/         # Capa de acceso a datos
│   │   └── utils/            # Utilidades (JWT, paginación, respuestas)
│   ├── uploads/              # Fotos de evidencia subidas
│   └── server.js             # Punto de entrada del backend
├── frontend/                 # Interfaz web (React + Vite + Tailwind)
│   └── src/
│       ├── components/       # Componentes reutilizables (Layout, UI)
│       ├── hooks/            # Hooks personalizados
│       ├── pages/            # Páginas de la aplicación
│       ├── services/         # Llamadas a la API
│       ├── store/            # Estado global (Zustand)
│       └── utils/            # Constantes y formateadores
├── inventory_by_bunker/      # Archivos Excel de inventario inicial (14 bunkers)
├── tiendas.xlsx              # Catálogo de tiendas
└── package.json              # Scripts raíz (dev, build, install:all)
```

---

## Roles del sistema

| Rol | Permisos |
|---|---|
| `SUPERADMIN` | Acceso total |
| `ADMIN` | Inventario, movimientos, catálogos, reportes |
| `SUPERVISOR` | Lectura de inventario, aprobación de movimientos y requisiciones |
| `INGENIERO` | Crear movimientos y tickets, lectura de inventario |
| `CONSULTA` | Solo lectura |

---

## Scripts disponibles

Ejecutados desde la raíz del proyecto:

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia backend y frontend en modo desarrollo |
| `npm run install:all` | Instala todas las dependencias |
| `npm run build` | Genera el build de producción del frontend |

Ejecutados desde `backend/`:

| Comando | Descripción |
|---|---|
| `node src/scripts/initDB.js` | Inicializa la base de datos (esquema + datos iniciales) |
| `node src/scripts/migrarDatos.js` | Aplica adiciones al esquema y carga datos reales (formatos, tiendas, usuarios) |
| `node src/scripts/importarTodosBunkers.js` | Importa inventario desde los archivos Excel de `inventory_by_bunker/` |
| `node src/scripts/importarReynosa.js` | Importa inventario específico del bunker Reynosa |
| `node src/scripts/quitarCodigo.js` | Script de migración: elimina el índice `codigo` de la tabla de artículos |

---

## Despliegue en producción con PM2

El proyecto incluye `backend/ecosystem.config.js` para gestionar el proceso del backend con **PM2**.

### Instalar PM2

```bash
npm install -g pm2
```

### Iniciar el backend en producción

```bash
cd backend
pm2 start ecosystem.config.js --env production
```

### Comandos útiles de PM2

| Comando | Descripción |
|---|---|
| `pm2 list` | Muestra el estado de los procesos |
| `pm2 logs bunkers-api` | Muestra los logs del backend |
| `pm2 restart bunkers-api` | Reinicia el proceso |
| `pm2 stop bunkers-api` | Detiene el proceso |
| `pm2 startup` | Configura PM2 para iniciar al arranque del sistema |

Los logs se guardan en `backend/logs/error.log` y `backend/logs/out.log`.

> **Nota:** El frontend en producción debe compilarse con `npm run build` desde la raíz y servirse desde un servidor web como Nginx o Apache apuntando a `frontend/dist/`.

---

## Solución de problemas frecuentes

**El backend no inicia y muestra `Access denied for user` o `ECONNREFUSED`**
El servidor MySQL no está corriendo o las credenciales en `backend/.env` son incorrectas. Verifica que MySQL esté activo y que `DB_HOST`, `DB_USER`, `DB_PASS` y `DB_NAME` sean correctos.

**Error `Unknown database 'bunkers'`**
La base de datos aún no existe. Ejecútalo en tu cliente MySQL:
```sql
CREATE DATABASE bunkers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Error `EADDRINUSE: address already in use :::3001`**
El puerto 3001 ya está en uso. Cambia el valor de `PORT` en `backend/.env` o detén el proceso que lo ocupa.

**El frontend carga pero no muestra datos**
Verifica que el backend esté corriendo en `http://localhost:3001` y que la conexión a MySQL sea exitosa. Revisa la consola del navegador y los logs del backend.
