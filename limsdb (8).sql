-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 12, 2023 at 09:44 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `limsdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `activation`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `activation` (
  `ID` int(255) NOT NULL,
  `STATUS` varchar(100) NOT NULL DEFAULT 'INACTIVE',
  `PATIENTID` int(100) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `activation`:
--

-- --------------------------------------------------------

--
-- Table structure for table `applicationsettings`
--
-- Creation: Sep 28, 2023 at 03:28 AM
--

CREATE TABLE `applicationsettings` (
  `keyid` int(255) NOT NULL,
  `bulkregistration` tinyint(1) NOT NULL DEFAULT 0,
  `fontsize` varchar(14) NOT NULL DEFAULT '13px',
  `textcolor` varchar(11) NOT NULL DEFAULT 'black',
  `BackgroundColor` varchar(50) NOT NULL DEFAULT 'wheat',
  `DeactivateBilling24hrs` tinyint(1) NOT NULL DEFAULT 0,
  `PaidBillsBeforeTransaction` tinyint(1) NOT NULL DEFAULT 1,
  `completeFlow` tinyint(1) NOT NULL DEFAULT 1,
  `approvalbeforeprinting` tinyint(1) NOT NULL DEFAULT 1,
  `smsActivated` tinyint(1) NOT NULL DEFAULT 0,
  `smsSettings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{"result":"No","registration":"Yes","sample":"No","birthday":"No"}' CHECK (json_valid(`smsSettings`)),
  `emailNotification` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `applicationsettings`:
--

--
-- Dumping data for table `applicationsettings`
--

INSERT INTO `applicationsettings` (`keyid`, `bulkregistration`, `fontsize`, `textcolor`, `BackgroundColor`, `DeactivateBilling24hrs`, `PaidBillsBeforeTransaction`, `completeFlow`, `approvalbeforeprinting`, `smsActivated`, `smsSettings`, `emailNotification`) VALUES
(1, 0, '14', 'black', 'wheat', 1, 0, 1, 1, 0, '{\"result\":\"No\",\"registration\":\"Yes\",\"sample\":\"No\",\"birthday\":\"No\"}', 0);

-- --------------------------------------------------------

--
-- Table structure for table `billing`
--
-- Creation: Sep 05, 2023 at 12:41 PM
--

