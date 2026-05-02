-- Datos de prueba

-- =========================
-- Categoria 
-- =========================
INSERT INTO Categoria (id_categoria, nombre, descripcion) VALUES
(1, 'Lacteos', 'Leche, yogur, quesos y mantequilla refrigerados'),
(2, 'Panaderia', 'Panes, bolleria y harinas'),
(3, 'Bebidas', 'Refrescos, jugos, agua y energizantes'),
(4, 'Snacks', 'Papitas, galletas saladas y mixtos'),
(5, 'Conservas', 'Atun, sardinas, vegetales enlatados'),
(6, 'Despensa', 'Arroz, frijol, pasta y aceites'),
(7, 'Limpieza', 'Detergentes, jabon y desinfectantes'),
(8, 'Higiene personal', 'Jabon corporal, pasta dental, papel'),
(9, 'Congelados', 'Verduras, carnes y mariscos congelados'),
(10, 'Carnes frias', 'Jamones, salchichas y embutidos'),
(11, 'Frutas y verduras', 'Productos frescos de temporada'),
(12, 'Especias', 'Condimentos, sal, pimienta y hierbas'),
(13, 'Cereales', 'Cereales de desayuno y avena'),
(14, 'Mascotas', 'Alimento y accesorios para perros y gatos'),
(15, 'Bebes', 'Panales, formulas y papillas'),
(16, 'Vinos y licores', 'Bebidas alcoholicas para retail'),
(17, 'Electro menores', 'Pilas, focos y extensiones'),
(18, 'Papelaria', 'Cuadernos, lapices y folders'),
(19, 'Automotriz', 'Aceites, refrigerante y limpiadores'),
(20, 'Salud', 'Vitaminas y sueros orales'),
(21, 'Cafe y te', 'Cafe molido, instantaneo e infusiones'),
(22, 'Reposteria', 'Chocolates, azucar y decoracion'),
(23, 'Platos desechables', 'Vasos, platos y servilletas'),
(24, 'Textil hogar', 'Toallas, sabanas basicas'),
(25, 'Jardineria', 'Tierra, semillas y fertilizante'),
(26, 'Ferreteria ligera', 'Cinta, pegamento y tornillos'),
(27, 'Enlatados dulce', 'Frutas en almibar y mermeladas'),
(28, 'Aceites gourmet', 'Aceite de oliva y vinagres'),
(29, 'Salsas', 'Ketchup, mayonesa y salsas picantes'),
(30, 'Harinas especiales', 'Almendra, maiz nixtamalizado');
-- =========================
-- MARCAS
-- =========================
INSERT INTO Marca (nombre, activo) VALUES
('Coca-Cola', true),
('PepsiCo', true),
('Nestlé', true),
('Bimbo', true),
('Lays', true),
('Colgate', true),
('P&G', true),
('Unilever', true),
('Kraft Heinz', true),
('Nike', true),
('Adidas', true),
('Kirkland', true),
('Great Value', true),
('Member''s Mark', true),
('Dole', true),
('Del Monte', true),
('Heinz', true),
('Kellogg''s', true),
('Quaker', true),
('Gerber', true),
('Pedigree', true),
('Whiskas', true),
('Scotch-Brite', true),
('Tide', true),
('Downy', true),
('Dove', true),
('Rexona', true),
('Sedal', true),
('Palmolive', true),
('Clorox', true);

