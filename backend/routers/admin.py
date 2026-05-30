from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from auth_deps import ROLE_MAP, get_role_session, require_rol

router = APIRouter(prefix="/admin", tags=["Admin"])


class RolPasswordUpdate(BaseModel):
    nombre_rol: str   # Admin, vendedor, supervisor, bodeguero, contador
    nueva_contrasena: str


@router.post("/rol-password")
def cambiar_password_rol(
    data: RolPasswordUpdate,
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_role_session),
):
    """
    El admin cambia la contraseña del rol PostgreSQL
    """
    pg_role = ROLE_MAP.get(data.nombre_rol)
    if not pg_role:
        raise HTTPException(
            status_code=400,
            detail=f"Rol no válido. Valores permitidos: {', '.join(ROLE_MAP.keys())}",
        )
    if not data.nueva_contrasena or len(data.nueva_contrasena) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")

    try:
        db.execute(text(f"ALTER ROLE {pg_role} WITH PASSWORD :pwd"), {"pwd": data.nueva_contrasena})
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo cambiar la contraseña. Verifica que el usuario de BD tenga CREATEROLE: {e}",
        )

    return {"mensaje": f"Contraseña del rol {pg_role} actualizada correctamente"}


@router.get("/roles-info")
def listar_roles(
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_role_session),
):
    """Lista los roles DBMS con su estado de LOGIN."""
    rows = db.execute(
        text("""
            SELECT rolname, rolcanlogin, rolvaliduntil
            FROM pg_roles
            WHERE rolname LIKE 'rol_%'
            ORDER BY rolname
        """)
    ).mappings().all()
    return [dict(r) for r in rows]
