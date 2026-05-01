import type { ReactNode } from "react";

export const INPUT_CLASS =
  "w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 placeholder-sky-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200";

type FieldProps = {
  label: string;
  id: string;
  children: ReactNode;
};

export function Field({ label, id, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-sky-700">
        {label}
      </label>
      {children}
    </div>
  );
}
