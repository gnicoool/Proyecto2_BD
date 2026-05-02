import { useEffect, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { InformeBlock } from "../../components/tablesinformes/InformeBlock";
import { CatalogoVistaTable } from "../../components/tablesinformes/CatalogoVistaTable";
import { VentasPorCategoriaTable } from "../../components/tablesinformes/VentasPorCategoriaTable";
import { ProductosNuncaVendidosTable } from "../../components/tablesinformes/ProductosNuncaVendidosTable";
import { VentasPorMesTable } from "../../components/tablesinformes/VentasPorMesTable";
import { UltimasLineasVentaTable } from "../../components/tablesinformes/UltimasLineasVentaTable";
import { TopProductosVendidosTable } from "../../components/tablesinformes/TopProductosVendidosTable";
import { ComprasPorMesTable } from "../../components/tablesinformes/ComprasPorMesTable";
import { VentasPorEmpleadoTable } from "../../components/tablesinformes/VentasPorEmpleadoTable";
import type {
  ProductoCatalogoVistaRow,
  VentaPorCategoriaRow,
  ProductoNuncaVendidoRow,
  VentaPorMesRow,
  UltimaLineaVentaRow,
  TopProductoVendidoRow,
  CompraPorMesRow,
  VentaPorEmpleadoRow,
} from "../../types/informes";

type Ok<T> = { ok: true; data: T };
type Fail = { ok: false; message: string };

async function safeInforme<T>(path: string): Promise<Ok<T> | Fail> {
  try {
    const data = await apiClient.get<T>(path);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "No se pudo cargar el informe." };
  }
}

