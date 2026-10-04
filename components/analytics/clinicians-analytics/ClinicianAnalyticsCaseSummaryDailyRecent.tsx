"use client";
import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { currencyFormatter, reactSelectCustomStyles } from '../../Auth/customFetch'; // Assuming reactSelectCustomStyles is defined
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
	AreaChart, Area
} from 'recharts';
import Select from 'react-select';
import { ClinicianAnalyticsCaseSummaryDailyServerSide } from '../../serverActions/ActionFiltering';
import { RiLineChartLine, RiErrorWarningLine, RiCalendarLine, RiInbox2Line, RiLoader4Line, RiBarChartHorizontalLine, RiNumbersLine, RiRefreshLine, RiBarChartBoxLine, RiUser3Line, RiMapPinLine, RiMailLine, RiPhoneLine } from '@remixicon/react'; // Added more icons
import Head from 'next/head';


interface DailyCaseSummary {
	date: string;
	year: number;
	clinician_cases: number;
	total_cases: number;
	earned_revenue: string;
	total_earned_revenue: string;
	percentage_revenue: string;
}

interface ClinicianAnalyticsCaseSummaryDailyProps {
	clinicianId: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: any[];
	label?: string;
}

// --- Color Palette & Constants (aligning with other components) ---
const SHADCN_PRIMARY = "oklch(0.646 0.222 41.116)"; // Example Blue
const SHADCN_SECONDARY = "oklch(0.769 0.188 70.08)"; // Example Orange/Yellow
const SHADCN_TERTIARY = "oklch(0.6 0.118 184.704)"; // Example Teal/Green

const SHADCN_FOREGROUND = "var(--bs-body-color)"; // Bootstrap body color
const SHADCN_MUTED_FOREGROUND = "var(--bs-secondary-color)";
const SHADCN_BORDER = "var(--bs-border-color)";
const SHADCN_CARD_BG = "var(--bs-body-bg)";
const SHADCN_MUTED_BG = "var(--bs-tertiary-bg)";
const SHADCN_TOOLTIP_BG = "var(--bs-body-bg)"; // Tooltip bg matches card body
const SHADCN_TOOLTIP_FG = "var(--bs-body-color)";
const SHADCN_SPINNER_COLOR = SHADCN_PRIMARY;

const GRADIENT_CLINICIAN = "url(#gradientClinician)";
const GRADIENT_OTHER = "url(#gradientOther)";
const GRADIENT_TOTAL = "url(#gradientTotal)";

