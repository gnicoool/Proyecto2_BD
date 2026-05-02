from pydantic import BaseModel
from typing import List, Optional
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


class CompraCabeceraListaOut(BaseModel):
    id_compra: int
    fecha: datetime
    total: Decimal
    nit_proveedor: str
    proveedor_nombre: str


class CompraLineaOut(BaseModel):
    id_producto: int
    cantidad_compra: int
    precio_compra: Decimal
    nombre: Optional[str] = None


class CompraDetalleOut(BaseModel):
    compra: CompraCabeceraListaOut
    lineas: List[CompraLineaOut]
