"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
	RiArrowRightLine,
	RiBarChartBoxLine,
	RiCalendarEventLine,
	RiCalculatorLine,
	RiErrorWarningLine,
	RiPhoneLine,
	RiSearchLine,
	RiUserLine
} from '@remixicon/react';
import styles from './page.module.css';

const analyticsPages = [
	{
		title: 'Patient Dashboards',
		description: 'Overview of key patient metrics and statistics',
		icon: <RiBarChartBoxLine size={23} />,
		href: '/analytics/patients/dashboards',
		color: 'blue'
	},
	{
		title: 'Age Distribution',
		description: 'Patient distribution across different age groups',
		icon: <RiUserLine size={23} />,
		href: '/analytics/patients/age-distribution',
		color: 'green'
	},
	{
		title: 'Gender Distribution',
		description: 'Patient gender breakdown and analysis',
		icon: <RiCalculatorLine size={23} />,
		href: '/analytics/patients/gender-distribution',
		color: 'cyan'
	},
	{
		title: 'Marital Status',
		description: 'Marital status distribution of patients',
		icon: <RiUserLine size={23} />,
		href: '/analytics/patients/marital-status',
		color: 'amber'
	},
	{
		title: 'Registration Over Time',
		description: 'Patient registration trends and patterns',
		icon: <RiCalendarEventLine size={23} />,
		href: '/analytics/patients/patient-registration-over-time',
		color: 'violet'
	},
	{
		title: 'Occupation Distribution',
		description: 'Patient occupations and employment analysis',
		icon: <RiBarChartBoxLine size={23} />,
		href: '/analytics/patients/occupation-distribution',
		color: 'slate'
	},
	{
		title: 'Missing Data Analysis',
		description: 'Analysis of incomplete patient information',
		icon: <RiErrorWarningLine size={23} />,
		href: '/analytics/patients/missing-data-analysis',
		color: 'rose'
	},
	{
		title: 'Contact Completeness',
		description: 'Patient contact information completion status',
		icon: <RiPhoneLine size={23} />,
		href: '/analytics/patients/contact-completeness',
		color: 'teal'
	},
	{
		title: 'Registration by Day',
		description: 'Weekly patient registration patterns',
		icon: <RiCalendarEventLine size={23} />,
		href: '/analytics/patients/registration-by-day',
		color: 'indigo'
	}
];

const Page: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const filteredPages = analyticsPages.filter((page) =>
		`${page.title} ${page.description}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
	);

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<p className={styles.eyebrow}>Analytics</p>
					<h1>Patient analytics</h1>
					<p className={styles.subtitle}>Explore registration trends, demographics, and data quality.</p>
				</div>
				<div className={styles.reportCount}>
					<strong>{filteredPages.length}</strong>
					<span>{filteredPages.length === 1 ? 'report' : 'reports'}</span>
				</div>
			</header>

			<div className={styles.toolbar}>
				<label className={styles.search}>
					<RiSearchLine size={19} aria-hidden="true" />
					<input
						type="search"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search patient analytics"
						aria-label="Search patient analytics"
					/>
				</label>
				<p className={styles.hint}>Select a report to view detailed insights</p>
			</div>

			{filteredPages.length > 0 ? (
				<div className={styles.grid}>
					{filteredPages.map((page) => (
						<Link key={page.href} href={page.href} className={styles.card} data-tone={page.color}>
							<span className={styles.icon}>{page.icon}</span>
							<span className={styles.cardContent}>
								<span className={styles.cardTitle}>{page.title}</span>
								<span className={styles.description}>{page.description}</span>
							</span>
							<RiArrowRightLine className={styles.arrow} size={19} aria-hidden="true" />
						</Link>
					))}
				</div>
			) : (
				<div className={styles.empty}>
					<RiSearchLine size={22} aria-hidden="true" />
					<strong>No matching reports</strong>
					<span>Try a different search term.</span>
				</div>
			)}
		</main>
	);
};

export default Page;
