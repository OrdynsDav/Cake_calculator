ALTER TABLE `products` ADD `output_grams` real DEFAULT 1000 NOT NULL;
--> statement-breakpoint
ALTER TABLE `composition_items` ADD `amount_grams` real;