const ClinicianAnalyticsCaseSummaryDaily: React.FC<ClinicianAnalyticsCaseSummaryDailyProps> = ({
	clinicianId,
}) => {
	const [dailyData, setDailyData] = useState<DailyCaseSummary[]>([]);
	const [selectedYear, setSelectedYear] = useState<{ value: number; label: string }>({
		value: new Date().getFullYear(),
		label: new Date().getFullYear().toString(),
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [chartType, setChartType] = useState<'line' | 'area'>('area');
	const [clinicianDetails, setClinicianDetails] = useState<any>(null);

	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 10 }, (_, i) => ({ // Increased to 10 years
		value: currentYear - i,
		label: (currentYear - i).toString(),
	}));

	const fetchData = useCallback(() => {
		setLoading(true);
		setError(null);
		ClinicianAnalyticsCaseSummaryDailyServerSide(clinicianId, selectedYear.value)
			.then((response) => {
				console.log(response)
				let data: any[] = [];
				let details = null;
				if (response && typeof response === 'object' && response.dailyCaseSummary) {
					data = Array.isArray(response.dailyCaseSummary) ? response.dailyCaseSummary : [];
					if (Array.isArray(response.clinicianDetails) && response.clinicianDetails.length > 0) {
						details = response.clinicianDetails[0];
					}
				} else if (Array.isArray(response)) {
					data = response;
				}
				setDailyData(data);
				if (details) setClinicianDetails(details);
			})
			.catch((err) => {
				setDailyData([]);
				setError(err instanceof Error ? err.message : "An unknown error occurred while fetching daily summary.");
			})
			.finally(() => setLoading(false));
	}, [clinicianId, selectedYear.value]);


	useEffect(() => {
		fetchData();
	}, [fetchData]);



	const insights = (() => {
		if (!dailyData.length) return { avgClinicianCases: "0.0", peakDay: "N/A", trend: "N/A", peakValue: 0 };
		const avgClinicianCases = dailyData.reduce((sum, item) => sum + item.clinician_cases, 0) / dailyData.length;
		const peakEntry = dailyData.reduce((max, item) => (item.clinician_cases > max.clinician_cases ? item : max), dailyData[0]);
		const trend = dailyData.length > 1 ? (dailyData[dailyData.length - 1].clinician_cases > dailyData[0].clinician_cases ? "Upward" : dailyData[dailyData.length - 1].clinician_cases < dailyData[0].clinician_cases ? "Downward" : "Stable") : "N/A";
		return {
			avgClinicianCases: avgClinicianCases.toFixed(1),
			peakDay: peakEntry ? dayjs(peakEntry.date).format("MMM DD") : "N/A",
			peakValue: peakEntry ? peakEntry.clinician_cases : 0,
			trend,
		};
	})();

	const chartData = dailyData.map((item) => ({
		date: dayjs(item.date).format("MMM DD"),
		clinicianCases: Number(item.clinician_cases) || 0,
		otherCases: Math.max(0, (Number(item.total_cases) || 0) - (Number(item.clinician_cases) || 0)),
		totalCases: Number(item.total_cases) || 0,
		clinicianEarnedRevenue: item.earned_revenue ? parseFloat(item.earned_revenue) : 0,
		totalEarnedRevenue: item.total_earned_revenue ? parseFloat(item.total_earned_revenue) : 0,
		percentageRevenue: item.percentage_revenue ? parseFloat(item.percentage_revenue) : 0,
	}));

	const SHADCN_PAYABLE = "oklch(0.7 0.18 140)"; // Greenish for money

	const CustomTooltipComponent: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
		if (!active || !payload || !payload.length) return null;
		const entry = chartData.find(d => d.date === label);

		return (
			<div className="rounded-lg border p-2 shadow-sm" style={{ backgroundColor: SHADCN_TOOLTIP_BG, borderColor: SHADCN_BORDER, color: SHADCN_TOOLTIP_FG, minWidth: '200px', fontSize: '0.8rem' }}>
				<div className="mb-1 fw-semibold" style={{ color: SHADCN_FOREGROUND }}>{label}</div>
				{Array.isArray(payload) && payload.length > 0 && payload.map((pld, index) => (
					<div key={index} className="d-flex align-items-center my-1">
						<span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: pld.stroke || pld.fill, marginRight: '8px' }}></span>
						<span style={{ color: SHADCN_MUTED_FOREGROUND }}>{pld.name}: </span>
						<span className="fw-medium ms-1" style={{ color: pld.stroke || pld.fill }}>
							{(pld.dataKey === 'clinicianEarnedRevenue' || pld.dataKey === 'totalEarnedRevenue') && typeof pld.value === 'number'
								? currencyFormatter.format(pld.value)
								: pld.value}
						</span>
					</div>
				))}
				{entry && (
					<div className="mt-2 pt-2 border-top">
						<div className="d-flex justify-content-between gap-3">
							<span style={{ color: SHADCN_MUTED_FOREGROUND }}>Clinician Referral:</span>
							<span className="fw-medium">{currencyFormatter.format(entry.clinicianEarnedRevenue)}</span>
						</div>
						<div className="d-flex justify-content-between gap-3">
							<span style={{ color: SHADCN_MUTED_FOREGROUND }}>Total Referral:</span>
							<span className="fw-medium">{currencyFormatter.format(entry.totalEarnedRevenue)}</span>
						</div>
						<div className="d-flex justify-content-between gap-3">
							<span style={{ color: SHADCN_MUTED_FOREGROUND }}>Revenue %:</span>
							<span className="fw-medium">{entry.percentageRevenue.toFixed(2)}%</span>
						</div>
					</div>
				)}
			</div>
		);
	};

	const renderContent = () => {
		if (loading) {
			return (<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}><RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: SHADCN_SPINNER_COLOR }} /><p style={{ color: SHADCN_MUTED_FOREGROUND }}>Loading daily trends...</p></div>);
		}
		if (error) {
			return (<div className="d-flex flex-column justify-content-center align-items-center text-center p-4" style={{ minHeight: '400px' }}><RiErrorWarningLine size={48} className="mb-3 text-danger" /><h5 className="fw-medium mb-2" style={{ color: SHADCN_FOREGROUND }}>Error Loading Data</h5><p className="px-3 mb-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>{error}</p><button className="btn btn-sm btn-outline-primary d-flex align-items-center" onClick={fetchData}><RiRefreshLine className="me-1" /> Retry</button></div>);
		}
		if (chartData.length === 0) {
			return (<div className="d-flex flex-column justify-content-center align-items-center text-center p-4" style={{ minHeight: '400px' }}><RiInbox2Line size={48} className="mb-3" style={{ color: SHADCN_MUTED_FOREGROUND }} /><h5 className="fw-medium mb-1" style={{ color: SHADCN_FOREGROUND }}>No Data Available</h5><p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>No daily case summary data found for the selected year.</p></div>);
		}

		return (
			<>
				<div className="row g-3 mb-4">
					<InsightCard Icon={RiNumbersLine} title="Avg. Clinician Cases/Day" value={insights.avgClinicianCases} variantColor={SHADCN_PRIMARY} />
					<InsightCard Icon={RiCalendarLine} title="Peak Day (Clinician Cases)" value={`${insights.peakDay} (${insights.peakValue})`} variantColor={SHADCN_SECONDARY} isCurrency={false} />
					<InsightCard Icon={RiBarChartHorizontalLine} title="Overall Trend" value={insights.trend} variantColor={insights.trend === "Upward" ? SHADCN_TERTIARY : insights.trend === "Downward" ? "oklch(0.68 0.22 15)" : SHADCN_MUTED_FOREGROUND} isCurrency={false} />
				</div>
				<div className="mb-4">
					<small className="text-muted" style={{ fontSize: '0.85rem' }}>
						<strong>Note:</strong> These figures represent the total revenue generated from services referred by the clinician (Referral Revenue). This does <strong>not</strong> represent commissions earned by or paid to the clinician.
					</small>
				</div>
				<div style={{ height: "400px" }}> {/* Adjusted chart height slightly */}
					<ResponsiveContainer width="100%" height="100%">
						{chartType === 'area' ? (
							<AreaChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 60 }}>
								<defs>
									<linearGradient id="gradientClinician" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={SHADCN_PRIMARY} stopOpacity={0.8} />
										<stop offset="100%" stopColor={SHADCN_PRIMARY} stopOpacity={0.1} />
									</linearGradient>
									<linearGradient id="gradientOther" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={SHADCN_SECONDARY} stopOpacity={0.7} />
										<stop offset="100%" stopColor={SHADCN_SECONDARY} stopOpacity={0.1} />
									</linearGradient>
									<linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={SHADCN_TERTIARY} stopOpacity={0.6} />
										<stop offset="100%" stopColor={SHADCN_TERTIARY} stopOpacity={0.1} />
									</linearGradient>
									<linearGradient id="gradientPayable" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={SHADCN_PAYABLE} stopOpacity={0.6} />
										<stop offset="100%" stopColor={SHADCN_PAYABLE} stopOpacity={0.1} />
									</linearGradient>
								</defs>
								<CartesianGrid stroke={SHADCN_BORDER} strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="date" fontSize={11} tick={{ fill: SHADCN_MUTED_FOREGROUND }} angle={-45} textAnchor="end" height={70} tickLine={{ stroke: SHADCN_BORDER }} axisLine={{ stroke: SHADCN_BORDER }} interval="preserveStartEnd" />
								<YAxis fontSize={11} width={50} tick={{ fill: SHADCN_MUTED_FOREGROUND }} tickLine={false} axisLine={false} />
								<YAxis yAxisId="right" orientation="right" fontSize={11} width={70} tick={{ fill: SHADCN_PAYABLE }} tickLine={false} axisLine={false} tickFormatter={v => v == null ? '' : currencyFormatter.format(v)} />
								<Tooltip content={<CustomTooltipComponent />} cursor={{ stroke: SHADCN_PRIMARY, strokeWidth: 1, strokeDasharray: "3 3" }} />
								<Legend wrapperStyle={{ fontSize: "13px", paddingTop: "15px", color: SHADCN_FOREGROUND }} formatter={(value) => <span style={{ color: SHADCN_MUTED_FOREGROUND }}>{value}</span>} />
								<Area type="monotone" dataKey="totalCases" name="Total Cases" stroke={SHADCN_TERTIARY} strokeWidth={2} fill="url(#gradientTotal)" />
								<Area type="monotone" dataKey="otherCases" name="Other Cases" stroke={SHADCN_SECONDARY} strokeWidth={2} fill="url(#gradientOther)" />
								<Area type="monotone" dataKey="clinicianCases" name="Clinician Cases" stroke={SHADCN_PRIMARY} strokeWidth={2.5} fill="url(#gradientClinician)" />
								<Area type="monotone" dataKey="clinicianEarnedRevenue" name="Clinician Referral" stroke={SHADCN_PAYABLE} strokeWidth={2} fill="url(#gradientPayable)" yAxisId="right" />
							</AreaChart>
						) : (
							<LineChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 60 }}>
								<defs>
									<linearGradient id="gradientClinician" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SHADCN_PRIMARY} stopOpacity={0.8} /><stop offset="100%" stopColor={SHADCN_PRIMARY} stopOpacity={0.2} /></linearGradient>
									<linearGradient id="gradientOther" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SHADCN_SECONDARY} stopOpacity={0.7} /><stop offset="100%" stopColor={SHADCN_SECONDARY} stopOpacity={0.1} /></linearGradient>
									<linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SHADCN_TERTIARY} stopOpacity={0.9} /><stop offset="100%" stopColor={SHADCN_TERTIARY} stopOpacity={0.3} /></linearGradient>
								</defs>
								<CartesianGrid stroke={SHADCN_BORDER} strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="date" fontSize={11} tick={{ fill: SHADCN_MUTED_FOREGROUND }} angle={-45} textAnchor="end" height={70} tickLine={{ stroke: SHADCN_BORDER }} axisLine={{ stroke: SHADCN_BORDER }} interval="preserveStartEnd" />
								<YAxis fontSize={11} width={50} tick={{ fill: SHADCN_MUTED_FOREGROUND }} tickLine={false} axisLine={false} />
								<YAxis yAxisId="right" orientation="right" fontSize={11} width={70} tick={{ fill: SHADCN_PAYABLE }} tickLine={false} axisLine={false} tickFormatter={v => v == null ? '' : currencyFormatter.format(v)} />
								<Tooltip content={<CustomTooltipComponent />} cursor={{ stroke: SHADCN_PRIMARY, strokeWidth: 1, strokeDasharray: "3 3" }} />
								<Legend wrapperStyle={{ fontSize: "13px", paddingTop: "15px", color: SHADCN_FOREGROUND }} formatter={(value) => <span style={{ color: SHADCN_MUTED_FOREGROUND }}>{value}</span>} />
								<Line type="monotone" dataKey="clinicianCases" name="Clinician Cases" stroke={SHADCN_PRIMARY} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1.5, fill: SHADCN_PRIMARY }} activeDot={{ r: 6, fill: SHADCN_PRIMARY, stroke: SHADCN_CARD_BG, strokeWidth: 2 }} />
								<Line type="monotone" dataKey="otherCases" name="Other Cases" stroke={SHADCN_SECONDARY} strokeWidth={2} dot={{ r: 3, strokeWidth: 1.5, fill: SHADCN_SECONDARY }} activeDot={{ r: 6, fill: SHADCN_SECONDARY, stroke: SHADCN_CARD_BG, strokeWidth: 2 }} />
								<Line type="monotone" dataKey="totalCases" name="Total Cases" stroke={SHADCN_TERTIARY} strokeWidth={2} dot={{ r: 3, strokeWidth: 1.5, fill: SHADCN_TERTIARY }} activeDot={{ r: 6, fill: SHADCN_TERTIARY, stroke: SHADCN_CARD_BG, strokeWidth: 2 }} />
								<Line type="monotone" dataKey="clinicianEarnedRevenue" name="Clinician Referral" stroke={SHADCN_PAYABLE} strokeWidth={2} dot={{ r: 3, strokeWidth: 1.5, fill: SHADCN_PAYABLE }} activeDot={{ r: 6, fill: SHADCN_PAYABLE, stroke: SHADCN_CARD_BG, strokeWidth: 2 }} yAxisId="right" />
							</LineChart>
						)}
					</ResponsiveContainer>
				</div>
				{/* Data Table */}
				{chartData.length > 0 && (
					<div className="mt-4">
						<table className="table table-striped table-hover table-bordered align-middle analytics-table-small">
							<thead className="table-dark">
								<tr>
									<th className="text-center">Date</th>
									<th className="text-center">Clinician Cases</th>
									<th className="text-center">Total Cases</th>
									<th className="text-center">Other Cases</th>
									<th className="text-center">Clinician Referral Revenue</th>
									<th className="text-center">Total Referral Revenue</th>
									<th className="text-center">Revenue %</th>
								</tr>
							</thead>
							<tbody>
								{/* Group rows by month with a visible month header */}
								{(() => {
									if (!chartData.length) return null;
									// Helper to get month/year string from a date string (e.g., 'Jul 2025')
									const getMonthYear = (dateStr: string) => {
										const d = new Date(selectedYear.value + ' ' + dateStr);
										return d.toLocaleString('default', { month: 'long', year: 'numeric' });
									};
									let lastMonth = '';
									return chartData.map((row, idx) => {
										// Try to extract month/year from the original dailyData if available
										let monthYear = '';
										if (dailyData[idx] && dailyData[idx].date) {
											const d = new Date(dailyData[idx].date);
											monthYear = d.toLocaleString('default', { month: 'long', year: 'numeric' });
										} else {
											monthYear = getMonthYear(row.date);
										}
										const showMonthHeader = monthYear !== lastMonth;
										lastMonth = monthYear;
										return [
											showMonthHeader ? (
												<tr key={`month-${monthYear}`} className="table-warning analytics-table-small">
													<td colSpan={7} className="fw-bold text-dark text-uppercase text-center fs-6 py-2">
														{monthYear}
													</td>
												</tr>
											) : null,
											<tr key={idx}>
												<td className="text-center">{row.date}</td>
												<td className="text-center fw-semibold text-primary">{row.clinicianCases}</td>
												<td className="text-center fw-semibold text-info">{row.totalCases}</td>
												<td className="text-center fw-semibold text-warning">{row.otherCases}</td>
												<td className="text-end fw-semibold text-success" style={{ fontFamily: 'monospace' }}>
													{currencyFormatter.format(row.clinicianEarnedRevenue)}
												</td>
												<td className="text-end fw-semibold text-info" style={{ fontFamily: 'monospace' }}>
													{currencyFormatter.format(row.totalEarnedRevenue)}
												</td>
												<td className={`text-center fw-semibold ${row.percentageRevenue >= 50 ? 'text-success' : 'text-danger'}`}>
													{row.percentageRevenue.toFixed(2)}%
												</td>
											</tr>
										];
									});
								})()}
							</tbody>
						</table>
					</div>
				)}
			</>
		);
	};

	return (
		<>
			<div className="card shadow-sm analytics-inter-font" style={{ borderRadius: '0.75rem', borderColor: SHADCN_BORDER, backgroundColor: SHADCN_CARD_BG }}>
				<div className="card-header py-3 px-4" style={{ backgroundColor: SHADCN_MUTED_BG, borderBottom: `1px solid ${SHADCN_BORDER}` }}>
					<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
						<h2 className="fs-6 fw-semibold text-body-emphasis mb-2 mb-md-0 d-flex align-items-center">
							{chartType === 'area' ? (
								<RiBarChartBoxLine size={22} style={{ color: SHADCN_PRIMARY }} className="me-2 flex-shrink-0" />
							) : (
								<RiLineChartLine size={22} style={{ color: SHADCN_PRIMARY }} className="me-2 flex-shrink-0" />
							)}
							Daily Case Contribution Trend
						</h2>
						<div className="d-flex align-items-center gap-3">
							{/* Chart Type Toggle */}
							<div className="btn-group" role="group" aria-label="Chart type">
								<button
									type="button"
									className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
									onClick={() => setChartType('line')}
									title="Line Chart"
								>
									<RiLineChartLine size={16} />
								</button>
								<button
									type="button"
									className={`btn btn-sm ${chartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
									onClick={() => setChartType('area')}
									title="Area Chart"
								>
									<RiBarChartBoxLine size={16} />
								</button>
							</div>
							{/* Year Selection */}
							<div style={{ minWidth: "180px" }}>
								<Select
									options={yearOptions}
									value={selectedYear}
									onChange={(option) => setSelectedYear(option as { value: number; label: string })}
									isSearchable={false}
									styles={reactSelectCustomStyles}
									className="react-select-container"
									classNamePrefix="react-select"
									aria-label="Select Year"
								/>
							</div>
						</div>
					</div>
					{/* Clinician Details Section */}
					{clinicianDetails && (
						<div className="mt-3 px-1 pb-1 border-bottom bg-white">
							<div className="d-flex flex-wrap gap-3 align-items-center small text-secondary">
								<span className="d-flex align-items-center gap-1">
									<RiUser3Line size={16} className="me-1" />
									<strong>Name:</strong> {clinicianDetails.name}
								</span>
								{clinicianDetails.location && (
									<span className="d-flex align-items-center gap-1">
										<RiMapPinLine size={16} className="me-1" />
										<strong>Location:</strong> {clinicianDetails.location}
									</span>
								)}
								{clinicianDetails.email && (
									<span className="d-flex align-items-center gap-1">
										<RiMailLine size={16} className="me-1" />
										<strong>Email:</strong> {clinicianDetails.email}
									</span>
								)}
								{clinicianDetails.phone && (
									<span className="d-flex align-items-center gap-1">
										<RiPhoneLine size={16} className="me-1" />
										<strong>Phone:</strong> {clinicianDetails.phone}
									</span>
								)}
							</div>
						</div>
					)}
				</div>
				<div className="card-body p-3 p-md-4">
					{renderContent()}
				</div>
			</div>
		</>
	);
};

interface InsightCardProps { Icon: React.ElementType; title: string; value: string | number; variantColor: string; isCurrency?: boolean; }
const InsightCard: React.FC<InsightCardProps> = ({ Icon, title, value, variantColor, isCurrency = true }) => (
	<div className="col-md-4">
		<div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '0.5rem', borderLeft: `4px solid ${variantColor}` }}>
			<div className="card-body p-3 d-flex flex-column">
				<div className="d-flex align-items-center mb-2">
					<Icon size={20} style={{ color: variantColor }} className="me-2 flex-shrink-0" />
					<h6 className="text-muted small mb-0 text-truncate">{title}</h6>
				</div>
				<h4 className="fw-bold mt-auto mb-0" style={{ color: variantColor, fontSize: '1.5rem' }}>
					{isCurrency && typeof value === 'number' ? currencyFormatter.format(value) : value}
					{!isCurrency && typeof value === 'string' ? value : ''}
				</h4>
			</div>
		</div>
	</div>
);

export default ClinicianAnalyticsCaseSummaryDaily;