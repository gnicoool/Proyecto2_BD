from pydantic import BaseModel
from typing import List
from datetime import datetime
from decimal import Decimal

class CompraProductoCreate(BaseModel):
    id_producto: int
    cantidad_compra: int
    precio_compra: Decimal


class CompraCreate(BaseModel):
    nit_proveedor: str
    productos: List[CompraProductoCreate]


class CompraGet(BaseModel):
    id_compra: int
    fecha: datetime
    total: Decimal
    nit_proveedor: str
