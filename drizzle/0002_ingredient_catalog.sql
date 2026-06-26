CREATE TABLE `ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`package_price` real NOT NULL,
	`package_amount` real NOT NULL,
	`package_unit` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `composition_items` ADD `catalog_ingredient_id` text REFERENCES ingredients(id) ON UPDATE no action ON DELETE set null;
