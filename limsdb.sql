-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 03, 2022 at 08:04 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `CREATED_ON` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UPDATED` date NOT NULL,
  `ORGANIZATION` varchar(255) NOT NULL,
  `CLINICIAN` varchar(255) NOT NULL,
  `PAYMENT_MODE` int(255) NOT NULL,
  `TYPE` varchar(255) NOT NULL DEFAULT 'PREPAID',
  `OUTSTANDING` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `billing`
--

INSERT INTO `billing` (`BILLINGID`, `PATIENTID`, `PAID_AMOUNT`, `PAYABLE`, `DISCOUNT`, `CREATED_ON`, `UPDATED`, `ORGANIZATION`, `CLINICIAN`, `PAYMENT_MODE`, `TYPE`, `OUTSTANDING`) VALUES
(24, 1661283584733, 60, 230, 0, '2022-08-23 20:40:56.970578', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(25, 1661284152435, 60, 90, 0, '2022-08-23 20:50:05.488236', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(27, 1661366472111, 0, 230, 0, '2022-08-24 19:42:16.437522', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'POSTPAID', 230),
(28, 1661367829337, 0, 230, 0, '2022-08-24 20:04:52.469853', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'POSTPAID', 230),
(29, 1661405222266, 0, 290, 0, '2022-08-25 06:28:43.833730', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'POSTPAID', 290),
(30, 1661429826854, 200, 210, 0, '2022-08-25 13:18:16.944937', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(31, 1661780714543, 60, 200, 0, '2022-08-29 14:47:12.091848', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', 120),
(32, 1661979176713, 0, 210, 0, '2022-08-31 21:54:04.023887', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'POSTPAID', 210),
(33, 1661979176713, 200, 0, 0, '2022-08-31 21:57:42.339134', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', -254),
(34, 1661981290945, 140, 0, 0, '2022-08-31 22:29:00.048682', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', -150),
(35, 1661981662803, 150, 0, 0, '2022-08-31 22:35:34.170699', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', -150),
(36, 1661979176713, 230, 230, 0, '2022-08-31 22:38:20.892983', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(37, 1661447639214, 60, 90, 0, '2022-08-31 22:39:53.912717', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 30),
(38, 1661981662803, 230, 230, 0, '2022-09-03 00:20:57.662836', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(39, 1661981662803, 0, 140, 0, '2022-09-03 00:28:55.272732', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 140),
(40, 1662205464496, 200, 230, 0, '2022-09-03 12:46:12.139658', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 30);

-- --------------------------------------------------------

--
-- Table structure for table `bloodgroup`
--

CREATE TABLE `bloodgroup` (
  `ID` int(100) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `BLOODGROUP` varchar(30) NOT NULL,
  `RHESUS` varchar(30) NOT NULL,
  `CREATED_ON` date DEFAULT current_timestamp(),
  `UPDATED_ON` date DEFAULT current_timestamp(),
  `TIME` time(6) DEFAULT NULL,
  `PATIENTID` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bloodgroup`
--

