"use client";

import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Form, InputGroup } from 'react-bootstrap';
import Link from 'next/link';
import {
	RiBarChartBoxLine,
	RiUserLine,
	RiCalendarEventLine,
	RiPhoneLine,
	RiErrorWarningLine,
	RiCalculatorLine,
	RiArrowRightLine,
	RiArrowUpLine,
	RiArrowDownLine,
	RiSearchLine
} from "@remixicon/react";

// Enhanced data structure for different views
const analyticsPages = [
	{
		title: "Patient Dashboards",
		description: "Overview of key patient metrics and statistics",
		icon: <RiBarChartBoxLine size={24} />,
		href: "/analytics/patients/dashboards",
		color: "primary"
	},
	{
		title: "Age Distribution",
		description: "Patient distribution across different age groups",
		icon: <RiUserLine size={24} />,
		href: "/analytics/patients/age-distribution",
		color: "success"
	},
	{
		title: "Gender Distribution",
		description: "Patient gender breakdown and analysis",
		icon: <RiCalculatorLine size={24} />,
		href: "/analytics/patients/gender-distribution",
		color: "info"
	},
	{
		title: "Marital Status",
		description: "Marital status distribution of patients",
		icon: <RiUserLine size={24} />,
		href: "/analytics/patients/marital-status",
		color: "warning"
	},
	{
		title: "Registration Over Time",
		description: "Patient registration trends and patterns",
		icon: <RiCalendarEventLine size={24} />,
		href: "/analytics/patients/patient-registration-over-time",
		color: "secondary"
	},
	{
		title: "Occupation Distribution",
		description: "Patient occupations and employment analysis",
		icon: <RiBarChartBoxLine size={24} />,
		href: "/analytics/patients/occupation-distribution",
		color: "dark"
	},
	{
		title: "Missing Data Analysis",
		description: "Analysis of incomplete patient information",
		icon: <RiErrorWarningLine size={24} />,
		href: "/analytics/patients/missing-data-analysis",
		color: "danger"
	},
	{
		title: "Contact Completeness",
		description: "Patient contact information completion status",
		icon: <RiPhoneLine size={24} />,
		href: "/analytics/patients/contact-completeness",
		color: "success"
	},
	{
		title: "Registration by Day",
		description: "Weekly patient registration patterns",
		icon: <RiCalendarEventLine size={24} />,
		href: "/analytics/patients/registration-by-day",
		color: "info"
	}
]; const Page: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');

	const filteredPages = analyticsPages.filter(page =>
		page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
		page.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<Container fluid className="py-4 bg-white min-vh-100">
			{/* Header & Controls */}
			<div className="row mb-5 align-items-end">
				<div className="col-md-6">
					<h1 className="h3 fw-bold mb-1">Patient Analytics</h1>
					<p className="text-muted mb-0">Comprehensive patient data analysis and insights</p>
				</div>
			</div>

			{/* Content Area */}
			<div className="animate-fade-in">
				<Row className="g-4">
					{filteredPages.map((page, index) => (
						<Col key={index} md={6} lg={4} xl={3}>
							<Link href={page.href} className="text-decoration-none">
								<Card className="h-100 border border-opacity-25 hover-lift ">
									<Card.Body className="p-4 d-flex flex-column">
										<div className="d-flex justify-content-between align-items-start mb-3">
											<div className={`p-2 rounded-3 bg-${page.color} bg-opacity-10 text-${page.color}`}>
												{page.icon}
											</div>
										</div>
										<div className="mt-auto">
											<p className="text-muted small mb-3 line-clamp-2">{page.description}</p>
											<h6 className="text-body-emphasis mb-0 d-flex align-items-center">
												{page.title}
												<RiArrowRightLine size={16} className="ms-auto opacity-0 arrow-reveal" />
											</h6>
										</div>
									</Card.Body>
								</Card>
							</Link>
						</Col>
					))}
				</Row>
			</div>
		</Container>
	);
};

export default Page;
