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

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();

  const productRows = await db
    .select()
    .from(products)
    .orderBy(asc(products.createdAt));

  const itemRows = await db
    .select()
    .from(compositionItems)
    .orderBy(asc(compositionItems.sortOrder));

  return mapProducts(productRows, itemRows);
}

async function getNextSortOrder(productId: string): Promise<number> {
  const db = await getDb();

  const [result] = await db
    .select({ value: max(compositionItems.sortOrder) })
    .from(compositionItems)
    .where(eq(compositionItems.productId, productId));

  return (result?.value ?? -1) + 1;
}

export async function createProduct(
  name: string,
): Promise<{ products: Product[]; createdId: string }> {
  const db = await getDb();
  const id = createId();

  await db.insert(products).values({
    id,
    name: name.trim(),
    createdAt: new Date(),
  });

  return { products: await getAllProducts(), createdId: id };
}

export async function deleteProduct(id: string): Promise<Product[]> {
  const db = await getDb();

  await db.transaction(async (tx) => {
    await tx
      .delete(compositionItems)
      .where(
        and(
          eq(compositionItems.kind, "product"),
          eq(compositionItems.refProductId, id),
        ),
      );

    await tx.delete(products).where(eq(products.id, id));
  });

  return getAllProducts();
}

export async function addIngredient(
  productId: string,
  data: IngredientFormData,
): Promise<Product[]> {
  const db = await getDb();
  const item = createIngredientFromForm(data, createId());

  await db.insert(compositionItems).values({
    id: item.id,
    productId,
    kind: "ingredient",
    name: item.name,
    amount: item.amount,
    unit: item.unit,
    pricePerUnit: item.pricePerUnit,
    sortOrder: await getNextSortOrder(productId),
  });

  return getAllProducts();
}

export async function updateIngredient(
  productId: string,
  itemId: string,
  data: IngredientFormData,
): Promise<Product[]> {
  const db = await getDb();
  const item = createIngredientFromForm(data, itemId);

  await db
    .update(compositionItems)
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
    );

  return getAllProducts();
}

export async function addProductRef(
  productId: string,
  refProductId: string,
  quantity: number,
): Promise<Product[]> {
  const db = await getDb();

  await db.insert(compositionItems).values({
    id: createId(),
    productId,
    kind: "product",
    refProductId,
    quantity,
    sortOrder: await getNextSortOrder(productId),
  });

  return getAllProducts();
}

export async function removeCompositionItem(
  productId: string,
  itemId: string,
): Promise<Product[]> {
  const db = await getDb();

  await db
    .delete(compositionItems)
    .where(
      and(
        eq(compositionItems.id, itemId),
        eq(compositionItems.productId, productId),
      ),
    );

  return getAllProducts();
}

export function parseIngredientFormData(
  data: IngredientFormData,
): IngredientFormData {
  return {
    name: data.name.trim(),
    amount: String(parseNumber(data.amount)),
    unit: data.unit,
    pricePerUnit: String(parseNumber(data.pricePerUnit)),
  };
}
