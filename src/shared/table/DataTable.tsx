"use client";

import { memo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import "./DataTable.css";

export type DataTableColumnMeta = {
  mobileLabel?: string;
  mobileCellClass?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  emptyMessage?: string;
  footer?: React.ReactNode;
};

function getColumnMeta(meta: unknown): DataTableColumnMeta {
  return (meta as DataTableColumnMeta | undefined) ?? {};
}

function DataTable<T>({
  data,
  columns,
  emptyMessage = "Нет данных",
  footer,
}: DataTableProps<T>) {
  // TanStack Table returns unstable function refs; safe to skip React Compiler memoization.
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable is intentionally used here
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="data-table data-table--responsive">
      <table className="data-table__table">
        <thead className="data-table__head">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="data-table__th">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="data-table__body">
          {rows.length === 0 ? (
            <tr className="data-table__row data-table__row--empty">
              <td className="data-table__empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="data-table__row">
                {row.getVisibleCells().map((cell) => {
                  const meta = getColumnMeta(cell.column.columnDef.meta);

                  return (
                    <td
                      key={cell.id}
                      className={[
                        "data-table__td",
                        meta.mobileCellClass,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-label={meta.mobileLabel ?? ""}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
        {footer && <tfoot className="data-table__foot">{footer}</tfoot>}
      </table>
    </div>
  );
}

export default memo(DataTable) as typeof DataTable;
