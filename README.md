# Proyecto 2 — Base de datos
Jackelyn Giron 24737

## Problema

La tienda maneja productos agrupados en categorías, comprados a proveedores. Los clientes realizan compras atendidas por empleados. Cada compra puede incluir varios productos y debe quedar registrada junto con el detalle de lo vendido. La tienda necesita controlar el stock disponible y generar reportes de ventas

---

## Organización del repositorio

En la raíz del proyecto se crean **`docker-compose.yml`** y **`.env`** copiando los archivos `*.example` (no van versionados con secretos).

```
Proyecto2_BD/
├── backend/
│   ├── app.py          # FastAPI: routers, CORS, lifespan
│   ├── database.py     # Pool + helpers SQL
│   ├── auth_deps.py    # Session cookie, guards admin
│   ├── routers/        # auth, productos, categorias, marcas, clientes,
│   │                   # proveedores, empleados, compras, ventas, informes…
│   └── schemas/        # Pydantic request/response
├── db/
│   ├── init.sql        # DDL: tablas, PKs, FKs, índices, vistas
│   └── populete.sql    # Datos de prueba
└── frontend/src/
    ├── app/            # Páginas por módulo
    ├── components/
    │   ├── Layout/     # Shell, Navbar, FloatingButton
    │   └── modal/      # Formularios y modales por entidad
    ├── lib/            # apiClient, authRoutes, adminHeaders
    ├── types/          # Tipos TS alineados con la API
    └── hooks/          # useAuth, useDebouncedValue…
```

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/) (plugin `docker compose`).
- Credenciales de base de datos indicadas para el Proyecto 2

---

## Configuración

### 1. Variables de entorno

En la raíz del proyecto, crea un archivo **`.env`** copiando la plantilla:

```bash
copy .env.example .env
```

En sistemas tipo Unix:

```bash
cp .env.example .env
```

Editar **`.env`** y completar con las credenciales **`DB_USER`** y **`DB_PASSWORD`** (

### 2. Docker Compose

Crea **`docker-compose.yml`** en la raíz copiando el ejemplo:

```bash
copy docker-compose.yml.example docker-compose.yml
```

```bash
cp docker-compose.yml.example docker-compose.yml
```

Ajustar si es requerido (puertos, rutas, etc.). El archivo expone:

- PostgreSQL en el host en el puerto **5433** (mapeado al 5432 del contenedor).
- Backend en **http://localhost:8000**
- Frontend en **http://localhost:5174**

---

## Levantar el proyecto

Desde la raíz del repositorio (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

La primera vez construye las imágenes y aplica el esquema y datos según los scripts en `db/`. Cuando los servicios estén listos, abre el frontend en el navegador (puerto configurado en compose, p. ej. **5174**).

Para detener:

```bash
docker compose down
```

---

## Usuarios de prueba (seed)

Datos cargados en el script de población (`db/populete.sql`):

| Correo | Contraseña | Rol |
|--------|------------|-----|
| `admin@seed.local` | `admin123` | Administrador |
| `vendedor@seed.local` | `vendedor123` | Vendedor |

El administrador puede acceder a secciones globales (empleados, proveedores, todas las ventas, informes, etc.); el vendedor tiene un alcance acorde a su rol en la aplicación.

---

## Incluye

- **Consultas SQL explícitas** en el backend (sin ORM que oculte el SQL de negocio principal).
- **CRUD completo en la interfaz** para **proveedor** y **empleado** (altas, listados, edición y baja/desactivación según reglas del API).
- **Informes / reportes** con **datos reales** de la base, expuestos por endpoints dedicados y mostrados en la página de informes del frontend.
- **Manejo visible de errores** para el usuario: mensajes en UI cuando fallan cargas o validaciones, y respuestas de error coherentes desde la API.
- **Autenticación** con sesión (login / logout) y rutas protegidas según rol.