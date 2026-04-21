-- =========================
-- LIMPIEZA
-- =========================
DROP VIEW IF EXISTS v_producto_con_categoria CASCADE;
DROP TABLE IF EXISTS Venta_Producto;
DROP TABLE IF EXISTS Venta;
DROP TABLE IF EXISTS Compra_Producto;
DROP TABLE IF EXISTS Compra;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Categoria;
DROP TABLE IF EXISTS Cliente;
DROP TABLE IF EXISTS Proveedor;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Rol;

-- =========================
-- TABLAS
-- =========================

CREATE TABLE Categoria(
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) not null,
    descripcion VARCHAR(100)
);

CREATE TABLE Producto(
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(50) not null,
    descripcion VARCHAR(50),
    precio_venta DECIMAL(10,2) not null,
    precio_compra DECIMAL(10,2) not null,
    cant_disponible INT not null default 0,
    id_categoria INT not null,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);

CREATE TABLE Cliente(
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(50) not null,
    nit VARCHAR(20) not null default 'C/F'
);

CREATE TABLE Proveedor(
    nit_proveedor VARCHAR(8) PRIMARY KEY not null,
    nombre VARCHAR(50) not null,
    correo VARCHAR(50),
    tel_proveedor VARCHAR(20),
    activo boolean not null default true
);

CREATE TABLE Compra(
    id_compra SERIAL PRIMARY KEY,
    fecha TIMESTAMP not null default now(),
    total DECIMAL(10,2) not null,
    nit_proveedor VARCHAR(8) not null,
    FOREIGN KEY (nit_proveedor) REFERENCES Proveedor(nit_proveedor)
);

CREATE TABLE Compra_Producto(
    id_compra INT,
    id_producto INT,
    cantidad_compra INT not null,
    precio_compra DECIMAL(10,2) not null references Producto(precio_compra),
    PRIMARY KEY (id_compra, id_producto),
    FOREIGN KEY (id_compra) REFERENCES Compra(id_compra),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE Rol(
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) not null
);

CREATE TABLE Usuario(
    nit_empleado VARCHAR(8) PRIMARY KEY not null,
    nombre VARCHAR(50) not null,
    tel_empleado VARCHAR(50),
    correo VARCHAR(50) UNIQUE,
    contrasena VARCHAR(255) not null,
    activo boolean not null default true, 
    id_rol INT not null,
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

CREATE TABLE Venta(
    id_venta SERIAL PRIMARY KEY,
    fecha TIMESTAMP not null default now(),
    total DECIMAL(10,2) not null,
    id_cliente INT,
    nit_empleado VARCHAR(8),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (nit_empleado) REFERENCES Usuario(nit_empleado)
);

CREATE TABLE Venta_Producto(
    id_venta INT,
    id_producto INT,
    cantidad_venta INT not null,
    precio_venta DECIMAL(10,2) not null references Producto(precio_venta),
    PRIMARY KEY (id_venta, id_producto),
    FOREIGN KEY (id_venta) REFERENCES Venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

-- =========================
-- VISTA
-- =========================

CREATE VIEW v_producto_con_categoria AS
SELECT
    p.id_producto,
    p.nombre,
    p.descripcion,
    p.precio_venta,
    p.precio_compra,
    p.cant_disponible,
    p.id_categoria,
    c.nombre AS categoria_nombre,
    c.descripcion AS categoria_descripcion
FROM Producto p
JOIN Categoria c ON c.id_categoria = p.id_categoria;

-- =========================
-- INDICES
-- =========================

/* Para busqueda de ventas por fecha.
Asi es posible filtrar por rangos de fecha*/

CREATE INDEX idx_ventafecha 
    ON Venta(fecha);

/* Para busqueda de productos por categoria
De esta forma el filtrado por categorias se facilita, siendo más eficiente */
CREATE INDEX idx_productocategoria 
    ON Producto(id_categoria);