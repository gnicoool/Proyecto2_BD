from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from orm.database import get_session
from orm.models import Cliente
from schemas.cliente import ClienteCreate, ClienteGet

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.get("/", response_model=list[ClienteGet])
def list_clientes(db: Session = Depends(get_session)):
    return db.query(Cliente).order_by(Cliente.id_cliente).all()


@router.get("/{id_cliente}", response_model=ClienteGet)
def get_cliente(id_cliente: int, db: Session = Depends(get_session)):
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


# ORM — CREATE
@router.post("/", response_model=ClienteGet, status_code=201)
def create_cliente(data: ClienteCreate, db: Session = Depends(get_session)):
    cliente = Cliente(nombre=data.nombre, nit=data.nit)
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente
