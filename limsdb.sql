-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2022 at 02:43 PM
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
(43, 1662205464496, 300, 299, 0, '2022-09-04 09:09:11.519969', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', -1),
(44, 1662520159050, 90, 90, 0, '2022-09-07 20:15:01.545303', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(45, 1662520159050, 10, 10, 0, '2022-09-07 22:08:50.902795', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(46, 1662520159050, 0, 169, 0, '2022-09-08 05:50:53.857603', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'POSTPAID', 169),
(47, 1662520159050, 60, 90, 0, '2022-09-08 07:02:21.490515', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 10),
(48, 1662520488612, 0, 150, 0, '2022-09-08 07:04:33.581187', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'POSTPAID', 150),
(49, 1662520063696, 0, 80, 0, '2022-09-08 07:06:51.845510', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 80),
(50, 1661366472111, 230, 230, 0, '2022-09-08 07:20:25.179447', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(51, 1662702760083, 240, 240, 0, '2022-09-09 06:54:32.194427', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(52, 1662702760083, 600, 184, 0, '2022-09-15 05:04:01.100054', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', -416),
(53, 1664019163410, 0, 180, 0, '2022-09-24 12:36:22.429588', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'POSTPAID', 180),
(54, 1664019163410, 100, 160, 0, '2022-09-24 15:09:32.915063', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(55, 1661366472111, 60, 80, 0, '2022-09-26 13:34:03.688880', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 10),
(56, 1664269123910, 160, 175, 0, '2022-09-27 10:03:25.219985', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', 5),
(57, 1664269123910, 68, 80, 0, '2022-09-29 23:03:35.442165', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 2),
(58, 1664489273276, 80, 80, 0, '2022-09-29 23:08:50.227139', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', -10),
(59, 1664489273276, 145, 150, 0, '2022-09-30 13:38:07.845844', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 5),
(60, 1664489273276, 160, 165, 0, '2022-09-30 19:42:45.865752', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(61, 1664489273276, 80, 95, 0, '2022-09-30 19:46:11.420227', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 15),
(62, 1662518768986, 105, 105, 0, '2022-09-30 22:06:03.260313', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(63, 1664650608607, 160, 175, 0, '2022-10-01 20:06:36.673888', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 0, 'PREPAID', 15),
(64, 1664650608607, 4000, 4585, 0, '2022-10-02 21:01:23.626769', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 585),
(65, 1664650608607, 4, 60, 0, '2022-10-20 09:01:00.090192', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 56);

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
  `BRANCHID` int(255) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`BRANCHID`, `NAME`, `DATE`) VALUES
(2, 'Seventh Day Adventist Hospital', '2022-08-21'),
(9, 'buipe old hospital ', '2022-09-29'),
(17, 'central hospital', '2022-09-30'),
(18, 'YEDI BUS STOP', '2022-09-30');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `BRANCHID` int(20) NOT NULL,
  `BRANCHNAME` varchar(255) NOT NULL,
  `DATE` date NOT NULL DEFAULT current_timestamp(),
  `TIME` time(6) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
(20, 1661366472111, 'TIIFU HAMZA', 'hamzatiifu45@gmail.com', '1991-11-11', 30, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2022-08-24', 'TRUE'),
(21, 1661367829337, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1954-06-06', 68, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595999999, 'years', 'leonides', 'nursing', '2022-08-24', 'FALSE'),
(22, 1661405222266, 'dr flover agbdifs', 'hamzatiifu45@gmail.com', '1111-11-11', 910, 'male', 'leonides', 'Dr Paul Sinister', 'Refered', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'self', 595964565, 'years', 'leonides', 'Nursing', '2022-08-25', 'FALSE'),
(23, 1661429826854, 'TIIFU HAMZA', 'hamzatiifu45@gmail.com', '2022-06-11', 2, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595964656, 'months', 'leonides', 'nursing', '2022-08-25', 'FALSE'),
(24, 1661447639214, 'tiifu xelov vlidmir zonesjey', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'TIIFU HAMZA', 'brother', 595964565, 'years', 'leonides', 'nursing', '2022-08-25', 'FALSE'),
(25, 1661780714543, 'Ntontonkasari Ibrahim', 'ibrahim474@gmail.com', '2012-06-11', 10, 'male', '', '', 'Direct', NULL, 'married', '0595964565', 'Tiifu Hamza Kojo Boronson', 'brother', 594654885, 'years', 'leonides', 'Mason', '2022-08-29', 'TRUE'),
(26, 1661979176713, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'single', '0595964565', 'Tiifu Hamza Kojo Boronson', 'brother', 555555555, 'years', 'leonides', 'Nursing', '2022-08-31', 'FALSE'),
(27, 1661981290945, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 595955858, 'years', 'leonides', 'Nursing', '2022-08-31', 'FALSE'),
(28, 1661981662803, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-06-06', 27, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 595999999, 'years', 'leonides', 'Nursing', '2022-08-31', 'FALSE'),
(29, 1662205464496, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'single', '+233249434803', 'tiifu hamza', 'brother', 595964456, 'years', 'leonides', 'Nursing', '2022-09-03', 'FALSE'),
(30, 1662246656975, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1920-11-06', 2001, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 555758588, 'years', 'leonides', 'Nursing', '2022-09-04', 'FALSE'),
(31, 1662518768986, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'single', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555889889, 'years', 'leonides', 'tiifu hamz', '2022-09-07', 'TRUE'),
(32, 1662519039030, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1994-06-06', 28, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 857888888, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(33, 1662519327031, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 555478587, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(34, 1662519445218, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1954-11-06', 67, 'male', 'leonides', 'Dr Paul Sinister', 'Refered', NULL, 'married', '0595964565', 'Tiifu Hamza Kojo Boronson', 'brother', 0, 'years', 'leonides', 'Nursing', '2022-09-07', 'FALSE'),
(35, 1662520063696, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1905-05-05', 117, 'other', '', '', 'Direct', NULL, 'married', '0595964565', 'Tiifu Hamza Kojo Boronson', 'brother', 2147483647, 'years', 'leonides', 'Nursing', '2022-09-07', 'TRUE'),
(1190, 1662702760083, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'TIIFU HAMZA', 'brother', 599454454, 'years', 'leonides', 'nursing ', '2022-09-09', 'FALSE'),
(1191, 1664019163410, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'female', '', '', 'Direct', NULL, 'single', '0595964565', 'Nyaaba Vitus', 'brother', 543085842, 'years', 'bimbilla district hospital', 'Nursing', '2022-09-24', 'FALSE'),
(1192, 1664269123910, 'Nyaaba Asana Awineyila', 'hamzatiifu45@gmail.com', '1994-11-06', 27, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'TIIFU HAMZA', 'brother', 543085842, 'years', 'leonides', 'Nursing', '2022-09-27', 'FALSE'),
(1193, 1664489273276, 'TIIFU HAMZA', 'tiifuofficial@gmail.com', '1994-11-06', 27, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'TIIFU HAMZA', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2022-09-29', 'FALSE'),
(1194, 1664650608607, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1992-11-06', 29, 'male', 'leonides', 'Dr Paul Sinister', 'Refered', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2022-10-01', 'TRUE');

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
  `TIME` time(6) NOT NULL DEFAULT current_timestamp(),
  `PHELOBOTOMY_MESSAGE` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `performing_test`
--

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `TEST`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `SAMPLE_STATUS`, `INSPECTOR`, `INSPECTION_TIME`, `PHELOBOTOMY_STATUS`, `SAMPLE_TAKEN_BY`, `TIME_PHELOBOTOMY_COMPLETED`, `ALL_SAMPLE_TAKEN`, `MESSAGE`, `TIME`, `PHELOBOTOMY_MESSAGE`) VALUES
(18, '1661283584733', 'glycated heamoglobin,Liver Function Test,Renal Function Test', '2022-08-23', 'moderate', 24, 'SDA', 'REJECTED', 'Dr Tiifu Hamza', '2022-12-30 18:14:32.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000', ''),
(19, '1661284152435', 'glycated heamoglobin', '2022-08-26', 'moderate', 25, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:44:19.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000', ''),
(20, '1661283584733', 'glycated heamoglobin,Liver Function Test', '2022-08-26', 'moderate', 26, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:45.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:40:58.000000', ''),
(21, '1661366472111', 'glycated heamoglobin,Renal Function Test', '2022-08-24', 'moderate', 27, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:53.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '19:42:16.000000', ''),
(22, '1661367829337', 'glycated heamoglobin,Renal Function Test,Lipid Profile', '2022-08-24', 'none', 28, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:27.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '20:04:52.000000', ''),
(23, '1661405222266', 'glycated heamoglobin,Renal Function Test,Liver Function Test,Lipid Profile', '2022-08-25', 'moderate', 29, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:48.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '06:28:43.000000', ''),
(24, '1661429826854', 'Liver Function Test,glycated heamoglobin,Lipid Profile', '2022-08-25', 'moderate', 30, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:48:51.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '13:18:17.000000', ''),
(25, '1661780714543', 'Lipid Profile,Renal Function Test,Liver Function Test', '2022-08-29', 'moderate', 31, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-24 12:40:59.000000', 'QUEUE', NULL, NULL, 'FALSE', 'still thinking ', '14:47:12.000000', ''),
(26, '1661979176713', 'glycated heamoglobin,Lipid Profile,Liver Function Test', '2022-08-31', 'moderate', 32, 'SDA', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:00:17.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '21:54:04.000000', ''),
(27, '1661979176713', 'glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson,Lipid Profile', '2022-08-31', 'moderate', 33, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:31:08.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '21:57:42.000000', ''),
(28, '1661981290945', 'glycated heamoglobin,Lipid Profile', '2022-08-31', 'moderate', 34, 'SDA', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:29:17.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:29:00.000000', ''),
(29, '1661981662803', 'glycated heamoglobin,Liver Function Test', '2022-08-31', 'moderate', 35, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 17:59:27.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:35:34.000000', ''),
(30, '1661979176713', 'glycated heamoglobin,Renal Function Test,Lipid Profile', '2022-08-31', 'emmergency', 36, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-07 02:51:15.000000', 'QUEUE', NULL, NULL, 'FALSE', 'sample comtamina', '22:38:20.000000', ''),
(31, '1661447639214', 'glycated heamoglobin', '2022-08-31', 'emmergency', 37, 'SDA', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:34:50.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:39:53.000000', ''),
(32, '1661981662803', 'glycated heamoglobin,Lipid Profile,Renal Function Test', '2022-09-03', 'none', 38, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 17:58:29.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '00:20:57.000000', ''),
(33, '1661981662803', 'Renal Function Test,Liver Function Test', '2022-09-03', 'emmergency', 39, 'SDA', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-05 22:33:34.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '00:28:55.000000', ''),
(34, '1662205464496', 'glycated heamoglobin,Lipid Profile,Renal Function Test', '2022-09-03', 'moderate', 40, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-04 18:19:15.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '12:46:12.000000', ''),
(35, '1662246656975', 'glycated heamoglobin,Liver Function Test', '2022-09-04', 'emmergency', 41, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-07 03:39:17.000000', 'QUEUE', NULL, NULL, 'FALSE', 'sample insufficient to carry out test', '00:12:36.000000', ''),
(36, '1661981290945', 'Liver Function Test,glycated heamoglobin,Tiifu Hamza Kojo Boronson', '2022-09-04', 'moderate', 42, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-07 02:47:44.000000', 'QUEUE', NULL, NULL, 'FALSE', 'Insufficient sample collected', '01:13:10.000000', ''),
(37, '1662205464496', 'calcium,glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson,Renal Function Test', '2022-09-04', 'moderate', 43, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-07 22:09:45.000000', 'QUEUE', NULL, NULL, 'FALSE', 'hgtg', '09:09:11.000000', ''),
(38, '1662520159050', 'glycated heamoglobin', '2022-09-07', 'emmergency', 44, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '20:15:01.000000', ''),
(39, '1662520159050', 'malaria', '2022-09-07', 'none', 45, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '22:08:50.000000', ''),
(40, '1662520159050', 'glycated heamoglobin,calcium,malaria,Tiifu Hamza Kojo Boronson', '2022-09-08', 'emmergency', 46, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '05:50:53.000000', ''),
(41, '1662520159050', 'glycated heamoglobin', '2022-09-08', 'moderate', 47, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '07:02:21.000000', ''),
(42, '1662520488612', 'glycated heamoglobin,Liver Function Test', '2022-09-08', 'moderate', 48, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '07:04:33.000000', ''),
(43, '1662520063696', 'Renal Function Test', '2022-09-08', 'emmergency', 49, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '07:06:51.000000', ''),
(44, '1661366472111', 'glycated heamoglobin,Renal Function Test,Liver Function Test', '2022-09-08', 'moderate', 50, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '07:20:25.000000', ''),
(45, '1662702760083', 'malaria,glycated heamoglobin,Lipid Profile,Renal Function Test', '2022-09-09', 'moderate', 51, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-09 09:09:30.000000', 'QUEUE', NULL, NULL, 'FALSE', 'The sample collected heamocrit is poor \nThe millimeters collected is inadequate \n5 mls or more required', '06:54:32.000000', ''),
(46, '1662702760083', 'Renal Function Test,Liver Function Test,Tiifu Hamza Kojo Boronson', '2022-09-15', 'moderate', 52, 'CENTRAL', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-15 05:08:12.000000', 'QUEUE', NULL, NULL, 'FALSE', 'Expired gell tubes used in sample collection', '05:04:01.000000', ''),
(47, '1664019163410', 'glycated heamoglobin,Renal Function Test,malaria', '2022-09-24', 'none', 53, 'CENTRAL', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-09-29 23:09:50.000000', 'QUEUE', NULL, NULL, 'FALSE', 'hello thank you', '12:36:22.000000', ''),
(48, '1664019163410', 'full blood count,widal,Liver Function Test,Lipid Profile', '2022-09-24', 'moderate', 54, '', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '15:09:32.000000', ''),
(49, '1661366472111', 'Renal Function Test', '2022-09-26', 'none', 55, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '13:34:03.000000', ''),
(50, '1664269123910', 'glycated heamoglobin,Liver Function Test,calcium', '2022-09-27', 'moderate', 56, 'CENTRAL', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '10:03:25.000000', ''),
(51, '1664269123910', 'Renal Function Test', '2022-09-29', 'emmergency', 57, 'kpakpayili', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '23:03:35.000000', ''),
(52, '1664489273276', 'Renal Function Test', '2022-09-29', 'emmergency', 58, 'kpakpayili', 'PENDING', NULL, NULL, 'QUEUE', NULL, NULL, 'FALSE', NULL, '23:08:50.000000', ''),
(53, '1664489273276', 'glycated heamoglobin,Liver Function Test', '2022-09-30', 'moderate', 59, 'Tommorow ', 'PENDING', NULL, NULL, 'INCOMPLETE', NULL, NULL, 'FALSE', NULL, '13:38:07.000000', 'Not enough sample tube'),
(54, '1664489273276', 'Liver Function Test,full blood count,Renal Function Test', '2022-09-30', 'moderate', 60, 'buipe old hospital ', 'PENDING', NULL, NULL, 'DONE', NULL, NULL, 'FALSE', NULL, '19:42:45.000000', 'null'),
(55, '1664489273276', 'Renal Function Test,widal', '2022-09-30', 'moderate', 61, 'buipe old hospital ', 'PENDING', NULL, NULL, 'INCOMPLETE', NULL, NULL, 'FALSE', NULL, '19:46:11.000000', 'Absconded Patient'),
(56, '1662518768986', 'Renal Function Test,calcium', '2022-09-30', 'emmergency', 62, 'buipe old hospital ', 'REJECTED', 'Dr Tiifu Hamza', '2022-09-30 22:29:55.000000', 'DONE', NULL, '2022-09-30', 'TRUE', 'Wrong client sanoke', '22:06:03.000000', 'null'),
(57, '1664650608607', 'Lipid Profile,glycated heamoglobin,full blood count', '2022-10-01', 'moderate', 63, 'YEDI BUS STOP', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-10-20 08:59:24.000000', 'INCOMPLETE', NULL, '2022-10-01', 'FALSE', 'dfrtetytt', '20:06:36.000000', 'no test tube for full blood count'),
(58, '1664650608607', 'Renal Function Test,malaria,Liver Function Test,Tiifu Hamza Kojo', '2022-10-02', 'moderate', 64, 'buipe old hospital ', 'REJECTED', 'Dr Tiifu Hamza', '2022-10-20 08:59:20.000000', 'QUEUE', NULL, NULL, 'FALSE', 'sample is pretty hemonloxw', '21:01:23.000000', ''),
(59, '1664650608607', 'Liver Function Test', '2022-10-20', 'none', 65, 'Seventh Day Adventist Hospital', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-10-21 02:09:03.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '09:01:00.000000', '');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `ROLEID` int(255) NOT NULL,
  `FULLNAME` varchar(100) NOT NULL,
  `USERNAME` varchar(255) NOT NULL,
  `ROLE` varchar(255) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  `DATE_CREATED` date NOT NULL DEFAULT current_timestamp(),
  `TIME` time(6) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`ROLEID`, `FULLNAME`, `USERNAME`, `ROLE`, `PASSWORD`, `DATE_CREATED`, `TIME`) VALUES
(6, 'ewffa', 'dgadf', ' sales attendant', '#Fe+sfK2uO', '2022-10-15', '12:34:24.000000'),
(8, 'Tiifu hamza', 'efjoefqefj', 'sales attendant', '8p%ovoJBU6', '2022-10-15', '12:35:47.000000'),
(9, 'Tiifu Hamza Kojo', 'jij', 'lab scientist', 'R3I4peKsF9', '2022-10-15', '12:48:27.000000'),
(10, 'Tiifu Hamza Kojo', 'juju is ankfdgkdqq', 'laboratory manager', 'R3I4peKsF9', '2022-10-15', '12:53:04.000000'),
(11, 'Tiifu Hamza Kojo', '445454', 'laboratory manager', 'c/JCsBO%E6', '2022-10-17', '09:25:27.000000'),
(13, 'Tiifu Hamza', 'TiifuH', 'sales attendant', 'nakqP(wuqU', '2022-10-20', '09:10:53.000000'),
(14, 'Tiifu Hamza', 'TiifuH', 'sales attendant', 'nakqP(wuqU', '2022-10-20', '09:10:56.000000'),
(15, 'Tiifu Hamza K', 'jij', 'lab scientist', 'R3I4peKsF9', '2022-10-22', '03:14:12.000000');

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
(9, 'calcium', 'chemistry', 25, '2022-09-04 00:39:41'),
(10, 'malaria', 'Haematology', 10, '2022-09-07 22:06:42'),
(11, 'widal', 'Haematology', 15, '2022-09-24 15:08:23'),
(12, 'full blood count', 'chemistry', 25, '2022-09-24 15:08:49'),
(13, 'Tiifu Hamza Kojo', 'Haematology', 4435, '2022-09-29 23:31:00');

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
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`ROLEID`);

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
  MODIFY `BILLINGID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `BRANCHID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

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
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1195;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `ROLEID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `typhoid_test`
--
ALTER TABLE `typhoid_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
