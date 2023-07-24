-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 23, 2023 at 10:43 AM
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
(2, 61, 1, 1, 1, 1, 1, 1, '{}', 1, 1, 1, 1, 1);

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
(31, 1686925426320, 260, 920, 0, 13, 15, 'PREPAID', 660),
(32, 1686843194665, 950, 960, 0, 13, 16, 'PREPAID', 10),
(33, 1686843194665, 0, 170, 0, 13, 15, 'PREPAID', 170),
(34, 1686843194665, 50, 50, 0, 13, 15, 'PREPAID', 0),
(35, 1686843194665, 1000, 1000, 0, 13, 15, 'PREPAID', 0),
(36, 1686843194665, 1000, 1000, 0, 13, 15, 'PREPAID', 0),
(37, 1686843194665, 0, 50, 0, 37, 18, 'PREPAID', 50),
(38, 1686925426320, 0, 100, 0, 37, 15, 'PREPAID', 100);

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
(1, 1, '2023-06-15 16:35:41.022171', 2, 160),
(2, 2, '2023-06-15 18:58:10.887866', 2, 60),
(3, 3, '2023-06-16 02:56:02.249374', 2, 80),
(4, 4, '2023-06-16 02:56:04.882520', 2, 80),
(5, 5, '2023-06-16 02:56:05.174267', 2, 80),
(6, 6, '2023-06-16 14:06:00.588267', 2, 200),
(7, 6, '2023-06-16 14:43:55.041010', 0, 10),
(8, 6, '2023-06-16 14:44:11.383599', 0, 20),
(9, 13, '2023-06-17 11:59:20.196756', 2, 30),
(10, 10, '2023-06-18 16:58:40.801208', 0, 140),
(11, 12, '2023-06-18 16:59:00.792693', 0, 210),
(12, 11, '2023-06-27 15:36:43.344367', 0, 30),
(13, 11, '2023-06-27 15:37:00.819443', 0, 20),
(14, 15, '2023-06-30 13:33:08.063914', 0, 15),
(15, 17, '2023-06-30 13:36:00.458805', 3, 40),
(16, 18, '2023-06-30 23:16:36.493574', 3, 50),
(17, 17, '2023-07-02 08:00:06.159754', 0, 130),
(18, 19, '2023-07-04 09:07:56.481653', 3, 22),
(19, 20, '2023-07-05 03:38:48.489739', 3, 50),
(20, 21, '2023-07-06 13:58:58.961087', 3, 100),
(21, 22, '2023-07-10 01:01:41.257444', 2, 200),
(22, 23, '2023-07-11 13:13:31.271644', 3, 50),
(23, 24, '2023-07-15 22:40:10.697718', 2, 29),
(24, 27, '2023-07-21 09:42:49.626394', 3, 20),
(25, 29, '2023-07-21 16:32:17.688887', 2, 140),
(26, 30, '2023-07-21 16:32:43.013015', 2, 100),
(27, 31, '2023-07-21 20:57:51.716472', 2, 260),
(28, 32, '2023-07-21 20:58:24.899549', 3, 950),
(29, 34, '2023-07-22 08:19:14.407344', 2, 50),
(30, 35, '2023-07-22 08:19:50.741370', 2, 1000),
(31, 36, '2023-07-22 08:19:51.041254', 2, 1000),
(32, 38, '2023-07-22 09:19:56.179929', 2, 0);

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
(4, 33, 'A', 'negative', '2023-05-18', '2023-05-18', '13:11:18.000000', 2147483647, 'Blood A+'),
(5, 31, 'B', 'negative', '2023-05-20', '2023-05-20', '15:28:45.000000', 2147483647, 'etugwuguiegui'),
(6, 35, 'B', 'negative', '2023-06-03', '2023-06-03', '13:05:59.000000', 2147483647, 'WEFJEUIFQWUIE'),
(7, 138, 'B', 'positive', '2023-06-04', '2023-06-04', '13:53:00.000000', 2147483647, 'NEGATIVE '),
(8, 137, 'B', 'positive', '2023-06-04', '2023-06-04', '15:36:14.000000', 2147483647, 'EJYUWEU'),
(9, 134, 'B', 'positive', '2023-06-04', '2023-06-04', '15:36:27.000000', 2147483647, 'KVJWEUWEU'),
(10, 150, 'AB', 'positive', '2023-06-13', '2023-06-13', '04:07:56.000000', 2147483647, 'giowiogiowgiowio'),
(11, 12, 'B', 'positive', '2023-06-17', '2023-06-17', '00:27:49.000000', 2147483647, 'RUIRUGU3RIGUI'),
(12, 14, 'A', 'negative', '2023-06-27', '2023-06-27', '15:22:41.000000', 2147483647, 'rgjhtyjt');

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `BRANCHID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`BRANCHID`, `NAME`, `DATE`) VALUES
(20, 'Tiifu Hamza', '2022-11-16');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `BRANCHID` int(20) NOT NULL,
  `BRANCHNAME` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `TIME` time(6) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(15, 'Tiifu hamza', 'hamzatiifu45@gmail.com', 'poeoepo', 'Kalpohin Lowcost 30A', 'nurse', 'cash', 241758550, 'Access BAANK', 'Tamale ', 2147483647, 'Tiifu Hamza', 0, '2023-06-27', '2023-06-27 16:01:50.867344', 595964565, 10),
(16, 'Tiifu Hamza company limited', 'hamzatiifu4557@gmail.com', 'Tamale', 'Kalpohin Lowcost 30A', 'nurse', 'cash', 241758550, 'Access Bank', 'Tamale', 2147483647, 'Tiifu Hamza', 0, '2023-06-27', '2023-06-27 16:15:16.707067', 595964565, 10),
(17, 'Tiifu hamza', 'hamzatiifu45props@gmail.com', 'Tamale', 'Kalpohin Lowcost 30A', 'pharmacist', 'cash', 241758550, 'Access Bank', 'Tamale', 2147483647, 'Tiifu Hamxsq', 0, '2023-07-02', '2023-07-02 22:38:35.094495', 595964565, 10),
(18, 'Direct', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, 0, '2023-07-22', '0000-00-00 00:00:00.000000', 0, NULL);

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

--
-- Dumping data for table `commodity`
--

INSERT INTO `commodity` (`COMID`, `COMMODITY`, `date`, `CATEGORY`, `suppliedby`) VALUES
(1, 'edta tubes', '0000-00-00 00:00:00.000000', '', NULL),
(2, 'edta tubes', '2023-03-11 17:37:51.702261', '', NULL),
(3, 'edta tubes plus', '2023-03-11 17:42:03.681855', '', NULL),
(4, 'jjjjjjjjj', '2023-03-11 20:32:29.748807', 'chemicals', NULL),
(5, 'kefjfjej', '2023-03-11 20:32:29.809564', 'equipment', NULL),
(6, 'FAILED TP TUN ANALYTICS', '2023-03-11 20:32:29.850118', 'chemicals', NULL),
(7, 'DMDMDM', '2023-03-11 20:32:29.900260', 'consumables', NULL),
(8, 'kkfkdkk', '2023-03-11 20:34:18.875745', 'reagents', NULL),
(9, 'kdkdkdk', '2023-03-11 20:34:18.961887', 'equipment', NULL),
(10, 'mdcmmfm', '2023-03-11 20:34:18.985949', 'consumables', NULL),
(11, 'dkfkkfk', '2023-03-11 20:53:08.531177', 'consumables', NULL),
(12, 'lfororo', '2023-03-11 20:53:08.575897', 'consumables', NULL),
(13, 'top ialed', '2023-03-11 20:53:40.781457', 'reagents', NULL),
(14, 'ilkjhbnmkiuhki', '2023-03-11 20:55:14.827546', 'reagents', NULL),
(15, 'bullish', '2023-03-11 21:01:17.081887', 'chemicals', NULL),
(16, 'lefover', '2023-03-11 21:40:46.115522', 'chemicals', NULL),
(17, 'mnwdkwdkw', '2023-03-11 21:40:46.193880', 'chemicals', NULL),
(18, 'Homicides', '2023-03-11 21:45:53.096893', 'equipment', NULL),
(19, 'non entity', '2023-03-11 21:45:53.155863', 'others', NULL),
(20, 'kkgkkf', '2023-03-12 02:55:04.109881', 'equipment', NULL),
(21, 'mdfwdgkek', '2023-03-12 02:55:04.156317', 'equipment', NULL),
(22, 'edta tuvevs', '2023-03-12 02:55:04.189157', 'consumables', NULL),
(23, 'johnson', '2023-03-14 07:12:40.370584', 'reagents', NULL),
(24, 'gell tubes', '2023-03-14 07:12:40.438580', 'consumables', NULL),
(25, 'dylazxer', '2023-03-14 07:27:49.078074', 'reagents', NULL),
(26, 'h384', '2023-03-14 07:27:49.133794', 'chemicals', NULL),
(27, 'uiwewjfwegh', '2023-03-16 14:32:11.525855', 'reagents', NULL),
(28, 'fwrgreger', '1995-06-10 23:00:00.000000', 'consumables', 'xlab songs'),
(29, 'splita', '2023-03-21 06:41:22.349299', 'chemicals', NULL),
(30, 'gloves', '2023-03-21 06:41:22.559686', 'consumables', NULL),
(31, 'Genesis', '2023-05-10 21:23:47.533518', 'chemicals', NULL),
(32, 'Television', '2023-05-10 21:23:47.585467', 'equipment', NULL),
(33, '', '2023-07-03 02:42:17.872492', 'chemicals', NULL),
(34, 'category', '2023-07-03 02:42:17.922937', 'equipment', NULL),
(35, 'glover', '2023-07-03 08:55:10.739107', 'equipment', NULL);

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
  `ALTERNATIVENUMBER` int(10) NOT NULL,
  `WEBSITE` varchar(50) DEFAULT NULL,
  `STREET` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companyprofile`
--

INSERT INTO `companyprofile` (`ID`, `NAME`, `EMAIL`, `MOTTO`, `PHONENUMBER`, `ADDRESS`, `ALTERNATIVENUMBER`, `WEBSITE`, `STREET`) VALUES
(1, 'Labhill diagnostics and ............', 'labhill@gmail.com', 'Health and Happiness', 595964565, 'Opposite SDA Gbanjil Road Hse No 19 ', 241758550, 'labhill.org', 'Jolly Friends');

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

--
-- Dumping data for table `customerrepresentativepermission`
--

INSERT INTO `customerrepresentativepermission` (`employeeid`, `deletev`, `editv`, `viewv`, `registerv`, `printv`, `activatev`, `keyid`, `pageAccess`) VALUES
(59, 1, 1, 1, 1, 1, 1, 9, '{\"registration\":false,\"inventory\":false,\"activation\":false,\"suppliers\":true,\"operations\":true,\"approvals\":true,\"settings\":false,\"payments\":true,\"billing\":false,\"phelobotomy\":false,\"samples\":false,\"organization\":true,\"clinician\":true,\"appointment\":true}');

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

--
-- Dumping data for table `departmentrequisitionhx`
--

