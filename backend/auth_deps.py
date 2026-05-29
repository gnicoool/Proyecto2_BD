import os

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

_SECRET = os.getenv("JWT_SECRET")
_ALGORITHM = "HS256"

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


# Alias de compatibilidad para no romper routers existentes en esta transicion
def require_admin_nit(user: dict = Depends(get_current_user)) -> str:
    """Acepta cualquier token JWT válido de Admin y retorna el NIT."""
    if user.get("rol") != "Admin":
        raise HTTPException(status_code=403, detail="Se requiere rol Admin")
    return user["sub"]


def require_admin(user: dict = Depends(get_current_user)) -> str:
    """Acepta cualquier token JWT válido de Admin y retorna el NIT."""
    if user.get("rol") != "Admin":
        raise HTTPException(status_code=403, detail="Se requiere rol Admin")
    return user["sub"]
