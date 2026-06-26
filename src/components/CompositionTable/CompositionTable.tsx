"use client";

import { memo, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, X } from "lucide-react";
import Button from "@/shared/button/Button";
import DataTable from "@/shared/table/DataTable";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import type { CompositionRow } from "@/types/product";
import { formatPrice } from "@/lib/format";
import "./CompositionTable.css";

function CompositionTable() {
  const {
    compositionRows,
    total,
    editingItemId,
    removeItem,
    startEditing,
  } = useProducts();

  const columns = useMemo<ColumnDef<CompositionRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Состав",
        meta: {
          mobileCellClass: "data-table__td--title",
        },
        cell: ({ row }) => (
          <span
            className={
              row.original.id === editingItemId
                ? "composition-table__name composition-table__name--editing"
                : "composition-table__name"
            }
          >
            {row.original.name}
            {row.original.kind === "product" && (
              <span className="composition-table__badge">изделие</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "amountLabel",
        header: "Кол-во",
        meta: {
          mobileLabel: "Кол-во",
        },
        cell: ({ row }) => (
          <span className="data-table__td--numeric">
            {row.original.amountLabel}
          </span>
        ),
      },
      {
        accessorKey: "pricePerUnitLabel",
        header: "Стоимость",
        meta: {
          mobileLabel: "Стоимость",
        },
        cell: ({ row }) => (
          <span className="data-table__td--numeric">
            {row.original.pricePerUnitLabel}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Сумма",
        meta: {
          mobileLabel: "Сумма",
        },
        cell: ({ row }) => (
          <span className="data-table__td--numeric">
            {formatPrice(row.original.total)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        meta: {
          mobileCellClass: "data-table__td--actions",
        },
        cell: ({ row }) => (
          <div className="composition-table__actions">
            {row.original.kind === "ingredient" && (
              <Button
                type="button"
                variant="icon"
                onClick={() => startEditing(row.original.id)}
                aria-label={`Редактировать ${row.original.name}`}
                aria-pressed={row.original.id === editingItemId}
              >
                <Pencil size={16} />
              </Button>
            )}
            <Button
              type="button"
              variant="icon"
              onClick={() => removeItem(row.original.id)}
              aria-label={`Удалить ${row.original.name}`}
            >
              <X size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [editingItemId, removeItem, startEditing],
  );

  const footer = useMemo(
    () =>
      compositionRows.length > 0 ? (
        <tr>
          <td className="data-table__td data-table__foot-summary" colSpan={3}>
            Итого
          </td>
          <td className="data-table__td data-table__foot-spacer" />
          <td className="data-table__td data-table__td--numeric data-table__foot-total">
            {formatPrice(total)}
          </td>
        </tr>
      ) : undefined,
    [compositionRows.length, total],
  );

  return (
    <DataTable
      data={compositionRows}
      columns={columns}
      emptyMessage="Добавьте ингредиенты или готовые изделия через форму выше"
      footer={footer}
    />
  );
}

export default memo(CompositionTable);