INSERT INTO `departmentrequisitionhx` (`id`, `departmentid`, `stockid`, `quantity_requested`, `quantity_approved`, `comsumptionunit`, `status`, `date`, `requisitionid`, `issue_message`, `departmentReceived`, `store_supplied`, `quantityReceived`) VALUES
(99, 1035, 44, 5, 0, 'others', '', '2023-07-04', '115587fb-a674-4cf5-b1cd-4506006f52d1', NULL, 0, 0, 55),
(100, 1035, 45, 7, 0, 'others', '', '2023-07-04', '3926fa29-f597-47d5-866b-9c6e0600e30f', NULL, 0, 0, 444),
(101, 1035, 44, 7, 0, 'others', '', '2023-07-04', '5d1b9cd7-5a1a-4cfc-a94a-54ff71adaf0a', NULL, 0, 0, 55),
(102, 1035, 45, 7, 0, 'others', '', '2023-07-04', 'af1c8d58-37e7-4470-8f80-ce42a9130029', NULL, 0, 0, 7),
(103, 1035, 44, 7, 0, 'others', '', '2023-07-04', 'c133d8e0-34b5-4523-bfe7-cbed43f6b287', NULL, 0, 0, 5),
(104, 1035, 44, 4, 0, 'others', '', '2023-07-04', '8a9ec9b2-d8b8-42bd-a3d3-b217331d5142', NULL, 0, 0, 4),
(105, 1035, 45, 4, 0, 'others', '', '2023-07-04', 'd5c58b25-c070-49c0-87b9-d68ba9a8ca90', NULL, 0, 0, 4),
(106, 1035, 44, 5, 0, 'others', '', '2023-07-04', '01be1c9b-9ecd-4d01-b516-3c467d76fa8e', NULL, 0, 0, 444),
(107, 1035, 45, 8, 0, 'others', '', '2023-07-04', '923990d2-0c97-4c2a-a652-51971e8968e1', NULL, 0, 0, 500),
(108, 1035, 44, 8, 0, 'others', '', '2023-07-04', '1d3b8880-9838-4368-b319-78bb98c73b14', NULL, 0, 0, 555),
(109, 1035, 44, 4, 0, 'others', '', '2023-07-04', '7ed773e6-d2a9-4fe8-8602-0e8cb64cc9d3', NULL, 0, 0, 4000),
(110, 1035, 45, 7, 0, 'others', '', '2023-07-04', 'b529cb15-a0a5-42ff-a1f2-a585d6bde8d3', NULL, 0, 0, 46),
(111, 1035, 44, 4, 0, 'others', '', '2023-07-04', '94428dc3-aa2f-4e14-bc8d-e79fc4db81f2', NULL, 0, 0, 551),
(112, 1035, 45, 4, 0, 'others', '', '2023-07-04', '6e8a280e-22d9-497a-97ce-440c93c34565', NULL, 0, 0, 1),
(113, 1035, 44, 5, 0, 'others', '', '2023-07-04', 'ee263abc-c7cd-4a4d-8272-dddad1609b3b', NULL, 0, 0, 500),
(114, 1035, 45, 5, 0, 'others', '', '2023-07-04', 'a46e56b3-11b7-4a3d-953c-b62c9902d966', NULL, 0, 0, 5000),
(115, 1035, 44, 4, 0, 'others', '', '2023-07-04', '286e57f2-7766-46c3-b366-f4e3452867ce', NULL, 0, 0, 5000),
(116, 1035, 45, 5, 0, 'others', '', '2023-07-04', '5f46866e-de8c-47e7-aa88-58ff138f218c', NULL, 0, 0, 55555),
(117, 1035, 44, 5, 0, 'others', '', '2023-07-04', 'af032002-cf16-4046-b3f1-9bd9bfc88fd4', NULL, 0, 0, 500),
(118, 1035, 45, 5, 0, 'others', '', '2023-07-04', 'f94761c3-4426-4517-a7bf-ffe1bbda718d', NULL, 0, 0, 50000),
(119, 1035, 44, 4, 0, 'others', '', '2023-07-04', '346a2c5a-3ce1-49e0-83d1-d9452104bdf4', NULL, 0, 0, 40000),
(120, 1035, 44, 4, 0, 'others', '', '2023-07-04', '974dacf1-1d5c-4ee3-b1c3-d85a69669178', NULL, 0, 0, 3900),
(121, 1035, 44, 5, 0, 'others', '', '2023-07-04', 'd0facc28-92d7-420c-9902-b30e4aee621e', NULL, 0, 0, 5),
(122, 1035, 44, 4, 0, 'others', '', '2023-07-04', '7d3368c1-0f3f-44e8-b20a-527853a2b6b0', NULL, 0, 0, 55),
(123, 1035, 44, 4, 5, 'others', 'received', '2023-07-04', 'd6346499-a5e7-4d5b-a318-20fa71b1266f', NULL, 1, 1, 5),
(124, 1035, 45, 5, 4444, 'others', 'received', '2023-07-04', 'c75368dd-4aa4-4652-8b9a-2c403fd3d8d0', NULL, 1, 1, 4444),
(125, 1035, 44, 5, 30, 'others', 'received', '2023-07-04', '0bf620af-dbb7-4e7c-a2f7-0b7efc48eed7', NULL, 1, 1, 30),
(126, 1035, 45, 5, 50000, 'others', 'received', '2023-07-04', 'f5125430-3e7a-4d76-986f-1fa40d2f7539', NULL, 1, 1, 50000),
(127, 1035, 44, 5, 5, 'others', 'received', '2023-07-04', '016ee750-9acc-45f6-8e4f-361ba69c3405', NULL, 1, 1, 5),
(128, 1035, 45, 4, 420000, 'others', 'received', '2023-07-04', '49fab795-7f34-42fd-b394-f03eb0f8119c', NULL, 1, 1, 420000),
(129, 1035, 45, 5, 500000, 'others', 'received', '2023-07-04', '52ac152f-2219-4aef-8962-7e4edb33a905', NULL, 1, 1, 500000),
(130, 1035, 44, 5, NULL, 'others', 'pending', '2023-07-10', 'f928cc7c-114c-4b05-8470-d55428931211', NULL, 0, 0, 0);

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
(1031, 'Radiology', 'Tiifu Hamza', '2023-03-08 22:41:38.000000', 44),
(1033, 'Hematology', 'John Smith', '2023-04-04 17:23:46.573000', 3),
(1034, 'Radiology Fanmilk', 'John Doe', '2023-04-04 17:24:40.548000', 3),
(1035, 'xelob', 'Jane Doe', '2023-05-16 06:23:25.824000', 3);

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

--
-- Dumping data for table `departmentstocks`
--

INSERT INTO `departmentstocks` (`id`, `deptid`, `stockid`, `quantityAvailable`, `date_added`, `dateupdated`, `comsumptionunit`) VALUES
(53, 1035, 44, 40, '2023-07-04', '0000-00-00', 'others'),
(54, 1035, 45, 974444, '2023-07-04', '2023-07-05', 'others');

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

--
-- Dumping data for table `fshresult`
--

INSERT INTO `fshresult` (`keyid`, `parameter`, `billingid`, `patientid`, `value`, `dateadded_on`, `updated_on`, `comment`) VALUES
(1, 'fsh', 26, 1686925426320, 45555, '2023-07-20 00:08:47.803768', '2023-07-20 00:33:10.000000', 'potgierojergurgjweuigu'),
(2, 'fsh', 36, 1686843194665, 444, '2023-07-22 08:48:58.179863', '2023-07-23 07:43:02.000000', 'we;uif;iwdgwwej'),
(3, 'fsh', 35, 1686843194665, 65, '2023-07-22 08:54:34.929677', '0000-00-00 00:00:00.000000', 'efgrgre');

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

--
-- Dumping data for table `fshsetup`
--

INSERT INTO `fshsetup` (`setupid`, `upper`, `lower`, `unit`, `gender`, `parameter`) VALUES
(1, 50, 20, 'U/L', 'male', 'FSH'),
(2, 200, 20, 'U/L', 'female', 'FSH');

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

--
-- Dumping data for table `glycated_haemoglobin`
--

INSERT INTO `glycated_haemoglobin` (`ID`, `BILLINGID`, `PATIENTID`, `CREATED_ON`, `UPDATED_ON`, `RESULT`, `REMARKS`, `TECHNOLOGY`, `METHOD`, `GLUCOSE`, `TIME`) VALUES
(1, 14, 1681455467922, '2023-04-23 21:03:45.858730', '2023-04-23 21:03:45.858730', '', '', '', '', '', '21:05:13.000000');

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
('hbA', 'g/dL', 16, 12, 1, '2023-07-11 16:32:35.594676'),
('hbA2', 'g/dL', 16, 2, 2, '2023-07-11 16:32:35.594676'),
('hbF', 'g/dL', 3939, 55, 3, '2023-07-11 16:32:35.594676'),
('hbS', 'g/dL', 55, 55, 4, '2023-07-11 16:32:35.594676'),
('hbC', 'g/dL', 555, 555, 5, '2023-07-11 16:32:35.594676'),
('zii', 'mg', 555, 55, 6, '2023-07-11 16:32:35.594676');

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
(33, 6, 1686843194665, '2023-06-16', '21:41:08.000000', 'non reactive', 2, 'We gonna add more information '),
(35, 2, 1686843194665, '2023-06-16', '21:47:36.000000', 'non reactive', 2, 'kfgwlfe;fwe;'),
(36, 8, 1686843194665, '2023-06-17', '00:22:34.000000', 'reactive', 2, 'epofwfowio'),
(37, 9, 1686843194665, '2023-06-17', '00:22:48.000000', 'non reactive', 2, 'efp[efopqw');

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
(1, 'reactive', 'reactive', 'reactive', 'reactive', 'reactive', 'ejiufwdgjwefhweljkwd,vuwdifjkwefuweifopwe0g[epu9yof8uhvwdjlklfwfu9ishufjwdkui', 19, '2023-05-05', '2023-05-05', NULL, 1682823132672),
(2, 'non reactive', 'non reactive', 'non reactive', 'non reactive', 'non reactive', 'Good titres values', 23, '2023-05-05', NULL, NULL, 1683273020072),
(3, 'non reactive', 'non reactive', 'reactive', 'non reactive', 'reactive', 'Antiodies....', 33, '2023-05-18', '2023-07-23', NULL, 1681645338663),
(4, 'non reactive', 'reactive', 'reactive', 'non reactive', 'non reactive', 'jkfyuyuweyu', 38, '2023-06-03', NULL, NULL, 1683273020072),
(5, 'reactive', 'reactive', 'non reactive', 'non reactive', 'reactive', 'FIEUGYUEGYU', 138, '2023-06-04', NULL, NULL, 1685646002583),
(6, 'reactive', 'reactive', 'non reactive', 'non reactive', 'reactive', 'fioeguiuiruierui', 142, '2023-06-04', NULL, NULL, 1685646002583),
(7, 'non reactive', 'reactive', 'reactive', 'non reactive', 'non reactive', 'ejkfueu', 137, '2023-06-04', NULL, NULL, 1685646002583),
(8, 'reactive', 'reactive', 'non reactive', 'non reactive', 'non reactive', 'TDHTRJTR', 136, '2023-06-04', NULL, NULL, 1685646002583),
(9, 'non reactive', 'reactive', 'non reactive', 'non reactive', 'reactive', 'iorgioefouuergweiugweuweu', 147, '2023-06-07', NULL, NULL, 1685646002583),
(10, 'reactive', 'non reactive', 'reactive', 'non reactive', 'non reactive', 'efkjeiogioefgioegioweio', 145, '2023-06-11', NULL, NULL, 1685646002583),
(11, 'reactive', 'non reactive', 'reactive', 'reactive', 'non reactive', 'w\npf[okglwes,', 134, '2023-06-13', NULL, NULL, 1685646002583),
(12, 'non reactive', 'non reactive', 'reactive', 'reactive', 'non reactive', 'ifjqefuwetyuwehjvcxot7vuegwer7o8qwyeugdgr78yuqj\nieyuijklgeryog78t890oidkljgfe8oe9fiowdklgjgfwefop89weio\nroieguijekefgriogjkgeigoe\nrtgeduiefjkgefgerojk,', 2, '2023-06-16', NULL, NULL, 1686843194665),
(13, 'non reactive', 'non reactive', 'non reactive', 'non reactive', 'non reactive', 'fkgoegeogopdpoeo', 7, '2023-07-10', NULL, NULL, 1686843194665),
(14, 'reactive', 'reactive', 'reactive', 'non reactive', 'reactive', 'wekfiuuwefweuffyuqwyu', 31, '2023-07-22', NULL, NULL, 1686925426320);

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
(4, 3, 1686843194665, '2023-06-16', '21:39:15.000000', 'non reactive', 2, 'KJFHWEJGJKWDGJHWGJWDJH'),
(5, 5, 1686843194665, '2023-06-16', '21:40:20.000000', 'non reactive', 2, 'vjdiuivuiwuiuiwefuiwefuweui'),
(6, 4, 1686843194665, '2023-06-16', '21:42:17.000000', 'non reactive', 2, 'pegoegioweiogwio'),
(7, 16, 1686925426320, '2023-06-27', '15:25:17.000000', 'reactive', 2, 'ttrutrutrutututuh'),
(8, 32, 1686843194665, '2023-07-23', '08:13:19.000000', 'reactive', 2, 'gjejgejhwlgwejh');

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

--
-- Dumping data for table `lhresult`
--

