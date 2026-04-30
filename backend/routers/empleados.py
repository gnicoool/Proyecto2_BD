import psycopg2
from passlib.hash import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Query

from auth_deps import require_admin
from constants import ADMIN_ROLE_NAME
from database import get_db
from schemas.empleado import EmpleadoCreate, EmpleadoDelete, EmpleadoGet, EmpleadoUpdate

router = APIRouter(prefix="/empleados", tags=["Empleados"])


def _is_admin_role(nombre_rol: str | None) -> bool:
    if not nombre_rol:
        return False
    return nombre_rol.strip().lower() == ADMIN_ROLE_NAME


@router.get("/", response_model=list[EmpleadoGet])
def list_empleados(
    _: str = Depends(require_admin),
    include_inactive: bool = Query(False, description="Include deactivated users"),
):
    with get_db() as cur:
        if include_inactive:
            cur.execute(
                """
                SELECT u.nit_empleado, u.nombre, u.tel_empleado, u.correo, u.activo, u.id_rol,
                       r.nombre AS nombre_rol,
                       COUNT(v.id_venta)::int AS total_ventas
                FROM Usuario u
                JOIN Rol r ON r.id_rol = u.id_rol
                LEFT JOIN Venta v ON v.nit_empleado = u.nit_empleado
                GROUP BY u.nit_empleado, u.nombre, u.tel_empleado, u.correo, u.activo, u.id_rol, r.nombre
                ORDER BY u.nit_empleado
                """
            )
        else:
            cur.execute(
                """
                SELECT u.nit_empleado, u.nombre, u.tel_empleado, u.correo, u.activo, u.id_rol,
                       r.nombre AS nombre_rol,
                       COUNT(v.id_venta)::int AS total_ventas
                FROM Usuario u
                JOIN Rol r ON r.id_rol = u.id_rol
                LEFT JOIN Venta v ON v.nit_empleado = u.nit_empleado
                WHERE u.activo = true
                GROUP BY u.nit_empleado, u.nombre, u.tel_empleado, u.correo, u.activo, u.id_rol, r.nombre
                ORDER BY u.nit_empleado
                """
            )
        return cur.fetchall()


@router.post("/", response_model=EmpleadoGet, status_code=201)
def create_empleado(
    data: EmpleadoCreate,
    _: str = Depends(require_admin),
):
    pwd_hash = bcrypt.hash(data.contrasena)
    try:
        with get_db() as cur:
            cur.execute("SELECT id_rol FROM Rol WHERE id_rol = %s", (data.id_rol,))
            if not cur.fetchone():
                raise HTTPException(status_code=400, detail="Invalid id_rol")
            cur.execute(
                """
                INSERT INTO Usuario (nit_empleado, nombre, tel_empleado, correo, contrasena, activo, id_rol)
                VALUES (%s, %s, %s, %s, %s, true, %s)
                RETURNING nit_empleado, nombre, tel_empleado, correo, activo, id_rol, 0::int AS total_ventas
                """,
                (
                    data.nit_empleado.strip(),
                    data.nombre,
                    data.tel_empleado,
                    data.correo,
                    pwd_hash,
                    data.id_rol,
                ),
            )
            row = cur.fetchone()
            cur.execute(
                "SELECT nombre FROM Rol WHERE id_rol = %s",
                (row["id_rol"],),
            )
            r = cur.fetchone()
            row["nombre_rol"] = (r["nombre"] if r else "") or ""
            return row
    except psycopg2.IntegrityError:
        raise HTTPException(status_code=409, detail="Duplicate nit_empleado or invalid role reference")


def _load_user_rol(cur, nit: str):
    cur.execute(
        """
        SELECT u.nit_empleado, u.activo, u.id_rol, LOWER(TRIM(r.nombre)) AS rol_nombre
        FROM Usuario u
        JOIN Rol r ON r.id_rol = u.id_rol
        WHERE u.nit_empleado = %s
        """,
        (nit,),
    )
    return cur.fetchone()


def _rol_name_for_id(cur, id_rol: int) -> str | None:
    cur.execute("SELECT LOWER(TRIM(nombre)) AS n FROM Rol WHERE id_rol = %s", (id_rol,))
    r = cur.fetchone()
    return r["n"] if r else None


@router.patch("/{nit_empleado}", response_model=EmpleadoGet)
def update_empleado(
    nit_empleado: str,
    data: EmpleadoUpdate,
    _: str = Depends(require_admin),
):
    nit = nit_empleado.strip()
    payload = data.model_dump(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    with get_db() as cur:
        user = _load_user_rol(cur, nit)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if "id_rol" in payload:
            new_rol = _rol_name_for_id(cur, payload["id_rol"])
            if new_rol is None:
                raise HTTPException(status_code=400, detail="Invalid id_rol")
            if _is_admin_role(user["rol_nombre"]) and new_rol != ADMIN_ROLE_NAME:
                raise HTTPException(
                    status_code=403,
                    detail="Cannot change admin role to a non-admin role",
                )

        if _is_admin_role(user["rol_nombre"]) and payload.get("activo") is False:
            raise HTTPException(status_code=403, detail="Cannot deactivate admin users")

        columns = []
        values: list = []
        for key in ("nombre", "tel_empleado", "correo", "activo", "id_rol"):
            if key in payload:
                columns.append(f"{key} = %s")
                values.append(payload[key])
        values.append(nit)

        cur.execute(
            f"""UPDATE Usuario
                SET {', '.join(columns)}
                WHERE nit_empleado = %s
                RETURNING nit_empleado, nombre, tel_empleado, correo, activo, id_rol""",
            values,
        )
        row = cur.fetchone()
        cur.execute("SELECT COUNT(*)::int AS total_ventas FROM Venta WHERE nit_empleado = %s", (nit,))
        row["total_ventas"] = cur.fetchone()["total_ventas"]
        cur.execute("SELECT nombre FROM Rol WHERE id_rol = %s", (row["id_rol"],))
        r = cur.fetchone()
        row["nombre_rol"] = (r["nombre"] if r else "") or ""
        return row


@router.delete("/{nit_empleado}", response_model=EmpleadoDelete)
def delete_empleado(
    nit_empleado: str,
    _: str = Depends(require_admin),
):
    nit = nit_empleado.strip()
    with get_db() as cur:
        cur.execute(
            """
            SELECT u.nit_empleado, u.activo, r.nombre AS nombre_rol
            FROM Usuario u
            JOIN Rol r ON r.id_rol = u.id_rol
            WHERE u.nit_empleado = %s
            """,
            (nit,),
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if _is_admin_role(user["nombre_rol"]):
            raise HTTPException(status_code=403, detail="Admin users cannot be deleted or deactivated")

        cur.execute(
            "SELECT COUNT(*) AS c FROM Venta WHERE nit_empleado = %s",
            (nit,),
        )
        ventas = cur.fetchone()["c"]

        if ventas == 0:
            cur.execute("DELETE FROM Usuario WHERE nit_empleado = %s RETURNING nit_empleado", (nit,))
            cur.fetchone()
            return EmpleadoDelete(accion="eliminado", nit_empleado=nit, activo=None)

        cur.execute(
            "UPDATE Usuario SET activo = false WHERE nit_empleado = %s RETURNING nit_empleado, activo",
            (nit,),
        )
        row = cur.fetchone()
        return EmpleadoDelete(
            accion="desactivado",
            nit_empleado=row["nit_empleado"],
            activo=row["activo"],
        )
