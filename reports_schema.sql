-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: laapak_report_system
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__migrations__`
--

DROP TABLE IF EXISTS `__migrations__`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__migrations__` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('milestone','record','streak','custom') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'milestone',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `metric` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` int NOT NULL,
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'fas fa-trophy',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#007553',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `achievedAt` timestamp NULL DEFAULT NULL,
  `createdBy` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_isActive` (`isActive`),
  KEY `idx_achievedAt` (`achievedAt`)
) ENGINE=InnoDB AUTO_INCREMENT=300 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','superadmin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'admin',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_keys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key_name` varchar(255) NOT NULL COMMENT 'Human-readable name for the API key',
  `api_key` varchar(255) NOT NULL COMMENT 'Hashed API key',
  `key_prefix` varchar(20) NOT NULL COMMENT 'Key prefix (e.g., ak_live_, ak_test_)',
  `client_id` int DEFAULT NULL COMMENT 'Associated client (optional for client-specific keys)',
  `permissions` json NOT NULL COMMENT 'JSON object defining API key permissions',
  `rate_limit` int NOT NULL DEFAULT '1000' COMMENT 'Requests per hour limit',
  `expires_at` datetime DEFAULT NULL COMMENT 'Optional expiration date',
  `last_used` datetime DEFAULT NULL COMMENT 'Last usage timestamp',
  `usage_count` int NOT NULL DEFAULT '0' COMMENT 'Total usage count',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Enable/disable key',
  `created_by` int NOT NULL COMMENT 'Admin who created this key',
  `ip_whitelist` text COMMENT 'Comma-separated list of allowed IP addresses',
  `description` text COMMENT 'Description of the API key purpose',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_key` (`api_key`),
  KEY `created_by` (`created_by`),
  KEY `api_keys_api_key` (`api_key`),
  KEY `api_keys_client_id` (`client_id`),
  KEY `api_keys_is_active` (`is_active`),
  KEY `api_keys_expires_at` (`expires_at`),
  CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `api_keys_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `api_usage_logs`
--

DROP TABLE IF EXISTS `api_usage_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_usage_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `api_key_id` int NOT NULL,
  `endpoint` varchar(255) NOT NULL COMMENT 'API endpoint accessed',
  `method` enum('GET','POST','PUT','DELETE','PATCH') NOT NULL COMMENT 'HTTP method used',
  `client_ip` varchar(45) NOT NULL COMMENT 'Client IP address',
  `user_agent` text COMMENT 'User agent string',
  `response_status` int NOT NULL COMMENT 'HTTP response status code',
  `response_time` int NOT NULL COMMENT 'Response time in milliseconds',
  `request_size` int DEFAULT NULL COMMENT 'Request size in bytes',
  `response_size` int DEFAULT NULL COMMENT 'Response size in bytes',
  `error_message` text COMMENT 'Error message if request failed',
  `request_data` json DEFAULT NULL COMMENT 'Request data (for debugging, limited size)',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `api_usage_logs_api_key_id` (`api_key_id`),
  KEY `api_usage_logs_endpoint` (`endpoint`),
  KEY `api_usage_logs_response_status` (`response_status`),
  KEY `api_usage_logs_created_at` (`created_at`),
  KEY `api_usage_logs_client_ip` (`client_ip`),
  CONSTRAINT `api_usage_logs_ibfk_1` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `budget_allocations`
--

