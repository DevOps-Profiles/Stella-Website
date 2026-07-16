/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for osx10.21 (arm64)
--
-- Host: localhost    Database: stella_mobiles
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `street_address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `landmark` varchar(255) DEFAULT NULL,
  `address_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES
(1,2,'45 MG Road, Koramangala','Bangalore','Karnataka','560034',1,NULL,NULL),
(2,2,'12 Tech Park Avenue, Whitefield','Bangalore','Karnataka','560066',0,NULL,NULL),
(3,3,'78 Marine Drive','Mumbai','Maharashtra','400020',1,NULL,NULL),
(4,4,'102 Shanthi Colony','Chennai','Tamil Nadu','600040',1,NULL,NULL),
(5,5,'55 Jubilee Hills','Hyderabad','Telangana','500033',1,NULL,NULL);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES
(1,'Stella Anna Nagar (Flagship)','Shanthi Colony Main Rd, Anna Nagar, Chennai','+91 44 2626 1111',13.08500000,80.21000000),
(2,'Stella T-Nagar','Pondy Bazaar Main Rd, T-Nagar, Chennai','+91 44 2828 2222',13.03960000,80.23300000),
(3,'Stella Adyar','MG Road, Shastri Nagar, Adyar, Chennai','+91 44 2424 3333',13.00120000,80.25650000),
(4,'Stella Indiranagar','100 Feet Road, Indiranagar, Bangalore','+91 80 4141 4444',12.97840000,77.64080000),
(5,'Stella Bandra','Linking Road, Bandra West, Mumbai','+91 22 2626 5555',19.05960000,72.82950000);
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(1,'Smartphones','Flagship and premium smartphones'),
(2,'Tablets','iPads, Galaxy Tabs, and more'),
(3,'Wearables','Smartwatches and fitness trackers'),
(4,'Audio','TWS, headphones, and speakers'),
(5,'Accessories','Cases, chargers, hubs, and cables'),
(6,'Gadgets','Drones, gimbals, and smart home tech');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES
(1,1,1,1,159900.00),
(2,2,10,1,29990.00),
(3,3,9,1,14999.00),
(4,4,7,1,89900.00),
(5,5,11,1,2999.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `delivery_type` varchar(50) NOT NULL,
  `address_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `upi_utr_code` varchar(255) DEFAULT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `address_id` (`address_id`),
  KEY `branch_id` (`branch_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES
(1,2,'delivered',159900.00,'delivery',1,NULL,'razorpay','paid',NULL,NULL,NULL,'2026-06-01 04:04:53'),
(2,3,'shipped',29990.00,'delivery',3,NULL,'upi_qr','paid',NULL,NULL,NULL,'2026-06-14 04:04:53'),
(3,4,'processing',14999.00,'pickup',NULL,1,'pay_at_store','pending',NULL,NULL,NULL,'2026-06-15 04:04:53'),
(4,5,'pending',89900.00,'delivery',5,NULL,'razorpay','paid',NULL,NULL,NULL,'2026-06-15 23:04:53'),
(5,2,'cancelled',2999.00,'delivery',1,NULL,'upi_qr','failed',NULL,NULL,NULL,'2026-05-17 04:04:53');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `image_url` text DEFAULT NULL,
  `additional_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`additional_images`)),
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specs`)),
  `is_deal_of_day` tinyint(1) DEFAULT 0,
  `deal_label` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
