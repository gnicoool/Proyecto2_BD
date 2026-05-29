import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm import Session, joinedload

from auth_deps import get_current_user, require_rol
from orm.database import get_session
from orm.models import Cliente, Venta, VentaProducto
from schemas.venta import (
    VentaCabeceraOut,
    VentaCreate,
    VentaDetalleOut,
    VentaProductoLineOut,
)

router = APIRouter(prefix="/ventas", tags=["Ventas"])


def _cabecera(v: Venta) -> VentaCabeceraOut:
    return VentaCabeceraOut(
        id_venta=v.id_venta,
        fecha=v.fecha,
        total=v.total,
        id_cliente=v.id_cliente,
        nit_empleado=v.nit_empleado,
        cliente_nombre=v.cliente.nombre if v.cliente else None,
        empleado_nombre=v.empleado.nombre if v.empleado else None,
    )


def _query_ventas(db: Session):
    return db.query(Venta).options(joinedload(Venta.cliente), joinedload(Venta.empleado))


@router.get("/", response_model=list[VentaCabeceraOut])
def list_ventas(
    _: dict = Depends(require_rol("Admin", "Vendedor", "Contador")),
    db: Session = Depends(get_session),
):
    ventas = _query_ventas(db).order_by(Venta.id_venta.desc()).all()
    return [_cabecera(v) for v in ventas]


@router.get("/mis", response_model=list[VentaCabeceraOut])
def list_mis_ventas(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Ventas del empleado autenticado — NIT extraído del JWT"""
    nit = user["sub"]
    ventas = _query_ventas(db).filter(Venta.nit_empleado == nit).order_by(Venta.id_venta.desc()).all()
    return [_cabecera(v) for v in ventas]


@router.get("/empleado/{nit_empleado}/todas", response_model=list[VentaCabeceraOut])
def list_ventas_por_empleado_admin(
    nit_empleado: str,
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_session),
):
    nit = nit_empleado.strip()
    ventas = _query_ventas(db).filter(Venta.nit_empleado == nit).order_by(Venta.id_venta.desc()).all()
    return [_cabecera(v) for v in ventas]


@router.get("/{id_venta}", response_model=VentaDetalleOut)
def get_venta(
    id_venta: int,
    _: dict = Depends(require_rol("Admin", "Vendedor", "Contador")),
    db: Session = Depends(get_session),
):
    venta = (
        _query_ventas(db)
        .options(joinedload(Venta.lineas).joinedload(VentaProducto.producto))
        .filter(Venta.id_venta == id_venta)
        .first()
    )
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    lineas = [
        VentaProductoLineOut(
            id_producto=lp.id_producto,
            cantidad_venta=lp.cantidad_venta,
            precio_venta=lp.producto.precio_venta,
            nombre=lp.producto.nombre,
        )
        for lp in venta.lineas
    ]
    return VentaDetalleOut(venta=_cabecera(venta), lineas=lineas)


@router.post("/", response_model=VentaDetalleOut, status_code=201)
def create_venta(
    data: VentaCreate,
    _: dict = Depends(require_rol("Admin", "Vendedor")),
    db: Session = Depends(get_session),
):
    if not data.productos:
        raise HTTPException(status_code=400, detail="La venta debe tener al menos un producto")

    id_cliente = None
    if data.nuevo_cliente is not None:
        nuevo = Cliente(nombre=data.nuevo_cliente.nombre, nit=data.nuevo_cliente.nit)
        db.add(nuevo)
        db.flush()
        id_cliente = nuevo.id_cliente
    elif data.id_cliente is not None:
        if not db.query(Cliente).filter(Cliente.id_cliente == data.id_cliente).first():
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        id_cliente = data.id_cliente

    productos_json = json.dumps([
        {"id_producto": p.id_producto, "cantidad": p.cantidad_venta}
        for p in data.productos
    ])

    try:
        result = db.execute(
            text("CALL sp_registrar_venta(:id_c, :nit, :prods::json, NULL, NULL)"),
            {"id_c": id_cliente, "nit": data.nit_empleado, "prods": productos_json},
        )
        row = result.fetchone()
        p_id_venta = row[0]
    except DBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))

    db.commit()

    venta = (
        db.query(Venta)
        .options(
            joinedload(Venta.cliente),
            joinedload(Venta.empleado),
            joinedload(Venta.lineas).joinedload(VentaProducto.producto),
        )
        .filter(Venta.id_venta == p_id_venta)
        .first()
    )
    lineas = [
        VentaProductoLineOut(
            id_producto=lp.id_producto,
            cantidad_venta=lp.cantidad_venta,
            precio_venta=lp.producto.precio_venta,
            nombre=lp.producto.nombre,
        )
        for lp in venta.lineas
    ]
    return VentaDetalleOut(venta=_cabecera(venta), lineas=lineas)