INSERT INTO `lhresult` (`keyid`, `parameter`, `billingid`, `patientid`, `value`, `dateadded_on`, `updated_on`, `comment`) VALUES
(1, 'lh', 38, 1686925426320, 444, '2023-07-22 18:38:53.181038', '0000-00-00 00:00:00.000000', 'Hello world is  here to stay and recover things for use to continue all our information and props th'),
(2, 'lh', 37, 1686843194665, 11, '2023-07-22 18:40:21.928350', '0000-00-00 00:00:00.000000', 'Asylum seeking with the russians is a dangerous thing');

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
(1, 5000, 2000, 'U/L', 'male', 'LH'),
(2, 5000, 2000, 'U/L', 'female', 'LH');

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
(1, 1685646002583, 147, 'ovalex', 'rioo3rgi3rgiwriogio', 20, '2023-06-07 21:00:22.121898', NULL),
(2, 1685646002583, 142, 'vivax', 'juwdvjhkbjlvhjwdvjkcvjh', 30, '2023-06-15 15:55:20.404607', NULL),
(3, 1686843194665, 1, 'ovalex', 'wkfklgjkgjkwdjk', 200, '2023-06-15 16:37:54.986746', NULL),
(4, 1686843194665, 6, 'ovalex', 'lvkd;uijvwdgwdjfqweifioqwio', 200, '2023-06-16 21:14:15.745103', NULL),
(5, 1686843194665, 33, 'ovalex', 'Malaria positive', 30, '2023-07-23 08:31:36.328508', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `manager_sample_descision`
--

CREATE TABLE `manager_sample_descision` (
  `SAMPLEID` int(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `ACTION` varchar(255) NOT NULL,
  `MESSAGE` varchar(255) NOT NULL,
  `MANAGER` varchar(255) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6)
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

--
-- Dumping data for table `newstock`
--

INSERT INTO `newstock` (`stockid`, `name`, `category`, `consumptionunit`, `purchaseunit`, `quantity`, `alertlevel`, `materialcode`, `tax`, `date`) VALUES
(44, 'Edta Tubes', 39, 'others', 'g', 477, 55, '011', 0, '2023-07-04 12:19:49.388947'),
(45, 'Edta Tubes fine', 39, 'others', 'g', 58409935, 55, '011', 0, '2023-07-04 12:22:13.824447'),
(46, 'Calibration gell', 36, 'ml', 'ml', 499, 200, 'CCC0001', 1, '2023-07-06 14:26:37.102523');

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
  `LOCATION` varchar(100) DEFAULT NULL,
  `MARITAL_STATUS` varchar(50) NOT NULL,
  `EMMERGENCY_CONTACT` varchar(255) NOT NULL,
  `EMMERGENCY_CONTACT_NAME` varchar(255) NOT NULL,
  `RELATIONSHIP` varchar(50) NOT NULL,
  `MOBILE_NUMBER` int(13) NOT NULL,
  `AGETYPE` varchar(10) NOT NULL,
  `PATIENTORGANIZATION` varchar(255) NOT NULL,
  `OCCUPATION` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `ACTIVATION_STATUS` varchar(10) NOT NULL DEFAULT 'FALSE',
  `AREA` varchar(100) DEFAULT NULL,
  `REGION` varchar(255) DEFAULT NULL,
  `ADDRESS` varchar(255) DEFAULT NULL,
  `LASTNAME` varchar(255) NOT NULL,
  `MIDDLENAME` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `new_patients`
--

INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FIRSTNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `LOCATION`, `MARITAL_STATUS`, `EMMERGENCY_CONTACT`, `EMMERGENCY_CONTACT_NAME`, `RELATIONSHIP`, `MOBILE_NUMBER`, `AGETYPE`, `PATIENTORGANIZATION`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`, `AREA`, `REGION`, `ADDRESS`, `LASTNAME`, `MIDDLENAME`) VALUES
(1, 1686843194665, 'TIIFU ', 'hamzatiifu45@gmail.com', '1995-11-06', 27, 'male', NULL, 'married', '0241758550', 'TIIFU SHEFIK', 'BROTHER', 595964565, 'years', 'LEONIDES', 'NURSING', '2023-06-15', 'TRUE', 'TPOLY', 'NORTHERN', 'NS-LO4940', 'HAMZA ', 'BORONSON'),
(2, 1686925426320, 'Opoku', 'opoku@gmail.com', '1995-11-06', 27, 'male', NULL, 'married', '0241758550', 'Tiifu Hamza', 'Brother ', 595964565, 'years', 'Labhill diagnostic', 'Doctor', '2023-06-16', 'TRUE', 'Tamale', 'Northern region', 'Tamale', 'Agyemeng', NULL);

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

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`productordersid`, `stockid`, `name`, `tax`, `supplierid`, `suppliername`, `purchaseunit`, `date`, `quantity`, `received`, `quantityReceived`, `Batchnumber`, `balance`, `expirydate`, `receiveddate`, `status`, `price`, `totalamount`, `productused`) VALUES
(103, 44, 'Edta Tubes', 0, 78, 'xkills', 'litre', '2023-07-06 07:36:52.065573', 477, 'TRUE', 477, 'HHH', 0, '2023-07-10', '2023-07-05', 'received', 55555, 26499735, 'FALSE'),
(104, 45, 'Edta Tubes fine', 0, 74, 'King Kingo Joes supplies', 'litre', '2023-07-06 07:37:21.795557', 555, 'FALSE', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'FALSE'),
(105, 44, 'Edta Tubes', 0, 80, 'Tiifu Hamza company limited', 'g', '2023-07-10 11:25:00.788913', 555, 'FALSE', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'FALSE'),
(106, 45, 'Edta Tubes fine', 0, 80, 'Tiifu Hamza company limited', 'g', '2023-07-10 11:25:01.961698', 555, 'FALSE', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'FALSE'),
(107, 46, 'Calibration gell', 1, 80, 'Tiifu Hamza company limited', 'g', '2023-07-10 11:25:04.256525', 555, 'FALSE', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'FALSE');

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

--
-- Dumping data for table `organization`
--

INSERT INTO `organization` (`ID`, `NAME`, `LOCATION`, `STREETNAME`, `MOBILENUMBER`, `ADDRESS`, `WEBSITE`, `EMAIL`, `REGION`, `DISTRICT`, `GPSMAPPING`, `CONTACTPERSON`, `PAYMENTMODULE`, `COMMISSION`, `BANKNAME`, `BRANCH`, `ACCOUNTNAME`, `CONTACTEMAIL`, `ACCOUNTNUMBER`, `MOMO`, `CONTACTNUMBER`) VALUES
(13, 'Seventh Day Adventist Church', 'Sagnarigu', 'Jolly Friends', '595964565', 'Kalpohin lowcost 30A', 'sda.tamale.org', 'hamzatiifu45@gmail.com', 'Northern ', 'Tamale Metro', 'NS-3949-3939', 'dfthtrhtrurhtry', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'tiifuofficial@gmail.com', '52588968899898', 241758550, 5),
(14, 'Seventh Day Adventist Church', 'Sagnarigu', 'Jolly Friends', '595964565', 'Kalpohin lowcost 30A', 'sda.tamale.org', 'hamzatiifu45@gmail.com', 'Northern ', 'Tamale Metro', 'NS-3949-3939', 'dfthtrhtrurhtry', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'tiifuofficial@gmail.com', '52588968899898', 241758550, 5),
(15, 'leonides', 'Sanarigu', 'Kalpohin Lowcost 30A', '+23359594565', 'Kalpohin Lowcost 30A', 'sagnargu.org', 'hamzatiifu45@gmail.com', 'Northern region', 'Tamale Metro', 'NS-3484959-49994', 'Tiifu Hamza', 'cash', 10, 'Access Bank Ghana', 'Tamale', 'Tiifu Hamza', 'hamzatiifu45@gmail.com', '102529696566666', 595964565, 249434803),
(16, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '05', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 555, 5),
(17, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '05', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 555, 5),
(18, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '05', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 555, 5),
(19, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '0595964565', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 595964565, 595964565),
(20, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '0595964565', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 595964565, 595964565),
(21, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '0595964565', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 595964565, 595964565),
(22, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '0595964565', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 595964565, 595964565),
(23, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '0595964565', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 595964565, 595964565),
(24, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '0595964565', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 595964565, 595964565),
(25, 'leonides', 'sagnarigu', 'Kalpohin Lowcost 30A', '0595964565', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 595964565, 595964565),
(26, 'leonides company limited', 'sagnarigu', 'Kalpohin Lowcost 30A', '0595964565', 'Kalpohin Lowcost 30A', 'lefivvdhh', 'hamzatiifu45@gmail.com', 'jjfjfjjf', 'jfjfjfjj', 'jfjfjfj', 'djjfjfj', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jjfjfjfj', '859899788778', 595964565, 595964565),
(27, 'toxic', 'jfgjwgjk', 'jkefjkjkwdjk', '0595964565', 'fjvhwifweio', 'ioioerioerio', 'ioefioerioerio', 'ioriorio', 'ioefiorioer', 'oiriorio', 'oerioeri', '', 0, '', '', '', 'foerioioerioe', '', 0, 595964565),
(28, 'toxickkk', 'jfgjwgjk', 'jkefjkjkwdjk', '0595964565', 'fjvhwifweio', 'ioioerioerio', 'ioefioerioerio', 'ioriorio', 'ioefiorioer', 'oiriorio', 'oerioeri', '', 0, '', '', '', 'foerioioerioe', '', 0, 595964565),
(29, 'toxickkke', 'jfgjwgjk', 'jkefjkjkwdjk', '0595964565', 'fjvhwifweio', 'ioioerioerio', 'ioefioerioerio', 'ioriorio', 'ioefiorioer', 'oiriorio', 'oerioeri', '', 0, '', '', '', 'foerioioerioe', '', 0, 595964565),
(30, 'toxickkke4', 'jfgjwgjk', 'jkefjkjkwdjk', '0595964565', 'fjvhwifweio', 'ioioerioerio', 'ioefioerioerio', 'ioriorio', 'ioefiorioer', 'oiriorio', 'oerioeri', '', 0, '', '', '', 'foerioioerioe', '', 0, 595964565),
(31, 'toxickkke4lflldlwd', 'jfgjwgjk', 'jkefjkjkwdjk', '0595964565', 'fjvhwifweio', 'ioioerioerio', 'ioefioerioerio', 'ioriorio', 'ioefiorioer', 'oiriorio', 'oerioeri', '', 0, '', '', '', 'foerioioerioe', '', 0, 595964565),
(32, 'lenides', 'kiriofo', 'koefre', '0595964565', 'jhhdvjkwd', 'labhill.org', 'hhdjwdjhwdjh', 'jkdjkjkfjk', 'jklfjkfjkfj', 'jkefjkefjkj', 'jkdfjkfjk', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jkefjkefjk', '45556555555', 504545656, 249434803),
(33, 'lenides000', 'kiriofo', 'koefre', '0595964565', 'jhhdvjkwd', 'labhill.org', 'hhdjwdjhwdjh', 'jkdjkjkfjk', 'jklfjkfjkfj', 'jkefjkefjkj', 'jkdfjkfjk', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jkefjkefjk', '45556555555', 504545656, 249434803),
(34, 'lenides000444', 'kiriofo', 'koefre', '0595964565', 'jhhdvjkwd', 'labhill.org', 'hhdjwdjhwdjh', 'jkdjkjkfjk', 'jklfjkfjkfj', 'jkefjkefjkj', 'jkdfjkfjk', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jkefjkefjk', '45556555555', 504545656, 249434803),
(35, 'lenides000444444', 'kiriofo', 'koefre', '0595964565', 'jhhdvjkwd', 'labhill.org', 'hhdjwdjhwdjh', 'jkdjkjkfjk', 'jklfjkfjkfj', 'jkefjkefjkj', 'jkdfjkfjk', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jkefjkefjk', '45556555555', 504545656, 249434803),
(36, 'lenides000444sss444', 'kiriofo', 'koefre', '0595964565', 'jhhdvjkwd', 'labhill.org', 'hhdjwdjhwdjh', 'jkdjkjkfjk', 'jklfjkfjkfj', 'jkefjkefjkj', 'jkdfjkfjk', 'cash', 10, 'Access Bank', 'Tamale', 'Tiifu Hamza', 'jkefjkefjk', '45556555555', 504545656, 249434803),
(37, 'Direct', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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
(1, 'mobile money'),
(2, 'cash'),
(3, 'cheque'),
(4, 'Bank transfer');

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
  `INSPECTOR` int(25) DEFAULT NULL,
  `INSPECTION_TIME` datetime(6) DEFAULT NULL,
  `Phelobotomist` int(100) DEFAULT NULL,
  `MESSAGE` text DEFAULT NULL,
  `TIME` time(6) NOT NULL DEFAULT current_timestamp(),
  `PHELOBOTOMY_MESSAGE` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `performing_test`
--

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `INSPECTOR`, `INSPECTION_TIME`, `Phelobotomist`, `MESSAGE`, `TIME`, `PHELOBOTOMY_MESSAGE`) VALUES
(31, '1686925426320', '2023-07-21', 'emmergency', 31, 0, NULL, NULL, NULL, NULL, '20:57:51.000000', ''),
(32, '1686843194665', '2023-07-21', 'none', 32, 0, NULL, NULL, NULL, NULL, '20:58:24.000000', ''),
(33, '1686843194665', '2023-07-22', 'moderate', 33, 0, NULL, NULL, NULL, NULL, '06:51:59.000000', ''),
(34, '1686843194665', '2023-07-22', 'emmergency', 34, 0, NULL, NULL, NULL, NULL, '08:19:14.000000', ''),
(35, '1686843194665', '2023-07-22', 'none', 35, 0, NULL, NULL, NULL, NULL, '08:19:50.000000', ''),
(36, '1686843194665', '2023-07-22', 'none', 36, 0, NULL, NULL, NULL, NULL, '08:19:51.000000', ''),
(37, '1686843194665', '2023-07-22', 'none', 37, 0, NULL, NULL, NULL, NULL, '08:53:31.000000', ''),
(38, '1686925426320', '2023-07-22', 'none', 38, 0, NULL, NULL, NULL, NULL, '09:19:56.000000', '');

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

--
-- Dumping data for table `result_aids`
--

INSERT INTO `result_aids` (`keyid`, `reaction`, `created_on`, `updated_on`, `billingid`, `patientid`, `comments`) VALUES
(1, 'non reactive', '2023-05-08 22:56:44.415996', '2023-05-16 07:25:27.000000', 26, 1682823132672, 'This is my principle to have  '),
(2, 'non reactive', '2023-05-09 07:40:57.644799', '2023-05-18 08:05:04.000000', 27, 1681279794621, 'Reaction suggestive of No HIV/AIDS'),
(3, 'non reactive', '2023-05-27 14:09:22.388658', NULL, 37, 1681279794621, 'dklvied');

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

--
-- Dumping data for table `result_beta_hcg`
--

INSERT INTO `result_beta_hcg` (`KEYID`, `VALUE`, `BILLINGID`, `UNIT`, `CREATED_ON`, `UPDATED_ON`, `PATIENTID`, `COMMENTS`) VALUES
(2, '887799990900', 25, 'UL/ml', '2023-05-08 12:22:02.772927', NULL, 1683273020072, 'uifuwfguiwk'),
(3, '44400', 27, 'UL/ml', '2023-05-09 07:40:38.524890', NULL, 1681279794621, '13 weeks se');

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
(141, 'creatinine kinase (CK)', 150, 44, '2023-06-13 09:12:25.851452', '2023-06-13 10:38:00.000000', 1685646002583),
(142, 'aspartate transaminase(AST)', 150, 500, '2023-06-13 09:12:25.851452', '2023-06-13 10:38:00.000000', 1685646002583),
(143, 'lactate dehydrogenase (LDH)', 150, 645, '2023-06-13 09:12:25.851452', '2023-06-13 10:38:00.000000', 1685646002583),
(144, 'TTT', 150, 88044000, '2023-06-13 09:12:25.851452', '2023-06-13 10:38:00.000000', 1685646002583),
(145, 'creatinine kinase (CK)', 148, 9499, '2023-06-13 10:50:09.618241', '2023-06-13 10:50:09.618241', 1683273020072),
(146, 'aspartate transaminase(AST)', 148, 999, '2023-06-13 10:50:09.618241', '2023-06-13 10:50:09.618241', 1683273020072),
(147, 'lactate dehydrogenase (LDH)', 148, 999, '2023-06-13 10:50:09.618241', '2023-06-13 10:50:09.618241', 1683273020072),
(148, 'TTT', 148, 999, '2023-06-13 10:50:09.618241', '2023-06-13 10:50:09.618241', 1683273020072),
(149, 'creatinine kinase (CK)', 142, 444, '2023-06-13 11:33:42.698584', '2023-06-13 11:38:55.000000', 1685646002583),
(150, 'aspartate transaminase(AST)', 142, 444, '2023-06-13 11:33:42.698584', '2023-06-13 11:38:55.000000', 1685646002583),
(151, 'lactate dehydrogenase (LDH)', 142, 444, '2023-06-13 11:33:42.698584', '2023-06-13 11:38:55.000000', 1685646002583),
(152, 'TTT', 142, 4449, '2023-06-13 11:33:42.698584', '2023-06-13 11:38:56.000000', 1685646002583),
(153, 'creatinine kinase (CK)', 145, 555, '2023-06-13 11:39:17.310073', '2023-06-13 11:55:58.000000', 1685646002583),
(154, 'aspartate transaminase(AST)', 145, 55, '2023-06-13 11:39:17.310073', '2023-06-13 11:55:58.000000', 1685646002583),
(155, 'lactate dehydrogenase (LDH)', 145, 5, '2023-06-13 11:39:17.310073', '2023-06-13 11:55:58.000000', 1685646002583),
(156, 'TTT', 145, 5, '2023-06-13 11:39:17.310073', '2023-06-13 11:55:58.000000', 1685646002583),
(157, 'creatinine kinase (CK)', 141, 444, '2023-06-13 11:40:54.892317', '2023-06-13 11:40:54.892317', 1683273020072),
(158, 'aspartate transaminase(AST)', 141, 444, '2023-06-13 11:40:54.892317', '2023-06-13 11:40:54.892317', 1683273020072),
(159, 'lactate dehydrogenase (LDH)', 141, 44, '2023-06-13 11:40:54.892317', '2023-06-13 11:40:54.892317', 1683273020072),
(160, 'TTT', 141, 444, '2023-06-13 11:40:54.892317', '2023-06-13 11:40:54.892317', 1683273020072),
(161, 'creatinine kinase (CK)', 18, 78, '2023-07-10 00:19:38.106894', '2023-07-10 00:20:19.000000', 1686925426320),
(162, 'aspartate transaminase(AST)', 18, 787, '2023-07-10 00:19:38.106894', '2023-07-10 00:20:19.000000', 1686925426320),
(163, 'lactate dehydrogenase (LDH)', 18, 78, '2023-07-10 00:19:38.106894', '2023-07-10 00:20:19.000000', 1686925426320),
(164, 'TTT', 18, 78, '2023-07-10 00:19:38.106894', '2023-07-10 00:20:19.000000', 1686925426320),
(165, 'glover', 18, 78, '2023-07-10 00:19:38.106894', '2023-07-10 00:20:19.000000', 1686925426320),
(166, 'creatinine kinase (CK)', 16, 55, '2023-07-16 01:35:34.847388', '2023-07-16 01:35:34.847388', 1686925426320),
(167, 'aspartate transaminase(AST)', 16, 55, '2023-07-16 01:35:34.847388', '2023-07-16 01:35:34.847388', 1686925426320),
(168, 'lactate dehydrogenase (LDH)', 16, 55, '2023-07-16 01:35:34.847388', '2023-07-16 01:35:34.847388', 1686925426320);

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
(28, 10, 1, '555555555'),
(29, 22, 1, 'ofpoeprogpoerpoerpo'),
(30, 10, 6, 'We are here to stay and make a difference in the entire universe as we seek to forge a new friendship'),
(31, 4, 12, 'RUIRUGU3RIGUI'),
(32, 10, 12, 'uguieugweufpgywufj ffeufuiefjk2efi2ef'),
(33, 11, 12, '5'),
(34, 4, 14, 'rgjhtyjt'),
(35, 5, 18, 'kwe;giuyfjhftyqh'),
(36, 5, 16, '5ekjfyuhjqwedjyu'),
(37, 10, 31, 'wdklkwfklwkHero is a rant'),
(38, 12, 35, 'ioerioeriogweifuoweegifoweufgwefiuwefuiwe\n\neifieejekegwdutfrfftudgfdfdtyfwdyfwdvstyfiwdukfw\n\n\nprogramming is a class to be and hence we all should be part og it \n\n\n\nhwdjkwdkfgqsjks'),
(41, 12, 36, 'wdfksdkgwdkgwdwdjkwdv;wdjkwfjkfjkfj;ui'),
(42, 12, 32, 'helo world is a rant by devolopers'),
(43, 12, 35, 'wekje3gedj;uiwej'),
(44, 15, 31, 'elkfg;jedgkgjwjhwjhfwjhfjh');

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

--
-- Dumping data for table `result_esr`
--

INSERT INTO `result_esr` (`keyid`, `value`, `comments`, `billingid`, `patientid`, `created_on`, `updated_on`) VALUES
(2, 84884, 'Helllo world. iam here to stay and make a difference and leave a mark egore my departure time', 28, 1682823132672, '0000-00-00 00:00:00.000000', '2023-05-16 13:11:20.000000'),
(3, 34, 'KIOEIHPODOSFBKFIOBSOIdggiosigosifo', 31, 1682823132672, '2023-05-19 22:05:18.075888', NULL),
(4, 50, 'uuuuuuuuuuu9iuiyttuyuouyiiyyyiyiokljkujjjkjjuoil', 2, 1686843194665, '2023-06-15 18:59:40.136199', NULL);

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

--
-- Dumping data for table `result_fasting_blood_sugar`
--

INSERT INTO `result_fasting_blood_sugar` (`keyid`, `billingid`, `patientid`, `result`, `unit`, `created_on`, `updated_on`, `comments`) VALUES
(1, 30, 1682823132672, 4888, 'mmol/L', '2023-05-16 12:58:14.360199', '2023-05-18 07:50:51.000000', 'jhwdfhdjwdghjwdgjhwdjhdhj');

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

--
-- Dumping data for table `result_function_full_blood_count`
--

INSERT INTO `result_function_full_blood_count` (`KEYID`, `PARAMETER`, `BILLINGID`, `UNIT`, `CREATED_ON`, `UPDATED_ON`, `VALUE`, `PATIENTID`) VALUES
(1, 'heamoglobin', 1, 'g/dl', '2023-06-15 16:38:43.198301', '2023-06-15 16:38:43.198301', 2555, 1686843194665),
(2, 'Neutropenia', 1, 'mg.dl', '2023-06-15 16:38:43.198301', '2023-06-15 16:38:43.198301', 55, 1686843194665),
(3, 'Agbevia', 1, 'agbe', '2023-06-15 16:38:43.198301', '2023-06-15 16:38:43.198301', 5, 1686843194665),
(4, 'mENSTRUAL', 1, 'JEJ', '2023-06-15 16:38:43.198301', '2023-06-15 16:38:43.198301', 5, 1686843194665),
(5, 'Haemoglobin ', 1, 'mg/dl', '2023-06-15 16:38:43.198301', '2023-06-15 16:38:43.198301', 5555, 1686843194665),
(6, 'Hadiatu', 1, 'l/l', '2023-06-15 16:38:43.198301', '2023-06-15 16:38:43.198301', 55, 1686843194665),
(7, 'DR opoku agyemang', 1, 'head/body', '2023-06-15 16:38:43.198301', '2023-06-15 16:38:43.198301', 5555, 1686843194665);

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
(41, 'albumin', 27, 'mg/dl', '2023-05-09 13:19:10.280622', NULL, 44, 1681279794621),
(42, 'total protein', 27, 'mg/dl', '2023-05-09 13:19:10.280622', NULL, 4444, 1681279794621),
(43, 'alp', 27, 'mg/dl', '2023-05-09 13:19:10.280622', NULL, 4455, 1681279794621),
(44, 'ast', 27, 'mg/dl', '2023-05-09 13:19:10.280622', NULL, 4455, 1681279794621),
(45, 'alt', 27, 'mg/dl', '2023-05-09 13:19:10.280622', NULL, 4455, 1681279794621),
(46, 'bun', 27, 'mg/dl', '2023-05-09 13:19:10.280622', NULL, 44854, 1681279794621),
(47, 'creatinine', 27, 'mg/dl', '2023-05-09 13:19:10.280622', NULL, 4588, 1681279794621),
(48, 'ast---', 27, 'G/DL', '2023-05-09 13:19:10.280622', NULL, 8888, 1681279794621),
(49, 'albumin', 37, 'mg/dl', '2023-05-27 14:08:18.023459', NULL, 55, 1681279794621),
(50, 'total protein', 37, 'mg/dl', '2023-05-27 14:08:18.023459', NULL, 555, 1681279794621),
(51, 'alp', 37, 'mg/dl', '2023-05-27 14:08:18.023459', NULL, 555, 1681279794621),
(52, 'ast', 37, 'mg/dl', '2023-05-27 14:08:18.023459', NULL, 55, 1681279794621),
(53, 'alt', 37, 'mg/dl', '2023-05-27 14:08:18.023459', NULL, 5, 1681279794621),
(54, 'bun', 37, 'mg/dl', '2023-05-27 14:08:18.023459', NULL, 555, 1681279794621),
(55, 'creatinine', 37, 'mg/dl', '2023-05-27 14:08:18.023459', NULL, 555, 1681279794621),
(56, 'ast---', 37, 'G/DL', '2023-05-27 14:08:18.023459', NULL, 55, 1681279794621),
(57, 'albumin', 149, 'mg/dl', '2023-06-11 17:31:57.046795', NULL, 55, 1685646002583),
(58, 'total protein', 149, 'mg/dl', '2023-06-11 17:31:57.046795', NULL, 55, 1685646002583),
(59, 'alp', 149, 'mg/dl', '2023-06-11 17:31:57.046795', NULL, 57, 1685646002583),
(60, 'ast', 149, 'mg/dl', '2023-06-11 17:31:57.046795', NULL, 37, 1685646002583),
(61, 'alt', 149, 'mg/dl', '2023-06-11 17:31:57.046795', NULL, 468, 1685646002583),
(62, 'bun', 149, 'mg/dl', '2023-06-11 17:31:57.046795', NULL, 690, 1685646002583),
(63, 'creatinine', 149, 'mg/dl', '2023-06-11 17:31:57.046795', NULL, 79, 1685646002583),
(64, 'ast---', 149, 'G/DL', '2023-06-11 17:31:57.046795', NULL, 85, 1685646002583),
(65, 'albumin', 145, 'mg/dl', '2023-06-11 18:43:37.062553', NULL, 8002, 1685646002583),
(66, 'total protein', 145, 'mg/dl', '2023-06-11 18:43:37.062553', NULL, 596, 1685646002583),
(67, 'alp', 145, 'mg/dl', '2023-06-11 18:43:37.062553', NULL, 99, 1685646002583),
(68, 'ast', 145, 'mg/dl', '2023-06-11 18:43:37.062553', NULL, 999, 1685646002583),
(69, 'alt', 145, 'mg/dl', '2023-06-11 18:43:37.062553', NULL, 999, 1685646002583),
(70, 'bun', 145, 'mg/dl', '2023-06-11 18:43:37.062553', NULL, 299, 1685646002583),
(71, 'creatinine', 145, 'mg/dl', '2023-06-11 18:43:37.062553', NULL, 696, 1685646002583),
(72, 'ast---', 145, 'G/DL', '2023-06-11 18:43:37.062553', NULL, 8966, 1685646002583),
(73, 'albumin', 153, 'mg/dl', '2023-06-14 21:13:14.198905', NULL, 55, 1682823132672),
(74, 'total protein', 153, 'mg/dl', '2023-06-14 21:13:14.198905', NULL, 55, 1682823132672),
(75, 'alp', 153, 'mg/dl', '2023-06-14 21:13:14.198905', NULL, 5555, 1682823132672),
(76, 'ast', 153, 'mg/dl', '2023-06-14 21:13:14.198905', NULL, 55, 1682823132672),
(77, 'alt', 153, 'mg/dl', '2023-06-14 21:13:14.198905', NULL, 55, 1682823132672),
(78, 'bun', 153, 'mg/dl', '2023-06-14 21:13:14.198905', NULL, 5, 1682823132672),
(79, 'creatinine', 153, 'mg/dl', '2023-06-14 21:13:14.198905', NULL, 5, 1682823132672),
(80, 'ast---', 153, 'G/DL', '2023-06-14 21:13:14.198905', NULL, 5, 1682823132672),
(81, 'albumin', 1, 'mg/dl', '2023-06-15 16:38:27.427982', NULL, 55, 1686843194665),
(82, 'total protein', 1, 'mg/dl', '2023-06-15 16:38:27.427982', NULL, 5, 1686843194665),
(83, 'alp', 1, 'mg/dl', '2023-06-15 16:38:27.427982', NULL, 55, 1686843194665),
(84, 'ast', 1, 'mg/dl', '2023-06-15 16:38:27.427982', NULL, 5, 1686843194665),
(85, 'alt', 1, 'mg/dl', '2023-06-15 16:38:27.427982', NULL, 5, 1686843194665),
(86, 'bun', 1, 'mg/dl', '2023-06-15 16:38:27.427982', NULL, 55, 1686843194665),
(87, 'creatinine', 1, 'mg/dl', '2023-06-15 16:38:27.427982', NULL, 5, 1686843194665),
(88, 'ast---', 1, 'G/DL', '2023-06-15 16:38:27.427982', NULL, 5, 1686843194665),
(89, 'albumin', 6, 'mg/dl', '2023-06-16 21:11:27.250359', NULL, 455, 1686843194665),
(90, 'total protein', 6, 'mg/dl', '2023-06-16 21:11:27.250359', NULL, 55, 1686843194665),
(91, 'alp', 6, 'mg/dl', '2023-06-16 21:11:27.250359', NULL, 55, 1686843194665),
(92, 'ast', 6, 'mg/dl', '2023-06-16 21:11:27.250359', NULL, 566, 1686843194665),
(93, 'alt', 6, 'mg/dl', '2023-06-16 21:11:27.250359', NULL, 5565, 1686843194665),
(94, 'bun', 6, 'mg/dl', '2023-06-16 21:11:27.250359', NULL, 555, 1686843194665),
(95, 'creatinine', 6, 'mg/dl', '2023-06-16 21:11:27.250359', NULL, 555, 1686843194665),
(96, 'ast---', 6, 'G/DL', '2023-06-16 21:11:27.250359', NULL, 555, 1686843194665),
(97, 'albumin', 12, 'mg/dl', '2023-06-17 00:28:34.389663', NULL, 88, 1686843194665),
(98, 'total protein', 12, 'mg/dl', '2023-06-17 00:28:34.389663', NULL, 888, 1686843194665),
(99, 'alp', 12, 'mg/dl', '2023-06-17 00:28:34.389663', NULL, 888, 1686843194665),
(100, 'ast', 12, 'mg/dl', '2023-06-17 00:28:34.389663', NULL, 8868, 1686843194665),
(101, 'alt', 12, 'mg/dl', '2023-06-17 00:28:34.389663', NULL, 666, 1686843194665),
(102, 'bun', 12, 'mg/dl', '2023-06-17 00:28:34.389663', NULL, 66, 1686843194665),
(103, 'creatinine', 12, 'mg/dl', '2023-06-17 00:28:34.389663', NULL, 666, 1686843194665),
(104, 'ast---', 12, 'G/DL', '2023-06-17 00:28:34.389663', NULL, 666, 1686843194665),
(105, 'albumin', 31, 'mg/dl', '2023-07-22 08:46:33.613426', NULL, 55, 1686925426320),
(106, 'total protein', 31, 'mg/dl', '2023-07-22 08:46:33.613426', NULL, 55, 1686925426320),
(107, 'alp', 31, 'mg/dl', '2023-07-22 08:46:33.613426', NULL, 55, 1686925426320),
(108, 'ast', 31, 'mg/dl', '2023-07-22 08:46:33.613426', NULL, 5, 1686925426320),
(109, 'alt', 31, 'mg/dl', '2023-07-22 08:46:33.613426', NULL, 5, 1686925426320),
(110, 'bun', 31, 'mg/dl', '2023-07-22 08:46:33.613426', NULL, 55, 1686925426320),
(111, 'creatinine', 31, 'mg/dl', '2023-07-22 08:46:33.613426', NULL, 5, 1686925426320),
(112, 'ast---', 31, 'G/DL', '2023-07-22 08:46:33.613426', NULL, 5, 1686925426320);

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
(1, 'BUN', 152, 'mg/dl', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 444, 1685646002583),
(2, 'Creatinine', 152, 'mg/dl', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 44, 1685646002583),
(3, 'potasium', 152, 'mg/dl', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 8884, 1685646002583),
(4, 'sodium', 152, 'mg/dl', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 888, 1685646002583),
(5, 'chloride', 152, 'mg/dl', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 8, 1685646002583),
(6, 'bicarbonate', 152, 'mg/dl', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 8, 1685646002583),
(7, 'albumin', 152, 'mg/dl', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 88, 1685646002583),
(8, 'wdjedjdj', 152, 'jkjdj', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 8, 1685646002583),
(9, 'kdkkdjd', 152, 'ududu', '2023-06-14 14:05:09.083905', '2023-06-14 14:05:09.083905', 8, 1685646002583),
(10, 'BUN', 12, 'mg/dl', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 5555, 1686843194665),
(11, 'Creatinine', 12, 'mg/dl', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 55, 1686843194665),
(12, 'potasium', 12, 'mg/dl', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 5, 1686843194665),
(13, 'sodium', 12, 'mg/dl', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 5, 1686843194665),
(14, 'chloride', 12, 'mg/dl', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 55, 1686843194665),
(15, 'bicarbonate', 12, 'mg/dl', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 5, 1686843194665),
(16, 'albumin', 12, 'mg/dl', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 5, 1686843194665),
(17, 'wdjedjdj', 12, 'jkjdj', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 5, 1686843194665),
(18, 'kdkkdjd', 12, 'ududu', '2023-06-17 00:42:26.484573', '2023-06-17 00:42:26.484573', 5, 1686843194665);

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

--
-- Dumping data for table `result_haemoglobin_electrophoresis`
--

INSERT INTO `result_haemoglobin_electrophoresis` (`keyid`, `parameter`, `billingid`, `unit`, `created_on`, `updated_on`, `value`, `patientid`) VALUES
(1, 'hbA', 19, 'mg/dl', '0000-00-00 00:00:00.000000', NULL, 20, 78899999999);

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

--
-- Dumping data for table `result_lipid_profile`
--

INSERT INTO `result_lipid_profile` (`keyid`, `parameter`, `billingid`, `unit`, `created_on`, `updated_on`, `value`, `patientid`) VALUES
(19, 'CHOLESTEROL', 36, 'g/dl', '2023-07-23 07:55:28.179234', NULL, 55, 1686843194665),
(20, 'TRIGLYCERIDES', 36, 'mg/dl', '2023-07-23 07:55:28.179234', NULL, 555, 1686843194665),
(21, 'HDL', 36, 'mg/dl', '2023-07-23 07:55:28.179234', NULL, 55, 1686843194665),
(22, 'LDL', 36, 'mg/dl', '2023-07-23 07:55:28.179234', NULL, 55, 1686843194665),
(23, 'TOTAL CHOLESEROL', 36, 'mg/dl', '2023-07-23 07:55:28.179234', NULL, 55, 1686843194665),
(24, 'TG/HDL', 36, 'mg/dl', '2023-07-23 07:55:28.179234', NULL, 55, 1686843194665),
(25, 'CHOLESTEROL', 32, 'g/dl', '2023-07-23 08:13:04.297840', NULL, 444, 1686843194665),
(26, 'TRIGLYCERIDES', 32, 'mg/dl', '2023-07-23 08:13:04.297840', NULL, 444, 1686843194665),
(27, 'HDL', 32, 'mg/dl', '2023-07-23 08:13:04.297840', NULL, 444, 1686843194665),
(28, 'LDL', 32, 'mg/dl', '2023-07-23 08:13:04.297840', NULL, 44, 1686843194665),
(29, 'TOTAL CHOLESEROL', 32, 'mg/dl', '2023-07-23 08:13:04.297840', NULL, 44, 1686843194665),
(30, 'TG/HDL', 32, 'mg/dl', '2023-07-23 08:13:04.297840', NULL, 44, 1686843194665),
(31, 'CHOLESTEROL', 35, 'g/dl', '2023-07-23 08:20:26.529162', NULL, 44, 1686843194665),
(32, 'TRIGLYCERIDES', 35, 'mg/dl', '2023-07-23 08:20:26.529162', NULL, 444, 1686843194665),
(33, 'HDL', 35, 'mg/dl', '2023-07-23 08:20:26.529162', NULL, 444, 1686843194665),
(34, 'LDL', 35, 'mg/dl', '2023-07-23 08:20:26.529162', NULL, 44, 1686843194665),
(35, 'TOTAL CHOLESEROL', 35, 'mg/dl', '2023-07-23 08:20:26.529162', NULL, 44, 1686843194665),
(36, 'TG/HDL', 35, 'mg/dl', '2023-07-23 08:20:26.529162', NULL, 44, 1686843194665);

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
(3, 'Urine', 'negative', '2023-04-30 15:45:15.171584', '2023-04-30 15:45:15.171584', 'hghfhfhfh. Deteriorating', 1681455467922, 18, 14),
(4, 'Blood', 'negative', '2023-04-30 17:18:04.784863', '2023-04-30 17:18:04.784863', 'No pregnancy', 1682823132672, 19, 14),
(5, 'Urine', 'positive', '2023-05-09 07:40:07.338413', '2023-05-09 07:40:07.338413', 'Positive', 1681279794621, 27, 14),
(6, 'Urine', 'positive', '2023-05-18 13:13:16.177268', '2023-05-18 13:13:16.177268', 'pregnancy dey wai', 1681645338663, 32, 14),
(7, 'Urine', 'negative', '2023-06-13 04:09:08.409902', '2023-06-13 04:09:08.409902', 'etuieiugruigeruigerigefguiui', 1685646002583, 150, 14),
(8, 'Urine', 'positive', '2023-06-17 00:22:26.965811', '2023-06-17 00:22:26.965811', 'epfopfoqwfioqwfjqw;i', 1686843194665, 8, 14),
(9, 'Blood', 'positive', '2023-06-17 19:03:28.091373', '2023-06-17 19:03:28.091373', 'pfgwegpowegweigefodkjhrigowiegioefiwegioeoho[iefbioiogiergiodk', 1686843194665, 9, 14);

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

--
-- Dumping data for table `result_random_blood_sugar`
--

INSERT INTO `result_random_blood_sugar` (`keyid`, `billingid`, `patientid`, `result`, `unit`, `created_on`, `updated_on`, `comments`) VALUES
(2, 30, 1682823132672, 9838484, 'mmol/L', '2023-05-16 12:44:18.856790', '2023-05-17 13:57:49.000000', 'fwdguwfguweu');

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

--
-- Dumping data for table `result_thyroid_functional_test`
--

INSERT INTO `result_thyroid_functional_test` (`keyid`, `parameter`, `billingid`, `value`, `created_on`, `updated_on`, `patientid`, `unit`) VALUES
(108, 'TSH', 31, 54, '2023-07-23 08:49:11.794106', NULL, 1686925426320, 'pmol/L'),
(109, 'T4', 31, 555, '2023-07-23 08:49:11.794106', NULL, 1686925426320, 'pmol/L'),
(110, 'T3', 31, 555, '2023-07-23 08:49:11.794106', NULL, 1686925426320, 'pmol/L'),
(111, 'T5', 31, 555, '2023-07-23 08:49:11.794106', NULL, 1686925426320, 'mg/dl'),
(112, 'T6', 31, 555, '2023-07-23 08:49:11.794106', NULL, 1686925426320, 'mg/dl'),
(113, 'T9', 31, 55, '2023-07-23 08:49:11.794106', NULL, 1686925426320, 'mg/dl');

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
(1, '1/160', '1/160', '1/20', '1/160', 'Reaction is not suggestive of typhoid fever', '2023-05-06 09:48:17.865247', '2023-05-06 10:09:21.000000', 21, 1681309899938),
(2, '1/20', '1/80', '1/80', '1/80', 'fjdjjdjdj', '2023-05-27 14:07:42.725734', NULL, 37, 1681279794621),
(3, '1/20', '1/80', '1/20', '1/20', 'erjigieruierui', '2023-06-03 13:23:24.216850', NULL, 38, 1683273020072),
(4, '1/20', '1/80', '1/80', '1/80', 'eklfkegfkefgo', '2023-06-11 20:09:09.853892', NULL, 145, 1685646002583),
(5, '1/20', '1/80', '1/80', '1/80', 'ekgje3jgdkgwdjwdjk', '2023-06-16 02:57:28.619097', NULL, 5, 1686843194665),
(6, '1/20', '1/20', '1/80', '1/80', 'eklgeklgkekl', '2023-06-16 02:58:52.708861', NULL, 3, 1686843194665),
(7, '1/20', '1/80', '1/80', '1/80', 'ekfuuefuiefiowfiowdigvxuvd\niegigkdg3ugi3fwifguwegjfwef\njegioekfglew;pfgwe89ifkwdguiw\negio;jgkep\'oefvkwdfowdpfkwdlkl', '2023-06-16 02:59:29.079214', NULL, 4, 1686843194665),
(8, '1/20', '1/80', '1/80', '1/80', 'ugugieugufgiosbv89gorgwe89', '2023-06-17 19:01:42.722651', NULL, 13, 1686925426320),
(9, '1/20', '1/20', '1/20', '1/80', 'yutyutyutyutyututyuy', '2023-06-27 15:23:10.712342', NULL, 15, 1686925426320),
(10, '1/20', '1/20', '1/80', '1/80', 'juhfuwgyuw', '2023-07-10 10:32:30.794714', NULL, 7, 1686843194665);

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
(59, 'tiifu Hamza', 'customer service representative', '$2b$10$JE93GzBthoNqJY/18TEFN.idjpUD2zYSc8hDY24ZQZKcoaNjbXiOS', '2023-07-10', '10:52:35.000000', NULL, 0, 'hamzatiifu45@gmail.com'),
(60, 'mildred tiifu', 'scientist', '$2b$10$h//BwrdW9e0s4LsaGEyi9OAZJsncvTUghl73JhtNXXUi0rXCvX44G', '2023-07-10', '11:09:43.000000', NULL, 0, 'mildred55@gmail.com'),
(61, 'boronson', 'manager', '$2b$10$QhlYsT9dNxErY/IQ/oy/yOxDi6AyLj92MiLRLL7MYaxcnSNE4NRqS', '2023-07-15', '21:36:00.000000', NULL, 0, 'hamzatiifu455@gmail.com');

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
  `message` varchar(255) NOT NULL,
  `testid` int(50) NOT NULL,
  `billingid` int(50) NOT NULL,
  `approvalstatus` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='this keep a log of samples accepted or declined';

--
-- Dumping data for table `samplestatus`
--

INSERT INTO `samplestatus` (`keyid`, `date`, `message`, `testid`, `billingid`, `approvalstatus`) VALUES
(8, '2023-07-21 20:57:51.778903', '', 2, 31, 1),
(9, '2023-07-21 20:57:51.803165', 'undefined', 4, 31, 1),
(10, '2023-07-21 20:57:51.851461', '', 7, 31, 1),
(11, '2023-07-21 20:57:51.931194', '', 10, 31, 1),
(12, '2023-07-21 20:58:24.949597', '', 8, 32, 1),
(13, '2023-07-21 20:58:25.008228', '', 12, 32, 1),
(14, '2023-07-22 06:51:59.918498', '', 1, 33, 1),
(15, '2023-07-22 07:59:34.374935', '', 2, 33, 1),
(16, '2023-07-22 07:59:34.377814', '', 7, 33, 1),
(17, '2023-07-22 08:19:14.490277', '', 2, 34, 1),
(18, '2023-07-22 08:19:50.784145', '', 12, 35, 1),
(19, '2023-07-22 08:19:50.887729', '', 32, 35, 1),
(20, '2023-07-22 08:19:50.913156', '', 30, 35, 1),
(21, '2023-07-22 08:19:51.102058', '', 12, 36, 1),
(22, '2023-07-22 08:19:51.145710', '', 32, 36, 1),
(23, '2023-07-22 08:19:51.159357', '', 30, 36, 1),
(24, '2023-07-22 08:53:31.089498', '', 31, 37, 1),
(25, '2023-07-22 09:19:56.221469', '', 2, 38, 1),
(26, '2023-07-22 09:19:56.278038', '', 31, 38, 1),
(27, '2023-07-22 09:37:45.284304', '', 13, 31, 0),
(28, '2023-07-22 09:37:45.287405', '', 15, 31, 0);

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

--
-- Dumping data for table `scientistpermission`
--

INSERT INTO `scientistpermission` (`id`, `employeeid`, `deletev`, `editv`, `registerv`, `viewv`, `printv`, `activatev`, `pageAccess`, `viewresult`, `printresult`, `enterresult`, `editresult`, `deleteresult`) VALUES
(3, 60, 1, 1, 1, 1, 1, 1, '{\"registration\":false,\"inventory\":true,\"activation\":false,\"suppliers\":false,\"operations\":false,\"approvals\":false,\"settings\":false,\"payments\":false,\"billing\":false,\"phelobotomy\":false,\"samples\":false,\"organization\":false,\"clinician\":false,\"appointment\":false}', 1, 1, 1, 0, 1);

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

--
-- Dumping data for table `semenanalysis`
--

INSERT INTO `semenanalysis` (`keyid`, `spermcount`, `collectiontime`, `collectionDate`, `abstinence`, `quantity`, `colour`, `consistency`, `motility`, `motilityGrade`, `morphology`, `pusCells`, `rbcs`, `impression`, `billingid`, `liquefactionTime`, `ph`, `fructose`, `epithelialCells`, `patientid`, `updated_on`) VALUES
(2, '', '', '2023-07-16', 3, 4, 'white', 'light', 127, 'Grade II(non-progressive motility)', 'Normal', 'absent', 'absent', 'Normal semen analysis', 26, '30 mins', 7, 'Positive', 'present', 1686925426320, '2023-07-20 21:31:54.000000');

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
(1, 2, 88, 4, 'UL/ml'),
(2, 3, 450000, 5949400, 'UL/ml'),
(3, 4, 45000, 6049400, 'UL/ml'),
(4, 5, 45000, 6049400, 'UL/ml'),
(5, 6, 45000, 6049400, 'UL/ml'),
(6, 7, 45000, 6049400, 'UL/ml'),
(7, 8, 45000, 6049400, 'UL/ml'),
(8, 9, 49, 7000, 'UL/ml'),
(9, 10, 45000, 6049400, 'UL/ml'),
(10, 11, 45000, 6049400, 'UL/ml'),
(11, 12, 45000, 6049400, 'UL/ml'),
(12, 13, 45000, 6049400, 'UL/ml'),
(13, 14, 45000, 6049400, 'UL/ml'),
(14, 15, 45000, 6049400, 'UL/ml'),
(15, 16, 45000, 6049400, 'UL/ml');

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

--
-- Dumping data for table `setup_esr`
--

INSERT INTO `setup_esr` (`keyid`, `agelimit`, `upper`, `lower`, `created_on`, `gender`) VALUES
(1, 'under 50 years', 99820, 55, '2023-07-11 10:25:12.869987', 'male'),
(2, 'over 50 years', 99848, 999, '2023-07-11 10:25:12.869987', 'male'),
(3, 'under 50 years', 94949, 94949, '2023-07-11 10:25:12.869987', 'female'),
(4, 'over 50 years', 494949, 499, '2023-07-11 10:25:12.869987', 'female');

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

--
-- Dumping data for table `setup_fullcount_paramters`
--

INSERT INTO `setup_fullcount_paramters` (`ID`, `PARAMETER`, `UPPER`, `LOWER`, `UNIT`, `DATE`) VALUES
(3, 'heamoglobin', 17, 12, 'g/dl', '0000-00-00 00:00:00.000000'),
(4, 'Neutropenia', 200, 100, 'mg.dl', '0000-00-00 00:00:00.000000'),
(5, 'Agbevia', 400, 200, 'agbe', '0000-00-00 00:00:00.000000'),
(6, 'mENSTRUAL', 88, 66, 'JEJ', '0000-00-00 00:00:00.000000'),
(7, 'Haemoglobin ', 500, 20, 'mg/dl', '0000-00-00 00:00:00.000000'),
(8, 'Hadiatu', 600, 200, 'l/l', '0000-00-00 00:00:00.000000'),
(9, 'DR opoku agyemang', 200, 100, 'head/body', '0000-00-00 00:00:00.000000'),
(10, 'tiifu ', 200, 10, 'mg/dl', '0000-00-00 00:00:00.000000');

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

--
-- Dumping data for table `setup_full_blood_count_test_general`
--

INSERT INTO `setup_full_blood_count_test_general` (`FBCID`, `PARAMETER`, `UNIT`, `LOWER`, `UPPER`, `DATE`) VALUES
(262, 'heamoglobin', 'g/dl', 12, 17, '2023-06-14 16:26:42.247143'),
(263, 'Neutropenia', 'mg.dl', 100, 200, '2023-06-14 16:26:42.305587'),
(264, 'Agbevia', 'agbe', 200, 400, '2023-06-14 16:26:42.377132'),
(265, 'mENSTRUAL', 'JEJ', 66, 88, '2023-06-14 16:26:42.405616'),
(266, 'Haemoglobin ', 'mg/dl', 20, 500, '2023-06-14 16:26:42.430144'),
(267, 'Hadiatu', 'l/l', 200, 600, '2023-06-14 16:26:42.526313');

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
(517, 'heamoglobin', 'g/dl', 12, 17, '2023-07-12 05:15:59'),
(518, 'Neutropenia', 'mg.dl', 100, 200, '2023-07-12 05:15:59'),
(519, 'Agbevia', 'agbe', 200, 400, '2023-07-12 05:15:59'),
(520, 'mENSTRUAL', 'JEJ', 66, 88, '2023-07-12 05:15:59'),
(521, 'Haemoglobin ', 'mg/dl', 20, 500, '2023-07-12 05:15:59'),
(522, 'Hadiatu', 'l/l', 200, 600, '2023-07-12 05:15:59'),
(523, 'DR opoku agyemang', 'head/body', 100, 200, '2023-07-12 05:15:59'),
(524, 'tiifu ', 'mg/dl', 10, 200, '2023-07-12 05:15:59');

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

--
-- Dumping data for table `setup_full_count_count_female`
--

INSERT INTO `setup_full_count_count_female` (`PARAMETER`, `UNIT`, `UPPER`, `LOWER`, `DATE`, `keyid`) VALUES
('wbc', 'mg/dl', 30, 20, '2023-06-14 21:21:53.372904', 76),
('neutrophils', 'g/dl', 555, 555, '2023-06-14 21:21:53.405891', 77),
('eosinophils', 'mg/dl', 444, 444, '2023-06-14 21:21:53.481723', 78),
('basophils', 'mg/dl', 255, 5555, '2023-06-14 21:21:53.506463', 79),
('lymphocytes', 'mg/dl', 555, 555, '2023-06-14 21:21:53.532137', 80),
('monocytes', '555', 555, 555, '2023-06-14 21:21:53.556145', 81),
('mch', 'g/hj', 555, 55, '2023-06-14 21:21:53.581761', 82),
('mcv', 'g/hj', 555, 55, '2023-06-14 21:21:53.648285', 83),
('mchc', '5%', 455, 555, '2023-06-14 21:21:53.672423', 84),
('rdw-cv', '55', 555, 55, '2023-06-14 21:21:53.697937', 85),
('rdw-sd', '%', 555, 444, '2023-06-14 21:21:53.722533', 86);

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
(1, 'CHOLESTEROL', 600, 498, 'g/dl'),
(2, 'TRIGLYCERIDES', 60044, 498, 'mg/dl'),
(3, 'HDL', 600, 498, 'mg/dl'),
(4, 'LDL', 600000, 498, 'mg/dl'),
(5, 'TOTAL CHOLESEROL', 600, 498, 'mg/dl'),
(6, 'TG/HDL', 600, 105, 'mg/dl');

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
(1, 'albumin', 6050, 200, '2023-04-16 09:33:57.118486', 'mg/dl'),
(2, 'total protein', 300, 600, '2023-04-16 09:33:57.118486', 'mg/dl'),
(3, 'alp', 600, 600, '2023-04-16 09:33:57.118486', 'mg/dl'),
(4, 'ast', 600, 6000, '2023-04-16 09:33:57.118486', 'mg/dl'),
(5, 'alt', 600, 600, '2023-04-16 09:33:57.118486', 'mg/dl'),
(6, 'bun', 600, 600, '2023-04-16 09:33:57.118486', 'mg/dl'),
(7, 'creatinine', 5000, 600, '2023-04-16 09:33:57.118486', 'mg/dl'),
(8, 'ast---', 20, 10, '2023-04-16 09:33:57.118486', 'G/DL');

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
(7, 'albumin', 20, 50, 'mg/dl'),
(8, 'wdjedjdj', 555, 55, 'jkjdj'),
(9, 'kdkkdjd', 200, 10, 'ududu');

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
(1, 'TSH', 'pmol/L', 55500, 498),
(2, 'T4', 'pmol/L', 5555, 498),
(3, 'T3', 'pmol/L', 555, 498),
(4, 'T5', 'mg/dl', 400, 500),
(5, 'T6', 'mg/dl', 400, 500),
(6, 'T9', 'mg/dl', 400, 3002);

-- --------------------------------------------------------

--
-- Table structure for table `stockcategory`
--

CREATE TABLE `stockcategory` (
  `id` int(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stockcategory`
--

INSERT INTO `stockcategory` (`id`, `category`, `date`) VALUES
(40, 'mildred', '2023-07-02 22:15:27.809912'),
(41, 'consumables', '2023-07-04 12:22:57.115696'),
(42, 'physical asserts', '2023-07-06 14:26:56.143643'),
(43, 'chrinicles', '2023-07-23 07:11:02.685018');

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

--
-- Dumping data for table `stocktransactions`
--

INSERT INTO `stocktransactions` (`keyid`, `stockid`, `quantity`, `batchno`, `added_on`, `updated_on`, `purchaseunit`, `supplierid`) VALUES
(2, 44, 477, 'HHH', '2023-07-10 11:35:54.000000', NULL, 'litre', 78);

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

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`SUPPLIERID`, `NAME`, `COMMODITY`, `ADDRESS`, `DATE`, `PHONENUMBER`, `CONTACTPERSON`, `REGION`, `EMAIL`) VALUES
(74, 'King Kingo Joes supplies', 'FAILED TP TUN ANALYTICS', 'Adjacent Holly Cross Church', '2023-03-16 14:27:38.787490', 249443089, 'Tiifu Hamza Kojo Boronson', 'utrtrjtj', 'hamzatiifu45@gmail.com'),
(75, 'eftrutyjyt', 'Homicides', 'Adjacent Holly Cross Church', '2023-03-16 14:28:21.491987', 249443089, '756785566785', 'hfghfghfghfg', 'harund@gmail.com'),
(78, 'xkills', 'kkgkkf', 'kal', '2023-04-08 00:36:49.786103', 595964565, 'tiifu ', 'tamale', 'djdj@gm.com'),
(80, 'Tiifu Hamza company limited', 'glover', 'Kalpohin Lowcost 30A', '2023-07-03 08:58:48.684557', 595964565, 'Tiifu Hamza company limited', 'Northern ', 'hamzatiifu45@gmail.com'),
(81, 'Mildred', 'FAILED TP TUN ANALYTICS', 'tamale ntc adjacent sda hospital', '2023-07-03 11:28:05.483678', 595964565, 'Tiifu hamza', 'Northern ', 'hamzatiifu45@gmail.com');

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
  `ApprovedBy` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test_ascension`
--

INSERT INTO `test_ascension` (`id`, `testid`, `billingid`, `collection`, `processing`, `ready`, `processing_date`, `collection_date`, `ready_date`, `printedNumber`, `printedDate`, `ApprovalStatus`, `Scientist`, `ApprovedBy`) VALUES
(64, 2, 31, 'true', 'true', 'false', '2023-07-22 08:40:22.000000', '2023-07-21 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL),
(65, 4, 31, 'true', 'true', 'false', '2023-07-22 08:40:26.000000', '2023-07-21 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL),
(66, 7, 31, 'true', 'true', 'true', '2023-07-22 08:40:30.000000', '2023-07-21 00:00:00.000000', '2023-07-22 08:46:16.000000', NULL, NULL, 0, NULL, NULL),
(67, 10, 31, 'true', 'true', 'true', '2023-07-22 08:40:35.000000', '2023-07-21 00:00:00.000000', '2023-07-22 08:46:33.000000', NULL, NULL, 0, NULL, NULL),
(68, 8, 32, 'true', 'true', 'true', '2023-07-23 08:13:11.000000', '2023-07-21 00:00:00.000000', '2023-07-23 08:13:20.000000', NULL, NULL, 0, NULL, NULL),
(69, 12, 32, 'true', 'true', 'true', '2023-07-23 08:12:38.000000', '2023-07-22 00:00:00.000000', '2023-07-23 08:13:04.000000', NULL, NULL, 0, NULL, NULL),
(70, 1, 33, 'true', 'true', 'true', '2023-07-23 08:31:10.000000', '2023-07-22 00:00:00.000000', '2023-07-23 08:31:36.000000', NULL, NULL, 0, NULL, NULL),
(71, 2, 33, 'true', 'true', 'false', '2023-07-23 08:31:18.000000', '2023-07-22 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL),
(72, 7, 33, 'true', 'true', 'false', '2023-07-23 08:31:15.000000', '2023-07-22 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL),
(73, 2, 34, 'true', 'true', 'false', '2023-07-23 08:30:38.000000', '2023-07-22 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL),
(74, 12, 35, 'true', 'true', 'true', '2023-07-22 08:54:10.000000', '2023-07-22 00:00:00.000000', '2023-07-23 08:20:26.000000', NULL, NULL, 0, NULL, NULL),
(75, 32, 35, 'true', 'true', 'true', '2023-07-22 08:54:13.000000', '2023-07-22 00:00:00.000000', '2023-07-22 08:54:34.000000', NULL, NULL, 0, NULL, NULL),
(76, 30, 35, 'true', 'true', 'false', '2023-07-22 08:54:15.000000', '2023-07-22 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL),
(77, 12, 36, 'true', 'true', 'true', '2023-07-22 08:47:56.000000', '2023-07-22 00:00:00.000000', '2023-07-23 07:55:28.000000', NULL, NULL, 0, NULL, NULL),
(78, 32, 36, 'true', 'true', 'true', '2023-07-22 08:47:57.000000', '2023-07-22 00:00:00.000000', '2023-07-22 08:48:58.000000', NULL, NULL, 0, NULL, NULL),
(79, 30, 36, 'true', 'true', 'false', '2023-07-22 08:47:59.000000', '2023-07-22 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL),
(80, 31, 37, 'true', 'true', 'true', '2023-07-22 18:39:50.000000', '2023-07-22 00:00:00.000000', '2023-07-22 18:40:21.000000', NULL, NULL, 0, NULL, NULL),
(81, 2, 38, 'true', 'true', 'false', '2023-07-22 09:23:43.000000', '2023-07-22 00:00:00.000000', NULL, NULL, NULL, 0, NULL, NULL),
(82, 31, 38, 'true', 'true', 'true', '2023-07-22 09:23:45.000000', '2023-07-22 00:00:00.000000', '2023-07-22 18:38:53.000000', NULL, NULL, 0, NULL, NULL),
(83, 13, 31, 'true', 'true', 'true', '2023-07-23 08:32:46.000000', '2023-07-23 00:00:00.000000', '2023-07-23 09:07:21.000000', NULL, NULL, 0, NULL, NULL),
(84, 15, 31, 'true', 'true', 'true', '2023-07-23 08:32:47.000000', '2023-07-23 00:00:00.000000', '2023-07-23 08:49:11.000000', NULL, NULL, 0, NULL, NULL);

--
-- Triggers `test_ascension`
--
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

--
-- Dumping data for table `test_categories`
--

INSERT INTO `test_categories` (`ID`, `CATEGORY`, `DESCRIPTION`) VALUES
(2, 'chemistry', 'Next.js 13 was recently released, learn more and see the upgrade guide. Version 13 also introduces beta features like the app directory that works alongside the pages directory (stable) for incremental adoption. You can continue using pages in Next.js 13,'),
(4, 'Haematology', 'This next/image component uses browser native lazy loading, which may fallback to eager loading for older browsers before Safari 15.4. When using the blur-up placeholder, older browsers before Safari 12 will fallback to empty placeholder. When using style');

-- --------------------------------------------------------

--
-- Table structure for table `test_panels`
--

CREATE TABLE `test_panels` (
  `ID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `CATEGORY` varchar(255) NOT NULL,
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
(1, 'Malaria', 'chemistry', 20, '2023-04-12 05:54:35', 'urine', 'jwdfjwdjkwdjkfjkwejk', 'urine', 'mls', '5'),
(2, 'Glycated Heamoglobin', 'chemistry', 50, '2023-04-12 07:02:57', 'serum', 'test for blood sugar usage ', 'edta tube', 'mls', '4'),
(3, 'Widal', 'chemistry', 30, '2023-04-12 13:08:29', 'blood', 'For testing salmonella typhi infection\n', 'edta tube', 'mls', '3'),
(4, 'blood grouping', 'chemistry', 20, '2023-04-12 15:28:43', 'blood', 'null', 'edta tube', 'mls', '3'),
(5, 'cardiac enzymes', 'chemistry', 60, '2023-04-12 15:29:35', 'serum', 'analysis of cardiac enzymes', 'gell tube ', 'g/dl', '5'),
(6, 'Hepatitis B', 'Haematology', 60, '2023-04-13 07:06:15', 'blood', 'null', 'edta tube', 'mls', '3'),
(7, 'Hepatitis B Profile', 'chemistry', 100, '2023-04-13 07:20:25', 'serum', 'Test for all antigens related to viral hepatitis ', 'gell tube', 'mls', '5'),
(8, 'Hepatitis C', 'Haematology', 60, '2023-04-13 07:21:47', 'blood', 'Testing for Hepatitis C infection', 'edta tube', 'mls', '3'),
(10, 'liver function test', 'chemistry', 90, '2023-04-13 18:53:09', 'blood', 'nulll', 'gell tube', 'mls', '5'),
(11, 'renal function test', 'chemistry', 100, '2023-04-13 18:53:34', 'serum', 'null', 'gell tube', 'mls', '5'),
(12, 'Lipid profile', 'chemistry', 900, '2023-04-17 12:15:45', 'serum', 'efjwejfjwfjq', 'gell tube', 'mls', '4'),
(13, 'urinalysis', 'chemistry', 60, '2023-04-27 01:48:23', 'urine', 'Urine taking', 'urine', 'mls', '50'),
(14, 'Pregnancy test(Urine)', 'Haematology', 30, '2023-04-30 09:16:19', 'urine', 'Test for pregnancy antigen', 'urine', 'mls', '5'),
(15, 'Thyroid functional test', 'chemistry', 600, '2023-05-02 22:33:32', 'serum', 'Test for the functionality of the thyroid', 'gell tube', 'mg/dl', '5'),
(16, 'BetaHcg', 'chemistry', 600, '2023-05-07 12:21:11', 'blood', 'BetaHcg', 'edta tube', 'mls', '4'),
(17, 'aids', 'Haematology', 20, '2023-05-07 12:34:48', 'blood', 'testing for aids test', 'blood', 'mls', '4'),
(19, 'estimated sedimentation rate (ESR)', 'chemistry', 60, '2023-05-07 23:34:36', 'blood', 'uefueururu', 'gell tube', 'mls', '5'),
(20, 'fasting blood sugar', 'chemistry', 20, '2023-05-16 10:45:28', 'blood', 'testing for blood sugar in the body', 'edta tube', 'mg/dl', '3'),
(21, 'random blood sugar', 'chemistry', 20, '2023-05-16 10:46:09', 'blood', 'sugar testing ', 'gell tube ', 'mg/dl', '3'),
(22, 'full blood count', 'Haematology', 50, '2023-04-30 09:16:19', 'blood', 'Blood cell analysis', 'edta tube', 'mls', '4'),
(23, 'Haemoglobin electrophoresis', 'Chemistry', 200, '2023-07-10 00:51:56', 'Blood', 'Test for verifying sickling status', 'edta tube', 'mls', '5mls'),
(25, 'stool analysis', 'Microbiology', 29, '2023-07-15 22:39:21', 'stool', 'rjgje', 'stool container', 'g', '10g'),
(26, 'clotting and bleeding time', 'Hematology', 200, '2023-07-16 00:08:49', 'blood', 'jdjdjdj', 'edta tube', 'mls', '5'),
(27, 'helicobacter pylori', 'Microbiology', 50, '2023-07-17 10:08:56', 'blood', 'jgjwgjk', 'edta tube', 'mls', '5'),
(28, 'semen analysis', 'microbiology', 200, '2023-07-17 10:12:00', 'semen', 'eguirlkgwdjlguwjk,m', 'semen', 'mls', '5'),
(31, 'Luteinizing Hormone', 'chemistry', 50, '2023-07-17 10:20:19', 'blood', 'uhfjsdjvjk', 'gell tube', 'mls', '5'),
(32, 'Follicle Stimulating Hormone', 'chemistry', 50, '2023-07-17 10:20:46', 'blood', 'uhfjsdjvjk', 'gell tube', 'mls', '5');

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
-- Dumping data for table `urinalysisresult`
--

INSERT INTO `urinalysisresult` (`urinalysisKey`, `appearance`, `color`, `urobilinogen`, `ketones`, `bilirubin`, `nitrite`, `microalbumin`, `glucose`, `specific_gravity`, `ph`, `microscopy`, `billingid`, `remarks`, `patientid`, `blood`, `leukocytes`) VALUES
(7, 'Hazy', 'reddish brown', 'positive(+)', 'negative', 'positive(+)', 'positive(+)', 'positive(+)', 'positive(++)', 1.02, 24002, NULL, 15, 'Result is incremetally being added to the result', 1681279794621, 'yellpw', 'positive(++)'),
(8, 'Hazy', 'Amber', 'positive(+)', 'positive(+)', 'positive(+)', 'positive(+)', 'positive(+)', 'negative', 1.02, 22, NULL, 17, 'Blood visible in urine ', 1681645338663, 'yellpw', 'positive(+)'),
(9, 'straw', 'straw', 'positive(+)', 'positive(+)', 'positive(+)', 'positive(+)', 'positive(+)', 'trace', 1.05, 11, NULL, 16, 'fjkiuwdgjwdfvhwd', 1682823132672, 'yellpw', 'positive(+)'),
(10, 'Hazy', 'straw', 'negative', 'negative', 'trace', 'positive(+)', 'positive(+)', 'positive(+)', 1.05, 9, NULL, 32, '8djfjdfjkwufynmavsdhvdnvwdhvbdmfdqschjsvsdviuscjvkhdfgdufikwdjhvwdfgwduf', 1681645338663, 'yellpw', 'positive(+)'),
(11, 'Hazy', 'Amber', 'trace', 'positive(+)', 'positive(+)', 'positive(+)', 'trace', 'positive(+)', 1.05, 4848, NULL, 37, 'jvjdjdjj', 1681279794621, 'yellpw', 'trace'),
(12, 'Hazy', 'straw', 'positive(+)', 'trace', 'positive(+)', 'positive(+)', 'positive(+)', 'negative', 1.02, 14, NULL, 145, 'fjiguwguiwuigweuiguweguiwe', 1685646002583, 'yellpw', 'positive(+)'),
(13, 'straw', 'Light Amber', 'positive(+)', 'trace', 'positive(+)', 'positive(++)', 'positive(+)', 'trace', 1.05, 8, NULL, 150, 'giwgwuigwuiguiwguiwuguwiguwguweguweui', 1685646002583, 'yellpw', 'positive(++)'),
(14, 'Hazy', 'straw', 'trace', 'positive(+)', 'positive(+)', 'positive(+)', 'trace', 'negative', 1.05, 7, NULL, 6, 'We are here to stay and move out of our comfort zone and see things as it should', 1686843194665, 'yellpw', 'positive(+++)'),
(15, 'straw', 'Light Amber', 'negative', 'positive(+)', 'negative', 'trace', 'positive(+)', 'positive(+)', 1.05, 5, NULL, 31, 'vjhwdkjv,wdfgvqsthdrsfgnhcbsgf', 1686925426320, 'yellpw', 'trace');

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
-- Indexes for table `branches`
--
ALTER TABLE `branches`
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
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`SAMPLEID`);

