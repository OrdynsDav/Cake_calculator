import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const ingredients = sqliteTable("ingredients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  packagePrice: real("package_price").notNull(),
  packageAmount: real("package_amount").notNull(),
  packageUnit: text("package_unit").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const compositionItems = sqliteTable("composition_items", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["ingredient", "product"] }).notNull(),
  name: text("name"),
  amount: real("amount"),
  unit: text("unit"),
  pricePerUnit: real("price_per_unit"),
  packagePrice: real("package_price"),
  packageAmount: real("package_amount"),
  packageUnit: text("package_unit"),
  catalogIngredientId: text("catalog_ingredient_id").references(
    () => ingredients.id,
    { onDelete: "set null" },
  ),
  refProductId: text("ref_product_id"),
  quantity: real("quantity"),
  sortOrder: integer("sort_order").notNull().default(0),
});
