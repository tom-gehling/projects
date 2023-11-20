USE db_name;
SET default_storage_engine = INNODB;
-- User Table
CREATE TABLE IF NOT EXISTS `User` (
	`user_id` CHAR(36) NOT NULL DEFAULT (uuid()),
	`email` varchar(255) NOT NULL,
	`github_id` varchar(60) DEFAULT NULL,
	`first_name` varchar(30) NOT NULL,
	`last_name` varchar(30) NOT NULL,
	`password` varchar(60) NOT NULL,
	`picture_url` varchar(255) DEFAULT NULL,
	`phone_number` varchar(15) DEFAULT NULL,
	`notification_settings` json NOT NULL DEFAULT ('{}'),
	`status` boolean NOT NULL DEFAULT 1,
	`system_admin` boolean NOT NULL DEFAULT 0,
	`birth_date` date DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`user_id`),
	UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB;
CREATE INDEX idx_user_email ON User(email);
-- Posts Table
CREATE TABLE IF NOT EXISTS `Post` (
	`post_id` CHAR(36) NOT NULL DEFAULT (uuid()),
	`author_id` CHAR(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` boolean NOT NULL DEFAULT 1,
	`club_id` CHAR(36) NOT NULL,
	`event_id` CHAR(36) DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`post_id`),
	FOREIGN KEY (`author_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;
CREATE INDEX idx_post_title ON Post(title);
-- Club Table
CREATE TABLE IF NOT EXISTS `Club` (
	`club_id` CHAR(36) NOT NULL DEFAULT (uuid()),
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`private` boolean NOT NULL DEFAULT 0,
	`status` boolean NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`club_id`)
) ENGINE = InnoDB;
-- Event Table
CREATE TABLE IF NOT EXISTS `Event` (
	`event_id` CHAR(36) NOT NULL DEFAULT (uuid()),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`location` json NOT NULL DEFAULT ('{ "lat": null, "lng": null }'),
	`start_time` timestamp NOT NULL,
	`end_time` timestamp NOT NULL,
	`status` boolean NOT NULL DEFAULT 1,
	`privacy` ENUM("public", "member", "private") NOT NULL DEFAULT("public"),
	`club_id` CHAR(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`event_id`),
	FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;
-- Club Members Table
CREATE TABLE IF NOT EXISTS `ClubUser` (
	`club_id` CHAR(36) NOT NULL,
	`user_id` CHAR(36) NOT NULL,
	`role` ENUM("member", "admin") NOT NULL DEFAULT "member",
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`club_id`, `user_id`),
	FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;
-- Event Members Table
CREATE TABLE IF NOT EXISTS `EventUser` (
	`event_id` CHAR(36) NOT NULL,
	`user_id` CHAR(36) NOT NULL,
	`rsvp` ENUM("none", "interested", "going") NOT NULL DEFAULT "none",
	`notified_status` boolean NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`event_id`, `user_id`),
	UNIQUE KEY `event_user` (`event_id`, `user_id`),
	FOREIGN KEY (`event_id`) REFERENCES `Event`(`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;
-- session table
CREATE TABLE IF NOT EXISTS `sessions` (
	`session_id` varchar(128) COLLATE utf8mb4_bin NOT NULL,
	`expires` int(11) unsigned NOT NULL,
	`data` text COLLATE utf8mb4_bin,
	PRIMARY KEY (`session_id`)
) ENGINE = InnoDB;
-- Club Join Requests Table
CREATE TABLE IF NOT EXISTS `ClubRequest` (
	`request_id` CHAR(36) NOT NULL DEFAULT (uuid()),
	`user_id` CHAR(36) NOT NULL,
	`club_id` CHAR(36) NOT NULL,
	`state` ENUM("pending", "approved", "denied") NOT NULL DEFAULT "pending",
	`status` boolean NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`request_id`),
	FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;
-- Club Invitations Table
CREATE TABLE IF NOT EXISTS `ClubInvite` (
	`invite_id` CHAR(36) NOT NULL DEFAULT (uuid()),
	`admin_id` CHAR(36) NOT NULL,
	`user_id` CHAR(36) NOT NULL,
	`club_id` CHAR(36) NOT NULL,
	`state` ENUM("pending", "accepted", "rejected") NOT NULL DEFAULT "pending",
	`status` boolean NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`invite_id`),
	FOREIGN KEY (`admin_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;
-- Notification Table
CREATE TABLE IF NOT EXISTS `Notification` (
	`notification_id` CHAR(36) NOT NULL DEFAULT (uuid()),
	`user_id` CHAR(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`read_status` boolean NOT NULL DEFAULT 0,
	`status` boolean NOT NULL DEFAULT 1,
	`picture_url` varchar(255) DEFAULT NULL,
	`type` varchar(50) NOT NULL,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`notification_id`),
	FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;