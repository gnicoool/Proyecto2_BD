-- =========================
-- STORED PROCEDURES, FUNCTIONS Y TRIGGERS
-- =========================

-- =========================
-- TRIGGERS
-- =========================

/* trg_validar_stock
Se dispara antes de insertar una linea en Venta_Producto
Valida que el producto exista, este activo y haya stock suficiente
Asi se evita vender mas unidades de las disponibles aunque la aplicacion falle en validar
*/
CREATE OR REPLACE FUNCTION fn_trg_validar_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock INT;
BEGIN
    SELECT cant_disponible INTO v_stock
    FROM Producto
    WHERE id_producto = NEW.id_producto AND activo = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no existe o está inactivo', NEW.id_producto;
    END IF;

    IF v_stock < NEW.cantidad_venta THEN
        RAISE EXCEPTION 'Stock insuficiente para producto %. Disponible: %, Solicitado: %',
            NEW.id_producto, v_stock, NEW.cantidad_venta;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_stock
    BEFORE INSERT ON Venta_Producto
    FOR EACH ROW EXECUTE FUNCTION fn_trg_validar_stock();


/* trg_validar_empleado_activo
Se dispara antes de insertar una venta en la tabla Venta
Valida que el empleado exista y este activo en Usuario asi se evita registrar ventas a nombre de empleados que ya no estan activos
*/
CREATE OR REPLACE FUNCTION fn_trg_validar_empleado_activo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Usuario
        WHERE nit_empleado = NEW.nit_empleado AND activo = true
    ) THEN
        RAISE EXCEPTION 'El empleado % no existe o está inactivo', NEW.nit_empleado;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_empleado_activo
    BEFORE INSERT ON Venta
    FOR EACH ROW EXECUTE FUNCTION fn_trg_validar_empleado_activo();


/* trg_validar_proveedor_activo
Se dispara antes de insertar una compra en la tabla Compra
Valida que el proveedor exista y este activo asi evita registrar compras a proveedores inactivos o inexistentes
*/
CREATE OR REPLACE FUNCTION fn_trg_validar_proveedor_activo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Proveedor
        WHERE nit_proveedor = NEW.nit_proveedor AND activo = true
    ) THEN
        RAISE EXCEPTION 'El proveedor % no existe o está inactivo', NEW.nit_proveedor;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_proveedor_activo
    BEFORE INSERT ON Compra
    FOR EACH ROW EXECUTE FUNCTION fn_trg_validar_proveedor_activo();


-- =========================
-- PROCEDURES
-- =========================

