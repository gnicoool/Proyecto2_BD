import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  error?: string | null;
  loading?: boolean;
  children: ReactNode;
};

export function InformeBlock({ title, description, error, loading, children }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      <div className="p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