(1,1,'iPhone 17 Pro Max','Forged in liquid titanium and featuring the groundbreaking A19 Pro chip with Apple Intelligence, a customizable Action button, and the most powerful iPhone camera system ever.',159900.00,25,'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80','[\"https://images.unsplash.com/photo-1696446702183-cbd13d789078?auto=format&fit=crop&w=800&q=80\"]','{\"Brand\": \"Apple\", \"Model\": \"iPhone 17 Pro Max\", \"OS\": \"iOS 19 (Upgradable to iOS 18)\", \"Processor\": \"A19 Pro Chip (3nm Bionic GPU)\", \"Display\": \"6.7-inch Super Retina XDR OLED (120Hz ProMotion)\", \"Main Camera\": \"48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto Zoom\", \"Front Camera\": \"12MP TrueDepth Camera\", \"Battery\": \"4441 mAh (Fast Wireless Charging, USB-C 3.0)\", \"Build\": \"Aerospace-grade Titanium Frame, Ceramic Shield Front\", \"manufacturer_url\": \"https://www.apple.com/in/iphone-17-pro/\"}',1,'BEST SELLER','2026-06-16 04:04:53'),
(2,1,'Samsung Galaxy S24 Ultra','Welcome to the era of mobile AI. Unleash whole new levels of creativity and productivity.',129999.00,15,'https://images.unsplash.com/photo-1707064434685-6e06821ba293?auto=format&fit=crop&w=800&q=80','[\"https://images.unsplash.com/photo-1707064434195-076f8319f39a?auto=format&fit=crop&w=800&q=80\"]','{\"Display\":\"6.8-inch QHD+ Dynamic AMOLED\",\"Chip\":\"Snapdragon 8 Gen 3\",\"Pen\":\"Built-in S Pen\"}',1,'GALAXY AI','2026-06-16 04:04:53'),
(3,1,'Google Pixel 8 Pro','The all-pro phone engineered by Google. Features the best Pixel camera yet and Google AI.',106999.00,30,'https://images.unsplash.com/photo-1697525381677-674b898d9255?auto=format&fit=crop&w=800&q=80','[\"https://images.unsplash.com/photo-1697525381373-3e75a6c17e33?auto=format&fit=crop&w=800&q=80\"]','{\"Display\":\"6.7-inch Super Actua\",\"Chip\":\"Tensor G3\",\"Camera\":\"50MP Main\"}',0,NULL,'2026-06-16 04:04:53'),
(4,1,'OnePlus 12 5G','Smooth beyond belief. Experience the ultimate flagship performance with Hasselblad cameras.',64999.00,45,'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80','[]','{\"Display\": \"6.82-inch ProXDR\", \"Chip\": \"Snapdragon 8 Gen 3\", \"Battery\": \"5400mAh\"}',0,NULL,'2026-06-16 04:04:53'),
(5,2,'iPad Air M2','Light. Bright. Full of might. Supercharged by the Apple M2 chip.',59900.00,40,'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80','[\"https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=800&q=80\"]','{\"Display\": \"11-inch Liquid Retina\", \"Chip\": \"Apple M2\"}',1,'15% OFF','2026-06-16 04:04:53'),
(6,2,'Samsung Galaxy Tab S9 Ultra','The ultimate tablet experience with Dynamic AMOLED 2X and water resistance.',119999.00,10,'https://images.unsplash.com/photo-1627918386377-b952f44760a9?auto=format&fit=crop&w=800&q=80','[]','{\"Display\": \"14.6-inch AMOLED\", \"Pen\": \"S Pen Included\"}',0,NULL,'2026-06-16 04:04:53'),
(7,3,'Apple Watch Ultra 2','The most rugged and capable Apple Watch. Designed for outdoor adventures and supercharged workouts.',89900.00,20,'https://images.unsplash.com/photo-1434493789847-2f02b0c166d2?auto=format&fit=crop&w=800&q=80','[]','{\"Case\": \"49mm Titanium\", \"Display\": \"3000 nits OLED\"}',0,NULL,'2026-06-16 04:04:53'),
(8,3,'Samsung Galaxy Watch 6 Classic','The smartwatch that knows you best, with a rotating bezel and advanced health tracking.',36999.00,35,'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80','[]','{\"Dial\": \"47mm Stainless Steel\", \"Battery\": \"425mAh\"}',0,NULL,'2026-06-16 04:04:53'),
(9,4,'Stella Premium TWS Buds','Immersive active noise cancellation with spatial audio support.',14999.00,100,'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80','[]','{\"ANC\": \"Up to 45dB\", \"Battery\": \"30 Hours\"}',1,'HOT SELLER','2026-06-16 04:04:53'),
(10,4,'Sony WH-1000XM5','Industry-leading noise canceling headphones with Auto NC Optimizer.',29990.00,15,'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80','[]','{\"Type\": \"Over-Ear\", \"Battery\": \"30 Hours\"}',0,NULL,'2026-06-16 04:04:53'),
(11,5,'Stella MagSafe Fast Charger','15W wireless magnetic charging pad with premium braided cable.',2999.00,200,'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80','[]','{\"Output\": \"15W\", \"Type\": \"Magnetic Wireless\"}',0,NULL,'2026-06-16 04:04:53'),
(12,5,'Stella Carbon Fiber Case for iPhone 15 Pro','Ultra-thin, military-grade drop protection with a sleek carbon fiber finish.',1999.00,150,'https://images.unsplash.com/photo-1603313011101-320f66a4f360?auto=format&fit=crop&w=800&q=80','[]','{\"Material\": \"Aramid Fiber\", \"Weight\": \"12g\"}',0,NULL,'2026-06-16 04:04:53'),
(13,1,'Tecno POVA Curve 2 5G','TECNO POVA CURVE 2 5G is built for all-rounder performance, featuring Ella AI and IP64 durability.',14999.00,50,'https://d13pvy8xd75yde.cloudfront.net/global/india/phones/pova-8-5g/800%2A800/POVA-8-5G-White-800x800.png',NULL,'{\"Brand\": \"Tecno\", \"Model\": \"POVA Curve 2 5G\", \"manufacturer_url\": \"https://www.tecno-mobile.in/products/mobile/pova-curve-2-5g/\"}',1,'NEW ARRIVAL','2026-06-19 15:34:19');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES
(1,2,1,5,'The titanium finish is absolutely stunning. Upgraded from the 13 Pro and the camera is a huge leap.','2026-06-06 04:04:53'),
(2,3,10,5,'Best noise cancellation I have ever experienced. Perfect for my daily commute.','2026-06-15 04:04:53'),
(3,4,9,4,'Great sound quality for the price. The ANC is good but could be slightly better in windy conditions.','2026-06-11 04:04:53'),
(4,5,7,5,'Battery life is incredible. I only charge it once every 3 days. A must-have for runners.','2026-05-27 04:04:53');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `site_config`
--

