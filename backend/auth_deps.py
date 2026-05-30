import os
from typing import Generator

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import text
from sqlalchemy.orm import Session

from orm.database import SessionLocal

_SECRET = os.getenv("JWT_SECRET", "supersecret_proy2_bd_2026")
_ALGORITHM = "HS256"

# Mapeo rol de la app al rol de PostgreSQL
ROLE_MAP: dict[str, str] = {
    "Admin":      "rol_admin",
    "Vendedor":   "rol_vendedor",
    "Bodeguero":  "rol_bodeguero",
    "Contador":   "rol_contador",
    "Supervisor": "rol_supervisor",
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Decodifica el JWT y retorna el payload: sub, nombre, id_rol, rol."""
    try:
        payload = jwt.decode(token, _SECRET, algorithms=[_ALGORITHM])
        if not payload.get("sub"):
            raise ValueError("Token sin sujeto")
        return payload
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


def require_rol(*roles: str):
    """
    Factory que retorna una dependencia FastAPI.
    Verifica que el usuario autenticado tenga uno de los roles permitidos.

    Uso:  Depends(require_rol("Admin", "Vendedor"))
    """
    def dependency(user: dict = Depends(get_current_user)) -> dict:
        if user.get("rol") not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Acceso denegado. Se requiere rol: {', '.join(roles)}",
            )
        return user
    return dependency


def get_role_session(user: dict = Depends(get_current_user)) -> Generator[Session, None, None]:
    """
    Ejecuta SET LOCAL ROLE al usuario PostgreSQL del empleado y cada empleado tiene su propio usuario DB,
    el user es el numero de nit y este  hereda del grupo rol"""
    nit = user["sub"]
    db = SessionLocal()
    try:
        db.execute(text(f'SET LOCAL ROLE "{nit}"'))
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# Alias de compatibilidad
def require_admin_nit(user: dict = Depends(get_current_user)) -> str:
    if user.get("rol") != "Admin":
        raise HTTPException(status_code=403, detail="Se requiere rol Admin")
    return user["sub"]


def require_admin(user: dict = Depends(get_current_user)) -> str:
    if user.get("rol") != "Admin":
        raise HTTPException(status_code=403, detail="Se requiere rol Admin")
    return user["sub"]