/* sp_registrar_venta
Registra una venta completa usando transaccion,usando SAVEPOINT y ROLLBACK
Recibe cliente, empleado y un arreglo JSON de productos porque la cantidad de lineas varia en cada venta
Calcula el total con el precio_venta del catalogo, inserta Venta y Venta_Producto, y descuenta stock
Antes de insert se crea el savepoint y si falla hace ROLLBACK TO SAVEPOINT
Devuelve el id de la venta y el total, este procedure lo usa rol_vendedor y rol_admin.
*/
CREATE OR REPLACE PROCEDURE sp_registrar_venta(
    IN  p_id_cliente    INT,
    IN  p_nit_empleado  VARCHAR(8),
    IN  p_productos     JSON,
    OUT p_id_venta      INT,
    OUT p_total         DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item              JSON;
    v_id_producto       INT;
    v_cantidad          INT;
    v_precio            DECIMAL(10,2);
    v_stock             INT;
    v_savepoint_activo  BOOLEAN := false;
BEGIN
    IF p_productos IS NULL OR json_array_length(p_productos) = 0 THEN
        RAISE EXCEPTION 'La venta debe incluir al menos un producto';
    END IF;

    p_total := 0;

    -- Validacion 
    FOR v_item IN SELECT value FROM json_array_elements(p_productos) AS t(value)
    LOOP
        v_id_producto := (v_item->>'id_producto')::INT;
        v_cantidad    := COALESCE(
            (v_item->>'cantidad_venta')::INT,
            (v_item->>'cantidad')::INT
        );

        IF v_cantidad IS NULL OR v_cantidad < 1 THEN
            RAISE EXCEPTION 'Cantidad inválida para producto %', v_id_producto;
        END IF;

        SELECT precio_venta, cant_disponible
        INTO v_precio, v_stock
        FROM Producto
        WHERE id_producto = v_id_producto AND activo = true
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto % no encontrado o inactivo', v_id_producto;
        END IF;

        IF v_stock < v_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para producto %. Disponible: %, Solicitado: %',
                v_id_producto, v_stock, v_cantidad;
        END IF;

        p_total := p_total + (v_precio * v_cantidad);
    END LOOP;

    -- Si los inserts fallan regresan a este savepoint con un rollback
    SAVEPOINT sp_venta_escritura;
    v_savepoint_activo := true;

    INSERT INTO Venta (total, id_cliente, nit_empleado)
    VALUES (p_total, p_id_cliente, p_nit_empleado)
    RETURNING id_venta INTO p_id_venta;

    FOR v_item IN SELECT value FROM json_array_elements(p_productos) AS t(value)
    LOOP
        v_id_producto := (v_item->>'id_producto')::INT;
        v_cantidad    := COALESCE(
            (v_item->>'cantidad_venta')::INT,
            (v_item->>'cantidad')::INT
        );

        INSERT INTO Venta_Producto (id_venta, id_producto, cantidad_venta)
        VALUES (p_id_venta, v_id_producto, v_cantidad);

        UPDATE Producto
        SET cant_disponible = cant_disponible - v_cantidad
        WHERE id_producto = v_id_producto;
    END LOOP;

    RELEASE SAVEPOINT sp_venta_escritura;
    v_savepoint_activo := false;

EXCEPTION
    WHEN OTHERS THEN
        IF v_savepoint_activo THEN
            ROLLBACK TO SAVEPOINT sp_venta_escritura;
            v_savepoint_activo := false;
            RAISE EXCEPTION 'Venta revertida. Error en escritura: %', SQLERRM;
        END IF;
        RAISE;
END;
$$;


/* sp_registrar_compra
Para registrar una compra completa al proveedor, usando SAVEPOINT y ROLLBACK por si fallan los inserts
Recibe el NIT del proveedor y un arreglo JSON de productos con cantidad y precio_compra
Inserta Compra y Compra_Producto, aumenta stock y actualiza precio_compra del producto
Antes de insert se crea el SAVEPOINT y si falla se hace ROLLBACK TO SAVEPOINT
Devuelve el id de la compra y el total, este procedure lo usa rol_bodeguero y rol_admin.
*/
CREATE OR REPLACE PROCEDURE sp_registrar_compra(
    IN  p_nit_proveedor VARCHAR(8),
    IN  p_productos     JSON,
    OUT p_id_compra     INT,
    OUT p_total         DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item              JSON;
    v_id_producto       INT;
    v_cantidad          INT;
    v_precio_compra     DECIMAL(10,2);
    v_savepoint_activo  BOOLEAN := false;
BEGIN
    IF p_productos IS NULL OR json_array_length(p_productos) = 0 THEN
        RAISE EXCEPTION 'La compra debe incluir al menos un producto';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM Proveedor
        WHERE nit_proveedor = p_nit_proveedor AND activo = true
    ) THEN
        RAISE EXCEPTION 'Proveedor % no encontrado o inactivo', p_nit_proveedor;
    END IF;

    p_total := 0;

    FOR v_item IN SELECT value FROM json_array_elements(p_productos) AS t(value)
    LOOP
        v_id_producto := (v_item->>'id_producto')::INT;
        v_cantidad    := COALESCE(
            (v_item->>'cantidad_compra')::INT,
            (v_item->>'cantidad')::INT
        );
        v_precio_compra := (v_item->>'precio_compra')::DECIMAL(10,2);

        IF v_cantidad IS NULL OR v_cantidad < 1 THEN
            RAISE EXCEPTION 'Cantidad inválida para producto %', v_id_producto;
        END IF;

        IF v_precio_compra IS NULL OR v_precio_compra <= 0 THEN
            RAISE EXCEPTION 'precio_compra inválido para producto %', v_id_producto;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM Producto WHERE id_producto = v_id_producto) THEN
            RAISE EXCEPTION 'Producto % no encontrado', v_id_producto;
        END IF;

        p_total := p_total + (v_cantidad * v_precio_compra);
    END LOOP;

    -- Este es el savepoint a donde regresa si algo falla y se hace ROLLBACK
    SAVEPOINT sp_compra_escritura;
    v_savepoint_activo := true;

    INSERT INTO Compra (total, nit_proveedor)
    VALUES (p_total, p_nit_proveedor)
    RETURNING id_compra INTO p_id_compra;

    FOR v_item IN SELECT value FROM json_array_elements(p_productos) AS t(value)
    LOOP
        v_id_producto := (v_item->>'id_producto')::INT;
        v_cantidad    := COALESCE(
            (v_item->>'cantidad_compra')::INT,
            (v_item->>'cantidad')::INT
        );
        v_precio_compra := (v_item->>'precio_compra')::DECIMAL(10,2);

        INSERT INTO Compra_Producto (id_compra, id_producto, cantidad_compra)
        VALUES (p_id_compra, v_id_producto, v_cantidad);

        UPDATE Producto
        SET
            cant_disponible = cant_disponible + v_cantidad,
            precio_compra   = v_precio_compra
        WHERE id_producto = v_id_producto;
    END LOOP;

    RELEASE SAVEPOINT sp_compra_escritura;
    v_savepoint_activo := false;

