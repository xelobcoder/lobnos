'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer as RC2, Tooltip as RechartsTooltip, Legend as RechartsLegend, BarChart, Bar, AreaChart, Area } from "recharts";
// --- Job Trends Tooltip ---
const JobTrendsTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className="card shadow-sm p-2">
				<div className="card-body p-1">
					<div className="fw-semibold mb-1">{label}</div>
					{payload.map((entry: any) => (
						<div key={entry.dataKey} className="small mb-1" style={{ color: entry.color }}>
							{entry.name}: {entry.value}
						</div>
					))}
				</div>
			</div>
		);
	}
	return null;
};

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

const RECIPIENT_PIE_COLORS = {
	Queued: '#FACC15', // Yellow
	Sent: '#3B82F6',   // Blue
};
// --- Recipient Delivery Pie Tooltip ---
const RecipientPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload, total }) => {
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
	const [recipientPieData, setRecipientPieData] = useState<PieData[]>([]);
	const [jobTrends, setJobTrends] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [trendView, setTrendView] = useState<'line' | 'bar' | 'area'>('line');
	const [trendStart, setTrendStart] = useState<string>("");
	const [trendEnd, setTrendEnd] = useState<string>("");

	// Date helpers
	const getInitialTrendDates = () => {
		const end = new Date();
		const start = new Date();
		start.setDate(end.getDate() - 14);
		return {
			start: start.toISOString().split("T")[0],
			end: end.toISOString().split("T")[0],
		};
	};

	useEffect(() => {
		const { start, end } = getInitialTrendDates();
		setTrendStart(start);
		setTrendEnd(end);
	}, []);

	useEffect(() => {
		const fetchAnalytics = async () => {
			setLoading(true);
			try {
				// Main status pie
				const res = await customFetch('prime/sms-analytics/job-status-counts');
				// Recipient delivery breakdown pie
				const recRes = await customFetch('api/v1/prime/sms-analytics/recipient-delivery-counts');
				// Job trends by day (with date range)
				let trendsRes;
				if (trendStart && trendEnd) {
					trendsRes = await customFetch(`prime/sms-analytics/job-trends-by-day?startDate=${trendStart}&endDate=${trendEnd}`);
				} else {
					trendsRes = await customFetch('prime/sms-analytics/job-trends-by-day');
				}

				if (res && res.success && res.data) {
					setPieData([
						{ name: "Sent", value: res.data.sent || 0 },
						{ name: "Pending", value: res.data.pending || 0 },
						{ name: "Failed", value: res.data.failed || 0 },
					]);
				} else {
					setError("No analytics data could be retrieved.");
				}
				if (recRes && recRes.success && recRes.data) {
					setRecipientPieData([
						{ name: "Queued", value: recRes.data.queued || 0 },
						{ name: "Sent", value: recRes.data.sent || 0 },
					]);
				}
				if (trendsRes && trendsRes.success && trendsRes.data) {
					const arr = Object.entries(trendsRes.data).map(([date, obj]: [string, any]) => ({
						date,
						Pending: obj.pending || 0,
						Sent: obj.sent || 0,
						Failed: obj.failed || 0,
					}));
					setJobTrends(arr);
				}
			} catch (err) {
				setError("Failed to connect to the analytics service.");
			} finally {
				setLoading(false);
			}
		};
		fetchAnalytics();
	}, [trendStart, trendEnd]);

	const totalPieData = pieData.reduce((sum, entry) => sum + entry.value, 0);
	const totalRecipientPie = recipientPieData.reduce((sum, entry) => sum + entry.value, 0);
	const totalTrends = jobTrends.reduce((sum, entry) => sum + entry.Sent + entry.Pending + entry.Failed, 0);

	const statIcons = {
		Sent: RiCheckboxCircleLine,
		Pending: RiTimeLine,
		Failed: RiCloseCircleLine,
	};

	// --- Custom Tooltip for Trends ---
	const CustomTrendTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const total = payload.reduce((acc: number, p: any) => acc + (p.value || 0), 0);
			return (
				<div className="rounded-lg border p-2 shadow-sm bg-white" style={{ minWidth: '180px', fontSize: '0.85rem' }}>
					<div className="mb-1 fw-semibold">{label}</div>
					{payload.map((entry: any) => (
						<div key={entry.dataKey} className="mb-1" style={{ color: entry.color }}>
							{entry.name}: {entry.value} ({total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0'}%)
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	// --- Chart Type Toggle ---
	const trendViewButtons = [
		{ type: 'line' as const, label: 'Line' },
		{ type: 'bar' as const, label: 'Bar' },
		{ type: 'area' as const, label: 'Area' },
	];

	// --- Date Handlers ---
	const handleTrendStartChange = (e: React.ChangeEvent<HTMLInputElement>) => setTrendStart(e.target.value);
	const handleTrendEndChange = (e: React.ChangeEvent<HTMLInputElement>) => setTrendEnd(e.target.value);
	const handleTrendReset = () => {
		const { start, end } = getInitialTrendDates();
		setTrendStart(start);
		setTrendEnd(end);
	};

	// --- Chart Render ---
	const renderTrendChart = () => {
		const commonProps = {
			data: jobTrends,
			margin: { top: 5, right: 5, left: 20, bottom: 45 },
		};
		const xAxisProps = {
			dataKey: "date",
			angle: -45,
			textAnchor: "end" as const,
			height: 60,
			interval: "preserveStartEnd" as const,
			tick: { fontSize: 11, fill: '#6c757d' },
			axisLine: { stroke: '#dee2e6' },
			tickLine: { stroke: '#dee2e6' },
		};
		const yAxisProps = {
			tick: { fontSize: 11, fill: '#6c757d' },
			axisLine: false,
			tickLine: false,
			allowDecimals: false,
		};
		const legendProps = {
			verticalAlign: "top" as const,
			align: "right" as const,
			iconType: "circle" as const,
			iconSize: 8,
			wrapperStyle: { fontSize: '13px', color: '#212529', paddingBottom: '15px' }
		};
		if (trendView === 'bar') {
			return (
				<BarChart {...commonProps}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
					<XAxis {...xAxisProps} />
					<YAxis {...yAxisProps} />
					<RechartsTooltip content={<CustomTrendTooltip />} cursor={{ fill: '#f8f9fa' }} />
					<RechartsLegend {...legendProps} />
					<Bar dataKey="Pending" name="Pending" fill="#F97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
					<Bar dataKey="Sent" name="Sent" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
					<Bar dataKey="Failed" name="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
				</BarChart>
			);
		}
		if (trendView === 'area') {
			return (
				<AreaChart {...commonProps}>
					<defs>
						<linearGradient id="pendingFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#F97316" stopOpacity={0.5} />
							<stop offset="95%" stopColor="#F97316" stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5} />
							<stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="failedFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
							<stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
					<XAxis {...xAxisProps} />
					<YAxis {...yAxisProps} />
					<RechartsTooltip content={<CustomTrendTooltip />} cursor={{ fill: '#f8f9fa' }} />
					<RechartsLegend {...legendProps} />
					<Area type="monotone" dataKey="Pending" name="Pending" stroke="#F97316" fill="url(#pendingFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: '#F97316' }} activeDot={{ r: 6, strokeWidth: 1.5, fill: '#F97316', stroke: '#fff' }} />
					<Area type="monotone" dataKey="Sent" name="Sent" stroke="#3B82F6" fill="url(#sentFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: '#3B82F6' }} activeDot={{ r: 6, strokeWidth: 1.5, fill: '#3B82F6', stroke: '#fff' }} />
					<Area type="monotone" dataKey="Failed" name="Failed" stroke="#EF4444" fill="url(#failedFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: '#EF4444' }} activeDot={{ r: 6, strokeWidth: 1.5, fill: '#EF4444', stroke: '#fff' }} />
				</AreaChart>
			);
		}
		// Default: line
		return (
			<LineChart {...commonProps}>
				<CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
				<XAxis {...xAxisProps} />
				<YAxis {...yAxisProps} />
				<RechartsTooltip content={<CustomTrendTooltip />} cursor={{ fill: '#f8f9fa' }} />
				<RechartsLegend {...legendProps} />
				<Line type="monotone" dataKey="Pending" stroke="#F97316" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: '#F97316' }} activeDot={{ r: 6, strokeWidth: 1.5, fill: '#F97316', stroke: '#fff' }} name="Pending" />
				<Line type="monotone" dataKey="Sent" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: '#3B82F6' }} activeDot={{ r: 6, strokeWidth: 1.5, fill: '#3B82F6', stroke: '#fff' }} name="Sent" />
				<Line type="monotone" dataKey="Failed" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: '#EF4444' }} activeDot={{ r: 6, strokeWidth: 1.5, fill: '#EF4444', stroke: '#fff' }} name="Failed" />
			</LineChart>
		);
	};

	// --- Trend Table ---
	// Format date as readable (e.g., Jun 29, 2025)
	const formatDate = (dateStr: string) => {
		const d = new Date(dateStr);
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	};

	const renderTrendTable = () => (
		<div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
			<table className="table table-sm table-hover table-striped small">
				<thead className="sticky-top bg-body-tertiary">
					<tr>
						<th scope="col" className="py-2">Date</th>
						<th scope="col" className="py-2 text-end">Pending</th>
						<th scope="col" className="py-2 text-end">Sent</th>
						<th scope="col" className="py-2 text-end">Failed</th>
						<th scope="col" className="py-2 text-end">Total</th>
					</tr>
				</thead>
				<tbody>
					{jobTrends.map((entry) => {
						const total = entry.Pending + entry.Sent + entry.Failed;
						return (
							<tr key={entry.date}>
								<td className="py-2">{formatDate(entry.date)}</td>
								<td className="py-2 text-end">{entry.Pending}</td>
								<td className="py-2 text-end">{entry.Sent}</td>
								<td className="py-2 text-end">{entry.Failed}</td>
								<td className="py-2 text-end">{total}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);

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

			<div className="row g-3">
				<div className="col-md-6">
					<div className="card h-100">
						<div className="card-header bg-white border-bottom-0 pt-3">
							<h3 className="h5 fw-semibold text-dark mb-0">Status Distribution</h3>
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
				</div>
				<div className="col-md-6">
					<div className="card h-100">
						<div className="card-header bg-white border-bottom-0 pt-3">
							<h3 className="h5 fw-semibold text-dark mb-0">Recipient Delivery Breakdown</h3>
						</div>
						<div className="card-body pt-0">
							{totalRecipientPie > 0 ? (
								<ResponsiveContainer width="100%" height={220}>
									<PieChart>
										<Pie
											data={recipientPieData}
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
											{recipientPieData.map((entry) => (
												<Cell key={`cell-recipient-${entry.name}`} fill={RECIPIENT_PIE_COLORS[entry.name as keyof typeof RECIPIENT_PIE_COLORS]} />
											))}
										</Pie>
										<Tooltip content={<RecipientPieTooltip total={totalRecipientPie} />} />
										<Legend iconType="circle" />
									</PieChart>
								</ResponsiveContainer>
							) : (
								<ChartPlaceholder message="No recipient delivery data to display." />
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="card mb-4 mt-4">
				<div className="card-header">
					<div className="row align-items-center g-2">
						<div className="col-12 col-md-4 mb-2 mb-md-0">
							<h3 className="h5 fw-semibold text-dark mb-0">Job Trends by Day</h3>
						</div>
						<div className="col-12 col-md-8">
							<div className="row g-2 flex-nowrap align-items-center">
								<div className="col-auto">
									<input type="date" className="form-control form-control-sm" value={trendStart} onChange={handleTrendStartChange} max={trendEnd} />
								</div>
								<div className="col-auto">
									<input type="date" className="form-control form-control-sm" value={trendEnd} onChange={handleTrendEndChange} min={trendStart} />
								</div>
								<div className="col-auto">
									<button className="btn btn-sm btn-outline-secondary" type="button" onClick={handleTrendReset}>Reset</button>
								</div>
								<div className="col-auto">
									<div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
										{trendViewButtons.map(btn => (
											<button
												key={btn.type}
												type="button"
												className={`btn ${trendView === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
												onClick={() => setTrendView(btn.type)}
											>
												{btn.label}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="card-body pt-0">
					{jobTrends.length === 0 ? (
						<ChartPlaceholder message="No job trend data to display." />
					) : (
						<RC2 width="100%" height={260}>
							{renderTrendChart()}
						</RC2>
					)}
				</div>
				{jobTrends.length > 0 && (
					<div className="card-footer bg-body-tertiary p-3">
						{renderTrendTable()}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
