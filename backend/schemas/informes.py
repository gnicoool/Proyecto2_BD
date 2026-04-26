from datetime import datetime
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class ProductoCatalogoVistaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_producto: int
    nombre: str
    descripcion: str | None
    precio_venta: Decimal
    precio_compra: Decimal
    cant_disponible: int
    id_categoria: int
    categoria_nombre: str
    categoria_descripcion: str | None

class VentaPorCategoriaOut(BaseModel):
    id_categoria: int
    categoria_nombre: str
    num_ventas: int
    total_importe: Decimal
    ticket_promedio_categoria: Decimal | None

class ProductoNuncaVendidoOut(BaseModel):
    id_producto: int
    nombre: str
    cant_disponible: int

class VentaPorMesSubqueryOut(BaseModel):
    anio_mes: str
    cantidad_ventas: int
    total_mes: Decimal

class UltimaLineaVentaOut(BaseModel):
    id_venta: int
    fecha: datetime
    cliente: str
    producto: str
    cantidad_venta: int
    precio_venta: Decimal
