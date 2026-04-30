from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import database
from routers import categorias, productos, empleados, proveedores, ventas, compras, informes, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_pool()
    yield
    database.close_pool()


app = FastAPI(title="BD Proyecto 2 API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(empleados.router)
app.include_router(proveedores.router)
app.include_router(ventas.router)
app.include_router(compras.router)
app.include_router(informes.router)
app.include_router(auth.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok"}
