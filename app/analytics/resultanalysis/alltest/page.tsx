"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	RiBarChartBoxLine,
	RiCalendar2Line,
	RiErrorWarningLine,
	RiFlaskLine,
	RiInbox2Line,
	RiLoader4Line,
} from "@remixicon/react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Tab, Tabs } from "react-bootstrap";
import { customFetch } from "../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import ResultAnalysisRow from "../../../../lib/resultanalaysis/RowAnalysis";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

const COLOR_ACCENT = "oklch(0.646 0.222 41.116)";
const COLOR_BORDER = "var(--bs-border-color)";
const COLOR_TEXT_MUTED = "var(--bs-secondary-color)";
const COLOR_TOOLTIP_BG = "#ffffff";
const COLOR_TOOLTIP_FG = "#212529";

type MonthData = {
	state: "positive" | "negative" | string;
	casesCount: number;
	change: number | string;
};

type ResultItem = {
	testid: string | number;
	testname: string;
	data: MonthData[];
};

type DateRangeTestItem = {
	testid: number;
	testname: string;
	totalTestsCount: number;
	totalCasesCount: number;
};

type ChartMetric = "totalTestsCount" | "totalCasesCount";

const formatDate = (date: Date) => {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
};

const formatCount = (value: number) => new Intl.NumberFormat().format(value);

function LoadingState({ message }: { message: string }) {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center py-5" role="status">
			<RiLoader4Line size={40} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
			<p className="text-body-secondary mb-0">{message}</p>
		</div>
	);
}

function ErrorState({ message }: { message: string }) {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center text-center py-5" role="alert">
			<RiErrorWarningLine size={40} className="mb-3 text-danger" />
			<h3 className="fs-6 fw-semibold mb-1">Unable to load analytics</h3>
			<p className="text-body-secondary mb-0">{message}</p>
		</div>
	);
}

function EmptyState({ message }: { message: string }) {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center text-center py-5">
			<RiInbox2Line size={40} className="mb-3" style={{ color: COLOR_TEXT_MUTED }} />
			<p className="text-body-secondary mb-0">{message}</p>
		</div>
	);
}

