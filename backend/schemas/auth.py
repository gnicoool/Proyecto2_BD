from pydantic import BaseModel


class LoginRequest(BaseModel):
    correo: str
    contrasena: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nit_empleado: str
    nombre: str
    id_rol: int
    rol: str
    activo: bool
