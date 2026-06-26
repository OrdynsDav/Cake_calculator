"use server";

import { revalidatePath } from "next/cache";
import {
  createCatalogIngredient,
  deleteCatalogIngredient,
  getAllIngredients,
  parseCatalogIngredientFormData,
  updateCatalogIngredient,
} from "@/lib/db/ingredients";
import type {
  CatalogIngredient,
  CatalogIngredientFormData,
} from "@/types/ingredient";
import type { Unit } from "@/types/product";

const UNITS: Unit[] = ["г", "кг", "мл", "л", "шт"];

function revalidate() {
  revalidatePath("/");
  revalidatePath("/ingredients");
}

function isUnit(value: string): value is Unit {
  return UNITS.includes(value as Unit);
}

function parseCatalogInput(
  data: CatalogIngredientFormData,
): CatalogIngredientFormData {
  if (!isUnit(data.packageUnit)) {
    throw new Error("Некорректная единица измерения");
  }

  const parsed = parseCatalogIngredientFormData(data);

  if (!parsed.name) {
    throw new Error("Укажите название ингредиента");
  }

  return parsed;
}

export async function fetchIngredientsAction(): Promise<CatalogIngredient[]> {
  return getAllIngredients();
}

export async function createCatalogIngredientAction(
  data: CatalogIngredientFormData,
): Promise<CatalogIngredient[]> {
  const ingredients = await createCatalogIngredient(parseCatalogInput(data));
  revalidate();
  return ingredients;
}

export async function updateCatalogIngredientAction(
  id: string,
  data: CatalogIngredientFormData,
): Promise<CatalogIngredient[]> {
  const ingredients = await updateCatalogIngredient(
    id,
    parseCatalogInput(data),
  );
  revalidate();
  return ingredients;
}

export async function deleteCatalogIngredientAction(
  id: string,
): Promise<CatalogIngredient[]> {
  const ingredients = await deleteCatalogIngredient(id);
  revalidate();
  return ingredients;
}
