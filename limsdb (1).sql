-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 01, 2023 at 11:47 AM
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
(25, 1683273020072, 600, 110, 0, 1, 1, 'PREPAID', -490),
(26, 1682823132672, 110, 110, 0, 1, 1, 'PREPAID', 0),
(27, 1681279794621, 1400, 1380, 0, 1, 1, 'PREPAID', -20),
(28, 1682823132672, 170, 170, 0, 1, 1, 'PREPAID', 0),
(29, 1682823132672, 270, 270, 0, 1, 1, 'PREPAID', 0),
(30, 1682823132672, 1890, 1890, 0, 1, 1, 'PREPAID', 0),
(31, 1682823132672, 190, 210, 0, 1, 1, 'PREPAID', 20),
(32, 1681645338663, 200, 50, 0, 1, 1, 'PREPAID', -150),
(33, 1681645338663, 290, 50, 0, 1, 1, 'PREPAID', -240),
(34, 1681279794621, 150, 150, 0, 1, 1, 'PREPAID', 0),
(35, 1682868995486, 1090, 1090, 0, 1, 1, 'PREPAID', 0),
(36, 1682868995486, 20, 180, 0, 1, 1, 'PREPAID', 160),
(37, 1681279794621, 350, 330, 0, 1, 1, 'PREPAID', -20),
(38, 1683273020072, 180, 180, 0, 1, 1, 'PREPAID', 0),
(39, 1685211245245, 700, 890, 0, 1, 1, 'PREPAID', 190),
(40, 1685211245245, 70, 100, 0, 1, 1, 'PREPAID', 30),
(41, 1683273020072, 200, 200, 0, 1, 1, 'PREPAID', 0),
(42, 1683273020072, 170, 170, 0, 1, 1, 'PREPAID', 0);

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
(5, 31, 'B', 'negative', '2023-05-20', '2023-05-20', '15:28:45.000000', 2147483647, 'etugwuguiegui');

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
  `WEBSITE` varchar(100) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `CONTACT` int(50) NOT NULL,
  `LOCATION` varchar(100) NOT NULL,
  `ADDRESS` varchar(255) NOT NULL,
  `OCCUPATION` varchar(100) NOT NULL,
  `PAYMENT MODULE` varchar(100) NOT NULL,
  `MOMO NAME` varchar(100) DEFAULT NULL,
  `MOMO NUMBER` int(50) DEFAULT NULL,
  `BANK NAME` varchar(255) DEFAULT NULL,
  `BANK BRANCH` varchar(255) DEFAULT NULL,
  `ACCOUNT NUMBER` int(100) DEFAULT NULL,
  `ACCOUNT NAME` varchar(255) DEFAULT NULL,
  `ORGANIZATION` varchar(255) DEFAULT NULL,
  `ORGANIZATION POSITION` int(11) DEFAULT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `UPDATE_ON` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clinician`
--

INSERT INTO `clinician` (`ID`, `NAME`, `WEBSITE`, `EMAIL`, `CONTACT`, `LOCATION`, `ADDRESS`, `OCCUPATION`, `PAYMENT MODULE`, `MOMO NAME`, `MOMO NUMBER`, `BANK NAME`, `BANK BRANCH`, `ACCOUNT NUMBER`, `ACCOUNT NAME`, `ORGANIZATION`, `ORGANIZATION POSITION`, `DATE`, `UPDATE_ON`) VALUES
(1, 'Dr Paul Sinister', '', '', 0, '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-14', '2022-08-14');

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
(32, 'Television', '2023-05-10 21:23:47.585467', 'equipment', NULL);

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
  `ADDRESS` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companyprofile`
--

INSERT INTO `companyprofile` (`ID`, `NAME`, `EMAIL`, `MOTTO`, `PHONENUMBER`, `ADDRESS`) VALUES
(63, 'ethnosoft diagnostic xylophone', 'ethnosoftdiafnostic@gmail.com', 'United we stand divided we fall', 2147483647, 'kalpohin low cost 30AB');

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
(54, 1032, 29, 50, 50, 'g', 'received', '2023-03-27', 'adf51f5f-48df-4ff8-849a-08a66f9f3743', NULL, 1, 1, 50),
(55, 1032, 30, 50, 5, 'others', 'received', '2023-03-27', 'c4e0f426-195c-4bce-a065-759f2208574b', NULL, 1, 1, 5),
(56, 1032, 31, 50, 1, 'bottle', 'received', '2023-03-27', 'cf1dd04e-4bfa-4507-b94c-3fa0776c8521', NULL, 1, 1, 1),
(57, 1031, 38, 3, 2, 'pcs', 'received', '2023-03-27', '1bfd0872-1b41-47a7-aced-579bb25bfd1b', NULL, 1, 1, 2),
(58, 1031, 35, 60, 50, 'box', 'received', '2023-03-28', '62253d5a-deb0-4c37-bf8a-9ddf3f8ad583', NULL, 1, 1, 50),
(59, 1031, 33, 55, 10, 'box', 'received', '2023-03-28', '9e9bbffe-a2b5-4ef9-b20e-d1b56815d8ab', NULL, 1, 1, 10),
(60, 1031, 37, 2, 2, 'box', 'received', '2023-03-28', 'f43ec5e2-b91d-40f1-90c1-c574e5957bf4', NULL, 1, 1, 2),
(61, 1031, 31, 33, 33, 'bottle', 'received', '2023-03-28', 'ee82dedf-198c-4c9b-8da1-c07349338cd5', NULL, 1, 1, 33),
(62, 1032, 35, 60000, 60000, 'box', 'received', '2023-04-01', '95ea37cd-d666-4de1-b633-8f1118633776', NULL, 1, 1, 60000),
(63, 1034, 29, 50, 50, 'g', 'received', '2023-04-08', '9c4e79c0-e93e-409c-9930-ccc738eb0371', NULL, 1, 1, 50),
(64, 1034, 31, 60, 60, 'bottle', 'received', '2023-04-08', '70828db1-3e1e-4d25-a576-37fe8fc93c9e', NULL, 1, 1, 60),
(65, 1034, 35, 125, 125, 'box', 'received', '2023-04-08', '771a9bdb-2dcb-404b-b0ae-77da94f07dd2', NULL, 1, 1, 125),
(66, 1034, 29, 6, 4, 'g', 'received', '2023-04-08', 'c6b756cb-e4f6-4541-9f3a-39243a45e650', NULL, 1, 1, 4),
(67, 1034, 32, 50, 100, 'kg', 'received', '2023-04-08', 'cb0399ee-a720-437b-9aaf-ee48f4b4044c', NULL, 1, 1, 100),
(68, 1034, 33, 44, 44, 'box', 'received', '2023-04-08', 'b60cc226-eda2-4a93-8473-062e2b48331b', NULL, 1, 1, 44),
(69, 1034, 29, 60, 60, 'g', 'received', '2023-05-10', 'ed0e52a3-fb94-432d-bdb7-ad6d56a5a9dd', NULL, 1, 1, 60),
(70, 1034, 32, 57, 57, 'kg', 'received', '2023-05-10', '9e94fd28-493b-42bc-b7a4-31c9dff912fe', NULL, 1, 1, 57),
(71, 1034, 30, 78, 78, 'others', 'received', '2023-05-10', '79301ce0-5c8b-489e-8a82-d428892ca543', NULL, 1, 1, 78),
(72, 1035, 37, 477, 50, 'box', 'received', '2023-05-28', '54aac05d-fa1f-427b-aa1f-e2ba4a8aae41', NULL, 1, 1, 50),
(73, 1035, 38, 4995, 1, 'pcs', 'received', '2023-05-28', '1146b599-c553-43c9-b0fe-ab53678772de', NULL, 1, 1, 1),
(74, 1031, 29, 57, NULL, 'g', 'pending', '2023-05-28', '96e16ee1-2b3f-47c2-8f32-14637999cf29', NULL, 0, 0, 0),
(75, 1031, 39, 549, NULL, 'l', 'pending', '2023-05-28', '96933c47-d0e3-4fa8-908a-be02b2a327b1', NULL, 0, 0, 0);

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
(13, 1032, 32, 330, '2023-03-26', '2023-03-26', 'kg'),
(14, 1031, 37, 62, '2023-03-26', '2023-04-02', 'box'),
(16, 1032, 30, 5, '2023-03-27', NULL, 'others'),
(17, 1031, 38, 2, '2023-03-27', NULL, 'pcs'),
(20, 1031, 33, 10, '2023-03-28', NULL, 'box'),
(24, 1034, 35, 125, '2023-04-08', NULL, 'box'),
(25, 1034, 33, 44, '2023-04-08', NULL, 'box'),
(26, 1034, 32, 157, '2023-04-27', '2023-05-10', 'kg'),
(27, 1034, 29, 60, '2023-05-10', NULL, 'g'),
(28, 1034, 30, 78, '2023-05-10', NULL, 'others'),
(29, 1035, 37, 50, '2023-05-28', NULL, 'box'),
(30, 1035, 38, 1, '2023-05-28', NULL, 'pcs');

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
(23, 12, 1681645338663, '2023-04-19', '11:33:29.000000', 'reactive', 2, 'Non reactive for client. Kindly use stool fo test if symptoms and signs persist'),
(24, 7, 1681281119724, '2023-04-19', '17:42:01.000000', 'reactive', 2, 'Hepatitis B positive. Kindly seek help'),
(25, 14, 1681455467922, '2023-04-23', '09:41:20.000000', 'reactive', 2, 'Negative'),
(26, 12, 1681645338663, '2023-04-23', '13:40:01.000000', 'reactive', 2, 'Non reactive for client. Kindly use stool fo test if symptoms and signs persist'),
(27, 12, 1681645338663, '2023-04-23', '13:40:13.000000', 'reactive', 2, 'Non reactive for client. Kindly use stool fo test if symptoms and signs persist'),
(28, 12, 1681645338663, '2023-04-23', '13:40:48.000000', 'reactive', 2, 'Non reactive for client. Kindly use stool fo test if symptoms and signs persist'),
(29, 12, 1681645338663, '2023-04-23', '13:42:09.000000', 'reactive', 2, 'Non reactive for client. Kindly use stool fo test if symptoms and signs persist'),
(30, 11, 1681281247577, '2023-04-23', '20:13:29.000000', 'non reactive', 2, 'Negative');

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
(3, 'reactive', 'reactive', 'non reactive', 'non reactive', 'non reactive', 'Antiodies....', 33, '2023-05-18', NULL, NULL, 1681645338663);

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
(1, 1682823132672, 19, 'vivax', 'plasmodium vivax observed', 56000, '0000-00-00 00:00:00.000000', '2023-05-04 23:51:11.000000'),
(2, 1683273020072, 23, 'Falciparum', 'Malaria', 60, '2023-05-05 08:55:22.018161', NULL),
(3, 1682823132672, 31, 'Falciparum', 'uiuyuuuy', 444, '2023-05-19 22:04:44.655377', NULL);

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