CREATE TABLE `billing` (
  `BILLINGID` int(255) NOT NULL,
  `PATIENTID` bigint(100) NOT NULL,
  `PAID_AMOUNT` int(100) NOT NULL,
  `PAYABLE` int(100) NOT NULL,
  `DISCOUNT` int(50) NOT NULL,
  `ORGANIZATION` int(25) NOT NULL,
  `CLINICIAN` int(25) NOT NULL,
  `TYPE` varchar(255) NOT NULL DEFAULT 'PREPAID',
  `OUTSTANDING` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `billing`:
--

--
-- Dumping data for table `billing`
--

INSERT INTO `billing` (`BILLINGID`, `PATIENTID`, `PAID_AMOUNT`, `PAYABLE`, `DISCOUNT`, `ORGANIZATION`, `CLINICIAN`, `TYPE`, `OUTSTANDING`) VALUES
(58, 2023854, 1600, 1600, 0, 0, 0, 'PREPAID', 0),
(59, 202385, 99, 99, 0, 0, 0, 'PREPAID', 0),
(60, 202385, 6090, 6090, 0, 0, 0, 'PREPAID', 0),
(61, 202385, 1100, 1100, 0, 0, 0, 'PREPAID', 0),
(62, 2023854, 1050, 1050, 0, 0, 0, 'PREPAID', 0),
(63, 2023854, 620, 620, 0, 0, 0, 'PREPAID', 0),
(64, 2023854, 6500, 6500, 0, 0, 0, 'PREPAID', 0),
(65, 202385, 70, 70, 0, 2, 1, 'PREPAID', 0),
(66, 2023854, 550, 550, 0, 1, 1, 'PREPAID', 0),
(67, 202385, 50, 50, 0, 0, 0, 'PREPAID', 0),
(68, 2023854, 600, 600, 0, 0, 0, 'PREPAID', 0),
(69, 2023854, 50, 50, 0, 7, 5, 'PREPAID', 0),
(70, 2023854, 550, 550, 0, 6, 4, 'PREPAID', 0),
(71, 2023854, 20, 20, 0, 7, 4, 'PREPAID', 0),
(72, 202385, 6000, 6000, 0, 0, 0, 'PREPAID', 0),
(73, 2023854, 620, 620, 0, 7, 6, 'PREPAID', 0),
(74, 2023854, 6500, 6500, 0, 0, 0, 'PREPAID', 0),
(75, 2023854, 7100, 7100, 0, 0, 0, 'PREPAID', 0),
(76, 2023854, 60, 60, 0, 0, 0, 'PREPAID', 0),
(77, 2023854, 6000, 6000, 0, 6, 2, 'PREPAID', 0),
(78, 20238186, 120, 169, 0, 0, 0, 'PREPAID', 49),
(79, 202382111, 670, 670, 0, 0, 0, 'PREPAID', 0),
(80, 202382111, 20, 20, 0, 0, 0, 'PREPAID', 0),
(81, 2023854, 600, 600, 0, 0, 0, 'PREPAID', 0),
(82, 202382112, 50, 50, 0, 0, 0, 'PREPAID', 0),
(83, 202382111, 1100, 1100, 0, 0, 0, 'PREPAID', 0),
(84, 202382111, 6600, 6600, 0, 0, 0, 'PREPAID', 0),
(85, 20238186, 100, 100, 0, 0, 0, 'PREPAID', 0),
(86, 20238186, 50, 50, 0, 0, 0, 'PREPAID', 0),
(87, 202381910, 6000, 6000, 0, 0, 0, 'PREPAID', 0),
(88, 202382111, 100, 100, 0, 6, 2, 'PREPAID', 0),
(89, 202381910, 180, 180, 0, 0, 0, 'PREPAID', 0),
(90, 202382112, 180, 180, 0, 7, 7, 'PREPAID', 0),
(91, 202382112, 180, 180, 0, 7, 7, 'PREPAID', 0),
(92, 202381910, 180, 180, 0, 0, 0, 'PREPAID', 0),
(93, 202382112, 100, 100, 0, 0, 0, 'PREPAID', 0),
(94, 2023854, 360, 360, 0, 0, 0, 'PREPAID', 0),
(95, 202382111, 120, 220, 0, 0, 0, 'PREPAID', 100),
(96, 20238187, 300, 300, 0, 6, 4, 'PREPAID', 0),
(97, 20238155, 120, 360, 0, 0, 0, 'PREPAID', 240),
(98, 20238187, 20, 20, 0, 6, 6, 'PREPAID', 0),
(99, 20238187, 50, 50, 0, 0, 0, 'PREPAID', 0),
(100, 202381910, 600, 600, 0, 0, 0, 'PREPAID', 0),
(101, 202382112, 100, 100, 0, 0, 0, 'PREPAID', 0),
(102, 202382112, 3160, 6240, 0, 6, 4, 'PREPAID', 3080),
(103, 20239720, 100, 150, 0, 6, 2, 'PREPAID', 50),
(104, 20239721, 100, 100, 0, 0, 0, 'PREPAID', 0),
(105, 20239722, 100, 100, 0, 6, 5, 'PREPAID', 0),
(106, 20239723, 0, 7200, 0, 0, 0, 'PREPAID', 7200),
(107, 20239723, 0, 6720, 0, 0, 0, 'PREPAID', 6720),
(108, 20239723, 0, 620, 0, 8, 6, 'PREPAID', 620),
(109, 20238155, 20, 20, 0, 6, 6, 'PREPAID', 0),
(110, 20239723, 0, 1720, 0, 0, 0, 'PREPAID', 1720),
(111, 20239723, 20, 20, 0, 6, 5, 'PREPAID', 0),
(112, 20239721, 1600, 1620, 20, 6, 4, 'PREPAID', 0),
(113, 20239723, 20, 20, 0, 0, 0, 'PREPAID', 0),
(114, 20239723, 1719, 1719, 0, 6, 5, 'PREPAID', 0),
(115, 20239619, 600, 600, 0, 0, 0, 'PREPAID', 0),
(116, 20239723, 500, 500, 0, 7, 11, 'PREPAID', 0),
(117, 20239723, 500, 500, 0, 7, 11, 'PREPAID', 0),
(118, 202392724, 20, 20, 0, 0, 0, 'PREPAID', 0),
(119, 20239723, 120, 120, 0, 6, 7, 'PREPAID', 0),
(120, 202392724, 100, 100, 20, 8, 4, 'PREPAID', -20),
(121, 202392724, 30, 30, 10, 6, 5, 'PREPAID', -10),
(122, 20238155, 1000, 1320, 320, 0, 0, 'PREPAID', 0),
(123, 202393126, 1800, 1849, 0, 6, 6, 'PREPAID', 49),
(124, 202393126, 20, 20, 0, 0, 0, 'PREPAID', 0),
(125, 202310127, 35, 40, 5, 8, 5, 'PREPAID', 0),
(127, 202310428, 20, 20, 0, 9, 4, 'PREPAID', 0),
(128, 202310428, 1600, 1629, 29, 1, 7, 'PREPAID', 0),
(129, 202310428, 600, 640, 0, 0, 0, 'PREPAID', 40);

--
-- Triggers `billing`
--
DELIMITER $$
CREATE TRIGGER `onDeleteBilling` AFTER DELETE ON `billing` FOR EACH ROW BEGIN 
DELETE FROM performing_test WHERE BILLINGID = OLD.BILLINGID;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `billinghx`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `billinghx` (
  `KeyID` int(255) NOT NULL,
  `Billingid` int(255) NOT NULL,
  `Date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `PaymentMode` int(25) NOT NULL,
  `Amount` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `billinghx`:
--

--
-- Dumping data for table `billinghx`
--

INSERT INTO `billinghx` (`KeyID`, `Billingid`, `Date`, `PaymentMode`, `Amount`) VALUES
(1, 1, '2023-09-03 09:00:18.976682', 4, 1000),
(2, 2, '2023-09-03 12:33:16.187891', 4, 0),
(3, 3, '2023-09-03 12:35:51.789360', 4, 50),
(4, 4, '2023-09-03 21:06:56.154649', 4, 500),
(5, 2, '2023-09-03 21:12:12.645002', 0, 30),
(6, 2, '2023-09-03 21:12:28.061551', 0, 20),
(7, 5, '2023-09-04 05:21:09.786065', 4, 1600),
(8, 6, '2023-09-04 10:37:51.153552', 4, 1080),
(9, 7, '2023-09-04 10:51:58.305295', 4, 6600),
(10, 8, '2023-09-04 10:52:55.725068', 4, 6600),
(11, 9, '2023-09-04 10:53:30.366183', 4, 6600),
(12, 10, '2023-09-04 10:53:52.608198', 4, 6600),
(13, 11, '2023-09-04 10:54:32.923407', 4, 6600),
(14, 12, '2023-09-04 10:55:08.739245', 4, 6600),
(15, 13, '2023-09-04 10:55:58.916300', 4, 6600),
(16, 14, '2023-09-04 10:56:00.607397', 4, 6600),
(17, 15, '2023-09-04 10:56:10.244939', 4, 6600),
(18, 16, '2023-09-04 10:56:11.129310', 4, 6600),
(19, 17, '2023-09-04 10:56:16.549474', 4, 6600),
(20, 18, '2023-09-04 11:07:59.086076', 4, 6600),
(21, 19, '2023-09-04 11:08:11.811687', 4, 6600),
(22, 20, '2023-09-04 11:08:47.717271', 4, 6600),
(23, 21, '2023-09-04 11:39:42.871233', 4, 550),
(24, 22, '2023-09-04 12:07:35.526062', 4, 6600),
(25, 23, '2023-09-04 12:07:46.434776', 4, 6600),
(26, 24, '2023-09-04 12:07:47.546111', 4, 6600),
(27, 25, '2023-09-04 12:08:06.680351', 4, 6600),
(28, 26, '2023-09-04 12:08:27.348731', 4, 6600),
(29, 27, '2023-09-04 12:08:35.314618', 4, 6600),
(30, 28, '2023-09-04 12:08:35.910416', 4, 6600),
(31, 29, '2023-09-04 12:10:08.720816', 4, 6600),
(32, 30, '2023-09-04 12:10:10.412708', 4, 6600),
(33, 31, '2023-09-04 12:10:11.454321', 4, 6600),
(34, 32, '2023-09-04 12:10:40.438348', 4, 6600),
(35, 33, '2023-09-04 12:10:40.481841', 4, 6600),
(36, 34, '2023-09-04 12:14:07.610150', 4, 6600),
(37, 35, '2023-09-04 12:15:13.661149', 4, 6000),
(38, 36, '2023-09-04 12:39:56.576590', 4, 1030),
(39, 37, '2023-09-04 12:46:34.205882', 4, 6560),
(40, 38, '2023-09-04 14:52:36.965254', 4, 60),
(41, 39, '2023-09-04 14:53:23.148588', 4, 500),
(42, 39, '2023-09-04 15:11:37.183887', 0, 100),
(43, 40, '2023-09-04 15:12:24.800674', 4, 30),
(44, 41, '2023-09-04 15:38:36.677552', 4, 0),
(45, 42, '2023-09-04 15:46:49.523842', 4, 6000),
(46, 43, '2023-09-04 15:47:09.407541', 4, 6000),
(47, 44, '2023-09-04 15:47:16.349553', 4, 6000),
(48, 45, '2023-09-04 16:02:28.113035', 4, 500),
(49, 46, '2023-09-04 16:12:13.741960', 4, 6000),
(50, 47, '2023-09-04 16:14:21.055553', 4, 6000),
(51, 48, '2023-09-04 16:17:31.044680', 4, 6000),
(52, 49, '2023-09-04 16:18:05.675769', 4, 600),
(53, 50, '2023-09-04 16:20:00.928423', 4, 600),
(54, 41, '2023-09-04 16:21:44.768746', 0, 600),
(55, 51, '2023-09-04 16:37:45.592612', 4, 20),
(56, 52, '2023-09-04 16:38:38.836998', 4, 40),
(57, 52, '2023-09-04 16:42:20.442478', 0, 10),
(58, 53, '2023-09-05 05:25:22.165408', 4, 10),
(59, 54, '2023-09-05 05:42:21.176938', 4, 20),
(60, 55, '2023-09-05 06:10:18.022738', 4, 60),
(61, 55, '2023-09-05 06:29:08.990250', 0, 540),
(62, 53, '2023-09-05 06:29:30.908101', 0, 10),
(63, 56, '2023-09-05 06:29:42.874786', 4, 20),
(64, 57, '2023-09-05 06:48:57.341853', 4, 50),
(65, 58, '2023-09-05 11:24:11.546122', 4, 1000),
(66, 59, '2023-09-05 11:25:17.872689', 4, 99),
(67, 60, '2023-09-05 11:32:19.962174', 4, 6090),
(68, 61, '2023-09-05 11:32:40.258033', 4, 1100),
(69, 58, '2023-09-06 09:55:09.742135', 0, 600),
(70, 62, '2023-09-06 09:55:18.984260', 4, 1050),
(71, 63, '2023-09-06 10:19:02.283597', 4, 620),
(72, 64, '2023-09-11 07:52:14.574556', 4, 6000),
(73, 65, '2023-09-11 07:53:01.940418', 4, 50),
(74, 66, '2023-09-11 08:07:34.903033', 4, 50),
(75, 67, '2023-09-12 04:58:32.169330', 4, 50),
(76, 68, '2023-09-12 08:51:18.460026', 4, 600),
(77, 69, '2023-09-12 20:44:09.456661', 2, 0),
(78, 70, '2023-09-12 20:51:52.200091', 2, 500),
(79, 71, '2023-09-12 23:35:01.908407', 2, 20),
(80, 72, '2023-09-13 00:08:07.190810', 2, 6000),
(81, 73, '2023-09-13 01:49:24.574099', 4, 0),
(82, 74, '2023-09-13 06:12:29.826591', 4, 6000),
(83, 66, '2023-09-15 07:43:04.732271', 0, 500),
(84, 64, '2023-09-15 07:43:17.003856', 0, 500),
(85, 74, '2023-09-16 21:13:40.090473', 0, 500),
(86, 75, '2023-09-17 10:36:55.627653', 4, 7100),
(87, 76, '2023-09-18 09:37:48.112257', 2, 60),
(88, 77, '2023-09-18 09:59:19.182735', 4, 6000),
(89, 78, '2023-09-18 10:15:37.781630', 4, 120),
(90, 79, '2023-09-21 09:41:11.577467', 4, 670),
(91, 80, '2023-09-21 12:47:50.180709', 4, 20),
(92, 73, '2023-09-21 12:50:32.935940', 0, 620),
(93, 69, '2023-09-21 12:50:48.147999', 0, 50),
(94, 70, '2023-09-21 12:51:01.235220', 0, 50),
(95, 81, '2023-09-21 12:51:17.356349', 4, 600),
(96, 82, '2023-09-21 17:48:52.360800', 4, 50),
(97, 83, '2023-09-23 07:50:17.471615', 4, 1100),
(98, 65, '2023-09-24 04:27:29.907256', 0, 20),
(99, 84, '2023-10-03 07:47:53.692528', 4, 100),
(100, 85, '2023-10-03 09:48:00.520495', 4, 100),
(101, 86, '2023-10-03 09:48:46.021558', 4, 50),
(102, 87, '2023-10-03 09:49:35.047552', 4, 6000),
(103, 88, '2023-10-03 09:50:07.173057', 4, 100),
(104, 89, '2023-10-03 10:56:38.425621', 4, 180),
(105, 84, '2023-10-04 11:59:57.104313', 0, 6500),
(106, 90, '2023-10-04 12:28:28.475975', 4, 80),
(107, 91, '2023-10-04 12:28:28.925845', 4, 80),
(108, 92, '2023-10-04 12:41:55.502556', 4, 180),
(109, 93, '2023-10-04 21:45:30.742930', 4, 100),
(110, 94, '2023-10-04 22:00:12.669082', 4, 360),
(111, 95, '2023-10-05 08:05:47.252421', 4, 120),
(112, 96, '2023-10-05 08:10:15.567086', 2, 300),
(113, 97, '2023-10-05 09:14:37.871066', 4, 120),
(114, 98, '2023-10-05 10:08:46.736947', 4, 20),
(115, 99, '2023-10-05 20:22:54.268034', 4, 50),
(116, 100, '2023-10-05 21:10:35.097971', 4, 600),
(117, 101, '2023-10-05 21:22:22.005222', 4, 100),
(118, 102, '2023-10-06 03:19:49.681602', 4, 180),
(119, 103, '2023-10-07 10:03:18.383633', 4, 100),
(120, 104, '2023-10-07 10:52:09.363538', 1, 100),
(121, 105, '2023-10-07 18:51:14.486697', 4, 100),
(122, 106, '2023-10-07 19:32:06.167913', 4, 7200),
(123, 107, '2023-10-07 19:52:20.727270', 4, 6720),
(124, 108, '2023-10-08 04:16:21.248781', 4, 620),
(125, 109, '2023-10-09 05:25:10.230705', 4, 20),
(126, 110, '2023-10-10 05:46:08.564854', 4, 600),
(127, 110, '2023-10-10 13:25:19.221950', 4, 620),
(128, 90, '2023-10-10 13:34:22.240320', 4, 100),
(129, 90, '2023-10-10 13:34:22.337809', 4, 100),
(130, 90, '2023-10-10 13:34:22.378375', 4, 100),
(131, 91, '2023-10-10 13:35:45.811910', 4, 100),
(132, 91, '2023-10-10 13:35:45.904761', 4, 100),
(133, 102, '2023-10-10 13:43:14.144364', 4, 2000),
(134, 102, '2023-10-10 13:43:32.697056', 4, 2000),
(135, 102, '2023-10-10 13:43:40.850706', 4, 2000),
(136, 102, '2023-10-10 13:43:41.924959', 4, 2000),
(137, 102, '2023-10-10 13:43:58.956210', 4, 200),
(138, 102, '2023-10-10 13:44:00.755663', 4, 20),
(139, 102, '2023-10-10 13:44:19.289689', 4, 20),
(140, 102, '2023-10-10 13:44:39.478978', 4, 20),
(141, 102, '2023-10-10 13:45:37.859678', 4, 20),
(142, 102, '2023-10-10 13:46:24.994624', 4, 20),
(143, 102, '2023-10-10 13:46:33.575058', 4, 20),
(144, 102, '2023-10-10 13:46:39.619237', 4, 20),
(145, 102, '2023-10-10 13:46:41.542885', 4, 20),
(146, 102, '2023-10-10 13:46:47.965159', 4, 20),
(147, 102, '2023-10-10 13:46:50.910013', 4, 20),
(148, 102, '2023-10-10 13:46:52.467599', 4, 20),
(149, 102, '2023-10-10 13:46:55.873756', 4, 20),
(150, 102, '2023-10-10 13:46:57.790402', 4, 20),
(151, 102, '2023-10-10 13:48:13.252450', 4, 20),
(152, 102, '2023-10-10 13:48:30.136503', 4, 1000),
(153, 102, '2023-10-10 19:04:34.268384', 4, 1000),
(154, 102, '2023-10-10 19:04:38.276644', 4, 1000),
(155, 111, '2023-10-11 09:33:02.169804', 4, 20),
(156, 112, '2023-10-17 11:21:25.869799', 4, 1600),
(157, 113, '2023-10-17 19:51:16.354537', 4, 20),
(158, 114, '2023-10-17 19:59:20.209667', 4, 1719),
(159, 115, '2023-10-26 07:51:17.564909', 3, 600),
(160, 116, '2023-10-27 04:54:17.587524', 1, 500),
(161, 117, '2023-10-27 04:54:17.844611', 1, 500),
(162, 118, '2023-10-28 10:17:04.873275', 4, 20),
(163, 119, '2023-10-28 10:48:04.199367', 4, 120),
(164, 120, '2023-10-29 14:29:30.538671', 4, 100),
(165, 121, '2023-10-31 00:25:47.119296', 4, 30),
(166, 122, '2023-10-31 00:35:31.065494', 4, 1000),
(167, 123, '2023-11-01 00:49:57.414437', 4, 1800),
(168, 124, '2023-11-03 00:14:27.466050', 4, 20),
(169, 125, '2023-11-04 01:53:57.867553', 4, 35),
(170, 126, '2023-11-04 02:23:00.783336', 4, 20),
(171, 127, '2023-11-06 13:17:24.619059', 4, 20),
(172, 128, '2023-11-06 16:08:24.484583', 4, 1600),
(173, 129, '2023-11-08 20:53:30.729022', 4, 600);

-- --------------------------------------------------------

--
-- Table structure for table `bloodgroup`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `bloodgroup` (
  `ID` int(100) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `BGROUP` varchar(30) NOT NULL,
  `RHESUS` varchar(30) NOT NULL,
  `CREATED_ON` date DEFAULT current_timestamp(),
  `UPDATED_ON` date DEFAULT current_timestamp(),
  `TIME` time(6) DEFAULT current_timestamp(),
  `PATIENTID` int(255) NOT NULL,
  `REMARKS` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `bloodgroup`:
--

--
-- Dumping data for table `bloodgroup`
--

INSERT INTO `bloodgroup` (`ID`, `BILLINGID`, `BGROUP`, `RHESUS`, `CREATED_ON`, `UPDATED_ON`, `TIME`, `PATIENTID`, `REMARKS`) VALUES
(1, 1, 'AB', 'positive', '2023-09-03', '2023-09-03', '09:02:43.000000', 2023729, 'wefjjfu'),
(2, 62, 'B', 'negative', '2023-09-06', '2023-09-06', '09:56:05.000000', 2023854, 'jfuiwquiududu'),
(3, 67, 'B', 'positive', '2023-09-12', '2023-09-12', '20:54:33.000000', 202385, 'hhh'),
(4, 73, 'B', 'positive', '2023-09-15', '2023-09-15', '14:37:13.000000', 2023854, '<p>oef2efi2if2iiiiwiie</p>'),
(5, 69, 'B', 'negative', '2023-09-18', '2023-09-18', '13:01:05.000000', 2023854, 'jfjfjqfhqfgw'),
(6, 66, 'AB', 'negative', '2023-09-18', '2023-09-18', '13:01:47.000000', 2023854, 'kefoqwoioqwo\nkwiirfiw\n\n\nuefuiqrui'),
(7, 70, 'B', 'positive', '2023-09-18', '2023-09-18', '13:02:28.000000', 2023854, 'ieriowefiowfioefo\noweoffopofofofws\n;wkfwlfl2flqfkqe\n\nk2eqkgwf\'olq\'l');

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--
-- Creation: Oct 09, 2023 at 05:16 PM
--

CREATE TABLE `branch` (
  `branchid` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `activation` tinyint(1) NOT NULL DEFAULT 0,
  `address` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contact` int(21) NOT NULL,
  `managerid` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `branch`:
--

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`branchid`, `name`, `date`, `activation`, `address`, `email`, `contact`, `managerid`) VALUES
(1, 'yendi branch', '2023-09-03', 1, 'Kalpohin Lowcost 30A', 'tiifuhamza@gmail.com', 249493933, '3'),
(2, 'sda branch', '2023-09-03', 1, 'Kalpohin Lowcost 30A.\n\nPrincipal throry', 'tiifuhamza@gmail.com', 249493933, '3'),
(3, 'buipe branch', '2023-09-03', 1, 'Kalpohin Lowcost 30A', 'tiifuhamza@gmail.com', 249493933, ''),
(4, 'Tamale central', '2023-09-03', 1, 'Kalpohin Lowcost 30A', 'tiifuhamza@gmail.com', 249493933, '1'),
(9, 'kumasi ', '2023-10-09', 0, 'hwdfjwfjjfjqfj', 'jjajajjajaj@gmail.com', 2147483647, '1'),
(10, 'bimbilla', '2023-10-11', 1, 'Bimbilla Makayila \nP.O Box 1293\nKalpohin Lowcost 30A', 'bimbilla@lobnos.com', 283838383, '1');

-- --------------------------------------------------------

--
-- Table structure for table `clinicianbasicinfo`
--
-- Creation: Sep 12, 2023 at 06:41 AM
--

CREATE TABLE `clinicianbasicinfo` (
  `ID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `LOCATION` varchar(100) NOT NULL,
  `ADDRESS` varchar(255) NOT NULL,
  `OCCUPATION` varchar(100) NOT NULL,
  `ORGANIZATION` int(50) NOT NULL,
  `UPDATE_ON` date DEFAULT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `PHONE` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='collects only the basic information of the clinician';

--
-- RELATIONSHIPS FOR TABLE `clinicianbasicinfo`:
--

--
-- Dumping data for table `clinicianbasicinfo`
--

INSERT INTO `clinicianbasicinfo` (`ID`, `NAME`, `EMAIL`, `LOCATION`, `ADDRESS`, `OCCUPATION`, `ORGANIZATION`, `UPDATE_ON`, `CREATED_ON`, `PHONE`) VALUES
(2, 'Mr razak abdulai', 'zak@gmail.com', 'Tamale', 'kalphonin lowcost ', 'doctor', 0, '2023-09-12', '0000-00-00 00:00:00.000000', 500005000),
(4, 'Mildred Bag', 'hamzatiifu45@gmail.com', 'yanale', 'jdjfkdjud', 'nurse', 0, NULL, '2023-09-12 17:37:59.431113', 585949378),
(5, 'mohammmed hamza', 'mohammaed@gmial.cpm', 'Tamale', 'Kalpohin Lowcost 30A', 'nurse', 0, NULL, '2023-09-12 17:50:52.588645', 398494984),
(6, 'tiifu faizah', 'hamzatiifgu457@gmail.com', 'popodpodpo', 'podpodpopo', 'nurse', 0, NULL, '2023-09-12 18:28:41.207588', 693493773),
(7, 'Tiifu hamza', 'hamzatiifu45props@gmail.com', 'yanale', 'Northern region', 'nurse', 0, NULL, '2023-09-12 19:45:35.722453', 595964565),
(8, 'ffefeiofio', 'johnsonbuma@gmail.com', 'tamale', 'podpodpopo', 'nurse', 0, NULL, '2023-09-12 19:53:08.712140', 241758550),
(9, 'none', '00000000000@gmail.com', 'popodpodpo', 'Northern region', 'therapist', 0, NULL, '2023-09-12 20:43:12.230917', 0),
(10, 'enam akoetey', 'enam@gmsir.com', 'Tamale', 'principelk sad dogs', 'nurse', 0, NULL, '2023-09-23 07:49:49.758853', 374784894),
(11, 'Mildred Bagxxx', 'mildred@gmail.com', 'Tamale', 'Kalpohin Lowcost 30A', 'nurse', 0, NULL, '2023-10-27 04:53:39.526922', 595964565),
(12, 'tiifu hamza vercel', 'hamzatiifdjjsdju45@gmail.com', 'Tamale', 'kalpohin lowcost 30A', 'nurse', 0, NULL, '2023-10-28 10:38:40.198143', 595964565);

--
-- Triggers `clinicianbasicinfo`
--
DELIMITER $$
CREATE TRIGGER `onDeleteClinician` AFTER DELETE ON `clinicianbasicinfo` FOR EACH ROW BEGIN 
DELETE FROM clinicianpaymentinfo WHERE CLINICIANID = OLD.ID;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `onInsertClinician` AFTER INSERT ON `clinicianbasicinfo` FOR EACH ROW BEGIN 
INSERT INTO clinicianpaymentinfo (CLINICIANID)
VALUE(NEW.ID);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `clinicianpaymentinfo`
--
-- Creation: Sep 12, 2023 at 06:42 AM
--

CREATE TABLE `clinicianpaymentinfo` (
  `ID` int(255) NOT NULL,
  `CLINICIANID` int(10) NOT NULL,
  `MODULE` varchar(100) NOT NULL,
  `MOMO` int(50) DEFAULT NULL,
  `BANKNAME` varchar(255) DEFAULT NULL,
  `BANKBRANCH` varchar(255) DEFAULT NULL,
  `ACCOUNTNUMBER` int(100) DEFAULT NULL,
  `ACCOUNTNAME` varchar(255) DEFAULT NULL,
  `ORGANIZATION` int(50) NOT NULL,
  `UPDATE_ON` date DEFAULT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `COMMISSION` int(10) DEFAULT NULL,
  `MOMONAME` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='collects only the basic information of the clinician';

--
-- RELATIONSHIPS FOR TABLE `clinicianpaymentinfo`:
--

--
-- Dumping data for table `clinicianpaymentinfo`
--

INSERT INTO `clinicianpaymentinfo` (`ID`, `CLINICIANID`, `MODULE`, `MOMO`, `BANKNAME`, `BANKBRANCH`, `ACCOUNTNUMBER`, `ACCOUNTNAME`, `ORGANIZATION`, `UPDATE_ON`, `CREATED_ON`, `COMMISSION`, `MOMONAME`) VALUES
(1, 0, 'cash', 595964565, 'feditlity banck', '9393030', 0, 'Tiifu hamza', 0, '2023-09-03', '0000-00-00 00:00:00.000000', 10, NULL),
(2, 2, '', NULL, NULL, NULL, NULL, NULL, 0, '2023-09-12', '2023-09-12 07:40:42.538780', NULL, NULL),
(4, 4, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-09-12 17:37:59.431113', NULL, NULL),
(5, 5, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-09-12 17:50:52.588645', NULL, NULL),
(6, 6, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-09-12 18:28:41.207588', NULL, NULL),
(7, 7, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-09-12 19:45:35.722453', NULL, NULL),
(8, 8, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-09-12 19:53:08.712140', NULL, NULL),
(9, 9, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-09-12 20:43:12.230917', NULL, NULL),
(10, 10, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-09-23 07:49:49.758853', NULL, NULL),
(11, 11, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-10-27 04:53:39.526922', NULL, NULL),
(12, 12, '', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2023-10-28 10:38:40.198143', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `commodity`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `commodity` (
  `COMID` int(255) NOT NULL,
  `COMMODITY` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `CATEGORY` varchar(255) NOT NULL,
  `suppliedby` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `commodity`:
--

--
-- Dumping data for table `commodity`
--

INSERT INTO `commodity` (`COMID`, `COMMODITY`, `date`, `CATEGORY`, `suppliedby`) VALUES
(1, 'solutions cleaner', '2023-10-11 10:57:18.607047', 'chemicals', NULL),
(2, 'edta tubes ', '2023-10-11 10:57:18.665805', 'consumables', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `companyprofile`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `companyprofile` (
  `ID` int(255) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `MOTTO` varchar(255) NOT NULL,
  `PHONENUMBER` int(100) NOT NULL,
  `ADDRESS` varchar(255) NOT NULL,
  `ALTERNATIVENUMBER` int(10) DEFAULT NULL,
  `WEBSITE` varchar(50) DEFAULT NULL,
  `STREET` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `companyprofile`:
--

--
-- Dumping data for table `companyprofile`
--

INSERT INTO `companyprofile` (`ID`, `NAME`, `EMAIL`, `MOTTO`, `PHONENUMBER`, `ADDRESS`, `ALTERNATIVENUMBER`, `WEBSITE`, `STREET`) VALUES
(1, 'Mauplaus Diagnostic Limited', 'mauplausl@gmail.com', 'Health and happiness', 595964565, 'Opposite SDA Gbanjil Road Hse No 19', NULL, 'mauplus@gmail.com', 'Kalpohin Lowcost 30A');

-- --------------------------------------------------------

--
-- Table structure for table `departmentconsumption`
--
-- Creation: Oct 16, 2023 at 01:38 AM
--

CREATE TABLE `departmentconsumption` (
  `id` int(50) NOT NULL,
  `quantity` int(50) NOT NULL,
  `stockid` int(50) NOT NULL,
  `departmentid` int(50) NOT NULL,
  `batchnumber` varchar(50) DEFAULT NULL,
  `createdOn` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `brand` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `departmentconsumption`:
--

--
-- Dumping data for table `departmentconsumption`
--

INSERT INTO `departmentconsumption` (`id`, `quantity`, `stockid`, `departmentid`, `batchnumber`, `createdOn`, `brand`) VALUES
(1, 20, 1, 5, NULL, '2023-10-17 14:51:17.826577', 'villa'),
(2, 100, 2, 5, NULL, '2023-10-17 14:51:22.212813', 'lobba'),
(3, 70, 8, 5, '6766', '2023-10-17 14:51:26.098505', 'litmus'),
(4, 980, 1, 4, 'gerald', '2023-10-28 11:46:11.986890', 'lobba'),
(5, 3800, 2, 4, '5666', '2023-10-28 11:46:16.337547', 'johnson'),
(6, 1000, 8, 4, '6766', '2023-10-28 11:46:27.031306', 'litmus');

-- --------------------------------------------------------

--
-- Table structure for table `departmentconsumptionhx`
--
-- Creation: Oct 16, 2023 at 04:30 AM
--

CREATE TABLE `departmentconsumptionhx` (
  `comsumeid` int(255) NOT NULL,
  `department` int(50) NOT NULL,
  `stockid` int(50) NOT NULL,
  `batchnumber` varchar(50) DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `debit` int(50) NOT NULL,
  `credit` int(50) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `time` time(6) NOT NULL DEFAULT current_timestamp(),
  `employeeid` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `departmentconsumptionhx`:
--

--
-- Dumping data for table `departmentconsumptionhx`
--

INSERT INTO `departmentconsumptionhx` (`comsumeid`, `department`, `stockid`, `batchnumber`, `brand`, `debit`, `credit`, `date`, `time`, `employeeid`) VALUES
(1, 5, 8, '6766', 'litmus', 200, 300, '2023-10-17', '14:55:22.000000', 3),
(2, 5, 8, '6766', 'litmus', 0, 400000, '2023-10-17', '15:21:53.000000', 3),
(3, 5, 8, '6766', 'litmus', 4000, 0, '2023-10-17', '19:39:57.000000', 3),
(4, 5, 8, '6766', 'litmus', 396400, 0, '2023-10-18', '03:49:31.000000', 3),
(5, 5, 8, '6766', 'litmus', 30, 0, '2023-10-24', '04:27:26.000000', 3),
(6, 4, 2, '5666', 'johnson', 200, 0, '2023-10-29', '15:45:27.000000', 3),
(7, 4, 1, 'gerald', 'lobba', 20, 0, '2023-10-29', '15:45:52.000000', 3);

--
-- Triggers `departmentconsumptionhx`
--
DELIMITER $$
CREATE TRIGGER `updateDepartmentMainStocks` AFTER INSERT ON `departmentconsumptionhx` FOR EACH ROW BEGIN
UPDATE departmentstocks SET quantityAvailable = quantityAvailable - NEW.debit WHERE deptid = NEW.department AND stockid = NEW.stockid;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `departmentrequisitionhx`
--
-- Creation: Oct 17, 2023 at 11:21 AM
--

CREATE TABLE `departmentrequisitionhx` (
  `id` int(255) NOT NULL,
  `departmentid` int(255) NOT NULL,
  `stockid` int(255) NOT NULL,
  `quantity_requested` int(255) NOT NULL,
  `quantity_approved` int(255) DEFAULT NULL,
  `comsumptionunit` varchar(255) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `date` date NOT NULL DEFAULT current_timestamp(),
  `requisitionid` varchar(255) NOT NULL,
  `issue_message` text DEFAULT NULL,
  `departmentReceived` int(10) DEFAULT 0,
  `store_supplied` int(10) DEFAULT 0,
  `quantityReceived` int(20) DEFAULT 0,
  `batchnumber` varchar(50) DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `requestingemployee` int(20) NOT NULL,
  `receivingemployee` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `departmentrequisitionhx`:
--

--
-- Dumping data for table `departmentrequisitionhx`
--

INSERT INTO `departmentrequisitionhx` (`id`, `departmentid`, `stockid`, `quantity_requested`, `quantity_approved`, `comsumptionunit`, `status`, `date`, `requisitionid`, `issue_message`, `departmentReceived`, `store_supplied`, `quantityReceived`, `batchnumber`, `brand`, `requestingemployee`, `receivingemployee`) VALUES
(1, 5, 1, 1000, 20, 'g', 'received', '2023-10-17', '2411edce-17e8-4d54-b8bc-69d9bde4ea09', NULL, 1, 1, 20, NULL, 'villa', 3, 3),
(2, 5, 2, 1000, 100, 'l', 'received', '2023-10-17', '75bf445e-2b8e-4d0e-8c13-540cc389feae', NULL, 1, 1, 100, NULL, 'lobba', 3, 3),
(3, 5, 8, 1000, 400, 'ml', 'received', '2023-10-17', 'a8d2efd2-e0ae-460e-a978-57d59099a969', NULL, 1, 1, 400, '6766', 'litmus', 3, 3),
(4, 5, 8, 200, 300, 'ml', 'received', '2023-10-17', 'b06b7914-19e2-43d2-80f8-47d3a5076588', NULL, 1, 1, 300, '6766', 'litmus', 3, 3),
(5, 5, 8, 400000, 400000, 'ml', 'received', '2023-10-17', '7694c263-a47f-48fb-882c-706134695ba9', NULL, 1, 1, 400000, '6766', 'litmus', 3, 3),
(6, 4, 1, 1000, 1000, 'g', 'received', '2023-10-26', 'a198c0e5-55bb-4afa-b168-413b83feaebe', NULL, 1, 1, 1000, 'gerald', 'lobba', 3, 3),
(7, 4, 2, 4000, 4000, 'l', 'received', '2023-10-26', 'eaa7fa5a-fb72-4ce9-b997-a9b3c200eba1', NULL, 1, 1, 4000, '5666', 'johnson', 3, 3),
(8, 4, 8, 1000, 1000, 'ml', 'received', '2023-10-26', 'ad74dbcb-0377-4e99-83c9-0331482bb785', NULL, 1, 1, 1000, '6766', 'litmus', 3, 3),
(9, 4, 1, 200, NULL, 'g', 'pending', '2023-10-28', '9bbd8d55-5f3e-48af-9b7a-c1ee79f33b00', NULL, 0, 0, 0, NULL, NULL, 3, 0),
(10, 4, 2, 1000, NULL, 'l', 'pending', '2023-10-28', '39742d95-4c85-4c3a-887d-3bde8b0248f2', NULL, 0, 0, 0, NULL, NULL, 3, 0),
(11, 4, 3, 8228, NULL, 'l', 'pending', '2023-10-28', '9fc27af7-f3e8-4b3f-96e5-b3f6c1c8c8ba', NULL, 0, 0, 0, NULL, NULL, 3, 0),
(12, 4, 8, 1000, NULL, 'ml', 'pending', '2023-10-28', '7f80c8ef-d7f9-4119-9414-2c0b5cdd4013', NULL, 0, 0, 0, NULL, NULL, 3, 0);

--
-- Triggers `departmentrequisitionhx`
--
DELIMITER $$
CREATE TRIGGER `updateMainStocks` AFTER UPDATE ON `departmentrequisitionhx` FOR EACH ROW BEGIN
  -- Declare variables for stock count and batch availability
  DECLARE stock_count INT;
  DECLARE batchAvailable INT;

  -- Check if the stockid exists in departmentstocks
  SELECT COUNT(*) INTO stock_count
  FROM departmentstocks
  WHERE stockid = NEW.stockid AND deptid = OLD.departmentid;

  -- Check if a batch is available in departmentconsumption
  SELECT COUNT(*) INTO batchAvailable
  FROM departmentconsumption WHERE stockid = NEW.stockid AND batchnumber = OLD.batchnumber AND departmentid = OLD.departmentid AND brand = OLD.brand;

  -- If department received the item and the quantity received is greater than 0
  IF NEW.departmentReceived = 1 AND NEW.quantityReceived > 0 THEN
    -- Update department consumption if a batch is available
    IF batchAvailable > 0 THEN 
      -- Update the quantity in departmentconsumption
      UPDATE departmentconsumption SET quantity = NEW.quantityReceived + quantity
      WHERE stockid = NEW.stockid AND departmentid = OLD.departmentid;
    
      -- Update the historical record in departmentconsumptionhx
       
    INSERT INTO departmentconsumptionhx(department,stockid,batchnumber,brand,credit,employeeid) 
    VALUES (OLD.departmentid,NEW.stockid,OLD.batchnumber,OLD.brand,NEW.quantityReceived,NEW.receivingemployee);
    ELSE 
      -- Insert a new record in departmentconsumption if no batch is available
      INSERT INTO departmentconsumption (quantity, stockid, departmentid, batchnumber, brand) 
      VALUES (NEW.quantityReceived, OLD.stockid, OLD.departmentid, OLD.batchnumber, OLD.brand);
    END IF;

    -- Update department main stocks if stock_count is greater than 0
    IF stock_count > 0 THEN
      -- Stockid exists, update the quantityAvailable in departmentstocks
      UPDATE departmentstocks
      SET quantityAvailable = NEW.quantityReceived + quantityAvailable
      WHERE stockid = NEW.stockid AND deptid = OLD.departmentid;
    ELSE
      -- Stockid doesn't exist, insert a new record in departmentstocks
      INSERT INTO departmentstocks (stockid, quantityAvailable, deptid, comsumptionunit)
      VALUES (NEW.stockid, NEW.quantityReceived, OLD.departmentid, OLD.comsumptionunit);
    END IF;

    -- Update the generalstocks table
    UPDATE generalstocks
    SET quantity = quantity - NEW.quantityReceived
    WHERE stockid = OLD.stockid;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `departments` (
  `id` int(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `departmentManager` varchar(100) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `employeeid` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `departments`:
--

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `department`, `departmentManager`, `date`, `employeeid`) VALUES
(1, 'serology', 'tiifu', '2023-09-03 08:53:29.767465', 2),
(2, 'hematology', 'opoku razak', '2023-09-03 08:53:29.842905', 3),
(3, 'endocrinology', 'opoku razak', '2023-09-03 08:53:29.892959', 3),
(4, 'chemistry', 'Nyaaba Asana Awineyila', '2023-09-03 08:53:29.959643', 1),
(5, 'microbiology', 'Nyaaba Asana Awineyila', '2023-09-03 08:53:30.000791', 1),
(6, 'ultrasound', 'Nyaaba Asana Awineyila', '2023-10-03 07:56:04.602421', 1),
(8, 'endoscopy', 'Nyaaba Asana Awineyila', '2023-10-08 18:42:27.532698', 1);

-- --------------------------------------------------------

--
-- Table structure for table `departmentstocks`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `departmentstocks` (
  `id` int(255) NOT NULL,
  `deptid` int(255) NOT NULL,
  `stockid` int(255) NOT NULL,
  `quantityAvailable` int(255) NOT NULL,
  `date_added` date NOT NULL DEFAULT current_timestamp(),
  `dateupdated` date DEFAULT NULL,
  `comsumptionunit` varchar(210) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `departmentstocks`:
--

--
-- Dumping data for table `departmentstocks`
--

INSERT INTO `departmentstocks` (`id`, `deptid`, `stockid`, `quantityAvailable`, `date_added`, `dateupdated`, `comsumptionunit`) VALUES
(1, 5, 1, 20, '2023-10-17', NULL, 'g'),
(2, 5, 2, 100, '2023-10-17', NULL, 'l'),
(3, 5, 8, 70, '2023-10-17', NULL, 'ml'),
(4, 4, 1, 980, '2023-10-28', NULL, 'g'),
(5, 4, 2, 3800, '2023-10-28', NULL, 'l'),
(6, 4, 8, 1000, '2023-10-28', NULL, 'ml');

-- --------------------------------------------------------

--
-- Table structure for table `emailpreference`
--
-- Creation: Sep 25, 2023 at 07:46 AM
--

CREATE TABLE `emailpreference` (
  `id` int(255) NOT NULL,
  `registration` varchar(3) NOT NULL DEFAULT 'No',
  `result` varchar(3) NOT NULL DEFAULT 'No',
  `rejection` varchar(3) NOT NULL DEFAULT 'No',
  `approval` varchar(3) NOT NULL DEFAULT 'No',
  `transactions` varchar(3) NOT NULL DEFAULT 'No',
  `updated_on` datetime(6) DEFAULT NULL ON UPDATE current_timestamp(6),
  `birthday` varchar(3) NOT NULL DEFAULT 'Yes'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `emailpreference`:
--

--
-- Dumping data for table `emailpreference`
--

INSERT INTO `emailpreference` (`id`, `registration`, `result`, `rejection`, `approval`, `transactions`, `updated_on`, `birthday`) VALUES
(1, 'Yes', 'Yes', 'Yes', 'Yes', 'No', '2023-09-25 08:53:00.000000', 'No');

-- --------------------------------------------------------

--
-- Table structure for table `fshresult`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `fshresult` (
  `keyid` int(255) NOT NULL,
  `parameter` varchar(50) NOT NULL,
  `billingid` int(20) NOT NULL,
  `patientid` bigint(255) NOT NULL,
  `value` int(100) NOT NULL,
  `dateadded_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) NOT NULL,
  `comment` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `fshresult`:
--

--
-- Dumping data for table `fshresult`
--

INSERT INTO `fshresult` (`keyid`, `parameter`, `billingid`, `patientid`, `value`, `dateadded_on`, `updated_on`, `comment`) VALUES
(1, 'fsh', 73, 2023854, 444, '2023-09-15 14:38:03.042504', '2023-09-15 14:38:48.000000', 'ifoweoweiofioweio'),
(2, 'fsh', 101, 202382112, 444, '2023-10-05 21:23:18.827755', '0000-00-00 00:00:00.000000', 'kjfj2ef1wjj');

-- --------------------------------------------------------

--
-- Table structure for table `fshsetup`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `fshsetup` (
  `setupid` int(255) NOT NULL,
  `upper` int(10) NOT NULL,
  `lower` int(10) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `parameter` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `fshsetup`:
--

--
-- Dumping data for table `fshsetup`
--

INSERT INTO `fshsetup` (`setupid`, `upper`, `lower`, `unit`, `gender`, `parameter`) VALUES
(1, 88, 88, 'U/L', 'male', 'FSH'),
(2, 8888, 88, 'U/L', 'female', 'FSH');

-- --------------------------------------------------------

--
-- Table structure for table `generalemailsettings`
--
-- Creation: Sep 24, 2023 at 03:46 AM
--

CREATE TABLE `generalemailsettings` (
  `id` int(100) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `appusername` varchar(100) NOT NULL,
  `apppassword` varchar(100) NOT NULL,
  `verificationSubject` varchar(200) NOT NULL,
  `readySubject` varchar(200) NOT NULL,
  `sampleSubject` varchar(200) NOT NULL,
  `billingSubject` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `generalemailsettings`:
--

-- --------------------------------------------------------

--
-- Table structure for table `generalstocks`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `generalstocks` (
  `stockid` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` int(10) NOT NULL,
  `consumptionunit` varchar(255) NOT NULL,
  `purchaseunit` varchar(255) NOT NULL,
  `quantity` int(255) NOT NULL,
  `alertlevel` int(255) NOT NULL,
  `materialcode` varchar(255) NOT NULL,
  `updatedOn` datetime(6) DEFAULT NULL ON UPDATE current_timestamp(6),
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `generalstocks`:
--

--
-- Dumping data for table `generalstocks`
--

INSERT INTO `generalstocks` (`stockid`, `name`, `category`, `consumptionunit`, `purchaseunit`, `quantity`, `alertlevel`, `materialcode`, `updatedOn`, `date`) VALUES
(1, 'edta tubes', 2, 'g', 'box', 118980, 200, 'edta', '2023-10-28 11:46:11.986890', '2023-09-23 23:38:08.758000'),
(2, 'syringes', 1, 'l', 'ml', 51900, 100, 'KKD', '2023-10-28 11:46:16.337547', '2023-10-06 09:40:48.098000'),
(3, 'Tiifu hamza', 1, 'l', 'others', 0, 100, 'box738', '2023-10-17 13:22:25.231229', '2023-10-06 08:50:22.972000'),
(4, 'blood lancets', 1, 'l', 'l', 0, 100, 'mate7', '2023-10-16 16:44:17.304599', '2023-10-07 06:57:37.369000'),
(5, 'scan gell', 4, 'bottle', 'ml', 0, 2, 'scangell', '2023-10-16 02:38:26.687927', '2023-10-13 06:54:19.573000'),
(6, 'pricker ', 3, 'pcs', 'pcs', 0, 100, 'pricker6', '2023-10-16 16:44:17.304599', '2023-10-13 08:33:29.287851'),
(7, 'Mildred Bag', 4, 'kg', 'kg', 0, 200, 'Mild', '2023-10-16 16:44:17.304599', '2023-10-13 08:44:29.560326'),
(8, 'cotton', 2, 'ml', 'l', 168300, 8484, 'jdjdj', '2023-10-28 11:46:27.031306', '2023-10-13 09:53:21.830583');

-- --------------------------------------------------------

--
-- Table structure for table `glycated_haemoglobin`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `glycated_haemoglobin` (
  `ID` int(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `RESULT` varchar(255) NOT NULL,
  `REMARKS` varchar(255) NOT NULL,
  `TECHNOLOGY` varchar(255) DEFAULT NULL,
  `METHOD` varchar(255) DEFAULT NULL,
  `GLUCOSE` varchar(255) DEFAULT NULL,
  `TIME` time(6) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `glycated_haemoglobin`:
--

-- --------------------------------------------------------

--
-- Table structure for table `haemoglobinelectrophoresis`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `haemoglobinelectrophoresis` (
  `PARAMETER` varchar(100) NOT NULL,
  `UNIT` varchar(10) NOT NULL,
  `UPPER` int(100) NOT NULL,
  `LOWER` int(100) NOT NULL,
  `SETUPID` int(255) NOT NULL,
  `DATEADDED` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `haemoglobinelectrophoresis`:
--

--
-- Dumping data for table `haemoglobinelectrophoresis`
--

INSERT INTO `haemoglobinelectrophoresis` (`PARAMETER`, `UNIT`, `UPPER`, `LOWER`, `SETUPID`, `DATEADDED`) VALUES
('hbA', 'g/dL', 16, 12, 1, '2023-09-04 10:08:39.066339'),
('hbA2', 'g/dL', 16, 2, 2, '2023-09-04 10:08:39.066339'),
('hbF', 'g/dL', 2, 22, 3, '2023-09-04 10:08:39.066339'),
('hbS', 'g/dL', 2, 55, 4, '2023-09-04 10:08:39.066339'),
('hbC', '55', 2, 55, 5, '2023-09-04 10:08:39.066339'),
('zii', 'g/dL', 2, 55, 6, '2023-09-04 10:08:39.066339');

-- --------------------------------------------------------

--
-- Table structure for table `hepatitisbresult`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `hepatitisbresult` (
  `ID` int(100) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `PATIENTID` bigint(100) NOT NULL,
  `CREATED_ON` date DEFAULT current_timestamp(),
  `TIME` time(6) DEFAULT current_timestamp(),
  `RESULTS` varchar(255) NOT NULL,
  `SCIENTISTID` int(255) NOT NULL,
  `REMARKS` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `hepatitisbresult`:
--

--
-- Dumping data for table `hepatitisbresult`
--

INSERT INTO `hepatitisbresult` (`ID`, `BILLINGID`, `PATIENTID`, `CREATED_ON`, `TIME`, `RESULTS`, `SCIENTISTID`, `REMARKS`) VALUES
(1, 1, 2023729, '2023-09-03', '09:02:53.000000', 'non reactive', 2, 'jdjwdfjkwdfj'),
(2, 58, 2023854, '2023-09-05', '11:26:47.000000', 'non reactive', 2, 'kle;fioefuiqo7fyuqwjh'),
(3, 61, 202385, '2023-09-05', '11:34:42.000000', 'non reactive', 2, 'juduqwfqwyu'),
(4, 73, 2023854, '2023-09-15', '14:37:34.000000', 'non reactive', 2, 'kwfiwiwefiiwef'),
(5, 66, 2023854, '2023-09-18', '13:01:32.000000', 'non reactive', 2, 'kwefkfoqioio'),
(6, 84, 202382111, '2023-10-03', '08:06:15.000000', 'non reactive', 2, 'kgkkgwjgjwfj');

-- --------------------------------------------------------

--
-- Table structure for table `hepatitisb_profile`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `hepatitisb_profile` (
  `ID` int(255) NOT NULL,
  `HBsAg` varchar(50) NOT NULL DEFAULT 'non reactive',
  `HBsAb` varchar(50) NOT NULL DEFAULT 'non reactive',
  `HBeAg` varchar(50) NOT NULL DEFAULT 'non reactive',
  `HBeAb` varchar(50) NOT NULL DEFAULT 'non reactive',
  `HBcAb` varchar(50) NOT NULL DEFAULT 'non reactive',
  `COMMENTS` varchar(255) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `CREATED_ON` date DEFAULT current_timestamp(),
  `UPDATED_ON` date DEFAULT NULL,
  `SCIENTIST` varchar(100) DEFAULT NULL,
  `PATIENTID` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `hepatitisb_profile`:
--

--
-- Dumping data for table `hepatitisb_profile`
--

INSERT INTO `hepatitisb_profile` (`ID`, `HBsAg`, `HBsAb`, `HBeAg`, `HBeAb`, `HBcAb`, `COMMENTS`, `BILLINGID`, `CREATED_ON`, `UPDATED_ON`, `SCIENTIST`, `PATIENTID`) VALUES
(1, 'non reactive', 'non reactive', 'reactive', 'reactive', 'reactive', 'wekfkwejkwekj', 5, '2023-09-04', NULL, NULL, 2023729),
(2, 'reactive', 'reactive', 'non reactive', 'reactive', 'non reactive', 'wdkjqJFKAFUY', 36, '2023-09-04', NULL, NULL, 2023729),
(3, 'reactive', 'reactive', 'reactive', 'reactive', 'non reactive', 'qfjkjqwfwfhjh', 62, '2023-09-06', NULL, NULL, 2023854),
(4, 'reactive', 'non reactive', 'reactive', 'non reactive', 'reactive', 'weiogoweoiqwefoqwerio', 70, '2023-09-18', NULL, NULL, 2023854),
(5, 'reactive', 'non reactive', 'reactive', 'reactive', 'reactive', 'no rounds ', 114, '2023-10-28', NULL, NULL, 20239723);

-- --------------------------------------------------------

--
-- Table structure for table `hepatitiscresult`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `hepatitiscresult` (
  `ID` int(100) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `PATIENTID` bigint(100) NOT NULL,
  `CREATED_ON` date DEFAULT current_timestamp(),
  `TIME` time(6) DEFAULT current_timestamp(),
  `RESULTS` varchar(255) NOT NULL,
  `SCIENTISTID` int(255) NOT NULL,
  `REMARKS` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `hepatitiscresult`:
--

--
-- Dumping data for table `hepatitiscresult`
--

INSERT INTO `hepatitiscresult` (`ID`, `BILLINGID`, `PATIENTID`, `CREATED_ON`, `TIME`, `RESULTS`, `SCIENTISTID`, `REMARKS`) VALUES
(1, 34, 2023729, '2023-09-04', '12:47:33.000000', 'reactive', 2, 'iweiwiqwi'),
(2, 50, 202384, '2023-09-04', '16:32:13.000000', 'non reactive', 2, '3kjeetu2et2euifjkwxm,zui\njiwuflwegjeug2eifwduijefjejf\n\nejwfjwefj2efjwdwyfuefsvwduig\n\njhejkwei2eioo2ei2eio2r'),
(3, 49, 202384, '2023-09-04', '17:24:31.000000', 'non reactive', 2, 'wdkjawhjwej'),
(4, 61, 202385, '2023-09-05', '11:34:20.000000', 'non reactive', 2, 'juweujuqwfy');

-- --------------------------------------------------------

--
-- Table structure for table `lhresult`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `lhresult` (
  `keyid` int(255) NOT NULL,
  `parameter` varchar(50) NOT NULL,
  `billingid` int(20) NOT NULL,
  `patientid` bigint(255) NOT NULL,
  `value` int(100) NOT NULL,
  `dateadded_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) NOT NULL,
  `comment` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `lhresult`:
--

--
-- Dumping data for table `lhresult`
--

INSERT INTO `lhresult` (`keyid`, `parameter`, `billingid`, `patientid`, `value`, `dateadded_on`, `updated_on`, `comment`) VALUES
(1, 'lh', 101, 202382112, 777, '2023-10-05 21:23:28.095631', '0000-00-00 00:00:00.000000', 'kjqshfqwjj'),
(2, 'LH', 103, 20239720, 444, '2023-10-07 10:26:34.427341', '2023-10-07 10:38:31.000000', 'kekkqkkwkk');

-- --------------------------------------------------------

--
-- Table structure for table `lhsetup`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `lhsetup` (
  `setupid` int(255) NOT NULL,
  `upper` int(10) NOT NULL,
  `lower` int(10) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `parameter` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `lhsetup`:
--

--
-- Dumping data for table `lhsetup`
--

INSERT INTO `lhsetup` (`setupid`, `upper`, `lower`, `unit`, `gender`, `parameter`) VALUES
(1, 499, 88, 'U/L', 'male', 'LH'),
(2, 949, 99, 'U/L', 'female', 'LH');

-- --------------------------------------------------------

--
-- Table structure for table `loginlogs`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `loginlogs` (
  `keyid` int(255) NOT NULL,
  `loginTime` datetime(6) NOT NULL,
  `employeeid` int(10) NOT NULL,
  `loginSessionId` int(10) NOT NULL,
  `logoutTime` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `loginlogs`:
--

-- --------------------------------------------------------

--
-- Table structure for table `malaria`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `malaria` (
  `KEY` int(255) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `SPECIES` varchar(255) NOT NULL,
  `COMMENTS` varchar(255) NOT NULL,
  `PARASITENUMBER` int(60) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `malaria`:
--

--
-- Dumping data for table `malaria`
--

INSERT INTO `malaria` (`KEY`, `PATIENTID`, `BILLINGID`, `SPECIES`, `COMMENTS`, `PARASITENUMBER`, `CREATED_ON`, `UPDATED_ON`) VALUES
(1, 2023729, 1, 'Falciparum', 'oiwiwefi', 100, '2023-09-03 09:01:43.626931', NULL),
(2, 2023854, 63, 'Falciparum', 'kgwjgkwjk', 18, '2023-09-06 10:44:41.349574', NULL),
(3, 20238186, 78, 'Falciparum', 'ieieiifoqweo', 2120, '2023-09-18 10:16:54.200351', NULL),
(4, 2023854, 71, 'Falciparum', 'iowefiwefiooqweoioi', 500, '2023-09-18 13:01:19.677786', NULL),
(5, 202382111, 79, 'Falciparum', '<p>severe aneamia		</p>', 4949, '2023-09-21 09:54:01.460682', '2023-09-25 23:11:52.000000'),
(6, 202382111, 80, 'Falciparum', 'uwduwifquu', 400, '2023-09-21 12:52:18.246753', NULL),
(7, 20238187, 98, 'Falciparum', 'kwkwdkkwfk', 200, '2023-10-05 10:09:29.779214', NULL),
(8, 20238155, 109, 'ovalex', 'hwvjjvwdsjjjscjjj', 290, '2023-10-09 05:26:08.810072', NULL),
(9, 20239723, 108, 'Falciparum', 'k2efjfyudhwefhwhfhdfhwdfhqh  hwfhhwvuwiifdfqhfdfiwdifq   ywdfqufuwd\n\n\nhwfhwdhfqtfqufuya', 8238, '2023-10-10 19:24:24.690064', NULL),
(10, 20239723, 111, 'ovalex', 'iqsqsjaj', 88, '2023-10-17 19:34:48.441375', NULL),
(11, 202392724, 118, 'Falciparum', 'jfjfjdjjjsj', 100, '2023-10-28 10:19:24.602066', NULL),
(12, 20239723, 110, 'Falciparum', 'kdkwdkk', 120, '2023-10-30 13:45:29.165821', NULL),
(13, 20239721, 112, 'Falciparum', 'kwdkwkk', 400, '2023-10-30 13:46:13.402324', NULL),
(14, 20239723, 107, 'Falciparum', 'oiwfkwei', 120, '2023-10-30 13:46:42.028086', NULL),
(15, 20238155, 122, 'Falciparum', 'Malaria reactive', 400, '2023-10-31 00:37:25.188668', NULL),
(16, 202310127, 125, 'Falciparum', 'Malaria parasites seen', 200, '2023-11-04 02:28:18.924044', NULL),
(17, 202310428, 127, 'Falciparum', 'Malaria parasites seen ', 300, '2023-11-06 16:40:47.668993', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `manager_sample_descision`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `manager_sample_descision` (
  `sampleid` int(255) NOT NULL,
  `billingid` int(255) NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `manager` varchar(255) DEFAULT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `testid` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `manager_sample_descision`:
--

-- --------------------------------------------------------

--
-- Table structure for table `new_patients`
--
-- Creation: Sep 21, 2023 at 09:46 AM
--

CREATE TABLE `new_patients` (
  `ID` int(255) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `FIRSTNAME` varchar(100) NOT NULL,
  `EMAIL` varchar(100) DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `AGE` int(10) NOT NULL,
  `GENDER` varchar(10) NOT NULL DEFAULT 'FEMALE',
  `MARITAL_STATUS` varchar(50) NOT NULL,
  `MOBILE_NUMBER` varchar(13) NOT NULL,
  `AGETYPE` varchar(10) NOT NULL,
  `OCCUPATION` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `ACTIVATION_STATUS` varchar(10) NOT NULL DEFAULT 'FALSE',
  `LASTNAME` varchar(255) NOT NULL,
  `MIDDLENAME` varchar(255) DEFAULT NULL,
  `ORGANIZATION` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `new_patients`:
--

--
-- Dumping data for table `new_patients`
--

INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FIRSTNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `MARITAL_STATUS`, `MOBILE_NUMBER`, `AGETYPE`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`, `LASTNAME`, `MIDDLENAME`, `ORGANIZATION`) VALUES
(4, 202385, 'Tiifu', 'hamzatiifu45@gmail.com', '1995-11-06', 27, 'male', 'married', '0509594565', 'years', 'Nursing', '2023-09-05', 'TRUE', 'Hamza', 'botonso n', 'leonides'),
(5, 2023854, 'tiifu', 'hamzatiifu45@gmail.com', '1996-12-06', 27, 'male', 'married', '595964565', '', 'Nursing', '2023-09-05', 'TRUE', 'hamza', 'kojo', 'Leonides'),
(6, 20238155, 'tiifu hamza', 'hamzatiifu455@gmail.com', '1991-11-06', 31, 'male', 'married', '0595964565', 'years', 'Nursing', '2023-09-15', 'TRUE', 'hamza', 'kojo', 'leonides'),
(7, 20238186, 'haruna', 'harunadams44@gmail.com', '1991-11-06', 31, 'male', 'single', '0202002025', 'years', 'Nursing', '2023-09-18', 'TRUE', 'adams', 'stubborn', 'Tamale senior high school'),
(10, 20238187, 'haruna', 'harunadams474@gmail.com', '1991-11-06', 31, 'male', 'single', '0202002025', 'years', 'Nursing', '2023-09-18', 'TRUE', 'adams', 'stubborn', 'Tamale senior high school'),
(11, 202381910, 'florence', 'florence@mail.com', '1983-11-27', 39, 'female', 'married', '0506305306', 'years', 'Teacher', '2023-09-19', 'TRUE', 'ayaaba', 'awain', 'Leonides'),
(12, 202382111, 'nyaaba', 'xelobcoder45@gmail.com', '1995-11-06', 27, 'female', 'married', '0249434803', 'years', 'nursing', '2023-09-21', 'TRUE', 'asana', 'awineyila', 'Leonides'),
(18, 202382112, 'natalie', 'tiifuofficial@gmail.com', '1991-11-06', 31, 'male', 'married', '0249434876', '', 'Nursing', '2023-09-21', 'TRUE', 'fort ', 'HKSL', 'Labhill'),
(19, 20239518, 'tiifu', 'hamza45@gmail.com', '1995-11-06', 27, 'male', 'single', '0595967778', 'years', 'Nursing', '2023-10-05', 'TRUE', 'hamza', 'kojo', 'Leonides'),
(20, 20239619, 'aputunliga', 'apuntin@nyaaba.com', '1993-03-03', 30, 'female', 'married', '0543085842', 'years', 'nursinfg ', '2023-10-06', 'TRUE', 'nyaaba', 'asana', 'Bimbilla hospital'),
(21, 20239720, 'issifu', 'issifuyussif@gmail.com', '0000-00-00', 29, 'male', 'married', '200000000', '', 'nursind', '2023-10-07', 'TRUE', 'yussif', 'john', 'leonides'),
(22, 20239721, 'alhaji', 'hamzatiifu45props@gmail.com', '0000-00-00', 27, 'male', 'married', '0294949637', 'years', 'Malam', '2023-10-07', 'TRUE', 'salam', 'Ibrahim', 'Itikaja'),
(23, 20239722, 'tiifu', 'tiifu@gmail.com', '1882-11-06', 140, 'female', 'married', '0595900000', 'years', 'Nursing', '2023-10-07', 'TRUE', 'hamza', 'boronson', 'leonides'),
(24, 20239723, 'jane', 'xelobcoder@gmail.com', '1992-11-11', 30, 'other', 'married', '400000000', '', 'Nursing', '2023-10-07', 'TRUE', 'filla', 'middlename', 'Leonides'),
(25, 202392724, 'tiifu', 'hamzatiifu45xsuccess@gmail.com', '1995-11-06', 27, 'male', 'married', '0506305307', 'years', 'software engineer', '2023-10-27', 'TRUE', 'hamza', 'boronson', 'Leonides'),
(26, 202393125, 'nyaaba ', 'love@gmail.com', '1994-11-06', 28, 'female', 'married', '0547738388', 'years', 'house wife', '2023-10-31', 'TRUE', 'lovw', '', 'nurisnn'),
(27, 202393126, 'nyaaba ', 'lovyyye@gmail.com', '1994-11-06', 28, 'female', 'married', '0548738388', 'years', 'house wife', '2023-10-31', 'TRUE', 'lovw', '', 'nurisnn'),
(28, 202310127, 'tiifu', 'asaanayaaba47775@yahoo.com', '1994-07-11', 29, 'female', 'married', '0597567763', 'years', 'Nursing', '2023-11-01', 'TRUE', 'asana ', 'nyaaba', 'leonides technologies'),
(29, 202310428, 'abrahman', 'gorleku@gmail.com', '1911-11-11', 111, 'male', 'married', '0595956456', 'years', 'retired teacher', '2023-11-04', 'TRUE', 'joseph', 'gorleku', 'none');

--
-- Triggers `new_patients`
--
DELIMITER $$
CREATE TRIGGER `autoAddress` AFTER INSERT ON `new_patients` FOR EACH ROW BEGIN 
 INSERT INTO patientsaddress(PATIENTID) VALUE(NEW.PATIENTID);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `autoCredentials` AFTER INSERT ON `new_patients` FOR EACH ROW BEGIN 
INSERT INTO patients_credentials(PATIENTID,USERNAME,PASSWORD)
VALUES(NEW.PATIENTID,CONCAT(NEW.FIRSTNAME,NEW.LASTNAME),CONCAT(NEW.FIRSTNAME,NEW.LASTNAME,NEW.PATIENTID));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `autoDeleting` AFTER DELETE ON `new_patients` FOR EACH ROW BEGIN
 DELETE FROM patientsaddress WHERE patientid = OLD.PATIENTID;
 END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `autoDeletingBillingids` AFTER DELETE ON `new_patients` FOR EACH ROW BEGIN 
DELETE FROM billing WHERE PATIENTID = OLD.PATIENTID;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `autoEmmergency` AFTER INSERT ON `new_patients` FOR EACH ROW BEGIN 
 INSERT INTO patientemmergencycontactinformation(patientid) VALUE(NEW.PATIENTID);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `autoEmmergencyDelete` AFTER DELETE ON `new_patients` FOR EACH ROW BEGIN
 DELETE FROM patientemmergencycontactinformation WHERE patientid = OLD.PATIENTID;
 END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `autoPatientsSettings` AFTER INSERT ON `new_patients` FOR EACH ROW BEGIN 
INSERT INTO patients_settings(PATIENTID)
VALUES(NEW.PATIENTID);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `orderreceivedaccountsummary`
--
-- Creation: Oct 13, 2023 at 06:05 AM
--

CREATE TABLE `orderreceivedaccountsummary` (
  `orderTransactionid` bigint(50) DEFAULT NULL,
  `taxAmount` int(20) DEFAULT NULL,
  `method` varchar(20) NOT NULL DEFAULT 'absolute',
  `debit` int(50) NOT NULL DEFAULT 0,
  `credit` int(50) NOT NULL DEFAULT 0,
  `insertedOn` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedOn` datetime(6) DEFAULT NULL ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `orderreceivedaccountsummary`:
--

--
-- Dumping data for table `orderreceivedaccountsummary`
--

INSERT INTO `orderreceivedaccountsummary` (`orderTransactionid`, `taxAmount`, `method`, `debit`, `credit`, `insertedOn`, `updatedOn`) VALUES
(1697545418110, 2000, 'absolute', 12002000, 0, '2023-10-17 13:23:38.117625', '2023-10-17 13:25:16.000000'),
(1697545818728, 5000, 'absolute', 741008, 0, '2023-10-17 13:30:18.731316', '2023-10-17 13:31:46.000000'),
(1698490452810, NULL, 'absolute', 0, 0, '2023-10-28 11:54:12.813154', NULL),
(1699476988728, NULL, 'absolute', 0, 0, '2023-11-08 20:56:28.737499', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--
-- Creation: Oct 15, 2023 at 05:36 PM
--

CREATE TABLE `orders` (
  `productordersid` int(255) NOT NULL,
  `stockid` int(255) NOT NULL,
  `orderTransactionid` bigint(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `supplierid` int(255) NOT NULL,
  `suppliername` varchar(255) NOT NULL,
  `purchaseunit` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `quantity` int(255) NOT NULL,
  `received` varchar(255) DEFAULT 'FALSE',
  `quantityReceived` int(255) DEFAULT 0,
  `batchnumber` varchar(255) DEFAULT NULL,
  `balance` int(255) DEFAULT 0,
  `expirydate` date DEFAULT NULL,
  `receiveddate` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `price` int(255) DEFAULT 0,
  `totalamount` int(255) DEFAULT 0,
  `productused` varchar(50) DEFAULT 'FALSE',
  `pricing` varchar(15) NOT NULL DEFAULT 'unit',
  `brand` varchar(70) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `orders`:
--

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`productordersid`, `stockid`, `orderTransactionid`, `name`, `supplierid`, `suppliername`, `purchaseunit`, `date`, `quantity`, `received`, `quantityReceived`, `batchnumber`, `balance`, `expirydate`, `receiveddate`, `status`, `price`, `totalamount`, `productused`, `pricing`, `brand`) VALUES
(1, 1, 1697545418110, 'edta tubes', 3, 'king joe suppliers', 'Box', '2023-10-17 13:23:38.117625', 50000, 'TRUE', 50000, '7838', 0, '2023-11-05', '2023-10-13', 'received', 20, 1000000, 'FALSE', 'unit', 'villa'),
(2, 8, 1697545418110, 'cotton', 1, 'johnson johnson', 'Box', '2023-10-17 13:23:38.128459', 500000, 'TRUE', 500000, '6766', 0, '2023-11-05', '2023-09-28', 'received', 20, 10000000, 'FALSE', 'unit', 'litmus'),
(3, 2, 1697545418110, 'syringes', 1, 'johnson johnson', 'g', '2023-10-17 13:23:38.128632', 50000, 'TRUE', 50000, '5666', 0, '2023-11-05', '2023-09-27', 'received', 20, 1000000, 'FALSE', 'unit', 'johnson'),
(4, 1, 1697545818728, 'edta tubes', 1, 'johnson johnson', 'Bottle', '2023-10-17 13:30:18.731316', 70000, 'TRUE', 70000, 'gerald', 0, '2023-11-04', '2023-10-05', 'received', 10, 700000, 'FALSE', 'unit', 'lobba'),
(5, 2, 1697545818728, 'syringes', 3, 'king joe suppliers', 'Box', '2023-10-17 13:30:18.731482', 6000, 'TRUE', 6000, 'nitmz', 0, '2023-10-28', '2023-10-13', 'received', 0, 1008, 'FALSE', 'unit', 'lobba'),
(6, 8, 1697545818728, 'cotton', 1, 'johnson johnson', 'Box', '2023-10-17 13:30:18.731606', 70000, 'TRUE', 70000, 'nimx', 0, '2023-10-27', '2023-10-05', 'received', 1, 35000, 'FALSE', 'unit', 'lobba'),
(7, 1, 1698490452810, 'edta tubes', 3, 'king joe suppliers', 'g', '2023-10-28 11:54:12.813154', 4000, 'FALSE', 0, NULL, 0, NULL, NULL, NULL, 0, 0, 'FALSE', 'unit', NULL),
(8, 2, 1699476988728, 'syringes', 1, 'johnson johnson', 'kg', '2023-11-08 20:56:28.737499', 500, 'FALSE', 0, NULL, 0, NULL, NULL, NULL, 0, 0, 'FALSE', 'unit', NULL);

--
-- Triggers `orders`
--
DELIMITER $$
CREATE TRIGGER `createorderTransactionSummary` AFTER INSERT ON `orders` FOR EACH ROW BEGIN
INSERT INTO orderreceivedaccountsummary (orderTransactionid) VALUE(NEW.orderTransactionid) ON DUPLICATE KEY UPDATE orderTransactionid = NEW.orderTransactionid;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `updateGeneralStocksOnUpdate` AFTER UPDATE ON `orders` FOR EACH ROW BEGIN
    UPDATE generalstocks
    SET quantity= quantity + NEW.quantityReceived,updatedOn = NOW()  WHERE stockid = NEW.stockid;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `organization`
--
-- Creation: Nov 01, 2023 at 06:46 PM
--

CREATE TABLE `organization` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `mobile` int(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `gpsmapping` varchar(255) DEFAULT NULL,
  `website` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `organization`:
--

--
-- Dumping data for table `organization`
--

INSERT INTO `organization` (`id`, `name`, `location`, `street`, `mobile`, `address`, `email`, `region`, `gpsmapping`, `website`) VALUES
(1, 'leonides', 'tamale', 'Kalpohin Lowcost 30A', 2147483647, 'Kalpohin Lowcost 30A', 'hamzatiifu45@gmail.com', 'Northern', 'NS-9309-399', 'www.leonides.com'),
(7, 'leonides technologies and suivellance', 'tamale', 'Kalpohin Lowcost 30A', 2147483647, 'Kalpohin Lowcost 30A', 'hamzatiifu45@gmail.com', 'Northern', NULL, 'www.leonides.com'),
(8, 'tiifu boronson engineering and principals', 'tamale ', 'jolly friends', 241758559, 'Kalpohin Lowcost 30A', 'hamzatiifu45@gemail.com', 'Eastern', NULL, ''),
(9, 'kabsad hospital', 'tamale', 'Kalpohin Lowcost 30A', 2147483647, 'Tamale Technical university, Wurishes', 'hamzatiifu45@gmail.com', 'Northern', NULL, '0595964565');

--
-- Triggers `organization`
--
DELIMITER $$
CREATE TRIGGER `insertIntoContactNaccount` AFTER INSERT ON `organization` FOR EACH ROW BEGIN 
INSERT INTO organizationcontactperson(organizationid) VALUE(NEW.id);

INSERT INTO organizationaccountinformation (organizationid) VALUE(NEW.id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `organizationaccountinformation`
--
-- Creation: Nov 04, 2023 at 12:37 AM
--

CREATE TABLE `organizationaccountinformation` (
  `id` int(11) NOT NULL,
  `organizationid` int(11) NOT NULL,
  `bankname` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `accountname` varchar(255) DEFAULT NULL,
  `account` varchar(255) DEFAULT NULL,
  `module` varchar(20) DEFAULT 'cash',
  `momoname` varchar(100) DEFAULT NULL,
  `momo` int(15) DEFAULT NULL,
  `commission` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `organizationaccountinformation`:
--

--
-- Dumping data for table `organizationaccountinformation`
--

INSERT INTO `organizationaccountinformation` (`id`, `organizationid`, `bankname`, `branch`, `accountname`, `account`, `module`, `momoname`, `momo`, `commission`) VALUES
(1, 7, NULL, NULL, NULL, NULL, 'cash', NULL, NULL, 0),
(2, 8, 'Access bank', 'Tamale', 'tiifu hamza', '8349493993', 'momo', 'tiifu hamqa', 241758557, 10),
(3, 9, NULL, NULL, NULL, NULL, 'cash', NULL, NULL, 10);

-- --------------------------------------------------------

--
-- Table structure for table `organizationcontactperson`
--
-- Creation: Nov 02, 2023 at 02:46 PM
--

CREATE TABLE `organizationcontactperson` (
  `id` int(11) NOT NULL,
  `organizationid` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` int(14) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `organizationcontactperson`:
--

--
-- Dumping data for table `organizationcontactperson`
--

INSERT INTO `organizationcontactperson` (`id`, `organizationid`, `name`, `email`, `mobile`) VALUES
(1, 7, 'tiifu hamza kojo hamza', 'hamzatiifu45@gmail.com', 2147483647),
(2, 8, 'Tiifu Hamza', 'tiifuofficial@gmail.com', 241758550),
(3, 9, 'nyaaba mildred', 'hamzatiifu45@gmail.com', 2147483647);

-- --------------------------------------------------------

--
-- Table structure for table `pageaccess`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `pageaccess` (
  `keyid` int(255) NOT NULL,
  `employeeid` int(255) NOT NULL,
  `registration` tinyint(1) NOT NULL,
  `billing` tinyint(1) NOT NULL,
  `inventory` tinyint(1) NOT NULL,
  `supply` tinyint(1) NOT NULL,
  `payments` tinyint(1) NOT NULL,
  `approval` tinyint(1) NOT NULL,
  `settings` tinyint(1) NOT NULL,
  `phelobotomy` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `pageaccess`:
--

-- --------------------------------------------------------

--
-- Table structure for table `patientemmergencycontactinformation`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `patientemmergencycontactinformation` (
  `keyid` int(100) NOT NULL,
  `patientid` bigint(100) NOT NULL,
  `emmergencyContactName` varchar(50) DEFAULT NULL,
  `emmergencyContactNumber` varchar(50) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `patientemmergencycontactinformation`:
--

--
-- Dumping data for table `patientemmergencycontactinformation`
--

INSERT INTO `patientemmergencycontactinformation` (`keyid`, `patientid`, `emmergencyContactName`, `emmergencyContactNumber`, `relationship`, `occupation`, `address`) VALUES
(3, 202385, NULL, NULL, NULL, NULL, NULL),
(4, 2023854, NULL, NULL, NULL, NULL, NULL),
(5, 20238155, NULL, NULL, NULL, NULL, NULL),
(6, 20238186, NULL, NULL, NULL, NULL, NULL),
(8, 0, NULL, NULL, NULL, NULL, NULL),
(9, 20238187, NULL, NULL, NULL, NULL, NULL),
(10, 202381910, NULL, NULL, NULL, NULL, NULL),
(11, 202382111, NULL, NULL, NULL, NULL, NULL),
(17, 202382112, NULL, NULL, NULL, NULL, NULL),
(18, 20239518, NULL, NULL, NULL, NULL, NULL),
(19, 20239619, NULL, NULL, NULL, NULL, NULL),
(20, 20239720, NULL, NULL, NULL, NULL, NULL),
(21, 20239721, NULL, NULL, NULL, NULL, NULL),
(22, 20239722, NULL, NULL, NULL, NULL, NULL),
(23, 20239723, NULL, NULL, NULL, NULL, NULL),
(24, 202392724, NULL, NULL, NULL, NULL, NULL),
(25, 202393125, NULL, NULL, NULL, NULL, NULL),
(26, 202393126, NULL, NULL, NULL, NULL, NULL),
(27, 202310127, NULL, NULL, NULL, NULL, NULL),
(28, 202310428, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `patientsaddress`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `patientsaddress` (
  `keyid` int(255) NOT NULL,
  `patientid` bigint(100) NOT NULL,
  `area` varchar(100) DEFAULT NULL,
  `region` varchar(50) DEFAULT NULL,
  `gpsLocation` varchar(50) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `patientsaddress`:
--

--
-- Dumping data for table `patientsaddress`
--

INSERT INTO `patientsaddress` (`keyid`, `patientid`, `area`, `region`, `gpsLocation`, `address`) VALUES
(3, 202385, NULL, NULL, NULL, NULL),
(4, 2023854, 'kalpohin', 'Northern region', 'oeooeo', 'gbanjili'),
(5, 20238155, NULL, NULL, NULL, NULL),
(6, 20238186, NULL, NULL, NULL, NULL),
(8, 0, NULL, NULL, NULL, NULL),
(9, 20238187, NULL, NULL, NULL, NULL),
(10, 202381910, 'Sagni', 'northern ', 'NS-48499-84', 'sagni preparatory school'),
(11, 202382111, NULL, NULL, NULL, NULL),
(17, 202382112, 'Tamale', 'Northern ', 'NS-3848-4848', 'Kalpohin Lowcost 30A'),
(18, 20239518, 'kalpohin', 'lowcost 30A', 'NS-3949-383', 'TAMALE'),
(19, 20239619, 'Tamale Technical University', 'Northern region', 'NS-3849-744', 'Kalpohin lowcost 30A'),
(20, 20239720, 'kalpohin lowcost 30A', 'Northern region ', 'NS-3748-4848', 'Tamale Area 73737'),
(21, 20239721, NULL, NULL, NULL, NULL),
(22, 20239722, NULL, NULL, NULL, NULL),
(23, 20239723, NULL, NULL, NULL, NULL),
(24, 202392724, NULL, NULL, NULL, NULL),
(25, 202393125, NULL, NULL, NULL, NULL),
(26, 202393126, NULL, NULL, NULL, NULL),
(27, 202310127, NULL, NULL, NULL, NULL),
(28, 202310428, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `patients_credentials`
--
-- Creation: Sep 21, 2023 at 07:33 AM
--

CREATE TABLE `patients_credentials` (
  `id` int(20) NOT NULL,
  `patientid` bigint(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `updated` varchar(6) NOT NULL DEFAULT 'false',
  `updated_on` datetime(6) NOT NULL DEFAULT '0000-00-00 00:00:00.000000' ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `patients_credentials`:
--

--
-- Dumping data for table `patients_credentials`
--

INSERT INTO `patients_credentials` (`id`, `patientid`, `username`, `password`, `updated`, `updated_on`) VALUES
(2, 20238187, 'harunaadams', '$2b$10$TPqAW/hIh843kSvPLafwy.tGaC9VW17BMY6FgqozqSyw0WGRm5F2S', 'false', '0000-00-00 00:00:00.000000'),
(3, 202381910, 'florenceayaaba', '$2b$10$Ejjuwfy1KnH87Adgb0dGxu41ENmNnyuW8xPOinmAfWfJ6ZLUa55mW', 'true', '2023-09-21 08:55:44.667026'),
(4, 202382111, 'nyaabaasana', '$2b$10$p3SaU4hgG0M9GIxqfBLWAerUbfe31YYyqW1h8hR9nVBhTH0v7xfKa', 'true', '2023-09-21 09:13:55.449348'),
(10, 202382112, 'nataliefort ', 'nataliefort 202382112', 'false', '0000-00-00 00:00:00.000000'),
(11, 20239518, 'tiifuhamza', 'tiifuhamza20239518', 'false', '0000-00-00 00:00:00.000000'),
(12, 20239619, 'aputunliganyaaba', 'aputunliganyaaba20239619', 'false', '0000-00-00 00:00:00.000000'),
(13, 20239720, 'issifuyussif', 'issifuyussif20239720', 'false', '0000-00-00 00:00:00.000000'),
(14, 20239721, 'alhajisalam', 'alhajisalam20239721', 'false', '0000-00-00 00:00:00.000000'),
(15, 20239722, 'tiifuhamza', 'tiifuhamza20239722', 'false', '0000-00-00 00:00:00.000000'),
(16, 20239723, 'janefilla', 'janefilla20239723', 'false', '0000-00-00 00:00:00.000000'),
(17, 202392724, 'tiifuhamza', 'tiifuhamza202392724', 'false', '0000-00-00 00:00:00.000000'),
(18, 202393125, 'nyaaba lovw', 'nyaaba lovw202393125', 'false', '0000-00-00 00:00:00.000000'),
(19, 202393126, 'nyaaba lovw', 'nyaaba lovw202393126', 'false', '0000-00-00 00:00:00.000000'),
(20, 202310127, 'tiifuasana ', 'tiifuasana 202310127', 'false', '0000-00-00 00:00:00.000000'),
(21, 202310428, 'abrahmanjoseph', 'abrahmanjoseph202310428', 'false', '0000-00-00 00:00:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `patients_settings`
--
-- Creation: Sep 22, 2023 at 02:06 AM
--

CREATE TABLE `patients_settings` (
  `id` int(50) NOT NULL,
  `patientid` bigint(50) NOT NULL,
  `mode` varchar(50) NOT NULL DEFAULT 'hardcopy',
  `method` varchar(50) NOT NULL DEFAULT 'None',
  `notify` tinyint(1) DEFAULT 1,
  `_read` tinyint(1) DEFAULT NULL,
  `read_on` datetime(6) DEFAULT NULL,
  `authenticated` tinyint(1) NOT NULL DEFAULT 0,
  `authenticationMode` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `patients_settings`:
--

--
-- Dumping data for table `patients_settings`
--

INSERT INTO `patients_settings` (`id`, `patientid`, `mode`, `method`, `notify`, `_read`, `read_on`, `authenticated`, `authenticationMode`) VALUES
(1, 202382112, 'WhatApp', 'email', 0, NULL, NULL, 0, NULL),
(2, 20239518, 'WhatApp', 'sms', 0, NULL, NULL, 0, NULL),
(3, 20239619, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(4, 20239720, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(5, 20239721, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(6, 20239722, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(7, 20239723, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(8, 202392724, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(9, 202393125, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(10, 202393126, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(11, 202310127, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL),
(12, 202310428, 'hardcopy', 'None', 1, NULL, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `paymentmodes`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `paymentmodes` (
  `KeyID` int(255) NOT NULL,
  `PaymentMode` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `paymentmodes`:
--

--
-- Dumping data for table `paymentmodes`
--

INSERT INTO `paymentmodes` (`KeyID`, `PaymentMode`) VALUES
(3, 'bank transfer'),
(4, 'cash'),
(2, 'cheque'),
(5, 'invoice'),
(1, 'momo');

-- --------------------------------------------------------

--
-- Table structure for table `performing_test`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `performing_test` (
  `ID` int(255) NOT NULL,
  `PATIENTID` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `URGENCY` varchar(255) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `SAMPLING_CENTER` int(25) NOT NULL,
  `PHELOBOTOMIST` int(100) DEFAULT NULL,
  `TIME` time(6) NOT NULL DEFAULT current_timestamp(),
  `PHELOBOTOMY_MESSAGE` varchar(255) NOT NULL,
  `INSPECTION` int(11) NOT NULL,
  `INSPECTION_TIME` time(6) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `performing_test`:
--

--
-- Dumping data for table `performing_test`
--

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `PHELOBOTOMIST`, `TIME`, `PHELOBOTOMY_MESSAGE`, `INSPECTION`, `INSPECTION_TIME`) VALUES
(58, '2023854', '2023-09-05', 'moderate', 58, 1, NULL, '11:24:11.000000', '', 0, '11:24:11.000000'),
(59, '202385', '2023-09-05', 'none', 59, 1, NULL, '11:25:17.000000', '', 0, '11:25:17.000000'),
(60, '202385', '2023-09-05', 'emmergency', 60, 1, NULL, '11:32:19.000000', '', 0, '11:32:19.000000'),
(61, '202385', '2023-09-05', 'none', 61, 1, NULL, '11:32:40.000000', '', 0, '11:32:40.000000'),
(62, '2023854', '2023-09-06', 'moderate', 62, 1, NULL, '09:55:18.000000', '', 0, '09:55:18.000000'),
(63, '2023854', '2023-09-06', 'moderate', 63, 1, NULL, '10:19:02.000000', '', 0, '10:19:02.000000'),
(64, '2023854', '2023-09-11', 'moderate', 64, 5, NULL, '07:52:14.000000', '', 0, '07:52:14.000000'),
(65, '202385', '2023-09-11', 'moderate', 65, 5, NULL, '07:53:01.000000', '', 0, '07:53:01.000000'),
(66, '2023854', '2023-09-11', 'none', 66, 2, NULL, '08:07:34.000000', '', 0, '08:07:34.000000'),
(67, '202385', '2023-09-12', 'none', 67, 4, NULL, '04:58:32.000000', '', 0, '04:58:32.000000'),
(68, '2023854', '2023-09-12', 'none', 68, 1, NULL, '08:51:18.000000', '', 0, '08:51:18.000000'),
(69, '2023854', '2023-09-12', 'moderate', 69, 3, NULL, '20:44:09.000000', '', 0, '20:44:09.000000'),
(70, '2023854', '2023-09-12', 'emmergency', 70, 1, NULL, '20:51:52.000000', '', 0, '20:51:52.000000'),
(71, '2023854', '2023-09-12', 'moderate', 71, 1, NULL, '23:35:01.000000', '', 0, '23:35:01.000000'),
(72, '202385', '2023-09-13', 'moderate', 72, 1, NULL, '00:08:07.000000', '', 0, '00:08:07.000000'),
(73, '2023854', '2023-09-13', 'moderate', 73, 4, NULL, '01:49:24.000000', '', 0, '01:49:24.000000'),
(74, '2023854', '2023-09-13', 'moderate', 74, 1, NULL, '06:12:29.000000', '', 0, '06:12:29.000000'),
(75, '2023854', '2023-09-17', 'moderate', 75, 5, NULL, '10:36:55.000000', '', 0, '10:36:55.000000'),
(76, '2023854', '2023-09-18', 'emmergency', 76, 5, NULL, '09:37:48.000000', '', 0, '09:37:48.000000'),
(77, '2023854', '2023-09-18', 'none', 77, 5, NULL, '09:59:19.000000', '', 0, '09:59:19.000000'),
(78, '20238186', '2023-09-18', 'emmergency', 78, 4, NULL, '10:15:37.000000', '', 0, '10:15:37.000000'),
(79, '202382111', '2023-09-21', 'none', 79, 4, NULL, '09:41:11.000000', '', 0, '09:41:11.000000'),
(80, '202382111', '2023-09-21', 'moderate', 80, 4, NULL, '12:47:50.000000', '', 0, '12:47:50.000000'),
(81, '2023854', '2023-09-21', 'moderate', 81, 4, NULL, '12:51:17.000000', '', 0, '12:51:17.000000'),
(82, '202382112', '2023-09-21', 'emmergency', 82, 4, NULL, '17:48:52.000000', '', 0, '17:48:52.000000'),
(83, '202382111', '2023-09-23', 'moderate', 83, 4, NULL, '07:50:17.000000', '', 0, '07:50:17.000000'),
(84, '202382111', '2023-10-03', 'moderate', 84, 2, NULL, '07:47:53.000000', '', 0, '07:47:53.000000'),
(85, '20238186', '2023-10-03', 'moderate', 85, 4, NULL, '09:48:00.000000', '', 0, '09:48:00.000000'),
(86, '20238186', '2023-10-03', 'none', 86, 4, NULL, '09:48:45.000000', '', 0, '09:48:45.000000'),
(87, '202381910', '2023-10-03', 'emmergency', 87, 4, NULL, '09:49:35.000000', '', 0, '09:49:35.000000'),
(88, '202382111', '2023-10-03', 'none', 88, 4, NULL, '09:50:07.000000', '', 0, '09:50:07.000000'),
(89, '202381910', '2023-10-01', 'emmergency', 89, 4, NULL, '10:56:38.000000', '', 0, '10:56:38.000000'),
(90, '202382112', '2023-10-04', 'none', 90, 4, NULL, '12:28:28.000000', '', 0, '12:28:28.000000'),
(91, '202382112', '2023-10-04', 'none', 91, 4, NULL, '12:28:28.000000', '', 0, '12:28:28.000000'),
(92, '202381910', '2023-10-01', 'emmergency', 92, 4, NULL, '12:41:55.000000', '', 0, '12:41:55.000000'),
(93, '202382112', '2023-10-04', 'emmergency', 93, 4, NULL, '21:45:30.000000', '', 0, '21:45:30.000000'),
(94, '2023854', '2023-10-04', 'moderate', 94, 4, NULL, '22:00:12.000000', '', 0, '22:00:12.000000'),
(95, '202382111', '2023-10-05', 'none', 95, 4, NULL, '08:05:47.000000', '', 0, '08:05:47.000000'),
(96, '20238187', '2023-10-05', 'moderate', 96, 4, NULL, '08:10:15.000000', '', 0, '08:10:15.000000'),
(97, '20238155', '2023-10-05', 'none', 97, 4, NULL, '09:14:37.000000', '', 0, '09:14:37.000000'),
(98, '20238187', '2023-10-02', 'moderate', 98, 4, NULL, '10:08:46.000000', '', 0, '10:08:46.000000'),
(99, '20238187', '2023-10-05', 'emmergency', 99, 4, NULL, '20:22:54.000000', '', 0, '20:22:54.000000'),
(100, '202381910', '2023-10-05', 'moderate', 100, 4, NULL, '21:10:35.000000', '', 0, '21:10:35.000000'),
(101, '202382112', '2023-10-05', 'moderate', 101, 5, NULL, '21:22:21.000000', '', 0, '21:22:21.000000'),
(102, '202382112', '2023-10-06', 'moderate', 102, 4, NULL, '03:19:49.000000', '', 0, '03:19:49.000000'),
(103, '20239720', '2023-10-07', 'moderate', 103, 4, NULL, '10:03:18.000000', '', 0, '10:03:18.000000'),
(104, '20239721', '2023-10-07', 'none', 104, 4, NULL, '10:52:09.000000', '', 0, '10:52:09.000000'),
(105, '20239722', '2023-10-07', 'moderate', 105, 4, NULL, '18:51:14.000000', '', 0, '18:51:14.000000'),
(106, '20239723', '2023-10-07', 'moderate', 106, 4, NULL, '19:32:06.000000', '', 0, '19:32:06.000000'),
(107, '20239723', '2023-10-07', 'none', 107, 4, NULL, '19:52:20.000000', '', 0, '19:52:20.000000'),
(108, '20239723', '2023-10-08', 'none', 108, 2, NULL, '04:16:21.000000', '', 0, '04:16:21.000000'),
(109, '20238155', '2023-10-09', 'none', 109, 4, NULL, '05:25:10.000000', '', 0, '05:25:10.000000'),
(110, '20239723', '2023-10-10', 'emmergency', 110, 2, NULL, '05:46:08.000000', '', 0, '05:46:08.000000'),
(111, '20239723', '2023-10-11', 'none', 111, 10, NULL, '09:33:02.000000', '', 0, '09:33:02.000000'),
(112, '20239721', '2023-10-17', 'moderate', 112, 2, NULL, '11:21:25.000000', '', 0, '11:21:25.000000'),
(113, '20239723', '2023-10-17', 'moderate', 113, 4, NULL, '19:51:16.000000', '', 0, '19:51:16.000000'),
(114, '20239723', '2023-10-17', 'none', 114, 10, NULL, '19:59:20.000000', '', 0, '19:59:20.000000'),
(115, '20239619', '2023-10-26', 'emmergency', 115, 10, NULL, '07:51:17.000000', '', 0, '07:51:17.000000'),
(116, '20239723', '2023-10-27', 'none', 116, 10, NULL, '04:54:17.000000', '', 0, '04:54:17.000000'),
(117, '20239723', '2023-10-27', 'none', 117, 10, NULL, '04:54:17.000000', '', 0, '04:54:17.000000'),
(118, '202392724', '2023-10-28', 'none', 118, 10, NULL, '10:17:04.000000', '', 0, '10:17:04.000000'),
(119, '20239723', '2023-10-28', 'none', 119, 10, NULL, '10:48:04.000000', '', 0, '10:48:04.000000'),
(120, '202392724', '2023-10-29', 'none', 120, 4, NULL, '14:29:30.000000', '', 0, '14:29:30.000000'),
(121, '202392724', '2023-10-31', 'none', 121, 10, NULL, '00:25:47.000000', '', 0, '00:25:47.000000'),
(122, '20238155', '2023-10-31', 'moderate', 122, 9, NULL, '00:35:31.000000', '', 0, '00:35:31.000000'),
(123, '202393126', '2023-11-01', 'none', 123, 10, NULL, '00:49:57.000000', '', 0, '00:49:57.000000'),
(124, '202393126', '2023-11-03', 'moderate', 124, 10, NULL, '00:14:27.000000', '', 0, '00:14:27.000000'),
(125, '202310127', '2023-11-04', 'none', 125, 1, NULL, '01:53:57.000000', '', 0, '01:53:57.000000'),
(127, '202310428', '2023-11-06', 'none', 127, 10, NULL, '13:17:24.000000', '', 0, '13:17:24.000000'),
(128, '202310428', '2023-11-06', 'none', 128, 10, NULL, '16:08:24.000000', '', 0, '16:08:24.000000'),
(129, '202310428', '2023-11-08', 'none', 129, 10, NULL, '20:53:30.000000', '', 0, '20:53:30.000000');

--
-- Triggers `performing_test`
--
DELIMITER $$
CREATE TRIGGER `onDeletePerformingTest` AFTER DELETE ON `performing_test` FOR EACH ROW BEGIN
DELETE FROM test_ascension  WHERE billingid = OLD.billingid;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `psaresult`
--
-- Creation: Oct 07, 2023 at 09:33 AM
--

CREATE TABLE `psaresult` (
  `keyid` int(255) NOT NULL,
  `parameter` varchar(50) NOT NULL,
  `billingid` int(20) NOT NULL,
  `patientid` bigint(255) NOT NULL,
  `value` int(100) NOT NULL,
  `dateadded_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) NOT NULL,
  `comment` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `psaresult`:
--

--
-- Dumping data for table `psaresult`
--

INSERT INTO `psaresult` (`keyid`, `parameter`, `billingid`, `patientid`, `value`, `dateadded_on`, `updated_on`, `comment`) VALUES
(1, 'PSA', 103, 20239720, 8848, '2023-10-07 10:45:06.656859', '0000-00-00 00:00:00.000000', 'jfjwfjjj'),
(2, 'PSA', 107, 20239723, 55, '2023-10-10 19:23:38.720847', '0000-00-00 00:00:00.000000', 'kekkwdkvhvjjsdvkakvajvkdvwdjks  hwjhasdjkvavadkva   \njfjwjvdvjjwdfs kxskvkkvhjwdvjsjkvajkjkajk\n\n'),
(3, 'PSA', 122, 20238155, 10, '2023-10-31 00:37:08.725457', '0000-00-00 00:00:00.000000', 'PSA high');

-- --------------------------------------------------------

--
-- Table structure for table `psasetup`
--
-- Creation: Oct 07, 2023 at 09:35 AM
--

CREATE TABLE `psasetup` (
  `setupid` int(255) NOT NULL,
  `upper` int(10) NOT NULL,
  `lower` int(10) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `parameter` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `psasetup`:
--

--
-- Dumping data for table `psasetup`
--

INSERT INTO `psasetup` (`setupid`, `upper`, `lower`, `unit`, `gender`, `parameter`) VALUES
(1, 200, 100, 'U/L', 'male', '  PSA'),
(2, 200, 100, 'U/L', 'female', 'PSA');

-- --------------------------------------------------------

--
-- Table structure for table `result_aids`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_aids` (
  `keyid` int(255) NOT NULL,
  `reaction` varchar(50) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL,
  `billingid` int(50) NOT NULL,
  `patientid` bigint(255) NOT NULL,
  `comments` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_aids`:
--

-- --------------------------------------------------------

--
-- Table structure for table `result_beta_hcg`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_beta_hcg` (
  `KEYID` int(255) NOT NULL,
  `VALUE` varchar(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `UNIT` varchar(20) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) DEFAULT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `COMMENTS` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_beta_hcg`:
--

-- --------------------------------------------------------

--
-- Table structure for table `result_cardiac_enzymes`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_cardiac_enzymes` (
  `LIVERID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `VALUE` int(20) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `PATIENTID` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_cardiac_enzymes`:
--

--
-- Dumping data for table `result_cardiac_enzymes`
--

INSERT INTO `result_cardiac_enzymes` (`LIVERID`, `PARAMETER`, `BILLINGID`, `VALUE`, `CREATED_ON`, `UPDATED_ON`, `PATIENTID`) VALUES
(1, 'creatinine kinase (CK)', 34, 550, '2023-09-04 12:47:24.511382', '2023-09-04 12:47:24.511382', 2023729),
(2, 'aspartate transaminase(AST)', 34, 525, '2023-09-04 12:47:24.511382', '2023-09-04 12:47:24.511382', 2023729),
(3, 'lactate dehydrogenase (LDH)', 34, 55, '2023-09-04 12:47:24.511382', '2023-09-04 12:47:24.511382', 2023729),
(4, 'creatinine kinase (CK)', 35, 444, '2023-09-04 12:48:02.865218', '2023-09-04 12:48:02.865218', 2023729),
(5, 'aspartate transaminase(AST)', 35, 444, '2023-09-04 12:48:02.865218', '2023-09-04 12:48:02.865218', 2023729),
(6, 'lactate dehydrogenase (LDH)', 35, 44, '2023-09-04 12:48:02.865218', '2023-09-04 12:48:02.865218', 2023729),
(7, 'creatinine kinase (CK)', 37, 444, '2023-09-04 12:49:12.974642', '2023-09-04 12:49:12.974642', 2023729),
(8, 'aspartate transaminase(AST)', 37, 44, '2023-09-04 12:49:12.974642', '2023-09-04 12:49:12.974642', 2023729),
(9, 'lactate dehydrogenase (LDH)', 37, 44, '2023-09-04 12:49:12.974642', '2023-09-04 12:49:12.974642', 2023729),
(10, 'creatinine kinase (CK)', 43, 54554, '2023-09-04 17:24:22.474909', '2023-09-04 17:24:22.474909', 202384),
(11, 'aspartate transaminase(AST)', 43, 444, '2023-09-04 17:24:22.474909', '2023-09-04 17:24:22.474909', 202384),
(12, 'lactate dehydrogenase (LDH)', 43, 444, '2023-09-04 17:24:22.474909', '2023-09-04 17:24:22.474909', 202384),
(13, 'creatinine kinase (CK)', 46, 444, '2023-09-04 17:24:54.450054', '2023-09-04 17:24:54.450054', 202384),
(14, 'aspartate transaminase(AST)', 46, 4, '2023-09-04 17:24:54.450054', '2023-09-04 17:24:54.450054', 202384),
(15, 'lactate dehydrogenase (LDH)', 46, 44, '2023-09-04 17:24:54.450054', '2023-09-04 17:24:54.450054', 202384),
(16, 'creatinine kinase (CK)', 48, 444, '2023-09-04 17:25:04.354330', '2023-09-04 17:25:04.354330', 202384),
(17, 'aspartate transaminase(AST)', 48, 444, '2023-09-04 17:25:04.354330', '2023-09-04 17:25:04.354330', 202384),
(18, 'lactate dehydrogenase (LDH)', 48, 444, '2023-09-04 17:25:04.354330', '2023-09-04 17:25:04.354330', 202384),
(19, 'creatinine kinase (CK)', 60, 555, '2023-09-05 11:34:13.012162', '2023-09-05 11:34:13.012162', 202385),
(20, 'aspartate transaminase(AST)', 60, 555, '2023-09-05 11:34:13.012162', '2023-09-05 11:34:13.012162', 202385),
(21, 'lactate dehydrogenase (LDH)', 60, 55, '2023-09-05 11:34:13.012162', '2023-09-05 11:34:13.012162', 202385),
(22, 'creatinine kinase (CK)', 74, 444, '2023-09-15 14:41:14.449552', '2023-09-15 14:41:14.449552', 2023854),
(23, 'aspartate transaminase(AST)', 74, 444, '2023-09-15 14:41:14.449552', '2023-09-15 14:41:14.449552', 2023854),
(24, 'lactate dehydrogenase (LDH)', 74, 444, '2023-09-15 14:41:14.449552', '2023-09-15 14:41:14.449552', 2023854),
(25, 'creatinine kinase (CK)', 84, 100, '2023-10-03 09:14:21.644768', '2023-10-03 09:14:21.644768', 202382111),
(26, 'aspartate transaminase(AST)', 84, 100, '2023-10-03 09:14:21.644768', '2023-10-03 09:14:21.644768', 202382111),
(27, 'lactate dehydrogenase (LDH)', 84, 100, '2023-10-03 09:14:21.644768', '2023-10-03 09:14:21.644768', 202382111),
(28, 'creatinine kinase (CK)', 102, 82, '2023-10-06 12:23:02.086329', '2023-10-06 12:23:02.086329', 202382112),
(29, 'aspartate transaminase(AST)', 102, 993, '2023-10-06 12:23:02.086329', '2023-10-06 12:23:02.086329', 202382112),
(30, 'lactate dehydrogenase (LDH)', 102, 939, '2023-10-06 12:23:02.086329', '2023-10-06 12:23:02.086329', 202382112),
(31, 'creatinine kinase (CK)', 87, 55, '2023-10-07 17:33:17.538269', '2023-10-07 17:33:17.538269', 202381910),
(32, 'aspartate transaminase(AST)', 87, 55, '2023-10-07 17:33:17.538269', '2023-10-07 17:33:17.538269', 202381910),
(33, 'lactate dehydrogenase (LDH)', 87, 55, '2023-10-07 17:33:17.538269', '2023-10-07 17:33:17.538269', 202381910),
(34, 'creatinine kinase (CK)', 107, 100, '2023-10-30 13:46:32.148551', '2023-10-30 13:46:32.148551', 20239723),
(35, 'aspartate transaminase(AST)', 107, 100, '2023-10-30 13:46:32.148551', '2023-10-30 13:46:32.148551', 20239723),
(36, 'lactate dehydrogenase (LDH)', 107, 100, '2023-10-30 13:46:32.148551', '2023-10-30 13:46:32.148551', 20239723);

-- --------------------------------------------------------

--
-- Table structure for table `result_comments`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_comments` (
  `keyid` int(255) NOT NULL,
  `testid` int(50) NOT NULL,
  `billingid` int(50) NOT NULL,
  `comments` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_comments`:
--

--
-- Dumping data for table `result_comments`
--

INSERT INTO `result_comments` (`keyid`, `testid`, `billingid`, `comments`) VALUES
(1, 4, 1, 'wefjjfu'),
(2, 11, 4, 'wkjjfkwfjw'),
(3, 11, 5, 'l3rl3rlle'),
(4, 5, 34, '5uuwffuysfuq'),
(5, 5, 35, '4lkdjjqs'),
(6, 11, 36, 'e;lkoiwfjqwfljkh'),
(7, 5, 37, '44'),
(8, 10, 37, 'wkejfuiqwfi'),
(9, 10, 45, 'jdgjkwgjhjhafwdhfn'),
(10, 5, 43, '44wfkwgjkwefgdqfhmqwsjh'),
(11, 5, 46, '4'),
(12, 5, 48, 'JKFJKWdGHQGDH'),
(13, 11, 58, 'korfelf;euif2ep9egf\n\nifioe;kluefio;elefiuguefk\n\n\nwfidgi3rgyuviefg[pwuirqik'),
(14, 5, 60, 'wkfjqjkfjhqjheh'),
(15, 4, 62, 'jfuiwquiududu'),
(16, 11, 62, '5qwkwfgh'),
(17, 15, 63, 'kgkwekgk'),
(18, 4, 67, 'hhh'),
(19, 4, 73, 'oef2efi2if2'),
(20, 5, 74, 'fkowkfjj'),
(21, 22, 78, '3rke3kfkoefko'),
(22, 4, 69, 'jfjfjqfhqfgw'),
(23, 4, 66, 'kefoqwoioqwo\nkwiirfiw\n\n\nuefuiqrui'),
(24, 4, 70, 'ieriowefiowfioefo\noweoffopofofofws\n;wkfwlfl2flqfkqe\n\nk2eqkgwf\'olq\'l'),
(25, 22, 79, 'ugoiegiefkwfj'),
(26, 5, 84, 'JFJWW\n\nFARHan is here to stay and have a good time so that things can be better for him'),
(27, 5, 102, '99292929'),
(28, 5, 87, '2k2fwdjhjh'),
(29, 11, 112, 'oego2eo1o'),
(30, 5, 107, 'jjjjj'),
(31, 10, 128, 'jddjj');

-- --------------------------------------------------------

--
-- Table structure for table `result_esr`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_esr` (
  `keyid` int(100) NOT NULL,
  `value` int(40) NOT NULL,
  `comments` varchar(255) NOT NULL,
  `billingid` int(100) NOT NULL,
  `patientid` bigint(100) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_esr`:
--

--
-- Dumping data for table `result_esr`
--

INSERT INTO `result_esr` (`keyid`, `value`, `comments`, `billingid`, `patientid`, `created_on`, `updated_on`) VALUES
(1, 67, 'kwfkkj', 76, 2023854, '2023-09-18 10:00:01.204534', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `result_fasting_blood_sugar`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_fasting_blood_sugar` (
  `keyid` int(255) NOT NULL,
  `billingid` int(60) NOT NULL,
  `patientid` bigint(50) NOT NULL,
  `result` int(50) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL,
  `comments` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_fasting_blood_sugar`:
--

-- --------------------------------------------------------

--
-- Table structure for table `result_function_full_blood_count`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_function_full_blood_count` (
  `KEYID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `UNIT` varchar(20) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `VALUE` int(20) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_function_full_blood_count`:
--

--
-- Dumping data for table `result_function_full_blood_count`
--

INSERT INTO `result_function_full_blood_count` (`KEYID`, `PARAMETER`, `BILLINGID`, `UNIT`, `CREATED_ON`, `UPDATED_ON`, `VALUE`, `PATIENTID`) VALUES
(1, 'wbc', 78, '', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 555, 20238186),
(2, 'neutrophils', 78, 'g/dl', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 4544, 20238186),
(3, 'eosinophils', 78, '', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 444, 20238186),
(4, 'basophils', 78, '', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 44, 20238186),
(5, 'lymphocytes', 78, '', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 4454, 20238186),
(6, 'monocytes', 78, 'g/hj', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 45, 20238186),
(7, 'mch', 78, 'g/hj', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 55, 20238186),
(8, 'mcv', 78, 'g/hj', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 5, 20238186),
(9, 'mchc', 78, '%', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 555, 20238186),
(10, 'rdw-cv', 78, '%', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 555, 20238186),
(11, 'rdw-sd', 78, '%', '2023-09-18 10:16:43.079918', '2023-09-18 10:16:43.079918', 55, 20238186),
(12, 'wbc', 79, '', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 88, 202382111),
(13, 'neutrophils', 79, 'g/dl', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 899, 202382111),
(14, 'eosinophils', 79, '', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 88, 202382111),
(15, 'basophils', 79, '', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 99, 202382111),
(16, 'lymphocytes', 79, '', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 89, 202382111),
(17, 'monocytes', 79, 'g/hj', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 9, 202382111),
(18, 'mch', 79, 'g/hj', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 99, 202382111),
(19, 'mcv', 79, 'g/hj', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 999, 202382111),
(20, 'mchc', 79, '%', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 8999, 202382111),
(21, 'rdw-cv', 79, '%', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 658, 202382111),
(22, 'rdw-sd', 79, '%', '2023-09-21 19:30:35.664553', '2023-09-21 19:30:35.664553', 555, 202382111);

-- --------------------------------------------------------

--
-- Table structure for table `result_function_liver`
--
-- Creation: Sep 04, 2023 at 04:15 AM
--

CREATE TABLE `result_function_liver` (
  `liverid` int(255) NOT NULL,
  `parameter` varchar(255) NOT NULL,
  `billingid` int(255) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL,
  `value` int(255) NOT NULL,
  `patientid` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_function_liver`:
--

--
-- Dumping data for table `result_function_liver`
--

INSERT INTO `result_function_liver` (`liverid`, `parameter`, `billingid`, `unit`, `created_on`, `updated_on`, `value`, `patientid`) VALUES
(1, 'albumin', 37, 'mg/dl', '2023-09-04 12:49:23.169744', NULL, 55, 2023729),
(2, 'total protein', 37, 'mg/dl', '2023-09-04 12:49:23.169744', NULL, 55, 2023729),
(3, 'alp', 37, 'mg/dl', '2023-09-04 12:49:23.169744', NULL, 555, 2023729),
(4, 'ast', 37, 'mg/dl', '2023-09-04 12:49:23.169744', NULL, 555, 2023729),
(5, 'alt', 37, 'mg/dl', '2023-09-04 12:49:23.169744', NULL, 5555, 2023729),
(6, 'bun', 37, 'mg/dl', '2023-09-04 12:49:23.169744', NULL, 555, 2023729),
(7, 'creatinine', 37, 'mg/dl', '2023-09-04 12:49:23.169744', NULL, 55, 2023729),
(8, 'albumin', 45, 'mg/dl', '2023-09-04 16:03:37.930716', NULL, 200, 202384),
(9, 'total protein', 45, 'mg/dl', '2023-09-04 16:03:37.930716', NULL, 49, 202384),
(10, 'alp', 45, 'mg/dl', '2023-09-04 16:03:37.930716', NULL, 9404, 202384),
(11, 'ast', 45, 'mg/dl', '2023-09-04 16:03:37.930716', NULL, 94994, 202384),
(12, 'alt', 45, 'mg/dl', '2023-09-04 16:03:37.930716', NULL, 9499, 202384),
(13, 'bun', 45, 'mg/dl', '2023-09-04 16:03:37.930716', NULL, 9393, 202384),
(14, 'creatinine', 45, 'mg/dl', '2023-09-04 16:03:37.930716', NULL, 9439, 202384),
(15, 'albumin', 128, 'mg/dl', '2023-11-06 16:41:14.229962', NULL, 30, 202310428),
(16, 'total protein', 128, 'mg/dl', '2023-11-06 16:41:14.229962', NULL, 40, 202310428),
(17, 'alp', 128, 'mg/dl', '2023-11-06 16:41:14.229962', NULL, 30, 202310428),
(18, 'ast', 128, 'mg/dl', '2023-11-06 16:41:14.229962', NULL, 30, 202310428),
(19, 'alt', 128, 'mg/dl', '2023-11-06 16:41:14.229962', NULL, 3, 202310428),
(20, 'bun', 128, 'mg/dl', '2023-11-06 16:41:14.229962', NULL, 3, 202310428),
(21, 'creatinine', 128, 'mg/dl', '2023-11-06 16:41:14.229962', NULL, 839, 202310428);

-- --------------------------------------------------------

--
-- Table structure for table `result_function_renal`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_function_renal` (
  `KEYID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `UNIT` varchar(20) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `VALUE` int(20) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_function_renal`:
--

--
-- Dumping data for table `result_function_renal`
--

INSERT INTO `result_function_renal` (`KEYID`, `PARAMETER`, `BILLINGID`, `UNIT`, `CREATED_ON`, `UPDATED_ON`, `VALUE`, `PATIENTID`) VALUES
(1, 'BUN', 4, 'mg/dl', '2023-09-04 05:14:38.312845', '2023-09-04 05:14:38.312845', 445, 2023729),
(2, 'Creatinine', 4, 'mg/dl', '2023-09-04 05:14:38.312845', '2023-09-04 05:14:38.312845', 555, 2023729),
(3, 'potasium', 4, 'mg/dl', '2023-09-04 05:14:38.312845', '2023-09-04 05:14:38.312845', 555, 2023729),
(4, 'sodium', 4, 'mg/dl', '2023-09-04 05:14:38.312845', '2023-09-04 05:14:38.312845', 666, 2023729),
(5, 'chloride', 4, 'mg/dl', '2023-09-04 05:14:38.312845', '2023-09-04 05:14:38.312845', 111, 2023729),
(6, 'bicarbonate', 4, 'mg/dl', '2023-09-04 05:14:38.312845', '2023-09-04 05:14:38.312845', 7777, 2023729),
(7, 'albumin', 4, 'mg/dl', '2023-09-04 05:14:38.312845', '2023-09-04 05:14:38.312845', 888, 2023729),
(8, 'BUN', 5, 'mg/dl', '2023-09-04 05:21:55.590047', '2023-09-04 05:21:55.590047', 555, 2023729),
(9, 'Creatinine', 5, 'mg/dl', '2023-09-04 05:21:55.590047', '2023-09-04 05:21:55.590047', 55, 2023729),
(10, 'potasium', 5, 'mg/dl', '2023-09-04 05:21:55.590047', '2023-09-04 05:21:55.590047', 55, 2023729),
(11, 'sodium', 5, 'mg/dl', '2023-09-04 05:21:55.590047', '2023-09-04 05:21:55.590047', 5, 2023729),
(12, 'chloride', 5, 'mg/dl', '2023-09-04 05:21:55.590047', '2023-09-04 05:21:55.590047', 55, 2023729),
(13, 'bicarbonate', 5, 'mg/dl', '2023-09-04 05:21:55.590047', '2023-09-04 05:21:55.590047', 5, 2023729),
(14, 'albumin', 5, 'mg/dl', '2023-09-04 05:21:55.590047', '2023-09-04 05:21:55.590047', 555, 2023729),
(15, 'BUN', 36, 'mg/dl', '2023-09-04 12:48:28.371105', '2023-09-04 12:48:28.371105', 12, 2023729),
(16, 'Creatinine', 36, 'mg/dl', '2023-09-04 12:48:28.371105', '2023-09-04 12:48:28.371105', 121, 2023729),
(17, 'potasium', 36, 'mg/dl', '2023-09-04 12:48:28.371105', '2023-09-04 12:48:28.371105', 221, 2023729),
(18, 'sodium', 36, 'mg/dl', '2023-09-04 12:48:28.371105', '2023-09-04 12:48:28.371105', 11, 2023729),
(19, 'chloride', 36, 'mg/dl', '2023-09-04 12:48:28.371105', '2023-09-04 12:48:28.371105', 11, 2023729),
(20, 'bicarbonate', 36, 'mg/dl', '2023-09-04 12:48:28.371105', '2023-09-04 12:48:28.371105', 11, 2023729),
(21, 'albumin', 36, 'mg/dl', '2023-09-04 12:48:28.371105', '2023-09-04 12:48:28.371105', 11, 2023729),
(22, 'BUN', 58, 'mg/dl', '2023-09-05 11:26:39.651770', '2023-09-05 11:26:39.651770', 44, 2023854),
(23, 'Creatinine', 58, 'mg/dl', '2023-09-05 11:26:39.651770', '2023-09-05 11:26:39.651770', 44, 2023854),
(24, 'potasium', 58, 'mg/dl', '2023-09-05 11:26:39.651770', '2023-09-05 11:26:39.651770', 599, 2023854),
(25, 'sodium', 58, 'mg/dl', '2023-09-05 11:26:39.651770', '2023-09-05 11:26:39.651770', 568, 2023854),
(26, 'chloride', 58, 'mg/dl', '2023-09-05 11:26:39.651770', '2023-09-05 11:26:39.651770', 5589, 2023854),
(27, 'bicarbonate', 58, 'mg/dl', '2023-09-05 11:26:39.651770', '2023-09-05 11:26:39.651770', 566, 2023854),
(28, 'albumin', 58, 'mg/dl', '2023-09-05 11:26:39.651770', '2023-09-05 11:26:39.651770', 69, 2023854),
(29, 'BUN', 62, 'mg/dl', '2023-09-06 09:56:24.875914', '2023-09-06 09:56:24.875914', 555, 2023854),
(30, 'Creatinine', 62, 'mg/dl', '2023-09-06 09:56:24.875914', '2023-09-06 09:56:24.875914', 55, 2023854),
(31, 'potasium', 62, 'mg/dl', '2023-09-06 09:56:24.875914', '2023-09-06 09:56:24.875914', 55, 2023854),
(32, 'sodium', 62, 'mg/dl', '2023-09-06 09:56:24.875914', '2023-09-06 09:56:24.875914', 555, 2023854),
(33, 'chloride', 62, 'mg/dl', '2023-09-06 09:56:24.875914', '2023-09-06 09:56:24.875914', 55, 2023854),
(34, 'bicarbonate', 62, 'mg/dl', '2023-09-06 09:56:24.875914', '2023-09-06 09:56:24.875914', 55, 2023854),
(35, 'albumin', 62, 'mg/dl', '2023-09-06 09:56:24.875914', '2023-09-06 09:56:24.875914', 5, 2023854),
(36, 'BUN', 112, 'mg/dl', '2023-10-30 13:46:04.253241', '2023-10-30 13:46:04.253241', 88, 20239721),
(37, 'Creatinine', 112, 'mg/dl', '2023-10-30 13:46:04.253241', '2023-10-30 13:46:04.253241', 44, 20239721),
(38, 'potasium', 112, 'mg/dl', '2023-10-30 13:46:04.253241', '2023-10-30 13:46:04.253241', 444, 20239721),
(39, 'sodium', 112, 'mg/dl', '2023-10-30 13:46:04.253241', '2023-10-30 13:46:04.253241', 44, 20239721),
(40, 'chloride', 112, 'mg/dl', '2023-10-30 13:46:04.253241', '2023-10-30 13:46:04.253241', 444, 20239721),
(41, 'bicarbonate', 112, 'mg/dl', '2023-10-30 13:46:04.253241', '2023-10-30 13:46:04.253241', 444, 20239721),
(42, 'albumin', 112, 'mg/dl', '2023-10-30 13:46:04.253241', '2023-10-30 13:46:04.253241', 444, 20239721),
(43, 'ahDy', 112, 'UH', '2023-10-30 13:46:04.253241', '2023-10-30 13:46:04.253241', 44, 20239721);

-- --------------------------------------------------------

--
-- Table structure for table `result_haemoglobin_electrophoresis`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_haemoglobin_electrophoresis` (
  `keyid` int(255) NOT NULL,
  `parameter` varchar(255) NOT NULL,
  `billingid` int(255) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL,
  `value` int(255) NOT NULL,
  `patientid` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_haemoglobin_electrophoresis`:
--

-- --------------------------------------------------------

--
-- Table structure for table `result_helicobacter_pylori`
--
-- Creation: Sep 03, 2023 at 12:32 PM
--

CREATE TABLE `result_helicobacter_pylori` (
  `keyid` int(255) NOT NULL,
  `specimen` varchar(50) NOT NULL,
  `result` varchar(50) NOT NULL,
  `billingid` int(50) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL,
  `patientid` bigint(255) NOT NULL,
  `comments` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_helicobacter_pylori`:
--

--
-- Dumping data for table `result_helicobacter_pylori`
--

INSERT INTO `result_helicobacter_pylori` (`keyid`, `specimen`, `result`, `billingid`, `created_on`, `updated_on`, `patientid`, `comments`) VALUES
(1, 'blood', 'non reactive', 3, '2023-09-03 14:39:35.466056', NULL, 2023729, 'jefujwejwewek\n\n\nprobably'),
(2, 'blood', 'non reactive', 2, '2023-09-03 14:43:09.644603', NULL, 2023729, 'fljkkfkwfhfefujqehfjh\njejejtjej\nprince is here to stay\ngoing to time with in close database and probably things'),
(3, 'blood', 'non reactive', 52, '2023-09-05 05:43:59.951468', NULL, 202384, 'wekgjkgjk'),
(4, 'blood', 'non reactive', 59, '2023-09-05 11:27:15.568153', NULL, 202385, 'ekofilwgwhufykfpoo\n\niowgiuigfuwefoweuiui\n\n\nefiwgoegufiwdfui'),
(5, 'blood', 'non reactive', 78, '2023-09-18 10:17:02.523009', NULL, 20238186, 'hello world my dear');

-- --------------------------------------------------------

--
-- Table structure for table `result_lipid_profile`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_lipid_profile` (
  `keyid` int(255) NOT NULL,
  `parameter` varchar(255) NOT NULL,
  `billingid` int(255) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL,
  `value` int(255) NOT NULL,
  `patientid` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_lipid_profile`:
--

-- --------------------------------------------------------

--
-- Table structure for table `result_pregnancy_test`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_pregnancy_test` (
  `KEYID` int(255) NOT NULL,
  `METHOD` varchar(50) NOT NULL,
  `VALUE` varchar(10) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `COMMENTS` varchar(255) DEFAULT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `BILLINGID` int(60) NOT NULL,
  `TESTID` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_pregnancy_test`:
--

--
-- Dumping data for table `result_pregnancy_test`
--

INSERT INTO `result_pregnancy_test` (`KEYID`, `METHOD`, `VALUE`, `CREATED_ON`, `UPDATED_ON`, `COMMENTS`, `PATIENTID`, `BILLINGID`, `TESTID`) VALUES
(1, 'Urine', 'positive', '2023-09-04 12:49:55.667196', '2023-09-04 12:49:55.667196', 'WJIUHfhqwfy', 2023729, 36, 14),
(2, 'Urine', 'negative', '2023-09-05 11:33:55.911099', '2023-09-05 11:33:55.911099', 'ejfhqfhqwfhqwh', 202385, 60, 14),
(3, 'Urine', 'positive', '2023-10-31 00:27:20.369358', '2023-10-31 00:27:20.369358', 'Beta Hcg positive', 202392724, 121, 14);

-- --------------------------------------------------------

--
-- Table structure for table `result_random_blood_sugar`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_random_blood_sugar` (
  `keyid` int(255) NOT NULL,
  `billingid` int(60) NOT NULL,
  `patientid` bigint(50) NOT NULL,
  `result` int(50) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL,
  `comments` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_random_blood_sugar`:
--

-- --------------------------------------------------------

--
-- Table structure for table `result_thyroid_functional_test`
--
-- Creation: Sep 04, 2023 at 09:00 AM
--

CREATE TABLE `result_thyroid_functional_test` (
  `keyid` int(255) NOT NULL,
  `parameter` varchar(255) NOT NULL,
  `billingid` int(255) NOT NULL,
  `value` int(20) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL,
  `patientid` bigint(255) NOT NULL,
  `unit` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_thyroid_functional_test`:
--

--
-- Dumping data for table `result_thyroid_functional_test`
--

INSERT INTO `result_thyroid_functional_test` (`keyid`, `parameter`, `billingid`, `value`, `created_on`, `updated_on`, `patientid`, `unit`) VALUES
(1, 'TSH', 63, 44, '2023-09-06 10:44:49.042498', NULL, 2023854, 'pmol/L'),
(2, 'T4', 63, 444, '2023-09-06 10:44:49.042498', NULL, 2023854, 'pmol/L'),
(3, 'T3', 63, 44, '2023-09-06 10:44:49.042498', NULL, 2023854, 'pmol/L');

-- --------------------------------------------------------

--
-- Table structure for table `result_widal`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `result_widal` (
  `KEYID` int(255) NOT NULL,
  `TYPHIO` varchar(10) NOT NULL,
  `TYPHIH` varchar(10) NOT NULL,
  `PARATYPHIAH` varchar(10) DEFAULT NULL,
  `PARATYPHIBH` varchar(10) DEFAULT NULL,
  `COMMENTS` varchar(255) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) DEFAULT NULL,
  `BILLINGID` int(255) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `result_widal`:
--

--
-- Dumping data for table `result_widal`
--

INSERT INTO `result_widal` (`KEYID`, `TYPHIO`, `TYPHIH`, `PARATYPHIAH`, `PARATYPHIBH`, `COMMENTS`, `CREATED_ON`, `UPDATED_ON`, `BILLINGID`, `PATIENTID`) VALUES
(1, '1/20', '1/80', '1/80', '1/20', 'gkrgllwel', '2023-09-04 05:22:06.357165', NULL, 5, 2023729),
(2, '1/20', '1/20', '1/80', '1/80', 'wdfowfgiwufgouidqvuedgu2eoufgi', '2023-09-05 11:26:58.154081', NULL, 58, 2023854),
(3, '1/20', '1/80', '1/20', '1/20', 'eiiuwfuweu', '2023-09-21 09:47:49.660265', NULL, 79, 202382111),
(4, '1/80', '1/80', '1/160', '1/80', 'efuie2ui', '2023-09-21 12:52:36.129191', NULL, 81, 2023854),
(5, '1/20', '1/160', '1/80', '1/80', 'jqjjwdjfjjcjqsj', '2023-10-10 19:24:40.233861', NULL, 108, 20239723),
(6, '1/20', '1/20', '1/80', '1/80', 'efowowefoo', '2023-10-30 13:45:17.066345', NULL, 110, 20239723),
(7, '1/20', '1/20', '', '', 'reactive', '2023-10-31 00:37:36.950871', NULL, 122, 20238155);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--
-- Creation: Sep 10, 2023 at 03:39 PM
--

CREATE TABLE `roles` (
  `EMPLOYEEID` int(255) NOT NULL,
  `USERNAME` varchar(255) NOT NULL,
  `ROLE` varchar(255) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  `DATE_CREATED` date NOT NULL DEFAULT current_timestamp(),
  `TIME` time(6) NOT NULL DEFAULT current_timestamp(),
  `REFRESH_TOKEN` varchar(255) DEFAULT NULL,
  `ACTIVATION` tinyint(1) NOT NULL DEFAULT 0,
  `EMAIL` varchar(200) NOT NULL,
  `PERMISSIONS` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}',
  `UPDATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `roles`:
--

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`EMPLOYEEID`, `USERNAME`, `ROLE`, `PASSWORD`, `DATE_CREATED`, `TIME`, `REFRESH_TOKEN`, `ACTIVATION`, `EMAIL`, `PERMISSIONS`, `UPDATED_ON`) VALUES
(1, 'Nyaaba Asana Awineyila', 'phelobotomist', '$2b$10$F.klTJZBHH6eBf0PsjZwA.mFY8ciMrYSKnoJeEZaQsceh6/G7YWde', '2023-09-03', '08:54:05.000000', NULL, 1, 'mildred@gmail.com', '{\"deletev\":false,\"role\":\"phelobotomist\",\"registerv\":false,\"pageAccess\":{\"registration\":false,\"inventory\":false,\"activation\":false,\"suppliers\":false,\"operations\":false,\"approvals\":false,\"settings\":false,\"payments\":false,\"billing\":false,\"phelobotomy\":true,\"samples\":false,\"organization\":false,\"clinician\":false,\"appointment\":false}}', '0000-00-00 00:00:00.000000'),
(2, 'Tiifu Hamza Boronson', 'admin', '$2b$10$VQAUNbjKwGiv99NZa.iQpeK7M6FKXrkVwmuyTONpaRTSmJocyAMUO', '2023-09-06', '10:24:18.000000', NULL, 1, 'tiifu@gmail.com', '{}', '0000-00-00 00:00:00.000000'),
(3, 'tiifu hamza', 'admin', '$2b$10$M3oXcg3BPJUPK6uFxq0cvuVffwlp/yjjwEhZ7bUtWq6Dl9qgHXgpm', '2023-09-10', '14:29:06.000000', NULL, 1, 'hamzatiifu45@gmail.com', '{\"registerClient\":true,\"deleteClient\":true,\"editClient\":true,\"printResult\":true,\"activateClient\":true,\"viewClient\":true,\"enterResult\":true,\"viewResult\":true,\"deleteResult\":true,\"pageAccess\":{\"registration\":true,\"inventory\":true,\"activation\":true,\"suppliers\":true,\"operations\":true,\"approvals\":true,\"settings\":true,\"payments\":true,\"billing\":true,\"phelobotomy\":true,\"samples\":true,\"organization\":true,\"clinician\":true,\"appointment\":true}}', '0000-00-00 00:00:00.000000'),
(26, 'shefik tiifu', 'customer service representative', '$2b$10$sXTNsHAATjbcER/KJGgAnOn1xRfhUWO/aUBhS5GSlhtIOv6J3VCn6', '2023-10-28', '03:46:52.000000', NULL, 1, 'shefiktiifu@yahoo.com', '{\"registerClient\":true,\"deleteClient\":false,\"editClient\":true,\"printResult\":false,\"activateClient\":true,\"viewClient\":true,\"enterResult\":false,\"viewResult\":false,\"deleteResult\":false,\"pageAccess\":{\"registration\":true,\"inventory\":false,\"activation\":true,\"suppliers\":false,\"operations\":false,\"approvals\":false,\"settings\":false,\"payments\":false,\"billing\":false,\"phelobotomy\":false,\"samples\":false,\"organization\":true,\"clinician\":true,\"appointment\":false}}', '2023-10-28 03:46:52.628656'),
(27, 'abu hajia sheheda', 'scientist', '$2b$10$AwtvrsW7AmD.7f1mui7yne.LrIepeCLI1JmKCxoR/kLGssamtnsWW', '2023-10-28', '04:06:27.000000', NULL, 1, 'hajiasheheda@yahoo.com', '{}', '2023-10-28 04:06:27.665669'),
(28, 'tiifu hak', 'sonographer', '$2b$10$nsd0KxWtMDafszAKigxh1OV1hK8kKbwxXg5n3t2GuN3nYjlIrWfdu', '2023-10-28', '04:53:39.000000', NULL, 1, 'haktiifu@yahoo.com', '{}', '2023-10-28 04:53:39.218409');

-- --------------------------------------------------------

--
-- Table structure for table `samplestatus`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `samplestatus` (
  `keyid` int(100) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `message` varchar(255) DEFAULT NULL,
  `testid` int(50) NOT NULL,
  `billingid` int(50) NOT NULL,
  `approvalstatus` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='this keep a log of samples accepted or declined';

--
-- RELATIONSHIPS FOR TABLE `samplestatus`:
--

--
-- Dumping data for table `samplestatus`
--

INSERT INTO `samplestatus` (`keyid`, `date`, `message`, `testid`, `billingid`, `approvalstatus`) VALUES
(130, '2023-10-07 19:52:20.774130', NULL, 2, 107, 1),
(131, '2023-10-07 19:52:20.819357', NULL, 1, 107, 1),
(132, '2023-10-07 19:52:20.843354', NULL, 5, 107, 1),
(133, '2023-10-07 19:52:20.901722', NULL, 56, 107, 1),
(134, '2023-10-08 04:16:21.324566', 'sample was contaminated and the quantity serum after centrifugation is insufficient to continue with the test', 3, 108, 1),
(135, '2023-10-08 04:16:21.362015', NULL, 1, 108, 1),
(136, '2023-10-09 05:25:10.359360', NULL, 1, 109, 1),
(137, '2023-10-10 05:46:08.648851', NULL, 2, 110, 1),
(138, '2023-10-10 07:28:04.929593', NULL, 1, 110, 1),
(139, '2023-10-10 07:28:04.956272', NULL, 3, 110, 1),
(140, '2023-10-11 03:03:45.218795', NULL, 7, 110, 1),
(141, '2023-10-11 09:33:02.439143', NULL, 1, 111, 1),
(142, '2023-10-17 11:21:25.891655', NULL, 2, 112, 1),
(143, '2023-10-17 11:21:25.927728', NULL, 1, 112, 1),
(144, '2023-10-17 11:21:26.011030', NULL, 7, 112, 1),
(145, '2023-10-17 11:21:26.035898', NULL, 11, 112, 1),
(146, '2023-10-17 19:51:16.374592', NULL, 1, 113, 1),
(147, '2023-10-17 19:59:20.248759', NULL, 4, 114, 1),
(148, '2023-10-17 19:59:20.289848', NULL, 7, 114, 1),
(149, '2023-10-17 19:59:20.309288', NULL, 10, 114, 1),
(150, '2023-10-17 19:59:20.384290', NULL, 13, 114, 1),
(151, '2023-10-17 19:59:20.434300', NULL, 15, 114, 1),
(152, '2023-10-26 07:51:17.616091', NULL, 2, 115, 1),
(153, '2023-10-27 04:54:17.662150', 'gell tube not available hence we wouldnt be able to collect samples', 7, 116, 1),
(154, '2023-10-27 04:54:17.869702', NULL, 7, 117, 1),
(155, '2023-10-28 10:17:04.898490', NULL, 1, 118, 1),
(156, '2023-10-28 10:48:04.232677', NULL, 54, 119, 1),
(157, '2023-10-29 14:29:30.664545', NULL, 50, 120, 1),
(158, '2023-10-31 00:25:47.189053', NULL, 14, 121, 1),
(159, '2023-10-31 00:35:31.108066', NULL, 56, 122, 1),
(160, '2023-10-31 00:35:31.165326', NULL, 1, 122, 1),
(161, '2023-10-31 00:35:31.207084', NULL, 3, 122, 1),
(162, '2023-10-31 00:35:31.324153', NULL, 5, 122, 1),
(163, '2023-11-01 00:49:57.466114', NULL, 50, 123, 1),
(164, '2023-11-01 00:49:57.548540', NULL, 54, 123, 1),
(165, '2023-11-01 00:49:57.598419', NULL, 7, 123, 1),
(166, '2023-11-01 00:49:57.647375', NULL, 1, 123, 1),
(167, '2023-11-01 00:49:57.664460', NULL, 5, 123, 1),
(168, '2023-11-01 00:49:57.707473', NULL, 10, 123, 1),
(169, '2023-11-03 00:14:27.502921', NULL, 1, 124, 1),
(170, '2023-11-04 01:53:57.954165', NULL, 1, 125, 1),
(171, '2023-11-04 01:53:58.068871', NULL, 20, 125, 1),
(173, '2023-11-06 13:17:24.678683', NULL, 1, 127, 1),
(174, '2023-11-06 16:08:24.499160', NULL, 1, 128, 1),
(175, '2023-11-06 16:08:24.517657', NULL, 6, 128, 1),
(176, '2023-11-06 16:08:24.531636', NULL, 8, 128, 1),
(177, '2023-11-06 16:08:24.548706', NULL, 10, 128, 1),
(178, '2023-11-08 20:53:31.574244', NULL, 1, 129, 0),
(179, '2023-11-08 20:53:32.140608', NULL, 19, 129, 0),
(180, '2023-11-08 20:53:32.424147', NULL, 13, 129, 0),
(181, '2023-11-08 20:53:32.851455', NULL, 7, 129, 0);

-- --------------------------------------------------------

--
-- Table structure for table `sampletype`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `sampletype` (
  `id` int(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `addedon` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `sampletype`:
--

--
-- Dumping data for table `sampletype`
--

INSERT INTO `sampletype` (`id`, `name`, `addedon`) VALUES
(1, 'urine', '2023-09-03'),
(2, 'blood', '2023-09-03'),
(3, 'serum', '2023-09-03'),
(4, 'stool', '2023-09-03'),
(5, 'cerebrospinal fluid', '2023-09-22');

-- --------------------------------------------------------

--
-- Table structure for table `samplingtest`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `samplingtest` (
  `TestKey` int(255) NOT NULL,
  `TestId` int(50) NOT NULL,
  `Billingid` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `samplingtest`:
--

-- --------------------------------------------------------

--
-- Table structure for table `scanreport`
--
-- Creation: Oct 04, 2023 at 01:38 PM
--

CREATE TABLE `scanreport` (
  `id` int(255) NOT NULL,
  `patientid` bigint(50) NOT NULL,
  `billingid` int(50) NOT NULL,
  `testid` int(10) NOT NULL,
  `scan` varchar(100) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_on` datetime(6) DEFAULT NULL ON UPDATE current_timestamp(6),
  `content` longtext NOT NULL,
  `sonographer` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `scanreport`:
--

--
-- Dumping data for table `scanreport`
--

-- --------------------------------------------------------

--
-- Table structure for table `semenanalysis`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `semenanalysis` (
  `keyid` int(255) NOT NULL,
  `spermcount` varchar(100) NOT NULL,
  `collectiontime` varchar(6) NOT NULL,
  `collectionDate` date NOT NULL,
  `abstinence` tinyint(10) NOT NULL,
  `quantity` tinyint(10) NOT NULL,
  `colour` varchar(30) NOT NULL,
  `consistency` varchar(50) NOT NULL,
  `motility` tinyint(20) NOT NULL,
  `motilityGrade` varchar(100) NOT NULL,
  `morphology` varchar(100) NOT NULL,
  `pusCells` varchar(20) NOT NULL DEFAULT 'absent',
  `rbcs` varchar(20) NOT NULL DEFAULT 'absent',
  `impression` varchar(100) NOT NULL,
  `billingid` int(11) NOT NULL,
  `liquefactionTime` varchar(20) NOT NULL,
  `ph` int(10) NOT NULL,
  `fructose` varchar(20) NOT NULL,
  `epithelialCells` varchar(20) NOT NULL,
  `patientid` bigint(100) NOT NULL,
  `updated_on` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `semenanalysis`:
--

-- --------------------------------------------------------

--
-- Table structure for table `setup_beta_hcg`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_beta_hcg` (
  `KEYID` int(255) NOT NULL,
  `WEEKS` int(10) NOT NULL,
  `LOWER` int(255) NOT NULL,
  `UPPER` int(255) NOT NULL,
  `UNIT` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_beta_hcg`:
--

--
-- Dumping data for table `setup_beta_hcg`
--

INSERT INTO `setup_beta_hcg` (`KEYID`, `WEEKS`, `LOWER`, `UPPER`, `UNIT`) VALUES
(1, 2, 88, 200, 'mg/dl'),
(2, 3, 450000, 5949400, 'mg/dl'),
(3, 4, 45000, 6049400, 'mg/dl'),
(4, 5, 45000, 6049400, 'mg/dl'),
(5, 6, 45000, 6049400, 'mg/dl'),
(6, 7, 45000, 6049400, 'mg/dl'),
(7, 8, 45000, 6049400, 'mg/dl'),
(8, 9, 45000, 6049400, 'mg/dl'),
(9, 10, 45000, 6049400, 'mg/dl'),
(10, 11, 45000, 6049400, 'mg/dl'),
(11, 12, 45000, 6049400, 'mg/dl'),
(12, 13, 45000, 6049400, 'mg/dl'),
(13, 14, 45000, 6049400, 'mg/dl'),
(14, 15, 45000, 6049400, 'mg/dl'),
(15, 16, 45000, 6049400, 'mg/dl');

-- --------------------------------------------------------

--
-- Table structure for table `setup_cardiac_enzymes`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_cardiac_enzymes` (
  `SETUPID` int(255) NOT NULL,
  `UNIT` varchar(255) NOT NULL,
  `UPPER` int(20) NOT NULL,
  `LOWER` int(20) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `DISPLAY` varchar(10) NOT NULL DEFAULT 'TRUE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_cardiac_enzymes`:
--

--
-- Dumping data for table `setup_cardiac_enzymes`
--

INSERT INTO `setup_cardiac_enzymes` (`SETUPID`, `UNIT`, `UPPER`, `LOWER`, `PARAMETER`, `DISPLAY`) VALUES
(1, 'U/L', 800, 200, 'creatinine kinase (CK)', 'TRUE'),
(2, 'U/L', 700, 243, 'aspartate transaminase(AST)', 'TRUE'),
(3, 'U/L', 600, 243, 'lactate dehydrogenase (LDH)', 'TRUE');

-- --------------------------------------------------------

--
-- Table structure for table `setup_esr`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_esr` (
  `keyid` int(255) NOT NULL,
  `agelimit` varchar(50) NOT NULL,
  `upper` int(50) NOT NULL,
  `lower` int(50) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `gender` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_esr`:
--

-- --------------------------------------------------------

--
-- Table structure for table `setup_fullcount_paramters`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_fullcount_paramters` (
  `ID` int(255) NOT NULL,
  `PARAMETER` varchar(250) NOT NULL,
  `UPPER` int(100) NOT NULL,
  `LOWER` int(100) NOT NULL,
  `UNIT` varchar(20) NOT NULL,
  `DATE` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_fullcount_paramters`:
--

--
-- Dumping data for table `setup_fullcount_paramters`
--

INSERT INTO `setup_fullcount_paramters` (`ID`, `PARAMETER`, `UPPER`, `LOWER`, `UNIT`, `DATE`) VALUES
(1, 'haemoglobin', 18, 10, 'mg/dl', '0000-00-00 00:00:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `setup_full_blood_count_test_general`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_full_blood_count_test_general` (
  `FBCID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `UNIT` varchar(10) NOT NULL,
  `LOWER` int(10) NOT NULL,
  `UPPER` int(10) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_full_blood_count_test_general`:
--

--
-- Dumping data for table `setup_full_blood_count_test_general`
--

INSERT INTO `setup_full_blood_count_test_general` (`FBCID`, `PARAMETER`, `UNIT`, `LOWER`, `UPPER`, `DATE`) VALUES
(1, 'wbc', '', 20, 30, '2023-09-21 13:26:51.856395'),
(2, 'neutrophils', 'g/dl', 0, 0, '2023-09-21 13:26:51.913224'),
(3, 'eosinophils', '', 0, 0, '2023-09-21 13:26:51.955532'),
(4, 'basophils', '', 0, 0, '2023-09-21 13:26:52.012023'),
(5, 'lymphocytes', '', 0, 0, '2023-09-21 13:26:52.045452'),
(6, 'monocytes', 'g/hj', 0, 0, '2023-09-21 13:26:52.088819'),
(7, 'mch', 'g/hj', 0, 0, '2023-09-21 13:26:52.104467'),
(8, 'mcv', 'g/hj', 0, 0, '2023-09-21 13:26:52.120752'),
(9, 'mchc', '%', 0, 0, '2023-09-21 13:26:52.137398'),
(10, 'rdw-cv', '%', 0, 0, '2023-09-21 13:26:52.153523'),
(11, 'rdw-sd', '%', 0, 0, '2023-09-21 13:26:52.170737');

-- --------------------------------------------------------

--
-- Table structure for table `setup_full_blood_count_test_male`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_full_blood_count_test_male` (
  `FBCID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `UNIT` varchar(10) NOT NULL,
  `LOWER` float NOT NULL,
  `UPPER` float NOT NULL,
  `DATE` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_full_blood_count_test_male`:
--

--
-- Dumping data for table `setup_full_blood_count_test_male`
--

INSERT INTO `setup_full_blood_count_test_male` (`FBCID`, `PARAMETER`, `UNIT`, `LOWER`, `UPPER`, `DATE`) VALUES
(178, 'wbc', 'mg/l', 20, 30, '2023-09-21 13:20:25'),
(179, 'neutrophils', 'g/dl', 20, 550, '2023-09-21 13:20:25'),
(180, 'eosinophils', 'gl/dl', 10, 200, '2023-09-21 13:20:25'),
(181, 'basophils', 'mg/dl', 1, 666, '2023-09-21 13:20:25'),
(182, 'lymphocytes', 'gl/l', 12, 668, '2023-09-21 13:20:25'),
(183, 'monocytes', 'g/hj', 69, 669, '2023-09-21 13:20:25'),
(184, 'mch', 'g/hj', 0, 0, '2023-09-21 13:20:25'),
(185, 'mcv', 'g/hj', 0, 0, '2023-09-21 13:20:25'),
(186, 'mchc', '%', 0, 0, '2023-09-21 13:20:25'),
(187, 'rdw-cv', '%', 0, 0, '2023-09-21 13:20:25'),
(188, 'rdw-sd', '%', 0, 0, '2023-09-21 13:20:25'),
(189, 'wbc', 'mg/l', 20, 30, '2023-09-21 13:20:25'),
(190, 'neutrophils', 'g/dl', 20, 550, '2023-09-21 13:20:25'),
(191, 'eosinophils', 'gl/dl', 10, 200, '2023-09-21 13:20:25'),
(192, 'basophils', 'mg/dl', 1, 666, '2023-09-21 13:20:25'),
(193, 'lymphocytes', 'gl/l', 12, 668, '2023-09-21 13:20:25'),
(194, 'monocytes', 'g/hj', 69, 669, '2023-09-21 13:20:25'),
(195, 'mch', 'g/hj', 0, 0, '2023-09-21 13:20:25'),
(196, 'mcv', 'g/hj', 0, 0, '2023-09-21 13:20:25'),
(197, 'mchc', '%', 0, 0, '2023-09-21 13:20:25'),
(198, 'rdw-cv', '%', 0, 0, '2023-09-21 13:20:25'),
(199, 'rdw-sd', '%', 0, 0, '2023-09-21 13:20:25');

-- --------------------------------------------------------

--
-- Table structure for table `setup_full_count_count_female`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_full_count_count_female` (
  `PARAMETER` varchar(255) NOT NULL,
  `UNIT` varchar(10) NOT NULL,
  `UPPER` int(10) NOT NULL,
  `LOWER` int(10) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `keyid` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_full_count_count_female`:
--

--
-- Dumping data for table `setup_full_count_count_female`
--

INSERT INTO `setup_full_count_count_female` (`PARAMETER`, `UNIT`, `UPPER`, `LOWER`, `DATE`, `keyid`) VALUES
('wbc', '', 30, 20, '2023-09-21 13:25:48.018643', 1),
('neutrophils', 'g/dl', 0, 0, '2023-09-21 13:25:48.078293', 2),
('eosinophils', '', 0, 0, '2023-09-21 13:25:48.128202', 3),
('basophils', '', 0, 0, '2023-09-21 13:25:48.178119', 4),
('lymphocytes', '', 0, 0, '2023-09-21 13:25:48.236481', 5),
('monocytes', 'g/hj', 0, 0, '2023-09-21 13:25:48.268435', 6),
('mch', 'g/hj', 0, 0, '2023-09-21 13:25:48.285752', 7),
('mcv', 'g/hj', 0, 0, '2023-09-21 13:25:48.302150', 8),
('mchc', '%', 0, 0, '2023-09-21 13:25:48.319227', 9),
('rdw-cv', '%', 0, 0, '2023-09-21 13:25:48.335466', 10),
('rdw-sd', '%', 0, 0, '2023-09-21 13:25:48.353078', 11);

-- --------------------------------------------------------

--
-- Table structure for table `setup_glycated_heamoglobin_test`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_glycated_heamoglobin_test` (
  `TESTID` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_glycated_heamoglobin_test`:
--

-- --------------------------------------------------------

--
-- Table structure for table `setup_lipid_profile_test`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_lipid_profile_test` (
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER` int(100) NOT NULL,
  `LOWER` int(100) NOT NULL,
  `UNIT` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_lipid_profile_test`:
--

--
-- Dumping data for table `setup_lipid_profile_test`
--

INSERT INTO `setup_lipid_profile_test` (`SETUPID`, `PARAMETER`, `UPPER`, `LOWER`, `UNIT`) VALUES
(1, 'CHOLESTEROL', 600, 498, 'mg/dl'),
(2, 'TRIGLYCERIDES', 600, 498, 'mg/dl'),
(3, 'HDL', 600, 498, 'mg/dl'),
(4, 'LDL', 600, 498, 'mg/dl'),
(5, 'TOTAL CHOLESEROL', 600, 498, 'mg/dl'),
(6, 'TG/HDL', 600, 498, 'mg/dl');

-- --------------------------------------------------------

--
-- Table structure for table `setup_liver_function_test`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_liver_function_test` (
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER` int(100) NOT NULL,
  `LOWER` int(100) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UNIT` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_liver_function_test`:
--

--
-- Dumping data for table `setup_liver_function_test`
--

INSERT INTO `setup_liver_function_test` (`SETUPID`, `PARAMETER`, `UPPER`, `LOWER`, `DATE`, `UNIT`) VALUES
(1, 'albumin', 300, 600, '2023-09-04 05:16:37.304041', 'mg/dl'),
(2, 'total protein', 600, 300, '2023-09-04 05:16:37.304041', 'mg/dl'),
(3, 'alp', 600, 600, '2023-09-04 05:16:37.304041', 'mg/dl'),
(4, 'ast', 6000, 600, '2023-09-04 05:16:37.304041', 'mg/dl'),
(5, 'alt', 600, 600, '2023-09-04 05:16:37.304041', 'mg/dl'),
(6, 'bun', 600, 600, '2023-09-04 05:16:37.304041', 'mg/dl'),
(7, 'creatinine', 600, 600, '2023-09-04 05:16:37.304041', 'mg/dl');

-- --------------------------------------------------------

--
-- Table structure for table `setup_renal_function_test`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_renal_function_test` (
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER` int(50) NOT NULL,
  `LOWER` int(50) NOT NULL,
  `UNIT` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_renal_function_test`:
--

--
-- Dumping data for table `setup_renal_function_test`
--

INSERT INTO `setup_renal_function_test` (`SETUPID`, `PARAMETER`, `UPPER`, `LOWER`, `UNIT`) VALUES
(1, 'BUN', 5555, 600, 'mg/dl'),
(2, 'Creatinine', 5540, 500, 'mg/dl'),
(3, 'potasium', 2520, 10, 'mg/dl'),
(4, 'sodium', 6822, 300, 'mg/dl'),
(5, 'chloride', 55845, 6000, 'mg/dl'),
(6, 'bicarbonate', 1000, 50, 'mg/dl'),
(7, 'albumin', 1000, 50, 'mg/dl'),
(8, 'ahDy', 444, 44, 'UH');

-- --------------------------------------------------------

--
-- Table structure for table `setup_thyroid_test`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `setup_thyroid_test` (
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `UNIT` varchar(255) NOT NULL,
  `UPPER` int(255) NOT NULL,
  `LOWER` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `setup_thyroid_test`:
--

--
-- Dumping data for table `setup_thyroid_test`
--

INSERT INTO `setup_thyroid_test` (`SETUPID`, `PARAMETER`, `UNIT`, `UPPER`, `LOWER`) VALUES
(1, 'TSH', 'pmol/L', 4949, 498),
(2, 'T4', 'pmol/L', 9494949, 498),
(3, 'T3', 'pmol/L', 49949, 498);

-- --------------------------------------------------------

--
-- Table structure for table `stockcategory`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `stockcategory` (
  `id` int(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `stockcategory`:
--

--
-- Dumping data for table `stockcategory`
--

INSERT INTO `stockcategory` (`id`, `category`, `date`) VALUES
(1, 'consumables', '2023-09-24 02:37:41.387396'),
(2, 'disposable', '2023-10-13 07:50:18.375552'),
(3, 'furnitures', '2023-10-13 07:51:34.740246'),
(4, 'asserts', '2023-10-13 07:53:23.156986'),
(5, 'medicine ', '2023-10-13 08:32:38.932631'),
(6, 'liquids', '2023-10-16 18:10:58.236496'),
(7, 'assets', '2023-10-27 18:30:48.349296');

-- --------------------------------------------------------

--
-- Table structure for table `stocktransactions`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `stocktransactions` (
  `keyid` int(255) NOT NULL,
  `stockid` int(100) NOT NULL,
  `quantity` int(255) NOT NULL,
  `batchno` varchar(50) NOT NULL,
  `added_on` datetime(6) DEFAULT NULL,
  `updated_on` datetime(6) DEFAULT NULL,
  `purchaseunit` varchar(100) NOT NULL,
  `supplierid` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `stocktransactions`:
--

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--
-- Creation: Oct 11, 2023 at 10:51 AM
--

CREATE TABLE `supplier` (
  `supplierid` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `phonenumber` int(255) NOT NULL,
  `contactperson` varchar(255) NOT NULL,
  `region` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `supplier`:
--

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`supplierid`, `name`, `address`, `date`, `phonenumber`, `contactperson`, `region`, `email`) VALUES
(1, 'johnson johnson', 'jfkwk', '2023-10-11 10:58:08.074301', 595964565, 'tiifu shefik ', 'Upper East', 'lkk2@gmail.com'),
(3, 'king joe suppliers', 'Kalpohin Lowcost 30A', '2023-10-11 12:50:16.958579', 595964565, 'Tiifu Hamza', 'Northern', 'hamzatiifu455jsdjs5@99gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `tax`
--
-- Creation: Nov 08, 2023 at 10:06 PM
--

CREATE TABLE `tax` (
  `name` varchar(50) NOT NULL,
  `value` int(50) NOT NULL,
  `createdOn` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `apply` varchar(10) NOT NULL DEFAULT 'Yes',
  `id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `tax`:
--

--
-- Dumping data for table `tax`
--

INSERT INTO `tax` (`name`, `value`, `createdOn`, `apply`, `id`) VALUES
('VAT', 10, '2023-11-08 22:28:29.972006', 'Yes', 1),
('NHIS-Levy', 3, '2023-11-08 22:40:38.408875', 'Yes', 2),
('E-levy', 4, '2023-11-08 23:49:12.457009', 'Yes', 3),
('sanitation Tax', 2, '2023-11-08 23:52:22.074302', 'Yes', 4),
('Energy Tax', 1, '2023-11-08 23:53:42.261833', 'Yes', 5);

-- --------------------------------------------------------

--
-- Table structure for table `tempo`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `tempo` (
  `ID` int(144) NOT NULL,
  `TITLE` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `tempo`:
--

-- --------------------------------------------------------

--
-- Table structure for table `test_ascension`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `test_ascension` (
  `id` int(255) NOT NULL,
  `testid` int(11) NOT NULL,
  `billingid` int(11) NOT NULL,
  `collection` varchar(50) DEFAULT 'false',
  `processing` varchar(50) DEFAULT 'false',
  `ready` varchar(50) DEFAULT 'false',
  `processing_date` datetime(6) DEFAULT NULL,
  `collection_date` datetime(6) DEFAULT NULL,
  `ready_date` datetime(6) DEFAULT NULL,
  `printedNumber` int(25) DEFAULT NULL,
  `printedDate` datetime(6) DEFAULT NULL,
  `ApprovalStatus` tinyint(1) NOT NULL DEFAULT 0,
  `Scientist` int(10) DEFAULT NULL,
  `ApprovedBy` int(10) DEFAULT NULL,
  `declineMessage` varchar(255) DEFAULT NULL,
  `actionPlan` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `test_ascension`:
--

--
-- Dumping data for table `test_ascension`
--

INSERT INTO `test_ascension` (`id`, `testid`, `billingid`, `collection`, `processing`, `ready`, `processing_date`, `collection_date`, `ready_date`, `printedNumber`, `printedDate`, `ApprovalStatus`, `Scientist`, `ApprovedBy`, `declineMessage`, `actionPlan`) VALUES
(130, 2, 107, 'true', 'false', 'false', NULL, '2023-10-07 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(131, 1, 107, 'true', 'false', 'true', NULL, '2023-10-07 00:00:00.000000', '2023-10-30 13:46:42.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(132, 5, 107, 'true', 'false', 'true', NULL, '2023-10-07 00:00:00.000000', '2023-10-30 13:46:32.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(133, 56, 107, 'true', 'false', 'true', NULL, '2023-10-07 00:00:00.000000', '2023-10-10 19:23:38.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(134, 3, 108, 'true', 'true', 'true', '2023-10-08 23:39:30.000000', '2023-10-08 00:00:00.000000', '2023-10-10 19:24:40.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(135, 1, 108, 'true', 'false', 'true', NULL, '2023-10-08 00:00:00.000000', '2023-10-10 19:24:24.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(136, 1, 109, 'true', 'true', 'true', '2023-10-09 05:25:55.000000', '2023-10-09 00:00:00.000000', '2023-10-09 05:26:08.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(137, 2, 110, 'true', 'false', 'false', NULL, '2023-10-11 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(138, 1, 110, 'true', 'false', 'true', NULL, '2023-10-11 00:00:00.000000', '2023-10-30 13:45:29.000000', NULL, NULL, 1, NULL, 0, 'All parameters are very high', 'Kindly rerun test again'),
(139, 3, 110, 'true', 'false', 'true', NULL, '2023-10-11 00:00:00.000000', '2023-10-30 13:45:17.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(140, 7, 110, 'true', 'false', 'true', NULL, '2023-10-16 00:00:00.000000', '2023-10-17 19:35:22.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(141, 1, 111, 'true', 'false', 'true', NULL, '2023-10-11 00:00:00.000000', '2023-10-17 19:34:48.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(142, 2, 112, 'true', 'false', 'false', NULL, '2023-10-17 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(143, 1, 112, 'true', 'false', 'true', NULL, '2023-10-17 00:00:00.000000', '2023-10-30 13:46:13.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(144, 7, 112, 'true', 'false', 'true', NULL, '2023-10-17 00:00:00.000000', '2023-10-17 19:35:35.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(145, 11, 112, 'true', 'false', 'true', NULL, '2023-10-17 00:00:00.000000', '2023-10-30 13:46:04.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(146, 1, 113, 'true', 'false', 'false', NULL, '2023-10-26 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(147, 4, 114, 'true', 'false', 'false', NULL, '2023-10-17 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(148, 7, 114, 'true', 'false', 'true', NULL, '2023-10-17 00:00:00.000000', '2023-10-28 10:13:02.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(149, 10, 114, 'true', 'false', 'false', NULL, '2023-10-17 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(150, 13, 114, 'true', 'false', 'false', NULL, '2023-10-17 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(151, 15, 114, 'true', 'false', 'false', NULL, '2023-10-17 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(152, 2, 115, 'true', 'true', 'false', '2023-10-26 07:52:20.000000', '2023-10-26 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(153, 7, 116, 'true', 'false', 'false', NULL, '2023-10-27 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(154, 7, 117, 'true', 'false', 'false', NULL, '2023-10-27 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(155, 1, 118, 'true', 'true', 'true', '2023-10-28 10:19:13.000000', '2023-10-28 00:00:00.000000', '2023-10-28 10:19:24.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(156, 54, 119, 'true', 'false', 'true', NULL, '2023-10-29 00:00:00.000000', '2023-10-28 11:09:26.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(157, 50, 120, 'true', 'false', 'true', NULL, '2023-10-29 00:00:00.000000', '2023-10-29 14:45:08.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(158, 14, 121, 'true', 'true', 'true', '2023-10-31 00:27:01.000000', '2023-10-31 00:00:00.000000', '2023-10-31 00:27:20.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(159, 56, 122, 'true', 'true', 'true', '2023-10-31 00:36:49.000000', '2023-10-31 00:00:00.000000', '2023-10-31 00:37:08.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(160, 1, 122, 'true', 'true', 'true', '2023-10-31 00:36:50.000000', '2023-10-31 00:00:00.000000', '2023-10-31 00:37:25.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(161, 3, 122, 'true', 'true', 'true', '2023-10-31 00:36:51.000000', '2023-10-31 00:00:00.000000', '2023-10-31 00:37:37.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(162, 5, 122, 'true', 'false', 'false', NULL, '2023-10-31 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(163, 50, 123, 'true', 'false', 'false', NULL, '2023-11-03 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(164, 54, 123, 'true', 'false', 'false', NULL, '2023-11-03 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(165, 7, 123, 'true', 'true', 'false', '2023-11-01 01:45:24.000000', '2023-11-01 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(166, 1, 123, 'true', 'true', 'false', '2023-11-01 01:45:27.000000', '2023-11-01 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(167, 5, 123, 'true', 'true', 'false', '2023-11-01 01:45:29.000000', '2023-11-01 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(168, 10, 123, 'true', 'true', 'false', '2023-11-01 01:45:31.000000', '2023-11-01 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(169, 1, 124, 'true', 'false', 'false', NULL, '2023-11-03 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(170, 1, 125, 'true', 'true', 'true', '2023-11-04 02:28:01.000000', '2023-11-04 00:00:00.000000', '2023-11-04 02:28:18.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(171, 20, 125, 'true', 'true', 'false', '2023-11-04 01:54:44.000000', '2023-11-04 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(173, 1, 127, 'true', 'true', 'true', '2023-11-06 16:40:30.000000', '2023-11-06 00:00:00.000000', '2023-11-06 16:40:47.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(174, 1, 128, 'true', 'true', 'false', '2023-11-06 16:40:52.000000', '2023-11-06 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(175, 6, 128, 'true', 'true', 'false', '2023-11-06 16:40:55.000000', '2023-11-06 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(176, 8, 128, 'true', 'true', 'false', '2023-11-06 16:40:57.000000', '2023-11-06 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(177, 10, 128, 'true', 'true', 'true', '2023-11-06 16:40:59.000000', '2023-11-06 00:00:00.000000', '2023-11-06 16:41:14.000000', NULL, NULL, 1, NULL, 0, NULL, NULL),
(178, 1, 129, 'true', 'false', 'false', NULL, '2023-11-08 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(179, 19, 129, 'true', 'false', 'false', NULL, '2023-11-08 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(180, 13, 129, 'true', 'false', 'false', NULL, '2023-11-08 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(181, 7, 129, 'true', 'false', 'false', NULL, '2023-11-08 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL);

--
-- Triggers `test_ascension`
--
DELIMITER $$
CREATE TRIGGER `onDelete` AFTER DELETE ON `test_ascension` FOR EACH ROW BEGIN 
DELETE FROM samplestatus WHERE testid = OLD.testid
AND billingid = OLD.billingid;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `rejectedLog` AFTER INSERT ON `test_ascension` FOR EACH ROW BEGIN
INSERT INTO samplestatus(billingid,testid,approvalstatus) VALUES(NEW.billingid,NEW.testid,0);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `test_categories`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `test_categories` (
  `ID` int(255) NOT NULL,
  `CATEGORY` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `test_categories`:
--

-- --------------------------------------------------------

--
-- Table structure for table `test_panels`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `test_panels` (
  `ID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `CATEGORY` int(50) NOT NULL,
  `PRICE` int(20) NOT NULL,
  `CREATED_ON` datetime NOT NULL DEFAULT current_timestamp(),
  `SAMPLE` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `SAMPLE_CONTAINER` varchar(100) NOT NULL,
  `UNIT` varchar(10) NOT NULL,
  `QTY_REQUIRED` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `test_panels`:
--

--
-- Dumping data for table `test_panels`
--

INSERT INTO `test_panels` (`ID`, `NAME`, `CATEGORY`, `PRICE`, `CREATED_ON`, `SAMPLE`, `DESCRIPTION`, `SAMPLE_CONTAINER`, `UNIT`, `QTY_REQUIRED`) VALUES
(1, 'Malaria', 2, 20, '2023-04-12 05:54:35', '4', 'jwdfjwdjkwdjkfjkwejk wdfkwegkekge\nhejhwdjgjev\negjejgjegje', 'urine', 'mls', '499'),
(2, 'Glycated Heamoglobin', 3, 600, '2023-04-12 07:02:57', '4', 'test for blood sugar usage ', 'edta tube', 'mls', '4'),
(3, 'Widal', 2, 600, '2023-04-12 13:08:29', '4', 'For testing salmonella typhi infection', 'edta tube', 'mls', '3'),
(4, 'blood grouping', 2, 50, '2023-04-12 15:28:43', '4', 'nullKFKWKFWEKFKWFKQKFKQWFKWKFKWFKQWK', 'edta tube', 'mls', '32'),
(5, 'cardiac enzymes', 1, 600, '2023-04-12 15:29:35', '4', 'analysis of cardiac enzymes', 'gell tube ', 'g/dl', '5'),
(6, 'Hepatitis B', 2, 500, '2023-04-13 07:06:15', '6', 'Hepatitis b is not null', 'edta tube', 'mls', '320'),
(7, 'Hepatitis B Profile', 5, 500, '2023-04-13 07:20:25', 'serum', 'Test for all antigens related to viral hepatitis ', 'gell tube', 'mls', '50'),
(8, 'Hepatitis C', 1, 600, '2023-04-13 07:21:47', '9', 'Testing for Hepatitis C infection', 'edta tube', 'mls', '3'),
(10, 'liver function test', 1, 509, '2023-04-13 18:53:09', '4', 'priced here is not null be offensive', 'gell tube', 'mls', '3'),
(11, 'renal function test', 2, 500, '2023-04-13 18:53:34', 'serum', 'Renal functional test is a test to check the function of the kidney', 'gell tube', 'mls', '5'),
(12, 'Lipid profile', 4, 900, '2023-04-17 12:15:45', 'serum', 'efjwejfjwfjq', 'gell tube', 'mls', '4'),
(13, 'urinalysis', 5, 60, '2023-04-27 01:48:23', 'urine', 'Urine taking', 'urine', 'mls', '50'),
(14, 'Pregnancy test(Urine)', 3, 30, '2023-04-30 09:16:19', '3', 'Test for pregnancy antigen', 'urine', 'mls', '5'),
(15, 'Thyroid functional test', 3, 600, '2023-05-02 22:33:32', 'serum', 'Test for the functionality of the thyroid', 'gell tube', 'mg/dl', '5'),
(16, 'BetaHcg', 5, 600, '2023-05-07 12:21:11', '2', 'BetaHcg', 'edta tube', 'mls', '4'),
(17, 'aids', 2, 20, '2023-05-07 12:34:48', 'blood', 'testing for aids test', 'blood', 'mls', '4'),
(19, 'estimated sedimentation rate (ESR)', 1, 60, '2023-05-07 23:34:36', 'blood', 'uefueururu', 'gell tube', 'mls', '5'),
(20, 'fasting blood sugar', 3, 20, '2023-05-16 10:45:28', 'blood', 'testing for blood sugar in the body', 'edta tube', 'mg/dl', '3'),
(21, 'random blood sugar', 4, 20, '2023-05-16 10:46:09', 'blood', 'sugar testing ', 'gell tube ', 'mg/dl', '3'),
(22, 'full blood count', 3, 50, '2023-04-30 09:16:19', 'blood', 'Blood cell analysis', 'edta tube', 'mls', '4'),
(25, 'stool analysis', 2, 29, '2023-07-15 22:39:21', 'stool', 'rjgje', 'stool container', 'g', '10g'),
(26, 'clotting and bleeding time', 3, 200, '2023-07-16 00:08:49', '3', 'jdjdjdj', 'edta tube', 'mls', '5'),
(27, 'helicobacter pylori', 5, 50, '2023-07-17 10:08:56', '4', 'jgjwgjk', 'edta tube', 'mls', '5'),
(28, 'semen analysis', 4, 200, '2023-07-17 10:12:00', 'semen', 'eguirlkgwdjlguwjk,m', 'semen', 'mls', '5'),
(31, 'Luteinizing Hormone', 3, 50, '2023-07-17 10:20:19', 'blood', 'uhfjsdjvjk', 'gell tube', 'mls', '5'),
(32, 'Follicle Stimulating Hormone', 3, 50, '2023-07-17 10:20:46', 'blood', 'uhfjsdjvjk', 'gell tube', 'mls', '5'),
(33, 'heamoglobin test', 4, 49, '2023-08-24 22:41:14', 'urine', 'lorem ipsum', 'Edta Tube', 'mls', '5'),
(34, 'Haemoglogin electrophoreesis', 4, 500, '2023-08-25 08:46:19', 'blood', 'AGREEMENT\n\n\nTHIS agreement is entered into as of ___________________ by and between kadimart enterprise, a subsidiary of Kadima Company limited and __________________ also referred herein as a sale representative both of whom agree to be bound by this agr', 'edta tube', 'mls', '4'),
(50, 'abdominal ultrasound scan', 6, 100, '2023-10-03 07:46:28', 'null', 'null', 'null', '', '50'),
(51, 'obstetrics scan', 6, 80, '2023-10-03 10:55:42', '3', NULL, '', '', '93'),
(52, 'breast scan', 6, 200, '2023-10-04 21:58:38', '', NULL, '', '', NULL),
(53, 'pelvic scan', 6, 60, '2023-10-04 21:58:38', '', NULL, '', '', NULL),
(54, 'abdominal pelvic scan', 6, 120, '2023-10-04 21:59:25', '', NULL, '', '', NULL),
(55, 'urological scan', 6, 200, '2023-10-04 21:59:25', '', NULL, '', '', NULL),
(56, 'prostate specific antigen test', 3, 100, '2023-10-07 10:02:20', '2', 'prostate specific antigen test is indicator of the growth of the prostate gland', 'gell tubbe', 'mls', '4');

-- --------------------------------------------------------

--
-- Table structure for table `typhoid_test`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `typhoid_test` (
  `TESTID` int(255) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `RESULT` varchar(255) NOT NULL,
  `COMMENTS` varchar(255) NOT NULL,
  `TYPHI_O` float DEFAULT NULL,
  `TYPHI_H` float DEFAULT NULL,
  `PARATYPHI_BH` float DEFAULT NULL,
  `PARATYPHI_AH` float DEFAULT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `TIME` time(6) NOT NULL DEFAULT current_timestamp(),
  `ENTERED_BY` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `typhoid_test`:
--

-- --------------------------------------------------------

--
-- Table structure for table `urinalysisresult`
--
-- Creation: Aug 31, 2023 at 07:10 PM
--

CREATE TABLE `urinalysisresult` (
  `urinalysisKey` int(255) NOT NULL,
  `appearance` varchar(50) NOT NULL,
  `color` varchar(20) NOT NULL,
  `urobilinogen` varchar(50) NOT NULL,
  `ketones` varchar(50) NOT NULL,
  `bilirubin` varchar(50) NOT NULL,
  `nitrite` varchar(20) NOT NULL,
  `microalbumin` varchar(20) NOT NULL,
  `glucose` varchar(20) NOT NULL,
  `specific_gravity` float NOT NULL,
  `ph` float NOT NULL,
  `microscopy` text DEFAULT NULL,
  `billingid` int(20) NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `patientid` bigint(255) NOT NULL,
  `blood` varchar(50) NOT NULL,
  `leukocytes` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `urinalysisresult`:
--

--
-- Dumping data for table `urinalysisresult`
--

INSERT INTO `urinalysisresult` (`urinalysisKey`, `appearance`, `color`, `urobilinogen`, `ketones`, `bilirubin`, `nitrite`, `microalbumin`, `glucose`, `specific_gravity`, `ph`, `microscopy`, `billingid`, `remarks`, `patientid`, `blood`, `leukocytes`) VALUES
(0, 'Hazy', 'straw', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 1.02, 9, NULL, 60, 'ejfuwFQWTJDRHWHMFQWFYUQWTYYUQWDTY', 202385, 'yellpw', 'negative');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activation`
--
ALTER TABLE `activation`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `applicationsettings`
--
ALTER TABLE `applicationsettings`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `billing`
--
ALTER TABLE `billing`
  ADD PRIMARY KEY (`BILLINGID`),
  ADD KEY `BILLINGID` (`BILLINGID`);

--
-- Indexes for table `billinghx`
--
ALTER TABLE `billinghx`
  ADD PRIMARY KEY (`KeyID`);

--
-- Indexes for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`branchid`);

--
-- Indexes for table `clinicianbasicinfo`
--
ALTER TABLE `clinicianbasicinfo`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `clinicianpaymentinfo`
--
ALTER TABLE `clinicianpaymentinfo`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `commodity`
--
ALTER TABLE `commodity`
  ADD PRIMARY KEY (`COMID`);

--
-- Indexes for table `companyprofile`
--
ALTER TABLE `companyprofile`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `departmentconsumption`
--
ALTER TABLE `departmentconsumption`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departmentconsumptionhx`
--
ALTER TABLE `departmentconsumptionhx`
  ADD PRIMARY KEY (`comsumeid`);

--
-- Indexes for table `departmentrequisitionhx`
--
ALTER TABLE `departmentrequisitionhx`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `department` (`department`);

--
-- Indexes for table `departmentstocks`
--
ALTER TABLE `departmentstocks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `emailpreference`
--
ALTER TABLE `emailpreference`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fshresult`
--
ALTER TABLE `fshresult`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `fshsetup`
--
ALTER TABLE `fshsetup`
  ADD PRIMARY KEY (`setupid`);

--
-- Indexes for table `generalemailsettings`
--
ALTER TABLE `generalemailsettings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `generalstocks`
--
ALTER TABLE `generalstocks`
  ADD PRIMARY KEY (`stockid`);

--
-- Indexes for table `glycated_haemoglobin`
--
ALTER TABLE `glycated_haemoglobin`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `haemoglobinelectrophoresis`
--
ALTER TABLE `haemoglobinelectrophoresis`
  ADD PRIMARY KEY (`SETUPID`);

--
-- Indexes for table `hepatitisbresult`
--
ALTER TABLE `hepatitisbresult`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `hepatitisb_profile`
--
ALTER TABLE `hepatitisb_profile`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `hepatitiscresult`
--
ALTER TABLE `hepatitiscresult`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `lhresult`
--
ALTER TABLE `lhresult`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `lhsetup`
--
ALTER TABLE `lhsetup`
  ADD PRIMARY KEY (`setupid`);

--
-- Indexes for table `loginlogs`
--
ALTER TABLE `loginlogs`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `malaria`
--
ALTER TABLE `malaria`
  ADD PRIMARY KEY (`KEY`);

--
-- Indexes for table `manager_sample_descision`
--
ALTER TABLE `manager_sample_descision`
  ADD PRIMARY KEY (`sampleid`);

--
-- Indexes for table `new_patients`
--
ALTER TABLE `new_patients`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `PATIENTID` (`PATIENTID`),
  ADD KEY `PATIENTID_2` (`PATIENTID`);

--
-- Indexes for table `orderreceivedaccountsummary`
--
ALTER TABLE `orderreceivedaccountsummary`
  ADD UNIQUE KEY `orderTransactionid` (`orderTransactionid`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`productordersid`);

--
-- Indexes for table `organization`
--
ALTER TABLE `organization`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organizationaccountinformation`
--
ALTER TABLE `organizationaccountinformation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_id` (`organizationid`);

--
-- Indexes for table `organizationcontactperson`
--
ALTER TABLE `organizationcontactperson`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_id` (`organizationid`);

--
-- Indexes for table `pageaccess`
--
ALTER TABLE `pageaccess`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `patientemmergencycontactinformation`
--
ALTER TABLE `patientemmergencycontactinformation`
  ADD PRIMARY KEY (`keyid`),
  ADD UNIQUE KEY `patientid` (`patientid`);

--
-- Indexes for table `patientsaddress`
--
ALTER TABLE `patientsaddress`
  ADD PRIMARY KEY (`keyid`),
  ADD UNIQUE KEY `patientid` (`patientid`),
  ADD UNIQUE KEY `patientid_2` (`patientid`);

--
-- Indexes for table `patients_credentials`
--
ALTER TABLE `patients_credentials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patientid` (`patientid`);

--
-- Indexes for table `patients_settings`
--
ALTER TABLE `patients_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patientid` (`patientid`);

--
-- Indexes for table `paymentmodes`
--
ALTER TABLE `paymentmodes`
  ADD PRIMARY KEY (`KeyID`),
  ADD UNIQUE KEY `PaymentMode` (`PaymentMode`);

--
-- Indexes for table `performing_test`
--
ALTER TABLE `performing_test`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `psaresult`
--
ALTER TABLE `psaresult`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `psasetup`
--
ALTER TABLE `psasetup`
  ADD PRIMARY KEY (`setupid`);

--
-- Indexes for table `result_aids`
--
ALTER TABLE `result_aids`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_beta_hcg`
--
ALTER TABLE `result_beta_hcg`
  ADD PRIMARY KEY (`KEYID`);

--
-- Indexes for table `result_cardiac_enzymes`
--
ALTER TABLE `result_cardiac_enzymes`
  ADD PRIMARY KEY (`LIVERID`);

--
-- Indexes for table `result_comments`
--
ALTER TABLE `result_comments`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_esr`
--
ALTER TABLE `result_esr`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_fasting_blood_sugar`
--
ALTER TABLE `result_fasting_blood_sugar`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_function_full_blood_count`
--
ALTER TABLE `result_function_full_blood_count`
  ADD PRIMARY KEY (`KEYID`);

--
-- Indexes for table `result_function_liver`
--
ALTER TABLE `result_function_liver`
  ADD PRIMARY KEY (`liverid`);

--
-- Indexes for table `result_function_renal`
--
ALTER TABLE `result_function_renal`
  ADD PRIMARY KEY (`KEYID`);

--
-- Indexes for table `result_haemoglobin_electrophoresis`
--
ALTER TABLE `result_haemoglobin_electrophoresis`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_helicobacter_pylori`
--
ALTER TABLE `result_helicobacter_pylori`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_lipid_profile`
--
ALTER TABLE `result_lipid_profile`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_pregnancy_test`
--
ALTER TABLE `result_pregnancy_test`
  ADD PRIMARY KEY (`KEYID`);

--
-- Indexes for table `result_random_blood_sugar`
--
ALTER TABLE `result_random_blood_sugar`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_thyroid_functional_test`
--
ALTER TABLE `result_thyroid_functional_test`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `result_widal`
--
ALTER TABLE `result_widal`
  ADD PRIMARY KEY (`KEYID`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`EMPLOYEEID`);

--
-- Indexes for table `samplestatus`
--
ALTER TABLE `samplestatus`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `sampletype`
--
ALTER TABLE `sampletype`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `samplingtest`
--
ALTER TABLE `samplingtest`
  ADD PRIMARY KEY (`TestKey`);

--
-- Indexes for table `scanreport`
--
ALTER TABLE `scanreport`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `semenanalysis`
--
ALTER TABLE `semenanalysis`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `setup_beta_hcg`
--
ALTER TABLE `setup_beta_hcg`
  ADD PRIMARY KEY (`KEYID`);

--
-- Indexes for table `setup_cardiac_enzymes`
--
ALTER TABLE `setup_cardiac_enzymes`
  ADD PRIMARY KEY (`SETUPID`);

--
-- Indexes for table `setup_esr`
--
ALTER TABLE `setup_esr`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `setup_fullcount_paramters`
--
ALTER TABLE `setup_fullcount_paramters`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `setup_full_blood_count_test_general`
--
ALTER TABLE `setup_full_blood_count_test_general`
  ADD PRIMARY KEY (`FBCID`);

--
-- Indexes for table `setup_full_blood_count_test_male`
--
ALTER TABLE `setup_full_blood_count_test_male`
  ADD PRIMARY KEY (`FBCID`);

--
-- Indexes for table `setup_full_count_count_female`
--
ALTER TABLE `setup_full_count_count_female`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `setup_glycated_heamoglobin_test`
--
ALTER TABLE `setup_glycated_heamoglobin_test`
  ADD PRIMARY KEY (`TESTID`);

--
-- Indexes for table `setup_lipid_profile_test`
--
ALTER TABLE `setup_lipid_profile_test`
  ADD PRIMARY KEY (`SETUPID`);

--
-- Indexes for table `setup_liver_function_test`
--
ALTER TABLE `setup_liver_function_test`
  ADD PRIMARY KEY (`SETUPID`);

--
-- Indexes for table `setup_renal_function_test`
--
ALTER TABLE `setup_renal_function_test`
  ADD PRIMARY KEY (`SETUPID`);

--
-- Indexes for table `setup_thyroid_test`
--
ALTER TABLE `setup_thyroid_test`
  ADD PRIMARY KEY (`SETUPID`);

--
-- Indexes for table `stockcategory`
--
ALTER TABLE `stockcategory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stocktransactions`
--
ALTER TABLE `stocktransactions`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`supplierid`);

--
-- Indexes for table `tax`
--
ALTER TABLE `tax`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tempo`
--
ALTER TABLE `tempo`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `TITLE` (`TITLE`);

--
-- Indexes for table `test_ascension`
--
ALTER TABLE `test_ascension`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `test_categories`
--
ALTER TABLE `test_categories`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `test_panels`
--
ALTER TABLE `test_panels`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `typhoid_test`
--
ALTER TABLE `typhoid_test`
  ADD PRIMARY KEY (`TESTID`);

--
-- Indexes for table `urinalysisresult`
--
ALTER TABLE `urinalysisresult`
  ADD PRIMARY KEY (`urinalysisKey`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activation`
--
ALTER TABLE `activation`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applicationsettings`
--
ALTER TABLE `applicationsettings`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `BILLINGID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `billinghx`
--
ALTER TABLE `billinghx`
  MODIFY `KeyID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=174;

--
-- AUTO_INCREMENT for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `branchid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `clinicianbasicinfo`
--
ALTER TABLE `clinicianbasicinfo`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `clinicianpaymentinfo`
--
ALTER TABLE `clinicianpaymentinfo`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `commodity`
--
ALTER TABLE `commodity`
  MODIFY `COMID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `companyprofile`
--
ALTER TABLE `companyprofile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `departmentconsumption`
--
ALTER TABLE `departmentconsumption`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `departmentconsumptionhx`
--
ALTER TABLE `departmentconsumptionhx`
  MODIFY `comsumeid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `departmentrequisitionhx`
--
ALTER TABLE `departmentrequisitionhx`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `departmentstocks`
--
ALTER TABLE `departmentstocks`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `emailpreference`
--
ALTER TABLE `emailpreference`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `fshresult`
--
ALTER TABLE `fshresult`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `fshsetup`
--
ALTER TABLE `fshsetup`
  MODIFY `setupid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `generalemailsettings`
--
ALTER TABLE `generalemailsettings`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `generalstocks`
--
ALTER TABLE `generalstocks`
  MODIFY `stockid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `glycated_haemoglobin`
--
ALTER TABLE `glycated_haemoglobin`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `haemoglobinelectrophoresis`
--
ALTER TABLE `haemoglobinelectrophoresis`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `hepatitisbresult`
--
ALTER TABLE `hepatitisbresult`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `hepatitisb_profile`
--
ALTER TABLE `hepatitisb_profile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hepatitiscresult`
--
ALTER TABLE `hepatitiscresult`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lhresult`
--
ALTER TABLE `lhresult`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lhsetup`
--
ALTER TABLE `lhsetup`
  MODIFY `setupid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `loginlogs`
--
ALTER TABLE `loginlogs`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `malaria`
--
ALTER TABLE `malaria`
  MODIFY `KEY` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `manager_sample_descision`
--
ALTER TABLE `manager_sample_descision`
  MODIFY `sampleid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `new_patients`
--
ALTER TABLE `new_patients`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `productordersid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `organizationaccountinformation`
--
ALTER TABLE `organizationaccountinformation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `organizationcontactperson`
--
ALTER TABLE `organizationcontactperson`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pageaccess`
--
ALTER TABLE `pageaccess`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patientemmergencycontactinformation`
--
ALTER TABLE `patientemmergencycontactinformation`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `patientsaddress`
--
ALTER TABLE `patientsaddress`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `patients_credentials`
--
ALTER TABLE `patients_credentials`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `patients_settings`
--
ALTER TABLE `patients_settings`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `paymentmodes`
--
ALTER TABLE `paymentmodes`
  MODIFY `KeyID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `psaresult`
--
ALTER TABLE `psaresult`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `psasetup`
--
ALTER TABLE `psasetup`
  MODIFY `setupid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `result_aids`
--
ALTER TABLE `result_aids`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_beta_hcg`
--
ALTER TABLE `result_beta_hcg`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_cardiac_enzymes`
--
ALTER TABLE `result_cardiac_enzymes`
  MODIFY `LIVERID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `result_comments`
--
ALTER TABLE `result_comments`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `result_esr`
--
ALTER TABLE `result_esr`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `result_fasting_blood_sugar`
--
ALTER TABLE `result_fasting_blood_sugar`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_function_full_blood_count`
--
ALTER TABLE `result_function_full_blood_count`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `result_function_liver`
--
ALTER TABLE `result_function_liver`
  MODIFY `liverid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `result_function_renal`
--
ALTER TABLE `result_function_renal`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `result_haemoglobin_electrophoresis`
--
ALTER TABLE `result_haemoglobin_electrophoresis`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_helicobacter_pylori`
--
ALTER TABLE `result_helicobacter_pylori`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `result_lipid_profile`
--
ALTER TABLE `result_lipid_profile`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_pregnancy_test`
--
ALTER TABLE `result_pregnancy_test`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `result_random_blood_sugar`
--
ALTER TABLE `result_random_blood_sugar`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_thyroid_functional_test`
--
ALTER TABLE `result_thyroid_functional_test`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `result_widal`
--
ALTER TABLE `result_widal`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `EMPLOYEEID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `samplestatus`
--
ALTER TABLE `samplestatus`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=182;

--
-- AUTO_INCREMENT for table `sampletype`
--
ALTER TABLE `sampletype`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `samplingtest`
--
ALTER TABLE `samplingtest`
  MODIFY `TestKey` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scanreport`
--
ALTER TABLE `scanreport`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `semenanalysis`
--
ALTER TABLE `semenanalysis`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_beta_hcg`
--
ALTER TABLE `setup_beta_hcg`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `setup_cardiac_enzymes`
--
ALTER TABLE `setup_cardiac_enzymes`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `setup_esr`
--
ALTER TABLE `setup_esr`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_fullcount_paramters`
--
ALTER TABLE `setup_fullcount_paramters`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_general`
--
ALTER TABLE `setup_full_blood_count_test_general`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_male`
--
ALTER TABLE `setup_full_blood_count_test_male`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=200;

--
-- AUTO_INCREMENT for table `setup_full_count_count_female`
--
ALTER TABLE `setup_full_count_count_female`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `setup_glycated_heamoglobin_test`
--
ALTER TABLE `setup_glycated_heamoglobin_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_lipid_profile_test`
--
ALTER TABLE `setup_lipid_profile_test`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `setup_liver_function_test`
--
ALTER TABLE `setup_liver_function_test`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `setup_renal_function_test`
--
ALTER TABLE `setup_renal_function_test`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `setup_thyroid_test`
--
ALTER TABLE `setup_thyroid_test`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stockcategory`
--
ALTER TABLE `stockcategory`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `supplierid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tax`
--
ALTER TABLE `tax`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `test_ascension`
--
ALTER TABLE `test_ascension`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=182;

--
-- AUTO_INCREMENT for table `test_panels`
--
ALTER TABLE `test_panels`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
