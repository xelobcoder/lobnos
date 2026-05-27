"use client";

import React, { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import moment from 'moment';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, LineChart, Line, BarChart, Bar, Legend } from 'recharts';
import { Card, Button, Form } from 'react-bootstrap';
import { RiBarChartBoxLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line, RiRefreshLine, RiFileList3Line } from "@remixicon/react";


const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_SECONDARY = 'oklch(0.769 0.188 70.08)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_CARD_BG = 'var(--bs-body-bg)';
const COLOR_MUTED_BG = 'var(--bs-tertiary-bg)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SPINNER = COLOR_ACCENT;


interface DailyCaseChange {
	date: string;
	year?: number;
	month?: string;
	clinician_cases: number;
	clinicians_earned_revenue: string;
	clinicians_cash_collected: string;
	clinicians_outstanding: string;
	previous_day_cases: number | null;
	previous_day_earned_revenue: string | null;
	previous_day_cash_collected: string | null;
	previous_day_outstanding: string | null;
	percentage_change: string;
	percentage_earned_revenue_change: string;
	percentage_cash_collected_change: string;
	percentage_outstanding_change: string;
}

interface MonthlyCaseChange {
	month: string;
	year?: number;
	date?: string;
	clinician_cases: number;
	clinicians_earned_revenue: string;
	clinicians_cash_collected: string;
	clinicians_outstanding: string;
	previous_month_cases: number | null;
	previous_month_earned_revenue: string | null;
	previous_month_cash_collected: string | null;
	previous_month_outstanding: string | null;
	percentage_change: string;
	percentage_earned_revenue_change: string;
	percentage_cash_collected_change: string;
	percentage_outstanding_change: string;
}

interface YearlyCaseChange {
	year: number;
	month?: string;
	date?: string;
	clinician_cases: number;
	clinicians_earned_revenue: string;
	clinicians_cash_collected: string;
	clinicians_outstanding: string;
	previous_year_cases: number | null;
	previous_year_earned_revenue: string | null;
	previous_year_cash_collected: string | null;
	previous_year_outstanding: string | null;
	percentage_change: string;
	percentage_earned_revenue_change: string;
	percentage_cash_collected_change: string;
	percentage_outstanding_change: string;
}

type CaseData = DailyCaseChange | MonthlyCaseChange | YearlyCaseChange;

interface ClinicianAnalyticsDailyCaseChangeProps {
	clinicianId: number;
}


type TimePeriod = 'daily' | 'monthly' | 'yearly';

