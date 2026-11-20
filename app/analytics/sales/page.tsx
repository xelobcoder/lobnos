"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	RiArrowRightLine,
	RiBarChartBoxLine,
	RiCalendarEventLine,
	RiMoneyDollarCircleLine,
	RiPieChartLine,
	RiSearchLine,
	RiUserLine,
} from "@remixicon/react";
import styles from "../patients/page.module.css";

const analyticsPages = [
	{
		title: "Monthly Sales Trend",
		description: "Compare earned revenue, collections, expenses, and balances by month.",
		icon: <RiCalendarEventLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/monthlySalesTrend",
		color: "blue",
	},
	{
		title: "Daily Sales Trend",
		description: "Review sales activity across individual days.",
		icon: <RiBarChartBoxLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/dailySalesTrend",
		color: "green",
	},
	{
		title: "Weekly Sales Trend",
		description: "Track changes in revenue and collections week by week.",
		icon: <RiCalendarEventLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/weeklySalesTrend",
		color: "cyan",
	},
	{
		title: "Yearly Sales Trend",
		description: "Compare annual sales and financial performance.",
		icon: <RiPieChartLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/yearlySalesTrend",
		color: "violet",
	},
	{
		title: "Sales by Week and Branch",
		description: "Compare weekly sales activity across branches.",
		icon: <RiBarChartBoxLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/salesByWeekAndBranch",
		color: "slate",
	},
	{
		title: "Sales by Employee",
		description: "Explore revenue associated with employees.",
		icon: <RiUserLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/totalSalesByEmployee",
		color: "amber",
	},
	{
		title: "Sales by Clinician",
		description: "Review service revenue associated with clinicians.",
		icon: <RiUserLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/totalSalesByClinician",
		color: "indigo",
	},
	{
		title: "Clinician Service Details",
		description: "Explore services and revenue by clinician.",
		icon: <RiBarChartBoxLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/clinician-services",
		color: "teal",
	},
	{
		title: "Organizations Analytics",
		description: "Review organization-level sales activity and trends.",
		icon: <RiPieChartLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/organizations",
		color: "blue",
	},
	{
		title: "Sales by Organization",
		description: "Compare revenue associated with organizations.",
		icon: <RiMoneyDollarCircleLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/totalSalesByOrganization",
		color: "green",
	},
	{
		title: "Sales by Service Category",
		description: "See how revenue is distributed across service categories.",
		icon: <RiPieChartLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/totalSalesByServiceCategory",
		color: "cyan",
	},
	{
		title: "Outsourced Services",
		description: "Review sales and activity for outsourced services.",
		icon: <RiBarChartBoxLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/totalSalesByOutsourcedStatus",
		color: "violet",
	},
	{
		title: "Outstanding Payments",
		description: "Find unpaid balances by patient, service, and organization.",
		icon: <RiMoneyDollarCircleLine size={23} aria-hidden="true" />,
		href: "/analytics/sales/outstanding-payments-breakdown",
		color: "rose",
	},
];

export default function SalesAnalyticsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const filteredPages = analyticsPages.filter((page) =>
		`${page.title} ${page.description}`.toLowerCase().includes(searchTerm.trim().toLowerCase()),
	);

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<p className={styles.eyebrow}>Analytics / Finance</p>
					<h1>Sales analytics</h1>
					<p className={styles.subtitle}>Explore sales trends, service performance, and outstanding balances.</p>
				</div>
				<div className={styles.reportCount}>
					<strong>{filteredPages.length}</strong>
					<span>{filteredPages.length === 1 ? "report" : "reports"}</span>
				</div>
			</header>

			<div className={styles.toolbar}>
				<label className={styles.search}>
					<RiSearchLine size={19} aria-hidden="true" />
					<input
						type="search"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search sales analytics"
						aria-label="Search sales analytics"
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
}
