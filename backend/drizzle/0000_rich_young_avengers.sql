CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`expense_type` text NOT NULL,
	`payment_type` text NOT NULL,
	`transport_card_id` integer,
	`driver_id` integer,
	`date_time` text NOT NULL,
	`amount` integer NOT NULL,
	`comment` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`transport_card_id`) REFERENCES `transport_cards`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`module` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_code_unique` ON `permissions` (`code`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer NOT NULL,
	`permission_id` integer NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `deliveries` ADD `notify_client` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `notify_driver` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `payer_phone` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `receiver_phone` text;--> statement-breakpoint
ALTER TABLE `transport_cards` ADD `status` text DEFAULT 'active' NOT NULL;