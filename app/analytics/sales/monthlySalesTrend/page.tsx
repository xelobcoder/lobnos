"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	LineChart,
	Line,
	AreaChart,
	Area,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiPieChartLine, RiErrorWarningLine, RiCalendarEventLine, RiInbox2Line, RiLoader4Line, RiRefreshLine, RiFileList3Line, RiMoneyDollarCircleLine, RiPercentLine, RiDiscountPercentLine } from "@remixicon/react";

interface MonthlySalesAPIEntry {
	month: string;
	totalCost: string;
	actual_revenue: string | null;
	accrued_revenue: string;
	total_discount: string;
	totalRefunded: string;
	total_expenses: string;
	net_revenue: string;
	outstanding_debt: string;
}

interface ChartDataEntry {
	month: string;
	totalCost: number;
	actual_revenue: number;
	accrued_revenue: number;
	total_discount: number;
	totalRefunded: number;
	total_expenses: number;
	net_revenue: number;
	outstanding_debt: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_DISCOUNT = 'oklch(0.769 0.188 70.08)';
const COLOR_PAYABLE = 'oklch(0.6 0.118 184.704)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const PIE_CHART_COLORS = [
	COLOR_ACCENT,
	COLOR_PAYABLE,
	COLOR_DISCOUNT,
	'oklch(0.828 0.189 84.429)',
	'oklch(0.398 0.07 227.392)',
	'oklch(0.7 0.2 20)',
	'oklch(0.5 0.15 280)',
	'oklch(0.8 0.1 120)',
];

