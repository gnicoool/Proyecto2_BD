import type { CompraDetalleRespuesta } from "../../types/compra";
import { formatFechaVenta, formatMonto } from "../formato/formatos";
import { buildCsvRow, downloadCsvFile } from "./downloadCsv";

function toNum(v: number | string): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}

export function buildCompraDetalleCsv(data: CompraDetalleRespuesta): string {
  const { compra, lineas } = data;
  const subtotal = lineas.reduce(
    (s, l) => s + toNum(l.precio_compra) * l.cantidad_compra,
    0,
  );

  const lines: string[] = [
    buildCsvRow(["Campo", "Valor"]),
    buildCsvRow(["Tipo documento", "Compra"]),
    buildCsvRow(["ID compra", compra.id_compra]),
    buildCsvRow(["Fecha", formatFechaVenta(String(compra.fecha))]),
    buildCsvRow(["Proveedor", compra.proveedor_nombre]),
    buildCsvRow(["NIT proveedor", compra.nit_proveedor]),
    buildCsvRow(["Subtotal (Q)", formatMonto(subtotal)]),
    buildCsvRow(["Total (Q)", formatMonto(compra.total)]),
    "",
    buildCsvRow([
      "ID producto",
      "Descripcion",
      "Cantidad",
      "Precio unitario compra (Q)",
      "Total linea (Q)",
    ]),
  ];

  for (const ln of lineas) {
    const pu = toNum(ln.precio_compra);
    const totalLinea = pu * ln.cantidad_compra;
    lines.push(
      buildCsvRow([
        ln.id_producto,
        ln.nombre ?? `Producto #${ln.id_producto}`,
        ln.cantidad_compra,
        formatMonto(pu),
        formatMonto(totalLinea),
      ]),
    );
  }

  return lines.join("\r\n");
}

export function downloadCompraDetalleCsv(data: CompraDetalleRespuesta): void {
  const id = data.compra.id_compra;
  downloadCsvFile(`compra-${id}-detalle.csv`, buildCompraDetalleCsv(data));
}
