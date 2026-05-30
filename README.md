# Proyecto 3 — Base de datos

**Jackelyn Giron · 24737**

Sistema web para un supermercado: inventario, compras a proveedores, ventas con control de stock e informes. Stack: **PostgreSQL** (roles y stored procedures en el DBMS), **FastAPI - SQLAlquemy** (ORM + invocación de SP), **React + Vite** (UI con rutas protegidas por rol).

---

## Problema

La tienda maneja productos agrupados en categorías y marcas, comprados a proveedores. Los clientes realizan compras atendidas por empleados. Cada operación debe quedar registrada con detalle, controlando el stock disponible y permitiendo reportes de ventas y compras.

---

## Descripción general

| Capa | Responsabilidad |
|------|-----------------|
| **DB** (`db/`) | DDL, 5 roles PostgreSQL con `GRANT`/`REVOKE`, 5 stored procedures, triggers, vista `v_producto_con_categoria`, datos seed |
| **Backend** (`backend/`) | API REST, autenticación JWT, `SET LOCAL ROLE` por NIT del empleado, ORM SQLAlchemy y llamadas `CALL` a procedures |
| **Frontend** (`frontend/`) | Login/logout, navbar y rutas según rol, CRUD en UI, carrito de venta (vendedor), descarga CSV de detalle, informes |

Flujo de seguridad:

1. El usuario inicia sesión en la app (`POST /auth/login`).
2. El backend emite un **JWT** con el rol de aplicación.
3. En operaciones sensibles, el backend ejecuta `SET LOCAL ROLE "<nit_empleado>"` para que PostgreSQL aplique los permisos del rol DBMS (`rol_vendedor`, `rol_bodeguero`, etc.) definidos en `db/roles.sql`.

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose (`docker compose`)


---

## Configuración

### 1. Variables de entorno

En la raíz del proyecto:

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

### 2. Docker Compose

```bash
copy docker-compose.yml.example docker-compose.yml   # Windows
cp docker-compose.yml.example docker-compose.yml       # Unix
```

Servicios expuestos:

| Servicio | URL / puerto |
|----------|----------------|
| Frontend | http://localhost:5174 |
| Backend (API) | http://localhost:8000 |
| PostgreSQL | `localhost:5433` |

---

## Levantar el proyecto