--
-- Dumping data for table `manager_sample_descision`
--

INSERT INTO `manager_sample_descision` (`SAMPLEID`, `BILLINGID`, `ACTION`, `MESSAGE`, `MANAGER`, `DATE`) VALUES
(1, 97, 'declined', 'Even though samle has coagulated, it does not intefer with qualtity of result for malaria', 'Dr Ohene Ketoku', '2023-03-07 09:09:04.865147'),
(2, 94, 'declined', 'leflgleglergkrgkwek;heefk;eflgklgwkl', 'Dr Ohene Ketoku', '2023-03-07 09:15:27.674393'),
(4, 93, 'declined', 'kwdkwdkwdkvkwdvksdkvkdvkasvkdjvsdosdvsdjvsdio;bsdfj;iosdksd;jksdkj', 'Dr Ohene Ketoku', '2023-03-07 09:41:05.998538'),
(10, 97, 'decline', 'Even though samle has coagulated, it does not intefer with qualtity of result for malaria', 'Dr Ohene Ketoku', '2023-03-07 09:59:41.464281'),
(11, 89, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-07 10:21:23.963309'),
(12, 89, 'further examination', 'uhafjkjwdawdgnwdjgkds,fjm', 'Dr Ohene Ketoku', '2023-03-07 10:21:31.303967'),
(13, 96, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-07 10:27:37.964974'),
(14, 87, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:03:29.501495'),
(15, 87, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:03:30.949867'),
(16, 87, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:03:33.344248'),
(17, 87, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:03:34.248436'),
(18, 87, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:03:37.465264'),
(19, 87, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:03:38.515077'),
(20, 87, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:03:39.773278'),
(21, 87, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:03:40.552161'),
(22, 90, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 05:05:09.375209'),
(23, 92, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 06:44:00.152988'),
(24, 92, 'further examination', 'kawrwwekogwekofgoewfogweiogeiowfio', 'Dr Ohene Ketoku', '2023-03-08 06:44:07.165417'),
(25, 92, 'further examination', 'kawrwwekogwekofgoewfogweiogeiowfio', 'Dr Ohene Ketoku', '2023-03-08 06:44:10.471503'),
(26, 78, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 06:44:55.609011'),
(27, 91, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-08 08:17:38.076847'),
(28, 98, 'further examination', 'coagulated  booad sample are best for heamological test. kidly assess blood again', 'Dr Ohene Ketoku', '2023-03-09 17:56:52.992906'),
(29, 98, 'further examination', 'coagulated  booad sample are best for heamological test. kidly assess blood again', 'Dr Ohene Ketoku', '2023-03-09 17:56:54.354387'),
(30, 98, 'further examination', 'coagulated  booad sample are best for heamological test. kidly assess blood again', 'Dr Ohene Ketoku', '2023-03-09 17:56:55.984865'),
(31, 98, 'further examination', 'coagulated  booad sample are best for heamological test. kidly assess blood again', 'Dr Ohene Ketoku', '2023-03-09 17:56:58.876245'),
(32, 98, 'further examination', 'coagulated  booad sample are best for heamological test. kidly assess blood again', 'Dr Ohene Ketoku', '2023-03-09 17:57:59.243454'),
(33, 93, 'further examination', 'kwdkwdkwdkvkwdvksdkvkdvkasvkdjvsdosdvsdjvsdio;bsdfj;iosdksd;jksdkj', 'Dr Ohene Ketoku', '2023-03-09 18:56:02.188241'),
(34, 99, 'further examination', '', 'Dr Ohene Ketoku', '2023-03-14 20:05:09.622049'),
(35, 100, 'further examination', 'kldkklxfbklfvkl', 'Dr Ohene Ketoku', '2023-03-14 20:10:58.129301'),
(36, 99, 'further examination', 'kklklafjkdkdgkkkdfkeffjkdfkdfjjkklvsfuigsflgjk.msfn,db jkcl n.dvm,', 'Dr Ohene Ketoku', '2023-03-14 20:11:36.142811'),
(37, 99, 'further examination', 'ksvklklsdfgklefgkl', 'Dr Ohene Ketoku', '2023-03-14 20:11:51.042341'),
(38, 99, 'further examination', '/jklcucjuasicu', 'Dr Ohene Ketoku', '2023-03-14 20:11:59.313679');

-- --------------------------------------------------------

--
-- Table structure for table `newstock`
--

CREATE TABLE `newstock` (
  `stockid` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
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
(29, 'props is coming', 'real estate', 'g', 'g', 7131, 44, '4444', 44, '2023-03-17 21:23:35.204000'),
(30, 'Telescope', 'equipment', 'others', 'others', 6060138, 200, 'kjefjdj', 1, '2023-03-18 07:40:24.577000'),
(32, 'jenifer diary', 'vehicles', 'kg', 'l', 2182, 20, 'klfgk', 5, '2023-03-19 10:30:54.173384'),
(33, 'drinking cups', 'consumables', 'box', 'box', 546455, 55, 'kjfj', 1, '2023-03-19 10:32:13.941000'),
(35, 'pippete tubes', 'consumables', 'box', 'box', 1086379, 55, 'kjfj', 1, '2023-03-19 10:32:13.941000'),
(36, 'telesco', 'equipment', 'others', 'others', 6054444, 200, 'kjefjdj', 1, '2023-03-18 07:40:24.577628'),
(37, 'Gloves', 'consumables', 'box', 'box', 5888, 100, 'glov003', 1, '2023-03-26 11:07:38.428935'),
(38, 'Ultrasound glossy paper', 'consumables', 'pcs', 'pcs', 2, 2, 'glossy56', 2, '2023-03-27 01:30:08.247751'),
(39, 'Mildred Bag', 'real estate', 'l', 'g', 600, 200, 'Mil495', 1, '2023-04-27 18:32:58.719135'),
(40, 'Tiifu Hamza Kojo', 'real estate', 'kg', 'pcs', 500, 100, 'DJVJD', 0, '2023-05-10 21:09:21.283636');

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
(7, 1681279794621, 'Agbevia', 'agbevia@gmail.com', '1111-11-11', 911, 'male', NULL, 'married', 'Agbevia Glover Effam', '02525285888', 'Sister', 2147483647, 'years', 'Labhill Diagnostics', 'Med Lab Scientist', '2023-04-12', 'TRUE', 'Kalariga', 'Northern ', 'NS-8499-9499', 'Glover ', 'Kwesi'),
(8, 1681281119724, 'tiifu ', 'hamzatiifu45@gmail.com', '1995-06-06', 27, 'male', NULL, 'married', '0241758550', 'tiifu shefik', 'brother', 595964565, 'years', 'Kadima Enterprice', 'Network engineer', '2023-04-12', 'FALSE', 'kalpohin lowcost ', 'Northern', 'Jollies Friends', 'hamza', 'boronson'),
(9, 1681281247577, 'Tiifu ', 'jhefjefjkefjjkefjkef', '1111-06-06', 911, 'male', NULL, 'married', '88989898', 'iefiefefi', 'jiddvjduj', 58988988, 'years', 'jkeuuh', 'uiefefj', '2023-04-12', 'FALSE', 'Kalariga', 'Northern Region', 'wjhwfw', 'Shefik', 'Kwaku'),
(10, 1681309899938, 'don ', 'zxla@gmai.von', '1114-01-01', 909, 'male', NULL, 'married', '0241758550', 'tiifu ', 'cousin', 252555555, 'years', 'kadimart', 'Teller', '2023-04-12', 'FALSE', 'kalariga', 'Northern region', 'NS-49494-449949', 'kassy ', 'raj'),
(11, 1681455467922, 'tiifu ', 'shefiktiifu@gmakl.com', '1995-11-06', 27, 'other', NULL, 'married', 'tiifu shefik', '0595964566', 'brother ', 241758550, 'years', 'leonides', 'nurisnf', '2023-04-14', 'TRUE', 'Kalpohin ', 'Northern ', 'NS039440', 'boronson', 'kojo'),
(12, 1681645338663, 'tiifu ', 'hamzatiifgu45@gmail.com', '1995-06-06', 27, 'male', NULL, 'married', 'tiifu shefik', '0241758550', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2023-04-16', 'TRUE', 'Tamale ', 'Northern reggion', 'NS-43838-348', 'hamza', 'kojo'),
(13, 1682823132672, 'Tiifu ', 'mildred45@gmail.com', '1993-03-03', 29, 'female', NULL, 'single', '0595964565', 'Tiifu Hamza', 'Wife', 543085842, 'years', 'Leonides', 'Nursing', '2023-04-30', 'FALSE', 'Tamale', 'Northern ', 'NS-484849', 'Mildred', 'Awineyila'),
(14, 1682868995486, 'Tiifu ', 'hamzatiifu45@gmail.com', '1995-11-06', 27, 'female', NULL, 'single', '0241758550', 'Tiifu shefik', 'Brother ', 595964565, 'years', 'Leonides', 'Nursing', '2023-04-30', 'TRUE', 'Tamale ', 'Northern region', 'NS-384599', 'Hamza', 'x'),
(15, 1683273020072, 'Wakpenjo', 'huzaifa@gmail.com', '1986-11-06', 36, 'male', NULL, 'single', '+233595964565', 'Tiifu Hamza Kojo', 'self', 200000000, 'years', 'leonides', 'Nursing', '2023-05-05', 'TRUE', 'Tamsle ', 'Northern', 'NS-47483388', 'Huzaifa', 'Hamza'),
(16, 1685211245245, 'John ', 'duakuah@gmail.com', '1992-11-06', 30, 'male', NULL, 'married', '0595959533', 'Mr johnson Duah', 'Husband', 241758550, 'years', 'Leonides', 'Nursing', '2023-05-27', 'TRUE', 'Kalpohin', 'Northern region ', 'NS-3495-294', 'Akua ', 'Duah');

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
(8, 11, 'edta tubes', 1, 67, 'jkwdfjkwjk', 'pcs', '2023-03-12 18:43:56.345079', 6000, 'TRUE', NULL, NULL, 0, NULL, NULL, NULL, 0, NULL, 'true'),
(15, 10, 'tiifu hamza', 0, 65, 'koawrgkejkg', 'l', '2023-03-15 03:26:41.274038', 444, 'TRUE', 444, '555', 0, '0005-05-05', '0005-05-05', 'received', 555, 246420, 'true'),
(16, 11, 'edta tubes', 0, 73, 'fvhhdvjhdfj', 'pcs', '2023-03-16 06:48:22.890553', 4444, 'TRUE', 4444, '45555', 0, '2023-03-16', '2023-03-16', 'received', 555, 2466420, 'false'),
(17, 12, 'water', 0, 65, 'koawrgkejkg', 'bottle', '2023-03-16 06:48:30.926311', 455745, 'TRUE', 455745, '55555', 0, '2023-03-16', '2023-03-16', 'received', 5258, 0, 'false'),
(18, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 07:58:22.990562', 555, 'TRUE', 555, '444', 0, '2023-03-10', '2023-03-02', 'received', 555, 246420, 'false'),
(19, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 08:03:12.048247', 600, 'TRUE', 600, '555', 0, '2023-03-16', '2023-03-16', 'received', 555, 333000, 'false'),
(20, 11, 'edta tubes', 0, 73, 'fvhhdvjhdfj', 'pcs', '2023-03-16 08:03:15.795995', 5255, 'TRUE', 5255, '555', 0, '2023-03-16', '2023-03-16', 'received', 555, 2916525, 'false'),
(21, 12, 'water', 0, 73, 'fvhhdvjhdfj', 'bottle', '2023-03-16 08:03:18.826490', 5655, 'TRUE', 5655, '555', 0, '2023-03-16', '2023-03-16', 'received', 5596, 31645380, 'false'),
(22, 13, 'gell tubes', 0, 73, 'fvhhdvjhdfj', 'kit', '2023-03-16 08:03:21.761529', 555, 'TRUE', 555, '555', 0, '2023-03-16', '2023-03-16', 'received', 55555, 30833025, 'false'),
(23, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 08:22:33.448613', 5000, 'TRUE', NULL, '655', 0, '2023-03-16', '2023-03-16', 'received', 0, 0, 'false'),
(24, 11, 'edta tubes', 0, 73, 'fvhhdvjhdfj', 'pcs', '2023-03-16 08:22:34.271494', 5545, 'TRUE', NULL, '6666', 0, '2023-03-16', '2023-03-16', 'received', 666, 3692970, 'false'),
(25, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 09:03:11.402552', 58989, 'TRUE', NULL, '555', 0, '2023-03-16', '2023-03-16', 'received', 500, 0, 'false'),
(26, 11, 'edta tubes', 0, 65, 'koawrgkejkg', 'pcs', '2023-03-16 09:03:12.325114', 888, 'TRUE', NULL, '555', 0, '2023-03-16', '2023-03-16', 'received', 3000, 2664000, 'false'),
(27, 12, 'water', 0, 65, 'koawrgkejkg', 'bottle', '2023-03-16 09:22:12.451349', 5545, 'TRUE', NULL, '6555', 0, '2023-03-16', '2023-03-16', 'received', 66666, 369662970, 'false'),
(28, 11, 'edta tubes', 0, 73, 'fvhhdvjhdfj', 'pcs', '2023-03-16 09:28:24.930054', 5222, 'TRUE', NULL, '555', 0, '2023-03-16', '2023-03-16', 'received', 444444, 2147483647, 'false'),
(29, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 09:42:37.814119', 44444, 'TRUE', NULL, '555', 0, '2023-03-16', '2023-03-16', 'received', 2147483647, 2147483647, 'false'),
(30, 11, 'edta tubes', 0, 65, 'koawrgkejkg', 'pcs', '2023-03-16 09:42:39.548664', 5555, 'TRUE', NULL, '555', 0, '2023-03-16', '2023-03-24', 'received', 2200, 12221000, 'false'),
(31, 12, 'water', 0, 73, 'fvhhdvjhdfj', 'bottle', '2023-03-16 09:42:41.262360', 555, 'TRUE', NULL, '5555', 0, '2023-03-16', '2023-03-16', 'received', 555555, 308333025, 'false'),
(32, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 09:49:10.692297', 40, 'TRUE', 40, '6555', 0, '2023-03-16', '2023-03-16', 'received', 10, 400, 'false'),
(33, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 09:52:00.335999', 566, 'TRUE', 566, '555', 0, '2023-03-16', '2023-03-16', 'received', 555, 0, 'false'),
(34, 12, 'water', 0, 65, 'koawrgkejkg', 'bottle', '2023-03-16 09:52:01.537279', 5655, 'TRUE', 5555, '555', 100, '2023-03-16', '2023-03-16', 'incomplete', 5555, 0, 'false'),
(35, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 11:38:13.400569', 6000, 'TRUE', 5000, '555', 1000, '2023-03-16', '2023-03-16', 'incomplete', 1000, 5000000, 'false'),
(36, 11, 'edta tubes', 0, 65, 'koawrgkejkg', 'pcs', '2023-03-16 11:38:14.649886', 500, 'TRUE', 500, '5255', 0, '2023-03-16', '2023-03-16', 'received', 200, 100000, 'false'),
(37, 10, 'tiifu hamza', 0, 73, 'fvhhdvjhdfj', 'l', '2023-03-16 12:11:51.035934', 7666, 'TRUE', 4, '4655656', 7662, '2023-03-16', '2023-03-16', 'incomplete', 44545454, 178181816, 'false'),
(38, 10, 'tiifu hamza', 0, 65, 'koawrgkejkg', 'l', '2023-03-16 12:36:11.149680', 12224, 'TRUE', 1252, '222', 10972, '2025-10-15', '2023-03-16', 'incomplete', 44, 55088, 'false'),
(39, 11, 'edta tubes', 0, 73, 'bron suplliers', 'pcs', '2023-03-16 12:39:00.592640', 5555, 'TRUE', 555, '5555', 5000, '2023-03-16', '2023-03-16', 'incomplete', 12, 6660, 'false'),
(40, 10, 'tiifu hamza', 0, 73, 'bron suplliers', 'l', '2023-03-16 12:39:02.121081', 555, 'TRUE', 555, '602', 0, '2023-03-16', '2023-03-16', 'received', 16, 8880, 'false'),
(41, 10, 'tiifu hamza', 0, 73, 'bron suplliers', 'l', '2023-03-16 13:11:30.835796', 558858, 'TRUE', 558858, '55656', 0, '2023-03-16', '2023-03-16', 'received', 20, 11177160, 'false'),
(42, 13, 'gell tubes', 0, 75, 'eftrutyjyt', 'kit', '2023-03-16 14:33:18.936840', 9200, 'TRUE', 555, '6666', 8645, '2023-03-16', '2023-03-16', 'incomplete', 255, 141525, 'false'),
(43, 10, 'tiifu hamza', 0, 75, 'eftrutyjyt', 'l', '2023-03-16 14:33:20.546987', 9200, 'TRUE', 6000, '666', 3200, '2023-03-16', '2023-03-16', 'incomplete', 333, 1998000, 'false'),
(44, 11, 'edta tubes', 0, 75, 'eftrutyjyt', 'pcs', '2023-03-16 14:33:21.892366', 9200, 'TRUE', 88, '96969', 9112, '2023-03-16', '2023-03-16', 'incomplete', 555, 0, 'false'),
(45, 12, 'water', 0, 75, 'eftrutyjyt', 'bottle', '2023-03-16 14:33:22.789684', 9200, 'TRUE', 9054, '6666', 146, '2023-03-16', '2023-03-16', 'incomplete', 6969, 63097326, 'false'),
(46, 10, 'tiifu hamza', 0, 75, 'eftrutyjyt', 'l', '2023-03-17 00:52:12.305185', 50, 'TRUE', 5, '555', 45, '2023-03-17', '2023-03-17', 'incomplete', 60, 300, 'false'),
(47, 14, 'checkmate', 0, 75, 'eftrutyjyt', 'pcs', '2023-03-17 18:56:06.086062', 5000, 'TRUE', 5000, '500', 0, '2023-03-14', '2023-03-17', 'received', 10, 50000, 'FALSE'),
(48, 14, 'checkmate', 0, 75, 'eftrutyjyt', 'pcs', '2023-03-17 20:33:08.467520', 500, 'TRUE', 500, '555', 0, '2023-03-17', '2023-03-17', 'received', 20, 10000, 'FALSE'),
(49, 20, 'bulbs', 0, 74, '5y4u69o9p-98', 'pcs', '2023-03-17 20:33:09.776639', 555, 'TRUE', 555, '444', 0, '2023-03-16', '2023-03-17', 'received', 50, 0, 'FALSE'),
(50, 17, 'door mat', 0, 74, '5y4u69o9p-98', 'pcs', '2023-03-17 20:33:10.474104', 5555, 'TRUE', 80, '444', 5475, '2023-03-15', '2023-03-17', 'incomplete', 55, 4400, 'FALSE'),
(51, 23, 'johnson', 0, 74, '5y4u69o9p-98', 'kg', '2023-03-17 20:33:11.618157', 555, 'TRUE', 555, '555', 0, '2023-03-14', '2023-03-17', 'received', 555, 308025, 'FALSE'),
(52, 21, 'boexed', 0, 74, '5y4u69o9p-98', 'pcs', '2023-03-17 20:33:12.452635', 666, 'TRUE', 600, '5555', 66, '2023-03-10', '2023-03-17', 'incomplete', 66, 39600, 'FALSE'),
(53, 30, 'telescope', 0, 75, 'eftrutyjyt', 'others', '2023-03-18 07:41:12.822778', 54444, 'TRUE', 5005, '555', 49439, '2023-03-13', '2023-03-18', 'incomplete', 120, 600600, 'FALSE'),
(54, 25, 'props plus', 0, 75, 'eftrutyjyt', 'g', '2023-03-18 09:58:37.609816', 50, 'TRUE', 50, '55', 0, '2023-03-15', '2023-03-18', 'received', 25, 1250, 'FALSE'),
(55, 29, 'props plus plush xnx', 0, 75, 'eftrutyjyt', 'g', '2023-03-18 10:00:10.415116', 588, 'TRUE', 60, '55', 528, '2023-03-03', '2023-03-18', 'incomplete', 22, 1320, 'FALSE'),
(56, 31, 'camnbuts', 0, 74, '5y4u69o9p-98', 'bottle', '2023-03-19 10:29:44.357486', 4444, 'TRUE', 555, '555', 3889, '2023-03-19', '2023-03-19', 'incomplete', 555, 308025, 'FALSE'),
(57, 33, 'lgfkfkf', 0, 75, 'eftrutyjyt', 'box', '2023-03-19 10:32:50.572363', 500, 'TRUE', 500, '55', 0, '2026-05-13', '2023-03-19', 'received', 10, 5000, 'FALSE'),
(58, 32, 'jenifer diary', 0, 75, 'eftrutyjyt', 'l', '2023-03-19 10:32:52.146699', 500, 'TRUE', 500, '55', 0, '2025-09-09', '2023-03-19', 'received', 20, 10000, 'FALSE'),
(59, 25, 'propanol', 0, 75, 'eftrutyjyt', 'g', '2023-03-20 18:02:43.982369', 5555, 'TRUE', 5000, '555', 555, '2023-02-27', '2023-03-20', 'incomplete', 525, 2625000, 'FALSE'),
(60, 25, 'propanol', 0, 74, 'King Kingo Joes supplies', 'g', '2023-03-20 18:18:29.589670', 50, 'TRUE', 50, '5578', 0, '2023-03-13', '2023-03-20', 'received', 10, 500, 'FALSE'),
(61, 25, 'propanol', 0, 76, 'tobblers', 'g', '2023-03-21 06:39:47.194114', 20, 'TRUE', 20, '555', 0, '2023-03-07', '2023-03-21', 'received', 555, 11100, 'FALSE'),
(62, 33, 'drinking cups', 0, 76, 'tobblers', 'box', '2023-03-21 10:25:47.400132', 60, 'TRUE', 60, '588', 0, '2023-03-07', '2023-03-21', 'received', 555, 33300, 'FALSE'),
(63, 32, 'jenifer diary', 0, 76, 'tobblers', 'l', '2023-03-21 10:26:06.410345', 444, 'TRUE', 444, '5655', 0, '2023-03-14', '2023-03-21', 'received', 58555, 25998420, 'FALSE'),
(67, 29, 'props plus plush xnx', 0, 76, 'tobblers', 'g', '2023-03-21 19:52:35.597909', 500, 'TRUE', 500, '5555', 0, '2023-03-14', '2023-03-21', 'received', 555, 277500, 'FALSE'),
(68, 31, 'camnbuts', 0, 76, 'tobblers', 'bottle', '2023-03-21 19:52:37.464877', 5555, 'TRUE', 5555, '55555', 0, '2023-03-21', '2023-03-21', 'received', 5555, 30858025, 'FALSE'),
(69, 30, 'telescope', 0, 76, 'tobblers', 'others', '2023-03-21 19:52:38.920279', 5555, 'TRUE', 5555, '555', 0, '2023-03-14', '2023-03-21', 'received', 5555, 30858025, 'FALSE'),
(70, 32, 'jenifer diary', 0, 74, 'King Kingo Joes supplies', 'l', '2023-03-21 19:52:40.741944', 555, 'TRUE', 500, '55', 55, '2023-03-07', '2023-03-21', 'incomplete', 444, 222000, 'FALSE'),
(71, 33, 'drinking cups', 0, 75, 'eftrutyjyt', 'box', '2023-03-21 19:52:46.708681', 555, 'TRUE', 555, '5655', 0, '2023-02-28', '2023-03-21', 'received', 221, 122655, 'FALSE'),
(72, 35, 'pippete tubes', 0, 75, 'eftrutyjyt', 'box', '2023-03-21 19:52:51.699691', 600, 'TRUE', 600, '66', 0, '2023-03-07', '2023-03-21', 'received', 22, 13200, 'FALSE'),
(73, 29, 'props ', 0, 76, 'tobblers', 'g', '2023-03-22 08:05:50.800002', 525, 'TRUE', 525, '255', 0, '2023-04-19', '2023-03-22', 'received', 444, 233100, 'FALSE'),
(74, 29, 'props is coming', 0, 74, 'King Kingo Joes supplies', 'g', '2023-03-26 15:57:40.578776', 8000, 'TRUE', 8000, 'lot500', 0, '2024-02-11', '2023-03-26', 'received', 10, 80000, 'FALSE'),
(75, 29, 'props is coming', 0, 76, 'tobblers', 'g', '2023-03-27 01:45:19.180514', 555, 'TRUE', 20, 'lo56', 535, '2023-04-01', '2023-04-01', 'incomplete', 20, 400, 'FALSE'),
(76, 35, 'pippete tubes', 0, 76, 'tobblers', 'box', '2023-03-27 01:45:20.623710', 600000, 'TRUE', 30, 'lot50', 599970, '2023-04-01', '2023-04-01', 'incomplete', 10, 300, 'FALSE'),
(77, 29, 'props is coming', 44, 77, 'Fantastic medical supllies', 'g', '2023-04-01 07:22:28.750890', 200, 'FALSE', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'FALSE'),
(78, 30, 'Telescope', 0, 76, 'tobblers', 'others', '2023-04-01 07:22:30.348525', 222, 'TRUE', 20, 'lot50', 202, '2027-05-29', '2023-04-01', 'incomplete', 10, 200, 'FALSE'),
(79, 31, 'Cambuts machine ', 0, 74, 'King Kingo Joes supplies', 'bottle', '2023-04-01 07:22:31.936852', 20, 'TRUE', 20, 'lot5', 0, '2026-10-14', '2023-04-01', 'received', 20, 400, 'FALSE'),
(80, 29, 'props is coming', 44, 76, 'tobblers', 'g', '2023-04-07 20:35:25.498596', 50, 'FALSE', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'FALSE'),
(81, 29, 'props is coming', 0, 75, 'eftrutyjyt', 'g', '2023-04-08 10:28:37.628400', 10, 'TRUE', 10, 'lot500', 0, '2027-05-05', '2023-04-13', 'received', NULL, 0, 'FALSE'),
(82, 29, 'props is coming', 0, 79, 'Johnson Williams', 'g', '2023-05-10 21:25:40.024726', 90, 'TRUE', 90, 'BATCH45', 0, '2025-06-11', '2023-05-04', 'received', 100, 9000, 'FALSE');

-- --------------------------------------------------------

--
-- Table structure for table `organization`
--

CREATE TABLE `organization` (
  `ID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `ADDRESS` varchar(255) NOT NULL,
  `WEBSITE` varchar(80) NOT NULL,
  `CONTACT` int(30) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `CONTACT_PERSON` varchar(100) NOT NULL,
  `CTX_NUMBER` int(100) NOT NULL,
  `CTX_EMAIL` varchar(100) NOT NULL,
  `PAYMENT_MODULE` varchar(500) NOT NULL,
  `BANK NAME` varchar(100) DEFAULT NULL,
  `ACCOUNT NUMBER` int(50) DEFAULT NULL,
  `ACCOUNT_BRANCH` varchar(100) DEFAULT NULL,
  `BRANCH NAME` varchar(100) DEFAULT NULL,
  `MOMO NUMBER` int(100) DEFAULT NULL,
  `MOMO NAME` varchar(100) DEFAULT NULL,
  `UPDATE_ON` date NOT NULL DEFAULT current_timestamp(),
  `DATE` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organization`
--

INSERT INTO `organization` (`ID`, `NAME`, `ADDRESS`, `WEBSITE`, `CONTACT`, `EMAIL`, `CONTACT_PERSON`, `CTX_NUMBER`, `CTX_EMAIL`, `PAYMENT_MODULE`, `BANK NAME`, `ACCOUNT NUMBER`, `ACCOUNT_BRANCH`, `BRANCH NAME`, `MOMO NUMBER`, `MOMO NAME`, `UPDATE_ON`, `DATE`) VALUES
(1, 'leonides', '', '', 0, '', '', 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-14', '2022-08-14'),
(2, 'John', '', '', 0, '', '', 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-14', '2022-08-14'),
(3, 'James starggedon', '', '', 0, '', '', 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-14', '2022-08-14');

-- --------------------------------------------------------

--
-- Table structure for table `paymentmodes`
--

CREATE TABLE `paymentmodes` (
  `KeyID` int(255) NOT NULL,
  `PaymentMode` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `SAMPLE_STATUS` varchar(100) DEFAULT 'PENDING',
  `INSPECTOR` varchar(255) DEFAULT NULL,
  `INSPECTION_TIME` datetime(6) DEFAULT NULL,
  `PHELOBOTOMY_STATUS` varchar(100) DEFAULT 'QUEUE',
  `SAMPLE_TAKEN_BY` int(100) DEFAULT NULL,
  `TIME_PHELOBOTOMY_COMPLETED` date DEFAULT NULL,
  `ALL_SAMPLE_TAKEN` varchar(50) DEFAULT 'FALSE',
  `MESSAGE` text DEFAULT NULL,
  `TIME` time(6) NOT NULL DEFAULT current_timestamp(),
  `PHELOBOTOMY_MESSAGE` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `performing_test`
--

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `SAMPLE_STATUS`, `INSPECTOR`, `INSPECTION_TIME`, `PHELOBOTOMY_STATUS`, `SAMPLE_TAKEN_BY`, `TIME_PHELOBOTOMY_COMPLETED`, `ALL_SAMPLE_TAKEN`, `MESSAGE`, `TIME`, `PHELOBOTOMY_MESSAGE`) VALUES
(25, '1683273020072', '2023-05-07', 'moderate', 25, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-07 12:29:11.000000', 'DONE', 5, '2023-05-07', 'true', NULL, '12:28:31.000000', ''),
(26, '1682823132672', '2023-05-07', 'emmergency', 26, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-07 12:53:04.000000', 'DONE', 5, '2023-05-07', 'true', NULL, '12:52:13.000000', ''),
(27, '1681279794621', '2023-05-09', 'moderate', 27, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-09 07:37:31.000000', 'DONE', 5, '2023-05-09', 'true', NULL, '07:36:09.000000', ''),
(28, '1682823132672', '2023-05-11', 'emmergency', 28, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-11 05:18:27.000000', 'DONE', 5, '2023-05-11', 'true', NULL, '05:17:56.000000', ''),
(29, '1682823132672', '2023-05-16', 'moderate', 29, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-16 10:35:09.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '10:32:50.000000', ''),
(30, '1682823132672', '2023-05-16', 'moderate', 30, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-16 10:47:28.000000', 'DONE', 5, '2023-05-16', 'true', NULL, '10:46:58.000000', ''),
(31, '1682823132672', '2023-05-18', 'none', 31, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-18 12:58:40.000000', 'DONE', 5, '2023-05-18', 'false', NULL, '08:25:50.000000', 'Sample tubes to collect other test not available'),
(32, '1681645338663', '2023-05-18', 'moderate', 32, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-18 12:58:42.000000', 'DONE', 5, '2023-05-18', 'true', NULL, '08:27:59.000000', ''),
(33, '1681645338663', '2023-05-18', 'none', 33, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-18 13:04:36.000000', 'DONE', 5, '2023-05-18', 'true', 'Inadequate sample taken. Sample coagulated hence a  new sample recommended and sample should arrive in the operations room in less than 30 minutes.', '12:21:11.000000', ''),
(34, '1681279794621', '2023-05-18', 'moderate', 34, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-18 12:58:46.000000', 'DONE', 5, '2023-05-18', 'true', NULL, '12:22:53.000000', ''),
(35, '1682868995486', '2023-05-19', 'emmergency', 35, 0, 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:09:19.000000', ''),
(36, '1682868995486', '2023-05-23', 'moderate', 36, 0, 'PENDING', NULL, NULL, 'DONE', 5, '2023-05-23', 'true', NULL, '11:41:17.000000', ''),
(37, '1681279794621', '2023-05-27', 'moderate', 37, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-27 14:04:09.000000', 'DONE', 5, '2023-05-27', 'false', NULL, '14:02:33.000000', 'Inadequate sample box'),
(38, '1683273020072', '2023-05-27', 'moderate', 38, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-27 14:28:32.000000', 'DONE', 5, '2023-05-27', 'true', NULL, '14:27:38.000000', ''),
(39, '1685211245245', '2023-05-31', 'moderate', 39, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-31 15:28:03.000000', 'DONE', 5, '2023-05-31', 'true', NULL, '15:26:50.000000', ''),
(40, '1685211245245', '2023-05-31', 'none', 40, 0, 'ACCEPTED', 'Dr Tiifu Hamza', '2023-05-31 19:00:18.000000', 'DONE', 5, '2023-05-31', 'true', NULL, '18:59:20.000000', ''),
(41, '1683273020072', '2023-06-01', 'emmergency', 41, 0, 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '09:57:36.000000', ''),
(42, '1683273020072', '2023-06-01', 'emmergency', 42, 0, 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '10:04:44.000000', '');

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
  `PARAMETERNAME` varchar(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `VALUE` int(20) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `PATIENTID` bigint(255) NOT NULL,
  `COMMENTS` varchar(255) DEFAULT NULL,
  `APPROVALSTATUS` varchar(10) DEFAULT NULL,
  `ARRPOVALDATE` datetime(6) DEFAULT NULL,
  `MESSAGE` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `result_cardiac_enzymes`
--

INSERT INTO `result_cardiac_enzymes` (`LIVERID`, `PARAMETERNAME`, `BILLINGID`, `VALUE`, `CREATED_ON`, `UPDATED_ON`, `PATIENTID`, `COMMENTS`, `APPROVALSTATUS`, `ARRPOVALDATE`, `MESSAGE`) VALUES
(61, 'LDH', 16, 5, '2023-04-30 04:26:38.644789', '2023-04-30 07:26:38.644789', 1682823132672, 'This result represent ..............', NULL, NULL, NULL),
(62, 'MYOGLOBIN', 16, 58, '2023-04-30 04:26:38.644789', '2023-04-30 04:26:38.644789', 1682823132672, 'This result represent ..............', NULL, NULL, NULL),
(63, 'CK_MB', 16, 887, '2023-04-30 04:26:38.644789', '2023-04-30 04:26:38.644789', 1682823132672, 'This result represent ..............', NULL, NULL, NULL),
(64, 'TROPONIN', 16, 778, '2023-04-30 04:26:38.644789', '2023-04-30 04:26:38.644789', 1682823132672, 'This result represent ..............', NULL, NULL, NULL),
(81, 'LDH', 17, 14, '2023-04-30 08:26:27.531202', '2023-04-30 08:26:27.531202', 1681645338663, 'This result represent .................................', NULL, NULL, NULL),
(82, 'MYOGLOBIN', 17, 66, '2023-04-30 08:26:27.531202', '2023-04-30 08:26:27.531202', 1681645338663, 'This result represent .................................', NULL, NULL, NULL),
(83, 'CK_MB', 17, 6, '2023-04-30 08:26:27.531202', '2023-04-30 08:26:27.531202', 1681645338663, 'This result represent .................................', NULL, NULL, NULL),
(84, 'AST', 17, 444, '2023-04-30 08:26:27.531202', '2023-04-30 08:26:27.531202', 1681645338663, 'This result represent .................................', NULL, NULL, NULL),
(85, 'TROPONIN', 17, 66, '2023-04-30 08:26:27.531202', '2023-04-30 08:26:27.531202', 1681645338663, 'This result represent .................................', NULL, NULL, NULL),
(86, 'LDH', 27, 99, '2023-05-09 07:38:32.738128', '2023-05-09 07:38:32.738128', 1681279794621, 'Normal result observed', NULL, NULL, NULL),
(87, 'MYOGLOBIN', 27, 55, '2023-05-09 07:38:32.738128', '2023-05-09 07:38:32.738128', 1681279794621, 'Normal result observed', NULL, NULL, NULL),
(88, 'CK_MB', 27, 66, '2023-05-09 07:38:32.738128', '2023-05-09 07:38:32.738128', 1681279794621, 'Normal result observed', NULL, NULL, NULL),
(89, 'AST', 27, 55, '2023-05-09 07:38:32.738128', '2023-05-09 07:38:32.738128', 1681279794621, 'Normal result observed', NULL, NULL, NULL),
(90, 'TROPONIN', 27, 56, '2023-05-09 07:38:32.738128', '2023-05-09 07:38:32.738128', 1681279794621, 'Normal result observed', NULL, NULL, NULL),
(91, 'LDH', 32, 838, '2023-05-18 13:12:20.877986', '2023-05-18 13:12:20.877986', 1681645338663, 'iuwdhdhfjjhfjh', NULL, NULL, NULL),
(92, 'MYOGLOBIN', 32, 838, '2023-05-18 13:12:20.877986', '2023-05-18 13:12:20.877986', 1681645338663, 'iuwdhdhfjjhfjh', NULL, NULL, NULL),
(93, 'CK_MB', 32, 838, '2023-05-18 13:12:20.877986', '2023-05-18 13:12:20.877986', 1681645338663, 'iuwdhdhfjjhfjh', NULL, NULL, NULL),
(94, 'AST', 32, 838, '2023-05-18 13:12:20.877986', '2023-05-18 13:12:20.877986', 1681645338663, 'iuwdhdhfjjhfjh', NULL, NULL, NULL),
(95, 'TROPONIN', 32, 838, '2023-05-18 13:12:20.877986', '2023-05-18 13:12:20.877986', 1681645338663, 'iuwdhdhfjjhfjh', NULL, NULL, NULL),
(96, 'LDH', 31, 88, '2023-05-20 00:08:31.625741', '2023-05-20 00:08:31.625741', 1682823132672, '8JFQKJFQEKJFQHFJQWHFUJ', NULL, NULL, NULL),
(97, 'MYOGLOBIN', 31, 88, '2023-05-20 00:08:31.625741', '2023-05-20 00:08:31.625741', 1682823132672, '8JFQKJFQEKJFQHFJQWHFUJ', NULL, NULL, NULL),
(98, 'CK_MB', 31, 8, '2023-05-20 00:08:31.625741', '2023-05-20 00:08:31.625741', 1682823132672, '8JFQKJFQEKJFQHFJQWHFUJ', NULL, NULL, NULL),
(99, 'AST', 31, 888, '2023-05-20 00:08:31.625741', '2023-05-20 00:08:31.625741', 1682823132672, '8JFQKJFQEKJFQHFJQWHFUJ', NULL, NULL, NULL),
(100, 'TROPONIN', 31, 8, '2023-05-20 00:08:31.625741', '2023-05-20 00:08:31.625741', 1682823132672, '8JFQKJFQEKJFQHFJQWHFUJ', NULL, NULL, NULL);

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
(1, 10, 27, 'jegwgoweogwgiwgw'),
(2, 4, 33, 'Blood A+'),
(3, 4, 31, 'etugwuguiegui'),
(4, 10, 37, 'ejfj2fjkw2kj');

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
(3, 34, 'KIOEIHPODOSFBKFIOBSOIdggiosigosifo', 31, 1682823132672, '2023-05-19 22:05:18.075888', NULL);

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
(56, 'ast---', 37, 'G/DL', '2023-05-27 14:08:18.023459', NULL, 55, 1681279794621);

-- --------------------------------------------------------

--
-- Table structure for table `result_function_renal`
--

CREATE TABLE `result_function_renal` (
  `LIVERID` int(255) NOT NULL,
  `PARAMETERNAME` varchar(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `UNIT` varchar(20) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6)
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
(3, 'Urine', 'negative', '2023-04-30 15:45:15.171584', '2023-04-30 15:45:15.171584', 'hghfhfhfh. Deteriorating', 1681455467922, 18, 14),
(4, 'Blood', 'negative', '2023-04-30 17:18:04.784863', '2023-04-30 17:18:04.784863', 'No pregnancy', 1682823132672, 19, 14),
(5, 'Urine', 'positive', '2023-05-09 07:40:07.338413', '2023-05-09 07:40:07.338413', 'Positive', 1681279794621, 27, 14),
(6, 'Urine', 'positive', '2023-05-18 13:13:16.177268', '2023-05-18 13:13:16.177268', 'pregnancy dey wai', 1681645338663, 32, 14);

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
  `KEY` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `VALUE` int(20) NOT NULL,
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED_ON` datetime(6) DEFAULT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `COMMENTS` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `result_thyroid_functional_test`
--

INSERT INTO `result_thyroid_functional_test` (`KEY`, `PARAMETER`, `BILLINGID`, `VALUE`, `CREATED_ON`, `UPDATED_ON`, `PATIENTID`, `COMMENTS`) VALUES
(86, 'TSH', 20, 77900, '2023-05-03 08:37:40.042285', '2023-05-04 16:04:11.000000', 1682823132672, '9ijk,fghouigjouiyg'),
(87, 'T4', 20, 88094, '2023-05-03 08:37:40.042285', '2023-05-04 16:04:11.000000', 1682823132672, '9ijk,fghouigjouiyg'),
(91, 'T3', 20, 7878, '2023-05-04 15:32:38.145498', '2023-05-04 16:04:11.000000', 1682823132672, '9ijk,fghouigjouiyg'),
(93, 'T6', 20, 444, '2023-05-04 15:32:38.227918', '2023-05-04 16:04:11.000000', 1682823132672, '9ijk,fghouigjouiyg'),
(94, 'T5', 20, 44, '2023-05-04 15:33:53.876242', '2023-05-04 16:04:11.000000', 1682823132672, '9ijk,fghouigjouiyg'),
(95, 'T9', 20, 888, '2023-05-04 15:35:59.621230', '2023-05-04 16:04:11.000000', 1682823132672, '9ijk,fghouigjouiyg'),
(96, 'TSH', 27, 770, '2023-05-09 07:51:06.674725', '2023-05-11 08:16:01.000000', 1681279794621, 'Comments driven is here '),
(97, 'T4', 27, 7040, '2023-05-09 07:51:06.674725', '2023-05-11 08:16:01.000000', 1681279794621, 'Comments driven is here '),
(98, 'T3', 27, 88, '2023-05-09 07:51:06.674725', '2023-05-11 08:16:01.000000', 1681279794621, 'Comments driven is here '),
(99, 'T5', 27, 888, '2023-05-09 07:51:06.674725', '2023-05-11 08:16:01.000000', 1681279794621, 'Comments driven is here '),
(100, 'T6', 27, 80903, '2023-05-09 07:51:06.674725', '2023-05-11 08:16:01.000000', 1681279794621, 'Comments driven is here '),
(101, 'T9', 27, 885934, '2023-05-09 07:51:06.674725', '2023-05-11 08:16:01.000000', 1681279794621, 'Comments driven is here ');

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
(2, '1/20', '1/80', '1/80', '1/80', 'fjdjjdjdj', '2023-05-27 14:07:42.725734', NULL, 37, 1681279794621);

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
  `DELETEV` varchar(10) DEFAULT 'FALSE',
  `EDITV` varchar(10) DEFAULT 'FALSE',
  `READV` varchar(10) DEFAULT 'TRUE',
  `CREATEV` varchar(10) DEFAULT 'FALSE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`EMPLOYEEID`, `USERNAME`, `ROLE`, `PASSWORD`, `DATE_CREATED`, `TIME`, `REFRESH_TOKEN`, `DELETEV`, `EDITV`, `READV`, `CREATEV`) VALUES
(27, 'Tiifu Hamza', 'Lab Technician', '$2b$10$UT.MuMQnIunfMKCL5wKkBeKwirguMqS42yTPuRT/Z/yQSf9F66PgK', '2023-04-05', '05:10:43.000000', NULL, 'FALSE', 'FALSE', 'TRUE', 'FALSE');

-- --------------------------------------------------------

--
-- Table structure for table `sample`
--

CREATE TABLE `sample` (
  `ID` int(100) NOT NULL,
  `PATIENTID` int(50) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `APPROVALSTATUS` varchar(100) NOT NULL,
  `MESSAGE` varchar(255) NOT NULL,
  `INSPECTOR` varchar(100) NOT NULL,
  `BILLINGID` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'U/L', 3174, 200, 'creatinine kinase (CK)', 'TRUE'),
(2, 'U/L', 700, 243, 'aspartate transaminase(AST)', 'TRUE'),
(3, 'U/L', 564, 243, 'lactate dehydrogenase (LDH)', 'TRUE'),
(4, 'mg/ui', 20, 133, 'TTT', 'TRUE');

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
(1, 'under 50 years', 99820, 55, '2023-05-11 11:21:54.705181', 'male'),
(2, 'over 50 years', 99848, 999, '2023-05-11 11:21:54.705181', 'male'),
(3, 'under 50 years', 94949, 94949, '2023-05-11 11:21:54.705181', 'female'),
(4, 'over 50 years', 494949, 499, '2023-05-11 11:21:54.705181', 'female');

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
(8, 'Hadiatu', 600, 200, 'l/l', '0000-00-00 00:00:00.000000');

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
(227, 'eosinophils', 'mg/dl', 200, 500, '2023-04-15 13:13:33.628004'),
(228, 'basophils', '', 0, 0, '2023-04-15 13:13:33.644128'),
(229, 'lymphocytes', '', 0, 0, '2023-04-15 13:13:33.695407'),
(230, 'monocytes', 'g/hj', 0, 0, '2023-04-15 13:13:33.711518'),
(231, 'mch', 'g/hj', 0, 0, '2023-04-15 13:13:33.728290'),
(232, 'mcv', 'g/hj', 0, 0, '2023-04-15 13:13:33.744786');

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
(431, 'heamoglobin', 'g/dl', 12, 17, '2023-04-27 18:23:14'),
(432, 'Neutropenia', 'mg.dl', 100, 200, '2023-04-27 18:23:14'),
(433, 'Agbevia', 'agbe', 200, 400, '2023-04-27 18:23:14'),
(434, 'mENSTRUAL', 'JEJ', 66, 88, '2023-04-27 18:23:14'),
(435, 'Haemoglobin ', 'mg/dl', 20, 500, '2023-04-27 18:23:14'),
(436, 'Hadiatu', 'l/l', 200, 600, '2023-04-27 18:23:14');

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
  `FBCID` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `setup_full_count_count_female`
--

INSERT INTO `setup_full_count_count_female` (`PARAMETER`, `UNIT`, `UPPER`, `LOWER`, `DATE`, `FBCID`) VALUES
('heamoglobin', 'g/dl', 17, 12, '2023-04-16 05:41:54.757818', 56),
('Neutropenia', 'mg.dl', 200, 100, '2023-04-16 05:41:54.807679', 57),
('Agbevia', 'agbe', 400, 200, '2023-04-16 05:41:54.841016', 58);

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
  `date` datetime(6) NOT NULL
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

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`SUPPLIERID`, `NAME`, `COMMODITY`, `ADDRESS`, `DATE`, `PHONENUMBER`, `CONTACTPERSON`, `REGION`, `EMAIL`) VALUES
(74, 'King Kingo Joes supplies', 'FAILED TP TUN ANALYTICS', 'Adjacent Holly Cross Church', '2023-03-16 14:27:38.787490', 249443089, 'Tiifu Hamza Kojo Boronson', 'utrtrjtj', 'hamzatiifu45@gmail.com'),
(75, 'eftrutyjyt', 'Homicides', 'Adjacent Holly Cross Church', '2023-03-16 14:28:21.491987', 249443089, '756785566785', 'hfghfghfghfg', 'harund@gmail.com'),
(76, 'tobblers', 'edta tubes', 'Kalphohin lowcost 30A', '2023-03-20 18:20:07.457352', 595964565, '0596458588', 'Northern region', 'hamztiifu45@gmail.com,'),
(78, 'xkills', 'kkgkkf', 'kal', '2023-04-08 00:36:49.786103', 595964565, 'tiifu ', 'tamale', 'djdj@gm.com'),
(79, 'Johnson Williams', 'edta tubes', 'ifififi', '2023-05-10 21:24:42.421744', 595964565, 'Tiifu', 'Northern', 'hamzatiifu45@gmail.com');

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
  `ready_date` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test_ascension`
--

INSERT INTO `test_ascension` (`id`, `testid`, `billingid`, `collection`, `processing`, `ready`, `processing_date`, `collection_date`, `ready_date`) VALUES
(40, 2, 16, 'true', 'true', 'false', '2023-04-30 15:02:39.000000', NULL, NULL),
(41, 5, 16, 'true', 'true', 'false', '2023-04-30 03:58:42.000000', NULL, NULL),
(42, 13, 16, 'true', 'true', 'true', '2023-04-30 03:56:43.000000', NULL, '2023-04-30 14:49:35.000000'),
(43, 2, 17, 'true', 'true', 'false', '2023-04-30 04:31:51.000000', NULL, NULL),
(44, 13, 17, 'true', 'true', 'true', '2023-04-30 04:31:52.000000', NULL, '2023-04-30 09:08:57.000000'),
(45, 5, 17, 'true', 'true', 'true', '2023-04-30 04:31:23.000000', NULL, '2023-04-30 08:26:27.000000'),
(47, 1, 19, 'true', 'true', 'true', '2023-04-30 17:33:30.000000', NULL, '2023-05-04 18:05:33.000000'),
(49, 7, 19, 'true', 'true', 'true', '2023-04-30 17:33:22.000000', NULL, '2023-05-05 07:56:29.000000'),
(50, 11, 19, 'true', 'true', 'false', '2023-04-30 17:33:24.000000', NULL, NULL),
(51, 15, 20, 'true', 'true', 'true', '2023-05-04 16:08:50.000000', NULL, '2023-05-03 08:37:40.000000'),
(52, 2, 22, 'true', 'true', 'false', '2023-05-05 08:54:46.000000', NULL, NULL),
(53, 3, 22, 'true', 'true', 'false', '2023-05-05 08:54:47.000000', NULL, NULL),
(54, 3, 21, 'true', 'true', 'true', '2023-05-06 11:06:14.000000', NULL, '2023-05-06 09:48:17.000000'),
(55, 2, 23, 'true', 'true', 'false', '2023-05-05 08:54:56.000000', NULL, NULL),
(56, 1, 23, 'true', 'true', 'true', '2023-05-05 08:54:59.000000', NULL, '2023-05-05 08:55:22.000000'),
(57, 3, 23, 'true', 'true', 'false', '2023-05-05 08:55:02.000000', NULL, NULL),
(58, 7, 23, 'true', 'true', 'true', '2023-05-05 08:55:48.000000', NULL, '2023-05-05 08:56:10.000000'),
(59, 16, 24, 'true', 'false', 'false', NULL, NULL, NULL),
(60, 16, 25, 'true', 'true', 'true', '2023-05-17 09:12:20.000000', NULL, '2023-05-08 12:22:02.000000'),
(61, 17, 26, 'true', 'true', 'true', '2023-05-16 07:24:55.000000', NULL, '2023-05-08 22:56:44.000000'),
(68, 2, 28, 'true', 'true', 'false', '2023-05-16 13:41:32.000000', NULL, NULL),
(69, 19, 28, 'true', 'true', 'true', '2023-05-11 06:34:33.000000', NULL, '2023-05-11 07:12:07.000000'),
(72, 2, 32, 'true', 'false', 'false', NULL, NULL, NULL),
(80, 2, 34, 'true', 'true', 'false', '2023-05-18 13:06:20.000000', NULL, NULL),
(105, 3, 38, 'false', 'false', 'false', NULL, NULL, NULL),
(106, 7, 38, 'false', 'false', 'false', NULL, NULL, NULL),
(115, 112, 35, 'false', 'false', 'false', NULL, NULL, NULL),
(116, 113, 35, 'false', 'false', 'false', NULL, NULL, NULL),
(117, 114, 35, 'false', 'false', 'false', NULL, NULL, NULL),
(118, 4, 35, 'false', 'false', 'false', NULL, NULL, NULL),
(119, 12, 35, 'false', 'false', 'false', NULL, NULL, NULL),
(157, 3, 39, 'false', 'false', 'false', NULL, NULL, NULL),
(170, 2, 37, 'false', 'false', 'false', NULL, NULL, NULL),
(172, 6, 37, 'false', 'false', 'false', NULL, NULL, NULL),
(174, 13, 37, 'false', 'false', 'false', NULL, NULL, NULL),
(175, 17, 37, 'false', 'false', 'false', NULL, NULL, NULL),
(176, 21, 37, 'false', 'false', 'false', NULL, NULL, NULL),
(185, 183, 36, 'false', 'false', 'false', NULL, NULL, NULL),
(186, 3, 36, 'false', 'false', 'false', NULL, NULL, NULL),
(187, 7, 36, 'true', 'true', 'false', NULL, NULL, NULL),
(214, 192, 31, 'true', 'true', 'false', NULL, NULL, NULL),
(215, 193, 31, 'true', 'true', 'false', NULL, NULL, NULL),
(218, 216, 31, 'true', 'false', 'false', NULL, NULL, NULL),
(225, 220, 30, 'false', 'false', 'false', NULL, NULL, NULL),
(226, 222, 30, 'true', 'true', 'false', NULL, NULL, NULL),
(242, 93, 33, 'false', 'false', 'false', NULL, NULL, NULL),
(243, 88, 33, 'false', 'false', 'false', NULL, NULL, NULL),
(244, 89, 33, 'false', 'false', 'false', NULL, NULL, NULL),
(245, 10, 33, 'false', 'false', 'false', NULL, NULL, NULL),
(246, 14, 33, 'false', 'false', 'false', NULL, NULL, NULL);

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
(21, 'random blood sugar', 'chemistry', 20, '2023-05-16 10:46:09', 'blood', 'sugar testing ', 'gell tube ', 'mg/dl', '3');

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
(11, 'Hazy', 'Amber', 'trace', 'positive(+)', 'positive(+)', 'positive(+)', 'trace', 'positive(+)', 1.05, 4848, NULL, 37, 'jvjdjdjj', 1681279794621, 'yellpw', 'trace');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activation`
--
ALTER TABLE `activation`
  ADD PRIMARY KEY (`ID`);

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
-- Indexes for table `glycated_haemoglobin`
--
ALTER TABLE `glycated_haemoglobin`
  ADD PRIMARY KEY (`ID`);

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
-- Indexes for table `result_function_liver`
--
ALTER TABLE `result_function_liver`
  ADD PRIMARY KEY (`liverid`);

--
-- Indexes for table `result_function_renal`
--
ALTER TABLE `result_function_renal`
  ADD PRIMARY KEY (`LIVERID`);

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
  ADD PRIMARY KEY (`KEY`);

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
-- Indexes for table `sample`
--
ALTER TABLE `sample`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `samplingtest`
--
ALTER TABLE `samplingtest`
  ADD PRIMARY KEY (`TestKey`);

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
  ADD PRIMARY KEY (`FBCID`);

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
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `BILLINGID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `billinghx`
--
ALTER TABLE `billinghx`
  MODIFY `KeyID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `commodity`
--
ALTER TABLE `commodity`
  MODIFY `COMID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `companyprofile`
--
ALTER TABLE `companyprofile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `departmentrequisitionhx`
--
ALTER TABLE `departmentrequisitionhx`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1036;

--
-- AUTO_INCREMENT for table `departmentstocks`
--
ALTER TABLE `departmentstocks`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `glycated_haemoglobin`
--
ALTER TABLE `glycated_haemoglobin`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hepatitisbresult`
--
ALTER TABLE `hepatitisbresult`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `hepatitisb_profile`
--
ALTER TABLE `hepatitisb_profile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `malaria`
--
ALTER TABLE `malaria`
  MODIFY `KEY` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `manager_sample_descision`
--
ALTER TABLE `manager_sample_descision`
  MODIFY `SAMPLEID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `newstock`
--
ALTER TABLE `newstock`
  MODIFY `stockid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `new_patients`
--
ALTER TABLE `new_patients`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `productordersid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `paymentmodes`
--
ALTER TABLE `paymentmodes`
  MODIFY `KeyID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

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
  MODIFY `LIVERID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `result_comments`
--
ALTER TABLE `result_comments`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `result_esr`
--
ALTER TABLE `result_esr`
  MODIFY `keyid` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `result_fasting_blood_sugar`
--
ALTER TABLE `result_fasting_blood_sugar`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `result_function_liver`
--
ALTER TABLE `result_function_liver`
  MODIFY `liverid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `result_function_renal`
--
ALTER TABLE `result_function_renal`
  MODIFY `LIVERID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_pregnancy_test`
--
ALTER TABLE `result_pregnancy_test`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `result_random_blood_sugar`
--
ALTER TABLE `result_random_blood_sugar`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `result_thyroid_functional_test`
--
ALTER TABLE `result_thyroid_functional_test`
  MODIFY `KEY` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `result_widal`
--
ALTER TABLE `result_widal`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `EMPLOYEEID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `sample`
--
ALTER TABLE `sample`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `samplingtest`
--
ALTER TABLE `samplingtest`
  MODIFY `TestKey` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_beta_hcg`
--
ALTER TABLE `setup_beta_hcg`
  MODIFY `KEYID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `setup_cardiac_enzymes`
--
ALTER TABLE `setup_cardiac_enzymes`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `setup_esr`
--
ALTER TABLE `setup_esr`
  MODIFY `keyid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `setup_fullcount_paramters`
--
ALTER TABLE `setup_fullcount_paramters`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_general`
--
ALTER TABLE `setup_full_blood_count_test_general`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=233;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_male`
--
ALTER TABLE `setup_full_blood_count_test_male`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=437;

--
-- AUTO_INCREMENT for table `setup_full_count_count_female`
--
ALTER TABLE `setup_full_count_count_female`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

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
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `SUPPLIERID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `test_ascension`
--
ALTER TABLE `test_ascension`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=247;

--
-- AUTO_INCREMENT for table `test_categories`
--
ALTER TABLE `test_categories`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `test_panels`
--
ALTER TABLE `test_panels`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `typhoid_test`
--
ALTER TABLE `typhoid_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `urinalysisresult`
--
ALTER TABLE `urinalysisresult`
  MODIFY `urinalysisKey` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
