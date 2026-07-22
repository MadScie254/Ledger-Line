import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export interface DataTableColumn<TData> {
  key: string;
  header: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  cell: (row: TData) => ReactNode;
}

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  density?: "compact" | "comfortable";
  className?: string;
}

export function DataTable<TData>({ columns, data, getRowId, density = "compact", className }: DataTableProps<TData>) {
  return (
    <div className={cn("overflow-hidden rounded-[8px] border border-slate-200 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-paper-100 text-left text-[11px] uppercase tracking-[0.08em] text-slate-500">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "border-b border-slate-200 px-3 py-2 font-semibold",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={getRowId(row)}
                className={cn(
                  "border-b border-slate-100 last:border-b-0 hover:bg-paper-50",
                  rowIndex % 2 === 1 && "bg-[rgba(237,235,228,0.38)]"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-3 text-ink-900",
                      density === "compact" ? "py-2" : "py-3",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
