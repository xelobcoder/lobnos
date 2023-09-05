-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 05, 2023 at 07:06 AM
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

CREATE TABLE `activation` (
  `ID` int(255) NOT NULL,
  `STATUS` varchar(100) NOT NULL DEFAULT 'INACTIVE',
  `PATIENTID` int(100) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `adminmanagerpermission`
--

CREATE TABLE `adminmanagerpermission` (
  `id` int(11) NOT NULL,
  `employeeid` int(11) DEFAULT 1,
  `deletev` tinyint(1) DEFAULT 1,
  `editv` tinyint(1) DEFAULT 1,
  `registerv` tinyint(1) DEFAULT 1,
  `viewv` tinyint(1) DEFAULT 1,
  `printv` tinyint(1) DEFAULT 1,
  `activatev` tinyint(1) DEFAULT 1,
  `pageaccess` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' CHECK (json_valid(`pageaccess`)),
  `printresult` tinyint(1) DEFAULT 1,
  `viewresult` tinyint(1) DEFAULT 1,
  `enterresult` tinyint(1) DEFAULT 1,
  `editresult` tinyint(1) DEFAULT 1,
  `deleteresult` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `adminmanagerpermission`
--

INSERT INTO `adminmanagerpermission` (`id`, `employeeid`, `deletev`, `editv`, `registerv`, `viewv`, `printv`, `activatev`, `pageaccess`, `printresult`, `viewresult`, `enterresult`, `editresult`, `deleteresult`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, '{}', 1, 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `applicationsettings`
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
  `approvalbeforeprinting` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicationsettings`
--

INSERT INTO `applicationsettings` (`keyid`, `bulkregistration`, `fontsize`, `textcolor`, `BackgroundColor`, `DeactivateBilling24hrs`, `PaidBillsBeforeTransaction`, `completeFlow`, `approvalbeforeprinting`) VALUES
(1, 0, '56', 'black', 'wheat', 1, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `billing`
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
-- Dumping data for table `billing`
--

INSERT INTO `billing` (`BILLINGID`, `PATIENTID`, `PAID_AMOUNT`, `PAYABLE`, `DISCOUNT`, `ORGANIZATION`, `CLINICIAN`, `TYPE`, `OUTSTANDING`) VALUES
(41, 2023842, 600, 600, 0, 0, 0, 'PREPAID', 0),
(42, 202384, 6000, 6000, 0, 0, 0, 'PREPAID', 0),
(43, 202384, 6000, 6000, 0, 0, 0, 'PREPAID', 0),
(45, 202384, 500, 500, 0, 0, 0, 'PREPAID', 0),
(46, 202384, 6000, 6000, 0, 0, 0, 'PREPAID', 0),
(47, 202384, 6000, 6000, 0, 0, 0, 'PREPAID', 0),
(48, 202384, 6000, 6000, 0, 0, 0, 'PREPAID', 0),
(49, 202384, 600, 600, 0, 0, 0, 'PREPAID', 0),
(50, 202384, 600, 600, 0, 0, 0, 'PREPAID', 0),
(51, 2023842, 20, 20, 0, 0, 0, 'PREPAID', 0),
(52, 202384, 50, 50, 0, 0, 0, 'PREPAID', 0),
(53, 2023842, 10, 20, 0, 0, 0, 'PREPAID', 10),
(54, 2023842, 20, 20, 0, 0, 0, 'PREPAID', 0);

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

CREATE TABLE `billinghx` (
  `KeyID` int(255) NOT NULL,
  `Billingid` int(255) NOT NULL,
  `Date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `PaymentMode` int(25) NOT NULL,
  `Amount` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(59, 54, '2023-09-05 05:42:21.176938', 4, 20);

-- --------------------------------------------------------

--
-- Table structure for table `bloodgroup`
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
-- Dumping data for table `bloodgroup`
--

INSERT INTO `bloodgroup` (`ID`, `BILLINGID`, `BGROUP`, `RHESUS`, `CREATED_ON`, `UPDATED_ON`, `TIME`, `PATIENTID`, `REMARKS`) VALUES
(1, 1, 'AB', 'positive', '2023-09-03', '2023-09-03', '09:02:43.000000', 2023729, 'wefjjfu');

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `BRANCHID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `ACTIVATION` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`BRANCHID`, `NAME`, `DATE`, `ACTIVATION`) VALUES
(1, 'yendi branch', '2023-09-03', 1),
(2, 'sda branch', '2023-09-03', 1),
(3, 'buipe branch', '2023-09-03', 1),
(4, 'Tamale central', '2023-09-03', 1);

-- --------------------------------------------------------

--
-- Table structure for table `clinician`
--

CREATE TABLE `clinician` (
  `ID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `LOCATION` varchar(100) NOT NULL,
  `ADDRESS` varchar(255) NOT NULL,
  `OCCUPATION` varchar(100) NOT NULL,
  `MODULE` varchar(100) NOT NULL,
  `MOMO` int(50) DEFAULT NULL,
  `BANKNAME` varchar(255) DEFAULT NULL,
  `BANKBRANCH` varchar(255) DEFAULT NULL,
  `ACCOUNTNUMBER` int(100) DEFAULT NULL,
  `ACCOUNTNAME` varchar(255) DEFAULT NULL,
  `ORGANIZATION` int(50) NOT NULL,
  `UPDATE_ON` date NOT NULL DEFAULT current_timestamp(),
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `PHONE` int(10) NOT NULL,
  `COMMISSION` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clinician`
--

INSERT INTO `clinician` (`ID`, `NAME`, `EMAIL`, `LOCATION`, `ADDRESS`, `OCCUPATION`, `MODULE`, `MOMO`, `BANKNAME`, `BANKBRANCH`, `ACCOUNTNUMBER`, `ACCOUNTNAME`, `ORGANIZATION`, `UPDATE_ON`, `CREATED_ON`, `PHONE`, `COMMISSION`) VALUES
(0, 'direct', 'labhill@gmail.com', 'null', '', '', '', NULL, NULL, NULL, NULL, NULL, 0, '2023-09-03', '0000-00-00 00:00:00.000000', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `commodity`
--

CREATE TABLE `commodity` (
  `COMID` int(255) NOT NULL,
  `COMMODITY` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `CATEGORY` varchar(255) NOT NULL,
  `suppliedby` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companyprofile`
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
-- Dumping data for table `companyprofile`
--

INSERT INTO `companyprofile` (`ID`, `NAME`, `EMAIL`, `MOTTO`, `PHONENUMBER`, `ADDRESS`, `ALTERNATIVENUMBER`, `WEBSITE`, `STREET`) VALUES
(1, 'Mauplaus Diagnostic Limited', 'mauplausl@gmail.com', 'Health and happiness', 595964565, 'Opposite SDA Gbanjil Road Hse No 19', 240434803, 'mauplus@gmail.com', 'Kalpohin Lowcost 30A');

-- --------------------------------------------------------

--
-- Table structure for table `customerrepresentativepermission`
--

CREATE TABLE `customerrepresentativepermission` (
  `employeeid` int(255) NOT NULL,
  `deletev` tinyint(1) NOT NULL DEFAULT 0,
  `editv` tinyint(1) NOT NULL DEFAULT 0,
  `viewv` tinyint(1) NOT NULL DEFAULT 0,
  `registerv` tinyint(1) NOT NULL DEFAULT 0,
  `printv` tinyint(1) NOT NULL DEFAULT 0,
  `activatev` tinyint(1) NOT NULL DEFAULT 0,
  `keyid` int(255) NOT NULL,
  `pageAccess` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`pageAccess`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departmentrequisitionhx`
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
  `quantityReceived` int(20) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `departmentManager` varchar(100) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `employeeid` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `department`, `departmentManager`, `date`, `employeeid`) VALUES
(1, 'serology', '', '2023-09-03 08:53:29.767465', 0),
(2, 'hematology', '', '2023-09-03 08:53:29.842905', 0),
(3, 'endocrinology', '', '2023-09-03 08:53:29.892959', 0),
(4, 'chemistry', 'Nyaaba Asana Awineyila', '2023-09-03 08:53:29.959643', 1),
(5, 'microbiology', 'Nyaaba Asana Awineyila', '2023-09-03 08:53:30.000791', 1);

-- --------------------------------------------------------

--
-- Table structure for table `departmentstocks`
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

-- --------------------------------------------------------

--
-- Table structure for table `fshresult`
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

-- --------------------------------------------------------

--
-- Table structure for table `fshsetup`
--

CREATE TABLE `fshsetup` (
  `setupid` int(255) NOT NULL,
  `upper` int(10) NOT NULL,
  `lower` int(10) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `parameter` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `glycated_haemoglobin`
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

-- --------------------------------------------------------

--
-- Table structure for table `haemoglobinelectrophoresis`
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
-- Dumping data for table `hepatitisbresult`
--

INSERT INTO `hepatitisbresult` (`ID`, `BILLINGID`, `PATIENTID`, `CREATED_ON`, `TIME`, `RESULTS`, `SCIENTISTID`, `REMARKS`) VALUES
(1, 1, 2023729, '2023-09-03', '09:02:53.000000', 'non reactive', 2, 'jdjwdfjkwdfj');

-- --------------------------------------------------------

--
-- Table structure for table `hepatitisb_profile`
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
-- Dumping data for table `hepatitisb_profile`
--

INSERT INTO `hepatitisb_profile` (`ID`, `HBsAg`, `HBsAb`, `HBeAg`, `HBeAb`, `HBcAb`, `COMMENTS`, `BILLINGID`, `CREATED_ON`, `UPDATED_ON`, `SCIENTIST`, `PATIENTID`) VALUES
(1, 'non reactive', 'non reactive', 'reactive', 'reactive', 'reactive', 'wekfkwejkwekj', 5, '2023-09-04', NULL, NULL, 2023729),
(2, 'reactive', 'reactive', 'non reactive', 'reactive', 'non reactive', 'wdkjqJFKAFUY', 36, '2023-09-04', NULL, NULL, 2023729);

-- --------------------------------------------------------

--
-- Table structure for table `hepatitiscresult`
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
-- Dumping data for table `hepatitiscresult`
--

INSERT INTO `hepatitiscresult` (`ID`, `BILLINGID`, `PATIENTID`, `CREATED_ON`, `TIME`, `RESULTS`, `SCIENTISTID`, `REMARKS`) VALUES
(1, 34, 2023729, '2023-09-04', '12:47:33.000000', 'reactive', 2, 'iweiwiqwi'),
(2, 50, 202384, '2023-09-04', '16:32:13.000000', 'non reactive', 2, '3kjeetu2et2euifjkwxm,zui\njiwuflwegjeug2eifwduijefjejf\n\nejwfjwefj2efjwdwyfuefsvwduig\n\njhejkwei2eioo2ei2eio2r'),
(3, 49, 202384, '2023-09-04', '17:24:31.000000', 'non reactive', 2, 'wdkjawhjwej');

-- --------------------------------------------------------

--
-- Table structure for table `lhresult`
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

-- --------------------------------------------------------

--
-- Table structure for table `lhsetup`
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
-- Dumping data for table `lhsetup`
--

INSERT INTO `lhsetup` (`setupid`, `upper`, `lower`, `unit`, `gender`, `parameter`) VALUES
(1, 499, 88, 'U/L', 'male', 'LH'),
(2, 949, 99, 'U/L', 'female', 'LH');

-- --------------------------------------------------------

--
-- Table structure for table `loginlogs`
--

CREATE TABLE `loginlogs` (
  `keyid` int(255) NOT NULL,
  `loginTime` datetime(6) NOT NULL,
  `employeeid` int(10) NOT NULL,
  `loginSessionId` int(10) NOT NULL,
  `logoutTime` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `malaria`
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
-- Dumping data for table `malaria`
--

INSERT INTO `malaria` (`KEY`, `PATIENTID`, `BILLINGID`, `SPECIES`, `COMMENTS`, `PARASITENUMBER`, `CREATED_ON`, `UPDATED_ON`) VALUES
(1, 2023729, 1, 'Falciparum', 'oiwiwefi', 100, '2023-09-03 09:01:43.626931', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `manager_sample_descision`
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

-- --------------------------------------------------------

--
-- Table structure for table `newstock`
--

CREATE TABLE `newstock` (
  `stockid` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` int(10) NOT NULL,
  `consumptionunit` varchar(255) NOT NULL,
  `purchaseunit` varchar(255) NOT NULL,
  `quantity` int(255) NOT NULL,
  `alertlevel` int(255) NOT NULL,
  `materialcode` varchar(255) NOT NULL,
  `tax` int(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `new_patients`
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
-- Dumping data for table `new_patients`
--

INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FIRSTNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `MARITAL_STATUS`, `MOBILE_NUMBER`, `AGETYPE`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`, `LASTNAME`, `MIDDLENAME`, `ORGANIZATION`) VALUES
(2, 202384, 'Tiifu', 'hamzatiifu45@gmail.com', '1991-11-06', 31, 'male', 'married', '059594565', 'years', 'Nursing', '2023-09-04', 'TRUE', 'Hamza', 'boronson kojo', 'leonides'),
(3, 2023842, 'mildred', 'hamzatiifu45@gemail.com', '1992-11-11', 30, 'female', 'married', '0543085842', 'years', 'Nursing', '2023-09-04', 'TRUE', 'nyaaba', 'awineyila', 'leonides');

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

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `productordersid` int(255) NOT NULL,
  `stockid` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tax` int(255) NOT NULL,
  `supplierid` int(255) NOT NULL,
  `suppliername` varchar(255) NOT NULL,
  `purchaseunit` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `quantity` int(255) NOT NULL,
  `received` varchar(255) DEFAULT 'FALSE',
  `quantityReceived` int(255) DEFAULT NULL,
  `Batchnumber` varchar(255) DEFAULT NULL,
  `balance` int(255) DEFAULT 0,
  `expirydate` date DEFAULT NULL,
  `receiveddate` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `price` int(255) DEFAULT NULL,
  `totalamount` int(255) DEFAULT NULL,
  `productused` varchar(50) DEFAULT 'FALSE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organization`
--

CREATE TABLE `organization` (
  `ID` int(11) NOT NULL,
  `NAME` varchar(255) DEFAULT NULL,
  `LOCATION` varchar(255) DEFAULT NULL,
  `STREETNAME` varchar(255) DEFAULT NULL,
  `MOBILENUMBER` varchar(20) DEFAULT NULL,
  `ADDRESS` text DEFAULT NULL,
  `WEBSITE` varchar(255) DEFAULT NULL,
  `EMAIL` varchar(255) DEFAULT NULL,
  `REGION` varchar(100) DEFAULT NULL,
  `DISTRICT` varchar(100) DEFAULT NULL,
  `GPSMAPPING` varchar(255) DEFAULT NULL,
  `CONTACTPERSON` varchar(255) DEFAULT NULL,
  `PAYMENTMODULE` varchar(255) DEFAULT NULL,
  `COMMISSION` int(255) DEFAULT NULL,
  `BANKNAME` varchar(255) DEFAULT NULL,
  `BRANCH` varchar(255) DEFAULT NULL,
  `ACCOUNTNAME` varchar(255) DEFAULT NULL,
  `CONTACTEMAIL` varchar(255) DEFAULT NULL,
  `ACCOUNTNUMBER` varchar(255) DEFAULT NULL,
  `MOMO` int(255) DEFAULT NULL,
  `CONTACTNUMBER` int(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizationaccountinformation`
--

CREATE TABLE `organizationaccountinformation` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `bankname` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `accountname` varchar(255) DEFAULT NULL,
  `accountnumber` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizationcontactperson`
--

CREATE TABLE `organizationcontactperson` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `contactperson` varchar(255) DEFAULT NULL,
  `contactemail` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organization_basic`
--

CREATE TABLE `organization_basic` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `streetname` varchar(255) DEFAULT NULL,
  `mobilenumber` int(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `gpsmapping` varchar(255) DEFAULT NULL,
  `commission` int(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pageaccess`
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

-- --------------------------------------------------------

--
-- Table structure for table `patientemmergencycontactinformation`
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
-- Dumping data for table `patientemmergencycontactinformation`
--

INSERT INTO `patientemmergencycontactinformation` (`keyid`, `patientid`, `emmergencyContactName`, `emmergencyContactNumber`, `relationship`, `occupation`, `address`) VALUES
(1, 202384, NULL, NULL, NULL, NULL, NULL),
(2, 2023842, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `patientsaddress`
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
-- Dumping data for table `patientsaddress`
--

INSERT INTO `patientsaddress` (`keyid`, `patientid`, `area`, `region`, `gpsLocation`, `address`) VALUES
(1, 202384, NULL, NULL, NULL, NULL),
(2, 2023842, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `paymentmodes`
--

CREATE TABLE `paymentmodes` (
  `KeyID` int(255) NOT NULL,
  `PaymentMode` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Dumping data for table `performing_test`
--

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `PHELOBOTOMIST`, `TIME`, `PHELOBOTOMY_MESSAGE`, `INSPECTION`, `INSPECTION_TIME`) VALUES
(41, '2023842', '2023-09-04', 'moderate', 41, 1, NULL, '15:38:36.000000', '', 0, '15:38:36.000000'),
(42, '202384', '2023-09-04', 'emmergency', 42, 1, NULL, '15:46:49.000000', '', 0, '15:46:49.000000'),
(43, '202384', '2023-09-04', 'emmergency', 43, 1, NULL, '15:47:09.000000', '', 0, '15:47:09.000000'),
(45, '202384', '2023-09-04', 'moderate', 45, 1, NULL, '16:02:28.000000', '', 0, '16:02:28.000000'),
(46, '202384', '2023-09-04', 'none', 46, 1, NULL, '16:12:13.000000', '', 0, '16:12:13.000000'),
(47, '202384', '2023-09-04', 'none', 47, 1, NULL, '16:14:20.000000', '', 0, '16:14:20.000000'),
(48, '202384', '2023-09-04', 'none', 48, 1, NULL, '16:17:30.000000', '', 0, '16:17:30.000000'),
(49, '202384', '2023-09-04', 'none', 49, 1, NULL, '16:18:05.000000', '', 0, '16:18:05.000000'),
(50, '202384', '2023-09-04', 'none', 50, 1, NULL, '16:20:00.000000', '', 0, '16:20:00.000000'),
(51, '2023842', '2023-09-04', 'none', 51, 1, NULL, '16:37:45.000000', '', 0, '16:37:45.000000'),
(52, '202384', '2023-09-04', 'moderate', 52, 1, NULL, '16:38:38.000000', '', 0, '16:38:38.000000'),
(53, '2023842', '2023-09-05', 'none', 53, 1, NULL, '05:25:22.000000', '', 0, '05:25:22.000000'),
(54, '2023842', '2023-09-05', 'moderate', 54, 1, NULL, '05:42:21.000000', '', 0, '05:42:21.000000');

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
-- Table structure for table `result_aids`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_beta_hcg`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_cardiac_enzymes`
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
(18, 'lactate dehydrogenase (LDH)', 48, 444, '2023-09-04 17:25:04.354330', '2023-09-04 17:25:04.354330', 202384);

-- --------------------------------------------------------

--
-- Table structure for table `result_comments`
--

CREATE TABLE `result_comments` (
  `keyid` int(255) NOT NULL,
  `testid` int(50) NOT NULL,
  `billingid` int(50) NOT NULL,
  `comments` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(12, 5, 48, 'JKFJKWdGHQGDH');

-- --------------------------------------------------------

--
-- Table structure for table `result_esr`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_fasting_blood_sugar`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_function_full_blood_count`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_function_liver`
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
(14, 'creatinine', 45, 'mg/dl', '2023-09-04 16:03:37.930716', NULL, 9439, 202384);

-- --------------------------------------------------------

--
-- Table structure for table `result_function_renal`
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
(21, 'albumin', 36, 'mg/dl', '2023-09-04 12:48:28.371105', '2023-09-04 12:48:28.371105', 11, 2023729);

-- --------------------------------------------------------

--
-- Table structure for table `result_haemoglobin_electrophoresis`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_helicobacter_pylori`
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
-- Dumping data for table `result_helicobacter_pylori`
--

INSERT INTO `result_helicobacter_pylori` (`keyid`, `specimen`, `result`, `billingid`, `created_on`, `updated_on`, `patientid`, `comments`) VALUES
(1, 'blood', 'non reactive', 3, '2023-09-03 14:39:35.466056', NULL, 2023729, 'jefujwejwewek\n\n\nprobably'),
(2, 'blood', 'non reactive', 2, '2023-09-03 14:43:09.644603', NULL, 2023729, 'fljkkfkwfhfefujqehfjh\njejejtjej\nprince is here to stay\ngoing to time with in close database and probably things'),
(3, 'blood', 'non reactive', 52, '2023-09-05 05:43:59.951468', NULL, 202384, 'wekgjkgjk');

-- --------------------------------------------------------

--
-- Table structure for table `result_lipid_profile`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_pregnancy_test`
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
-- Dumping data for table `result_pregnancy_test`
--

INSERT INTO `result_pregnancy_test` (`KEYID`, `METHOD`, `VALUE`, `CREATED_ON`, `UPDATED_ON`, `COMMENTS`, `PATIENTID`, `BILLINGID`, `TESTID`) VALUES
(1, 'Urine', 'positive', '2023-09-04 12:49:55.667196', '2023-09-04 12:49:55.667196', 'WJIUHfhqwfy', 2023729, 36, 14);

-- --------------------------------------------------------

--
-- Table structure for table `result_random_blood_sugar`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_thyroid_functional_test`
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

-- --------------------------------------------------------

--
-- Table structure for table `result_widal`
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
-- Dumping data for table `result_widal`
--

INSERT INTO `result_widal` (`KEYID`, `TYPHIO`, `TYPHIH`, `PARATYPHIAH`, `PARATYPHIBH`, `COMMENTS`, `CREATED_ON`, `UPDATED_ON`, `BILLINGID`, `PATIENTID`) VALUES
(1, '1/20', '1/80', '1/80', '1/20', 'gkrgllwel', '2023-09-04 05:22:06.357165', NULL, 5, 2023729);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
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
  `EMAIL` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`EMPLOYEEID`, `USERNAME`, `ROLE`, `PASSWORD`, `DATE_CREATED`, `TIME`, `REFRESH_TOKEN`, `ACTIVATION`, `EMAIL`) VALUES
(1, 'Nyaaba Asana Awineyila', 'admin', '$2b$10$HkJnj8Spk4SP7ShOK4hh0uIc9pKJaBgR6wxf3ALexqnV6W2bLhD.S', '2023-09-03', '08:54:05.000000', NULL, 1, 'mildred@gmail.com');

--
-- Triggers `roles`
--
DELIMITER $$
CREATE TRIGGER `autoPermissionLogging` AFTER INSERT ON `roles` FOR EACH ROW BEGIN
  IF NEW.ROLE = 'SCIENTIST' THEN
    INSERT INTO scientistpermission (EMPLOYEEID)
    VALUES (NEW.EMPLOYEEID);
  ELSEIF NEW.ROLE = 'CUSTOMER SERVICE REPRESENTATIVE' THEN
    INSERT INTO customerrepresentativepermission (EMPLOYEEID)
    VALUES (NEW.EMPLOYEEID);
  ELSE
    INSERT INTO adminmanagerpermission (EMPLOYEEID)
    VALUES (NEW.EMPLOYEEID);
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `deleteautoLogging` AFTER DELETE ON `roles` FOR EACH ROW BEGIN
  IF OLD.ROLE = 'customer service representative' THEN
    DELETE FROM customerrepresentativepermission WHERE EMPLOYEEID = OLD.EMPLOYEEID;
  ELSEIF OLD.ROLE = 'scientist' THEN
    DELETE FROM scientistpermission WHERE EMPLOYEEID = OLD.EMPLOYEEID;
  ELSE
    DELETE FROM adminmanagerpermission WHERE EMPLOYEEID = OLD.EMPLOYEEID;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `samplestatus`
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
-- Dumping data for table `samplestatus`
--

INSERT INTO `samplestatus` (`keyid`, `date`, `message`, `testid`, `billingid`, `approvalstatus`) VALUES
(16, '2023-09-04 15:38:36.755021', NULL, 2, 41, 1),
(17, '2023-09-04 15:46:49.549541', NULL, 5, 42, 1),
(18, '2023-09-04 15:47:09.475569', NULL, 5, 43, 1),
(20, '2023-09-04 16:02:28.245635', NULL, 10, 45, 1),
(21, '2023-09-04 16:12:13.792479', NULL, 5, 46, 1),
(22, '2023-09-04 16:14:21.188564', NULL, 5, 47, 1),
(23, '2023-09-04 16:17:31.067719', NULL, 5, 48, 1),
(24, '2023-09-04 16:18:05.700664', NULL, 5, 49, 1),
(25, '2023-09-04 16:18:05.725784', NULL, 8, 49, 1),
(26, '2023-09-04 16:20:00.979558', NULL, 8, 50, 1),
(27, '2023-09-04 16:37:45.677649', NULL, 1, 51, 1),
(28, '2023-09-04 16:38:38.912637', NULL, 27, 52, 1),
(29, '2023-09-05 05:25:22.238282', NULL, 1, 53, 1),
(30, '2023-09-05 05:42:21.227022', NULL, 1, 54, 1);

-- --------------------------------------------------------

--
-- Table structure for table `sampletype`
--

CREATE TABLE `sampletype` (
  `id` int(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `addedon` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sampletype`
--

INSERT INTO `sampletype` (`id`, `name`, `addedon`) VALUES
(1, 'urine', '2023-09-03'),
(2, 'blood', '2023-09-03'),
(3, 'serum', '2023-09-03'),
(4, 'stool', '2023-09-03');

-- --------------------------------------------------------

--
-- Table structure for table `samplingtest`
--

CREATE TABLE `samplingtest` (
  `TestKey` int(255) NOT NULL,
  `TestId` int(50) NOT NULL,
  `Billingid` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scientistpermission`
--

CREATE TABLE `scientistpermission` (
  `id` int(11) NOT NULL,
  `employeeid` int(11) NOT NULL,
  `deletev` tinyint(1) DEFAULT 0,
  `editv` tinyint(1) DEFAULT 0,
  `registerv` tinyint(1) DEFAULT 0,
  `viewv` tinyint(1) DEFAULT 0,
  `printv` tinyint(1) DEFAULT 0,
  `activatev` tinyint(1) DEFAULT 0,
  `pageAccess` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '\'{}\'',
  `viewresult` tinyint(1) DEFAULT 0,
  `printresult` tinyint(1) DEFAULT 0,
  `enterresult` tinyint(1) DEFAULT 0,
  `editresult` tinyint(1) DEFAULT 0,
  `deleteresult` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `semenanalysis`
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

-- --------------------------------------------------------

--
-- Table structure for table `setup_beta_hcg`
--

CREATE TABLE `setup_beta_hcg` (
  `KEYID` int(255) NOT NULL,
  `WEEKS` int(10) NOT NULL,
  `LOWER` int(255) NOT NULL,
  `UPPER` int(255) NOT NULL,
  `UNIT` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `setup_cardiac_enzymes` (
  `SETUPID` int(255) NOT NULL,
  `UNIT` varchar(255) NOT NULL,
  `UPPER` int(20) NOT NULL,
  `LOWER` int(20) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `DISPLAY` varchar(10) NOT NULL DEFAULT 'TRUE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `setup_esr` (
  `keyid` int(255) NOT NULL,
  `agelimit` varchar(50) NOT NULL,
  `upper` int(50) NOT NULL,
  `lower` int(50) NOT NULL,
  `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `gender` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `setup_fullcount_paramters`
--

CREATE TABLE `setup_fullcount_paramters` (
  `ID` int(255) NOT NULL,
  `PARAMETER` varchar(250) NOT NULL,
  `UPPER` int(100) NOT NULL,
  `LOWER` int(100) NOT NULL,
  `UNIT` varchar(20) NOT NULL,
  `DATE` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `setup_full_blood_count_test_general`
--

CREATE TABLE `setup_full_blood_count_test_general` (
  `FBCID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `UNIT` varchar(10) NOT NULL,
  `LOWER` int(10) NOT NULL,
  `UPPER` int(10) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `setup_full_blood_count_test_male`
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
-- Dumping data for table `setup_full_blood_count_test_male`
--

INSERT INTO `setup_full_blood_count_test_male` (`FBCID`, `PARAMETER`, `UNIT`, `LOWER`, `UPPER`, `DATE`) VALUES
(34, 'wbc', '', 20, 30, '2023-09-04 10:02:02'),
(35, 'neutrophils', 'g/dl', 0, 0, '2023-09-04 10:02:02'),
(36, 'eosinophils', '', 0, 0, '2023-09-04 10:02:02'),
(37, 'basophils', '', 0, 0, '2023-09-04 10:02:02'),
(38, 'lymphocytes', '', 0, 0, '2023-09-04 10:02:02'),
(39, 'monocytes', 'g/hj', 0, 0, '2023-09-04 10:02:02'),
(40, 'mch', 'g/hj', 0, 0, '2023-09-04 10:02:02'),
(41, 'mcv', 'g/hj', 0, 0, '2023-09-04 10:02:02'),
(42, 'mchc', '%', 0, 0, '2023-09-04 10:02:02'),
(43, 'rdw-cv', '%', 0, 0, '2023-09-04 10:02:02'),
(44, 'rdw-sd', '%', 0, 0, '2023-09-04 10:02:02');

-- --------------------------------------------------------

--
-- Table structure for table `setup_full_count_count_female`
--

CREATE TABLE `setup_full_count_count_female` (
  `PARAMETER` varchar(255) NOT NULL,
  `UNIT` varchar(10) NOT NULL,
  `UPPER` int(10) NOT NULL,
  `LOWER` int(10) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `keyid` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `setup_glycated_heamoglobin_test`
--

CREATE TABLE `setup_glycated_heamoglobin_test` (
  `TESTID` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `setup_lipid_profile_test`
--

CREATE TABLE `setup_lipid_profile_test` (
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER` int(100) NOT NULL,
  `LOWER` int(100) NOT NULL,
  `UNIT` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `setup_liver_function_test` (
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER` int(100) NOT NULL,
  `LOWER` int(100) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UNIT` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `setup_renal_function_test` (
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER` int(50) NOT NULL,
  `LOWER` int(50) NOT NULL,
  `UNIT` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(7, 'albumin', 1000, 50, 'mg/dl');

-- --------------------------------------------------------

--
-- Table structure for table `setup_thyroid_test`
--

CREATE TABLE `setup_thyroid_test` (
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `UNIT` varchar(255) NOT NULL,
  `UPPER` int(255) NOT NULL,
  `LOWER` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `stockcategory` (
  `id` int(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocktransactions`
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

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `SUPPLIERID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `COMMODITY` varchar(255) NOT NULL,
  `ADDRESS` varchar(255) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `PHONENUMBER` int(255) NOT NULL,
  `CONTACTPERSON` varchar(255) NOT NULL,
  `REGION` varchar(255) NOT NULL,
  `EMAIL` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tempo`
--

CREATE TABLE `tempo` (
  `ID` int(144) NOT NULL,
  `TITLE` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test_ascension`
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
-- Dumping data for table `test_ascension`
--

INSERT INTO `test_ascension` (`id`, `testid`, `billingid`, `collection`, `processing`, `ready`, `processing_date`, `collection_date`, `ready_date`, `printedNumber`, `printedDate`, `ApprovalStatus`, `Scientist`, `ApprovedBy`, `declineMessage`, `actionPlan`) VALUES
(16, 2, 41, 'true', 'true', 'false', '2023-09-04 15:46:21.000000', '2023-09-04 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(17, 5, 42, 'true', 'false', 'false', NULL, '2023-09-04 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(18, 5, 43, 'true', 'true', 'true', '2023-09-04 17:24:16.000000', '2023-09-04 00:00:00.000000', '2023-09-04 17:24:22.000000', NULL, NULL, 1, NULL, NULL, NULL, NULL),
(20, 10, 45, 'true', 'true', 'true', '2023-09-04 16:03:24.000000', '2023-09-04 00:00:00.000000', '2023-09-04 16:03:37.000000', NULL, NULL, 1, NULL, NULL, NULL, NULL),
(21, 5, 46, 'true', 'true', 'true', '2023-09-04 17:24:49.000000', '2023-09-04 00:00:00.000000', '2023-09-04 17:24:54.000000', NULL, NULL, 1, NULL, NULL, NULL, NULL),
(22, 5, 47, 'true', 'false', 'false', NULL, '2023-09-04 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(23, 5, 48, 'true', 'true', 'true', '2023-09-04 17:24:58.000000', '2023-09-04 00:00:00.000000', '2023-09-04 17:25:04.000000', NULL, NULL, 1, NULL, NULL, NULL, NULL),
(24, 5, 49, 'true', 'false', 'false', NULL, '2023-09-04 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(25, 8, 49, 'true', 'true', 'true', '2023-09-04 17:24:27.000000', '2023-09-04 00:00:00.000000', '2023-09-04 17:24:31.000000', NULL, NULL, 0, NULL, NULL, NULL, NULL),
(26, 8, 50, 'true', 'true', 'true', '2023-09-04 16:31:58.000000', '2023-09-04 00:00:00.000000', '2023-09-04 16:32:13.000000', NULL, NULL, 0, NULL, NULL, NULL, NULL),
(27, 1, 51, 'true', 'false', 'false', NULL, '2023-09-04 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(28, 27, 52, 'true', 'false', 'true', NULL, '2023-09-04 00:00:00.000000', '2023-09-05 05:43:59.000000', NULL, NULL, 1, NULL, NULL, NULL, NULL),
(29, 1, 53, 'true', 'false', 'false', NULL, '2023-09-05 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(30, 1, 54, 'true', 'false', 'false', NULL, '2023-09-05 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL);

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

CREATE TABLE `test_categories` (
  `ID` int(255) NOT NULL,
  `CATEGORY` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test_panels`
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
-- Dumping data for table `test_panels`
--

INSERT INTO `test_panels` (`ID`, `NAME`, `CATEGORY`, `PRICE`, `CREATED_ON`, `SAMPLE`, `DESCRIPTION`, `SAMPLE_CONTAINER`, `UNIT`, `QTY_REQUIRED`) VALUES
(1, 'Malaria', 3, 20, '2023-04-12 05:54:35', '4', 'jwdfjwdjkwdjkfjkwejk wdfkwegkekge\nhejhwdjgjev\negjejgjegje', 'urine', 'mls', '499'),
(2, 'Glycated Heamoglobin', 3, 600, '2023-04-12 07:02:57', '4', 'test for blood sugar usage ', 'edta tube', 'mls', '4'),
(3, 'Widal', 2, 600, '2023-04-12 13:08:29', '4', 'For testing salmonella typhi infection\n\n\nprop up for more challenges ahead and try not to be johnson\n', 'edta tube', 'mls', '3'),
(4, 'blood grouping', 2, 50, '2023-04-12 15:28:43', '4', 'nullKFKWKFWEKFKWFKQKFKQWFKWKFKWFKQWK', 'edta tube', 'mls', '32'),
(5, 'cardiac enzymes', 1, 6000, '2023-04-12 15:29:35', '4', 'analysis of cardiac enzymes', 'gell tube ', 'g/dl', '5'),
(6, 'Hepatitis B', 2, 500, '2023-04-13 07:06:15', '6', 'Hepatitis b is not null', 'edta tube', 'mls', '320'),
(7, 'Hepatitis B Profile', 3, 500, '2023-04-13 07:20:25', 'serum', 'Test for all antigens related to viral hepatitis ', 'gell tube', 'mls', '50'),
(8, 'Hepatitis C', 1, 600, '2023-04-13 07:21:47', '9', 'Testing for Hepatitis C infection', 'edta tube', 'mls', '3'),
(10, 'liver function test', 1, 500, '2023-04-13 18:53:09', '4', 'priced here is not null be offensive', 'gell tube', 'mls', '3'),
(11, 'renal function test', 2, 500, '2023-04-13 18:53:34', 'serum', 'RENAL FUNCTION TEST', 'gell tube', 'mls', '5'),
(12, 'Lipid profile', 0, 900, '2023-04-17 12:15:45', 'serum', 'efjwejfjwfjq', 'gell tube', 'mls', '4'),
(13, 'urinalysis', 0, 60, '2023-04-27 01:48:23', 'urine', 'Urine taking', 'urine', 'mls', '50'),
(14, 'Pregnancy test(Urine)', 3, 30, '2023-04-30 09:16:19', '3', 'Test for pregnancy antigen', 'urine', 'mls', '5'),
(15, 'Thyroid functional test', 3, 600, '2023-05-02 22:33:32', 'serum', 'Test for the functionality of the thyroid', 'gell tube', 'mg/dl', '5'),
(16, 'BetaHcg', 5, 600, '2023-05-07 12:21:11', '2', 'BetaHcg', 'edta tube', 'mls', '4'),
(17, 'aids', 2, 20, '2023-05-07 12:34:48', 'blood', 'testing for aids test', 'blood', 'mls', '4'),
(19, 'estimated sedimentation rate (ESR)', 1, 60, '2023-05-07 23:34:36', 'blood', 'uefueururu', 'gell tube', 'mls', '5'),
(20, 'fasting blood sugar', 3, 20, '2023-05-16 10:45:28', 'blood', 'testing for blood sugar in the body', 'edta tube', 'mg/dl', '3'),
(21, 'random blood sugar', 6, 20, '2023-05-16 10:46:09', 'blood', 'sugar testing ', 'gell tube ', 'mg/dl', '3'),
(22, 'full blood count', 6, 50, '2023-04-30 09:16:19', 'blood', 'Blood cell analysis', 'edta tube', 'mls', '4'),
(25, 'stool analysis', 2, 29, '2023-07-15 22:39:21', 'stool', 'rjgje', 'stool container', 'g', '10g'),
(26, 'clotting and bleeding time', 3, 200, '2023-07-16 00:08:49', '3', 'jdjdjdj', 'edta tube', 'mls', '5'),
(27, 'helicobacter pylori', 5, 50, '2023-07-17 10:08:56', '4', 'jgjwgjk', 'edta tube', 'mls', '5'),
(28, 'semen analysis', 4, 200, '2023-07-17 10:12:00', 'semen', 'eguirlkgwdjlguwjk,m', 'semen', 'mls', '5'),
(31, 'Luteinizing Hormone', 3, 50, '2023-07-17 10:20:19', 'blood', 'uhfjsdjvjk', 'gell tube', 'mls', '5'),
(32, 'Follicle Stimulating Hormone', 3, 50, '2023-07-17 10:20:46', 'blood', 'uhfjsdjvjk', 'gell tube', 'mls', '5'),
(33, 'heamoglobin test', 4, 49, '2023-08-24 22:41:14', 'urine', 'lorem ipsum', 'Edta Tube', 'mls', '5'),
(34, 'Haemoglogin electrophoreesis', 4, 500, '2023-08-25 08:46:19', 'blood', 'AGREEMENT\n\n\nTHIS agreement is entered into as of ___________________ by and between kadimart enterprise, a subsidiary of Kadima Company limited and __________________ also referred herein as a sale representative both of whom agree to be bound by this agr', 'edta tube', 'mls', '4');

-- --------------------------------------------------------

--
-- Table structure for table `typhoid_test`
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

-- --------------------------------------------------------

--
-- Table structure for table `urinalysisresult`
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
-- Indexes for dumped tables
--

--
-- Indexes for table `activation`
--
ALTER TABLE `activation`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `adminmanagerpermission`
--
ALTER TABLE `adminmanagerpermission`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `applicationsettings`
--
ALTER TABLE `applicationsettings`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `billing`
--
ALTER TABLE `billing`
  ADD PRIMARY KEY (`BILLINGID`);

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
  ADD PRIMARY KEY (`BRANCHID`);

--
-- Indexes for table `clinician`
--
ALTER TABLE `clinician`
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
-- Indexes for table `customerrepresentativepermission`
--
ALTER TABLE `customerrepresentativepermission`
  ADD PRIMARY KEY (`keyid`);

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
-- Indexes for table `newstock`
--
ALTER TABLE `newstock`
  ADD PRIMARY KEY (`stockid`);

--
-- Indexes for table `new_patients`
--
ALTER TABLE `new_patients`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `PATIENTID` (`PATIENTID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`productordersid`);

--
-- Indexes for table `organization`
--
ALTER TABLE `organization`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `organizationaccountinformation`
--
ALTER TABLE `organizationaccountinformation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_id` (`organization_id`);

--
-- Indexes for table `organizationcontactperson`
--
ALTER TABLE `organizationcontactperson`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_id` (`organization_id`);

--
-- Indexes for table `organization_basic`
--
ALTER TABLE `organization_basic`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `scientistpermission`
--
ALTER TABLE `scientistpermission`
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
  ADD PRIMARY KEY (`SUPPLIERID`);

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
-- AUTO_INCREMENT for table `adminmanagerpermission`
--
ALTER TABLE `adminmanagerpermission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `applicationsettings`
--
ALTER TABLE `applicationsettings`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `BILLINGID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `billinghx`
--
ALTER TABLE `billinghx`
  MODIFY `KeyID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `BRANCHID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `clinician`
--
ALTER TABLE `clinician`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `commodity`
--
ALTER TABLE `commodity`
  MODIFY `COMID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companyprofile`
--
ALTER TABLE `companyprofile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customerrepresentativepermission`
--
ALTER TABLE `customerrepresentativepermission`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departmentrequisitionhx`
--
ALTER TABLE `departmentrequisitionhx`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `departmentstocks`
--
ALTER TABLE `departmentstocks`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fshresult`
--
ALTER TABLE `fshresult`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fshsetup`
--
ALTER TABLE `fshsetup`
  MODIFY `setupid` int(255) NOT NULL AUTO_INCREMENT;

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
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hepatitisb_profile`
--
ALTER TABLE `hepatitisb_profile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hepatitiscresult`
--
ALTER TABLE `hepatitiscresult`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `lhresult`
--
ALTER TABLE `lhresult`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

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
  MODIFY `KEY` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `manager_sample_descision`
--
ALTER TABLE `manager_sample_descision`
  MODIFY `sampleid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `newstock`
--
ALTER TABLE `newstock`
  MODIFY `stockid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `new_patients`
--
ALTER TABLE `new_patients`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `productordersid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `organizationaccountinformation`
--
ALTER TABLE `organizationaccountinformation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `organizationcontactperson`
--
ALTER TABLE `organizationcontactperson`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `organization_basic`
--
ALTER TABLE `organization_basic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pageaccess`
--
ALTER TABLE `pageaccess`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patientemmergencycontactinformation`
--
ALTER TABLE `patientemmergencycontactinformation`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `patientsaddress`
--
ALTER TABLE `patientsaddress`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `paymentmodes`
--
ALTER TABLE `paymentmodes`
  MODIFY `KeyID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

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
  MODIFY `LIVERID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `result_comments`
--
ALTER TABLE `result_comments`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `result_esr`
--
ALTER TABLE `result_esr`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_fasting_blood_sugar`
--
ALTER TABLE `result_fasting_blood_sugar`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_function_full_blood_count`
--
ALTER TABLE `result_function_full_blood_count`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_function_liver`
--
ALTER TABLE `result_function_liver`
  MODIFY `liverid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `result_function_renal`
--
ALTER TABLE `result_function_renal`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `result_haemoglobin_electrophoresis`
--
ALTER TABLE `result_haemoglobin_electrophoresis`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_helicobacter_pylori`
--
ALTER TABLE `result_helicobacter_pylori`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `result_lipid_profile`
--
ALTER TABLE `result_lipid_profile`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_pregnancy_test`
--
ALTER TABLE `result_pregnancy_test`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `result_random_blood_sugar`
--
ALTER TABLE `result_random_blood_sugar`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_thyroid_functional_test`
--
ALTER TABLE `result_thyroid_functional_test`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_widal`
--
ALTER TABLE `result_widal`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `EMPLOYEEID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `samplestatus`
--
ALTER TABLE `samplestatus`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `sampletype`
--
ALTER TABLE `sampletype`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `samplingtest`
--
ALTER TABLE `samplingtest`
  MODIFY `TestKey` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scientistpermission`
--
ALTER TABLE `scientistpermission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_general`
--
ALTER TABLE `setup_full_blood_count_test_general`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_male`
--
ALTER TABLE `setup_full_blood_count_test_male`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `setup_full_count_count_female`
--
ALTER TABLE `setup_full_count_count_female`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

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
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `setup_thyroid_test`
--
ALTER TABLE `setup_thyroid_test`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `test_ascension`
--
ALTER TABLE `test_ascension`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
