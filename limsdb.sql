-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 19, 2023 at 10:43 AM
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
  `PAYMENT_MODE` varchar(255) NOT NULL,
  `TYPE` varchar(255) NOT NULL DEFAULT 'PREPAID',
  `OUTSTANDING` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `billing`
--

INSERT INTO `billing` (`BILLINGID`, `PATIENTID`, `PAID_AMOUNT`, `PAYABLE`, `DISCOUNT`, `CREATED_ON`, `UPDATED`, `ORGANIZATION`, `CLINICIAN`, `PAYMENT_MODE`, `TYPE`, `OUTSTANDING`) VALUES
(74, 1668249224106, 200, 254, 0, '2022-11-12 10:34:46.344410', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Cash', 'PREPAID', 0),
(75, 1668249224106, 0, 90, 0, '2022-11-12 10:36:30.023675', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'invoice', 'POSTPAID', 90),
(76, 1668249224106, 0, 44, 0, '2022-11-13 07:13:33.997395', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 'Cheque', 'PREPAID', 44),
(77, 1668249224106, 60, 90, 0, '2022-11-13 23:19:03.021685', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Cash', 'PREPAID', 10),
(78, 1668249224106, 60, 184, 0, '2022-11-13 23:22:51.096346', '0000-00-00', 'John', 'Dr Paul Sinister', 'Cash', 'PREPAID', 104),
(79, 1668249224106, 130, 130, 20, '2022-11-13 23:27:59.065237', '0000-00-00', 'John', 'Dr Paul Sinister', 'Cash', 'PREPAID', -20),
(80, 1668249224106, 150, 150, 50, '2022-11-14 13:32:31.118373', '0000-00-00', 'John', 'Dr Paul Sinister', 'Bank Transfer', 'PREPAID', -50),
(81, 1668249224106, 4844, 4844, 0, '2022-11-25 14:44:11.913684', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Mobile Money', 'PREPAID', 0),
(82, 1672381810274, 4090, 4629, 600, '2022-12-30 06:32:23.638682', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 'Cash', 'PREPAID', -61),
(83, 1672381810274, 194, 194, 0, '2023-01-22 08:50:47.797459', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Cash', 'PREPAID', 0),
(84, 1672381810274, 250, 299, 44, '2023-02-15 18:00:02.236884', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Bank Transfer', 'PREPAID', 5),
(85, 1676486804597, 80, 90, 0, '2023-02-15 18:48:42.757202', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Cash', 'PREPAID', 10),
(86, 1668249224106, 90, 90, 0, '2023-02-18 09:07:12.014167', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Mobile Money', 'PREPAID', 0),
(87, 1668249224106, 60, 60, 10, '2023-02-19 11:31:59.755153', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Bank Transfer', 'PREPAID', -10),
(88, 1676804775125, 209, 209, 10, '2023-02-19 15:00:14.578023', '0000-00-00', 'John', 'Dr Paul Sinister', 'Cash', 'PREPAID', -10),
(89, 1677089130816, 180, 184, 4, '2023-02-22 18:08:44.451303', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 'Cash', 'PREPAID', 0),
(90, 1676805207512, 90, 90, 0, '2023-02-24 03:28:27.922964', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 'Bank Transfer', 'PREPAID', 0),
(91, 1676806250721, 90, 90, 0, '2023-02-24 04:08:04.548917', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Bank Transfer', 'PREPAID', 0),
(92, 1676486804597, 90, 90, 0, '2023-02-24 08:57:52.141435', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Cash', 'PREPAID', 0),
(93, 1676805207512, 80, 80, 0, '2023-02-24 08:58:20.451143', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Cash', 'PREPAID', 0),
(94, 1676804775125, 80, 80, 0, '2023-02-26 06:38:29.377783', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 'Mobile Money', 'PREPAID', 0),
(95, 1672381810274, 60, 60, 0, '2023-02-26 06:39:51.147467', '0000-00-00', 'John', 'Dr Paul Sinister', 'Cash', 'PREPAID', 0),
(96, 1677089130816, 60, 60, 0, '2023-03-04 17:48:08.880150', '0000-00-00', 'John', 'Dr Paul Sinister', 'Cash', 'PREPAID', 0),
(97, 1677953110815, 80, 90, 10, '2023-03-04 18:07:12.107420', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Bank Transfer', 'PREPAID', 0),
(98, 1676805207512, 60, 90, 10, '2023-03-09 17:52:59.050384', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Bank Transfer', 'PREPAID', 20),
(99, 1677953110815, 600, 194, 20, '2023-03-14 08:16:08.198370', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Mobile Money', 'PREPAID', -426),
(100, 1678781335962, 90, 90, 0, '2023-03-14 20:07:03.538142', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Mobile Money', 'PREPAID', 0),
(101, 1678781335962, 80, 90, 10, '2023-03-16 10:10:00.336584', '0000-00-00', 'leonides', 'Dr Paul Sinister', 'Mobile Money', 'PREPAID', 0),
(102, 1678968943383, 80, 90, 10, '2023-03-16 12:17:17.007026', '0000-00-00', 'James starggedon', 'Dr Paul Sinister', 'Cash', 'PREPAID', 0);

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
-- Table structure for table `commodity`
--

CREATE TABLE `commodity` (
  `COMID` int(255) NOT NULL,
  `COMMODITY` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `CATEGORY` varchar(255) NOT NULL,
  `suppliedby` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
(28, 'fwrgreger', '1995-06-10 23:00:00.000000', 'consumables', 'xlab songs');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `companyprofile`
--

INSERT INTO `companyprofile` (`ID`, `NAME`, `EMAIL`, `MOTTO`, `PHONENUMBER`, `ADDRESS`) VALUES
(63, 'ethnosoft diagnostic xylophone', 'ethnosoftdiafnostic@gmail.com', 'United we stand divided we fall', 2147483647, 'kalpohin low cost 30AB');

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
-- Table structure for table `manager_sample_descision`
--

CREATE TABLE `manager_sample_descision` (
  `SAMPLEID` int(255) NOT NULL,
  `BILLINGID` int(255) NOT NULL,
  `ACTION` varchar(255) NOT NULL,
  `MESSAGE` varchar(255) NOT NULL,
  `MANAGER` varchar(255) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `quantity` varchar(255) NOT NULL,
  `alertlevel` int(255) NOT NULL,
  `materialcode` varchar(255) NOT NULL,
  `tax` int(255) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `newstock`
--

INSERT INTO `newstock` (`stockid`, `name`, `category`, `consumptionunit`, `purchaseunit`, `quantity`, `alertlevel`, `materialcode`, `tax`, `date`) VALUES
(25, 'props plus', 'hematology', 'g', 'g', '44494', 44, '4444', 44, '2023-03-17 21:16:50.125564'),
(29, 'props plus plush xnx', 'real estate', 'g', 'g', '45032', 44, '4444', 44, '2023-03-17 21:23:35.204481'),
(30, 'telescope', 'equipment', 'others', 'others', '6054444', 200, 'kjefjdj', 1, '2023-03-18 07:40:24.577628');

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
(1197, 1668249224106, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1995-11-06', 27, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza Kojo', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2022-11-12', 'TRUE'),
(1198, 1672381810274, 'Hamza Tiifu', 'xelobcoder@gmail.com', '1987-11-06', 35, 'male', '', '', 'Direct', NULL, 'single', '+10249434803', 'Hamza Tiifu', ' brother', 595964565, 'years', 'leonides', 'leonides', '2022-12-30', 'TRUE'),
(1199, 1676486804597, 'Tiifu Hamza Kojo', 'hamzatiifu45@gmail.com', '1966-06-06', 56, 'female', 'leonides', 'Dr Paul Sinister', 'Refered', NULL, 'single', '0595964565', 'Tiifu Hamza Kojo', 'brother', 595964565, 'years', 'leonidas', 'Nursing', '2023-02-15', 'FALSE'),
(1200, 1676681195957, 'Tiifu hamza', 'tiifuofficial@gmail.com', '1995-06-06', 27, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Tiifu hamza', 'brother', 595964566, 'years', 'leonides', 'Nursing', '2023-02-18', 'TRUE'),
(1201, 1676804775125, 'Tiifu hamza', 'tiifuofficial@gmail.com', '1995-11-06', 27, 'male', '', '', 'Direct', NULL, 'married', '0595964566', 'Tiifu hamza', 'brother', 595964566, 'years', 'leonides', 'Nursing', '2023-02-19', 'FALSE'),
(1202, 1676805207512, 'Tiifu hamza', 'tiifuofficial@gmail.com', '1995-11-06', 27, 'male', '', '', 'Direct', NULL, 'married', '0595964566', 'Tiifu hamza', 'brother', 595964566, 'years', 'leonides', 'Nursing', '2023-02-19', 'TRUE'),
(1203, 1676806250721, 'Tiifu hamza', 'tiifuofficial@gmail.com', '1995-11-06', 27, 'male', 'leonides', 'Dr Paul Sinister', 'Refered', NULL, 'married', '0595964565', 'Tiifu Hamza Kojo', 'brother', 595964566, 'years', 'leonidas', 'Nursing', '2023-02-19', 'TRUE'),
(1204, 1677089130816, 'haruna adams', 'harund@gmail.com', '1991-11-11', 31, 'male', 'James starggedon', 'Dr Paul Sinister', 'Refered', NULL, 'single', '0595964565', 'hamza', 'friend', 562565858, 'years', 'ghana ambulance services', 'paramedical', '2023-02-22', 'FALSE'),
(1205, 1677953110815, 'aaron kankam', 'aaronkanakanm@gmail.com', '1992-11-11', 30, 'male', 'John', 'Dr Paul Sinister', 'Refered', NULL, 'married', '0546456565', 'tiifu hamza', 'friend', 505654658, 'years', 'labhill diagnostics', 'Banker', '2023-03-04', 'TRUE'),
(1206, 1678781335962, 'tiifu hamza kojo boronson', 'hamzatiifu45@gmail.com', '1991-11-11', 31, 'male', '', '', 'Direct', NULL, 'married', '0241758550', 'tiifu shefik', 'brother', 595964565, 'years', 'leonides', 'nursing', '2023-03-14', 'FALSE'),
(1207, 1678968943383, 'Tiifu Faizah', 'hamzatiifu545@gmail.com', '1991-11-10', 31, 'female', '', '', 'Direct', NULL, 'married', '02417595282', 'Tiifu Adamu ', 'Brother', 575885888, 'years', 'Tamale Teaching Hospital', 'Medical Practioner', '2023-03-16', 'FALSE'),
(1208, 1678976212145, 'ertrutyjer', 'hamzatiifu45@gmail.com', '1992-11-06', 30, 'other', 'James starggedon', 'Dr Paul Sinister', 'Refered', NULL, 'married', '0249443089', 'hamza', 'friend', 2147483647, 'years', 'ty5u45u45u45u45', 'tyyttyjt', '2023-03-16', 'TRUE');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
(55, 29, 'props plus plush xnx', 0, 75, 'eftrutyjyt', 'g', '2023-03-18 10:00:10.415116', 588, 'TRUE', 60, '55', 528, '2023-03-03', '2023-03-18', 'incomplete', 22, 1320, 'FALSE');

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
  `MESSAGE` text DEFAULT NULL,
  `TIME` time(6) NOT NULL DEFAULT current_timestamp(),
  `PHELOBOTOMY_MESSAGE` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `performing_test`
--

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `TEST`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `SAMPLE_STATUS`, `INSPECTOR`, `INSPECTION_TIME`, `PHELOBOTOMY_STATUS`, `SAMPLE_TAKEN_BY`, `TIME_PHELOBOTOMY_COMPLETED`, `ALL_SAMPLE_TAKEN`, `MESSAGE`, `TIME`, `PHELOBOTOMY_MESSAGE`) VALUES
(68, '1668249224106', 'glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson,Lipid Profile', '2022-11-12', 'moderate', 74, 'buipe old hospital ', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-12-30 06:33:10.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '10:34:46.000000', ''),
(69, '1668249224106', 'glycated heamoglobin', '2022-11-12', 'moderate', 75, 'buipe old hospital ', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-17 00:51:09.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '10:36:30.000000', ''),
(70, '1668249224106', 'Renal Function Test,Tiifu Hamza Kojo Boronson,Tiifu Hamza Kojo Boronson', '2022-11-13', 'moderate', 76, 'buipe old hospital ', 'REJECTED', 'Dr Tiifu Hamza', '2023-03-17 00:51:23.000000', 'QUEUE', NULL, NULL, 'FALSE', 'ehrgjgjtr', '07:13:34.000000', ''),
(71, '1668249224106', 'glycated heamoglobin', '2022-11-13', 'emmergency', 77, 'buipe old hospital ', 'ACCEPTED', 'Dr Tiifu Hamza', '2022-12-30 06:33:19.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '23:19:03.000000', ''),
(72, '1668249224106', 'Renal Function Test,Tiifu Hamza Kojo Boronson,Liver Function Test', '2022-11-13', 'moderate', 78, 'buipe old hospital ', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:25.000000', 'QUEUE', NULL, NULL, 'FALSE', 'insuffucient ', '23:22:51.000000', ''),
(73, '1668249224106', 'Renal Function Test,calcium,full blood count', '2022-11-13', 'moderate', 79, 'Seventh Day Adventist Hospital', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:08:09.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '23:27:59.000000', ''),
(74, '1668249224106', 'Renal Function Test,Liver Function Test,malaria', '2022-11-14', 'moderate', 80, 'buipe old hospital ', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:23.000000', 'DONE', NULL, '2022-11-14', 'TRUE', 'Coagualted blood', '13:32:31.000000', 'null'),
(75, '1668249224106', 'glycated heamoglobin,Renal Function Test,Liver Function Test,Lipid Profile,Tiifu Hamza Kojo Boronson,malaria,widal,calcium,full blood count,Tiifu Hamza Kojo', '2022-11-25', 'moderate', 81, 'YEDI BUS STOP', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-02-11 11:44:36.000000', 'QUEUE', NULL, NULL, 'FALSE', 'rejecting for rejecting sake', '14:44:12.000000', ''),
(76, '1672381810274', 'glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson,Tiifu Hamza Kojo', '2022-12-30', 'emmergency', 82, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:22.000000', 'INCOMPLETE', NULL, '2022-12-30', 'FALSE', 'rejecting for rejecting sake and nothing meaniful', '06:32:23.000000', 'Patient not in premises of the facillity'),
(77, '1672381810274', 'glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson', '2023-01-22', 'emmergency', 83, 'Kpagyili ', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:20.000000', 'DONE', NULL, '2023-01-22', 'TRUE', 'd;ld;asd;lls', '08:50:47.000000', 'null'),
(78, '1672381810274', 'glycated heamoglobin,Renal Function Test,Liver Function Test,Tiifu Hamza Kojo Boronson,full blood count', '2023-02-15', 'emmergency', 84, 'Tiifu Hamza kojo', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:17.000000', 'QUEUE', NULL, NULL, 'FALSE', 'kdfkosdfokwd', '18:00:02.000000', ''),
(79, '1676486804597', 'glycated heamoglobin', '2023-02-15', 'emmergency', 85, 'kanvili', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:19.000000', 'QUEUE', NULL, NULL, 'FALSE', 'wd;ld;l;l', '18:48:42.000000', ''),
(80, '1668249224106', 'glycated heamoglobin', '2023-02-18', 'moderate', 86, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:16.000000', 'QUEUE', NULL, NULL, 'FALSE', 'kodvoasdowdowo', '09:07:12.000000', ''),
(81, '1668249224106', 'Liver Function Test', '2023-02-19', 'emmergency', 87, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:14.000000', 'QUEUE', NULL, NULL, 'FALSE', 'DJJFJDJ', '11:31:59.000000', ''),
(82, '1676804775125', 'Renal Function Test,Lipid Profile,Tiifu Hamza Kojo Boronson,full blood count', '2023-02-19', 'emmergency', 88, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:08:07.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '15:00:14.000000', ''),
(83, '1677089130816', 'Renal Function Test,Lipid Profile,Tiifu Hamza Kojo Boronson', '2023-02-22', 'none', 89, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:12.000000', 'QUEUE', NULL, NULL, 'FALSE', 'SMDNMMDMD', '18:08:44.000000', ''),
(84, '1676805207512', 'glycated heamoglobin', '2023-02-24', 'moderate', 90, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:04.000000', 'DONE', NULL, '2023-02-24', 'TRUE', 'MMADVMVDMM', '03:28:28.000000', 'null'),
(85, '1676806250721', 'glycated heamoglobin', '2023-02-24', 'emmergency', 91, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:06.000000', 'INCOMPLETE', NULL, '2023-02-24', 'FALSE', 'KSFKKSFK', '04:08:04.000000', 'got hefkfjkqefuql'),
(86, '1676486804597', 'glycated heamoglobin', '2023-02-24', 'moderate', 92, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:08.000000', 'QUEUE', NULL, NULL, 'FALSE', 'DVKFFKK', '08:57:52.000000', ''),
(87, '1676805207512', 'Renal Function Test', '2023-02-24', 'none', 93, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:09.000000', 'INCOMPLETE', NULL, '2023-02-24', 'FALSE', 'DMFMMM', '08:58:20.000000', 'lflwelwellkeklqe'),
(88, '1676804775125', 'Renal Function Test', '2023-02-26', 'moderate', 94, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-14 20:09:02.000000', 'QUEUE', NULL, NULL, 'FALSE', 'MSJJDJ', '06:38:29.000000', ''),
(89, '1672381810274', 'Liver Function Test', '2023-02-26', 'emmergency', 95, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-01 17:28:11.000000', 'DONE', NULL, '2023-02-26', 'TRUE', 'Andy has a bachelor’s degree in physics from MIT and taught himself to program after college \n(mostly with Udacity courses). He has been helping Udacity make incredible educational \nexperiences since the early days of the company.\nAndy has a bachelor’s degree in physics from MIT and taught himself to program after college \n(mostly with Udacity courses). He has been helping Udacity make incredible educational \nexperiences since the early days of the company.\nAndy has a bachelor’s degree in physics from MIT and taught himself to program after college \n(mostly with Udacity courses). He has been helping Udacity make incredible educational \nexperiences since the early days of the company.\nAndy has a bachelor’s degree in physics from MIT and taught himself to program after college \n(mostly with Udacity courses). He has been helping Udacity make incredible educational \nexperiences since the early days of the company.\nAndy has a bachelor’s degree in physics from MIT and taught himself', '06:39:51.000000', 'null'),
(90, '1677089130816', 'Liver Function Test', '2023-03-04', 'moderate', 96, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-13 16:47:05.000000', 'INCOMPLETE', NULL, '2023-03-04', 'FALSE', 'Andy has a bachelor’s degree in physics from MIT and taught himself to program after college \n(mostly with Udacity courses). He has been helping Udacity make incredible educational \nexperiences since the early days of the company.\nAndy has a bachelor’s degree in physics from MIT and taught himself to program after college \n(mostly with Udacity courses). He has been helping Udacity make incredible educational \nexperiences since the early days of the company.\nAndy has a bachelor’s degree in physics from MIT and taught himself to program after college \n(mostly with Udacity courses). He has been helping Udacity make incredible educational \nexperiences since the early days of the company.\nAndy has a bachelor’s degree in physics from MIT and taught himself to program after college \n(mostly with Udacity courses). He has been helping Udacity make incredible educational \nexperiences since the early days of the company.\nAndy has a bachelor’s degree in physics from MIT and taught himself', '17:48:08.000000', 'sample siccessfully taken and cleint instructed to go for further ante natal service examination. kindly take note to call on her when the result is finished'),
(91, '1677953110815', 'glycated heamoglobin', '2023-03-04', 'emmergency', 97, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-08 09:17:57.000000', 'QUEUE', NULL, NULL, 'FALSE', 'sample not adequate to carry out test', '18:07:12.000000', ''),
(92, '1676805207512', 'glycated heamoglobin', '2023-03-09', 'moderate', 98, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-13 16:46:59.000000', 'QUEUE', NULL, NULL, 'FALSE', 'njkjjjkjkjk', '17:52:59.000000', ''),
(93, '1677953110815', 'glycated heamoglobin,Liver Function Test,Tiifu Hamza Kojo Boronson', '2023-03-14', 'moderate', 99, 'Tiifu Hamza', 'REJECTED', 'Dr Tiifu Hamza', '2023-03-14 20:11:14.000000', 'DONE', NULL, '2023-03-14', 'TRUE', 'jkdvJHsdfjkjk', '08:16:08.000000', 'null'),
(94, '1678781335962', 'glycated heamoglobin', '2023-03-14', 'moderate', 100, 'Tiifu Hamza', 'REJECTED', 'Dr Tiifu Hamza', '2023-03-16 11:41:43.000000', 'DONE', NULL, '2023-03-14', 'TRUE', 'kljhjj', '20:07:03.000000', 'null'),
(95, '1678781335962', 'glycated heamoglobin', '2023-03-16', 'emmergency', 101, 'Tiifu Hamza', 'ACCEPTED', 'Dr Tiifu Hamza', '2023-03-16 11:36:38.000000', 'QUEUE', NULL, NULL, 'FALSE', NULL, '10:10:00.000000', ''),
(96, '1678968943383', 'glycated heamoglobin', '2023-03-16', 'emmergency', 102, 'Tiifu Hamza', 'REJECTED', 'Dr Tiifu Hamza', '2023-03-16 14:22:51.000000', 'QUEUE', NULL, NULL, 'FALSE', 'ertrjtyjkty', '12:17:17.000000', '');

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
(10, 'xxxxxxxxxx', 'juju is ankfdgkdqq', ' laboratory manager', 'IRc7Aol/vg', '2022-10-15', '12:53:04.000000'),
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
-- Table structure for table `setup_cardiac_enzymes`
--

CREATE TABLE `setup_cardiac_enzymes` (
  `SETUPID` int(255) NOT NULL,
  `UNIT` varchar(255) NOT NULL,
  `UPPER` int(20) NOT NULL,
  `LOWER` int(20) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `setup_cardiac_enzymes`
--

INSERT INTO `setup_cardiac_enzymes` (`SETUPID`, `UNIT`, `UPPER`, `LOWER`, `PARAMETER`) VALUES
(1, 'U/L', 317, 200, 'creatinine kinase (CK)'),
(2, 'U/L', 700, 243, 'aspartate transaminase(AST)'),
(3, 'U/L', 564, 243, 'lactate dehydrogenase (LDH)');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `setup_full_blood_count_test_male`
--

CREATE TABLE `setup_full_blood_count_test_male` (
  `FBCID` int(255) NOT NULL,
  `PARAMETER` varchar(255) NOT NULL,
  `UNIT` varchar(10) NOT NULL,
  `LOWER` int(10) NOT NULL,
  `UPPER` int(10) NOT NULL,
  `DATE` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `setup_full_blood_count_test_male`
--

INSERT INTO `setup_full_blood_count_test_male` (`FBCID`, `PARAMETER`, `UNIT`, `LOWER`, `UPPER`, `DATE`) VALUES
(290, 'neutorprnia', 'mg/dl', 200, 6000, '2023-02-15 17:46:50'),
(291, 'udfusfu', 'mg/dl', 566, 865989, '2023-02-15 17:47:34'),
(292, 'jadjsdjsdj', 'DOKVSD', 22, 60, '2023-02-15 17:50:46');

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
  `SETUPID` int(255) NOT NULL,
  `PARAMETER` varchar(100) NOT NULL,
  `UPPER` int(100) NOT NULL,
  `LOWER` int(100) NOT NULL,
  `UNIT` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `setup_lipid_profile_test`
--

INSERT INTO `setup_lipid_profile_test` (`SETUPID`, `PARAMETER`, `UPPER`, `LOWER`, `UNIT`) VALUES
(1, 'CHOLESTEROL', 600, 498, 'mg/dl'),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `setup_liver_function_test`
--

INSERT INTO `setup_liver_function_test` (`SETUPID`, `PARAMETER`, `UPPER`, `LOWER`, `DATE`, `UNIT`) VALUES
(1, 'albumin', 600000, 200, '2023-02-23 15:55:31.256904', 'mg/dl'),
(2, 'total protein', 300, 600, '2023-02-23 15:55:31.256904', 'mg/dl'),
(3, 'alp', 600, 600, '2023-02-23 15:55:31.256904', 'mg/dl'),
(4, 'ast', 600, 6000, '2023-02-23 15:55:31.256904', 'mg/dl'),
(5, 'alt', 600, 600, '2023-02-23 15:55:31.256904', 'mg/dl'),
(6, 'bun', 600, 600, '2023-02-23 15:55:31.256904', 'mg/dl'),
(7, 'creatinine', 5000, 600, '2023-02-23 15:55:31.256904', 'mg/dl');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `setup_renal_function_test`
--

INSERT INTO `setup_renal_function_test` (`SETUPID`, `PARAMETER`, `UPPER`, `LOWER`, `UNIT`) VALUES
(1, 'BUN', 5555, 600, 'mg/dl'),
(2, 'Creatinine', 5540, 500, 'mg/dl'),
(3, 'potasium', 2520, 10, 'mg/dl'),
(4, 'sodium', 6822, 300, 'mg/dl'),
(5, 'chloride', 55845, 6000, 'mg/dl'),
(6, 'bicarbonate', 600, 50, 'mg/dl');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `setup_thyroid_test`
--

INSERT INTO `setup_thyroid_test` (`SETUPID`, `PARAMETER`, `UNIT`, `UPPER`, `LOWER`) VALUES
(1, 'TSH', 'pmol/L', 5550, 498),
(2, 'T4', 'pmol/L', 5555, 498),
(3, 'T3', 'pmol/L', 555, 498);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`SUPPLIERID`, `NAME`, `COMMODITY`, `ADDRESS`, `DATE`, `PHONENUMBER`, `CONTACTPERSON`, `REGION`, `EMAIL`) VALUES
(74, '5y4u69o9p-98', 'FAILED TP TUN ANALYTICS', 'Adjacent Holly Cross Church', '2023-03-16 14:27:38.787490', 249443089, 'fgfhdfhf', 'utrtrjtj', 'hamzatiifu45@gmail.com'),
(75, 'eftrutyjyt', 'Homicides', 'Adjacent Holly Cross Church', '2023-03-16 14:28:21.491987', 249443089, '756785566785', 'hfghfghfghfg', 'harund@gmail.com');

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
(2, 'Renal function test', 'Haematology', 80, '2022-08-18 00:00:00'),
(5, 'Liver Function Test', 'chemistry', 60, '2022-08-18 00:00:00'),
(6, 'Lipid Profile', 'chemistry', 60, '2022-08-18 18:35:40'),
(7, 'hkutr', 'chemistry', 0, '2022-08-19 23:50:33'),
(8, 'Tiifu Hamza Kojo Boronson', 'chemistry', 44, '2022-08-30 00:27:07'),
(9, 'calcium', 'chemistry', 25, '2022-09-04 00:39:41'),
(10, 'malaria', 'Haematology', 10, '2022-09-07 22:06:42'),
(11, 'widal', 'Haematology', 15, '2022-09-24 15:08:23'),
(12, 'full blood count', 'chemistry', 25, '2022-09-24 15:08:49'),
(13, 'Tiifu Hamza Kojo', 'Haematology', 4435, '2022-09-29 23:31:00'),
(14, 'Tiifu hamza', 'chemistry', 4435, '2023-02-18 11:32:56');

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
-- Indexes for table `setup_cardiac_enzymes`
--
ALTER TABLE `setup_cardiac_enzymes`
  ADD PRIMARY KEY (`SETUPID`);

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
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`SUPPLIERID`);

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
-- AUTO_INCREMENT for table `activation`
--
ALTER TABLE `activation`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `BILLINGID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `bloodgroup`
--
ALTER TABLE `bloodgroup`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
  MODIFY `COMID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `companyprofile`
--
ALTER TABLE `companyprofile`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

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
-- AUTO_INCREMENT for table `manager_sample_descision`
--
ALTER TABLE `manager_sample_descision`
  MODIFY `SAMPLEID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `newstock`
--
ALTER TABLE `newstock`
  MODIFY `stockid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `new_patients`
--
ALTER TABLE `new_patients`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1209;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `productordersid` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

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
-- AUTO_INCREMENT for table `setup_cardiac_enzymes`
--
ALTER TABLE `setup_cardiac_enzymes`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_general`
--
ALTER TABLE `setup_full_blood_count_test_general`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=210;

--
-- AUTO_INCREMENT for table `setup_full_blood_count_test_male`
--
ALTER TABLE `setup_full_blood_count_test_male`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=293;

--
-- AUTO_INCREMENT for table `setup_full_count_count_female`
--
ALTER TABLE `setup_full_count_count_female`
  MODIFY `FBCID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

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
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `setup_thyroid_test`
--
ALTER TABLE `setup_thyroid_test`
  MODIFY `SETUPID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `SUPPLIERID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `test_categories`
--
ALTER TABLE `test_categories`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `test_panels`
--
ALTER TABLE `test_panels`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `typhoid_test`
--
ALTER TABLE `typhoid_test`
  MODIFY `TESTID` int(255) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