const monthOrder: { [key: string]: number } = {
	January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
	July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

export default function MonthlySalesTrend() {
	const [data, setData] = useState<ChartDataEntry[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [view, setView] = useState<"pie" | "bar" | "line" | "area">("bar");

	const [pieMetric, setPieMetric] = useState<"totalCost" | "accrued_revenue" | "actual_revenue" | "total_expenses" | "net_revenue" | "outstanding_debt" | "total_discount" | "totalRefunded">("accrued_revenue");

	const { branchid, user } = useApplicationSettings().applicationsettings || {};
	const employeeid = user?.employeeid;

	const getInitialDatesForMonthly = () => {
		const today = new Date();
		const currentYear = today.getFullYear();
		const startDate = new Date(currentYear, 0, 1).toISOString().split("T")[0];
		const endDate = today.toISOString().split("T")[0];
		return { startDate, endDate };
	};

	const [year, setYear] = useState<number>(new Date().getFullYear());

	const getDatesForYear = (selectedYear: number) => {
		const startDate = `${selectedYear}-01-01`;
		const endDate = `${selectedYear}-12-31`;
		return { startDate, endDate };
	};

	const { startDate, endDate } = getDatesForYear(year);

	const fetchData = useCallback(async (fetchYear: number, currentBranchId?: string, currentEmployeeId?: number) => {
		if (!currentBranchId) {
			setError("Branch ID is not available.");
			setData([]);
			setLoading(false);
			return;
		}
		if (!currentEmployeeId) {
			setError("Employee ID is not available. Please log in again.");
			setData([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const url = `financials/billing/summary?key=monthlySalesTrend&year=${fetchYear}&branchid=${currentBranchId}&employeeid=${currentEmployeeId}`;
			const response: MonthlySalesAPIEntry[] = await customFetch(url);

			if (response && Array.isArray(response)) {
				const formattedData = response.map((item: MonthlySalesAPIEntry) => ({
					month: item.month,
					totalCost: parseFloat(item.totalCost) || 0,
					actual_revenue: item.actual_revenue ? parseFloat(item.actual_revenue) : 0,
					accrued_revenue: parseFloat(item.accrued_revenue) || 0,
					total_discount: parseFloat(item.total_discount) || 0,
					totalRefunded: parseFloat(item.totalRefunded) || 0,
					total_expenses: parseFloat(item.total_expenses) || 0,
					net_revenue: parseFloat(item.net_revenue) || 0,
					outstanding_debt: parseFloat(item.outstanding_debt) || 0,
				})).sort((a, b) => (monthOrder[a.month] || 0) - (monthOrder[b.month] || 0));
				setData(formattedData);
				if (formattedData.length === 0) {
					setError(null);
				}
			} else {
				setData([]);
				setError((response as any)?.message || "Failed to fetch data or data is in an unexpected format.");
			}
		} catch (err) {
			setData([]);
			setError(err instanceof Error ? err.message : "An unknown error occurred");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (branchid && employeeid) {
			fetchData(year, branchid, employeeid);
		} else {
			setLoading(false);
			setError("Branch and employee information is not loaded yet.");
		}
	}, [fetchData, year, branchid, employeeid]);

	const handleViewToggle = (newView: "pie" | "bar" | "line" | "area") => {
		setView(newView);
	};

	const handleResetFilters = () => {
		setYear(new Date().getFullYear());
	};

	const overallSummary = useMemo(() => {
		return data.reduce((acc, curr) => {
			acc.totalCost += curr.totalCost;
			acc.actual_revenue += curr.actual_revenue;
			acc.accrued_revenue += curr.accrued_revenue;
			acc.total_discount += curr.total_discount;
			acc.totalRefunded += curr.totalRefunded;
			acc.total_expenses += curr.total_expenses;
			acc.net_revenue += curr.net_revenue;
			acc.outstanding_debt += curr.outstanding_debt;
			return acc;
		}, { totalCost: 0, actual_revenue: 0, accrued_revenue: 0, total_discount: 0, totalRefunded: 0, total_expenses: 0, net_revenue: 0, outstanding_debt: 0 });
	}, [data]);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			let entry: ChartDataEntry;
			let monthLabel: string;

			if (view === 'pie') {
				// For pie chart, find the original data entry by month since pie data is transformed
				const pieEntry = payload[0].payload;
				entry = data.find(d => d.month === pieEntry.month) || data[0];
				monthLabel = pieEntry.month;
			} else {
				entry = payload[0].payload as ChartDataEntry;
				monthLabel = entry.month;
			}

			return (
				<div
					className="rounded-lg border p-2 shadow-sm"
					style={{
						backgroundColor: COLOR_TOOLTIP_BG,
						borderColor: COLOR_BORDER,
						minWidth: '200px',
						fontSize: '0.8rem'
					}}
				>
					<div className="mb-1">
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Month</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{monthLabel}</span>
					</div>
					{payload.map((pld: any, index: number) => {
						const actualDataKey = view === 'pie' ? pieMetric : pld.dataKey;
						const totalForMetric = overallSummary[actualDataKey as keyof typeof overallSummary] || 0;
						const showPercentage = totalForMetric > 0 && (view === 'pie' || pld.dataKey === "totalCost");

						return (
							<div key={index} className="mt-1">
								<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>
									{view === 'pie' ? pieMetricOptions.find(opt => opt.value === pieMetric)?.label || pld.name : pld.name}
								</span>
								<span className="fw-bold d-block" style={{ color: pld.color || pld.payload?.fill || COLOR_ACCENT }}>
									{currencyFormatter.format(pld.value)}
									{showPercentage && ` (${((pld.value / totalForMetric) * 100).toFixed(1)}%)`}
								</span>
							</div>
						);
					})}
				</div>
			);
		}
		return null;
	};

	const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
		const RADIAN = Math.PI / 180;
		const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		if (percent * 100 < 1) return null; // Show labels for slices >= 1%

		return (
			<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="500">
				{`${(percent * 100).toFixed(0)}%`}
			</text>
		);
	};

	const renderChart = () => {
		const commonProps = {
			data: data,
			margin: { top: 5, right: 5, left: 20, bottom: 5 },
		};
		const xAxisProps = {
			dataKey: "month",
			angle: view === "bar" ? -45 : 0,
			textAnchor: view === "bar" ? "end" as const : "middle" as const,
			height: view === "bar" ? 60 : 30,
			interval: "preserveStartEnd" as const,
			tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
			axisLine: { stroke: COLOR_BORDER },
			tickLine: { stroke: COLOR_BORDER },
		};
		const yAxisProps = {
			tickFormatter: (value: number) => currencyFormatter.format(value),
			tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
			axisLine: false,
			tickLine: false,
			width: 95,
		};
		const legendProps = {
			verticalAlign: "top" as const,
			align: "right" as const,
			iconType: "circle" as const,
			iconSize: 8,
			wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
		};

		if (view === "pie") {
			const selectedMetric = pieMetricOptions.find(opt => opt.value === pieMetric);
			const pieData = data.map(item => ({
				month: item.month,
				value: item[pieMetric as keyof typeof item] as number || 0
			}));
			const totalForMetric = pieData.reduce((sum, item) => sum + item.value, 0);

			if (totalForMetric === 0) {
				return (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
						<RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
						<h5 className="fw-medium mb-1">No Data Available</h5>
						<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
							No {selectedMetric?.label.toLowerCase()} data for the selected period.
						</p>
					</div>
				);
			}

			return (
				<PieChart key={`pie-${pieMetric}`} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
					<Pie
						data={pieData}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={renderPieLabel}
						outerRadius={120}
						dataKey="value"
						nameKey="month"
					>
						{pieData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
					<Legend {...legendProps} formatter={(value) => value} />
				</PieChart>
			);
		}

		const ChartComponent = view === "bar" ? BarChart : view === "line" ? LineChart : AreaChart;

		const elements = [
			{ dataKey: "totalCost", name: "Total Cost", color: COLOR_ACCENT, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalCost)" : undefined },
			{ dataKey: "actual_revenue", name: "Actual Revenue", color: 'oklch(0.6 0.15 142)', fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalPaid)" : undefined },
			{ dataKey: "accrued_revenue", name: "Accrued Revenue", color: COLOR_PAYABLE, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalPayable)" : undefined },
			{ dataKey: "total_discount", name: "Total Discount", color: COLOR_DISCOUNT, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalDiscount)" : undefined },
			{ dataKey: "totalRefunded", name: "Refunded", color: 'oklch(0.7 0.2 20)', fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalRefunded)" : undefined },
			{ dataKey: "total_expenses", name: "Total Expenses", color: 'oklch(0.5 0.15 280)', fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalExpenses)" : undefined },
			{ dataKey: "net_revenue", name: "Net Revenue", color: 'oklch(0.8 0.1 120)', fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorNetRevenue)" : undefined },
			{ dataKey: "outstanding_debt", name: "Outstanding Debt", color: 'oklch(0.398 0.07 227.392)', fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorOutstandingDebt)" : undefined },
		];

		return (
			<ChartComponent {...commonProps} barGap={view === "bar" ? 4 : undefined} barCategoryGap={view === "bar" ? "20%" : undefined}>
				{view === "area" && (
					<defs>
						<linearGradient id="colorTotalCost" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="colorTotalPaid" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor='oklch(0.6 0.15 142)' stopOpacity={0.5} /><stop offset="95%" stopColor='oklch(0.6 0.15 142)' stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="colorTotalPayable" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={COLOR_PAYABLE} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_PAYABLE} stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="colorTotalDiscount" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={COLOR_DISCOUNT} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_DISCOUNT} stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="colorTotalRefunded" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor='oklch(0.7 0.2 20)' stopOpacity={0.5} /><stop offset="95%" stopColor='oklch(0.7 0.2 20)' stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="colorTotalExpenses" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor='oklch(0.5 0.15 280)' stopOpacity={0.5} /><stop offset="95%" stopColor='oklch(0.5 0.15 280)' stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="colorNetRevenue" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor='oklch(0.8 0.1 120)' stopOpacity={0.5} /><stop offset="95%" stopColor='oklch(0.8 0.1 120)' stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="colorOutstandingDebt" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor='oklch(0.398 0.07 227.392)' stopOpacity={0.5} /><stop offset="95%" stopColor='oklch(0.398 0.07 227.392)' stopOpacity={0.05} />
						</linearGradient>
					</defs>
				)}
				<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
				<XAxis {...xAxisProps} />
				<YAxis {...yAxisProps} />
				<Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
				<Legend {...legendProps} />
				{elements.map(el => {
					if (view === "bar") {
						return (
							<Bar
								key={el.dataKey}
								dataKey={el.dataKey}
								name={el.name}
								fill={el.color}
								radius={4}
								maxBarSize={100}
								stackId="a"
							/>
						);
					} else if (view === "line") {
						return (
							<Line
								key={el.dataKey}
								type="monotone"
								dataKey={el.dataKey}
								name={el.name}
								stroke={el.color}
								strokeWidth={2}
								dot={{ r: 3, strokeWidth: 1, fill: el.color }}
								activeDot={{ r: 6, strokeWidth: 1.5, fill: el.color, stroke: COLOR_TOOLTIP_BG }}
							/>
						);
					} else if (view === "area") {
						return (
							<Area
								key={el.dataKey}
								type="monotone"
								dataKey={el.dataKey}
								name={el.name}
								stroke={el.color}
								fill={el.fillUrl || el.color}
								fillOpacity={1}
								strokeWidth={2}
								stackId="a"
							/>
						);
					}
					return null;
				})}
			</ChartComponent>
		);
	};

	const renderChartContainerContent = () => {
		if (loading) {
			return (
				<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
					<RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
					<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading monthly sales...</p>
				</div>
			);
		}

		if (error && data.length === 0) {
			return (
				<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
					<RiErrorWarningLine size={48} className="mb-3 text-danger" />
					<h5 className="fw-medium mb-1">Error Loading Data</h5>
					<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
				</div>
			);
		}

		if (data.length === 0) {
			return (
				<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
					<RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
					<h5 className="fw-medium mb-1">No Data Available</h5>
					<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
						No sales data for the selected period or branch.
					</p>
				</div>
			);
		}

		return (
			<ResponsiveContainer width="100%" height={350}>
				{renderChart()}
			</ResponsiveContainer>
		);
	};

	const viewButtons = [
		{ type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
		{ type: "line" as const, icon: RiLineChartLine, label: "Line" },
		{ type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
		{ type: "pie" as const, icon: RiPieChartLine, label: "Pie" },
	];

	const pieMetricOptions = [
		{ value: "totalCost" as const, label: "Total Cost", color: COLOR_ACCENT },
		{ value: "accrued_revenue" as const, label: "Accrued Revenue", color: COLOR_PAYABLE },
		{ value: "actual_revenue" as const, label: "Actual Revenue", color: 'oklch(0.6 0.15 142)' },
		{ value: "total_expenses" as const, label: "Total Expenses", color: 'oklch(0.5 0.15 280)' },
		{ value: "net_revenue" as const, label: "Net Revenue", color: 'oklch(0.8 0.1 120)' },
		{ value: "outstanding_debt" as const, label: "Outstanding Debt", color: 'oklch(0.398 0.07 227.392)' },
		{ value: "total_discount" as const, label: "Total Discount", color: COLOR_DISCOUNT },
		{ value: "totalRefunded" as const, label: "Refunded", color: 'oklch(0.7 0.2 20)' },
	];

	const generateReport = () => {
		if (data.length === 0) return null;

		const peakSalesMonth = data.reduce((prev, current) => (prev.accrued_revenue > current.accrued_revenue) ? prev : current, data[0]);
		const lowestSalesMonth = data.reduce((prev, current) => (prev.accrued_revenue < current.accrued_revenue) ? prev : current, data[0]);

		const averageRevenue = overallSummary.accrued_revenue / data.length;
		const discountImpact = overallSummary.totalCost > 0 ? (overallSummary.total_discount / overallSummary.totalCost) * 100 : 0;
		const refundRate = overallSummary.totalCost > 0 ? (overallSummary.totalRefunded / overallSummary.totalCost) * 100 : 0;
		const paymentRate = overallSummary.accrued_revenue > 0 ? (overallSummary.actual_revenue / overallSummary.accrued_revenue) * 100 : 0;

		// Calculate year-over-year growth if possible
		const currentYearData = data.filter(d => new Date(d.month + ' 1, ' + new Date().getFullYear()).getFullYear() === new Date().getFullYear());
		const previousYearData = data.filter(d => new Date(d.month + ' 1, ' + (new Date().getFullYear() - 1)).getFullYear() === new Date().getFullYear() - 1);

		const yoyGrowth = currentYearData.length > 0 && previousYearData.length > 0
			? ((currentYearData.reduce((sum, curr) => sum + curr.accrued_revenue, 0) /
				previousYearData.reduce((sum, curr) => sum + curr.accrued_revenue, 0)) - 1) * 100
			: null;

		return (
			<div className="mt-4">
				<div className="card border-0 bg-body-tertiary">
					<div className="card-body p-4">
						<h5 className="d-flex align-items-center gap-2 mb-4">
							<RiFileList3Line size={24} style={{ color: COLOR_ACCENT }} />
							<span>Sales Analysis Report</span>
						</h5>

						{/* Key Metrics Grid */}
						<div className="row g-4 mb-4">
							<div className="col-md-3">
								<div className="p-3 bg-white rounded-3 shadow-sm h-100">
									<div className="text-muted small mb-1">Total Accrued Revenue</div>
									<div className="h5 mb-0" style={{ color: COLOR_ACCENT }}>
										{currencyFormatter.format(overallSummary.accrued_revenue)}
									</div>
								</div>
							</div>
							<div className="col-md-3">
								<div className="p-3 bg-white rounded-3 shadow-sm h-100">
									<div className="text-muted small mb-1">Net Revenue</div>
									<div className="h5 mb-0" style={{ color: 'oklch(0.8 0.1 120)' }}>
										{currencyFormatter.format(overallSummary.net_revenue)}
									</div>
								</div>
							</div>
							<div className="col-md-3">
								<div className="p-3 bg-white rounded-3 shadow-sm h-100">
									<div className="text-muted small mb-1">Total Expenses</div>
									<div className="h5 mb-0 text-danger">
										{currencyFormatter.format(overallSummary.total_expenses)}
									</div>
								</div>
							</div>
							<div className="col-md-3">
								<div className="p-3 bg-white rounded-3 shadow-sm h-100">
									<div className="text-muted small mb-1">Outstanding Debt</div>
									<div className="h5 mb-0 text-warning">
										{currencyFormatter.format(overallSummary.outstanding_debt)}
									</div>
								</div>
							</div>
						</div>

						{/* Monthly Performance */}
						<div className="row g-4">
							<div className="col-md-6">
								<div className="bg-white rounded-3 shadow-sm p-3">
									<h6 className="mb-3">Peak Performance</h6>
									<div className="d-flex justify-content-between align-items-center mb-2">
										<span className="text-muted small">Highest Revenue Month</span>
										<span className="fw-medium">{peakSalesMonth.month}</span>
									</div>
									<div className="d-flex justify-content-between align-items-center">
										<span className="text-muted small">Amount</span>
										<span className="fw-medium text-success">
											{currencyFormatter.format(peakSalesMonth.accrued_revenue)}
										</span>
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className="bg-white rounded-3 shadow-sm p-3">
									<h6 className="mb-3">Lowest Performance</h6>
									<div className="d-flex justify-content-between align-items-center mb-2">
										<span className="text-muted small">Lowest Revenue Month</span>
										<span className="fw-medium">{lowestSalesMonth.month}</span>
									</div>
									<div className="d-flex justify-content-between align-items-center">
										<span className="text-muted small">Amount</span>
										<span className="fw-medium text-danger">
											{currencyFormatter.format(lowestSalesMonth.accrued_revenue)}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Insights Panel */}
						<div className="bg-white rounded-3 shadow-sm p-3 mt-4">
							<h6 className="mb-3">Key Insights</h6>
							<ul className="list-unstyled mb-0">
								{discountImpact > 20 && (
									<li className="d-flex align-items-center gap-2 mb-2 text-warning">
										<RiErrorWarningLine size={18} />
										<small>High discount rate may be affecting profitability</small>
									</li>
								)}
								{refundRate > 15 && (
									<li className="d-flex align-items-center gap-2 mb-2 text-danger">
										<RiErrorWarningLine size={18} />
										<small>High refund rate ({refundRate.toFixed(1)}%) requires attention</small>
									</li>
								)}
								{paymentRate < 70 && (
									<li className="d-flex align-items-center gap-2 mb-2 text-warning">
										<RiErrorWarningLine size={18} />
										<small>Low payment rate ({paymentRate.toFixed(1)}%) may indicate collection issues</small>
									</li>
								)}
								{peakSalesMonth.accrued_revenue > averageRevenue * 1.5 && (
									<li className="d-flex align-items-center gap-2 mb-2 text-success">
										<RiLineChartLine size={18} />
										<small>Significant peak in {peakSalesMonth.month} - analyze success factors</small>
									</li>
								)}
								{lowestSalesMonth.accrued_revenue < averageRevenue * 0.5 && (
									<li className="d-flex align-items-center gap-2 mb-2 text-danger">
										<RiErrorWarningLine size={18} />
										<small>Notable dip in {lowestSalesMonth.month} - investigate causes</small>
									</li>
								)}
							</ul>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
				<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
						{view === "pie" ? <RiPieChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" /> : <RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />}
						{view === "pie" ? `${pieMetricOptions.find(opt => opt.value === pieMetric)?.label || 'Monthly'} Distribution` : 'Monthly Sales Trend'}
					</h2>
					<div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
						<div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
							{viewButtons.map(btn => (
								<button
									key={btn.type}
									type="button"
									className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center`}
									onClick={() => handleViewToggle(btn.type)}
									style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
								>
									<btn.icon size={16} className="me-1 flex-shrink-0" /> {btn.label}
								</button>
							))}
						</div>
						<div className="input-group input-group-sm" style={{ flexBasis: '180px', minWidth: '170px' }}>
							<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
								<RiMoneyDollarCircleLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
							</span>
							<select
								className="form-select shadow-none border-start-0"
								value={pieMetric}
								onChange={(e) => setPieMetric(e.target.value as typeof pieMetric)}
								disabled={view !== "pie"}
								title={view === "pie" ? "Select metric for pie chart" : "Switch to pie view to select metric"}
								style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem', opacity: view === "pie" ? 1 : 0.5 }}
							>
								{pieMetricOptions.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
						<div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
							<div className="input-group input-group-sm" style={{ flexBasis: '120px', minWidth: '110px' }}>
								<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
									<RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
								</span>
								<input id="yearMST" type="number" className="form-control shadow-none border-start-0" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2000} max={new Date().getFullYear() + 10} aria-label="Year" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
							</div>
							<button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
								<RiRefreshLine size={16} className="me-1" /> Reset
							</button>
						</div>
					</div>
				</div>
			</div>
			<div className="card-body p-3 p-md-4">
				{error && data.length > 0 && (
					<div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{ borderTopWidth: '3px' }}>
						<RiErrorWarningLine size={18} className="me-2 flex-shrink-0" />
						{error}
						<button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
					</div>
				)}
				{renderChartContainerContent()}
			</div>

			{data.length > 0 && (
				<div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
					<div className="d-flex justify-content-between mb-2">
						<h4 className="fs-6 fw-medium mb-3">Monthly Sales Data</h4>
						<button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
							Print
						</button>
					</div>
					<div className="table-responsive">
						<table className="table table-sm table-hover table-striped small printable-table-with-borders">
							<thead className="sticky-top bg-body-tertiary">
								<tr>
									<th scope="col" className="py-2">Month</th>
									<th scope="col" className="py-2 text-start">Total Cost</th>
									<th scope="col" className="py-2 text-start">Accrued Revenue</th>
									<th scope="col" className="py-2 text-start">Actual Revenue</th>
									<th scope="col" className="py-2 text-start">Outstanding Debt</th>
									<th scope="col" className="py-2 text-start">Total Discount</th>
									<th scope="col" className="py-2 text-start">Refunded</th>
									<th scope="col" className="py-2 text-start">Total Expenses</th>
									<th scope="col" className="py-2 text-start">Net Revenue</th>
									<th scope="col" className="py-2 text-start">Sales Change</th>
									<th scope="col" className="py-2 text-start">Net Revenue Change</th>
									<th scope="col" className="py-2 text-start">Expense Change</th>
									<th scope="col" className="py-2 text-start">% of Total</th>
								</tr>
							</thead>
							<tbody>
								{data.map((entry, index) => {
									const percentageOfTotal = overallSummary.accrued_revenue > 0 ? ((entry.accrued_revenue / overallSummary.accrued_revenue) * 100).toFixed(1) : '0.0';

									// Calculate changes from previous month
									let salesChange = '-';
									let netRevenueChange = '-';
									let expenseChange = '-';

									if (index > 0) {
										const prevEntry = data[index - 1];

										// Sales change (accrued_revenue)
										if (prevEntry.accrued_revenue === 0 && entry.accrued_revenue > 0) {
											salesChange = 'New';
										} else if (prevEntry.accrued_revenue > 0) {
											const change = ((entry.accrued_revenue - prevEntry.accrued_revenue) / prevEntry.accrued_revenue) * 100;
											salesChange = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
										} else {
											salesChange = '0.0%';
										}

										// Net Revenue change
										if (prevEntry.net_revenue === 0 && entry.net_revenue > 0) {
											netRevenueChange = 'New';
										} else if (prevEntry.net_revenue > 0) {
											const change = ((entry.net_revenue - prevEntry.net_revenue) / prevEntry.net_revenue) * 100;
											netRevenueChange = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
										} else {
											netRevenueChange = '0.0%';
										}

										// Expense change
										if (prevEntry.total_expenses === 0 && entry.total_expenses > 0) {
											expenseChange = 'New';
										} else if (prevEntry.total_expenses > 0) {
											const change = ((entry.total_expenses - prevEntry.total_expenses) / prevEntry.total_expenses) * 100;
											expenseChange = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
										} else {
											expenseChange = '0.0%';
										}
									}

									return (
										<tr key={entry.month}>
											<td className="py-2">{entry.month}</td>
											<td className="py-2 text-start">{currencyFormatter.format(entry.totalCost)}</td>
											<td className="py-2 text-start fw-medium">{currencyFormatter.format(entry.accrued_revenue)}</td>
											<td className="py-2 text-start">{entry.actual_revenue >= 0 ? currencyFormatter.format(entry.actual_revenue) : '-'}</td>
											<td className="py-2 text-start">{currencyFormatter.format(entry.outstanding_debt)}</td>
											<td className="py-2 text-start">{currencyFormatter.format(entry.total_discount)}</td>
											<td className="py-2 text-start">{currencyFormatter.format(entry.totalRefunded)}</td>
											<td className="py-2 text-start">{currencyFormatter.format(entry.total_expenses)}</td>
											<td className="py-2 text-start">{currencyFormatter.format(entry.net_revenue)}</td>
											<td className="py-2 text-start small" style={{ color: salesChange === 'New' || (salesChange !== '-' && !salesChange.startsWith('-')) ? '#28a745' : '#dc3545' }}>
												{salesChange}
											</td>
											<td className="py-2 text-start small" style={{ color: netRevenueChange === 'New' || (netRevenueChange !== '-' && !netRevenueChange.startsWith('-')) ? '#28a745' : '#dc3545' }}>
												{netRevenueChange}
											</td>
											<td className="py-2 text-start small" style={{ color: expenseChange === 'New' || (expenseChange !== '-' && !expenseChange.startsWith('-')) ? '#28a745' : '#dc3545' }}>
												{expenseChange}
											</td>
											<td className="py-2 text-start text-muted">{percentageOfTotal}%</td>
										</tr>
									);
								})}
							</tbody>
							<tfoot>
								<tr className="fw-bold border-top">
									<td className="py-2">Total</td>
									<td className="py-2 text-start">{currencyFormatter.format(overallSummary.totalCost)}</td>
									<td className="py-2 text-start">{currencyFormatter.format(overallSummary.accrued_revenue)}</td>
									<td className="py-2 text-start">{currencyFormatter.format(overallSummary.actual_revenue)}</td>
									<td className="py-2 text-start">{currencyFormatter.format(overallSummary.outstanding_debt)}</td>
									<td className="py-2 text-start">{currencyFormatter.format(overallSummary.total_discount)}</td>
									<td className="py-2 text-start">{currencyFormatter.format(overallSummary.totalRefunded)}</td>
									<td className="py-2 text-start">{currencyFormatter.format(overallSummary.total_expenses)}</td>
									<td className="py-2 text-start">{currencyFormatter.format(overallSummary.net_revenue)}</td>
									<td className="py-2 text-start">-</td>
									<td className="py-2 text-start">-</td>
									<td className="py-2 text-start">-</td>
									<td className="py-2 text-start">100.0%</td>
								</tr>
							</tfoot>
						</table>
					</div>
					{generateReport()}
				</div>
			)}

			<style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .table-responsive thead.sticky-top th {
                    border-bottom: 2px solid var(--bs-border-color); 
                }
                .table-responsive thead th {
                    font-weight: bold !important;
                    color: #000 !important;
                }
                @media print {
                    .printable-table-with-borders tbody tr {
                        border: none !important;
                        border-bottom: 2px solid #000 !important;
                    }
                    .printable-table-with-borders tbody tr:nth-child(odd) {
                        background-color: #f8f9fa !important;
                    }
                    .printable-table-with-borders th,
                    .printable-table-with-borders td {
                        padding: 0.25rem 0.5rem !important;
                    }
                    .printable-table-with-borders th:nth-child(8),
                    .printable-table-with-borders td:nth-child(8) {
                        display: none !important;
                    }
                }
            `}</style>
		</div>
	);
}