-- =========================
-- Proveedor
-- =========================
INSERT INTO Proveedor (nit_proveedor, nombre, correo, tel_proveedor) VALUES
('10000001', 'Distribuidora Central GT', 'ventas@centralgt.com', '22334455'),
('10000002', 'Alimentos del Valle SA', 'pedidos@delvalle.gt', '22334456'),
('10000003', 'Bebidas Frescas', 'logistica@bebidasfrescas.gt', '22334457'),
('10000004', 'SnackWorld Guatemala', 'compras@snackworld.gt', '22334458'),
('10000005', 'Conservas del Pacifico', 'export@pacifico.gt', '22334459'),
('10000006', 'Granos Unidos', 'granos@unidos.gt', '22334460'),
('10000007', 'Higiene Total', 'b2b@higienetotal.gt', '22334461'),
('10000008', 'Limpieza Express', 'ventas@limpiezaexpress.gt', '22334462'),
('10000009', 'Frio Industrial', 'cadena@frioindustrial.gt', '22334463'),
('10000010', 'Embutidos La Familia', 'familia@embutidos.gt', '22334464'),
('10000011', 'Verduleria Mayorista', 'mayor@verduleria.gt', '22334465'),
('10000012', 'Especias del Mundo', 'import@especiasmundo.gt', '22334466'),
('10000013', 'Cereal Company', 'gt@cerealcompany.com', '22334467'),
('10000014', 'PetCare Distribuciones', 'ventas@petcare.gt', '22334468'),
('10000015', 'Bebe Feliz', 'pedidos@bebefeliz.gt', '22334469'),
('10000016', 'Licores Selectos', 'mayorista@licoresselectos.gt', '22334470'),
('10000017', 'ElectroMayor', 'b2b@electromayor.gt', '22334471'),
('10000018', 'Papel y Mas', 'ventas@papelymas.gt', '22334472'),
('10000019', 'AutoSupply GT', 'compras@autosupply.gt', '22334473'),
('10000020', 'Farmacia Mayorista Plus', 'b2b@farmaplus.gt', '22334474'),
('10000021', 'Cafe de Antigua', 'export@cafeantigua.gt', '22334475'),
('10000022', 'Dulces Tradicionales', 'ventas@dulcestrad.gt', '22334476'),
('10000023', 'Desechables Pro', 'logistica@desechablespro.gt', '22334477'),
('10000024', 'Hogar Textil', 'compras@hogartextil.gt', '22334478'),
('10000025', 'Jardin Verde', 'pedidos@jardinverde.gt', '22334479'),
('10000026', 'Ferreteria 15', 'ventas@ferre15.gt', '22334480'),
('10000027', 'Mermeladas del Lago', 'ventas@mermeladaslago.gt', '22334481'),
('10000028', 'Oliva Premium Imports', 'imports@olivapremium.gt', '22334482'),
('10000029', 'Salsas Chapinas', 'b2b@salsaschapinas.gt', '22334483'),
('10000030', 'Molino La Esperanza', 'ventas@molinolaesperanza.gt', '22334484');

-- =========================
-- Producto
-- =========================
INSERT INTO Producto (nombre, descripcion, precio_venta, precio_compra, cant_disponible, id_categoria, activo, id_marca) VALUES
('Leche entera 1L', 'UHT larga vida', 12.50, 9.20, 240, 1, true, 3),
('Yogur griego 150g', 'Natural sin azucar', 8.75, 5.90, 180, 1, true, 3),
('Queso mozarella 400g', 'Para pizza y sandwiches', 42.00, 31.50, 95, 1, true, 3),
('Pan frances 5u', 'Horneado del dia', 10.00, 6.40, 120, 2, true, 4),
('Tortillas de maiz 1lb', 'Hechas a mano', 9.50, 6.10, 300, 2, true, 4),
('Refresco cola 2L', 'Botella retornable', 18.00, 13.20, 400, 3, true, 1),
('Agua pura 1.5L', '12 pack', 22.00, 16.80, 220, 3, true, 12),
('Jugo naranja 1L', 'Con pulpa', 15.25, 11.00, 150, 3, true, 3),
('Papitas sal 160g', 'Clasicas', 11.50, 7.80, 260, 4, true, 5),
('Galletas soda 400g', 'Paquete familiar', 14.00, 9.60, 190, 4, true, 4),
('Atun en agua 170g', 'Lata easy-open', 13.75, 9.90, 310, 5, true, 16),
('Frijol negro 900g', 'Seco seleccionado', 16.50, 11.40, 275, 6, true, 13),
('Arroz extra 5lb', 'Grano largo', 38.00, 28.50, 200, 6, true, 13),
('Aceite vegetal 900ml', 'Alto punto de humo', 24.00, 17.20, 170, 6, true, 12),
('Detergente polvo 2kg', 'Lavado profundo', 45.00, 33.00, 140, 7, true, 24),
('Cloro 1L', 'Uso domestico', 9.90, 6.50, 210, 7, true, 23),
('Pasta dental 100g', 'Menta fresca', 12.00, 8.20, 330, 8, true, 6),
('Papel higienico 12u', 'Doble hoja', 28.50, 20.10, 160, 8, true, 7),
('Verduras mixtas 500g', 'Bolsa congelada', 18.75, 12.90, 130, 9, true, 15),
('Pechuga de pollo 1kg', 'IQF', 42.50, 31.00, 110, 9, true, 3),
('Jamon de pavo 200g', 'Rebanado fino', 22.00, 15.80, 155, 10, true, 9),
('Salchicha hot dog 12u', 'Para plancha', 17.25, 11.90, 200, 10, true, 9),
('Tomate saladet kg', 'Grado A', 8.50, 5.20, 90, 11, true, 15),
('Platano pinton kg', 'Para freir o madurar', 6.75, 4.10, 140, 11, true, 15),
('Sal iodada 500g', 'Mesa', 5.50, 3.20, 400, 12, true, 12),
('Avena instantanea 800g', 'Sabor vainilla', 32.00, 23.50, 125, 13, true, 19),
('Alimento perro adulto 2kg', 'Croquetas pollo', 85.00, 62.00, 85, 14, true, 21),
('Panales talla M 36u', 'Absorcion nocturna', 95.00, 71.00, 70, 15, true, 20),
('Cafe molido 340g', 'Tueste medio', 48.00, 35.00, 100, 21, true, 21),
('Chocolate barra 100g', 'Leche 45% cacao', 15.00, 10.50, 220, 22, true, 3);

