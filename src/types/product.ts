export type Unit = "г" | "кг" | "мл" | "л" | "шт";

export type IngredientFormData = {
  name: string;
  amount: string;
  unit: Unit;
  packagePrice: string;
  packageAmount: string;
  packageUnit: Unit;
  catalogIngredientId?: string;
};

export type IngredientItem = {
  id: string;
  kind: "ingredient";
  name: string;
  amount: number;
  unit: Unit;
  packagePrice?: number;
  packageAmount?: number;
  packageUnit?: Unit;
  catalogIngredientId?: string;
  /** @deprecated legacy: цена за 1 ед. изм. */
  pricePerUnit?: number;
};

export type ProductRefItem = {
  id: string;
  kind: "product";
  productId: string;
  quantity: number;
};

export type CompositionItem = IngredientItem | ProductRefItem;

export type Product = {
  id: string;
  name: string;
  items: CompositionItem[];
};

export type AppState = {
  products: Product[];
  activeProductId: string | null;
};

export type CompositionRow = {
  id: string;
  kind: CompositionItem["kind"];
  name: string;
  amountLabel: string;
  pricePerUnitLabel: string;
  total: number;
};
