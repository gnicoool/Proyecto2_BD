import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { UserCircle2, LogOut } from "lucide-react";
import { ROUTES } from "../../../lib/authRoutes";
import { useAuth } from "../../../hooks/useAuth";

const tabBase =
  "rounded-t-lg border border-transparent border-b-0 px-[1.125rem] pb-3 pt-2.5 text-[0.9375rem] font-bold text-neutral-950 transition-colors duration-150";

function tabClass(isActive: boolean): string {
  return isActive
    ? `${tabBase} relative z-[3] border-neutral-950 border-b-white bg-white`
    : `${tabBase} hover:bg-white/20`;
}

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  return (
    <header
      className={`relative z-[2] box-border flex flex-wrap items-end gap-4 bg-[#5bb0cf] px-6 pb-0 pt-3 font-mono ${isAdmin ? "justify-between" : "justify-end"}`}
    >
      {isAdmin ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-x-6 gap-y-2">
          <Link
            to={ROUTES.categorias}
            className="mb-0.5 mr-1 px-1 pb-3 pt-2 text-base font-bold tracking-wide text-neutral-950 no-underline hover:underline"
          >
            SuperMercado
          </Link>
          <nav className="flex flex-wrap items-end gap-0.5" aria-label="Principal">
            <NavLink to={ROUTES.categorias} className={({ isActive }) => tabClass(isActive)} end>
              Categorías
            </NavLink>
            <NavLink to={ROUTES.productos} className={({ isActive }) => tabClass(isActive)}>
              Productos
            </NavLink>
            <NavLink to={ROUTES.proveedores} className={({ isActive }) => tabClass(isActive)}>
              Proveedores
            </NavLink>
            <NavLink to={ROUTES.empleados} className={({ isActive }) => tabClass(isActive)}>
              Empleados
            </NavLink>
            <NavLink to={ROUTES.informes} className={({ isActive }) => tabClass(isActive)}>
              Informes
            </NavLink>
          </nav>
        </div>
      ) : null}

      <div className="relative shrink-0 pb-[0.35rem]" ref={wrapRef}>
        <button
          type="button"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-700 bg-neutral-400 p-0 font-mono text-[0.8125rem] font-bold text-neutral-900 hover:brightness-105"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Menú de cuenta"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
        >
          <UserCircle2 className="h-6 w-6" aria-hidden />
        </button>
        {menuOpen ? (
          <div
            className="absolute right-0 top-[calc(100%+0.375rem)] z-50 min-w-44 rounded-md border border-neutral-950 bg-white py-1.5 shadow-md"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent px-4 py-2.5 text-left font-mono text-sm font-bold text-neutral-950 hover:bg-neutral-200"
              onClick={handleLogout}
            >
              <span>Cerrar sesión</span>
              <LogOut size={16} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
