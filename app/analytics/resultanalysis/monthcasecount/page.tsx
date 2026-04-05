"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";
import { Modal, Button } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, Area, AreaChart, LineChart, LabelList } from 'recharts';
import { RiFlaskLine, RiCalendar2Line, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiLineChartLine, RiTimeLine } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface CaseCount {
	day: number;
	caseCount: number;
}

interface HourlyCaseCount {
	hour?: number;
	hour_of_day?: number;
	caseCount?: number;
	total?: number;
}

export default function ResultAnalysisTestMonthlyCasesCount() {
	const [response, setResponse] = useState<CaseCount[]>([]);
	const [dayHeaders, setDayHeaders] = useState<number[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'composed'>('composed');
	const [selectedDay, setSelectedDay] = useState<number | null>(null);
	const [hourlyData, setHourlyData] = useState<HourlyCaseCount[]>([]);
	const [loadingHourly, setLoadingHourly] = useState(false);
	const [hourlyError, setHourlyError] = useState<string | null>(null);
	const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);

	const searchParams = useSearchParams();
	const testid = searchParams?.get("testid");
	const show = searchParams?.get("show");
	const duration = searchParams?.get("duration")
	const month = searchParams?.get("month");

	const currentMonth = parseInt(month || '') || new Date().getMonth() + 1;
	const currentYear = new Date().getFullYear();

	const monthCasesShow =
		duration && duration === "month" && show === "allcaseCount";
	const monthResultShow =
		duration && duration === "month" && show === "resultvalues";

	const totalCases = response.reduce((sum, item) => sum + item.caseCount, 0);

	const formatHourLabel = (hour: number) => {
		if (Number.isNaN(hour)) return "Unknown";
		const safeHour = Math.max(0, Math.min(23, hour));
		const ampm = safeHour < 12 ? "AM" : "PM";
		const hour12 = safeHour % 12 === 0 ? 12 : safeHour % 12;
		return `${hour12}:00 ${ampm}`;
	};

	const handleShowDayDetails = async (day: number) => {
		if (!testid) return;
		if (selectedDay === day && showDayDetailsModal) {
			setShowDayDetailsModal(false);
			return;
		}

		setSelectedDay(day);
		setShowDayDetailsModal(true);
		setLoadingHourly(true);
		setHourlyError(null);
		setHourlyData([]);

		try {
			const response = await customFetch(
				`result/analysis/test/day/hourly?employeeid=3&&testid=${testid}&&month=${currentMonth}&&year=${currentYear}&&day=${day}`
			);
			const normalized = Array.isArray(response)
				? response
				: Array.isArray(response?.result)
					? response.result
					: [];
			setHourlyData(normalized);
		} catch (err: any) {
			setHourlyError(err?.message || "Failed to load hourly details for this day");
		} finally {
			setLoadingHourly(false);
		}
	};

	const handleCloseDayDetailsModal = () => {
		setShowDayDetailsModal(false);
		setSelectedDay(null);
		setHourlyData([]);
		setHourlyError(null);
	};

	const hourlyChartData = hourlyData
		.map((item) => {
			const rawHour = Number(item.hour_of_day ?? item.hour ?? -1);
			const rawCases = Number(item.caseCount ?? item.total ?? 0);
			return {
				hour: rawHour,
				hourLabel: formatHourLabel(rawHour),
				cases: Number.isNaN(rawCases) ? 0 : rawCases,
			};
		})
		.filter((item) => !Number.isNaN(item.hour))
		.sort((a, b) => a.hour - b.hour);

	const hourlyTotalCases = hourlyChartData.reduce((sum, item) => sum + item.cases, 0);
	const peakHourEntry = hourlyChartData.reduce((max, item) => {
		if (!max || item.cases > max.cases) return item;
		return max;
	}, null as null | { hour: number; hourLabel: string; cases: number });

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				let data = [];
				if (monthCasesShow) {
					data = await customFetch(
						`result/analysis/test/month?employeeid=3&&testid=${testid}&&month=${currentMonth}`
					);
					if (data && Array.isArray(data) && data.length > 0) {
						const h = data.map((item: { day: number }) => item && Object.keys(item).includes("day") && item.day);
						setDayHeaders(h as any);
					}
				} else if (monthResultShow) {
					data = await customFetch(
						`result/analysis/test/resultvalues?employeeid=3&&testid=${testid}&&month=${currentMonth}`
					);
				}
				setResponse(data);
			} catch (err: any) {
				setError(err.message || "Failed to fetch data");
				console.error("Error fetching data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [testid, show, duration, currentMonth]);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const caseCount = payload[0].value;
			return (
				<div className="bg-white p-2 border rounded shadow-sm" style={{
					backgroundColor: 'var(--bs-body-bg)',
					borderColor: COLOR_BORDER
				}}>
					<p className="mb-1 fw-bold">Day {label}</p>
					<p className="mb-1">Cases: {caseCount}</p>
					<p className="mb-0" style={{ color: COLOR_ACCENT }}>Daily Distribution</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="container-fluid px-4 py-3">
			<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
				<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
					<div className="d-flex justify-content-between align-items-center">
						<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
							<RiFlaskLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
							Monthly Case Count Analysis - {currentMonth}/{currentYear}
						</h2>
						<div className="d-flex align-items-center gap-3">
							<RiCalendar2Line size={26} className="flex-shrink-0" style={{ color: COLOR_TEXT_MUTED }} />
							<div className="btn-group btn-group-sm" role="group" aria-label="Chart type selection">
								<button
									type="button"
									className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
									onClick={() => setChartType('bar')}
								>
									Bar
								</button>
								<button
									type="button"
									className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
									onClick={() => setChartType('line')}
								>
									Line
								</button>
								<button
									type="button"
									className={`btn ${chartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
									onClick={() => setChartType('area')}
								>
									Area
								</button>
								<button
									type="button"
									className={`btn ${chartType === 'composed' ? 'btn-primary' : 'btn-outline-primary'}`}
									onClick={() => setChartType('composed')}
								>
									Combined
								</button>
							</div>
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
					) : response.length === 0 ? (
						<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
							<RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
							<h5 className="fw-medium mb-1">No Data Available</h5>
							<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
								No case data for the selected period.
							</p>
						</div>
					) : (
						<>
							<div className="row mb-4">
								<div className="col-md-6">
									<div className="card" style={{ borderColor: COLOR_BORDER }}>
										<div className="card-body">
											<h6 className="card-subtitle mb-2" style={{ color: COLOR_TEXT_MUTED }}>Total Cases</h6>
											<h2 className="card-title mb-0" style={{ color: COLOR_ACCENT }}>
												{response.reduce((sum, item) => sum + item.caseCount, 0).toLocaleString()}
											</h2>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="card" style={{ borderColor: COLOR_BORDER }}>
										<div className="card-body">
											<h6 className="card-subtitle mb-2" style={{ color: COLOR_TEXT_MUTED }}>Active Days</h6>
											<h2 className="card-title mb-0" style={{ color: COLOR_ACCENT }}>
												{response.filter(item => item.caseCount > 0).length}
												<small className="text-muted ms-2">
													({((response.filter(item => item.caseCount > 0).length / response.length) * 100).toFixed(1)}%)
												</small>
											</h2>
										</div>
									</div>
								</div>
							</div>

							<div style={{ height: '400px' }}>
								<ResponsiveContainer width="100%" height="100%">
									{chartType === 'bar' ? (
										<BarChart
											data={response}
											margin={{
												top: 20,
												right: 30,
												left: 20,
												bottom: 25,
											}}
										>
											<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
											<XAxis
												dataKey="day"
												label={{
													value: 'Day of Month',
													position: 'bottom',
													offset: 15,
													style: {
														fill: COLOR_TEXT_MUTED,
														fontSize: '13px',
														fontWeight: 500
													}
												}}
												fontSize={12}
												tickSize={8}
												stroke={COLOR_TEXT_MUTED}
												tick={{
													fill: COLOR_TEXT_MUTED,
													fontSize: '12px',
													fontWeight: 500
												}}
												tickFormatter={(value) => `D${value}`}
												interval={0}
												angle={0}
												textAnchor="middle"
												height={60}
											/>
											<YAxis
												label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: COLOR_TEXT_MUTED, fontSize: '13px' } }}
												fontSize={12}
												width={50}
												stroke={COLOR_TEXT_MUTED}
												tick={{ fill: COLOR_TEXT_MUTED }}
											/>
											<Tooltip
												content={<CustomTooltip />}
												cursor={{ fill: 'rgba(0,0,0,0.05)' }}
												wrapperStyle={{ outline: 'none' }}
											/>
											<Legend
												wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
												iconType="circle"
											/>
											<Bar
												dataKey="caseCount"
												name="Daily Cases"
												fill={COLOR_ACCENT}
												radius={[6, 6, 0, 0]}
												className="transition-all duration-200"
											>
												<LabelList
													dataKey="caseCount"
													position="top"
													style={{ fontSize: '11px', fill: COLOR_TEXT_MUTED, fontWeight: 500 }}
												/>
											</Bar>
										</BarChart>
									) : chartType === 'line' ? (
										<LineChart
											data={response}
											margin={{
												top: 20,
												right: 30,
												left: 20,
												bottom: 25,
											}}
										>
											<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
											<XAxis
												dataKey="day"
												label={{
													value: 'Day of Month',
													position: 'bottom',
													offset: 15,
													style: {
														fill: COLOR_TEXT_MUTED,
														fontSize: '13px',
														fontWeight: 500
													}
												}}
												fontSize={12}
												tickSize={8}
												stroke={COLOR_TEXT_MUTED}
												tick={{
													fill: COLOR_TEXT_MUTED,
													fontSize: '12px',
													fontWeight: 500
												}}
												tickFormatter={(value) => `D${value}`}
												interval={0}
												angle={0}
												textAnchor="middle"
												height={60}
											/>
											<YAxis
												label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: COLOR_TEXT_MUTED, fontSize: '13px' } }}
												fontSize={12}
												width={50}
												stroke={COLOR_TEXT_MUTED}
												tick={{ fill: COLOR_TEXT_MUTED }}
											/>
											<Tooltip
												content={<CustomTooltip />}
												cursor={{ stroke: COLOR_ACCENT, strokeWidth: 1, strokeDasharray: '4 4' }}
												wrapperStyle={{ outline: 'none' }}
											/>
											<Legend
												wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
												iconType="circle"
											/>
											<Line
												type="monotone"
												dataKey="caseCount"
												name="Daily Cases"
												stroke={COLOR_ACCENT}
												strokeWidth={3}
												dot={{ fill: COLOR_ACCENT, strokeWidth: 2, stroke: '#fff', r: 5 }}
												activeDot={{ r: 7, fill: COLOR_ACCENT, stroke: '#fff', strokeWidth: 3 }}
												className="transition-all duration-200"
											/>
										</LineChart>
									) : chartType === 'area' ? (
										<AreaChart
											data={response}
											margin={{
												top: 20,
												right: 30,
												left: 20,
												bottom: 25,
											}}
										>
											<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
											<XAxis
												dataKey="day"
												label={{
													value: 'Day of Month',
													position: 'bottom',
													offset: 15,
													style: {
														fill: COLOR_TEXT_MUTED,
														fontSize: '13px',
														fontWeight: 500
													}
												}}
												fontSize={12}
												tickSize={8}
												stroke={COLOR_TEXT_MUTED}
												tick={{
													fill: COLOR_TEXT_MUTED,
													fontSize: '12px',
													fontWeight: 500
												}}
												tickFormatter={(value) => `D${value}`}
												interval={0}
												angle={0}
												textAnchor="middle"
												height={60}
											/>
											<YAxis
												label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: COLOR_TEXT_MUTED, fontSize: '13px' } }}
												fontSize={12}
												width={50}
												stroke={COLOR_TEXT_MUTED}
												tick={{ fill: COLOR_TEXT_MUTED }}
											/>
											<Tooltip
												content={<CustomTooltip />}
												cursor={{ stroke: COLOR_ACCENT, strokeWidth: 1, strokeDasharray: '4 4' }}
												wrapperStyle={{ outline: 'none' }}
											/>
											<Legend
												wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
												iconType="circle"
											/>
											<Area
												type="monotone"
												dataKey="caseCount"
												name="Daily Cases"
												stroke={COLOR_ACCENT}
												fill={COLOR_ACCENT}
												fillOpacity={0.3}
												strokeWidth={2}
												className="transition-all duration-200"
											/>
										</AreaChart>
									) : (
										<ComposedChart
											data={response}
											margin={{
												top: 20,
												right: 30,
												left: 20,
												bottom: 25,
											}}
											barSize={30}
										>
											<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
											<XAxis
												dataKey="day"
												label={{
													value: 'Day of Month',
													position: 'bottom',
													offset: 15,
													style: {
														fill: COLOR_TEXT_MUTED,
														fontSize: '13px',
														fontWeight: 500
													}
												}}
												fontSize={12}
												tickSize={8}
												stroke={COLOR_TEXT_MUTED}
												tick={{
													fill: COLOR_TEXT_MUTED,
													fontSize: '12px',
													fontWeight: 500
												}}
												tickFormatter={(value) => `D${value}`}
												interval={0}
												angle={0}
												textAnchor="middle"
												height={60}
											/>
											<YAxis
												label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: COLOR_TEXT_MUTED, fontSize: '13px' } }}
												fontSize={12}
												width={50}
												stroke={COLOR_TEXT_MUTED}
												tick={{ fill: COLOR_TEXT_MUTED }}
											/>
											<Tooltip
												content={<CustomTooltip />}
												cursor={{ fill: 'rgba(0,0,0,0.05)' }}
												wrapperStyle={{ outline: 'none' }}
											/>
											<Legend
												wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
												iconType="circle"
											/>
											<Bar
												dataKey="caseCount"
												name="Daily Cases"
												fill={COLOR_ACCENT}
												radius={[6, 6, 0, 0]}
												className="transition-all duration-200"
											>
												<LabelList
													dataKey="caseCount"
													position="top"
													style={{ fontSize: '11px', fill: COLOR_TEXT_MUTED, fontWeight: 500 }}
												/>
											</Bar>
											<Line
												type="monotone"
												dataKey="caseCount"
												name="Trend"
												stroke="#36A2EB"
												strokeWidth={2}
												dot={false}
												className="transition-all duration-200"
											/>
										</ComposedChart>
									)}
								</ResponsiveContainer>
							</div>

							<div className="mt-4">
								<h4 className="fs-6 fw-medium mb-3">Daily Case Records</h4>
								<div className="table-responsive">
									<table className="table table-sm table-hover table-striped small">
										<thead className="sticky-top bg-body-tertiary">
											<tr>
												<th scope="col" className="py-2 text-start">Day</th>
												<th scope="col" className="py-2 text-start">Cases</th>
												<th scope="col" className="py-2 text-start">Share</th>
												<th scope="col" className="py-2 text-start">Action</th>
											</tr>
										</thead>
										<tbody>
											{response.map((entry, index) => {
												const percentage = totalCases > 0 ? ((entry.caseCount / totalCases) * 100).toFixed(1) : "0.0";
												return (
													<tr key={`${entry.day}-${index}`}>
														<td className="py-2 text-start">Day {entry.day}</td>
														<td className="py-2 text-start fw-medium">{entry.caseCount}</td>
														<td className="py-2 text-start">{percentage}%</td>
														<td className="py-2 text-start">
															<button
																type="button"
																className={`btn btn-sm ${selectedDay === entry.day && showDayDetailsModal ? 'btn-secondary' : 'btn-outline-primary'}`}
																onClick={() => handleShowDayDetails(entry.day)}
															>
																{selectedDay === entry.day && showDayDetailsModal ? 'Hide Details' : 'Show Day Details'}
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>


						</>
					)}
				</div>

				{response.length > 0 && (
					<div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
						<div className="row g-3">
							<div className="col-md-3">
								<div className="text-center">
									<div className="fs-4 fw-bold text-primary">{response.length}</div>
									<div className="text-muted small">Total Days</div>
								</div>
							</div>
							<div className="col-md-3">
								<div className="text-center">
									<div className="fs-4 fw-bold text-success">
										{response.reduce((sum, item) => sum + item.caseCount, 0)}
									</div>
									<div className="text-muted small">Total Cases</div>
								</div>
							</div>
							<div className="col-md-3">
								<div className="text-center">
									<div className="fs-4 fw-bold text-info">
										{response.filter(item => item.caseCount > 0).length}
									</div>
									<div className="text-muted small">Active Days</div>
								</div>
							</div>
							<div className="col-md-3">
								<div className="text-center">
									<div className="fs-4 fw-bold text-warning">
										{(response.reduce((sum, item) => sum + item.caseCount, 0) / response.length).toFixed(1)}
									</div>
									<div className="text-muted small">Avg per Day</div>
								</div>
							</div>
						</div>
					</div>
				)}

				<Modal
					show={showDayDetailsModal}
					onHide={handleCloseDayDetailsModal}
					centered
					size="xl"
					backdrop="static"
					keyboard={false}
				>
					<Modal.Header closeButton className="py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
						<Modal.Title className="fs-6 fw-semibold d-flex align-items-center">
							<RiLineChartLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />
							Hourly Details for Day {selectedDay ?? "-"}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className="p-3 p-md-4">
						{loadingHourly ? (
							<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '220px' }}>
								<RiLoader4Line size={42} className="animate-spin mb-2" style={{ color: COLOR_ACCENT }} />
								<p className="text-muted mb-0">Loading hourly details...</p>
							</div>
						) : hourlyError ? (
							<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '220px' }}>
								<RiErrorWarningLine size={40} className="mb-2 text-danger" />
								<p className="text-danger mb-0">{hourlyError}</p>
							</div>
						) : hourlyData.length === 0 ? (
							<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '220px' }}>
								<RiInbox2Line size={40} className="mb-2" style={{ color: COLOR_TEXT_MUTED }} />
								<p className="text-muted mb-0">No hourly records available for this day.</p>
							</div>
						) : (
							<div className="row g-3">
								<div className="col-md-4">
									<div className="border rounded p-3 h-100" style={{ borderColor: COLOR_BORDER }}>
										<div className="text-muted small mb-1">Peak Hour</div>
										<div className="fw-bold">{peakHourEntry?.hourLabel || '-'}</div>
										<div className="small" style={{ color: COLOR_ACCENT }}>{peakHourEntry?.cases ?? 0} cases</div>
									</div>
								</div>
								<div className="col-md-4">
									<div className="border rounded p-3 h-100" style={{ borderColor: COLOR_BORDER }}>
										<div className="text-muted small mb-1">Total Cases</div>
										<div className="fw-bold">{hourlyTotalCases.toLocaleString()}</div>
										<div className="small" style={{ color: COLOR_ACCENT }}>for Day {selectedDay}</div>
									</div>
								</div>
								<div className="col-md-4">
									<div className="border rounded p-3 h-100" style={{ borderColor: COLOR_BORDER }}>
										<div className="text-muted small mb-1">Hours With Activity</div>
										<div className="fw-bold">{hourlyChartData.filter((item) => item.cases > 0).length}</div>
										<div className="small" style={{ color: COLOR_ACCENT }}>tracked hour slots</div>
									</div>
								</div>

								<div className="col-12">
									<div className="border rounded p-3" style={{ borderColor: COLOR_BORDER }}>
										<h5 className="fs-6 fw-medium mb-3 d-flex align-items-center">
											<RiTimeLine size={18} className="me-2" style={{ color: COLOR_ACCENT }} />
											Hourly Trend (Line Chart)
										</h5>
										<div style={{ width: '100%', height: 300 }}>
											<ResponsiveContainer>
												<LineChart
													data={hourlyChartData}
													margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
												>
													<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
													<XAxis
														dataKey="hourLabel"
														tick={{ fill: COLOR_TEXT_MUTED, fontSize: 11 }}
														interval={1}
														angle={-25}
														textAnchor="end"
														height={55}
													/>
													<YAxis
														tick={{ fill: COLOR_TEXT_MUTED, fontSize: 11 }}
														allowDecimals={false}
													/>
													<Tooltip />
													<Line
														type="monotone"
														dataKey="cases"
														name="Cases"
														stroke={COLOR_ACCENT}
														strokeWidth={2.5}
														dot={{ r: 3 }}
														activeDot={{ r: 5 }}
													/>
												</LineChart>
											</ResponsiveContainer>
										</div>
									</div>
								</div>

								<div className="col-12">
									<div className="table-responsive border rounded" style={{ borderColor: COLOR_BORDER }}>
										<table className="table table-sm table-striped mb-0">
											<thead className="bg-body-tertiary">
												<tr>
													<th scope="col" className="text-start">Hour</th>
													<th scope="col" className="text-start">Cases</th>
												</tr>
											</thead>
											<tbody>
												{hourlyChartData.map((item, index) => (
													<tr key={`${item.hour}-${index}`}>
														<td className="text-start">{item.hourLabel}</td>
														<td className="text-start fw-medium">{item.cases}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						)}
					</Modal.Body>
					<Modal.Footer className="bg-body-tertiary" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
						<Button variant="secondary" onClick={handleCloseDayDetailsModal}>Close</Button>
					</Modal.Footer>
				</Modal>

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
}