EXCEPTION
    WHEN OTHERS THEN
        IF v_savepoint_activo THEN
            ROLLBACK TO SAVEPOINT sp_compra_escritura;
            v_savepoint_activo := false;
            RAISE EXCEPTION 'Compra revertida. Error en escritura: %', SQLERRM;
        END IF;
        RAISE;
END;
$$;


/* sp_toggle_producto
Activa o desactiva un producto del catalogo sin eliminarlo
Permite retirar productos de venta manteniendo el historial en la base de datos, este procedure lo usa rol_supervisor y rol_admin
*/
CREATE OR REPLACE PROCEDURE sp_toggle_producto(
    IN p_id_producto INT,
    IN p_activo      BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Producto WHERE id_producto = p_id_producto) THEN
        RAISE EXCEPTION 'Producto % no existe', p_id_producto;
    END IF;

    UPDATE Producto
    SET activo = p_activo
    WHERE id_producto = p_id_producto;
END;
$$;


/* sp_editar_producto
Actualiza los datos de un producto enviando solo los campos que se desean cambiar
Los parametros NULL no modifican el valor actual, asi para editar de mejor forma
Valida precios positivos, stock no negativo y existencia de categoria y marca, este procedure lo usa rol_supervisor y rol_admin
*/
CREATE OR REPLACE PROCEDURE sp_editar_producto(
    IN p_id_producto   INT,
    IN p_nombre        VARCHAR(100) DEFAULT NULL,
    IN p_descripcion   TEXT         DEFAULT NULL,
    IN p_precio_venta  DECIMAL      DEFAULT NULL,
    IN p_precio_compra DECIMAL      DEFAULT NULL,
    IN p_cant_disp     INT          DEFAULT NULL,
    IN p_id_categoria  INT          DEFAULT NULL,
    IN p_id_marca      INT          DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Producto WHERE id_producto = p_id_producto) THEN
        RAISE EXCEPTION 'Producto % no existe', p_id_producto;
    END IF;

    IF p_precio_venta IS NOT NULL AND p_precio_venta <= 0 THEN
        RAISE EXCEPTION 'El precio de venta debe ser mayor a 0';
    END IF;

    IF p_precio_compra IS NOT NULL AND p_precio_compra <= 0 THEN
        RAISE EXCEPTION 'El precio de compra debe ser mayor a 0';
    END IF;

    IF p_cant_disp IS NOT NULL AND p_cant_disp < 0 THEN
        RAISE EXCEPTION 'La cantidad disponible no puede ser negativa';
    END IF;

    IF p_id_categoria IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM Categoria WHERE id_categoria = p_id_categoria
    ) THEN
        RAISE EXCEPTION 'Categoría % no existe', p_id_categoria;
    END IF;

    IF p_id_marca IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM Marca WHERE id_marca = p_id_marca
    ) THEN
        RAISE EXCEPTION 'Marca % no existe', p_id_marca;
    END IF;

    UPDATE Producto SET
        nombre          = COALESCE(p_nombre,        nombre),
        descripcion     = COALESCE(p_descripcion,   descripcion),
        precio_venta    = COALESCE(p_precio_venta,  precio_venta),
        precio_compra   = COALESCE(p_precio_compra, precio_compra),
        cant_disponible = COALESCE(p_cant_disp,     cant_disponible),
        id_categoria    = COALESCE(p_id_categoria,  id_categoria),
        id_marca        = COALESCE(p_id_marca,      id_marca)
    WHERE id_producto = p_id_producto;
END;
$$;


