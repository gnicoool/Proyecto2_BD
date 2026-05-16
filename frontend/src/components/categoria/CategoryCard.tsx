import { createElement } from "react";
import { useNavigate } from "react-router-dom";
import type { Categoria } from "../../types/categoria";
import { getCategoryIcon } from "./CategoryIcons";

type Props = {
  categoria: Categoria;
  productosListPath?: string;
};

export function CategoryCard({ categoria, productosListPath = "/productos" }: Props) {
  const navigate = useNavigate();
  const iconEl = createElement(getCategoryIcon(categoria.nombre), {
    className: "h-10 w-10 shrink-0 text-[#1a6e96]",
    strokeWidth: 1.4,
    "aria-hidden": true,
  });

  const verProductos = () => {
    const params = new URLSearchParams({
      id_categoria: String(categoria.id_categoria),
      nombre: categoria.nombre,
    });
    navigate(`${productosListPath}?${params.toString()}`);
  };

  return (
    <article className="group flex aspect-square max-w-[220px] cursor-default flex-col items-center justify-center rounded-2xl border-0 bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300 p-4 shadow-[0_2px_8px_rgba(100,180,220,0.18)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(80,160,210,0.28)] box-border">
      <div className="flex w-full flex-col items-center justify-center gap-2.5 text-center">
        {iconEl}
        <span className="break-words font-sans text-sm font-bold leading-tight text-[#0d3d55]">
          {categoria.nombre}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            verProductos();
          }}
          className="mt-1 cursor-pointer rounded-full border-0 bg-gradient-to-r from-[#3aadd9] to-[#1a7fa8] px-[0.9rem] py-[0.35rem] font-sans text-xs font-semibold text-white opacity-100 transition-[opacity,transform] duration-150 hover:scale-[1.04] hover:opacity-90"
        >
          Ver productos
        </button>
      </div>
    </article>
  );
}
