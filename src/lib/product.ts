import type {
  CompositionItem,
  CompositionRow,
  IngredientItem,
  Product,
  Unit,
} from "@/types/product";
import { formatPrice, parseNumber } from "@/lib/format";
import { getProportionalCost } from "@/lib/units";

export function getIngredientTotal(item: IngredientItem): number {
  if (
    item.packagePrice != null &&
    item.packageAmount != null &&
    item.packageUnit != null
  ) {
    return getProportionalCost(
      item.amount,
      item.unit,
      item.packagePrice,
      item.packageAmount,
      item.packageUnit,
    );
  }

  if (item.pricePerUnit != null) {
    return item.amount * item.pricePerUnit;
  }

  return 0;
}

export function formatCatalogPriceLabel(ingredient: {
  packagePrice: number;
  packageAmount: number;
  packageUnit: Unit;
}): string {
  return `${formatPrice(ingredient.packagePrice)} / ${ingredient.packageAmount} ${ingredient.packageUnit}`;
}

export function formatIngredientPriceLabel(item: IngredientItem): string {
  if (
    item.packagePrice != null &&
    item.packageAmount != null &&
    item.packageUnit != null
  ) {
    return formatCatalogPriceLabel({
      packagePrice: item.packagePrice,
      packageAmount: item.packageAmount,
      packageUnit: item.packageUnit,
    });
  }

  if (item.pricePerUnit != null) {
    return `${formatPrice(item.pricePerUnit)} / 1 ${item.unit}`;
  }

  return "—";
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
        pricePerUnitLabel: formatIngredientPriceLabel(item),
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
    packagePrice: parseNumber(data.packagePrice),
    packageAmount: parseNumber(data.packageAmount),
    packageUnit: data.packageUnit,
    catalogIngredientId: data.catalogIngredientId,
  };
}