const CustomTooltip = ({ active, payload, label }: any) => {
	if (!active || !payload || !payload.length) return null;
	const data = payload[0].payload;
	const percentageChange = parseFloat(data.percentage_change);
	const percentageEarnedChange = parseFloat(data.percentage_earned_revenue_change);
	const percentageCashChange = parseFloat(data.percentage_cash_collected_change);
	const percentageOutstandingChange = parseFloat(data.percentage_outstanding_change);
	// Revenue fields
	const earnedRevenue = data.clinicians_earned_revenue ?? null;
	const cashCollected = data.clinicians_cash_collected ?? null;
	const outstanding = data.clinicians_outstanding ?? null;

	const prevEarnedRevenue = data.previous_day_earned_revenue ?? data.previous_month_earned_revenue ?? data.previous_year_earned_revenue ?? null;
	const prevCashCollected = data.previous_day_cash_collected ?? data.previous_month_cash_collected ?? data.previous_year_cash_collected ?? null;
	const prevOutstanding = data.previous_day_outstanding ?? data.previous_month_outstanding ?? data.previous_year_outstanding ?? null;

	// Format revenue as currency
	const formatCurrency = (val: string | null) => {
		if (!val || isNaN(Number(val))) return '-';
		return 'GH₵' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });
	};

	return (
		<div className="rounded-lg border p-3 " style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, color: COLOR_TOOLTIP_FG, minWidth: '250px', fontSize: '0.875rem' }}>
			<div className="mb-2 fw-semibold" style={{ color: COLOR_TOOLTIP_FG }}>{moment(label).format('MMMM D, YYYY')}</div>
			<div className="d-flex flex-column gap-1">
				<div>Cases: <span className="fw-semibold">{data.clinician_cases}</span></div>
				<div>Clinician Referral Revenue: <span className="fw-semibold">{formatCurrency(earnedRevenue)}</span></div>
				<div>Cash Collected: <span className="fw-semibold">{formatCurrency(cashCollected)}</span></div>
				<div>Outstanding: <span className="fw-semibold">{formatCurrency(outstanding)}</span></div>
				<div>Previous Cases: <span className="fw-semibold">{data.previous_day_cases ?? data.previous_month_cases ?? data.previous_year_cases ?? '-'}</span></div>
				<div>Previous Referral Revenue: <span className="fw-semibold">{formatCurrency(prevEarnedRevenue)}</span></div>
				<div>Previous Cash: <span className="fw-semibold">{formatCurrency(prevCashCollected)}</span></div>
				<div>Previous Outstanding: <span className="fw-semibold">{formatCurrency(prevOutstanding)}</span></div>
				<div className={`fw-semibold ${percentageChange > 0 ? 'text-success' : percentageChange < 0 ? 'text-danger' : 'text-muted'}`}>Cases Change: {percentageChange === 0 ? '-' : `${percentageChange.toFixed(1)}%`}</div>
				<div className={`fw-semibold ${percentageEarnedChange > 0 ? 'text-success' : percentageEarnedChange < 0 ? 'text-danger' : 'text-muted'}`}>Referral Change: {percentageEarnedChange === 0 ? '-' : `${percentageEarnedChange.toFixed(1)}%`}</div>
				<div className={`fw-semibold ${percentageCashChange > 0 ? 'text-success' : percentageCashChange < 0 ? 'text-danger' : 'text-muted'}`}>Cash Change: {percentageCashChange === 0 ? '-' : `${percentageCashChange.toFixed(1)}%`}</div>
				<div className={`fw-semibold ${percentageOutstandingChange > 0 ? 'text-success' : percentageOutstandingChange < 0 ? 'text-danger' : 'text-muted'}`}>Outstanding Change: {percentageOutstandingChange === 0 ? '-' : `${percentageOutstandingChange.toFixed(1)}%`}</div>
			</div>
		</div>
	);
};

const CARD_HEIGHT = '400px';