Desde la raíz (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

La primera ejecución aplica, en orden:

1. `db/init.sql` — tablas, FKs, índices, vista  
2. `db/roles.sql` — roles y permisos granulares  
3. `db/stored_procedures.sql` — procedures, triggers  
4. `db/populete.sql` — datos de prueba y usuarios PostgreSQL por rol  

Detener:

```bash
docker compose down
```

Para reiniciar la base desde cero (borra datos):

```bash
docker compose down -v
docker compose up --build
```

---

## Usuarios de prueba (aplicación)

Cargados en `db/populete.sql`. **Un usuario funcional por cada rol.**

| Rol | Correo | Contraseña | NIT |
|-----|--------|------------|-----|
| **Admin** | `admin@seed.local` | `admin123` | 90000001 |
| **Vendedor** | `vendedor@seed.local` | `vendedor123` | 90000002 |
| **Bodeguero** | `bodeguero@seed.local` | `bodeguero123` | 90000003 |
| **Contador** | `contador@seed.local` | `contador123` | 90000004 |
| **Supervisor** | `supervisor@seed.local` | `supervisor123` | 90000005 |

Cada empleado seed tiene además un **usuario PostgreSQL** que hereda el rol DBMS correspondiente (`rol_admin`, `rol_vendedor`, …). La contraseña del usuario DB es la misma del app

---

## I. Seguridad y roles

### Cumplimiento de requisitos

| Requisito | Dónde se cumple |
|-----------|-----------------|
| Roles en el DBMS (`CREATE ROLE`) | `db/roles.sql` — `rol_admin`, `rol_vendedor`, `rol_bodeguero`, `rol_contador`, `rol_supervisor` |
| Permisos granulares `GRANT` / `REVOKE` | `db/roles.sql` — por tabla y operación (p. ej. vendedor: `UPDATE (cant_disponible)` en `Producto`) |
| Esquema de roles documentado | Tabla siguiente + comentarios en `roles.sql` |
| Usuario de prueba por rol | `db/populete.sql` (tabla de login arriba) |
| Autenticación login / logout | `backend/routers/auth.py`, `frontend` (`authStore`, `/login`) |
| UI protegida por rol | `RequireRol` en `App.tsx`, guards en páginas (`hasRol`, botones condicionales) |

### Esquema de roles (resumen)

Documentación completa en `db/roles.sql`. Resumen:

| Rol DBMS | Rol app | Lectura principal | Escritura principal | Restricciones notables |
|----------|---------|-------------------|---------------------|-------------------------|
| `rol_admin` | Admin | Todas las tablas | CRUD completo | — |
| `rol_vendedor` | Vendedor | Producto, Categoría, Marca, Cliente, Venta, `v_producto_con_categoria` | INSERT Cliente, Venta, Venta_Producto; UPDATE stock en Producto | Sin Compra, Proveedor, Usuario |
| `rol_bodeguero` | Bodeguero | Producto, Categoría, Marca | INSERT Compra, Compra_Producto; UPDATE stock en Producto | Sin Venta, Cliente, Proveedor |
| `rol_contador` | Contador | Ventas, compras, catálogo, proveedores, Usuario (solo SELECT) | Ninguna | Solo consulta e informes |
| `rol_supervisor` | Supervisor | Todas las tablas (SELECT) | INSERT/UPDATE Producto, Proveedor, Producto_Proveedor | Sin Usuario/Rol; no UPDATE/DELETE ventas ni compras |

### UI por rol (frontend)

| Rol | Acceso principal |
|-----|------------------|
| **Admin** | Ventas, compras, productos (crear/editar), categorías, marcas, proveedores, empleados, informes |
| **Vendedor** | Tienda (categorías, marcas, productos con **carrito**), **Mis ventas** (registrar venta desde carrito). Sin listado global de ventas |
| **Bodeguero** | Compras (crear), productos / categorías / marcas (**solo consulta**) |
| **Contador** | Ventas, compras, productos, categorías, marcas, proveedores, informes (**solo lectura**) |
| **Supervisor** | Ventas, compras, productos (crear/editar), proveedores (crear/editar), empleados (consulta), categorías/marcas (consulta), informes |

Rutas protegidas: `frontend/src/App.tsx` (`RequireRol`) y componente `RequireRol.tsx`. Navbar: `frontend/src/components/Layout/Navbar/Navbar.tsx`.

---

## II. Stored procedures y ORM

### Stored procedures (≥ 5 invocados desde el backend)

| Procedure | Archivo SQL | Invocado desde |
|-----------|-------------|----------------|
| `sp_registrar_venta` | `stored_procedures.sql` | `backend/routers/ventas.py` |
| `sp_registrar_compra` | `stored_procedures.sql` | `backend/routers/compras.py` |
| `sp_toggle_producto` | `stored_procedures.sql` | `backend/routers/productos.py` |
| `sp_editar_producto` | `stored_procedures.sql` | `backend/routers/productos.py` |
| `sp_gestionar_empleado` | `stored_procedures.sql` | `backend/routers/empleados.py` |

### Parámetros IN/OUT y excepciones

- **`sp_registrar_venta`** y **`sp_registrar_compra`**: parámetros `IN` (cliente/proveedor, JSON de líneas) y `OUT` (`p_id_venta` / `p_id_compra`, `p_total`). Validaciones con `RAISE EXCEPTION`.
- **Manejo transaccional / rollback**: en PostgreSQL, los procedures no permiten `ROLLBACK` arbitrario; `sp_registrar_venta` y `sp_registrar_compra` usan bloques `BEGIN … EXCEPTION … END` para revertir la escritura si falla un insert/update (equivalente documentado en `stored_procedures.sql`).

### ORM (SQLAlchemy) — ≥ 3 operaciones CRUD

Modelos en `backend/orm/models.py`. Ejemplos de uso en routers:

| Módulo | Operaciones ORM |
|--------|-----------------|
| `routers/categorias.py` | Listar, crear, actualizar categorías |
| `routers/marcas.py` | Listar, crear, eliminar/desactivar marcas |
| `routers/proveedores.py` | Listar, crear, actualizar, eliminar proveedores |
| `routers/productos.py` | Listar, crear (`db.add`), actualizar relación proveedor (`db.merge`), eliminar |
| `routers/clientes.py` | Listar, crear clientes |
| `routers/empleados.py` | Listar, crear, actualizar, eliminar/desactivar (combinado con SP) |

Operaciones de negocio críticas (registrar venta/compra) se delegan a **stored procedures**; el catálogo y mantenimiento usan **ORM**.

---

## Funcionalidades destacadas (frontend)

- **Carrito de venta (Vendedor)**: contexto `NuevaVentaDraft` — agregar productos desde tienda, badge en navbar, finalizar venta en Mis ventas.
- **Descarga CSV**: detalle de venta y compra desde modales (`lib/export/`).
- **Edición de productos**: Admin y Supervisor — `PATCH /productos/{id}` vía modal Editar.
- **Informes**: endpoints en `backend/routers/informes.py`, página `frontend/src/app/informes/`.

---

## Organización del repositorio

```
Proyecto2_BD/
├── docker-compose.yml.example
├── .env.example
├── backend/
│   ├── app.py              # FastAPI, CORS, routers
│   ├── auth_deps.py        # JWT, require_rol, SET LOCAL ROLE
│   ├── orm/                # SQLAlchemy models y sesión
│   └── routers/            # auth, productos, ventas, compras, informes…
├── db/
│   ├── init.sql            # DDL + vista v_producto_con_categoria
│   ├── roles.sql           # CREATE ROLE, GRANT, REVOKE
│   ├── stored_procedures.sql
│   ├── populete.sql        # Seed + usuarios PG por rol
│   └── Dockerfile          # Orden de scripts init
└── frontend/src/
    ├── app/                # Páginas (admin + tienda vendedor)
    ├── components/         # Layout, modales, catálogo, informes
    ├── context/            # Carrito (NuevaVentaDraft)
    ├── lib/                # apiClient, export CSV, authRoutes
    └── hooks/              # useAuth
```

---

## Notas

- La autenticación de la app usa **JWT** (Bearer token en el cliente), no cookies de sesión HTTP; login y logout están implementados en la UI.
- Los permisos de la UI están alineados con `db/roles.sql`; la autorización final en base de datos la aplica PostgreSQL vía roles DBMS cuando el backend usa `get_role_session`.
- Documentación interactiva de la API : http://localhost:8000/docs
