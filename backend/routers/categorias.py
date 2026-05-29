from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_deps import require_rol
from orm.database import get_session
from orm.models import Categoria
from schemas.categoria import CategoriaCreate, CategoriaGet, CategoriaUpdate

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("/", response_model=list[CategoriaGet])
def get_categorias(db: Session = Depends(get_session)):
    return db.query(Categoria).order_by(Categoria.id_categoria).all()


@router.post("/", response_model=CategoriaGet, status_code=201)
def create_categoria(
    data: CategoriaCreate,
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_session),
):
    cat = Categoria(nombre=data.nombre, descripcion=data.descripcion)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.patch("/{id_categoria}", response_model=CategoriaGet)
def update_categoria(
    id_categoria: int,
    data: CategoriaUpdate,
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_session),
):
    cat = db.query(Categoria).filter(Categoria.id_categoria == id_categoria).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(cat, key, value)

    db.commit()
    db.refresh(cat)
    return cat
