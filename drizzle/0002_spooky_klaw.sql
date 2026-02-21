CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`stripePriceId` varchar(255) NOT NULL,
	`tier` enum('starter','pro') NOT NULL,
	`status` enum('active','past_due','canceled','unpaid') NOT NULL,
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
ALTER TABLE `businesses` ADD `subscriptionTier` enum('free','starter','pro') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `businesses` ADD `customBrandingEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `analyticsEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `emailNotificationsEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);