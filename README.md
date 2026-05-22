# Bunkers de Refacciones — Sistema de Inventario Técnico

Sistema web para la gestión de inventario de refacciones y equipo técnico distribuido en bunkers (almacenes foráneos) y el centro de distribución CREARH.

---

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18 o superior (recomendado 20 LTS) | https://nodejs.org |
| npm | incluido con Node.js | — |
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
DB_PATH=./database/bunkers.db
NODE_ENV=development
```

> **Importante:** cambia el valor de `JWT_SECRET` por una cadena aleatoria larga antes de usar el sistema en producción.

### 4. Inicializar la base de datos

```bash
cd backend
node src/scripts/initDB.js
cd ..
```

Esto crea el archivo SQLite, aplica el esquema y carga los datos iniciales (roles, tipos de movimiento, bunkers base).

### 5. (Opcional) Importar inventario desde archivos Excel

Si cuentas con los archivos `.xlsx` de inventario por bunker en la carpeta `inventory_by_bunker/`:

```bash
cd backend
node src/scripts/importarTodosBunkers.js
cd ..
```

### 6. Iniciar la aplicación en modo desarrollo

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

### 3. Instalar dependencias

```powershell
npm run install:all
```

> **Si el comando falla con error de `better-sqlite3`:** este paquete requiere compilar código nativo. Instala las herramientas de compilación ejecutando el siguiente comando en PowerShell **como Administrador** y luego repite la instalación:
>
> ```powershell
> npm install --global windows-build-tools
> ```
>
> En versiones recientes de Windows también puedes instalar **Visual Studio Build Tools** desde https://visualstudio.microsoft.com/visual-cpp-build-tools/ seleccionando la carga de trabajo "Desarrollo para escritorio con C++".

### 4. Configurar variables de entorno del backend

Crea el archivo `backend\.env` (puedes hacerlo con el Bloc de notas o cualquier editor de texto):

```env
PORT=3001
JWT_SECRET=cambia_esto_por_una_cadena_secreta_de_64_caracteres
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
DB_PATH=./database/bunkers.db
NODE_ENV=development
```

### 5. Inicializar la base de datos

```powershell
cd backend
node src/scripts/initDB.js
cd ..
```

### 6. (Opcional) Importar inventario desde archivos Excel

```powershell
cd backend
node src/scripts/importarTodosBunkers.js
cd ..
```

### 7. Iniciar la aplicación en modo desarrollo

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
├── backend/                  # API REST (Node.js + Express + SQLite)
│   ├── database/
│   │   ├── schema.sql        # Esquema de la base de datos
│   │   ├── seed.sql          # Datos iniciales
│   │   └── bunkers.db        # Archivo SQLite (se genera al inicializar)
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
├── inventory_by_bunker/      # Archivos Excel de inventario inicial por bunker
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
| `node src/scripts/importarTodosBunkers.js` | Importa inventario desde los archivos Excel de `inventory_by_bunker/` |

---

## Solución de problemas frecuentes

**El backend no inicia y muestra error de `better-sqlite3`**
Esto ocurre cuando el módulo nativo fue compilado para una arquitectura diferente. Solución:
```bash
cd backend
npm rebuild better-sqlite3
```

**Error `EADDRINUSE: address already in use :::3001`**
El puerto 3001 ya está en uso. Cambia el valor de `PORT` en `backend/.env` o detén el proceso que lo ocupa.

**El frontend carga pero no muestra datos**
Verifica que el backend esté corriendo en `http://localhost:3001`. Revisa la consola del navegador y los logs del backend.

**En Windows: error durante `npm install` relacionado con `node-gyp`**
Instala las herramientas de compilación de C++ como se describe en el paso 3 de la instalación en Windows.
