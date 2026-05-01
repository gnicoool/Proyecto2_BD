from fastapi import APIRouter, Depends, HTTPException, Query

from auth_deps import require_admin_nit
from database import get_db
from schemas.proveedor import ProveedorCreate, ProveedorDelete, ProveedorGet, ProveedorUpdate

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])


@router.get("/", response_model=list[ProveedorGet])
def get_proveedores(
    _: str = Depends(require_admin_nit),
    include_inactive: bool = Query(False, description="Include suppliers marked inactive"),
):
    with get_db() as cur:
        if include_inactive:
            cur.execute(
                """
                SELECT p.nit_proveedor, p.nombre, p.correo, p.tel_proveedor, p.activo,
                       COUNT(c.id_compra)::int AS total_compras
                FROM Proveedor p
                LEFT JOIN Compra c ON c.nit_proveedor = p.nit_proveedor
                GROUP BY p.nit_proveedor, p.nombre, p.correo, p.tel_proveedor, p.activo
                ORDER BY p.nit_proveedor
                """,
            )
        else:
            cur.execute(
                """
                SELECT p.nit_proveedor, p.nombre, p.correo, p.tel_proveedor, p.activo,
                       COUNT(c.id_compra)::int AS total_compras
                FROM Proveedor p
                LEFT JOIN Compra c ON c.nit_proveedor = p.nit_proveedor
                WHERE p.activo = true
                GROUP BY p.nit_proveedor, p.nombre, p.correo, p.tel_proveedor, p.activo
                ORDER BY p.nit_proveedor
                """,
            )
        return cur.fetchall()


@router.post("/", response_model=ProveedorGet, status_code=201)
def create_proveedor(
    data: ProveedorCreate,
    _: str = Depends(require_admin_nit),
):
    with get_db() as cur:
        cur.execute(
            """
            INSERT INTO Proveedor (nit_proveedor, nombre, correo, tel_proveedor, activo)
            VALUES (%s, %s, %s, %s, true)
            RETURNING nit_proveedor, nombre, correo, tel_proveedor, activo, 0::int AS total_compras
            """,
            (data.nit_proveedor.strip(), data.nombre, data.correo, data.tel_proveedor),
        )
        return cur.fetchone()


@router.patch("/{nit_proveedor}", response_model=ProveedorGet)
def update_proveedor(
    nit_proveedor: str,
    data: ProveedorUpdate,
    _: str = Depends(require_admin_nit),
):
    nit = nit_proveedor.strip()
    payload = data.model_dump(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    columns = []
    values: list = []
    for key in ("nombre", "correo", "tel_proveedor", "activo"):
        if key in payload:
            columns.append(f"{key} = %s")
            values.append(payload[key])
    values.append(nit)

    with get_db() as cur:
        cur.execute(
            f"""UPDATE Proveedor
                SET {', '.join(columns)}
                WHERE nit_proveedor = %s
                RETURNING nit_proveedor, nombre, correo, tel_proveedor, activo""",
            values,
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Proveedor not found")
        cur.execute("SELECT COUNT(*)::int AS total_compras FROM Compra WHERE nit_proveedor = %s", (nit,))
        row["total_compras"] = cur.fetchone()["total_compras"]
        return row


@router.delete("/{nit_proveedor}", response_model=ProveedorDelete)
def delete_proveedor(
    nit_proveedor: str,
    _: str = Depends(require_admin_nit),
):
    nit = nit_proveedor.strip()
    with get_db() as cur:
        cur.execute(
            "SELECT nit_proveedor FROM Proveedor WHERE nit_proveedor = %s",
            (nit,),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Proveedor not found")

        cur.execute(
            "SELECT COUNT(*) AS c FROM Compra WHERE nit_proveedor = %s",
            (nit,),
        )
        compras = cur.fetchone()["c"]

        if compras == 0:
            cur.execute("DELETE FROM Proveedor WHERE nit_proveedor = %s RETURNING nit_proveedor", (nit,))
            cur.fetchone()
            return ProveedorDelete(accion="eliminado", nit_proveedor=nit, activo=None)

        cur.execute(
            "UPDATE Proveedor SET activo = false WHERE nit_proveedor = %s RETURNING nit_proveedor, activo",
            (nit,),
        )
        row = cur.fetchone()
        return ProveedorDelete(
            accion="desactivado",
            nit_proveedor=row["nit_proveedor"],
            activo=row["activo"],
        )
