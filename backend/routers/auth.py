from fastapi import APIRouter, HTTPException
from passlib.hash import bcrypt
from database import get_db
from schemas.auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

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
                LOWER(TRIM(r.nombre)) AS rol
            FROM Usuario u
            JOIN Rol r ON r.id_rol = u.id_rol
            WHERE LOWER(TRIM(u.correo)) = %s
            """,
            (correo,),
        )
        user = cur.fetchone()

    if not user or not bcrypt.verify(data.contrasena, user["contrasena"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user["activo"]:
        raise HTTPException(status_code=403, detail="User is inactive")

    return LoginResponse(
        nit_empleado=user["nit_empleado"],
        nombre=user["nombre"],
        id_rol=user["id_rol"],
        rol=user["rol"],
        activo=user["activo"],
    )
