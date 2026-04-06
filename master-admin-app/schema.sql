-- Master Admin App Database Schema
-- Generated: 2026-04-06

CREATE TABLE IF NOT EXISTS `departments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `department` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `departmentManager` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `employeeid` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `departments` (`id`, `department`, `departmentManager`, `date`, `employeeid`) VALUES
(1, 'HEMATOLOGY', 'DR. KARIM YUSSIF WEIBADUA', '2025-08-15 17:44:57.221111', 4),
(2, 'SEROLOGY', 'DR. KARIM YUSSIF WEIBADUA', '2025-08-15 18:05:29.515723', 4),
(3, 'MICROBIOLOGY', 'DR. KARIM YUSSIF WEIBADUA', '2025-08-15 18:05:51.200918', 4),
(4, 'CHEMICAL PATHOLOGY', 'DR. KARIM YUSSIF WEIBADUA', '2025-08-15 18:06:06.660580', 4),
(5, 'ENDOCRINOLOGY', 'DR. KARIM YUSSIF WEIBADUA', '2025-08-15 18:06:29.800624', 4),
(6, 'Ultrasound', 'DR. KARIM YUSSIF WEIBADUA', '2025-08-15 18:07:11.969154', 4),
(7, 'PATHOLOGY', 'DR. KARIM YUSSIF WEIBADUA', '2025-10-10 11:50:01.754978', 4);


CREATE TABLE `field_constraints` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `testid` int unsigned NOT NULL,
  `fieldid` int unsigned NOT NULL,
  `action` enum('none','alert','ignore','replace','lock-result') COLLATE utf8mb4_unicode_ci NOT NULL,
  `constraint_type` enum('null','less','greater','match','notmatch','between','contains') COLLATE utf8mb4_unicode_ci NOT NULL,
  `replacement_text` text COLLATE utf8mb4_unicode_ci,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prefix` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suffix` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `test_panels` (
  `prim_key` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `category` int NOT NULL,
  `price` int NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `sample` int NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `sample_container` int NOT NULL,
  `unit` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `qty_required` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `shorttext` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `iscustom` tinyint(1) NOT NULL DEFAULT '0',
  `id` int NOT NULL,
  PRIMARY KEY (`prim_key`),
  UNIQUE KEY `name` (`name`),
  KEY `id` (`id`),
  KEY `name_2` (`name`,`id`)
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `samplecontainer` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `volume_capacity` decimal(10,2) DEFAULT NULL COMMENT 'Capacity in milliliters',
  `material` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Material of the container',
  `color` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Color of the container',
  `is_reusable` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `testconditiondefinitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conditionName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `testId` int NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conditionName` (`conditionName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `testconditions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testId` int NOT NULL,
  `parameter` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `conditionId` int NOT NULL,
  `target` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `inRange` tinyint(1) NOT NULL,
  `createdBy` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updatedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `conditionConstraint` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `testId` (`testId`,`parameter`,`conditionId`,`target`),
  KEY `fk_condition_definitions` (`conditionId`),
  CONSTRAINT `fk_condition_definitions` FOREIGN KEY (`conditionId`) REFERENCES `testconditiondefinitions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `testcreationrules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testid` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `hasunits` tinyint(1) DEFAULT '0',
  `units` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan` enum('input','textReference','options','plain','limits','greaterLess','ultrasoundFields','greaterLessEqualTo','time','date','datetime') COLLATE utf8mb4_unicode_ci NOT NULL,
  `plain` text COLLATE utf8mb4_unicode_ci,
  `ordering` int DEFAULT NULL,
  `isValueTracked` tinyint(1) DEFAULT '0',
  `textReference` text COLLATE utf8mb4_unicode_ci,
  `upperlimit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lowerlimit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `options` text COLLATE utf8mb4_unicode_ci,
  `undercategory` tinyint(1) DEFAULT '0',
  `categoryid` int DEFAULT NULL,
  `valueAlert` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alert` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_test_name` (`testid`,`name`),
  KEY `categoryid` (`categoryid`),
  CONSTRAINT `testcreationrules_ibfk_1` FOREIGN KEY (`testid`) REFERENCES `test_panels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `setupliteraturereview` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `testid` int unsigned NOT NULL,
  `literature` text COLLATE utf8mb4_general_ci,
  `created_on` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_on` datetime(6) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `testdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testid` int DEFAULT NULL,
  `testcost` int DEFAULT NULL,
  `hasManual` int DEFAULT NULL,
  `procedureCode` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pre_Tat` int DEFAULT NULL,
  `tat` int DEFAULT NULL,
  `post_Tat` int DEFAULT NULL,
  `tatCount` int DEFAULT NULL,
  `updatedon` datetime(6) DEFAULT NULL,
  `updatedby` int NOT NULL,
  `isoutsourced` tinyint(1) NOT NULL DEFAULT '0',
  `showtrend` tinyint(1) NOT NULL DEFAULT '0',
  `testprice` int DEFAULT NULL,
  `hasGenderVariation` tinyint(1) NOT NULL DEFAULT '0',
  `hasChildrenLimit` tinyint(1) NOT NULL DEFAULT '0',
  `childrenlimit` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `useLiterature` tinyint(1) DEFAULT '0',
  `hasDrugs` tinyint(1) NOT NULL DEFAULT '0',
  `outSourcingList` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `post_TatEvaluation` enum('min','seconds','hour') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'min',
  `pre_TatEvaluation` enum('min','seconds','hour') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'min',
  `tatEvaluation` enum('min','seconds','hour') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'min',
  `deviceInterfaceMapping` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `reportitle` varchar(300) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `method` varchar(300) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instrumentation` varchar(300) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `testid` (`testid`),
  UNIQUE KEY `testid_2` (`testid`),
  CONSTRAINT `testdetails_chk_1` CHECK (json_valid(`deviceInterfaceMapping`))
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `testdetailcategory` (
  `categoryid` int NOT NULL AUTO_INCREMENT,
  `categoryname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `testid` int NOT NULL,
  `createdby` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `updatedby` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`categoryid`),
  UNIQUE KEY `categoryname` (`categoryname`,`testid`),
  KEY `testid` (`testid`),
  CONSTRAINT `testdetailcategory_ibfk_1` FOREIGN KEY (`testid`) REFERENCES `test_panels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