DROP TABLE IF EXISTS `site_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_config` (
  `config_key` varchar(100) NOT NULL,
  `config_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`config_value`)),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_config`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `site_config` WRITE;
/*!40000 ALTER TABLE `site_config` DISABLE KEYS */;
INSERT INTO `site_config` VALUES
('category_filters','{\n    \"Smartphones\": [\n        { \"name\": \"Brand\", \"key\": \"brand\", \"options\": [\"Apple\", \"Samsung\", \"Google\", \"OnePlus\"] },\n        { \"name\": \"Storage\", \"key\": \"Storage\", \"options\": [\"128GB\", \"256GB\", \"512GB\", \"1TB\"] },\n        { \"name\": \"RAM\", \"key\": \"RAM\", \"options\": [\"8GB\", \"12GB\", \"16GB\"] }\n    ],\n    \"Audio\": [\n        { \"name\": \"Brand\", \"key\": \"brand\", \"options\": [\"Stella\", \"Sony\", \"Bose\", \"Apple\"] },\n        { \"name\": \"Type\", \"key\": \"Type\", \"options\": [\"ANC Earbuds\", \"Wireless Over-Ear\", \"Gaming Headset\"] }\n    ],\n    \"Accessories\": [\n        { \"name\": \"Type\", \"key\": \"Type\", \"options\": [\"Chargers\", \"Protective Cases\", \"Cables\", \"Power Banks\"] }\n    ],\n    \"Tablets\": [\n        { \"name\": \"Brand\", \"key\": \"brand\", \"options\": [\"Apple\", \"Samsung\", \"Lenovo\"] },\n        { \"name\": \"Storage\", \"key\": \"Storage\", \"options\": [\"64GB\", \"128GB\", \"256GB\", \"512GB\"] }\n    ],\n    \"Wearables\": [\n        { \"name\": \"Brand\", \"key\": \"brand\", \"options\": [\"Apple\", \"Samsung\", \"Garmin\"] },\n        { \"name\": \"Feature\", \"key\": \"Feature\", \"options\": [\"Cellular\", \"GPS Only\", \"Rugged\"] }\n    ]\n}','2026-06-16 04:04:53'),
('franchise_details','{\"title\": \"Partner with Stella\", \"description\": \"Join the fastest growing mobile franchise in India.\", \"bannerImg\": \"https://images.unsplash.com/photo-1556740734-7f95831517f9?auto=format&fit=crop&w=1920&q=80\", \"stats\": [{\"label\": \"Outlets\", \"value\": \"50+\"}, {\"label\": \"Growth\", \"value\": \"200%\"}]}','2026-06-16 04:04:26'),
('homepage','{\"hero\":{\"slides\":[{\"id\":1,\"title\":\"Unleash the Future\",\"subtitle\":\"Experience the next generation of mobile performance and design.\",\"image\":\"https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=1920&q=80\"},{\"id\":2,\"title\":\"Titanium Strength\",\"subtitle\":\"Aerospace-grade titanium design. Incredibly strong. Incredibly light.\",\"image\":\"https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1920&q=80\"},{\"id\":3,\"title\":\"Pure Audio Bliss\",\"subtitle\":\"Crystal clear sound with advanced active noise cancellation technology.\",\"image\":\"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1920&q=80\"}],\"buttonText\":\"Discover Elite\",\"deals\":{\"show\":true,\"items\":[]}},\"franchise\":{\"title\":\"Partner with Stella\",\"description\":\"Stella Hi Tech Private Limited combines local market experience with a structured franchise system to deliver consistent success. With successful outlets already operating, we provide complete business support including branding, supply chain, technical guidance, and marketing assistance.\",\"bannerImg\":\"https://images.unsplash.com/photo-1556740734-7f95831517f9?auto=format&fit=crop&w=1920&q=80\",\"stats\":[{\"label\":\"Own Outlets\",\"value\":\"5\"},{\"label\":\"Franchise Outlets\",\"value\":\"3\"}],\"hubs\":[{\"tag\":\"Own Outlet\",\"name\":\"Unit I, Hongkong Plaza\",\"address\":\"18A/65, Hongkong Plaza, Tuticorin - 628 002\",\"phone\":\"+91 9345510510\",\"manager\":\"V.Raja\",\"hours\":\"10 AM - 9 PM\"},{\"tag\":\"Own Outlet\",\"name\":\"Unit II, Hongkong Plaza\",\"address\":\"18A/22, Hongkong Plaza, Tuticorin - 628 002\",\"phone\":\"+91 9159592910\",\"manager\":\"M.Karthi\",\"hours\":\"10 AM - 9 PM\"},{\"tag\":\"Own Outlet\",\"name\":\"Thalamuthu Nagar\",\"address\":\"14/681, Thalamuthu Nagar Main Road, Thoothukudi - 628 002\",\"phone\":\"+91 7639129460\",\"manager\":\"S. Solairaj\",\"hours\":\"10 AM - 9 PM\"},{\"tag\":\"Own Outlet\",\"name\":\"Chidambara Nagar\",\"address\":\"East Coast Rd, Chidambara Nagar, Subbiah Puram, Thoothukudi, Tamil Nadu - 628 001\",\"phone\":\"+91 9698510510\",\"manager\":\"K. Selvam\",\"hours\":\"10 AM - 9 PM\",\"link\":\"https://maps.app.goo.gl/C99ETYfZa3x6ta7q6\"},{\"tag\":\"Own Outlet\",\"name\":\"Kulathur\",\"address\":\"Shop No. 01, Bus stand inside, Kulathur, Thoothukudi - 628 903\",\"phone\":\"+91 8012510510\",\"manager\":\"K. Kaali\",\"hours\":\"10 AM - 9 PM\"},{\"tag\":\"Franchise Outlet\",\"name\":\"Stella Hitech Mobiles, Pudukottai\",\"address\":\"JBR Complex, 3/416/32, Theri Rd, Pudukottai, Tamil Nadu – 628 103\",\"phone\":\"+91 8870920709\",\"manager\":\"Easa\",\"hours\":\"10 AM - 9 PM\",\"link\":\"https://maps.app.goo.gl/1QWHfXvSPbSxmQeUA\"},{\"tag\":\"Franchise Outlet\",\"name\":\"Stella Hitech Mobiles, Kulathur\",\"address\":\"V.M.S.T. Raj Complex, Behind Kulathur Bus stand, Kulathur, Tamil Nadu – 628 903\",\"phone\":\"+91 8870920709\",\"manager\":\"K. Kaali\",\"hours\":\"10 AM - 9 PM\"},{\"tag\":\"Franchise Outlet\",\"name\":\"MR.93 Hi Tech Mobiles\",\"address\":\"149/8, Polepettai, 4th Gate, Ettayapuram Road, Muthammal Colony, Thoothukudi - 628 002\",\"phone\":\"+91 7708855973\",\"manager\":\"P. Ramkumar\",\"hours\":\"10 AM - 9 PM\"}]},\"our_story\":{\"vision_title\":\"The Stella Vision\",\"vision_text\":\"Stella Hi Tech Private Limited, an emerging SAP solutions firm, was established on January 26, 2025, in the heart of the Pearl City, Tuticorin, by its visionary founder, Mr. Maheshkumar V.\\n\\nThe journey began in 2007 when Mr. Maheshkumar V started as a dedicated home appliance agency, creating the brand “STELLA” (Stella Home Appliances) in his hometown, Kulathur, Tuticorin.\\n\\nSubsequently, Stella Mobiles opened its doors at Hongkong Plaza, Tuticorin, providing reliable and customer-satisfying mobile services. In 2015, it evolved into a full-fledged Mobile Sales Showroom. Today, Stella Mobiles stands as a leading multi-brand retail chain, offering a wide range of mobile phones, accessories, smart gadgets, tablets, laptops, and TVs.\\n\\nWith consistent growth and transformation, the brand expanded across Tuticorin town, establishing branches in multiple locations. Building on this strong foundation, we united as a team to launch our technology solutions firm, Stella Hi Tech Private Limited, in Polepettai, Tuticorin.\\n\\nStella Hi Tech Private Limited takes pride in its deep understanding of customer needs. Its greatest strength lies in its well-trained, customer-friendly team and an unwavering passion for delivering exceptional service.\",\"hero_image\":\"https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80\",\"stats\":[{\"value\":\"15k+\",\"label\":\"Happy Customers\"},{\"value\":\"02\",\"label\":\"Elite Hubs\"},{\"value\":\"24h\",\"label\":\"Express Delivery\"}]},\"testimonials\":{\"col1\":[{\"id\":1,\"name\":\"Rahul S.\",\"text\":\"Best mobile buying experience! The staff at Anna Nagar were incredibly helpful.\",\"stars\":5},{\"id\":2,\"name\":\"Priya K.\",\"text\":\"Got my Stella Pro at an unbelievable deal. Highly recommend the seamless store pickup!\",\"stars\":5},{\"id\":3,\"name\":\"Vikram M.\",\"text\":\"Authentic products and 0% UPI fee makes a huge difference when buying flagships.\",\"stars\":5}],\"col2\":[{\"id\":4,\"name\":\"Anjali R.\",\"text\":\"Super fast checkout! The custom UPI payments are fully transparent and fee-free.\",\"stars\":5},{\"id\":5,\"name\":\"Karthik B.\",\"text\":\"Elite premium customer support. Setup my new smartphone right in their luxury lounge.\",\"stars\":5},{\"id\":6,\"name\":\"Deepa T.\",\"text\":\"Outstanding store design. The bento layout and dark mode look premium online & offline.\",\"stars\":5}],\"col3\":[{\"id\":7,\"name\":\"Sanjay V.\",\"text\":\"Excellent twilio OTP secure login. My orders are safe, and tracking is very accurate.\",\"stars\":5},{\"id\":8,\"name\":\"Meera N.\",\"text\":\"Best gadget accessories in Chennai. Visited Pondy Bazaar Express Hub, absolute speed.\",\"stars\":5},{\"id\":9,\"name\":\"Arun K.\",\"text\":\"Stella franchise protocol is highly systematic. Excited to grow our partnership.\",\"stars\":5}]},\"topBrands\":{\"title\":\"Brands in Our Store\",\"logos\":[{\"name\":\"Apple\",\"url\":\"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg\"},{\"name\":\"Samsung\",\"url\":\"https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg\"},{\"name\":\"Realme\",\"url\":\"https://upload.wikimedia.org/wikipedia/commons/d/df/Realme_logo.png\"}]}}','2026-06-20 14:22:34'),
('homepage_hero','{\"slides\": [{\"id\": 1, \"title\": \"Unleash the Future\", \"subtitle\": \"The Next Generation is here.\", \"image\": \"https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=1920&q=80\"}], \"buttonText\": \"Pre-Order Now\"}','2026-06-16 04:04:26');
/*!40000 ALTER TABLE `site_config` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Stella Admin','9999999999',NULL,'admin','2026-06-16 04:04:53',NULL),
(2,'John Doe','9876543210',NULL,'customer','2026-06-16 04:04:53',NULL),
(3,'Jane Smith','9876543211',NULL,'customer','2026-06-16 04:04:53',NULL),
(4,'Rahul Sharma','9876543212',NULL,'customer','2026-06-16 04:04:53',NULL),
(5,'Priya Patel','9876543213',NULL,'customer','2026-06-16 04:04:53',NULL),
(6,'Arun Kumar','9876543214',NULL,'customer','2026-06-16 04:04:53',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-06-29  8:36:21
