from pydantic import BaseModel
from typing import Optional, Literal

class ProveedorCreate(BaseModel):
    nit_proveedor: str
    nombre: str
    correo: str
    tel_proveedor: str

class ProveedorGet(BaseModel):
    nit_proveedor: str
    nombre: str
    correo: str
    tel_proveedor: str
    activo: bool = True
    total_compras: int = 0

class ProveedorUpdate(BaseModel):
    nombre: Optional[str]=None
    correo: Optional[str]= None
    tel_proveedor: Optional[str]= None
    activo: Optional[bool]=None

class ProveedorDelete(BaseModel):
    accion: Literal["eliminado", "desactivado"]
    nit_proveedor: str
    activo: Optional[bool] = None