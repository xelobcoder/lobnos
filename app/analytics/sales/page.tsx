'use client';

import React from 'react';
import { RiMoneyDollarCircleLine, RiShoppingCartLine, RiGroupLine, RiBarChartLine, RiCalendarLine, RiArrowUpLine, RiFileListLine, RiArrowRightLine, RiStoreLine, RiPieChartLine, RiLineChartLine, RiUserLine, RiTimeLine, RiBuildingLine, RiHospitalLine, RiExternalLinkLine, RiServiceLine, RiBubbleChartLine } from '@remixicon/react';
import Link from 'next/link';
import { currencyFormatter } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

interface QuickAccessCard {
	title: string;
	description: string;
	link: string;
	icon: React.ReactNode;
	color: string;
	stats?: string;
}

interface SalesModule {
	title: string;
	description: string;
	link: string;
	icon: React.ReactNode;
	color: string;
	features: string[];
}

const salesModules: SalesModule[] = [
	{
		title: "Daily Sales Trend",
		description: "View daily sales performance and trends",
		link: "/analytics/sales/dailySalesTrend",
		icon: <RiLineChartLine size={32} />,
		color: "#06b6d4",
		features: ["Daily revenue tracking", "Performance trends", "Comparative analysis", "Growth patterns"]
	},
	{
		title: "Monthly Sales Trend",
		description: "Analyze monthly sales patterns",
		link: "/analytics/sales/monthlySalesTrend",
		icon: <RiBarChartLine size={32} />,
		color: "#84cc16",
		features: ["Monthly totals", "Trend analysis", "Performance metrics", "Seasonal patterns"]
	},
	{
		title: "Employee Sales",
		description: "Track individual employee performance",
		link: "/analytics/sales/totalSalesByEmployee",
		icon: <RiUserLine size={32} />,
		color: "#ef4444",
		features: ["Employee rankings", "Performance metrics", "Contribution analysis", "Productivity trends"]
	},
	{
		title: "Weekly Sales Trend",
		description: "Analyze weekly sales patterns and changes",
		link: "/analytics/sales/weeklySalesTrend",
		icon: <RiCalendarLine size={32} />,
		color: "#8b5cf6",
		features: ["Weekly totals", "Change tracking", "Performance metrics", "Trend analysis"]
	},
	{
		title: "Yearly Sales Trend",
		description: "View annual sales performance and growth",
		link: "/analytics/sales/yearlySalesTrend",
		icon: <RiBubbleChartLine size={32} />,
		color: "#06b6d4",
		features: ["Annual overview", "Year-over-year growth", "Long-term trends", "Performance analysis"]
	},
	{
		title: "Sales by Week and Branch",
		description: "Compare weekly performance across branches",
		link: "/analytics/sales/salesByWeekAndBranch",
		icon: <RiBuildingLine size={32} />,
		color: "#10b981",
		features: ["Weekly branch comparison", "Regional trends", "Performance analysis", "Branch insights"]
	},
	{
		title: "Clinician Sales",
		description: "Track sales performance by clinician",
		link: "/analytics/sales/totalSalesByClinician",
		icon: <RiHospitalLine size={32} />,
		color: "#3b82f6",
		features: ["Clinician rankings", "Medical service sales", "Performance metrics", "Specialty analysis"]
	},
	{
		title: "Organization Sales",
		description: "Analyze sales by organization/client",
		link: "/analytics/sales/totalSalesByOrganization",
		icon: <RiGroupLine size={32} />,
		color: "#8b5cf6",
		features: ["Client analysis", "Organization rankings", "B2B sales tracking", "Account management"]
	},
	{
		title: "Outsourced Services",
		description: "Track performance of outsourced services",
		link: "/analytics/sales/totalSalesByOutsourcedStatus",
		icon: <RiExternalLinkLine size={32} />,
		color: "#f97316",
		features: ["Outsourcing analysis", "Service comparison", "Cost vs performance", "Vendor metrics"]
	},
	{
		title: "Service Category Sales",
		description: "Analyze sales by service categories",
		link: "/analytics/sales/totalSalesByServiceCategory",
		icon: <RiServiceLine size={32} />,
		color: "#ec4899",
		features: ["Category breakdown", "Service popularity", "Revenue analysis", "Product mix"]
	}
];

