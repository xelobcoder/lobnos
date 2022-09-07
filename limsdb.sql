-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 07, 2022 at 09:09 AM
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
(40, 1662205464496, 200, 230, 0, '2022-09-03 12:46:12.139658', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 30),
(41, 1662246656975, 60, 150, 0, '2022-09-04 00:12:36.736890', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 90),
(42, 1661981290945, 194, 194, 0, '2022-09-04 01:13:10.839835', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(43, 1662205464496, 300, 299, 0, '2022-09-04 09:09:11.519969', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', -1);

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
(27, 1661981290945, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 595955858, 'years', 'leonides', 'Nursing', '2022-08-31', 'TRUE'),
(28, 1661981662803, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-06-06', 27, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 595999999, 'years', 'leonides', 'Nursing', '2022-08-31', 'TRUE'),
(29, 1662205464496, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'single', '+233249434803', 'tiifu hamza', 'brother', 595964456, 'years', 'leonides', 'Nursing', '2022-09-03', 'TRUE'),
(30, 1662246656975, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1920-11-06', 2001, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 555758588, 'years', 'leonides', 'Nursing', '2022-09-04', 'TRUE'),
(31, 1662518768986, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'single', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555889889, 'years', 'leonides', 'tiifu hamz', '2022-09-07', 'FALSE'),
(32, 1662519039030, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1994-06-06', 28, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 857888888, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(33, 1662519327031, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555478587, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(34, 1662519445218, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1954-11-06', 67, 'male', 'leonides', 'Dr Paul Sinister', 'Refered', NULL, 'married', '0595964565', 'Tiifu Hamza Kojo Boronson', 'brother', 0, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(35, 1662520063696, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1905-05-05', 117, 'other', '', '', 'Direct', NULL, 'married', '0595964565', 'Tiifu Hamza Kojo Boronson', 'brother', 2147483647, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(36, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(37, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(38, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(39, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(40, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(41, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(42, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(43, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(44, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(45, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(46, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(47, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(48, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(49, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(50, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(51, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(52, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(53, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(54, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(55, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(56, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(57, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(58, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(59, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(60, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(61, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(62, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(63, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(64, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(65, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(66, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(67, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(68, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(69, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(70, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(71, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(72, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(73, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(74, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(75, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(76, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(77, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(78, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(79, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(80, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(81, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(82, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(83, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(84, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(85, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(86, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(87, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(88, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(89, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(90, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(91, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(92, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(93, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(94, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(95, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(96, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(97, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(98, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(99, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(100, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(101, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(102, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(103, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(104, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(105, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(106, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(107, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(108, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(109, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(110, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(111, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(112, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(113, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(114, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(115, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(116, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(117, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(118, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(119, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(120, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(121, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(122, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(123, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(124, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(125, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(126, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(127, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(128, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(129, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(130, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(131, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(132, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(133, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(134, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(135, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(136, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(137, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(138, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(139, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(140, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(141, 1662520159050, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', 'brother', 585784778, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(142, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(143, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(144, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(145, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(146, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(147, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(148, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(149, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(150, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(151, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(152, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(153, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(154, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(155, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(156, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(157, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(158, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(159, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(160, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(161, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(162, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(163, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(164, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(165, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(166, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(167, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(168, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(169, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(170, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(171, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(172, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(173, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(174, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(175, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(176, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(177, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(178, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(179, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(180, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(181, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(182, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(183, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(184, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(185, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(186, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(187, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(188, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(189, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(190, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(191, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(192, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(193, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(194, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(195, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(196, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(197, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(198, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(199, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(200, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(201, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(202, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(203, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(204, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(205, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(206, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(207, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(208, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(209, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(210, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(211, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(212, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(213, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(214, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(215, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(216, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(217, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(218, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(219, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(220, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(221, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(222, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(223, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(224, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(225, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(226, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(227, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE');
INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FULLNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `ORGANIZATION`, `CLINICIAN`, `PATIENTTYPE`, `LOCATION`, `MARITAL_STATUS`, `EMMERGENCY_CONTACT`, `EMMERGENCY_CONTACT_NAME`, `RELATIONSHIP`, `MOBILE_NUMBER`, `AGETYPE`, `PATIENTORGANIZATION`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`) VALUES
(228, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(229, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(230, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(231, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(232, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(233, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(234, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(235, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(236, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(237, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(238, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(239, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(240, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(241, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(242, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(243, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(244, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(245, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(246, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(247, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(248, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(249, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(250, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(251, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(252, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(253, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(254, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(255, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(256, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(257, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(258, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(259, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(260, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(261, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(262, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(263, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(264, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(265, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(266, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(267, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(268, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(269, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(270, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(271, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(272, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(273, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(274, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(275, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(276, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(277, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(278, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(279, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(280, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(281, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(282, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(283, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(284, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(285, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(286, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(287, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(288, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(289, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(290, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(291, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(292, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(293, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(294, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(295, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(296, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(297, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(298, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(299, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(300, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(301, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(302, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(303, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(304, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(305, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(306, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(307, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(308, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(309, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(310, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(311, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(312, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(313, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(314, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(315, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(316, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(317, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(318, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(319, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(320, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(321, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(322, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(323, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(324, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(325, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(326, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(327, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(328, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(329, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(330, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(331, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(332, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(333, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(334, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(335, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(336, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(337, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(338, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(339, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(340, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(341, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(342, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(343, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(344, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(345, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(346, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(347, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(348, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(349, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(350, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(351, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(352, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(353, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(354, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(355, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(356, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(357, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(358, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(359, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(360, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(361, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(362, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(363, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(364, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(365, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(366, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(367, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(368, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(369, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(370, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(371, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(372, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(373, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(374, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(375, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(376, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(377, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(378, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(379, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(380, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(381, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(382, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(383, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(384, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(385, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(386, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(387, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(388, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(389, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(390, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(391, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(392, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(393, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(394, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(395, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(396, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(397, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(398, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(399, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(400, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(401, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(402, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(403, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(404, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(405, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(406, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(407, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(408, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(409, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(410, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(411, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(412, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(413, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(414, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(415, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(416, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(417, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(418, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(419, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(420, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(421, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(422, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(423, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(424, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(425, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(426, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(427, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(428, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(429, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(430, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(431, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(432, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(433, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE');
INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FULLNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `ORGANIZATION`, `CLINICIAN`, `PATIENTTYPE`, `LOCATION`, `MARITAL_STATUS`, `EMMERGENCY_CONTACT`, `EMMERGENCY_CONTACT_NAME`, `RELATIONSHIP`, `MOBILE_NUMBER`, `AGETYPE`, `PATIENTORGANIZATION`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`) VALUES
(434, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(435, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(436, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(437, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(438, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(439, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(440, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(441, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(442, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(443, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(444, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(445, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(446, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(447, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(448, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(449, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(450, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(451, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(452, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(453, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(454, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(455, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(456, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(457, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(458, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(459, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(460, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(461, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(462, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(463, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(464, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(465, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(466, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(467, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(468, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(469, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(470, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(471, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(472, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(473, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(474, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(475, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(476, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(477, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(478, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(479, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(480, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(481, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(482, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(483, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(484, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(485, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(486, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(487, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(488, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(489, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(490, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(491, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(492, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(493, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(494, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(495, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(496, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(497, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(498, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(499, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(500, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(501, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(502, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(503, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(504, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(505, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(506, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(507, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(508, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(509, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(510, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(511, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(512, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(513, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(514, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(515, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(516, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(517, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(518, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(519, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(520, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(521, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(522, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(523, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(524, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(525, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(526, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(527, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(528, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(529, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(530, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(531, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(532, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(533, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(534, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(535, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(536, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(537, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(538, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(539, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(540, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(541, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(542, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(543, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(544, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(545, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(546, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(547, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(548, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(549, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(550, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(551, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(552, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(553, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(554, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(555, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(556, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(557, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(558, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(559, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(560, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(561, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(562, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(563, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(564, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(565, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(566, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(567, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(568, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(569, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(570, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(571, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(572, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(573, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(574, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(575, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(576, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(577, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(578, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(579, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(580, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(581, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(582, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(583, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(584, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(585, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(586, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(587, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(588, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(589, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(590, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(591, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(592, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(593, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(594, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(595, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(596, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(597, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(598, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(599, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(600, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(601, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(602, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(603, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(604, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(605, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(606, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(607, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(608, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(609, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(610, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(611, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(612, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(613, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(614, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(615, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(616, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(617, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(618, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(619, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(620, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(621, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(622, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(623, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(624, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(625, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(626, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(627, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(628, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(629, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(630, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(631, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(632, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(633, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(634, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(635, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(636, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(637, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(638, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(639, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE');
INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FULLNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `ORGANIZATION`, `CLINICIAN`, `PATIENTTYPE`, `LOCATION`, `MARITAL_STATUS`, `EMMERGENCY_CONTACT`, `EMMERGENCY_CONTACT_NAME`, `RELATIONSHIP`, `MOBILE_NUMBER`, `AGETYPE`, `PATIENTORGANIZATION`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`) VALUES
(640, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(641, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(642, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(643, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(644, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(645, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(646, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(647, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(648, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(649, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(650, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(651, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(652, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(653, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(654, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(655, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(656, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(657, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(658, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(659, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(660, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(661, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(662, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(663, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(664, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(665, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(666, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(667, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(668, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(669, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(670, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(671, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(672, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(673, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(674, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(675, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(676, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(677, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(678, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(679, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(680, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(681, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(682, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(683, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(684, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(685, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(686, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(687, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(688, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(689, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(690, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(691, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(692, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(693, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(694, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(695, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(696, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(697, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(698, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(699, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(700, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(701, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(702, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(703, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(704, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(705, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(706, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(707, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(708, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(709, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(710, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(711, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(712, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(713, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(714, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(715, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(716, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(717, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(718, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(719, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(720, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(721, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(722, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(723, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(724, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(725, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(726, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(727, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(728, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(729, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(730, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(731, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(732, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(733, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(734, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(735, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(736, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(737, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(738, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(739, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(740, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(741, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(742, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(743, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(744, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(745, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(746, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(747, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(748, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(749, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(750, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(751, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(752, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(753, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(754, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(755, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(756, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(757, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(758, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(759, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(760, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(761, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(762, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(763, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(764, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(765, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(766, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(767, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(768, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(769, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(770, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(771, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(772, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(773, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(774, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(775, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(776, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(777, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(778, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(779, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(780, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(781, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(782, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(783, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(784, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(785, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(786, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(787, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(788, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(789, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(790, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(791, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(792, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(793, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(794, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(795, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(796, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(797, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(798, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(799, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(800, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(801, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(802, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(803, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(804, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(805, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(806, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(807, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(808, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(809, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(810, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(811, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(812, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(813, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(814, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(815, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(816, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(817, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(818, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(819, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(820, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(821, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(822, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(823, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(824, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(825, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(826, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(827, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(828, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(829, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(830, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(831, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(832, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(833, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(834, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(835, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(836, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(837, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(838, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(839, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(840, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(841, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(842, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(843, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(844, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(845, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE');
INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FULLNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `ORGANIZATION`, `CLINICIAN`, `PATIENTTYPE`, `LOCATION`, `MARITAL_STATUS`, `EMMERGENCY_CONTACT`, `EMMERGENCY_CONTACT_NAME`, `RELATIONSHIP`, `MOBILE_NUMBER`, `AGETYPE`, `PATIENTORGANIZATION`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`) VALUES
(846, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(847, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(848, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(849, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(850, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(851, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(852, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(853, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(854, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(855, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(856, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(857, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(858, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(859, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(860, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(861, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(862, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(863, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(864, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(865, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(866, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(867, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(868, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(869, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(870, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(871, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(872, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(873, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(874, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(875, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(876, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(877, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(878, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(879, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(880, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(881, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(882, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(883, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(884, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(885, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(886, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(887, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(888, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(889, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(890, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(891, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(892, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(893, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(894, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(895, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(896, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(897, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(898, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(899, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(900, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(901, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(902, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(903, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(904, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(905, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(906, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(907, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(908, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(909, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(910, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(911, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(912, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(913, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(914, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(915, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(916, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(917, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(918, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(919, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(920, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(921, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(922, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(923, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(924, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(925, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(926, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(927, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(928, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(929, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(930, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(931, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(932, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(933, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(934, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(935, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(936, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(937, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(938, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(939, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(940, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(941, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(942, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(943, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(944, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(945, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(946, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(947, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(948, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(949, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(950, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(951, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(952, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(953, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(954, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(955, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(956, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(957, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(958, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(959, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(960, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(961, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(962, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(963, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(964, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(965, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(966, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(967, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(968, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(969, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(970, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(971, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(972, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(973, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(974, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(975, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(976, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(977, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(978, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(979, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(980, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(981, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(982, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(983, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(984, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(985, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(986, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(987, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(988, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(989, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(990, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(991, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(992, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(993, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(994, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(995, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(996, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(997, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(998, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(999, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1000, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1001, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1002, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1003, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1004, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1005, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1006, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1007, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1008, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1009, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1010, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1011, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1012, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1013, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1014, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1015, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1016, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1017, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1018, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1019, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1020, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1021, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1022, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1023, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1024, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1025, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1026, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1027, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1028, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1029, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1030, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1031, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1032, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1033, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1034, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1035, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1036, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1037, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1038, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1039, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1040, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1041, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1042, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1043, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1044, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1045, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1046, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1047, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1048, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1049, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1050, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE');
INSERT INTO `new_patients` (`ID`, `PATIENTID`, `FULLNAME`, `EMAIL`, `DOB`, `AGE`, `GENDER`, `ORGANIZATION`, `CLINICIAN`, `PATIENTTYPE`, `LOCATION`, `MARITAL_STATUS`, `EMMERGENCY_CONTACT`, `EMMERGENCY_CONTACT_NAME`, `RELATIONSHIP`, `MOBILE_NUMBER`, `AGETYPE`, `PATIENTORGANIZATION`, `OCCUPATION`, `DATE`, `ACTIVATION_STATUS`) VALUES
(1051, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1052, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1053, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1054, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1055, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1056, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1057, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1058, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1059, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1060, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1061, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1062, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1063, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1064, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1065, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1066, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1067, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1068, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1069, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1070, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1071, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1072, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1073, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1074, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1075, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1076, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1077, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1078, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1079, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1080, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1081, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1082, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1083, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1084, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1085, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1086, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1087, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1088, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1089, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1090, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1091, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1092, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1093, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1094, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1095, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1096, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1097, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1098, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1099, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1100, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1101, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1102, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1103, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1104, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1105, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1106, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1107, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1108, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1109, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1110, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1111, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1112, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1113, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1114, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1115, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1116, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1117, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1118, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1119, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1120, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1121, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1122, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1123, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1124, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1125, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1126, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1127, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1128, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1129, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1130, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1131, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1132, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1133, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1134, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1135, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1136, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1137, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1138, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1139, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1140, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1141, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1142, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1143, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1144, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1145, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1146, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1147, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1148, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1149, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1150, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1151, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1152, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1153, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1154, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1155, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1156, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1157, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1158, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1159, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1160, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1161, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1162, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1163, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1164, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1165, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1166, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1167, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1168, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1169, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1170, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1171, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1172, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1173, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1174, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1175, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1176, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1177, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1178, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1179, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1180, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1181, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1182, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1183, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1184, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1185, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1186, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1187, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1188, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(1189, 1662520488612, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555644544, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE');

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
  `INSPECTOR` varchar(255) DEFAULT NULL,
  `INSPECTION_TIME` datetime(6) DEFAULT NULL,
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

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `TEST`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `SAMPLE_STATUS`, `INSPECTOR`, `INSPECTION_TIME`, `PHELOBOTOMY_STATUS`, `SAMPLE_TAKEN_BY`, `TIME_PHELOBOTOMY_COMPLETED`, `ALL_SAMPLE_TAKEN`, `MESSAGE`, `TIME`) VALUES
(18, '1661283584733', 'glycated heamoglobin,Liver Function Test,Renal Function Test', '2022-08-23', 'moderate', 24, 'SDA', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-04 18:14:32.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000'),
(19, '1661284152435', 'glycated heamoglobin', '2022-08-26', 'moderate', 25, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:44:19.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000'),
(20, '1661283584733', 'glycated heamoglobin,Liver Function Test', '2022-08-26', 'moderate', 26, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:45.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000'),
(21, '1661366472111', 'glycated heamoglobin,Renal Function Test', '2022-08-24', 'moderate', 27, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:53.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:42:16.000000'),
(22, '1661367829337', 'glycated heamoglobin,Renal Function Test,Lipid Profile', '2022-08-24', 'none', 28, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:27.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '20:04:52.000000'),
(23, '1661405222266', 'glycated heamoglobin,Renal Function Test,Liver Function Test,Lipid Profile', '2022-08-25', 'moderate', 29, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:48.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '06:28:43.000000'),
(24, '1661429826854', 'Liver Function Test,glycated heamoglobin,Lipid Profile', '2022-08-25', 'moderate', 30, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:51.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '13:18:17.000000'),
(25, '1661780714543', 'Lipid Profile,Renal Function Test,Liver Function Test', '2022-08-29', 'moderate', 31, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:31:09.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '14:47:12.000000'),
(26, '1661979176713', 'glycated heamoglobin,Lipid Profile,Liver Function Test', '2022-08-31', 'moderate', 32, 'SDA', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:00:17.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '21:54:04.000000'),
(27, '1661979176713', 'glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson,Lipid Profile', '2022-08-31', 'moderate', 33, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:31:08.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '21:57:42.000000'),
(28, '1661981290945', 'glycated heamoglobin,Lipid Profile', '2022-08-31', 'moderate', 34, 'SDA', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:29:17.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:29:00.000000'),
(29, '1661981662803', 'glycated heamoglobin,Liver Function Test', '2022-08-31', 'moderate', 35, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 17:59:27.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:35:34.000000'),
(30, '1661979176713', 'glycated heamoglobin,Renal Function Test,Lipid Profile', '2022-08-31', 'emmergency', 36, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-07 02:51:15.000000', 'QUEUE', NULL, NULL, 'FALSE', 'sample comtamina', '22:38:20.000000'),
(31, '1661447639214', 'glycated heamoglobin', '2022-08-31', 'emmergency', 37, 'SDA', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:34:50.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:39:53.000000'),
(32, '1661981662803', 'glycated heamoglobin,Lipid Profile,Renal Function Test', '2022-09-03', 'none', 38, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 17:58:29.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '00:20:57.000000'),
(33, '1661981662803', 'Renal Function Test,Liver Function Test', '2022-09-03', 'emmergency', 39, 'SDA', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:33:34.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '00:28:55.000000'),
(34, '1662205464496', 'glycated heamoglobin,Lipid Profile,Renal Function Test', '2022-09-03', 'moderate', 40, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:19:15.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '12:46:12.000000'),
(35, '1662246656975', 'glycated heamoglobin,Liver Function Test', '2022-09-04', 'emmergency', 41, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-07 03:39:17.000000', 'QUEUE', NULL, NULL, 'FALSE', 'sample insufficient to carry out test', '00:12:36.000000'),
(36, '1661981290945', 'Liver Function Test,glycated heamoglobin,Tiifu Hamza Kojo Boronson', '2022-09-04', 'moderate', 42, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-07 02:47:44.000000', 'QUEUE', NULL, NULL, 'FALSE', 'Insufficient sample collected', '01:13:10.000000'),
(37, '1662205464496', 'calcium,glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson,Renal Function Test', '2022-09-04', 'moderate', 43, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-07 02:47:26.000000', 'QUEUE', NULL, NULL, 'FALSE', 'hgtg', '09:09:11.000000');

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
(8, 'Tiifu Hamza Kojo Boronson', 'chemistry', 44, '2022-08-30 00:27:07'),
(9, 'calcium', 'chemistry', 25, '2022-09-04 00:39:41');

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
  MODIFY `BILLINGID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

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
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1190;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

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
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `typhoid_test`
--
ALTER TABLE `typhoid_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
