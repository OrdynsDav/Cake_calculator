"use server";

import { revalidatePath } from "next/cache";
import {
  addIngredient as addIngredientToDb,
  addProductRef as addProductRefToDb,
  createProduct as createProductInDb,
  deleteProduct as deleteProductFromDb,
  getAllDesserts,
  getAllProducts,
  parseIngredientFormData,
  removeCompositionItem,
  updateProductOutputGrams as updateProductOutputGramsInDb,
  updateIngredient as updateIngredientInDb,
} from "@/lib/db/products";
import type { IngredientFormData, Product, ProductType, Unit } from "@/types/product";

const UNITS: Unit[] = ["г", "кг", "мл", "л", "шт"];

function revalidate() {
  revalidatePath("/");
  revalidatePath("/desserts");
  revalidatePath("/ingredients");
}

function isUnit(value: string): value is Unit {
  return UNITS.includes(value as Unit);
}

function parseIngredientInput(data: IngredientFormData): IngredientFormData {
  if (!isUnit(data.unit)) {
    throw new Error("Некорректная единица измерения");
  }

  if (!isUnit(data.packageUnit)) {
    throw new Error("Некорректная единица измерения для стоимости");
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

export async function fetchDessertsAction(): Promise<Product[]> {
  return getAllDesserts();
}

export async function createProductAction(
  name: string,
  type: ProductType = "product",
  outputGrams?: number,
): Promise<{ products: Product[]; createdId: string }> {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error(type === "dessert" ? "Укажите название десерта" : "Укажите название изделия");
  }

  const normalizedOutputGrams = outputGrams ?? 1000;

  if (normalizedOutputGrams <= 0) {
    throw new Error("Укажите выход изделия больше нуля");
  }

  const result = await createProductInDb(trimmed, type, normalizedOutputGrams);
  revalidate();
  return result;
}

export async function deleteProductAction(
  id: string,
  type: ProductType = "product",
): Promise<Product[]> {
  const products = await deleteProductFromDb(id, type);
  revalidate();
  return products;
}

export async function updateProductOutputGramsAction(
  id: string,
  outputGrams: number,
  type: ProductType = "product",
): Promise<Product[]> {
  if (outputGrams <= 0) {
    throw new Error("Укажите выход изделия больше нуля");
  }

  const products = await updateProductOutputGramsInDb(id, outputGrams, type);
  revalidate();
  return products;
}

export async function addIngredientAction(
  productId: string,
  data: IngredientFormData,
  productType: ProductType = "product",
): Promise<Product[]> {
  const products = await addIngredientToDb(
    productId,
    parseIngredientInput(data),
    productType,
  );
  revalidate();
  return products;
}

export async function updateIngredientAction(
  productId: string,
  itemId: string,
  data: IngredientFormData,
  productType: ProductType = "product",
): Promise<Product[]> {
  const products = await updateIngredientInDb(
    productId,
    itemId,
    parseIngredientInput(data),
    productType,
  );
  revalidate();
  return products;
}

export async function addProductRefAction(
  productId: string,
  refProductId: string,
  amount: number,
  productType: ProductType = "product",
): Promise<Product[]> {
  if (amount <= 0) {
    throw new Error(
      productType === "dessert"
        ? "Граммовка должна быть больше нуля"
        : "Количество должно быть больше нуля",
    );
  }

  const products = await addProductRefToDb(
    productId,
    refProductId,
    amount,
    productType,
  );
  revalidate();
  return products;
}

export async function removeItemAction(
  productId: string,
  itemId: string,
  productType: ProductType = "product",
): Promise<Product[]> {
  const products = await removeCompositionItem(productId, itemId, productType);
  revalidate();
  return products;
}