/* sp_gestionar_empleado
Centraliza la creacion y desactivacion de empleados en la tabla Usuario
p_accion acepta CREAR o DESACTIVAR, la contrasena debe llegar ya hasheada 
este procedure solo lo usa rol_admin pues modifica usuarios
*/
CREATE OR REPLACE PROCEDURE sp_gestionar_empleado(
    IN p_accion            VARCHAR(10),
    IN p_nit               VARCHAR(8),
    IN p_nombre            VARCHAR(100) DEFAULT NULL,
    IN p_tel               VARCHAR(15)  DEFAULT NULL,
    IN p_correo            VARCHAR(100) DEFAULT NULL,
    IN p_contrasena_hash   VARCHAR(255) DEFAULT NULL,
    IN p_id_rol            INT          DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_accion = 'CREAR' THEN
        IF p_nombre IS NULL OR p_correo IS NULL OR p_contrasena_hash IS NULL OR p_id_rol IS NULL THEN
            RAISE EXCEPTION 'Para crear un empleado son obligatorios: nombre, correo, contrasena_hash, id_rol';
        END IF;

        IF EXISTS (SELECT 1 FROM Usuario WHERE nit_empleado = p_nit) THEN
            RAISE EXCEPTION 'Ya existe un empleado con NIT %', p_nit;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM Rol WHERE id_rol = p_id_rol) THEN
            RAISE EXCEPTION 'El rol % no existe', p_id_rol;
        END IF;

        INSERT INTO Usuario (nit_empleado, nombre, tel_empleado, correo, contrasena, activo, id_rol)
        VALUES (p_nit, p_nombre, p_tel, p_correo, p_contrasena_hash, true, p_id_rol);

    ELSIF p_accion = 'DESACTIVAR' THEN
        IF NOT EXISTS (SELECT 1 FROM Usuario WHERE nit_empleado = p_nit AND activo = true) THEN
            RAISE EXCEPTION 'El empleado % no existe o ya está inactivo', p_nit;
        END IF;

        UPDATE Usuario SET activo = false WHERE nit_empleado = p_nit;

    ELSE
        RAISE EXCEPTION 'Acción no válida: %. Use CREAR o DESACTIVAR', p_accion;
    END IF;
END;
$$;


-- =========================
-- FUNCTIONS
-- =========================

/* reporte_ventas
Consulta ventas entre dos fechas con nombre de cliente y empleado
Centraliza el reporte en la base de datos para rol_contador, rol_supervisor y rol_admin
*/
CREATE OR REPLACE FUNCTION reporte_ventas(
    p_fecha_inicio TIMESTAMP,
    p_fecha_fin    TIMESTAMP
)
RETURNS TABLE(
    id_venta INT,
    fecha    TIMESTAMP,
    total    DECIMAL,
    cliente  VARCHAR,
    empleado VARCHAR
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id_venta,
        v.fecha,
        v.total,
        c.nombre  AS cliente,
        u.nombre  AS empleado
    FROM Venta v
    LEFT JOIN Cliente c ON c.id_cliente = v.id_cliente
    LEFT JOIN Usuario u ON u.nit_empleado = v.nit_empleado
    WHERE v.fecha >= p_fecha_inicio
      AND v.fecha <= p_fecha_fin
    ORDER BY v.fecha DESC;
END;
$$;


/* top_productos
Lista los productos mas vendidos con cantidad total e ingresos generados
Sirve para informes de desempeño del catalogo con un limite de 10
*/
CREATE OR REPLACE FUNCTION top_productos(p_limite INT DEFAULT 10)
RETURNS TABLE(
    id_producto     INT,
    nombre_producto VARCHAR,
    total_vendido   BIGINT,
    ingresos_total  DECIMAL
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id_producto,
        p.nombre,
        SUM(vp.cantidad_venta)::BIGINT AS total_vendido,
        SUM(vp.cantidad_venta * p.precio_venta) AS ingresos_total
    FROM Venta_Producto vp
    JOIN Producto p ON p.id_producto = vp.id_producto
    GROUP BY p.id_producto, p.nombre
    ORDER BY total_vendido DESC
    LIMIT p_limite;
END;
$$;

-- Permisos de ejecucion de los procedures y functions
GRANT EXECUTE ON PROCEDURE sp_registrar_venta(INT, VARCHAR, JSON) TO rol_vendedor, rol_admin;
GRANT EXECUTE ON PROCEDURE sp_registrar_compra(VARCHAR, JSON) TO rol_bodeguero, rol_admin;
GRANT EXECUTE ON PROCEDURE sp_toggle_producto(INT, BOOLEAN) TO rol_supervisor, rol_admin;
GRANT EXECUTE ON PROCEDURE sp_editar_producto(
    INT, VARCHAR, TEXT, DECIMAL, DECIMAL, INT, INT, INT
) TO rol_supervisor, rol_admin;
GRANT EXECUTE ON PROCEDURE sp_gestionar_empleado(
    VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INT
) TO rol_admin;

GRANT EXECUTE ON FUNCTION reporte_ventas(TIMESTAMP, TIMESTAMP) TO rol_contador, rol_supervisor, rol_admin;
GRANT EXECUTE ON FUNCTION top_productos(INT) TO rol_contador, rol_supervisor, rol_admin;

REVOKE ALL ON FUNCTION fn_trg_validar_stock() FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_trg_validar_empleado_activo() FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_trg_validar_proveedor_activo() FROM PUBLIC;
