from passlib.hash import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, text
from sqlalchemy.exc import DBAPIError, IntegrityError
from sqlalchemy.orm import Session, joinedload

from auth_deps import require_admin_nit, require_rol
from constants import ADMIN_ROLE_NAME
from orm.database import get_session
from orm.models import Rol, Usuario, Venta
from schemas.empleado import EmpleadoCreate, EmpleadoDelete, EmpleadoGet, EmpleadoUpdate

router = APIRouter(prefix="/empleados", tags=["Empleados"])


def _is_admin(nombre_rol: str | None) -> bool:
    return (nombre_rol or "").strip().lower() == ADMIN_ROLE_NAME


def _empleado_to_get(u: Usuario, nombre_rol: str, total_ventas: int) -> EmpleadoGet:
    return EmpleadoGet(
        nit_empleado=u.nit_empleado,
        nombre=u.nombre,
        tel_empleado=u.tel_empleado,
        correo=u.correo,
        id_rol=u.id_rol,
        nombre_rol=nombre_rol,
        activo=u.activo,
        total_ventas=total_ventas,
    )


@router.get("/", response_model=list[EmpleadoGet])
def list_empleados(
    _: dict = Depends(require_rol("Admin", "Supervisor")),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_session),
):
    q = (
        db.query(Usuario, Rol.nombre.label("nombre_rol"), func.count(Venta.id_venta).label("total_ventas"))
        .join(Rol, Usuario.id_rol == Rol.id_rol)
        .outerjoin(Venta, Venta.nit_empleado == Usuario.nit_empleado)
        .group_by(Usuario.nit_empleado, Rol.nombre)
        .order_by(Usuario.nit_empleado)
    )
    if not include_inactive:
        q = q.filter(Usuario.activo == True)
    rows = q.all()
    return [_empleado_to_get(u, nombre_rol, total) for u, nombre_rol, total in rows]


@router.post("/", response_model=EmpleadoGet, status_code=201)
def create_empleado(
    data: EmpleadoCreate,
    _: str = Depends(require_admin_nit),
    db: Session = Depends(get_session),
):
    pwd_hash = bcrypt.hash(data.contrasena)
    nit = data.nit_empleado.strip()
    try:
        db.execute(# Crear un empleado usando el procedure de gestionar empleado
            text("""
                CALL sp_gestionar_empleado(
                    :accion, :nit, :nombre, :tel, :correo, :cont, :id_rol
                )
            """),
            {
                "accion": "CREAR",
                "nit": nit,
                "nombre": data.nombre,
                "tel": data.tel_empleado,
                "correo": data.correo,
                "cont": pwd_hash,
                "id_rol": data.id_rol,
            },
        )
        db.commit()
    except DBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))

    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .filter(Usuario.nit_empleado == nit)
        .first()
    )
    return _empleado_to_get(usuario, usuario.rol.nombre, 0)


@router.patch("/{nit_empleado}", response_model=EmpleadoGet)
def update_empleado(
    nit_empleado: str,
    data: EmpleadoUpdate,
    _: str = Depends(require_admin_nit),
    db: Session = Depends(get_session),
):
    nit = nit_empleado.strip()
    payload = data.model_dump(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .filter(Usuario.nit_empleado == nit)
        .first()
    )
    if not usuario:
        raise HTTPException(status_code=404, detail="User not found")

    if "id_rol" in payload:
        nuevo_rol = db.query(Rol).filter(Rol.id_rol == payload["id_rol"]).first()
        if not nuevo_rol:
            raise HTTPException(status_code=400, detail="Invalid id_rol")
        if _is_admin(usuario.rol.nombre) and not _is_admin(nuevo_rol.nombre):
            raise HTTPException(status_code=403, detail="Cannot change admin role to a non-admin role")

    if _is_admin(usuario.rol.nombre) and payload.get("activo") is False:
        raise HTTPException(status_code=403, detail="Cannot deactivate admin users")

    for key, value in payload.items():
        setattr(usuario, key, value)

    db.commit()
    db.refresh(usuario)

    total_ventas = db.query(func.count(Venta.id_venta)).filter(Venta.nit_empleado == nit).scalar() or 0
    rol_nombre = db.query(Rol.nombre).filter(Rol.id_rol == usuario.id_rol).scalar() or ""
    return _empleado_to_get(usuario, rol_nombre, total_ventas)


@router.delete("/{nit_empleado}", response_model=EmpleadoDelete)
def delete_empleado(
    nit_empleado: str,
    _: str = Depends(require_admin_nit),
    db: Session = Depends(get_session),
):
    nit = nit_empleado.strip()
    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .filter(Usuario.nit_empleado == nit)
        .first()
    )
    if not usuario:
        raise HTTPException(status_code=404, detail="User not found")

    if _is_admin(usuario.rol.nombre):
        raise HTTPException(status_code=403, detail="Admin users cannot be deleted or deactivated")

    total_ventas = db.query(func.count(Venta.id_venta)).filter(Venta.nit_empleado == nit).scalar() or 0

    if total_ventas == 0:
        db.delete(usuario)
        db.commit()
        return EmpleadoDelete(accion="eliminado", nit_empleado=nit, activo=None)

    # Desactivar empleado con ventas usando el procedure de gestionar empleado
    try:
        db.execute(
            text("CALL sp_gestionar_empleado(:accion, :nit, NULL, NULL, NULL, NULL, NULL)"),
            {"accion": "DESACTIVAR", "nit": nit},
        )
        db.commit()
    except DBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))

    return EmpleadoDelete(accion="desactivado", nit_empleado=nit, activo=False)
