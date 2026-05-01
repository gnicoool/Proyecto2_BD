import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { ROUTES } from "../../lib/authRoutes";
import { useAuth } from "../../hooks/useAuth";
import type { LoginResponse } from "../../types/auth";
import type { VentaCabecera } from "../../types/venta";

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-GT", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** API may send Decimal as JSON string */
function formatTotal(total: number | string): string {
  const n = typeof total === "number" ? total : Number.parseFloat(String(total));
  if (Number.isNaN(n)) return "—";
  return n.toFixed(2);
}

function MisVentasContent({ user }: { user: LoginResponse }) {
  const [rows, setRows] = useState<VentaCabecera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const data = await apiClient.get<VentaCabecera[]>("/ventas/mis", {
          headers: {
            "X-NIT-Empleado": user.nit_empleado,
          },
        });
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar las ventas");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.nit_empleado]);

  if (loading) {
    return <p className="text-sm text-gray-600">Cargando ventas…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">
        Mis ventas
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Ventas registradas a tu nombre ({user.nombre} · NIT {user.nit_empleado}).
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-600">
          No hay ventas asignadas.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="px-3 py-2 font-semibold">ID</th>
                <th className="px-3 py-2 font-semibold">Fecha</th>
                <th className="px-3 py-2 font-semibold">Cliente</th>
                <th className="px-3 py-2 font-semibold">Total</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((v) => (
                <tr
                  key={v.id_venta}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="px-3 py-2">{v.id_venta}</td>
                  <td className="px-3 py-2">{formatFecha(v.fecha)}</td>
                  <td className="px-3 py-2">{v.cliente_nombre ?? "—"}</td>
                  <td className="px-3 py-2">Q {formatTotal(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MisVentasPage() {
  const { user, isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to={ROUTES.categorias} replace />;
  }

  if (!user) {
    return null;
  }

  return <MisVentasContent user={user} />;
}