DROP TABLE IF EXISTS `budget_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_allocations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `month_year` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `allocated_amount` decimal(10,2) NOT NULL,
  `spent_amount` decimal(10,2) DEFAULT '0.00',
  `remaining_amount` decimal(10,2) GENERATED ALWAYS AS ((`allocated_amount` - `spent_amount`)) STORED,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_month` (`category_id`,`month_year`),
  KEY `created_by` (`created_by`),
  KEY `idx_month_year` (`month_year`),
  CONSTRAINT `budget_allocations_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `budget_allocations_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `orderCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `lastLogin` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `phone_3` (`phone`),
  UNIQUE KEY `phone_4` (`phone`),
  UNIQUE KEY `phone_5` (`phone`),
  UNIQUE KEY `phone_6` (`phone`),
  UNIQUE KEY `phone_7` (`phone`),
  UNIQUE KEY `phone_8` (`phone`),
  UNIQUE KEY `phone_9` (`phone`),
  UNIQUE KEY `phone_10` (`phone`),
  UNIQUE KEY `phone_11` (`phone`),
  UNIQUE KEY `phone_12` (`phone`),
  UNIQUE KEY `phone_13` (`phone`),
  UNIQUE KEY `phone_14` (`phone`),
  UNIQUE KEY `phone_15` (`phone`),
  UNIQUE KEY `phone_16` (`phone`),
  UNIQUE KEY `phone_17` (`phone`),
  UNIQUE KEY `phone_18` (`phone`),
  UNIQUE KEY `phone_19` (`phone`),
  UNIQUE KEY `phone_20` (`phone`),
  UNIQUE KEY `phone_21` (`phone`),
  UNIQUE KEY `phone_22` (`phone`),
  UNIQUE KEY `phone_23` (`phone`),
  UNIQUE KEY `phone_24` (`phone`),
  UNIQUE KEY `phone_25` (`phone`),
  UNIQUE KEY `phone_26` (`phone`),
  UNIQUE KEY `phone_27` (`phone`),
  UNIQUE KEY `phone_28` (`phone`),
  UNIQUE KEY `phone_29` (`phone`),
  UNIQUE KEY `phone_30` (`phone`),
  UNIQUE KEY `phone_31` (`phone`),
  UNIQUE KEY `phone_32` (`phone`),
  UNIQUE KEY `phone_33` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expected_items`
--

