import { and, asc, eq, max } from "drizzle-orm";
import { getDb } from "@/db";
import { compositionItems, products } from "@/db/schema";
import { createId, parseNumber } from "@/lib/format";
import { createIngredientFromForm } from "@/lib/product";
import type {
  CompositionItem,
  IngredientFormData,
  Product,
  Unit,
} from "@/types/product";

type CompositionItemRow = typeof compositionItems.$inferSelect;

function mapCompositionItem(row: CompositionItemRow): CompositionItem | null {
  if (row.kind === "ingredient") {
    if (
      row.name == null ||
      row.amount == null ||
      row.unit == null ||
      row.pricePerUnit == null
    ) {
      return null;
    }

    return {
      id: row.id,
      kind: "ingredient",
      name: row.name,
      amount: row.amount,
      unit: row.unit as Unit,
      pricePerUnit: row.pricePerUnit,
    };
  }

  if (row.refProductId == null || row.quantity == null) {
    return null;
  }

  return {
    id: row.id,
    kind: "product",
    productId: row.refProductId,
    quantity: row.quantity,
  };
}

function mapProducts(
  productRows: (typeof products.$inferSelect)[],
  itemRows: CompositionItemRow[],
): Product[] {
  const itemsByProductId = new Map<string, CompositionItem[]>();

  for (const row of itemRows) {
    const item = mapCompositionItem(row);
    if (!item) continue;

    const items = itemsByProductId.get(row.productId) ?? [];
    items.push(item);
    itemsByProductId.set(row.productId, items);
  }

  return productRows.map((product) => ({
    id: product.id,
    name: product.name,
    items: itemsByProductId.get(product.id) ?? [],
  }));
}

export function getAllProducts(): Product[] {
  const db = getDb();

  const productRows = db
    .select()
    .from(products)
    .orderBy(asc(products.createdAt))
    .all();

  const itemRows = db
    .select()
    .from(compositionItems)
    .orderBy(asc(compositionItems.sortOrder))
    .all();

  return mapProducts(productRows, itemRows);
}

function getNextSortOrder(productId: string): number {
  const db = getDb();

  const [result] = db
    .select({ value: max(compositionItems.sortOrder) })
    .from(compositionItems)
    .where(eq(compositionItems.productId, productId))
    .all();

  return (result?.value ?? -1) + 1;
}

export function createProduct(name: string): { products: Product[]; createdId: string } {
  const db = getDb();
  const id = createId();

  db.insert(products)
    .values({
      id,
      name: name.trim(),
      createdAt: new Date(),
    })
    .run();

  return { products: getAllProducts(), createdId: id };
}

export function deleteProduct(id: string): Product[] {
  const db = getDb();

  db.transaction((tx) => {
    tx.delete(compositionItems)
      .where(
        and(
          eq(compositionItems.kind, "product"),
          eq(compositionItems.refProductId, id),
        ),
      )
      .run();

    tx.delete(products).where(eq(products.id, id)).run();
  });

  return getAllProducts();
}

export function addIngredient(
  productId: string,
  data: IngredientFormData,
): Product[] {
  const db = getDb();
  const item = createIngredientFromForm(data, createId());

  db.insert(compositionItems)
    .values({
      id: item.id,
      productId,
      kind: "ingredient",
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      sortOrder: getNextSortOrder(productId),
    })
    .run();

  return getAllProducts();
}

export function updateIngredient(
  productId: string,
  itemId: string,
  data: IngredientFormData,
): Product[] {
  const db = getDb();
  const item = createIngredientFromForm(data, itemId);

  db.update(compositionItems)
    .set({
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
    })
    .where(
      and(
        eq(compositionItems.id, itemId),
        eq(compositionItems.productId, productId),
        eq(compositionItems.kind, "ingredient"),
      ),
    )
    .run();

  return getAllProducts();
}

export function addProductRef(
  productId: string,
  refProductId: string,
  quantity: number,
): Product[] {
  const db = getDb();

  db.insert(compositionItems)
    .values({
      id: createId(),
      productId,
      kind: "product",
      refProductId,
      quantity,
      sortOrder: getNextSortOrder(productId),
    })
    .run();

  return getAllProducts();
}

export function removeCompositionItem(
  productId: string,
  itemId: string,
): Product[] {
  const db = getDb();

  db.delete(compositionItems)
    .where(
      and(
        eq(compositionItems.id, itemId),
        eq(compositionItems.productId, productId),
      ),
    )
    .run();

  return getAllProducts();
}

export function parseIngredientFormData(data: IngredientFormData): IngredientFormData {
  return {
    name: data.name.trim(),
    amount: String(parseNumber(data.amount)),
    unit: data.unit,
    pricePerUnit: String(parseNumber(data.pricePerUnit)),
  };
}
