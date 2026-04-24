from pydantic import BaseModel
from typing import Optional, Literal

class MarcaCreate(BaseModel):
    nombre: str

class MarcaGet(BaseModel):
    id_marca: int
    nombre: str

class MarcaDelete(BaseModel):
    accion: Literal["eliminado", "desactivado"]
    nit_empleado: str
    activo: Optional[bool] = None