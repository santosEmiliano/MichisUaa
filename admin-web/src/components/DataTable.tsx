import React, { useState, useMemo } from "react";
import Icons from "./Icons";
import type { FilterDef } from "../types/models";

export interface ColumnDef<T> {
  header: string;
  searchKey?: keyof T;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  filters?: FilterDef[];
  rowsPerPage?: number;
  onEdit?: (row: T) => void; 
  onDelete?: (row: T) => void; 
  middleContent?: React.ReactNode;
}

export const DataTable = <T extends object>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  filters = [],
  rowsPerPage = 8,
  onEdit, 
  onDelete, 
  middleContent,
}: DataTableProps<T>) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const searchKeys = columns
    .filter((c) => c.searchKey !== undefined)
    .map((c) => c.searchKey as keyof T);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const pageWindow = () => {
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="w-full space-y-4">
      {/* Buscador y Filtros */}
      <div className="flex flex-col md:flex-row gap-3 bg-card border border-panel p-3 rounded-xl items-center">
        <div className="flex-1 flex items-center gap-3 px-4 bg-gris-oscuro rounded-lg border border-panel h-11 w-full">
          <Icons.Search className="w-4 h-4 text-secondary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="bg-transparent border-none text-main text-sm focus:outline-none w-full placeholder-secondary"
            style={{ caretColor: "var(--accent-orange)" }}
          />
        </div>
        {filters.length > 0 && (
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            {filters.map((f, idx) => (
              <div key={idx} className="relative min-w-max">
                <select
                  className="appearance-none bg-gris-oscuro border border-panel text-secondary text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none cursor-pointer"
                  onChange={() => setPage(1)}
                >
                  <option value="">{f.label}</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <Icons.ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-secondary pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {middleContent && <div>{middleContent}</div>}

      {/* Tabla */}
      <div className="bg-card rounded-xl border border-sidebar-separador overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[780px] border-collapse">
            <thead className="bg-gris border-b border-sidebar-separador">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-4 text-[15px] font-bold text-sidebar-secundario whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-4 text-[15px] font-bold text-sidebar-secundario text-center whitespace-nowrap">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-6 py-14 text-center text-secondary text-sm"
                  >
                    No se encontraron resultados para "{query}".
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-sidebar-separador last:border-0 text-[15px] hover-bg-item transition-colors ${i % 2 === 0 ? "bg-card" : "bg-gris-oscuro"}`}
                  >
                    {columns.map((col, j) => (
                      <td key={j} className="px-6 py-4">
                        {col.render(row)}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <ActionButton
                            color="var(--accent-orange)"
                            title="Editar"
                            onClick={() => onEdit?.(row)}
                          >
                            <Icons.Edit className="w-5 h-5" />
                          </ActionButton>
                          <ActionButton
                            color="var(--metrica-rojo)"
                            title="Eliminar"
                            onClick={() => onDelete?.(row)}
                          >
                            <Icons.Trash2 className="w-5 h-5" />
                          </ActionButton>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <PageBtn
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            &lt;
          </PageBtn>
          {pageWindow().map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              style={
                n === safePage
                  ? { background: "var(--accent-orange)", color: "#fff" }
                  : { color: "var(--text-secondary)" }
              }
            >
              {n}
            </button>
          ))}
          <PageBtn
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            &gt;
          </PageBtn>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({
  color,
  title,
  children,
  onClick,
}: {
  color: string;
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    title={title}
    onClick={onClick} 
    className="p-2 rounded-lg border transition-colors"
    style={{ borderColor: color, color }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLButtonElement;
      el.style.background = color;
      el.style.color = "#fff";
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLButtonElement;
      el.style.background = "transparent";
      el.style.color = color;
    }}
  >
    {children}
  </button>
);

const PageBtn = ({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-8 h-8 rounded-lg text-sm text-secondary hover-bg-item disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
  >
    {children}
  </button>
);
