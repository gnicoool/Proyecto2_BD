# Proyecto 2 Web
Jackelyn Giron 24737

## Problema

La tienda maneja productos agrupados en categorías, comprados a proveedores. Los clientes realizan compras atendidas por empleados. Cada compra puede incluir varios productos y debe quedar registrada junto con el detalle de lo vendido. La tienda necesita controlar el stock disponible y generar reportes de ventas

---
## Enlaces Importantes

- **Frontend Desplegado (Render):** [https://supermercado-web-60of.onrender.com](https://supermercado-web-60of.onrender.com)
- **Backend Desplegado (Render):** [https://supermercado-web-d7if.onrender.com](https://supermercado-web-d7if.onrender.com)
- **Documentación de la API (Swagger):** [https://supermercado-web-d7if.onrender.com/docs](https://supermercado-web-d7if.onrender.com/docs)

## Organización del repositorio

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
│   ├── init.sql        # DDL
│   └── populete.sql    # Datos de prueba
└── frontend/src/
    ├── app/            # Páginas por módulo
    ├── components/
    │   ├── Layout/     # Shell, Navbar, FloatingButton
    │   └── modal/      # Formularios y modales por entidad
    ├── lib/            # apiClient, authRoutes, adminHeaders
    ├── types/          # Tipos TS alineados con la API
    └── hooks/          # useAuth, useDebouncedValu
    └── context/        # para carrito de compra
```

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/)
- Credenciales de base de datos indicadas para el Proyecto 2

---

## Configuración

### 1. Variables de entorno

En la raíz del proyecto, crea un archivo **`.env`**:

```bash
copy .env.example .env
```

```bash
cp .env.example .env
```

Editar **`.env`** y completar con las credenciales **`DB_USER`** y **`DB_PASSWORD`**

### 2. Docker Compose

Crea **`docker-compose.yml`** en la raíz

```bash
copy docker-compose.yml.example docker-compose.yml
```

```bash
cp docker-compose.yml.example docker-compose.yml
```

Ajustar si es requerido El archivo expone:

- PostgreSQL en el host en el puerto **5433** (mapeado al 5432 del contenedor).
- Backend en **http://localhost:8000**
- Frontend en **http://localhost:5174**

---

## Levantar el proyecto

Desde la raíz del repositorio (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

Para detener:

```bash
docker compose down
```

## Ejecutar lint
Despues de levantar el proyecto ejecutar en otra terminal:

```bash
docker compose exec frontend sh    
```

correr el comando de lint:

```bash
npm run lint
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

## Challenges Completados

Durante el desarrollo de esta API y cliente, se cumplieron los siguientes retos:

- **Endpoints REST documentados** swagger ui corriendo en backend
- **CRUD completo expuesto en cliente** para **proveedor** y **empleado**
- **Manejo visible de errores** para el usuario: mensajes en UI cuando fallan cargas o validaciones, y respuestas de error coherentes desde la API.
- **Al menos 1 endpoint que agregue datos (total de ventas, stock disponible, etc.)**
-**Navegacion entre vistas implementada con React Router**
-**Estado global manejado con React Context** para carro de venta
-**Uso de hooks**
-**Formularios controlados del lado del cliente**
- **Reportes** con **datos reales** de la base, mostrados en la página de informes del frontend.
-**Sin errores al ejecutar comando lint de lint**
-**README con instrucciones para su uso**
-**Uso de docker, el proyecto levanta con un solo comando**
-**Se exporta reporte de la venta y compra en csv**


## Incluye

- **Consultas SQL explícitas** en el backend .
- **CRUD completo en la interfaz** para **proveedor** y **empleado** (altas, listados, edición y baja/desactivación según reglas del API).
- **Informes / reportes** con **datos reales** de la base, expuestos por endpoints dedicados y mostrados en la página de informes del frontend.
- **Manejo visible de errores** para el usuario: mensajes en UI cuando fallan cargas o validaciones, y respuestas de error coherentes desde la API.
- **Autenticación** con sesión (login / logout) y rutas protegidas según rol.