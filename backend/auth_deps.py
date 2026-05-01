from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from passlib.hash import bcrypt

from constants import ADMIN_ROLE_NAME
from database import get_db

security = HTTPBasic(auto_error=False)


def require_admin_nit(x_nit_empleado: str = Header(..., alias="X-NIT-Empleado")):
    """Permite acceso solo a usuarios activos con rol de administrador, usando NIT en header."""
    nit = x_nit_empleado.strip()
    if not nit:
        raise HTTPException(status_code=401, detail="X-NIT-Empleado required")
    with get_db() as cur:
        cur.execute(
            """
            SELECT LOWER(TRIM(r.nombre)) AS rol_nombre
            FROM Usuario u
            JOIN Rol r ON r.id_rol = u.id_rol
            WHERE u.nit_empleado = %s AND u.activo = true
            """,
            (nit,),
        )
        row = cur.fetchone()
    if not row or row["rol_nombre"] != ADMIN_ROLE_NAME:
        raise HTTPException(status_code=403, detail="Admin role required")
    return nit


def require_admin(credentials: HTTPBasicCredentials | None = Depends(security)):
    """Permite acceso solo a usuarios activos con rol de administrador."""
    if credentials is None or not credentials.username or not credentials.password:
        raise HTTPException(
            status_code=401,
            detail="Admin HTTP Basic auth required (NIT as username, password)",
            headers={"WWW-Authenticate": "Basic"},
        )
    nit = credentials.username.strip()
    with get_db() as cur:
        cur.execute(
            """
            SELECT u.contrasena, LOWER(TRIM(r.nombre)) AS rol_nombre
            FROM Usuario u
            JOIN Rol r ON r.id_rol = u.id_rol
            WHERE u.nit_empleado = %s AND u.activo = true
            """,
            (nit,),
        )
        row = cur.fetchone()
    if not row or row["rol_nombre"] != ADMIN_ROLE_NAME:
        raise HTTPException(status_code=403, detail="Admin role required")
    if not bcrypt.verify(credentials.password, row["contrasena"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return nit
