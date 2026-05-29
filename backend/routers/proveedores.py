from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth_deps import require_admin_nit
from orm.database import get_session
from orm.models import Compra, Proveedor as ProveedorModel
from schemas.proveedor import ProveedorCreate, ProveedorDelete, ProveedorGet, ProveedorUpdate

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])


def _total_compras(db: Session, nit: str) -> int:
    return db.query(func.count(Compra.id_compra)).filter(Compra.nit_proveedor == nit).scalar() or 0


def _to_get(p: ProveedorModel, total: int) -> ProveedorGet:
    return ProveedorGet(
        nit_proveedor=p.nit_proveedor,
        nombre=p.nombre,
        correo=p.correo,
        tel_proveedor=p.tel_proveedor,
        activo=p.activo,
        total_compras=total,
    )


@router.get("/", response_model=list[ProveedorGet])
def get_proveedores(
    _: str = Depends(require_admin_nit),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_session),
):
    q = db.query(
        ProveedorModel,
        func.count(Compra.id_compra).label("total_compras"),
    ).outerjoin(Compra, Compra.nit_proveedor == ProveedorModel.nit_proveedor)\
     .group_by(ProveedorModel.nit_proveedor)\
     .order_by(ProveedorModel.nit_proveedor)

    if not include_inactive:
        q = q.filter(ProveedorModel.activo == True)

    return [_to_get(p, total) for p, total in q.all()]


@router.post("/", response_model=ProveedorGet, status_code=201)
def create_proveedor(
    data: ProveedorCreate,
    _: str = Depends(require_admin_nit),
    db: Session = Depends(get_session),
):
    proveedor = ProveedorModel(
        nit_proveedor=data.nit_proveedor.strip(),
        nombre=data.nombre,
        correo=data.correo,
        tel_proveedor=data.tel_proveedor,
        activo=True,
    )
    db.add(proveedor)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ya existe un proveedor con ese NIT")
    return _to_get(proveedor, 0)


@router.patch("/{nit_proveedor}", response_model=ProveedorGet)
def update_proveedor(
    nit_proveedor: str,
    data: ProveedorUpdate,
    _: str = Depends(require_admin_nit),
    db: Session = Depends(get_session),
):
    nit = nit_proveedor.strip()
    payload = data.model_dump(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    proveedor = db.query(ProveedorModel).filter(ProveedorModel.nit_proveedor == nit).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor not found")

    for key, value in payload.items():
        setattr(proveedor, key, value)

    db.commit()
    db.refresh(proveedor)
    return _to_get(proveedor, _total_compras(db, nit))


@router.delete("/{nit_proveedor}", response_model=ProveedorDelete)
def delete_proveedor(
    nit_proveedor: str,
    _: str = Depends(require_admin_nit),
    db: Session = Depends(get_session),
):
    nit = nit_proveedor.strip()
    proveedor = db.query(ProveedorModel).filter(ProveedorModel.nit_proveedor == nit).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor not found")

    total = _total_compras(db, nit)
    if total == 0:
        db.delete(proveedor)
        db.commit()
        return ProveedorDelete(accion="eliminado", nit_proveedor=nit, activo=None)

    proveedor.activo = False
    db.commit()
    return ProveedorDelete(accion="desactivado", nit_proveedor=nit, activo=False)
