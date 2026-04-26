from fastapi import APIRouter, HTTPException

from database import get_db
from schemas.cliente import ClienteCreate, ClienteGet

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.get("/", response_model=list[ClienteGet])
def list_clientes():
    with get_db() as cur:
        cur.execute(
            "SELECT id_cliente, nombre, nit FROM Cliente ORDER BY id_cliente"
        )
        return cur.fetchall()


@router.get("/{id_cliente}", response_model=ClienteGet)
def get_cliente(id_cliente: int):
    with get_db() as cur:
        cur.execute(
            "SELECT id_cliente, nombre, nit FROM Cliente WHERE id_cliente = %s",
            (id_cliente,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return row


@router.post("/", response_model=ClienteGet, status_code=201)
def create_cliente(data: ClienteCreate):
    with get_db() as cur:
        cur.execute(
            "INSERT INTO Cliente (nombre, nit) VALUES (%s, %s) RETURNING id_cliente, nombre, nit",
            (data.nombre, data.nit),
        )
        return cur.fetchone()
