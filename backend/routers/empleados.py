from passlib.hash import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm import Session, joinedload

from auth_deps import require_admin_nit, require_rol
from constants import ADMIN_ROLE_NAME
from orm.database import get_session
from orm.models import Rol, Usuario, Venta
from schemas.empleado import EmpleadoCreate, EmpleadoDelete, EmpleadoGet, EmpleadoUpdate

router = APIRouter(prefix="/empleados", tags=["Empleados"])

# Mapeo id_rol con grupo PostgreSQL que hereda los permisos
_PG_GROUP = {
    1: "rol_admin",
    2: "rol_vendedor",
    3: "rol_bodeguero",
    4: "rol_contador",
    5: "rol_supervisor",
}


def _is_admin(nombre_rol: str | None) -> bool:
    return (nombre_rol or "").strip() == ADMIN_ROLE_NAME


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


def _db_user_exists(db: Session, nit: str) -> bool:
    row = db.execute(
        text("SELECT 1 FROM pg_roles WHERE rolname = :nit"),
        {"nit": nit},
    ).fetchone()
    return row is not None


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
        q = q.filter(Usuario.activo == True)  # noqa: E712
    rows = q.all()
    return [_empleado_to_get(u, nombre_rol, total) for u, nombre_rol, total in rows]


@router.post("/", response_model=EmpleadoGet, status_code=201)
def create_empleado(
    data: EmpleadoCreate,
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_session),
):

    # Crea el empleado en la tabla Usuario  con el procedurey también crea un usuario PostgreSQL con LOGIN que hereda del grupo rol al que fue asignado
    pwd_hash = bcrypt.hash(data.contrasena)
    nit = data.nit_empleado.strip()

    try:
        db.execute(
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
    except DBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))

    pg_group = _PG_GROUP.get(data.id_rol)
    if pg_group and not _db_user_exists(db, nit):
        db.execute(
            text(f'CREATE USER "{nit}" WITH LOGIN INHERIT IN ROLE {pg_group} PASSWORD :pwd'),
            {"pwd": data.contrasena},
        )

    db.commit()

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

    old_id_rol = usuario.id_rol
    for key, value in payload.items():
        setattr(usuario, key, value)

    db.commit()
    db.refresh(usuario)

    # Si cambia el rol, actualizar el grupo del usuario DB
    if "id_rol" in payload and payload["id_rol"] != old_id_rol:
        old_pg = _PG_GROUP.get(old_id_rol)
        new_pg = _PG_GROUP.get(payload["id_rol"])
        if old_pg and new_pg and _db_user_exists(db, nit):
            db.execute(text(f'REVOKE {old_pg} FROM "{nit}"'))
            db.execute(text(f'GRANT {new_pg} TO "{nit}"'))
            db.commit()

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
        # Para eliminar borrar registro y usuario PostgreSQL
        db.delete(usuario)
        if _db_user_exists(db, nit):
            db.execute(text(f'DROP USER IF EXISTS "{nit}"'))
        db.commit()
        return EmpleadoDelete(accion="eliminado", nit_empleado=nit, activo=None)

    # Para desactivar usa ek procedure y le quita el LOGIN al usuario 
    try:
        db.execute(
            text("CALL sp_gestionar_empleado(:accion, :nit, NULL, NULL, NULL, NULL, NULL)"),
            {"accion": "DESACTIVAR", "nit": nit},
        )
        if _db_user_exists(db, nit):
            db.execute(text(f'ALTER USER "{nit}" NOLOGIN'))
        db.commit()
    except DBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))

    return EmpleadoDelete(accion="desactivado", nit_empleado=nit, activo=False)
