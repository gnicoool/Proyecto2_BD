from pydantic import BaseModel, model_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from .cliente import ClienteCreate

class VentaProductoCreate(BaseModel):
    id_producto: int
    cantidad_venta: int
    precio_venta: Decimal

class VentaProductoLineOut(BaseModel):
    id_producto: int
    cantidad_venta: int
    precio_venta: Decimal
    nombre: Optional[str] = None

class VentaCreate(BaseModel):
    id_cliente: Optional[int] = None
    nuevo_cliente: Optional[ClienteCreate] = None
    nit_empleado: str
    productos: List[VentaProductoCreate]

    @model_validator(mode="after")
    def cliente_xor(self):
        if self.nuevo_cliente is not None and self.id_cliente is not None:
            raise ValueError("Usar id_cliente o nuevo_cliente")
        return self

class VentaCabeceraOut(BaseModel):
    id_venta: int
    fecha: datetime
    total: Decimal
    id_cliente: Optional[int] = None
    nit_empleado: Optional[str] = None
    cliente_nombre: Optional[str] = None
    empleado_nombre: Optional[str] = None