import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { ingredients } from "@/db/schema";
import { createId, parseNumber } from "@/lib/format";
import type { Unit } from "@/types/product";
import type {
  CatalogIngredient,
  CatalogIngredientFormData,
} from "@/types/ingredient";

type IngredientRow = typeof ingredients.$inferSelect;

function mapIngredient(row: IngredientRow): CatalogIngredient {
  return {
    id: row.id,
    name: row.name,
    packagePrice: row.packagePrice,
    packageAmount: row.packageAmount,
    packageUnit: row.packageUnit as Unit,
  };
}

export async function getAllIngredients(): Promise<CatalogIngredient[]> {
  const db = await getDb();

  const rows = await db
    .select()
    .from(ingredients)
    .orderBy(asc(ingredients.createdAt));

  return rows.map(mapIngredient);
}

export function parseCatalogIngredientFormData(
  data: CatalogIngredientFormData,
): CatalogIngredientFormData {
  const packageAmount = parseNumber(data.packageAmount);

  if (packageAmount <= 0) {
    throw new Error("Укажите количество для расчёта стоимости больше нуля");
  }

  return {
    name: data.name.trim(),
    packagePrice: String(parseNumber(data.packagePrice)),
    packageAmount: String(packageAmount),
    packageUnit: data.packageUnit,
  };
}

export async function createCatalogIngredient(
  data: CatalogIngredientFormData,
): Promise<CatalogIngredient[]> {
  const db = await getDb();
  const id = createId();

  await db.insert(ingredients).values({
    id,
    name: data.name,
    packagePrice: parseNumber(data.packagePrice),
    packageAmount: parseNumber(data.packageAmount),
    packageUnit: data.packageUnit,
    createdAt: new Date(),
  });

  return getAllIngredients();
}

export async function updateCatalogIngredient(
  id: string,
  data: CatalogIngredientFormData,
): Promise<CatalogIngredient[]> {
  const db = await getDb();

  await db
    .update(ingredients)
    .set({
      name: data.name,
      packagePrice: parseNumber(data.packagePrice),
      packageAmount: parseNumber(data.packageAmount),
      packageUnit: data.packageUnit,
    })
    .where(eq(ingredients.id, id));

  return getAllIngredients();
}

export async function deleteCatalogIngredient(
  id: string,
): Promise<CatalogIngredient[]> {
  const db = await getDb();

  await db.delete(ingredients).where(eq(ingredients.id, id));

  return getAllIngredients();
}
