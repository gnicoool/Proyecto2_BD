from pydantic import BaseModel

class ClienteCreate(BaseModel):
    nombre: str
    nit: str = "C/F"


class ClienteGet(BaseModel):
    id_cliente: int
    nombre: str
    nit: str
