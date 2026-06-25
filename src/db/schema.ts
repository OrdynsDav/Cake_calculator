import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
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
  refProductId: text("ref_product_id"),
  quantity: real("quantity"),
  sortOrder: integer("sort_order").notNull().default(0),
});