-- =========================
-- Cliente 
-- =========================
INSERT INTO Cliente (id_cliente, nombre, nit) VALUES
(1, 'Comercializadora El Roble', '78945612'),
(2, 'Tienda La Esquina', 'C/F'),
(3, 'Restaurante Sabor Casero', '54879632'),
(4, 'Hotel Vista Verde', '10293847'),
(5, 'Cafeteria Central', 'C/F'),
(6, 'Minisuper 24 Horas', '33445566'),
(7, 'Panaderia San Jose', 'C/F'),
(8, 'Comedor Industrial Norte', '88776655'),
(9, 'Soda La Bendicion', 'C/F'),
(10, 'Distribuidora Los Altos', '11223344'),
(11, 'Catering Eventos GT', '55667788'),
(12, 'Escuela Santa Maria', '99887766'),
(13, 'Clinica Salud Integral', '44332211'),
(14, 'Gimnasio PowerFit', 'C/F'),
(15, 'Oficinas Torre Azul', '66778899'),
(16, 'Residencial Las Flores', 'C/F'),
(17, 'Ferreteria El Tornillo', '22331144'),
(18, 'Floreria Jardin', 'C/F'),
(19, 'Gasolinera KM 12', '88990011'),
(20, 'Colegio Bilingue', '44556677'),
(21, 'Farmacia San Lucas', '77889900'),
(22, 'Puesto Mercado Central', 'C/F'),
(23, 'Bar La Terraza', '33449988'),
(24, 'Empresa Transportes Sur', '55664433'),
(25, 'Carniceria La Selecta', 'C/F'),
(26, 'Pizzeria Napolitana', '99001122'),
(27, 'Spa Relax Zone', 'C/F'),
(28, 'Constructora Andes', '66779988'),
(29, 'Iglesia Luz y Vida', 'C/F'),
(30, 'Cooperativa Agricola', '11229988');

-- =========================
-- Compra 
-- =========================
INSERT INTO Compra (id_compra, fecha, total, nit_proveedor) VALUES
(1, '2025-11-02 09:15:00', 1104.00, '10000001'),
(2, '2025-11-03 10:20:00', 1280.00, '10000002'),
(3, '2025-11-04 11:05:00', 1980.00, '10000003'),
(4, '2025-11-05 14:30:00', 1404.00, '10000004'),
(5, '2025-11-06 08:45:00', 2178.00, '10000005'),
(6, '2025-11-07 15:10:00', 3420.00, '10000006'),
(7, '2025-11-08 09:50:00', 2640.00, '10000007'),
(8, '2025-11-09 13:25:00', 975.00, '10000008'),
(9, '2025-11-10 10:00:00', 1290.00, '10000009'),
(10, '2025-11-11 16:40:00', 2212.00, '10000010'),
(11, '2025-11-12 07:55:00', 1040.00, '10000011'),
(12, '2025-11-13 12:15:00', 1280.00, '10000012'),
(13, '2025-11-14 11:30:00', 2115.00, '10000013'),
(14, '2025-11-15 09:05:00', 3720.00, '10000014'),
(15, '2025-11-16 14:50:00', 3550.00, '10000015'),
(16, '2025-11-17 10:35:00', 2450.00, '10000016'),
(17, '2025-11-18 08:20:00', 1680.00, '10000017'),
(18, '2025-11-19 13:45:00', 1640.00, '10000018'),
(19, '2025-11-20 15:05:00', 2635.00, '10000019'),
(20, '2025-11-21 09:30:00', 1260.00, '10000020'),
(21, '2025-11-22 11:55:00', 1925.00, '10000021'),
(22, '2025-11-23 10:10:00', 1248.00, '10000022'),
(23, '2025-11-24 12:00:00', 1809.00, '10000023'),
(24, '2025-11-25 14:25:00', 1210.00, '10000024'),
(25, '2025-11-26 08:40:00', 1634.00, '10000025'),
(26, '2025-11-27 16:15:00', 1995.00, '10000026'),
(27, '2025-11-28 09:50:00', 1525.00, '10000027'),
(28, '2025-11-29 13:20:00', 944.00, '10000028'),
(29, '2025-11-30 10:45:00', 2475.00, '10000029'),
(30, '2025-12-01 11:10:00', 3024.00, '10000030');

