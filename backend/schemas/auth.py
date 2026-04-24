from pydantic import BaseModel

class LoginRequest(BaseModel):
    correo: str
    contrasena: str


class LoginResponse(BaseModel):
    nit_empleado: str
    nombre: str
    id_rol: int
    rol: str
    activo: bool
