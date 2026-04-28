"use client";

import { RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiFlaskLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line } from "@remixicon/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, LabelList, LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

interface MonthlyCasesCountData {
	month: string;
	casesCount: number;
}

const YearMonthTestCasesCountPage = () => {
	const [data, setData] = useState<MonthlyCasesCountData[]>([]);
	const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const employeeid = useApplication()?.user?.employeeid;

	const params = useParams();
	const testid = params?.testid;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await customFetch(
					`result/analysis/test/getTestMonthlyCount?testid=${testid}&&employeeid=${employeeid}`
				);
				setData(response);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		if (testid && employeeid) {
			fetchData();
		}
	}, [testid, employeeid]);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const casesCount = payload[0].value;
			return (
				<div
					className="rounded-lg border p-2 shadow-sm"
					style={{
						backgroundColor: COLOR_TOOLTIP_BG,
						borderColor: COLOR_BORDER,
						minWidth: '150px',
						fontSize: '0.8rem'
					}}
				>
					<div className="mb-1">
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Month</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
					</div>
					<div>
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Cases Count</span>
						<span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{casesCount}</span>
					</div>
				</div>
			);
		}
		return null;
	};

	const viewButtons = [
		{ type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
		{ type: "line" as const, icon: RiLineChartLine, label: "Line" },
		{ type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
	];

	const renderChart = () => {
		const commonProps = {
			data,
			margin: { top: 5, right: 5, left: 20, bottom: 45 },
		};

		const xAxisProps = {
			dataKey: "month",
			angle: -45,
			textAnchor: "end" as const,
			height: 60,
			interval: 0,
			tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
			axisLine: { stroke: COLOR_BORDER },
			tickLine: { stroke: COLOR_BORDER },
		};

		const yAxisProps = {
			tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
			axisLine: false,
			tickLine: false,
			width: 50,
		};

		const tooltipProps = {
			content: <CustomTooltip />,
			cursor: { fill: 'var(--bs-tertiary-bg)' },
		};

		const legendProps = {
			verticalAlign: "top" as const,
			align: "right" as const,
			iconType: "circle" as const,
			iconSize: 8,
			wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' },
		};

		if (chartType === 'bar') {
			return (
				<BarChart {...commonProps}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
					<XAxis {...xAxisProps} />
					<YAxis {...yAxisProps} />
					<Tooltip {...tooltipProps} />
					<Legend {...legendProps} />
					<Bar dataKey="casesCount" name="Cases Count" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={40}>
						<LabelList
							dataKey="casesCount"
							position="top"
							style={{ fontSize: '10px', fill: COLOR_TEXT_MUTED, fontWeight: 500 }}
						/>
					</Bar>
				</BarChart>
			);
		} else if (chartType === 'line') {
			return (
				<LineChart {...commonProps}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
					<XAxis {...xAxisProps} />
					<YAxis {...yAxisProps} />
					<Tooltip {...tooltipProps} />
					<Legend {...legendProps} />
					<Line type="monotone" dataKey="casesCount" name="Cases Count" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
				</LineChart>
			);
		} else {
			return (
				<AreaChart {...commonProps}>
					<defs>
						<linearGradient id="colorCasesFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
							<stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
					<XAxis {...xAxisProps} />
					<YAxis {...yAxisProps} />
					<Tooltip {...tooltipProps} />
					<Legend {...legendProps} />
					<Area type="monotone" dataKey="casesCount" name="Cases Count" stroke={COLOR_ACCENT} fill="url(#colorCasesFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
				</AreaChart>
			);
		}
	};

	return (
		<div className="container-fluid px-4 py-3">
			<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
				<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
					<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
						<h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
							<RiFlaskLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
							Monthly Test Case Count
						</h2>
						<div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
							{viewButtons.map(btn => (
								<button
									key={btn.type}
									type="button"
									className={`btn ${chartType === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
									onClick={() => setChartType(btn.type)}
									style={chartType === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
								>
									<btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
								</button>
							))}
						</div>
					</div>
				</div>
				<div className="card-body p-3 p-md-4">
					{loading ? (
						<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
							<RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
							<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading case data...</p>
						</div>
					) : error ? (
						<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
							<RiErrorWarningLine size={48} className="mb-3 text-danger" />
							<h5 className="fw-medium mb-1">Error Loading Data</h5>
							<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
						</div>
					) : data.length === 0 ? (
						<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
							<RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
							<h5 className="fw-medium mb-1">No Data Available</h5>
							<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
								No case data for the selected test.
							</p>
						</div>
					) : (
						<ResponsiveContainer width="100%" height={350}>
							{renderChart()}
						</ResponsiveContainer>
					)}
				</div>
				{data.length > 0 && (
					<div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
						<h4 className="fs-6 fw-medium mb-3">Case Data Table</h4>
						<div className="table-responsive">
							<table className="table table-sm table-hover table-striped small">
								<thead className="bg-body-tertiary">
									<tr>
										<th scope="col" className="py-2">Month</th>
										<th scope="col" className="py-2 text-end">Cases Count</th>
									</tr>
								</thead>
								<tbody>
									{data.map((entry, idx) => (
										<tr key={idx}>
											<td className="py-2">{entry.month}</td>
											<td className="py-2 text-end fw-medium">{entry.casesCount}</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className="fw-bold border-top">
										<td className="py-2">Total</td>
										<td className="py-2 text-end">{data.reduce((sum, entry) => sum + entry.casesCount, 0)}</td>
									</tr>
								</tfoot>
							</table>
						</div>
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
        `}</style>
			</div>
		</div>
	);
};

export default YearMonthTestCasesCountPage;
