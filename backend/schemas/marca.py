from pydantic import BaseModel
from typing import Optional, Literal

class MarcaCreate(BaseModel):
    nombre: str

class MarcaGet(BaseModel):
    id_marca: int
    nombre: str
    activo: bool

class MarcaDelete(BaseModel):
    accion: Literal["eliminado", "desactivado"]
    id_marca: int
    activo: Optional[bool] = None