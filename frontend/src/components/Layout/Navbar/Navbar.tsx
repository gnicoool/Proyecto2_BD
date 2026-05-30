import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { UserCircle2, LogOut, ShoppingCart } from "lucide-react";
import { ROUTES } from "../../../lib/authRoutes";
import { useAuth } from "../../../hooks/useAuth";
import { useNuevaVentaDraftOptional } from "../../../context/useNuevaVentaDraft";

const tabBase =
  "rounded-t-lg border border-transparent border-b-0 px-[1.125rem] pb-3 pt-2.5 text-[0.9375rem] font-bold text-neutral-950 transition-colors duration-150";

function tabClass(isActive: boolean): string {
  return isActive
    ? `${tabBase} relative z-[3] border-neutral-950 border-b-white bg-white`
    : `${tabBase} hover:bg-white/20`;
}

// Definición de todas las pestañas y qué roles pueden verlas
const ALL_TABS = [
  // Admin, Contador y Supervisor (Vendedor usa Mis Ventas + carrito)
  { label: "Ventas",      to: ROUTES.ventas,      roles: ["Admin", "Contador", "Supervisor"] },
  { label: "Mis Ventas",  to: ROUTES.misVentas,   roles: ["Vendedor"] },
  // Vendedor — tienda con carrito
  { label: "Categorías",  to: ROUTES.tiendaCategorias, roles: ["Vendedor"] },
  { label: "Marcas",      to: ROUTES.tiendaMarcas,     roles: ["Vendedor"] },
  { label: "Productos",   to: ROUTES.tiendaProductos,  roles: ["Vendedor"] },
  // Bodeguero
  { label: "Compras",     to: ROUTES.compras,     roles: ["Admin", "Bodeguero", "Contador", "Supervisor"] },
  // Bodeguero/Supervisor/Contador: ver; Admin/Supervisor: gestionar
  { label: "Productos",   to: ROUTES.productos,   roles: ["Admin", "Bodeguero", "Supervisor", "Contador"] },
  // Supervisor gestiona; Contador solo consulta
  { label: "Proveedores", to: ROUTES.proveedores, roles: ["Admin", "Supervisor", "Contador"] },
  // Admin gestiona; demás roles con SELECT en roles.sql solo consultan
  { label: "Categorías",  to: ROUTES.categorias,  roles: ["Admin", "Bodeguero", "Supervisor", "Contador"] },
  { label: "Marcas",      to: ROUTES.marcas,      roles: ["Admin", "Bodeguero", "Supervisor", "Contador"] },
  // Supervisor ver empleados
  { label: "Empleados",   to: ROUTES.empleados,   roles: ["Admin", "Supervisor"] },
  // Contador y Supervisor
  { label: "Informes",    to: ROUTES.informes,    roles: ["Admin", "Contador", "Supervisor"] },
] as const;

export function Navbar() {
  const { user, rol, isVendedor, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const draft = useNuevaVentaDraftOptional();
  const cartUnits = isVendedor ? draft?.totalUnidades ?? 0 : 0;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate(ROUTES.login, { replace: true });
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const id = window.setTimeout(() => {
      document.addEventListener("click", onDocClick);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("click", onDocClick);
    };
  }, [menuOpen]);

  if (!user) return null;

  const visibleTabs = ALL_TABS.filter((t) => (t.roles as readonly string[]).includes(rol));

  return (
    <header className="relative z-[2] box-border flex flex-wrap items-end justify-between gap-4 bg-[#5bb0cf] px-6 pb-0 pt-3 font-sans">
      {visibleTabs.length > 0 ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-x-6 gap-y-2">
          <Link
            to="/"
            className="mb-0.5 mr-1 px-1 pb-3 pt-2 text-base font-bold tracking-wide text-neutral-950 no-underline hover:underline"
          >
            SuperMercado
          </Link>
          <nav className="flex flex-wrap items-end gap-0.5" aria-label="Principal">
            {visibleTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) => tabClass(isActive)}
              >
                {tab.label}
              </NavLink>
            ))}
            {isVendedor ? (
              <Link
                to={ROUTES.misVentas}
                state={{ finalizeSale: true }}
                className="relative mb-0.5 inline-flex items-center gap-1.5 rounded-t-lg border border-transparent border-b-0 px-3 pb-3 pt-2.5 text-[0.9375rem] font-bold text-neutral-950 hover:bg-white/20"
                aria-label="Finalizar venta con el carrito"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden />
                {cartUnits > 0 ? (
                  <span className="absolute right-0.5 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {cartUnits > 99 ? "99+" : cartUnits}
                  </span>
                ) : null}
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}

      {/* Menú de cuenta (nombre + logout) */}
      <div className="relative shrink-0 pb-[0.35rem]" ref={wrapRef}>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-900 hover:bg-white/30 transition-colors"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
        >
          <UserCircle2 className="h-6 w-6" aria-hidden />
          <span className="hidden sm:inline">{user.nombre}</span>
          <span className="rounded bg-white/40 px-1.5 py-0.5 text-xs">{user.rol}</span>
        </button>

        {menuOpen ? (
          <div
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-2 shadow-lg"
            role="menu"
          >
            <div className="border-b border-neutral-100 px-4 py-2">
              <p className="text-xs text-neutral-400">Sesión iniciada como</p>
              <p className="truncate text-sm font-medium text-neutral-800">{user.nombre}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              onClick={handleLogout}
            >
              <span>Cerrar sesión</span>
              <LogOut size={16} className="opacity-70" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