export default function ResultAnalysisAllTestView() {
	const { user } = useApplication();
	const employeeid = user?.employeeid;
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState<number>(currentYear);
	const [resultData, setResultData] = useState<ResultItem[]>([]);
	const [yearlyLoading, setYearlyLoading] = useState(true);
	const [yearlyError, setYearlyError] = useState<string | null>(null);
	const [dateFilter, setDateFilter] = useState("This Year");
	const [rangeStartDate, setRangeStartDate] = useState(`${currentYear}-01-01`);
	const [rangeEndDate, setRangeEndDate] = useState(formatDate(new Date()));
	const [rangeData, setRangeData] = useState<DateRangeTestItem[]>([]);
	const [rangeLoading, setRangeLoading] = useState(true);
	const [rangeError, setRangeError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("overview");
	const [chartMetric, setChartMetric] = useState<ChartMetric>("totalTestsCount");
	const [searchTerm, setSearchTerm] = useState("");

	const yearOptions = Array.from({ length: 8 }, (_, index) => currentYear - index);
	const months = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December",
	];

	const rangeSummary = useMemo(() => ({
		totalOrders: rangeData.reduce((total, item) => total + item.totalTestsCount, 0),
		testTypes: rangeData.length,
	}), [rangeData]);

	const chartData = useMemo(() => [...rangeData]
		.sort((left, right) => right[chartMetric] - left[chartMetric]), [rangeData, chartMetric]);

	const filteredRangeData = useMemo(() => {
		const query = searchTerm.trim().toLocaleLowerCase();
		return rangeData
			.filter((item) => !query || item.testname.toLocaleLowerCase().includes(query) || String(item.testid).includes(query))
			.sort((left, right) => right.totalTestsCount - left.totalTestsCount || left.testname.localeCompare(right.testname));
	}, [rangeData, searchTerm]);

	useEffect(() => {
		let cancelled = false;
		const fetchData = async () => {
			setYearlyLoading(true);
			setYearlyError(null);
			if (!employeeid) {
				setYearlyLoading(false);
				setYearlyError("Employee information is not available. Please sign in again.");
				return;
			}
			try {
				const response = await customFetch(
					`result/analysis/test/alltest/yearlycount?employeeid=${employeeid}&year=${selectedYear}`
				);
				if (!cancelled) {
					setResultData(Array.isArray(response) ? response : []);
				}
			} catch (err) {
				if (!cancelled) {
					setYearlyError(err instanceof Error ? err.message : "Failed to fetch yearly test analysis.");
				}
			} finally {
				if (!cancelled) setYearlyLoading(false);
			}
		};
		fetchData();
		return () => {
			cancelled = true;
		};
	}, [employeeid, selectedYear]);

	const handleDateRangeChange = (startDate: string, endDate: string) => {
		setRangeStartDate(startDate);
		setRangeEndDate(endDate);
	};

	useEffect(() => {
		let cancelled = false;
		const fetchDateRangeData = async () => {
			setRangeLoading(true);
			setRangeError(null);
			try {
				const response = await customFetch(
					`result/analysis/test/alltest/daterange?startDate=${encodeURIComponent(rangeStartDate)}&endDate=${encodeURIComponent(rangeEndDate)}`
				);
				if (!Array.isArray(response)) {
					throw new Error("Unexpected response from the date-range analytics endpoint.");
				}
				if (!cancelled) setRangeData(response);
			} catch (err) {
				if (!cancelled) {
					setRangeError(err instanceof Error ? err.message : "Failed to fetch date-range analysis.");
				}
			} finally {
				if (!cancelled) setRangeLoading(false);
			}
		};

		fetchDateRangeData();
		return () => {
			cancelled = true;
		};
	}, [rangeStartDate, rangeEndDate]);

	return (
		<div className="container-fluid px-3 px-md-4 py-3" style={{ backgroundColor: "#ffffff" }}>
			<div className="card border" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER, backgroundColor: "#ffffff", boxShadow: "none" }}>
				<div className="card-header px-3 px-md-4 py-3" style={{ backgroundColor: "#ffffff", borderColor: COLOR_BORDER }}>
					<div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
						<div>
							<h1 className="fs-5 fw-semibold text-body-emphasis mb-1 d-flex align-items-center">
								<RiFlaskLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
								All Tests Analytics
							</h1>
							<p className="small text-body-secondary mb-0">Compare test activity across a date range or review the full monthly breakdown by year.</p>
						</div>
						<div className="d-flex align-items-center flex-wrap gap-2">
							<label htmlFor="all-test-date-filter" className="small fw-medium text-body-secondary mb-0">Date range</label>
							<DateFilterReusable
								id="all-test-date-filter"
								value={dateFilter}
								onChange={setDateFilter}
								startDate={rangeStartDate}
								endDate={rangeEndDate}
								onDateRangeChange={handleDateRangeChange}
								label="Filter by date range"
								className="w-auto"
							/>
						</div>
					</div>
					<div className="small text-body-secondary mt-2">
						Showing {rangeStartDate} to {rangeEndDate}. Orders count test-order records; cases count distinct billing records per test.
					</div>
				</div>

				<div className="card-body p-3 p-md-4">
					<Tabs
						id="all-tests-analytics-tabs"
						activeKey={activeTab}
						onSelect={(key) => {
							if (key === "overview" || key === "tests" || key === "yearly") setActiveTab(key);
						}}
						className="mb-4"
					>
						<Tab eventKey="overview" title={<span><RiBarChartBoxLine size={16} className="me-1" />Overview</span>}>
							<div className="pt-3">
								{rangeLoading ? (
									<LoadingState message="Loading test activity for this date range..." />
								) : rangeError ? (
									<ErrorState message={rangeError} />
								) : rangeData.length === 0 ? (
									<EmptyState message="No tests were recorded in this date range. Try a wider period." />
								) : (
									<>
										<div className="row g-3 mb-4">
											<div className="col-12 col-sm-6 col-xl-4">
												<div className="card h-100 border" style={{ borderColor: COLOR_BORDER, backgroundColor: "#ffffff", boxShadow: "none" }}>
													<div className="card-body">
														<div className="small text-body-secondary mb-1">Test orders</div>
														<div className="fs-3 fw-semibold">{formatCount(rangeSummary.totalOrders)}</div>
														<div className="small text-body-secondary">Within the selected date range</div>
													</div>
												</div>
											</div>
											<div className="col-12 col-sm-6 col-xl-4">
												<div className="card h-100 border" style={{ borderColor: COLOR_BORDER, backgroundColor: "#ffffff", boxShadow: "none" }}>
													<div className="card-body">
														<div className="small text-body-secondary mb-1">Test types with activity</div>
														<div className="fs-3 fw-semibold">{formatCount(rangeSummary.testTypes)}</div>
														<div className="small text-body-secondary">Distinct tests recorded</div>
													</div>
												</div>
											</div>
										</div>

										<section className="card border" aria-labelledby="test-volume-chart-heading" style={{ borderColor: COLOR_BORDER, backgroundColor: "#ffffff", boxShadow: "none" }}>
											<div className="card-header d-flex align-items-start justify-content-between flex-wrap gap-3" style={{ backgroundColor: "#ffffff", borderColor: COLOR_BORDER }}>
												<div>
													<h2 id="test-volume-chart-heading" className="fs-6 fw-semibold mb-1">Test volume by test</h2>
													<p className="small text-body-secondary mb-0">All tests for the selected period</p>
												</div>
												<div className="btn-group btn-group-sm" role="group" aria-label="Chart metric">
													<button
														type="button"
														className={`btn ${chartMetric === "totalTestsCount" ? "btn-primary" : "btn-outline-secondary"}`}
														aria-pressed={chartMetric === "totalTestsCount"}
														onClick={() => setChartMetric("totalTestsCount")}
													>
														Orders
													</button>
													<button
														type="button"
														className={`btn ${chartMetric === "totalCasesCount" ? "btn-primary" : "btn-outline-secondary"}`}
														aria-pressed={chartMetric === "totalCasesCount"}
														onClick={() => setChartMetric("totalCasesCount")}
													>
														Cases
													</button>
												</div>
											</div>
											<div className="card-body" style={{ backgroundColor: "#ffffff" }}>
												<div
													style={{ width: "100%", height: Math.max(360, chartData.length * 38) }}
													role="img"
													aria-label={`Bar chart showing all ${chartData.length} tests by ${chartMetric === "totalTestsCount" ? "order count" : "case count"}`}
												>
													<ResponsiveContainer width="100%" height="100%">
														<BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 4 }}>
															<CartesianGrid strokeDasharray="3 3" horizontal={false} />
															<XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
															<YAxis
																type="category"
																dataKey="testname"
																width={185}
																axisLine={false}
																tickLine={false}
																tickFormatter={(value) => {
																	const label = String(value);
																	return label.length > 26 ? `${label.slice(0, 23)}...` : label;
																}}
															/>
															<Tooltip
																cursor={{ fill: "rgba(100, 116, 139, 0.08)" }}
																contentStyle={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, color: COLOR_TOOLTIP_FG }}
																formatter={(value) => [
																	formatCount(Number(value ?? 0)),
																	chartMetric === "totalTestsCount" ? "Orders" : "Cases",
																]}
															/>
															<Bar
																dataKey={chartMetric}
																name={chartMetric === "totalTestsCount" ? "Orders" : "Cases"}
																fill={COLOR_ACCENT}
																radius={[0, 5, 5, 0]}
																maxBarSize={24}
															/>
														</BarChart>
													</ResponsiveContainer>
												</div>
											</div>
										</section>
									</>
								)}
							</div>
						</Tab>

						<Tab eventKey="tests" title="Test counts">
							<div className="pt-3">
								<div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
									<div>
										<h2 className="fs-6 fw-semibold mb-1">Test counts</h2>
										<p className="small text-body-secondary mb-0">Sorted by number of orders. Search by test name or ID.</p>
									</div>
									<div className="input-group input-group-sm" style={{ maxWidth: "320px" }}>
										<span className="input-group-text">Search</span>
										<input
											type="search"
											className="form-control"
											value={searchTerm}
											onChange={(event) => setSearchTerm(event.target.value)}
											placeholder="Test name or ID"
											aria-label="Search tests"
										/>
									</div>
								</div>
								{rangeLoading ? (
									<LoadingState message="Loading test counts..." />
								) : rangeError ? (
									<ErrorState message={rangeError} />
								) : filteredRangeData.length === 0 ? (
									<EmptyState message={rangeData.length === 0 ? "No tests were recorded in this date range." : "No tests match your search."} />
								) : (
									<div className="table-responsive">
										<table className="table align-middle mb-0">
											<thead style={{ backgroundColor: "#ffffff" }}>
												<tr>
													<th scope="col">Test</th>
													<th scope="col">Test ID</th>
													<th scope="col" className="text-end">Orders</th>
													<th scope="col" className="text-end">Cases</th>
												</tr>
											</thead>
											<tbody>
												{filteredRangeData.map((item) => (
													<tr key={item.testid}>
														<th scope="row" className="fw-medium">{item.testname}</th>
														<td className="text-body-secondary">{item.testid}</td>
														<td className="text-end">{formatCount(item.totalTestsCount)}</td>
														<td className="text-end">{formatCount(item.totalCasesCount)}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</Tab>

						<Tab eventKey="yearly" title={<span><RiCalendar2Line size={16} className="me-1" />Monthly breakdown</span>}>
							<div className="pt-3">
								<div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
									<div>
										<h2 className="fs-6 fw-semibold mb-1">Monthly breakdown</h2>
										<p className="small text-body-secondary mb-0">Full-year counts from the yearly analytics snapshot.</p>
									</div>
									<div className="d-flex align-items-center gap-2">
										<label htmlFor="year-select" className="small fw-medium text-body-secondary mb-0">Year</label>
										<select
											id="year-select"
											className="form-select form-select-sm"
											style={{ width: "120px", borderColor: COLOR_BORDER, fontWeight: 500 }}
											value={selectedYear}
											onChange={(event) => setSelectedYear(Number(event.target.value))}
										>
											{yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
										</select>
									</div>
								</div>
								{yearlyLoading ? (
									<LoadingState message="Loading monthly test analysis..." />
								) : yearlyError ? (
									<ErrorState message={yearlyError} />
								) : resultData.length === 0 ? (
									<EmptyState message={`No monthly test analysis is available for ${selectedYear}.`} />
								) : (
									<div className="table-responsive">
										<table className="table mb-0" style={{ minWidth: "1120px" }}>
											<thead style={{ backgroundColor: "#ffffff" }}>
												<tr>
													<th scope="col" className="fw-semibold sticky-start" style={{ minWidth: "220px", color: COLOR_TEXT_MUTED }}>
														<div className="d-flex align-items-center">
															<RiFlaskLine size={16} style={{ color: COLOR_ACCENT, marginRight: "6px" }} />
															Test name
														</div>
													</th>
													{months.map((month) => (
														<th key={month} scope="col" className="text-center fw-semibold" style={{ minWidth: "65px", color: COLOR_TEXT_MUTED }}>
															<div className="d-flex flex-column align-items-center">
																<RiCalendar2Line size={14} style={{ color: COLOR_TEXT_MUTED, marginBottom: "2px" }} />
																<span style={{ fontSize: "0.75rem" }}>{month.slice(0, 3)}</span>
															</div>
														</th>
													))}
													<th scope="col" className="text-center fw-semibold" style={{ minWidth: "120px", color: COLOR_TEXT_MUTED }}>Actions</th>
												</tr>
											</thead>
											<tbody>
												{resultData.map((item, index) => (
													<ResultAnalysisRow key={item.testid} index={index} months={months} item={item} year={selectedYear} />
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</Tab>
					</Tabs>
				</div>
			</div>
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
	);
}
