CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(80),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authorities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`departmentId` int,
	`level` enum('officer','department_head','higher_authority','admin') NOT NULL,
	`title` varchar(160) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authorities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaint_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaintId` int NOT NULL,
	`departmentId` int NOT NULL,
	`officerId` int,
	`assignedById` int,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`unassignedAt` timestamp,
	CONSTRAINT `complaint_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaint_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaintId` int NOT NULL,
	`authorId` int,
	`body` text NOT NULL,
	`isInternal` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complaint_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaint_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaintId` int NOT NULL,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`readableAddress` varchar(240),
	`source` enum('device','search','map','manual') NOT NULL DEFAULT 'manual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complaint_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaint_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaintId` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`mediaType` enum('image','video','document') NOT NULL,
	`originalName` varchar(240),
	`contentType` varchar(120),
	`isPrivate` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complaint_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaint_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaintId` int NOT NULL,
	`status` enum('Submitted','Verified','Assigned','In Progress','Resolved','Citizen Confirmation','Closed','Escalated') NOT NULL,
	`departmentId` int,
	`actorUserId` int,
	`action` varchar(240) NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complaint_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(32) NOT NULL,
	`citizenId` int,
	`categoryId` int NOT NULL,
	`departmentId` int,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
	`status` enum('Submitted','Verified','Assigned','In Progress','Resolved','Citizen Confirmation','Closed','Escalated') NOT NULL DEFAULT 'Submitted',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`address` varchar(240),
	`area` varchar(160),
	`noticedAt` timestamp,
	`isDangerous` int NOT NULL DEFAULT 0,
	`isAtRisk` int NOT NULL DEFAULT 0,
	`slaDeadline` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complaints_id` PRIMARY KEY(`id`),
	CONSTRAINT `complaints_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`code` varchar(48) NOT NULL,
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `escalation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`fromAuthority` varchar(120) NOT NULL,
	`toAuthority` varchar(120) NOT NULL,
	`escalationHours` int NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `escalation_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escalations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaintId` int NOT NULL,
	`ruleId` int,
	`fromAuthority` varchar(120) NOT NULL,
	`toAuthority` varchar(120) NOT NULL,
	`reason` text NOT NULL,
	`status` enum('Open','Acknowledged','Resolved') NOT NULL DEFAULT 'Open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `escalations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `issue_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(140) NOT NULL,
	`icon` varchar(60),
	`defaultDepartmentId` int,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `issue_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `issue_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`complaintId` int,
	`kind` varchar(80) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `safety_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int,
	`type` varchar(120) NOT NULL,
	`location` varchar(240) NOT NULL,
	`description` text NOT NULL,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`isAnonymous` int NOT NULL DEFAULT 1,
	`visibility` enum('private','reviewers','public_aggregate') NOT NULL DEFAULT 'private',
	`status` enum('Received','Reviewing','Resolved','Closed') NOT NULL DEFAULT 'Received',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `safety_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sla_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`priority` enum('Low','Medium','High','Critical') NOT NULL,
	`resolutionHours` int NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sla_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','citizen','officer','higher_authority','admin') NOT NULL DEFAULT 'citizen';--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `authorities` ADD CONSTRAINT `authorities_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `authorities` ADD CONSTRAINT `authorities_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_assignments` ADD CONSTRAINT `complaint_assignments_complaintId_complaints_id_fk` FOREIGN KEY (`complaintId`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_assignments` ADD CONSTRAINT `complaint_assignments_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_assignments` ADD CONSTRAINT `complaint_assignments_officerId_users_id_fk` FOREIGN KEY (`officerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_assignments` ADD CONSTRAINT `complaint_assignments_assignedById_users_id_fk` FOREIGN KEY (`assignedById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_comments` ADD CONSTRAINT `complaint_comments_complaintId_complaints_id_fk` FOREIGN KEY (`complaintId`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_comments` ADD CONSTRAINT `complaint_comments_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_locations` ADD CONSTRAINT `complaint_locations_complaintId_complaints_id_fk` FOREIGN KEY (`complaintId`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_media` ADD CONSTRAINT `complaint_media_complaintId_complaints_id_fk` FOREIGN KEY (`complaintId`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_status_history` ADD CONSTRAINT `complaint_status_history_complaintId_complaints_id_fk` FOREIGN KEY (`complaintId`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_status_history` ADD CONSTRAINT `complaint_status_history_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_status_history` ADD CONSTRAINT `complaint_status_history_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_citizenId_users_id_fk` FOREIGN KEY (`citizenId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_categoryId_issue_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `issue_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalation_rules` ADD CONSTRAINT `escalation_rules_categoryId_issue_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `issue_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalations` ADD CONSTRAINT `escalations_complaintId_complaints_id_fk` FOREIGN KEY (`complaintId`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalations` ADD CONSTRAINT `escalations_ruleId_escalation_rules_id_fk` FOREIGN KEY (`ruleId`) REFERENCES `escalation_rules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `issue_categories` ADD CONSTRAINT `issue_categories_defaultDepartmentId_departments_id_fk` FOREIGN KEY (`defaultDepartmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_complaintId_complaints_id_fk` FOREIGN KEY (`complaintId`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `safety_reports` ADD CONSTRAINT `safety_reports_reporterId_users_id_fk` FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sla_rules` ADD CONSTRAINT `sla_rules_categoryId_issue_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `issue_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_logs` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `authorities_user_idx` ON `authorities` (`userId`);--> statement-breakpoint
CREATE INDEX `authorities_department_idx` ON `authorities` (`departmentId`);--> statement-breakpoint
CREATE INDEX `assignments_complaint_idx` ON `complaint_assignments` (`complaintId`);--> statement-breakpoint
CREATE INDEX `assignments_officer_idx` ON `complaint_assignments` (`officerId`);--> statement-breakpoint
CREATE INDEX `comments_complaint_idx` ON `complaint_comments` (`complaintId`);--> statement-breakpoint
CREATE INDEX `complaint_locations_complaint_idx` ON `complaint_locations` (`complaintId`);--> statement-breakpoint
CREATE INDEX `complaint_media_complaint_idx` ON `complaint_media` (`complaintId`);--> statement-breakpoint
CREATE INDEX `status_history_complaint_idx` ON `complaint_status_history` (`complaintId`);--> statement-breakpoint
CREATE INDEX `status_history_created_idx` ON `complaint_status_history` (`createdAt`);--> statement-breakpoint
CREATE INDEX `complaints_public_id_idx` ON `complaints` (`publicId`);--> statement-breakpoint
CREATE INDEX `complaints_status_idx` ON `complaints` (`status`);--> statement-breakpoint
CREATE INDEX `complaints_category_idx` ON `complaints` (`categoryId`);--> statement-breakpoint
CREATE INDEX `complaints_department_idx` ON `complaints` (`departmentId`);--> statement-breakpoint
CREATE INDEX `complaints_deadline_idx` ON `complaints` (`slaDeadline`);--> statement-breakpoint
CREATE INDEX `complaints_citizen_idx` ON `complaints` (`citizenId`);--> statement-breakpoint
CREATE INDEX `escalations_complaint_idx` ON `escalations` (`complaintId`);--> statement-breakpoint
CREATE INDEX `escalations_status_idx` ON `escalations` (`status`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_created_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `safety_reports_status_idx` ON `safety_reports` (`status`);--> statement-breakpoint
CREATE INDEX `safety_reports_location_idx` ON `safety_reports` (`location`);--> statement-breakpoint
CREATE INDEX `sla_rules_lookup_idx` ON `sla_rules` (`categoryId`,`priority`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);