--
-- Indexes for table `newstock`
--
ALTER TABLE `newstock`
  ADD PRIMARY KEY (`stockid`);

--
-- Indexes for table `new_patients`
--
ALTER TABLE `new_patients`
  ADD PRIMARY KEY (`ID`);

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
-- Indexes for table `pageaccess`
--
ALTER TABLE `pageaccess`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `paymentmodes`
--
ALTER TABLE `paymentmodes`
  ADD PRIMARY KEY (`KeyID`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `BILLINGID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `billinghx`
--
ALTER TABLE `billinghx`
  MODIFY `KeyID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `BRANCHID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `BRANCHID` int(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clinician`
--
ALTER TABLE `clinician`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `commodity`
--
ALTER TABLE `commodity`
  MODIFY `COMID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `companyprofile`
--
ALTER TABLE `companyprofile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customerrepresentativepermission`
--
ALTER TABLE `customerrepresentativepermission`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `departmentrequisitionhx`
--
ALTER TABLE `departmentrequisitionhx`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1036;

--
-- AUTO_INCREMENT for table `departmentstocks`
--
ALTER TABLE `departmentstocks`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `fshresult`
--
ALTER TABLE `fshresult`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `fshsetup`
--
ALTER TABLE `fshsetup`
  MODIFY `setupid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `glycated_haemoglobin`
--
ALTER TABLE `glycated_haemoglobin`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `haemoglobinelectrophoresis`
--
ALTER TABLE `haemoglobinelectrophoresis`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `hepatitisbresult`
--
ALTER TABLE `hepatitisbresult`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `hepatitisb_profile`
--
ALTER TABLE `hepatitisb_profile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `hepatitiscresult`
--
ALTER TABLE `hepatitiscresult`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `KEY` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `manager_sample_descision`
--
ALTER TABLE `manager_sample_descision`
  MODIFY `SAMPLEID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `newstock`
--
ALTER TABLE `newstock`
  MODIFY `stockid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `new_patients`
--
ALTER TABLE `new_patients`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `productordersid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `pageaccess`
--
ALTER TABLE `pageaccess`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paymentmodes`
--
ALTER TABLE `paymentmodes`
  MODIFY `KeyID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `result_aids`
--
ALTER TABLE `result_aids`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `result_beta_hcg`
--
ALTER TABLE `result_beta_hcg`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `result_cardiac_enzymes`
--
ALTER TABLE `result_cardiac_enzymes`
  MODIFY `LIVERID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;

--
-- AUTO_INCREMENT for table `result_comments`
--
ALTER TABLE `result_comments`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `result_esr`
--
ALTER TABLE `result_esr`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `result_fasting_blood_sugar`
--
ALTER TABLE `result_fasting_blood_sugar`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `result_function_full_blood_count`
--
ALTER TABLE `result_function_full_blood_count`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `result_function_liver`
--
ALTER TABLE `result_function_liver`
  MODIFY `liverid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `result_function_renal`
--
ALTER TABLE `result_function_renal`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `result_haemoglobin_electrophoresis`
--
ALTER TABLE `result_haemoglobin_electrophoresis`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `result_lipid_profile`
--
ALTER TABLE `result_lipid_profile`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `result_pregnancy_test`
--
ALTER TABLE `result_pregnancy_test`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `result_random_blood_sugar`
--
ALTER TABLE `result_random_blood_sugar`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `result_thyroid_functional_test`
--
ALTER TABLE `result_thyroid_functional_test`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `result_widal`
--
ALTER TABLE `result_widal`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `EMPLOYEEID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `samplestatus`
--
ALTER TABLE `samplestatus`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `samplingtest`
--
ALTER TABLE `samplingtest`
  MODIFY `TestKey` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scientistpermission`
--
ALTER TABLE `scientistpermission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `semenanalysis`
--
ALTER TABLE `semenanalysis`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `setup_fullcount_paramters`
--
ALTER TABLE `setup_fullcount_paramters`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_general`
--
ALTER TABLE `setup_full_blood_count_test_general`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=268;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_male`
--
ALTER TABLE `setup_full_blood_count_test_male`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=525;

--
-- AUTO_INCREMENT for table `setup_full_count_count_female`
--
ALTER TABLE `setup_full_count_count_female`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

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
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `setup_renal_function_test`
--
ALTER TABLE `setup_renal_function_test`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `setup_thyroid_test`
--
ALTER TABLE `setup_thyroid_test`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `stockcategory`
--
ALTER TABLE `stockcategory`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `stocktransactions`
--
ALTER TABLE `stocktransactions`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `SUPPLIERID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `test_ascension`
--
ALTER TABLE `test_ascension`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `test_categories`
--
ALTER TABLE `test_categories`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `test_panels`
--
ALTER TABLE `test_panels`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `typhoid_test`
--
ALTER TABLE `typhoid_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `urinalysisresult`
--
ALTER TABLE `urinalysisresult`
  MODIFY `urinalysisKey` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