INSERT INTO `bloodgroup` (`ID`, `BILLINGID`, `BLOODGROUP`, `RHESUS`, `CREATED_ON`, `UPDATED_ON`, `TIME`, `PATIENTID`) VALUES
(20, 2, 'A', 'positive', '2022-09-03', '2022-09-03', '12:13:55.000000', 0);

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `ID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`ID`, `NAME`, `DATE`) VALUES
(1, 'CENTRAL', '0000-00-00'),
(2, 'SDA', '2022-08-21'),
(3, '', '2022-08-21');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `clinician`
--

INSERT INTO `clinician` (`ID`, `NAME`, `WEBSITE`, `EMAIL`, `CONTACT`, `LOCATION`, `ADDRESS`, `OCCUPATION`, `PAYMENT MODULE`, `MOMO NAME`, `MOMO NUMBER`, `BANK NAME`, `BANK BRANCH`, `ACCOUNT NUMBER`, `ACCOUNT NAME`, `ORGANIZATION`, `ORGANIZATION POSITION`, `DATE`, `UPDATE_ON`) VALUES
(1, 'Dr Paul Sinister', '', '', 0, '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-14', '2022-08-14'),
(2, '', '', '', 0, '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-16', '2022-08-16');

-- --------------------------------------------------------

--
-- Table structure for table `hepatitisb`
--

CREATE TABLE `hepatitisb` (
  `ID` int(100) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `PATIENTID` bigint(100) NOT NULL,
  `CREATED_ON` date DEFAULT NULL,
  `UPDATED_ON` datetime(6) DEFAULT NULL,
  `TIME` time(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `Comments` varchar(255) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `CREATED_ON` date DEFAULT current_timestamp(),
  `UPDATED_ON` date DEFAULT current_timestamp(),
  `SCIENTIST` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `malaria_test`
--

CREATE TABLE `malaria_test` (
  `TESTID` int(255) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `RESULT` varchar(255) NOT NULL,
  `COMMENT` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `new_patients`
--

CREATE TABLE `new_patients` (
  `ID` int(255) NOT NULL,
  `PATIENTID` bigint(255) NOT NULL,
  `FULLNAME` varchar(100) NOT NULL,
  `EMAIL` varchar(100) DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `AGE` int(10) NOT NULL,
  `GENDER` varchar(10) NOT NULL DEFAULT 'FEMALE',
  `ORGANIZATION` varchar(100) DEFAULT NULL,
  `CLINICIAN` varchar(100) DEFAULT NULL,
  `PATIENTTYPE` varchar(100) NOT NULL DEFAULT 'MAIN',
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
  `ACTIVATION_STATUS` varchar(10) NOT NULL DEFAULT 'FALSE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `new_patients`
--

INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FULLNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `ORGANIZATION`, `CLINICIAN`, `PATIENTTYPE`, `LOCATION`, `MARITAL_STATUS`, `EMMERGENCY_CONTACT`, `EMMERGENCY_CONTACT_NAME`, `RELATIONSHIP`, `MOBILE_NUMBER`, `AGETYPE`, `PATIENTORGANIZATION`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`) VALUES
(18, 1661283584733, 'TIIFU HAMZA', 'hamzatiifu45@gmail.com', '2012-11-06', 9, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2022-08-23', 'FALSE'),
(19, 1661284152435, 'TIIFU HAMZA', 'hamzatiifu45@gmail.com', '1954-11-11', 67, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', ' brother', 595585878, 'years', 'leonides', 'Nursing', '2022-08-23', 'FALSE'),
(20, 1661366472111, 'TIIFU HAMZA', 'hamzatiifu45@gmail.com', '1991-11-11', 30, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2022-08-24', 'FALSE'),
(21, 1661367829337, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1954-06-06', 68, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595999999, 'years', 'leonides', 'nursing', '2022-08-24', 'FALSE'),
(22, 1661405222266, 'dr flover agbdifs', 'hamzatiifu45@gmail.com', '1111-11-11', 910, 'male', 'leonides', 'Dr Paul Sinister', 'Refered', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'self', 595964565, 'years', 'leonides', 'Nursing', '2022-08-25', 'FALSE'),
(23, 1661429826854, 'TIIFU HAMZA', 'hamzatiifu45@gmail.com', '2022-06-11', 2, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595964656, 'months', 'leonides', 'nursing', '2022-08-25', 'FALSE'),
(24, 1661447639214, 'tiifu xelov vlidmir zonesjey', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595964565, 'years', 'leonides', 'nursing', '2022-08-25', 'FALSE'),
(25, 1661780714543, 'Ntontonkasari Ibrahim', 'ibrahim474@gmail.com', '2012-06-11', 10, 'male', '', '', 'Direct', NULL, 'married', '0595964565', 'Tiifu Hamza Kojo Boronson', 'brother', 594654885, 'years', 'leonides', 'Mason', '2022-08-29', 'FALSE'),
(26, 1661979176713, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'single', '0595964565', 'Tiifu Hamza Kojo Boronson', 'brother', 555555555, 'years', 'leonides', 'Nursing', '2022-08-31', 'FALSE'),
(27, 1661981290945, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 595955858, 'years', 'leonides', 'Nursing', '2022-08-31', 'FALSE'),
(28, 1661981662803, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-06-06', 27, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 595999999, 'years', 'leonides', 'Nursing', '2022-08-31', 'TRUE'),
(29, 1662205464496, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'single', '+233249434803', 'tiifu hamza', 'brother', 595964456, 'years', 'leonides', 'Nursing', '2022-09-03', 'TRUE');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `organization`
--

INSERT INTO `organization` (`ID`, `NAME`, `ADDRESS`, `WEBSITE`, `CONTACT`, `EMAIL`, `CONTACT_PERSON`, `CTX_NUMBER`, `CTX_EMAIL`, `PAYMENT_MODULE`, `BANK NAME`, `ACCOUNT NUMBER`, `ACCOUNT_BRANCH`, `BRANCH NAME`, `MOMO NUMBER`, `MOMO NAME`, `UPDATE_ON`, `DATE`) VALUES
(1, 'leonides', '', '', 0, '', '', 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-14', '2022-08-14'),
(2, 'John', '', '', 0, '', '', 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-14', '2022-08-14'),
(3, 'James starggedon', '', '', 0, '', '', 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-14', '2022-08-14'),
(4, '', '', '', 0, '', '', 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, '2022-08-16', '2022-08-16');

-- --------------------------------------------------------

--
-- Table structure for table `performing_test`
--

CREATE TABLE `performing_test` (
  `ID` int(255) NOT NULL,
  `PATIENTID` varchar(255) NOT NULL,
  `TEST` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `URGENCY` varchar(255) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `SAMPLING_CENTER` varchar(100) NOT NULL,
  `SAMPLE_STATUS` varchar(100) DEFAULT 'PENDING',
  `PHELOBOTOMY_STATUS` varchar(100) DEFAULT 'QUEUE',
  `SAMPLE_TAKEN_BY` varchar(100) DEFAULT NULL,
  `TIME_PHELOBOTOMY_COMPLETED` date DEFAULT NULL,
  `ALL_SAMPLE_TAKEN` varchar(50) DEFAULT 'FALSE',
  `MESSAGE` varchar(255) DEFAULT NULL,
  `TIME` time(6) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `performing_test`
--

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `TEST`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `SAMPLE_STATUS`, `PHELOBOTOMY_STATUS`, `SAMPLE_TAKEN_BY`, `TIME_PHELOBOTOMY_COMPLETED`, `ALL_SAMPLE_TAKEN`, `MESSAGE`, `TIME`) VALUES
(18, '1661283584733', 'glycated heamoglobin,Liver Function Test,Renal Function Test', '2022-08-23', 'moderate', 24, 'SDA', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000'),
(19, '1661284152435', 'glycated heamoglobin', '2022-08-26', 'moderate', 25, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000'),
(20, '1661283584733', 'glycated heamoglobin,Liver Function Test', '2022-08-26', 'moderate', 26, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000'),
(21, '1661366472111', 'glycated heamoglobin,Renal Function Test', '2022-08-24', 'moderate', 27, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:42:16.000000'),
(22, '1661367829337', 'glycated heamoglobin,Renal Function Test,Lipid Profile', '2022-08-24', 'none', 28, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '20:04:52.000000'),
(23, '1661405222266', 'glycated heamoglobin,Renal Function Test,Liver Function Test,Lipid Profile', '2022-08-25', 'moderate', 29, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '06:28:43.000000'),
(24, '1661429826854', 'Liver Function Test,glycated heamoglobin,Lipid Profile', '2022-08-25', 'moderate', 30, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '13:18:17.000000'),
(25, '1661780714543', 'Lipid Profile,Renal Function Test,Liver Function Test', '2022-08-29', 'moderate', 31, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '14:47:12.000000'),
(26, '1661979176713', 'glycated heamoglobin,Lipid Profile,Liver Function Test', '2022-08-31', 'moderate', 32, 'SDA', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '21:54:04.000000'),
(27, '1661979176713', 'glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson,Lipid Profile', '2022-08-31', 'moderate', 33, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '21:57:42.000000'),
(28, '1661981290945', 'glycated heamoglobin,Lipid Profile', '2022-08-31', 'moderate', 34, 'SDA', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:29:00.000000'),
(29, '1661981662803', 'glycated heamoglobin,Liver Function Test', '2022-08-31', 'moderate', 35, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:35:34.000000'),
(30, '1661979176713', 'glycated heamoglobin,Renal Function Test,Lipid Profile', '2022-08-31', 'emmergency', 36, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:38:20.000000'),
(31, '1661447639214', 'glycated heamoglobin', '2022-08-31', 'emmergency', 37, 'SDA', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:39:53.000000'),
(32, '1661981662803', 'glycated heamoglobin,Lipid Profile,Renal Function Test', '2022-09-03', 'none', 38, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '00:20:57.000000'),
(33, '1661981662803', 'Renal Function Test,Liver Function Test', '2022-09-03', 'emmergency', 39, 'SDA', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '00:28:55.000000'),
(34, '1662205464496', 'glycated heamoglobin,Lipid Profile,Renal Function Test', '2022-09-03', 'moderate', 40, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL, '12:46:12.000000');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `setup_full_blood_count_test`
--

CREATE TABLE `setup_full_blood_count_test` (
  `ID` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `setup_glycated_heamoglobin_test`
--

CREATE TABLE `setup_glycated_heamoglobin_test` (
  `TESTID` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `setup_lipid_profile_test`
--

CREATE TABLE `setup_lipid_profile_test` (
  `ID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER_LIMIT` int(100) NOT NULL,
  `LOWER_LIMIT` int(100) NOT NULL,
  `COMMENT` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `setup_liver_function_test`
--

CREATE TABLE `setup_liver_function_test` (
  `ID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER_LIMIT` int(100) NOT NULL,
  `LOWER_LIMIT` int(100) NOT NULL,
  `COMMENT` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `setup_renal_function_test`
--

CREATE TABLE `setup_renal_function_test` (
  `ID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER_LIMIT` int(50) NOT NULL,
  `LOWER_LIMIT` int(50) NOT NULL,
  `COMMENT` varchar(255) DEFAULT NULL,
  `UNIT` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `test_categories`
--

CREATE TABLE `test_categories` (
  `ID` int(255) NOT NULL,
  `CATEGORY` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `test_categories`
--

INSERT INTO `test_categories` (`ID`, `CATEGORY`, `DESCRIPTION`) VALUES
(2, 'chemistry', ''),
(4, 'Haematology', '');

-- --------------------------------------------------------

--
-- Table structure for table `test_panels`
--

CREATE TABLE `test_panels` (
  `ID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `CATEGORY` varchar(255) NOT NULL,
  `PRICE` int(20) NOT NULL,
  `CREATED_ON` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `test_panels`
--

INSERT INTO `test_panels` (`ID`, `NAME`, `CATEGORY`, `PRICE`, `CREATED_ON`) VALUES
(1, 'glycated heamoglobin', 'chemistry', 90, '0000-00-00 00:00:00'),
(2, 'Renal Function Test', 'Haematology', 80, '2022-08-18 00:00:00'),
(5, 'Liver Function Test', 'chemistry', 60, '2022-08-18 00:00:00'),
(6, 'Lipid Profile', 'chemistry', 60, '2022-08-18 18:35:40'),
(7, '', '', 0, '2022-08-19 23:50:33'),
(8, 'Tiifu Hamza Kojo Boronson', 'chemistry', 44, '2022-08-30 00:27:07');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `billing`
--
ALTER TABLE `billing`
  ADD PRIMARY KEY (`BILLINGID`);

--
-- Indexes for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `clinician`
--
ALTER TABLE `clinician`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `hepatitisb`
--
ALTER TABLE `hepatitisb`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `hepatitisb_profile`
--
ALTER TABLE `hepatitisb_profile`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `malaria_test`
--
ALTER TABLE `malaria_test`
  ADD PRIMARY KEY (`TESTID`);

--
-- Indexes for table `new_patients`
--
ALTER TABLE `new_patients`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `organization`
--
ALTER TABLE `organization`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `performing_test`
--
ALTER TABLE `performing_test`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `sample`
--
ALTER TABLE `sample`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `setup_full_blood_count_test`
--
ALTER TABLE `setup_full_blood_count_test`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `setup_glycated_heamoglobin_test`
--
ALTER TABLE `setup_glycated_heamoglobin_test`
  ADD PRIMARY KEY (`TESTID`);

--
-- Indexes for table `setup_lipid_profile_test`
--
ALTER TABLE `setup_lipid_profile_test`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `setup_renal_function_test`
--
ALTER TABLE `setup_renal_function_test`
  ADD PRIMARY KEY (`ID`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `BILLINGID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `clinician`
--
ALTER TABLE `clinician`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hepatitisb`
--
ALTER TABLE `hepatitisb`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hepatitisb_profile`
--
ALTER TABLE `hepatitisb_profile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `malaria_test`
--
ALTER TABLE `malaria_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `new_patients`
--
ALTER TABLE `new_patients`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `sample`
--
ALTER TABLE `sample`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test`
--
ALTER TABLE `setup_full_blood_count_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_glycated_heamoglobin_test`
--
ALTER TABLE `setup_glycated_heamoglobin_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_lipid_profile_test`
--
ALTER TABLE `setup_lipid_profile_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setup_renal_function_test`
--
ALTER TABLE `setup_renal_function_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `test_categories`
--
ALTER TABLE `test_categories`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `test_panels`
--
ALTER TABLE `test_panels`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `typhoid_test`
--
ALTER TABLE `typhoid_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