-- =========================
-- Compra_Producto
-- =========================
INSERT INTO Compra_Producto (id_compra, id_producto, cantidad_compra) VALUES
(1, 1, 120),
(2, 4, 200),
(3, 6, 150),
(4, 9, 180),
(5, 11, 220),
(6, 12, 300),
(7, 15, 80),
(8, 16, 150),
(9, 19, 100),
(10, 21, 140),
(11, 23, 200),
(12, 25, 400),
(13, 26, 90),
(14, 27, 60),
(15, 28, 50),
(16, 29, 70),
(17, 30, 160),
(18, 17, 200),
(19, 20, 85),
(20, 3, 40),
(21, 29, 55),
(22, 10, 130),
(23, 18, 90),
(24, 8, 110),
(25, 14, 95),
(26, 13, 70),
(27, 5, 250),
(28, 2, 160),
(29, 15, 75),
(30, 7, 180);

INSERT INTO Producto_Proveedor (id_producto, nit_proveedor) VALUES
(1, '10000001'),
(4, '10000002'),
(6, '10000003'),
(9, '10000004'),
(11, '10000005'),
(12, '10000006'),
(15, '10000007'),
(16, '10000008'),
(19, '10000009'),
(21, '10000010'),
(23, '10000011'),
(25, '10000012'),
(26, '10000013'),
(27, '10000014'),
(28, '10000015'),
(29, '10000016'),
(30, '10000017'),
(17, '10000018'),
(20, '10000019'),
(3, '10000020'),
(29, '10000021'),
(10, '10000022'),
(18, '10000023'),
(8, '10000024'),
(14, '10000025'),
(13, '10000026'),
(5, '10000027'),
(2, '10000028'),
(15, '10000029'),
(7, '10000030');
-- =========================
-- Roles
-- =========================
INSERT INTO Rol (id_rol, nombre) VALUES
(1, 'Admin'),
(2, 'Vendedor')
ON CONFLICT (id_rol) DO NOTHING;

-- =========================
-- Usuarios de prueba, uno de admin y uno de empleado
-- Contraseñas:
--   usuario admin   = admin123
--   usuario vendedor  = vendedor123
-- =========================
INSERT INTO Usuario (nit_empleado, nombre, tel_empleado, correo, contrasena, activo, id_rol) VALUES
(
    '90000001',
    'Admin Seed',
    '55550001',
    'admin@seed.local',
    '$2b$12$mdhXmztb1pCgpNGAaDk42OJSOpAdBTFd59t8/68fDmwmrvFp0RVj2',
    true,
    1
),
(
    '90000002',
    'Vendedor Seed',
    '55550002',
    'vendedor@seed.local',
    '$2b$12$mu7b1hI3F4FtYQPDKK/fWuUUWhQIwYDEUdIgVIJ0zECFxuGNsrmJq',
    true,
    2
)
ON CONFLICT (nit_empleado) DO NOTHING;

