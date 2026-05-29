-- =========================
-- ROLES
-- =========================

/* rol_admin
Este rol es el que tiene mas poder en la DBMS pues tiene el acceso total a todas las tablas
puede hacer select, insert, update, delete
Esto ya que es el que administra la tienda, los empleados, las ventas y compras, por lo tanto puede acceder a todos los datos
*/
CREATE ROLE rol_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;


/* rol_vendedor
Este rol atiende el punto de venta del supermercado
Tiene acceso de lectura a las tablas: Producto, Categoria, Marca, Cliente, Venta, Venta_Producto y la vista v_producto_con_categoria
Tiene acceso de insert en las tablas: Cliente, Venta, Venta_Producto
Puede actualizar unicamente el stock (cant_disponible) en Producto al registrar una venta
No tiene acceso a compras, proveedores ni a las tablas Usuario y Rol
No puede eliminar ni modificar ventas ya registradas, ya que se debe mantener el historial
*/
CREATE ROLE rol_vendedor;
GRANT SELECT ON Producto, Categoria, Marca, Cliente, Venta, Venta_Producto TO rol_vendedor;
GRANT SELECT ON v_producto_con_categoria TO rol_vendedor;
GRANT INSERT ON Cliente, Venta, Venta_Producto TO rol_vendedor;
GRANT UPDATE (cant_disponible) ON Producto TO rol_vendedor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_vendedor;
REVOKE INSERT, UPDATE, DELETE ON Usuario, Rol FROM rol_vendedor;
REVOKE ALL ON Compra, Compra_Producto, Proveedor, Producto_Proveedor FROM rol_vendedor;
REVOKE DELETE, UPDATE ON Venta, Venta_Producto FROM rol_vendedor;


/* rol_bodeguero
Este rol es el encargado de recibir mercaderia y controlar el inventario
Tiene acceso de lectura a las tablas: Producto, Categoria, Marca
Tiene acceso de insert en las tablas: Compra, Compra_Producto
Puede actualizar unicamente el stock (cant_disponible) en Producto al registrar una compra
No tiene acceso a proveedores ni a Producto_Proveedor; esa gestion la lleva el supervisor
No tiene acceso a ventas, clientes ni a las tablas Usuario y Rol
No puede eliminar ni modificar compras ya registradas, ya que se debe mantener el historial
*/
CREATE ROLE rol_bodeguero;
GRANT SELECT ON Producto, Categoria, Marca TO rol_bodeguero;
GRANT SELECT, INSERT ON Compra, Compra_Producto TO rol_bodeguero;
GRANT UPDATE (cant_disponible) ON Producto TO rol_bodeguero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_bodeguero;
REVOKE INSERT, UPDATE, DELETE ON Usuario, Rol FROM rol_bodeguero;
REVOKE ALL ON Proveedor, Producto_Proveedor FROM rol_bodeguero;
REVOKE ALL ON Venta, Venta_Producto, Cliente FROM rol_bodeguero;
REVOKE DELETE, UPDATE ON Compra, Compra_Producto FROM rol_bodeguero;


/* rol_contador
Este rol se encarga de la consulta de informes y registros financieros del supermercado
Tiene acceso de lectura a las tablas: Venta, Venta_Producto, Compra, Compra_Producto, Producto, Cliente, Proveedor, Categoria, Marca, Usuario
Tiene acceso de lectura a la vista v_producto_con_categoria
No puede insertar, actualizar ni eliminar datos, solo consultar
No tiene acceso de escritura en las tablas Usuario y Rol
*/
CREATE ROLE rol_contador;
GRANT SELECT ON Venta, Venta_Producto, Compra, Compra_Producto, Producto, Cliente, Proveedor, Categoria, Marca, Usuario TO rol_contador;
GRANT SELECT ON v_producto_con_categoria TO rol_contador;
REVOKE INSERT, UPDATE, DELETE ON Usuario, Rol FROM rol_contador;


/* rol_supervisor
Este rol supervisa la operacion del supermercado y puede revisar toda la informacion del negocio
Tiene acceso de lectura a todas las tablas del esquema public
Puede insertar y actualizar productos, proveedores y la relacion Producto_Proveedor
No puede gestionar usuarios ni roles de la aplicacion (tablas Usuario y Rol)
No puede eliminar ni modificar ventas y compras, ya que se debe mantener el registro de estas operaciones
*/
CREATE ROLE rol_supervisor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_supervisor;
GRANT SELECT ON v_producto_con_categoria TO rol_supervisor;
GRANT INSERT, UPDATE ON Producto TO rol_supervisor;
GRANT INSERT, UPDATE ON Proveedor, Producto_Proveedor TO rol_supervisor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_supervisor;
REVOKE INSERT, UPDATE, DELETE ON Usuario, Rol FROM rol_supervisor;
REVOKE DELETE, UPDATE ON Venta, Venta_Producto, Compra, Compra_Producto FROM rol_supervisor;