const ClinicianAnalyticsDailyCaseChange: React.FC<ClinicianAnalyticsDailyCaseChangeProps> = ({ clinicianId }) => {
	const [caseData, setCaseData] = useState<CaseData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
	const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');

	const fetchData = async (period: TimePeriod, year?: number) => {
		setLoading(true);
		try {
			let endpoint = `clinician/anal/case-change/${period}/${clinicianId}`;
			if ((period === 'daily' || period === 'monthly') && year) {
				endpoint += `?year=${year}`;
			}
			const response = await customFetch(endpoint);
			if (response?.success) {
				let sortedData;
				if (period === 'yearly') {

					sortedData = response.data.sort((a: YearlyCaseChange, b: YearlyCaseChange) =>
						a.year - b.year
					);
				} else if (period === 'monthly') {

					sortedData = response.data.sort((a: MonthlyCaseChange, b: MonthlyCaseChange) =>
						moment(a.month).valueOf() - moment(b.month).valueOf()
					);
				} else {

					sortedData = response.data.sort((a: DailyCaseChange, b: DailyCaseChange) =>
						moment(a.date).valueOf() - moment(b.date).valueOf()
					);
				}
				setCaseData(sortedData);
				console.log('Chart data:', sortedData); // Debug log
			} else {
				setError('Failed to fetch data');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unknown error occurred');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(timePeriod, selectedYear);
	}, [clinicianId, timePeriod, selectedYear]); const handleRefreshClick = () => {
		fetchData(timePeriod, selectedYear);
	};

	const handleTimePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const period = event.target.value as TimePeriod;
		setTimePeriod(period);
		if (period === 'yearly') {
			setSelectedYear(new Date().getFullYear()); // Reset year when switching to yearly
		}
	};

	const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const year = parseInt(event.target.value, 10);
		setSelectedYear(year);
	}; if (loading) {
		return (
			<div className="card " style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_CARD_BG }}>
				<div className="card-body p-4 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
					<RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_SPINNER }} />
					<p className="text-muted mb-0" style={{ color: COLOR_TEXT_MUTED }}>Loading case analytics...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="card " style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_CARD_BG }}>
				<div className="card-body p-4 d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
					<RiErrorWarningLine size={48} className="mb-3 text-danger" />
					<h5 className="fw-medium mb-2" style={{ color: COLOR_TOOLTIP_FG }}>Error Loading Data</h5>
					<p className="px-3 mb-0" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>{error}</p>
				</div>
			</div>
		);
	}

	// Transform data for chart rendering
	const chartData = caseData.map(item => ({
		...item,
		clinicians_earned_revenue: parseFloat(item.clinicians_earned_revenue || '0'),
		displayLabel: timePeriod === 'yearly'
			? (item as any).year
			: timePeriod === 'monthly'
				? moment({ year: (item as any).year, month: parseInt((item as any).month) - 1 }).format('MMM YYYY')
				: moment((item as any).date).format('MMM DD, YYYY')
	}));

	console.log('CaseData:', caseData);
	console.log('ChartData:', chartData);

	return (
		<div >
			<div className="row mb-3">
				<div className="col-12 d-flex justify-content-end align-items-center gap-3">
					{(timePeriod === 'daily' || timePeriod === 'monthly') && (
						<Form.Select
							size="sm"
							style={{ width: '120px' }}
							value={selectedYear}
							onChange={handleYearChange}
						>
							{Array.from({ length: 5 }, (_, i) => {
								const year = new Date().getFullYear() - i;
								return <option key={year} value={year}>{year}</option>;
							})}
						</Form.Select>
					)}
					<Form.Select
						size="sm"
						style={{ width: '150px' }}
						value={timePeriod}
						onChange={handleTimePeriodChange}
					>
						<option value="daily">Daily</option>
						<option value="monthly">Monthly</option>
						<option value="yearly">Yearly</option>
					</Form.Select>
					<Button variant="outline-primary" size="sm" onClick={handleRefreshClick} className="d-flex align-items-center gap-2">
						<RiRefreshLine size={16} />
						Refresh
					</Button>
				</div>
			</div>
			{/* Chart on top, table below, single column */}
			<div className="row g-4 flex-column">
				<div className="col-12">
					<Card className="" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_CARD_BG }}>
						<Card.Header className="py-3 px-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: COLOR_MUTED_BG, borderBottom: `1px solid ${COLOR_BORDER}` }}>
							<h5 className="mb-0 d-flex align-items-center" style={{ color: COLOR_TOOLTIP_FG }}>
								<RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
								Case Trend Analysis
							</h5>
							<div className="d-flex gap-2">
								<Button
									variant={chartType === 'area' ? 'primary' : 'outline-primary'}
									size="sm"
									onClick={() => setChartType('area')}
								>
									Area
								</Button>
								<Button
									variant={chartType === 'line' ? 'primary' : 'outline-primary'}
									size="sm"
									onClick={() => setChartType('line')}
								>
									Line
								</Button>
								<Button
									variant={chartType === 'bar' ? 'primary' : 'outline-primary'}
									size="sm"
									onClick={() => setChartType('bar')}
								>
									Bar
								</Button>
							</div>
						</Card.Header>
						<Card.Body className="p-4">
							<div className="mb-3">
								<small className="text-muted" style={{ fontSize: '0.85rem' }}>
									<strong>Note:</strong> These figures represent the total revenue generated from services referred by the clinician (Referral Revenue). This does <strong>not</strong> represent commissions earned by or paid to the clinician.
									<strong> Clinician Referral Revenue</strong> is the revenue generated by the clinicians cases,
									<strong> Cash Collected</strong> is the actual payments received, and
									<strong> Outstanding</strong> is the unpaid balance.
								</small>
							</div>
							<div style={{ height: CARD_HEIGHT }}>
								{chartData.length === 0 ? (
									<div className="d-flex justify-content-center align-items-center h-100">
										<div className="text-center">
											<RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
											<h6 className="fw-medium mb-1" style={{ color: COLOR_TOOLTIP_FG }}>No Data Available</h6>
											<p className="text-muted mb-0" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>No case data found for the selected period.</p>
										</div>
									</div>
								) : (
									<ResponsiveContainer width="100%" height="100%">
										{chartType === 'area' ? (
											<AreaChart data={chartData}>
												<defs>
													<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
														<stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.3} />
														<stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
													</linearGradient>
												</defs>
												<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} opacity={0.3} />
												<XAxis
													dataKey="displayLabel"
													fontSize={12}
													tick={{ fill: COLOR_TEXT_MUTED }}
													angle={-45}
													textAnchor="end"
													height={70}
													axisLine={{ stroke: COLOR_BORDER }}
													tickLine={{ stroke: COLOR_BORDER }}
												/>
												<YAxis orientation="left" fontSize={12} tick={{ fill: COLOR_SECONDARY }}
													tickFormatter={(value) => `GH₵${value.toFixed(0)}`} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} domain={[0, 'dataMax + 100']} />
												<Tooltip content={<CustomTooltip />} />
												<Legend />
												<Area
													type="monotone"
													dataKey="clinicians_earned_revenue"
													stroke={COLOR_SECONDARY}
													fillOpacity={0.6}
													fill="url(#colorRevenue)"
													strokeWidth={3}
													name="Referral Revenue"
												/>
											</AreaChart>
										) : chartType === 'line' ? (
											<LineChart data={chartData}>
												<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} opacity={0.3} />
												<XAxis
													dataKey="displayLabel"
													fontSize={12}
													tick={{ fill: COLOR_TEXT_MUTED }}
													angle={-45}
													textAnchor="end"
													height={70}
													axisLine={{ stroke: COLOR_BORDER }}
													tickLine={{ stroke: COLOR_BORDER }}
												/>
												<YAxis orientation="left" fontSize={12} tick={{ fill: COLOR_SECONDARY }}
													tickFormatter={(value) => `GH₵${value.toFixed(0)}`} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} domain={[0, 'dataMax + 100']} />
												<Tooltip content={<CustomTooltip />} />
												<Legend />
												<Line
													type="monotone"
													dataKey="clinicians_earned_revenue"
													stroke={COLOR_SECONDARY}
													strokeWidth={3}
													name="Referral Revenue"
													dot={{ r: 4 }}
												/>
											</LineChart>
										) : (
											<BarChart data={chartData}>
												<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} opacity={0.3} />
												<XAxis
													dataKey="displayLabel"
													fontSize={12}
													tick={{ fill: COLOR_TEXT_MUTED }}
													angle={-45}
													textAnchor="end"
													height={70}
													axisLine={{ stroke: COLOR_BORDER }}
													tickLine={{ stroke: COLOR_BORDER }}
												/>
												<YAxis orientation="left" fontSize={12} tick={{ fill: COLOR_SECONDARY }}
													tickFormatter={(value) => `GH₵${value.toFixed(0)}`} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} domain={[0, 'dataMax + 100']} />
												<Tooltip content={<CustomTooltip />} />
												<Legend />
												<Bar
													dataKey="clinicians_earned_revenue"
													fill={COLOR_SECONDARY}
													name="Referral Revenue"
												/>
											</BarChart>
										)}
									</ResponsiveContainer>
								)}
							</div>
						</Card.Body>
					</Card>
				</div>
			</div>
			<div className="col-12">
				<Card className="" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_CARD_BG }}>
					<Card.Header className="py-3 px-4" style={{ backgroundColor: COLOR_MUTED_BG, borderBottom: `1px solid ${COLOR_BORDER}` }}>
						<h5 className="mb-0 d-flex align-items-center" style={{ color: COLOR_TOOLTIP_FG }}>
							<RiFileList3Line size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
							Detailed Case Analysis
						</h5>
					</Card.Header>
					<Card.Body className="p-4 d-flex flex-column">
						<div className="table-responsive" style={{ height: CARD_HEIGHT, flex: 1 }}>
							<table className="table table-hover table-striped align-middle" style={{ overflowY: 'auto' }}>
								<thead className="table-light sticky-top">
									<tr>
										<th className="text-center py-3">{timePeriod === 'yearly' ? 'Year' : timePeriod === 'monthly' ? 'Month' : 'Date'}</th>
										<th className="text-center py-3">Cases</th>
										<th className="text-center py-3">Referral Revenue</th>
										<th className="text-center py-3">Cash Collected</th>
										<th className="text-center py-3">Outstanding</th>
										<th className="text-center py-3">Previous {timePeriod === 'yearly' ? 'Year' : timePeriod === 'monthly' ? 'Month' : 'Day'} Cases</th>
										<th className="text-center py-3">Previous Referral</th>
										<th className="text-center py-3">Change</th>
										<th className="text-center py-3">Referral Change</th>
									</tr>
								</thead>
								<tbody>
									{caseData.map((item: any, index) => {
										const percentageChange = parseFloat(item.percentage_change);
										const percentageEarnedChange = parseFloat(item.percentage_earned_revenue_change);
										// Revenue fields
										const earnedRevenue = item.clinicians_earned_revenue ?? null;
										const cashCollected = item.clinicians_cash_collected ?? null;
										const outstanding = item.clinicians_outstanding ?? null;
										const prevEarnedRevenue = item.previous_year_earned_revenue ?? item.previous_month_earned_revenue ?? item.previous_day_earned_revenue ?? null;
										// Format revenue as currency
										const formatCurrency = (val: string | null) => {
											if (!val || isNaN(Number(val))) return '-';
											return 'GH₵' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });
										};
										return (
											<tr key={index}>
												<td className="text-center">
													{timePeriod === 'yearly'
														? item.year
														: timePeriod === 'monthly'
															? moment({ year: (item as any).year, month: parseInt((item as any).month) - 1 }).format('MMM YYYY')
															: moment(item.date).format('MMM DD, YYYY')
													}
												</td>
												<td className="text-center fw-semibold text-primary">{item.clinician_cases}</td>
												<td className="text-end fw-semibold" style={{ fontFamily: 'monospace', color: COLOR_ACCENT }}>{formatCurrency(earnedRevenue)}</td>
												<td className="text-end fw-semibold" style={{ fontFamily: 'monospace', color: COLOR_SECONDARY }}>{formatCurrency(cashCollected)}</td>
												<td className="text-end fw-semibold" style={{ fontFamily: 'monospace', color: COLOR_TEXT_MUTED }}>{formatCurrency(outstanding)}</td>
												<td className="text-center text-muted">
													{timePeriod === 'yearly'
														? item.previous_year_cases ?? '-'
														: timePeriod === 'monthly'
															? item.previous_month_cases ?? '-'
															: item.previous_day_cases ?? '-'
													}
												</td>
												<td className="text-end text-muted" style={{ fontFamily: 'monospace' }}>{formatCurrency(prevEarnedRevenue)}</td>
												<td className="text-center">
													<span className={`${percentageChange > 0 ? 'text-success' : percentageChange < 0 ? 'text-danger' : 'text-muted'}`}>
														{percentageChange === 0 ? '-' : `${percentageChange.toFixed(1)}%`}
													</span>
												</td>
												<td className="text-center">
													<span className={`${percentageEarnedChange > 0 ? 'text-success' : percentageEarnedChange < 0 ? 'text-danger' : 'text-muted'}`}>
														{percentageEarnedChange === 0 ? '-' : `${percentageEarnedChange.toFixed(1)}%`}
													</span>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</Card.Body>
				</Card>
			</div>
		</div>
	);
};

export default ClinicianAnalyticsDailyCaseChange;