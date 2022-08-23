-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 23, 2022 at 08:26 PM
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
  `ID` int(255) NOT NULL,
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

INSERT INTO `billing` (`ID`, `PATIENTID`, `PAID_AMOUNT`, `PAYABLE`, `DISCOUNT`, `CREATED_ON`, `UPDATED`, `ORGANIZATION`, `CLINICIAN`, `PAYMENT_MODE`, `TYPE`, `OUTSTANDING`) VALUES
(8, 1660891495875, 60, 230, 0, '2022-08-21 16:31:48.571814', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 50),
(9, 1660891495875, 60, 230, 0, '2022-08-21 16:35:00.529210', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 50),
(10, 1660891495875, 60, 230, 0, '2022-08-21 16:35:01.586931', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 50),
(11, 1660891495875, 60, 230, 0, '2022-08-21 16:35:29.624863', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 50),
(12, 1660891495875, 60, 230, 0, '2022-08-21 16:35:47.739555', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 50),
(13, 1660891495875, 60, 230, 0, '2022-08-21 16:36:01.426220', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 50),
(14, 1660891495875, 60, 230, 0, '2022-08-21 16:37:25.409065', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 50),
(15, 1660891495875, 0, 90, 0, '2022-08-21 16:38:25.388717', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 90),
(16, 1660891495875, 200, 230, 0, '2022-08-21 16:39:09.572109', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(17, 1661077739124, 60, 80, 0, '2022-08-21 16:40:27.602410', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(18, 1661077739124, 60, 290, 0, '2022-08-21 17:08:03.449550', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'PREPAID', 210),
(19, 1661077739124, 600, 150, 0, '2022-08-21 17:12:44.327556', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', -650),
(20, 1660891495875, 0, 80, 0, '2022-08-22 13:29:57.962247', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'POSTPAID', 80),
(21, 1661077739124, 200, 290, 0, '2022-08-23 12:12:56.566051', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 0),
(22, 1661257920378, 0, 290, 0, '2022-08-23 13:34:52.989598', '0000-00-00', 'leonides', 'Dr Paul Sinister', 0, 'POSTPAID', 290),
(23, 1661257805044, 230, 230, 0, '2022-08-23 13:35:42.234557', '0000-00-00', 'John', 'Dr Paul Sinister', 0, 'PREPAID', 0);

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
(5, 1660734012866, 'tiifu hamza', 'hamzatiifu45@gmail.com', '1996-11-06', 25, 'male', 'James starggedon', 'Dr Paul Sinister', 'Refered', NULL, 'married', '0241758550', 'Tiifu Shefik', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2022-08-17', 'FALSE'),
(6, 1660768664518, 'Hamza Tiifu', 'xelobcoder@gmail.com', '1992-06-06', 30, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'tiifu hamza', 'brother', 249434803, 'years', 'leonides', 'Lecturer', '2022-08-17', 'TRUE'),
(7, 1660859254404, 'Tiifu Shefik', 'SHEFIKTIIFU@YAHOO.COM', '1992-09-08', 29, 'male', '', '', 'Direct', NULL, 'single', '+10249434803', 'Hamza Tiifu', 'brother', 241758550, 'years', 'leonides', 'Nursing', '2022-08-18', 'FALSE'),
(9, 1660891495875, 'Tiifu Abu Shaheda', 'abuhajiasheheda@yahoo.com', '1993-11-06', 28, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza', 'brother', 545645848, 'years', 'leonides', 'Teaching', '2022-08-19', 'TRUE'),
(10, 1660891786079, 'Tiifu Hamza Kojo', 'xelobcoder@gmail.com', '1998-11-06', 23, 'male', '', '', 'Direct', NULL, 'married', '+233595964565', 'Hamza Tiifu', 'sister', 508060456, 'years', 'lhd', 'Nursing', '2022-08-19', 'TRUE'),
(11, 1660891881950, 'Tiifu Hamza', 'hamzatiifu45@gmail.com', '2021-11-11', 8, 'male', '', '', 'Direct', NULL, 'single', '+233249434803', 'Tiifu Hamza', 'self', 595885785, 'months', 'leonides', 'Nursing', '2022-08-19', 'TRUE'),
(12, 1660899113520, 'Abdul Toffick Galut', 'hamzatiifu45@gmail.com', '1994-11-11', 27, 'male', '', '', 'Direct', NULL, 'married', '+233249434803', 'Tiifu Hamza', 'brother', 595964565, 'years', 'leonides', 'Nursing', '2022-08-19', 'TRUE'),
(15, 1661077739124, 'james timers staggretin', 'hamzatiifu45@gmail.com', '1959-01-01', 63, 'male', 'James starggedon', 'Dr Paul Sinister', 'Refered', NULL, 'single', '+233249434803', 'tiifu hamza', 'brother', 549468585, 'years', 'leonides', 'Nurising', '2022-08-21', 'TRUE'),
(16, 1661257805044, 'TIIFU HAMZA', 'hamzatiifu45@gmail.com', '1995-11-06', 26, 'male', '', '', 'Direct', NULL, 'single', '+233249434803', 'TIIFU HAMZA', ' brother', 595964565, 'years', 'leonides', 'Nursing', '2022-08-23', 'TRUE'),
(17, 1661257920378, 'Hamza Tiifu', 'tiifuofficial@gmail.com', '1110-11-11', 911, 'male', '', '', 'Direct', NULL, 'married', '+10249434803', 'Hamza Tiifu', ' brother', 505656545, 'years', 'leonides', 'Nursing', '2022-08-23', 'TRUE');

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
  `DATE` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `URGENCY` varchar(255) NOT NULL,
  `BILLINGID` int(100) NOT NULL,
  `SAMPLING_CENTER` varchar(100) NOT NULL,
  `SAMPLE_STATUS` varchar(100) DEFAULT 'PENDING',
  `PHELOBOTOMY_STATUS` varchar(100) DEFAULT 'QUEUE',
  `SAMPLE_TAKEN_BY` varchar(100) DEFAULT NULL,
  `TIME_PHELOBOTOMY_COMPLETED` date DEFAULT NULL,
  `ALL_SAMPLE_TAKEN` varchar(50) DEFAULT 'FALSE',
  `MESSAGE` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `performing_test`
--

INSERT INTO `performing_test` (`ID`, `PATIENTID`, `TEST`, `DATE`, `URGENCY`, `BILLINGID`, `SAMPLING_CENTER`, `SAMPLE_STATUS`, `PHELOBOTOMY_STATUS`, `SAMPLE_TAKEN_BY`, `TIME_PHELOBOTOMY_COMPLETED`, `ALL_SAMPLE_TAKEN`, `MESSAGE`) VALUES
(2, '1660891495875', 'Renal Function Test,Liver Function Test,glycated heamoglobin', '2022-08-21 15:31:48.638913', 'moderate', 8, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(3, '1660891495875', 'Renal Function Test,Liver Function Test,glycated heamoglobin', '2022-08-21 15:35:00.584801', 'moderate', 9, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(4, '1660891495875', 'Renal Function Test,Liver Function Test,glycated heamoglobin', '2022-08-21 15:35:01.635425', 'moderate', 10, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(5, '1660891495875', 'Renal Function Test,Liver Function Test,glycated heamoglobin', '2022-08-21 15:35:29.686475', 'emmergency', 11, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(6, '1660891495875', 'Renal Function Test,Liver Function Test,glycated heamoglobin', '2022-08-21 15:35:47.836971', 'emmergency', 12, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(7, '1660891495875', 'Renal Function Test,Liver Function Test,glycated heamoglobin', '2022-08-21 15:36:01.528900', 'emmergency', 13, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(8, '1660891495875', 'Renal Function Test,Liver Function Test,glycated heamoglobin', '2022-08-21 15:37:25.464830', 'emmergency', 14, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(9, '1660891495875', 'glycated heamoglobin', '2022-08-21 15:38:25.450405', 'emmergency', 15, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(10, '1660891495875', 'glycated heamoglobin,Renal Function Test,Liver Function Test', '2022-08-21 15:39:09.618536', 'moderate', 16, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(11, '1661077739124', 'Renal Function Test', '2022-08-21 15:40:27.628877', 'emmergency', 17, '', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(12, '1661077739124', 'glycated heamoglobin,Liver Function Test,Lipid Profile,Renal Function Test', '2022-08-21 16:08:03.482669', 'moderate', 18, 'CENTRAL', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(13, '1661077739124', 'glycated heamoglobin,Lipid Profile', '2022-08-21 16:12:44.390546', 'moderate', 19, 'CENTRAL', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(14, '1660891495875', 'Renal Function Test', '2022-08-22 12:29:58.087737', 'emmergency', 20, 'CENTRAL', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(15, '1661077739124', 'glycated heamoglobin,Renal Function Test,Liver Function Test,Lipid Profile', '2022-08-23 11:12:56.626923', 'moderate', 21, 'CENTRAL', 'PENDING', 'QUEUE', 'TIIFU HAMZA', NULL, 'FALSE', NULL),
(16, '1661257920378', 'glycated heamoglobin,Liver Function Test,Lipid Profile,Renal Function Test', '2022-08-23 12:34:53.093218', 'moderate', 22, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL),
(17, '1661257805044', 'glycated heamoglobin,Renal Function Test,Lipid Profile', '2022-08-23 12:35:42.311175', 'emmergency', 23, 'CENTRAL', 'PENDING', 'QUEUE', NULL, NULL, 'FALSE', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sampling`
--

CREATE TABLE `sampling` (
  `ID` int(100) NOT NULL,
  `PATIENTID` int(50) NOT NULL,
  `DATE` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `CENTERNAME` varchar(100) NOT NULL,
  `REGISTERED_BY` varchar(100) DEFAULT NULL
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
(7, '', '', 0, '2022-08-19 23:50:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `billing`
--
ALTER TABLE `billing`
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
-- Indexes for table `sampling`
--
ALTER TABLE `sampling`
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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

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
-- AUTO_INCREMENT for table `new_patients`
--
ALTER TABLE `new_patients`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `performing_test`
--
ALTER TABLE `performing_test`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `sampling`
--
ALTER TABLE `sampling`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `test_categories`
--
ALTER TABLE `test_categories`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `test_panels`
--
ALTER TABLE `test_panels`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
