from pydantic import BaseModel
from typing import Optional, Literal

class EmpleadoCreate(BaseModel):
    nit_empleado: str
    nombre: str
    tel_empleado: Optional[str]= None
    correo: str
    id_rol: int
    contrasena: str

#total_ventas para usarlo en informes 
class EmpleadoGet(BaseModel):
    nit_empleado:str
    nombre: str
    tel_empleado: Optional[str] = None
    correo: str
    id_rol : int
    activo: bool
    total_ventas: int = 0

class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    tel_empleado: Optional[str] = None
    correo: Optional[str] = None
    activo: Optional[bool] = None
    id_rol: Optional[int] = None

class EmpleadoDelete(BaseModel):
    accion: Literal["eliminado", "desactivado"]
    nit_empleado: str
    activo: Optional[bool] = None