DROP TABLE IF EXISTS `expected_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expected_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('expected_payment','work_in_progress','inventory_item','liability') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of expected item',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Title or name of the item',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Detailed description',
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Expected amount in EGP',
  `expected_date` date NOT NULL COMMENT 'Expected date for payment/completion',
  `from_whom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Client name or source',
  `contact` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Phone number or contact info',
  `status` enum('pending','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Current status of the item',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Additional notes',
  `created_by` int DEFAULT NULL COMMENT 'Admin ID who created this item',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_expected_items_type` (`type`),
  KEY `idx_expected_items_status` (`status`),
  KEY `idx_expected_items_expected_date` (`expected_date`),
  KEY `expected_items_type` (`type`),
  KEY `expected_items_status` (`status`),
  KEY `expected_items_expected_date` (`expected_date`),
  KEY `expected_items_created_at` (`created_at`),
  CONSTRAINT `expected_items_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expense_categories`
--

DROP TABLE IF EXISTS `expense_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_ar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#007553',
  `budget_limit` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_ar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category_id` int NOT NULL,
  `type` enum('fixed','variable') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'variable',
  `date` date NOT NULL,
  `repeat_monthly` tinyint(1) DEFAULT '0',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `receipt_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','paid','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'approved',
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `money_location_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_date` (`date`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category_id`),
  KEY `idx_expense_money_location` (`money_location_id`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `expenses_ibfk_10` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_11` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_12` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_13` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_14` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_15` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_16` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_17` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_18` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_19` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expenses_ibfk_20` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_21` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_22` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_23` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_24` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_25` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_26` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_27` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_28` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_29` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_30` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_31` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_32` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_33` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_34` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_35` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_36` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_37` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_38` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_39` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_4` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_40` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_41` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_42` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_43` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_44` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_45` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_46` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_47` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_48` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_49` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_5` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_50` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_51` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_52` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_53` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_54` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_55` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_6` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_7` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_8` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_9` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `financial_summaries`
--

DROP TABLE IF EXISTS `financial_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_summaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `month_year` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_revenue` decimal(12,2) DEFAULT '0.00',
  `total_cost` decimal(12,2) DEFAULT '0.00',
  `total_expenses` decimal(12,2) DEFAULT '0.00',
  `gross_profit` decimal(12,2) DEFAULT '0.00',
  `net_profit` decimal(12,2) DEFAULT '0.00',
  `profit_margin` decimal(5,2) DEFAULT '0.00',
  `invoice_count` int DEFAULT '0',
  `expense_count` int DEFAULT '0',
  `last_calculated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_month_year` (`month_year`),
  KEY `idx_month_year` (`month_year`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `month` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `type` enum('reports','clients','revenue','custom') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'reports',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target` int NOT NULL,
  `current` int NOT NULL DEFAULT '0',
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'تقرير',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdBy` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isBanner` tinyint(1) NOT NULL DEFAULT '0',
  `period` enum('monthly','quarterly','yearly') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  PRIMARY KEY (`id`),
  UNIQUE KEY `goals_month_year` (`month`,`year`),
  KEY `idx_type` (`type`),
  KEY `idx_isActive` (`isActive`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('laptop','item','service','report','part','standard') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `quantity` int DEFAULT '1',
  `totalAmount` decimal(10,2) NOT NULL,
  `serialNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `invoice_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `product_cost_id` int DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `profit_amount` decimal(10,2) GENERATED ALWAYS AS ((case when (`cost_price` is not null) then ((`amount` - `cost_price`) * `quantity`) else NULL end)) STORED,
  `profit_margin` decimal(5,2) GENERATED ALWAYS AS ((case when ((`cost_price` is not null) and (`amount` > 0)) then (((`amount` - `cost_price`) / `amount`) * 100) else NULL end)) STORED,
  `report_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Reference to report when type is report',
  PRIMARY KEY (`id`),
  KEY `invoiceId` (`invoiceId`),
  KEY `invoice_items_invoice_id_foreign_idx` (`invoice_id`),
  KEY `product_cost_id` (`product_cost_id`),
  CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`),
  CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`product_cost_id`) REFERENCES `product_costs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_invoice_id_foreign_idx` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=884 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `invoice_report_summary`
--

DROP TABLE IF EXISTS `invoice_report_summary`;
/*!50001 DROP VIEW IF EXISTS `invoice_report_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `invoice_report_summary` AS SELECT 
 1 AS `invoice_id`,
 1 AS `reportId`,
 1 AS `client_id`,
 1 AS `invoice_date`,
 1 AS `amount`,
 1 AS `invoice_status`,
 1 AS `order_number`,
 1 AS `inspection_date`,
 1 AS `report_status`,
 1 AS `invoice_created`,
 1 AS `report_invoice_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `invoice_reports`
--

DROP TABLE IF EXISTS `invoice_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `report_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_invoice_report` (`invoice_id`,`report_id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `invoice_reports_ibfk_7` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invoice_reports_ibfk_8` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=313 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `client_id` int NOT NULL,
  `date` datetime NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `taxRate` decimal(5,2) DEFAULT '14.00',
  `tax` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentMethod` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `reportId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `report_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `paymentStatus` enum('pending','completed','cancelled','unpaid','partial','paid') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_from_report` tinyint(1) DEFAULT '1' COMMENT 'Indicates if invoice was created from a report',
  `report_order_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Copy of report order number for quick reference',
  `money_location_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `reportId` (`reportId`),
  KEY `invoices_report_id_foreign_idx` (`report_id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_date` (`date`),
  KEY `invoices_report_id` (`reportId`),
  KEY `invoices_client_id` (`client_id`),
  KEY `invoices_date` (`date`),
  KEY `idx_invoice_money_location` (`money_location_id`),
  CONSTRAINT `invoices_ibfk_129` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invoices_ibfk_130` FOREIGN KEY (`reportId`) REFERENCES `reports` (`id`),
  CONSTRAINT `invoices_ibfk_131` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_132` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_133` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_134` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_135` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_136` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_137` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_138` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_139` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_140` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_141` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_142` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_143` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_144` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_145` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_146` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_147` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_148` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_149` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_150` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_151` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_152` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_153` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_154` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_155` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_156` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_157` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_158` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_159` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_160` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_161` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_162` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_163` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_164` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_165` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_166` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_167` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_168` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_169` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_170` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_171` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_172` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_173` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_174` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_175` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_176` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_177` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_178` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_179` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_180` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_181` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_182` FOREIGN KEY (`money_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_report_id_foreign_idx` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `money_locations`
--

DROP TABLE IF EXISTS `money_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `money_locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_ar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('cash','digital_wallet','bank_account','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(12,2) DEFAULT '0.00',
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'EGP',
  `is_active` tinyint(1) DEFAULT '1',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=213 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `money_movements`
--

DROP TABLE IF EXISTS `money_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `money_movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_location_id` int DEFAULT NULL,
  `to_location_id` int DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `movement_type` enum('transfer','deposit','withdrawal','payment_received','expense_paid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` enum('invoice','expense','manual','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `movement_date` datetime NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `from_location_id` (`from_location_id`),
  KEY `to_location_id` (`to_location_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_movement_date` (`movement_date`),
  KEY `idx_reference` (`reference_type`,`reference_id`),
  KEY `idx_movement_type` (`movement_type`),
  CONSTRAINT `money_movements_ibfk_1` FOREIGN KEY (`from_location_id`) REFERENCES `money_locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `money_movements_ibfk_2` FOREIGN KEY (`to_location_id`) REFERENCES `money_locations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `money_movements_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product_costs`
--

DROP TABLE IF EXISTS `product_costs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_costs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_model` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `serial_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_price` decimal(10,2) NOT NULL,
  `supplier` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `effective_date` date NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_product_name` (`product_name`),
  KEY `idx_product_model` (`product_model`),
  KEY `idx_serial_number` (`serial_number`),
  KEY `idx_effective_date` (`effective_date`),
  CONSTRAINT `product_costs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_costs_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_technical_tests`
--

DROP TABLE IF EXISTS `report_technical_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_technical_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reportId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `componentName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  KEY `reportId` (`reportId`),
  CONSTRAINT `report_technical_tests_ibfk_1` FOREIGN KEY (`reportId`) REFERENCES `reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `client_id` int NOT NULL,
  `client_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `client_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `client_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `client_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `order_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `device_model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `serial_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `inspection_date` datetime NOT NULL,
  `hardware_status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `external_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `billing_enabled` tinyint(1) DEFAULT '0',
  `amount` decimal(10,2) DEFAULT '0.00',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `admin_id` int DEFAULT NULL,
  `invoice_created` tinyint(1) DEFAULT '0' COMMENT 'Indicates if an invoice has been created for this report',
  `invoice_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Reference to the created invoice ID',
  `invoice_date` datetime DEFAULT NULL COMMENT 'Date when invoice was created',
  `cpu` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'CPU specification',
  `gpu` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'GPU specification',
  `ram` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'RAM specification',
  `storage` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Storage specification',
  `status` enum('pending','in-progress','completed','cancelled','canceled','active') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `admin_id` (`admin_id`),
  KEY `idx_invoice_id` (`invoice_id`),
  CONSTRAINT `reports_ibfk_57` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `reports_ibfk_58` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `invoice_report_summary`
--

/*!50001 DROP VIEW IF EXISTS `invoice_report_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`laapak`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `invoice_report_summary` AS select `i`.`id` AS `invoice_id`,`i`.`reportId` AS `reportId`,`i`.`client_id` AS `client_id`,`i`.`date` AS `invoice_date`,`i`.`total` AS `amount`,`i`.`paymentStatus` AS `invoice_status`,`r`.`order_number` AS `order_number`,`r`.`inspection_date` AS `inspection_date`,`r`.`status` AS `report_status`,`r`.`invoice_created` AS `invoice_created`,`r`.`invoice_id` AS `report_invoice_id` from (`invoices` `i` left join `reports` `r` on((`i`.`reportId` = `r`.`id`))) order by `i`.`date` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-15  9:40:20
