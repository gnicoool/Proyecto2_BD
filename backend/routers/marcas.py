from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth_deps import require_rol
from orm.database import get_session
from orm.models import Marca
from schemas.marca import MarcaCreate, MarcaDelete, MarcaGet

router = APIRouter(prefix="/marcas", tags=["Marcas"])


@router.get("/", response_model=list[MarcaGet])
def get_marcas(db: Session = Depends(get_session)):
    return db.query(Marca).order_by(Marca.id_marca).all()


@router.post("/", response_model=MarcaGet, status_code=201)
def create_marca(
    data: MarcaCreate,
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_session),
):
    marca = Marca(nombre=data.nombre)
    db.add(marca)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ya existe una marca con ese nombre")
    db.refresh(marca)
    return marca


@router.delete("/{id_marca}", response_model=MarcaDelete)
def delete_marca(
    id_marca: int,
    permanent: bool = Query(False, description="If true, DELETE row; if false, soft delete."),
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_session),
):
    marca = db.query(Marca).filter(Marca.id_marca == id_marca).first()
    if not marca:
        raise HTTPException(status_code=404, detail="Marca no encontrada")

    if permanent:
        try:
            db.delete(marca)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=409,
                detail="No se puede eliminar: hay productos que usan esta marca",
            )
        return MarcaDelete(accion="eliminado", id_marca=id_marca, activo=None)

    marca.activo = False
    db.commit()
    return MarcaDelete(accion="desactivado", id_marca=id_marca, activo=False)