-- =========================
-- Venta, null para los que no tienen nit_empleado
-- =========================
INSERT INTO Venta (id_venta, fecha, total, id_cliente, nit_empleado) VALUES
(1, '2025-11-02 08:30:00', 245.50, 3, 90000002),
(2, '2025-11-03 09:12:00', 89.00, 6, 90000002),
(3, '2025-11-05 10:05:00', 512.75, 1, 90000002),
(4, '2025-12-02 11:40:00', 36.25, 9, 90000002),
(5, '2025-12-02 12:18:00', 178.00, 14, 90000002),
(6, '2025-12-02 13:55:00', 420.90, 2, 90000002),
(7, '2025-12-02 14:22:00', 95.50, 22, 90000002),
(8, '2025-12-02 15:08:00', 310.00, 10, NULL),
(9, '2025-12-02 16:45:00', 67.80, 5, NULL),
(10, '2025-12-03 08:05:00', 1240.00, 8, NULL),
(11, '2025-12-03 09:33:00', 58.00, 12, 90000002),
(12, '2025-12-03 10:50:00', 203.40, 7, NULL),
(13, '2025-12-03 11:17:00', 990.25, 11, NULL),
(14, '2025-12-03 12:44:00', 45.00, 19, NULL),
(15, '2025-12-03 13:29:00', 332.10, 4, 90000002),
(16, '2025-12-03 14:03:00', 76.50, 23, NULL),
(17, '2025-12-03 15:51:00', 1548.00, 24, NULL),
(18, '2025-12-03 16:10:00', 22.75, 16, NULL),
(19, '2025-12-04 08:40:00', 405.60, 26, NULL),
(20, '2025-12-04 09:08:00', 188.90, 13, NULL),
(21, '2025-12-04 10:35:00', 56.00, 18, 90000002),
(22, '2025-12-04 11:02:00', 721.45, 15, NULL),
(23, '2025-12-04 12:28:00', 134.00, 20, NULL),
(24, '2025-12-04 13:14:00', 2899.00, 28, NULL),
(25, '2025-12-04 14:50:00', 41.25, 29, 90000002),
(26, '2025-12-04 15:33:00', 612.80, 17, 90000002),
(27, '2025-12-04 16:01:00', 98.00, 25, NULL),
(28, '2025-12-04 16:40:00', 375.50, 21, NULL),
(29, '2025-12-05 08:22:00', 210.00, 30, NULL),
(30, '2025-12-05 09:55:00', 1555.30, 1, NULL);

-- =========================
-- Venta_Producto
-- =========================
INSERT INTO Venta_Producto (id_venta, id_producto, cantidad_venta) VALUES
(1, 6, 8),
(1, 9, 5),
(2, 24, 10),
(3, 13, 20),
(3, 14, 10),
(4, 25, 5),
(5, 17, 6),
(6, 1, 12),
(6, 4, 20),
(7, 10, 4),
(8, 27, 6),
(8, 28, 2),
(9, 7, 3),
(10, 20, 25),
(11, 26, 1),
(12, 21, 8),
(13, 29, 18),
(13, 30, 20),
(14, 16, 4),
(15, 3, 6),
(15, 2, 10),
(16, 8, 5),
(17, 15, 30),
(17, 18, 12),
(18, 5, 2),
(19, 22, 10),
(20, 11, 12),
(21, 23, 5),
(22, 12, 40),
(23, 19, 6),
(24, 6, 50),
(24, 7, 40),
(25, 30, 2),
(26, 29, 12),
(27, 4, 8),
(28, 1, 6),
(28, 6, 10),
(29, 9, 15),
(30, 13, 35),
(30, 12, 20);

-- =========================
-- SERIAL sequences: actualizar los valores para que no choquen con los datos insertados
-- =========================
SELECT setval(
    pg_get_serial_sequence('categoria', 'id_categoria'),
    COALESCE((SELECT MAX(id_categoria) FROM categoria), 1)
);
SELECT setval(
    pg_get_serial_sequence('cliente', 'id_cliente'),
    COALESCE((SELECT MAX(id_cliente) FROM cliente), 1)
);
SELECT setval(
    pg_get_serial_sequence('compra', 'id_compra'),
    COALESCE((SELECT MAX(id_compra) FROM compra), 1)
);
SELECT setval(
    pg_get_serial_sequence('rol', 'id_rol'),
    COALESCE((SELECT MAX(id_rol) FROM rol), 1)
);
SELECT setval(
    pg_get_serial_sequence('venta', 'id_venta'),
    COALESCE((SELECT MAX(id_venta) FROM venta), 1)
);