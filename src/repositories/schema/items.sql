CREATE TABLE `items` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT ('public') NOT NULL,
	`created_at` text DEFAULT (DATETIME('now', 'localtime')) NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
