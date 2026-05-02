from pydantic import BaseModel
from typing import Optional, Literal
from decimal import Decimal

class ProductoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_venta: Decimal
    precio_compra: Decimal
    cant_disponible: int = 0
    id_categoria: int
    id_marca: int

class ProductoGet(BaseModel):
    id_producto: int
    nombre: str
    descripcion: Optional[str]= None
    precio_venta: Decimal
    precio_compra: Decimal
    cant_disponible: int
    id_categoria: int
    activo: bool
    id_marca: int
    categoria_nombre: Optional[str] = None
    proveedor_nombre: Optional[str] = None

class ProductoUpdate(BaseModel):
    nombre: Optional[str]= None
    descripcion: Optional[str]= None
    precio_venta: Optional[Decimal] = None
    precio_compra: Optional[Decimal] = None
    cant_disponible: Optional[int]= None
    id_categoria: Optional[int]= None 
    id_marca: Optional[int] = None

class ProductoDelete(BaseModel):
    accion: Literal["eliminado", "desactivado"]
    id_producto: int
    activo: Optional[bool] = None