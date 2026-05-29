from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer, Numeric,
    String, DateTime, func,
)
from sqlalchemy.orm import relationship

from orm.database import Base


class Rol(Base):
    __tablename__ = "rol"

    id_rol = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)

    usuarios = relationship("Usuario", back_populates="rol")


class Usuario(Base):
    __tablename__ = "usuario"

    nit_empleado = Column(String(8), primary_key=True)
    nombre = Column(String(50), nullable=False)
    tel_empleado = Column(String(20))
    correo = Column(String(50), nullable=False)
    contrasena = Column(String(255), nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), nullable=False)

    rol = relationship("Rol", back_populates="usuarios")
    ventas = relationship("Venta", back_populates="empleado")


class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(100))

    productos = relationship("Producto", back_populates="categoria")


class Marca(Base):
    __tablename__ = "marca"

    id_marca = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False, unique=True)
    activo = Column(Boolean, nullable=False, default=True)


class Producto(Base):
    __tablename__ = "producto"

    id_producto = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(50))
    precio_venta = Column(Numeric(10, 2), nullable=False)
    precio_compra = Column(Numeric(10, 2), nullable=False)
    cant_disponible = Column(Integer, nullable=False, default=0)
    id_categoria = Column(Integer, ForeignKey("categoria.id_categoria"), nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    id_marca = Column(Integer, ForeignKey("marca.id_marca"), nullable=False)

    categoria = relationship("Categoria", back_populates="productos")
    marca = relationship("Marca")


class Cliente(Base):
    __tablename__ = "cliente"

    id_cliente = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    nit = Column(String(20), nullable=False, default="C/F")

    ventas = relationship("Venta", back_populates="cliente")


class Proveedor(Base):
    __tablename__ = "proveedor"

    nit_proveedor = Column(String(8), primary_key=True)
    nombre = Column(String(50), nullable=False)
    correo = Column(String(50), nullable=False)
    tel_proveedor = Column(String(20), nullable=False)
    activo = Column(Boolean, nullable=False, default=True)

    compras = relationship("Compra", back_populates="proveedor")


class Venta(Base):
    __tablename__ = "venta"

    id_venta = Column(Integer, primary_key=True)
    fecha = Column(DateTime, server_default=func.now())
    total = Column(Numeric(10, 2), nullable=False)
    id_cliente = Column(Integer, ForeignKey("cliente.id_cliente"), nullable=True)
    nit_empleado = Column(String(8), ForeignKey("usuario.nit_empleado"), nullable=True)

    cliente = relationship("Cliente", back_populates="ventas")
    empleado = relationship("Usuario", back_populates="ventas")
    lineas = relationship("VentaProducto", back_populates="venta")


class VentaProducto(Base):
    __tablename__ = "venta_producto"

    id_venta = Column(Integer, ForeignKey("venta.id_venta"), primary_key=True)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"), primary_key=True)
    cantidad_venta = Column(Integer, nullable=False)

    venta = relationship("Venta", back_populates="lineas")
    producto = relationship("Producto")


class Compra(Base):
    __tablename__ = "compra"

    id_compra = Column(Integer, primary_key=True)
    fecha = Column(DateTime, server_default=func.now())
    total = Column(Numeric(10, 2), nullable=False)
    nit_proveedor = Column(String(8), ForeignKey("proveedor.nit_proveedor"), nullable=False)

    proveedor = relationship("Proveedor", back_populates="compras")
    lineas = relationship("CompraProducto", back_populates="compra")


class CompraProducto(Base):
    __tablename__ = "compra_producto"

    id_compra = Column(Integer, ForeignKey("compra.id_compra"), primary_key=True)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"), primary_key=True)
    cantidad_compra = Column(Integer, nullable=False)

    compra = relationship("Compra", back_populates="lineas")
    producto = relationship("Producto")


class ProductoProveedor(Base):
    __tablename__ = "producto_proveedor"

    id_producto = Column(Integer, ForeignKey("producto.id_producto"), primary_key=True)
    nit_proveedor = Column(String(8), ForeignKey("proveedor.nit_proveedor"), primary_key=True)
