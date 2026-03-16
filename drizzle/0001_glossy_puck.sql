CREATE TABLE `clinicStaff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('doctor','lab_technician','radiologist','pharmacist') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinicStaff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`ownerUserId` int NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationCode` varchar(6),
	`verificationCodeExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinics_id` PRIMARY KEY(`id`),
	CONSTRAINT `clinics_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `emailLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`type` enum('verification','new_referral','result_uploaded','password_reset') NOT NULL,
	`status` enum('sent','failed') NOT NULL DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`referralId` int NOT NULL,
	`testName` varchar(255) NOT NULL,
	`resultPdfUrl` text,
	`resultPdfKey` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `labResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`staffId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`type` enum('new_referral','result_uploaded','prescription_ready') NOT NULL,
	`referralId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int,
	`gender` enum('male','female'),
	`chronicDiseases` text,
	`medicalHistory` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`referralId` int NOT NULL,
	`medications` text,
	`notes` text,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radiologyReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`referralId` int NOT NULL,
	`examType` varchar(255) NOT NULL,
	`reportPdfUrl` text,
	`reportPdfKey` varchar(255),
	`findings` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `radiologyReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`type` enum('lab_test','radiology','prescription') NOT NULL,
	`description` text,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`assignedToId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `clinicIdIdx` ON `clinicStaff` (`clinicId`);--> statement-breakpoint
CREATE INDEX `emailIdx` ON `clinicStaff` (`email`);--> statement-breakpoint
CREATE INDEX `ownerUserIdIdx` ON `clinics` (`ownerUserId`);--> statement-breakpoint
CREATE INDEX `clinicIdIdx` ON `emailLogs` (`clinicId`);--> statement-breakpoint
CREATE INDEX `clinicIdIdx` ON `labResults` (`clinicId`);--> statement-breakpoint
CREATE INDEX `referralIdIdx` ON `labResults` (`referralId`);--> statement-breakpoint
CREATE INDEX `clinicIdIdx` ON `notifications` (`clinicId`);--> statement-breakpoint
CREATE INDEX `staffIdIdx` ON `notifications` (`staffId`);--> statement-breakpoint
CREATE INDEX `clinicIdIdx` ON `patients` (`clinicId`);--> statement-breakpoint
CREATE INDEX `clinicIdIdx` ON `prescriptions` (`clinicId`);--> statement-breakpoint
CREATE INDEX `referralIdIdx` ON `prescriptions` (`referralId`);--> statement-breakpoint
CREATE INDEX `clinicIdIdx` ON `radiologyReports` (`clinicId`);--> statement-breakpoint
CREATE INDEX `referralIdIdx` ON `radiologyReports` (`referralId`);--> statement-breakpoint
CREATE INDEX `clinicIdIdx` ON `referrals` (`clinicId`);--> statement-breakpoint
CREATE INDEX `patientIdIdx` ON `referrals` (`patientId`);--> statement-breakpoint
CREATE INDEX `doctorIdIdx` ON `referrals` (`doctorId`);--> statement-breakpoint
CREATE INDEX `assignedToIdIdx` ON `referrals` (`assignedToId`);