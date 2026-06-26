import type { Unit } from "@/types/product";

export type CatalogIngredient = {
  id: string;
  name: string;
  packagePrice: number;
  packageAmount: number;
  packageUnit: Unit;
};

export type CatalogIngredientFormData = {
  name: string;
  packagePrice: string;
  packageAmount: string;
  packageUnit: Unit;
};

export const CUSTOM_CATALOG_OPTION = "__custom__";

export type {
  Unit,
  IngredientFormData,
  IngredientItem,
} from "@/types/product";
