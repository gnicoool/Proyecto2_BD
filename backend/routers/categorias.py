from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.categoria import CategoriaCreate, CategoriaGet, CategoriaUpdate

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.get("/", response_model=list[CategoriaGet])
def get_categorias():
    with get_db() as cur:
        cur.execute("SELECT * FROM Categoria ORDER BY id_categoria")
        return cur.fetchall()


@router.post("/", response_model=CategoriaGet, status_code=201)
def create_categoria(data: CategoriaCreate):
    with get_db() as cur:
        cur.execute(
            "INSERT INTO Categoria (nombre, descripcion) VALUES (%s, %s) RETURNING *",
            (data.nombre, data.descripcion),
        )
        return cur.fetchone()


@router.patch("/{id_categoria}", response_model=CategoriaGet)
def update_categoria(id_categoria: int, data: CategoriaUpdate):
    fields: list[str] = []
    values: list = []
    if data.nombre is not None:
        fields.append("nombre = %s")
        values.append(data.nombre)
    if data.descripcion is not None:
        fields.append("descripcion = %s")
        values.append(data.descripcion)
    if not fields:
        with get_db() as cur:
            cur.execute(
                "SELECT * FROM Categoria WHERE id_categoria = %s",
                (id_categoria,),
            )
            row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        return row

    values.append(id_categoria)
    with get_db() as cur:
        cur.execute(
            f"UPDATE Categoria SET {', '.join(fields)} WHERE id_categoria = %s RETURNING *",
            tuple(values),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return row
