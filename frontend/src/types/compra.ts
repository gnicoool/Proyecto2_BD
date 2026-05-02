export type CompraListaItem = {
  id_compra: number;
  fecha: string;
  total: number | string;
  nit_proveedor: string;
  proveedor_nombre: string;
};

export type CompraLineaDetalle = {
  id_producto: number;
  cantidad_compra: number;
  precio_compra: number | string;
  nombre?: string | null;
};

export type CompraDetalleRespuesta = {
  compra: {
    id_compra: number;
    fecha: string;
    total: number | string;
    nit_proveedor: string;
    proveedor_nombre: string;
  };
  lineas: CompraLineaDetalle[];
};
