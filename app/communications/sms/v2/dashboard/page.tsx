"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { customFetch } from '../../../../../components/Auth/customFetch';

// --- ICONS (from @remixicons/react) ---
import {
	RiErrorWarningLine,
	RiArchiveLine,
	RiCheckboxCircleLine,
	RiTimeLine,
	RiCloseCircleLine
} from "@remixicon/react";

// --- TYPE DEFINITIONS ---
type PieData = { name: string; value: number };

interface StatCardProps {
	title: string;
	value: number;
	percentage: string;
	color: string;
	Icon: React.ElementType;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: any[];
	total: number;
}

interface StateDisplayProps {
	message: string;
}

// --- COLOR CONSTANTS ---
const PIE_CHART_COLORS = {
	Sent: '#3B82F6',    // Blue
	Pending: '#F97316', // Orange
	Failed: '#EF4444',  // Red
};



const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
	<div className="container-fluid p-3 p-md-4 bg-light">
		<header className="mb-4">
			<h3 className="h4 fw-bold text-dark mb-1">SMS Delivery Status</h3>
			<p className="text-muted small mb-0">An overview of your recent messaging campaigns.</p>
		</header>
		<main>{children}</main>
	</div>
);

const StatCard: React.FC<StatCardProps> = ({ title, value, percentage, color, Icon }) => (
	<div
		className="card h-100 shadow-sm border-0"
		style={{ borderTop: `4px solid ${color}` }}
	>
		<div className="card-body py-3">
			<div className="d-flex align-items-center justify-content-between mb-1">
				<p className="card-text text-muted mb-0 small">{title}</p>
				<Icon style={{ height: '20px', width: '20px', color }} />
			</div>
			<h3 className="card-title fw-bold text-dark mb-1" style={{ fontSize: '1.5rem' }}>{value.toLocaleString()}</h3>
			<p className="card-text mb-0"><small className="text-muted">{percentage}% of total</small></p>
		</div>
	</div>
);

const LoadingState: React.FC = () => (
	<div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
		<div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
			<span className="visually-hidden">Loading...</span>
		</div>
		<p className="mt-3">Loading analytics...</p>
	</div>
);

const ErrorState: React.FC<StateDisplayProps> = ({ message }) => (
	<div className="alert alert-danger d-flex flex-column align-items-center text-center p-4">
		<RiErrorWarningLine style={{ height: '32px', width: '32px' }} />
		<h4 className="alert-heading mt-2">An Error Occurred</h4>
		<p className="mb-0">{message}</p>
	</div>
);

const ChartPlaceholder: React.FC<StateDisplayProps> = ({ message }) => (
	<div className="d-flex h-100 flex-column align-items-center justify-content-center text-muted" style={{ minHeight: '250px' }}>
		<RiArchiveLine style={{ height: '40px', width: '40px' }} />
		<p className="mt-3 text-center">{message}</p>
	</div>
);

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload, total }) => {
	if (active && payload && payload.length && total > 0) {
		const data = payload[0];
		return (
			<div className="card shadow-sm p-2">
				<div className="card-body p-1">
					<p className="fw-semibold mb-1" style={{ color: data.payload.fill }}>{data.name}</p>
					<p className="mb-1" style={{ fontSize: '0.9rem' }}>Count: {data.value.toLocaleString()}</p>
					<p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>{((data.value / total) * 100).toFixed(1)}% of total</p>
				</div>
			</div>
		);
	}
	return null;
};

const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
	if (percent < 0.05) return null; // Don't render label for very small slices
	const RADIAN = Math.PI / 180;
	const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);

	return (
		<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="fw-semibold" style={{ fontSize: '0.8rem' }}>
			{`${(percent * 100).toFixed(0)}%`}
		</text>
	);
};

// --- MAIN DASHBOARD COMPONENT ---

export default function SmsDashboard() {
	const [pieData, setPieData] = useState<PieData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		// ... fetching logic remains the same
		const fetchAnalytics = async () => {
			setLoading(true);
			try {
				const res = await customFetch('prime/sms-analytics/job-status-counts');
				if (res && res.success && res.data) {
					setPieData([
						{ name: "Sent", value: res.data.sent || 0 },
						{ name: "Pending", value: res.data.pending || 0 },
						{ name: "Failed", value: res.data.failed || 0 },
					]);
				} else {
					setError("No analytics data could be retrieved.");
				}
			} catch (err) {
				setError("Failed to connect to the analytics service.");
			} finally {
				setLoading(false);
			}
		};
		fetchAnalytics();
	}, []);

	const totalPieData = pieData.reduce((sum, entry) => sum + entry.value, 0);

	const statIcons = {
		Sent: RiCheckboxCircleLine,
		Pending: RiTimeLine,
		Failed: RiCloseCircleLine,
	};

	if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
	if (error) return <DashboardLayout><ErrorState message={error} /></DashboardLayout>;

	return (
		<DashboardLayout>
			{totalPieData > 0 && (
				<div className="row g-3 g-lg-4 mb-4">
					{pieData.map((entry) => (
						<div className="col-md-4" key={entry.name}>
							<StatCard
								title={entry.name}
								value={entry.value}
								percentage={totalPieData > 0 ? ((entry.value / totalPieData) * 100).toFixed(1) : '0.0'}
								color={PIE_CHART_COLORS[entry.name as keyof typeof PIE_CHART_COLORS]}
								Icon={statIcons[entry.name as keyof typeof statIcons]}
							/>
						</div>
					))}
				</div>
			)}

			<div className="card col-4">
				<div className="card-header bg-white border-bottom-0 pt-3">
					<h3 className="h5 fw-semibold text-dark">Status Distribution</h3>
				</div>
				<div className="card-body pt-0">
					{totalPieData > 0 ? (
						<ResponsiveContainer width="100%" height={220}>
							<PieChart>
								<Pie
									data={pieData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={80}
									innerRadius={45}
									labelLine={false}
									label={renderCustomizedPieLabel}
									paddingAngle={2}
								>
									{pieData.map((entry) => (
										<Cell key={`cell-${entry.name}`} fill={PIE_CHART_COLORS[entry.name as keyof typeof PIE_CHART_COLORS]} />
									))}
								</Pie>
								<Tooltip content={<CustomPieTooltip total={totalPieData} />} />
								<Legend iconType="circle" />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<ChartPlaceholder message="No delivery status data to display." />
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}