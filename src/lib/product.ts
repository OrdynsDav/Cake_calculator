import type {
  CompositionItem,
  CompositionRow,
  IngredientItem,
  Product,
} from "@/types/product";
import { formatPrice, parseNumber } from "@/lib/format";

export function getIngredientTotal(item: IngredientItem): number {
  return item.amount * item.pricePerUnit;
}

export function getProductTotal(
  productId: string,
  productsById: Map<string, Product>,
  stack: string[] = [],
): number {
  if (stack.includes(productId)) return 0;

  const product = productsById.get(productId);
  if (!product) return 0;

  return product.items.reduce((sum, item) => {
    if (item.kind === "ingredient") {
      return sum + getIngredientTotal(item);
    }

    const nestedTotal = getProductTotal(
      item.productId,
      productsById,
      [...stack, productId],
    );

    return sum + nestedTotal * item.quantity;
  }, 0);
}

export function buildCompositionRows(
  items: CompositionItem[],
  productsById: Map<string, Product>,
  ownerProductId: string,
): CompositionRow[] {
  return items.map((item) => {
    if (item.kind === "ingredient") {
      const total = getIngredientTotal(item);

      return {
        id: item.id,
        kind: item.kind,
        name: item.name,
        amountLabel: `${item.amount} ${item.unit}`,
        pricePerUnitLabel: formatPrice(item.pricePerUnit),
        total,
      };
    }

    const nestedProduct = productsById.get(item.productId);
    const unitTotal = getProductTotal(item.productId, productsById, [
      ownerProductId,
    ]);
    const total = unitTotal * item.quantity;

    return {
      id: item.id,
      kind: item.kind,
      name: nestedProduct?.name ?? "Удалённое изделие",
      amountLabel: `${item.quantity} шт`,
      pricePerUnitLabel: formatPrice(unitTotal),
      total,
    };
  });
}

export function createIngredientFromForm(
  data: import("@/types/product").IngredientFormData,
  id: string,
): IngredientItem {
  return {
    id,
    kind: "ingredient",
    name: data.name.trim(),
    amount: parseNumber(data.amount),
    unit: data.unit,
    pricePerUnit: parseNumber(data.pricePerUnit),
  };
}
