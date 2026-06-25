"use server";

import { revalidatePath } from "next/cache";
import {
  addIngredient as addIngredientToDb,
  addProductRef as addProductRefToDb,
  createProduct as createProductInDb,
  deleteProduct as deleteProductFromDb,
  getAllProducts,
  parseIngredientFormData,
  removeCompositionItem,
  updateIngredient as updateIngredientInDb,
} from "@/lib/db/products";
import type { IngredientFormData, Product, Unit } from "@/types/product";

const UNITS: Unit[] = ["г", "кг", "мл", "л", "шт"];

function revalidate() {
  revalidatePath("/");
}

function isUnit(value: string): value is Unit {
  return UNITS.includes(value as Unit);
}

function parseIngredientInput(data: IngredientFormData): IngredientFormData {
  if (!isUnit(data.unit)) {
    throw new Error("Некорректная единица измерения");
  }

  const parsed = parseIngredientFormData({ ...data, unit: data.unit });

  if (!parsed.name) {
    throw new Error("Укажите название ингредиента");
  }

  return parsed;
}

export async function fetchProductsAction(): Promise<Product[]> {
  return getAllProducts();
}

export async function createProductAction(
  name: string,
): Promise<{ products: Product[]; createdId: string }> {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error("Укажите название изделия");
  }

  const result = await createProductInDb(trimmed);
  revalidate();
  return result;
}

export async function deleteProductAction(id: string): Promise<Product[]> {
  const products = await deleteProductFromDb(id);
  revalidate();
  return products;
}

export async function addIngredientAction(
  productId: string,
  data: IngredientFormData,
): Promise<Product[]> {
  const products = await addIngredientToDb(productId, parseIngredientInput(data));
  revalidate();
  return products;
}

export async function updateIngredientAction(
  productId: string,
  itemId: string,
  data: IngredientFormData,
): Promise<Product[]> {
  const products = await updateIngredientInDb(
    productId,
    itemId,
    parseIngredientInput(data),
  );
  revalidate();
  return products;
}

export async function addProductRefAction(
  productId: string,
  refProductId: string,
  quantity: number,
): Promise<Product[]> {
  if (quantity <= 0) {
    throw new Error("Количество должно быть больше нуля");
  }

  const products = await addProductRefToDb(productId, refProductId, quantity);
  revalidate();
  return products;
}

export async function removeItemAction(
  productId: string,
  itemId: string,
): Promise<Product[]> {
  const products = await removeCompositionItem(productId, itemId);
  revalidate();
  return products;
}