export default function InformesPage() {
  const [loading, setLoading] = useState(true);

  const [catalogo, setCatalogo] = useState<ProductoCatalogoVistaRow[]>([]);
  const [errCatalogo, setErrCatalogo] = useState<string | null>(null);

  const [ventasCategoria, setVentasCategoria] = useState<VentaPorCategoriaRow[]>([]);
  const [errVentasCategoria, setErrVentasCategoria] = useState<string | null>(null);

  const [nuncaVendidos, setNuncaVendidos] = useState<ProductoNuncaVendidoRow[]>([]);
  const [errNuncaVendidos, setErrNuncaVendidos] = useState<string | null>(null);

  const [ventasMes, setVentasMes] = useState<VentaPorMesRow[]>([]);
  const [errVentasMes, setErrVentasMes] = useState<string | null>(null);

  const [ultimasLineas, setUltimasLineas] = useState<UltimaLineaVentaRow[]>([]);
  const [errUltimasLineas, setErrUltimasLineas] = useState<string | null>(null);

  const [topProductos, setTopProductos] = useState<TopProductoVendidoRow[]>([]);
  const [errTopProductos, setErrTopProductos] = useState<string | null>(null);

  const [comprasMes, setComprasMes] = useState<CompraPorMesRow[]>([]);
  const [errComprasMes, setErrComprasMes] = useState<string | null>(null);

  const [ventasEmpleado, setVentasEmpleado] = useState<VentaPorEmpleadoRow[]>([]);
  const [errVentasEmpleado, setErrVentasEmpleado] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      const [
        rCat,
        rVCat,
        rNever,
        rVMes,
        rUlt,
        rTop,
        rCMes,
        rVEmp,
      ] = await Promise.all([
        safeInforme<ProductoCatalogoVistaRow[]>("/informes/catalogo-vista"),
        safeInforme<VentaPorCategoriaRow[]>("/informes/ventas-por-categoria"),
        safeInforme<ProductoNuncaVendidoRow[]>("/informes/productos-nunca-vendidos"),
        safeInforme<VentaPorMesRow[]>("/informes/ventas-por-mes"),
        safeInforme<UltimaLineaVentaRow[]>("/informes/ultimas-lineas-venta"),
        safeInforme<TopProductoVendidoRow[]>("/informes/top-productos-vendidos"),
        safeInforme<CompraPorMesRow[]>("/informes/compras-por-mes"),
        safeInforme<VentaPorEmpleadoRow[]>("/informes/ventas-por-empleado"),
      ]);

      if (cancelled) return;

      if (rCat.ok) {
        setCatalogo(rCat.data);
        setErrCatalogo(null);
      } else {
        setCatalogo([]);
        setErrCatalogo(rCat.message);
      }

      if (rVCat.ok) {
        setVentasCategoria(rVCat.data);
        setErrVentasCategoria(null);
      } else {
        setVentasCategoria([]);
        setErrVentasCategoria(rVCat.message);
      }

      if (rNever.ok) {
        setNuncaVendidos(rNever.data);
        setErrNuncaVendidos(null);
      } else {
        setNuncaVendidos([]);
        setErrNuncaVendidos(rNever.message);
      }

      if (rVMes.ok) {
        setVentasMes(rVMes.data);
        setErrVentasMes(null);
      } else {
        setVentasMes([]);
        setErrVentasMes(rVMes.message);
      }

      if (rUlt.ok) {
        setUltimasLineas(rUlt.data);
        setErrUltimasLineas(null);
      } else {
        setUltimasLineas([]);
        setErrUltimasLineas(rUlt.message);
      }

      if (rTop.ok) {
        setTopProductos(rTop.data);
        setErrTopProductos(null);
      } else {
        setTopProductos([]);
        setErrTopProductos(rTop.message);
      }

      if (rCMes.ok) {
        setComprasMes(rCMes.data);
        setErrComprasMes(null);
      } else {
        setComprasMes([]);
        setErrComprasMes(rCMes.message);
      }

      if (rVEmp.ok) {
        setVentasEmpleado(rVEmp.data);
        setErrVentasEmpleado(null);
      } else {
        setVentasEmpleado([]);
        setErrVentasEmpleado(rVEmp.message);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <header className="mb-10">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-900">Informes</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Informes de ventas, compras y productos del supermercado
        </p>
      </header>

      <div className="flex flex-col gap-10">
        <InformeBlock
          title="Catálogo de productos"
          description="Productos disponibles para venta."
          loading={loading}
          error={errCatalogo}
        >
          <CatalogoVistaTable rows={catalogo} />
        </InformeBlock>

        <InformeBlock
          title="Ventas por categoría"
          description="Costo = cantidad × precio_venta del catálogo y factura promedio por categoría."
          loading={loading}
          error={errVentasCategoria}
        >
          <VentasPorCategoriaTable rows={ventasCategoria} />
        </InformeBlock>

        <InformeBlock
          title="Productos nunca vendidos"
          description="Productos sin ventas."
          loading={loading}
          error={errNuncaVendidos}
        >
          <ProductosNuncaVendidosTable rows={nuncaVendidos} />
        </InformeBlock>

        <InformeBlock
          title="Ventas por mes"
          description="Totales de venta agrupadas por mes"
          loading={loading}
          error={errVentasMes}
        >
          <VentasPorMesTable rows={ventasMes} />
        </InformeBlock>

        <InformeBlock
          title="Compras por mes"
          description="Totales de compra agrupadas por mes."
          loading={loading}
          error={errComprasMes}
        >
          <ComprasPorMesTable rows={comprasMes} />
        </InformeBlock>

        <InformeBlock
          title="Top productos vendidos"
          description="Ranking por unidades; costo aproximado con precio de venta actual."
          loading={loading}
          error={errTopProductos}
        >
          <TopProductosVendidosTable rows={topProductos} />
        </InformeBlock>

        <InformeBlock
          title="Ventas por empleado"
          description="Venta agrupadas por empleado."
          loading={loading}
          error={errVentasEmpleado}
        >
          <VentasPorEmpleadoTable rows={ventasEmpleado} />
        </InformeBlock>

        <InformeBlock
          title="Últimas líneas de venta"
          description="Hasta 80 líneas con cliente y precio unitario del catálogo de productos."
          loading={loading}
          error={errUltimasLineas}
        >
          <UltimasLineasVentaTable rows={ultimasLineas} />
        </InformeBlock>
      </div>
    </div>
  );
}
