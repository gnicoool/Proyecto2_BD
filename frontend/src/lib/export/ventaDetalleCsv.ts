import type { VentaDetalleRespuesta } from "../../types/venta";
import { formatFechaVenta, formatMonto } from "../formato/formatos";
import { buildCsvRow, downloadCsvFile } from "./downloadCsv";

function toNum(v: number | string): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}

export function buildVentaDetalleCsv(data: VentaDetalleRespuesta): string {
  const { venta, lineas } = data;
  const subtotal = lineas.reduce(
    (s, l) => s + toNum(l.precio_venta) * l.cantidad_venta,
    0,
  );

  const lines: string[] = [
    buildCsvRow(["Campo", "Valor"]),
    buildCsvRow(["Tipo documento", "Venta"]),
    buildCsvRow(["ID venta", venta.id_venta]),
    buildCsvRow(["Fecha", formatFechaVenta(String(venta.fecha))]),
    buildCsvRow(["Cliente", venta.cliente_nombre ?? "Consumidor final"]),
    buildCsvRow(["Vendedor", venta.empleado_nombre ?? ""]),
    buildCsvRow(["Subtotal (Q)", formatMonto(subtotal)]),
    buildCsvRow(["Total (Q)", formatMonto(venta.total)]),
    "",
    buildCsvRow([
      "ID producto",
      "Descripcion",
      "Cantidad",
      "Precio unitario (Q)",
      "Total linea (Q)",
    ]),
  ];

  for (const ln of lineas) {
    const pu = toNum(ln.precio_venta);
    const totalLinea = pu * ln.cantidad_venta;
    lines.push(
      buildCsvRow([
        ln.id_producto,
        ln.nombre ?? `Producto #${ln.id_producto}`,
        ln.cantidad_venta,
        formatMonto(pu),
        formatMonto(totalLinea),
      ]),
    );
  }

  return lines.join("\r\n");
}

export function downloadVentaDetalleCsv(data: VentaDetalleRespuesta): void {
  const id = data.venta.id_venta;
  downloadCsvFile(`venta-${id}-detalle.csv`, buildVentaDetalleCsv(data));
}
