from fastapi import APIRouter, HTTPException, Query
import psycopg2

from database import get_db
from schemas.marca import MarcaCreate, MarcaGet, MarcaDelete

router = APIRouter(prefix="/marcas", tags=["Marcas"])


@router.get("/", response_model=list[MarcaGet])
def get_marcas():
    with get_db() as cur:
        cur.execute("SELECT * FROM Marca ORDER BY id_marca")
        return cur.fetchall()


@router.post("/", response_model=MarcaGet, status_code=201)
def create_marca (data: MarcaCreate):
    with get_db() as cur:
        cur.execute(
            "INSERT INTO Marca (nombre) VALUES (%s) RETURNING *",
            (data.nombre,),
        )
        return cur.fetchone()


@router.delete("/{id_marca}", response_model=MarcaDelete)
def delete_marca(
    id_marca: int,
    permanent: bool = Query(
        False,
        description="If true, DELETE row; if false, set activo = false (soft delete).",
    ),
):
    with get_db() as cur:
        cur.execute(
            "SELECT id_marca FROM Marca WHERE id_marca = %s",
            (id_marca,),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Marca no encontrada")

        if permanent:
            try:
                cur.execute("DELETE FROM Marca WHERE id_marca = %s", (id_marca,))
            except psycopg2.IntegrityError:
                raise HTTPException(
                    status_code=409,
                    detail="No se puede eliminar: hay productos que usan esta marca",
                )
            return MarcaDelete(accion="eliminado", id_marca=id_marca, activo=None)

        cur.execute(
            "UPDATE Marca SET activo = false WHERE id_marca = %s RETURNING activo",
            (id_marca,),
        )
        row = cur.fetchone()
        return MarcaDelete(
            accion="desactivado",
            id_marca=id_marca,
            activo=row["activo"],
        )
