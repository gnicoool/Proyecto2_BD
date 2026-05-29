import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from jose import jwt
from passlib.hash import bcrypt

from database import get_db
from schemas.auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

_SECRET = os.getenv("JWT_SECRET")
_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))
_ALGORITHM = "HS256"


def _crear_token(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.now(timezone.utc) + timedelta(hours=_EXPIRE_HOURS)
    return jwt.encode(data, _SECRET, algorithm=_ALGORITHM)


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    correo = data.correo.strip().lower()
    with get_db() as cur:
        cur.execute(
            """
            SELECT
                u.nit_empleado,
                u.nombre,
                u.contrasena,
                u.activo,
                u.id_rol,
                r.nombre AS rol
            FROM Usuario u
            JOIN Rol r ON r.id_rol = u.id_rol
            WHERE LOWER(TRIM(u.correo)) = %s
            """,
            (correo,),
        )
        user = cur.fetchone()

    if not user or not bcrypt.verify(data.contrasena, user["contrasena"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if not user["activo"]:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    token = _crear_token({
        "sub": user["nit_empleado"],
        "nombre": user["nombre"],
        "id_rol": user["id_rol"],
        "rol": user["rol"],
    })

    return LoginResponse(
        access_token=token,
        nit_empleado=user["nit_empleado"],
        nombre=user["nombre"],
        id_rol=user["id_rol"],
        rol=user["rol"],
        activo=user["activo"],
    )