export default function AnalyticsSales() {
	const { applicationsettings } = useApplicationSettings();
	const { branchid, user } = applicationsettings || {};
	const employeeid = user?.employeeid;

	const quickAccessCards: QuickAccessCard[] = [
		{
			title: "Sales Overview",
			description: "View overall sales performance",
			link: "/analytics/sales",
			icon: <RiBarChartLine size={32} />,
			color: "#2563eb",
			stats: "This Month"
		},
		{
			title: "Daily Trends",
			description: "Track daily sales performance",
			link: "/analytics/sales/dailySalesTrend",
			icon: <RiLineChartLine size={32} />,
			color: "#16a34a",
			stats: "View Trends"
		},
		{
			title: "Employee Performance",
			description: "Track employee sales metrics",
			link: "/analytics/sales/totalSalesByEmployee",
			icon: <RiUserLine size={32} />,
			color: "#8b5cf6",
			stats: "Monthly"
		},
		{
			title: "Weekly Trends",
			description: "Analyze weekly sales patterns",
			link: "/analytics/sales/weeklySalesTrend",
			icon: <RiCalendarLine size={32} />,
			color: "#06b6d4",
			stats: "This Year"
		},
		{
			title: "Yearly Overview",
			description: "View annual sales performance",
			link: "/analytics/sales/yearlySalesTrend",
			icon: <RiBubbleChartLine size={32} />,
			color: "#84cc16",
			stats: "Annual"
		}
	];

	return (
		<div className="container-fluid p-4">
			{/* Header */}
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h2 className="mb-1">
						<RiBarChartLine className="me-2" />
						Sales Analytics
					</h2>
					<p className="text-muted mb-0">Comprehensive sales performance and revenue insights</p>
				</div>
			</div>

			{/* Overview Content */}
			<div>
				<div className="mb-4">
					<h5 className="mb-3 fw-semibold">Quick Access</h5>
					<div className="row g-3">
						{quickAccessCards.map((card, index) => (
							<div key={card.link} className="col-md-6 col-lg-3">
								<Link href={card.link} className="text-decoration-none">
									<div
										className="border rounded p-4 h-100 position-relative overflow-hidden"
										style={{
											backgroundColor: 'var(--bs-body-bg)',
											transition: 'all 0.2s',
											cursor: 'pointer'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.borderColor = card.color;
											e.currentTarget.style.transform = 'translateY(-2px)';
											e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.borderColor = COLOR_BORDER;
											e.currentTarget.style.transform = 'translateY(0)';
											e.currentTarget.style.boxShadow = 'none';
										}}
									>
										<div className="mb-3" style={{ color: card.color }}>
											{card.icon}
										</div>
										<h6 className="fw-bold mb-2 text-body-emphasis">{card.title}</h6>
										<p className="small text-muted mb-2">{card.description}</p>
										{card.stats && (
											<div className="small fw-medium" style={{ color: card.color }}>
												{card.stats}
											</div>
										)}
										<div className="d-flex align-items-center small mt-2" style={{ color: card.color }}>
											<span className="me-1">View</span>
											<RiArrowRightLine size={16} />
										</div>
									</div>
								</Link>
							</div>
						))}
					</div>
				</div>

				{/* Sales Modules Overview */}
				<div className="mb-4">
					<h5 className="mb-3 fw-semibold">Analytics Modules</h5>
					<div className="row g-3">
						{salesModules.map((module, index) => (
							<div key={module.link} className="col-md-6 col-lg-3">
								<div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
									<div className="d-flex align-items-center mb-3">
										<div style={{ color: module.color }}>
											{module.icon}
										</div>
										<div className="ms-3">
											<h6 className="fw-bold mb-1">{module.title}</h6>
											<p className="small text-muted mb-0">{module.description}</p>
										</div>
									</div>
									<div className="mb-3">
										{module.features.slice(0, 2).map((feature, idx) => (
											<div key={`${module.title}-feature-${idx}`} className="small text-muted mb-1">
												• {feature}
											</div>
										))}
									</div>
									<Link href={module.link} className="btn btn-sm w-100" style={{ backgroundColor: module.color, borderColor: module.color }}>
										Explore Analytics
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Getting Started */}
				<div className="row g-4">
					<div className="col-12">
						<div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
							<h5 className="mb-3 fw-semibold">Getting Started with Sales Analytics</h5>
							<div className="row g-3">
								<div className="col-md-4">
									<div className="d-flex align-items-start">
										<div className="me-3 mt-1">
											<div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
												1
											</div>
										</div>
										<div>
											<h6 className="mb-1">Review Key Metrics</h6>
											<p className="small text-muted mb-2">Check revenue, orders, and customer data</p>
											<Link href="/analytics/sales" className="small">
												View Dashboard →
											</Link>
										</div>
									</div>
								</div>
								<div className="col-md-4">
									<div className="d-flex align-items-start">
										<div className="me-3 mt-1">
											<div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
												2
											</div>
										</div>
										<div>
											<h6 className="mb-1">Analyze Daily Trends</h6>
											<p className="small text-muted mb-2">Identify daily patterns and growth opportunities</p>
											<Link href="/analytics/sales/dailySalesTrend" className="small">
												Explore Trends →
											</Link>
										</div>
									</div>
								</div>
								<div className="col-md-4">
									<div className="d-flex align-items-start">
										<div className="me-3 mt-1">
											<div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
												3
											</div>
										</div>
										<div>
											<h6 className="mb-1">Compare Branches</h6>
											<p className="small text-muted mb-2">Analyze performance across different branches</p>
											<Link href="/analytics/sales/salesByWeekAndBranch" className="small">
												Branch Analysis →
											</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="row g-4 mt-2">
					<div className="col-12">
						<div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
							<h5 className="mb-3 fw-semibold">Quick Actions</h5>
							<div className="row g-2">
								<div className="col-md-3">
									<Link href="/analytics/sales/dailySalesTrend" className="btn btn-outline-primary w-100">
										<RiLineChartLine className="me-1" />
										Daily Trends
									</Link>
								</div>
								<div className="col-md-3">
									<Link href="/analytics/sales/monthlySalesTrend" className="btn btn-outline-success w-100">
										<RiBarChartLine className="me-1" />
										Monthly Trends
									</Link>
								</div>
								<div className="col-md-3">
									<Link href="/analytics/sales/salesByWeekAndBranch" className="btn btn-outline-info w-100">
										<RiStoreLine className="me-1" />
										Branch Analysis
									</Link>
								</div>
								<div className="col-md-3">
									<Link href="/analytics/sales/totalSalesByEmployee" className="btn btn-outline-warning w-100">
										<RiUserLine className="me-1" />
										Employee Performance
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
