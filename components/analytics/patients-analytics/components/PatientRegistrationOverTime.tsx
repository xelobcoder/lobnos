"use client";

import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { customFetch } from '../../../Auth/customFetch';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer
} from 'recharts';
import { RiLineChartLine, RiTableLine, RiPrinterLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line, RiUserLine, RiCalendarLine, RiBarChartLine, RiTimeLine } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

interface RegistrationData {
	registration_date: string;
	patient_count: number;
}

const PatientRegistrationOverTime: React.FC = () => {
	const [data, setData] = useState<RegistrationData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [startDate, setStartDate] = useState<string>(moment().subtract(30, 'days').format('YYYY-MM-DD'));
	const [endDate, setEndDate] = useState<string>(moment().format('YYYY-MM-DD'));

	const calculateTotals = (data: RegistrationData[]) => {
		const totalPatients = data.reduce((sum, item) => sum + item.patient_count, 0);
		const totalDays = data.length;
		const avgPatientsPerDay = totalDays > 0 ? Math.round(totalPatients / totalDays) : 0;
		const maxPatientsInDay = data.length > 0 ? Math.max(...data.map(item => item.patient_count)) : 0;
		return { totalPatients, totalDays, avgPatientsPerDay, maxPatientsInDay };
	};

	const CustomTooltipContent = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const entry = payload[0].payload;
			return (
				<div
					className="rounded-lg border p-2 shadow-sm"
					style={{
						backgroundColor: COLOR_TOOLTIP_BG,
						borderColor: COLOR_BORDER,
						minWidth: '180px',
						fontSize: '0.8rem'
					}}
				>
					<div className="mb-2">
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Date</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
					</div>
					<div>
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Patients Registered</span>
						<span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{entry.patient_count.toLocaleString()}</span>
					</div>
				</div>
			);
		}
		return null;
	};

	const handlePrint = () => {
		const printWindow = window.open('', '_blank');
		if (printWindow) {
			printWindow.document.write(`
				<html>
					<head>
						<title>Patient Registration Report</title>
						<style>
							body { font-family: Arial, sans-serif; margin: 20px; }
							.header { text-align: center; margin-bottom: 30px; }
							.summary { display: flex; justify-content: space-around; margin-bottom: 20px; }
							.summary-item { text-align: center; }
							table { width: 100%; border-collapse: collapse; margin-top: 20px; }
							th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
							th { background-color: #f2f2f2; }
							.print-date { text-align: right; margin-bottom: 20px; color: #666; }
							@media print { .no-print { display: none; } }
						</style>
					</head>
					<body>
						<div class="print-date">Generated on: ${new Date().toLocaleDateString()}</div>
						<div class="header">
							<h2>Patient Registration Over Time</h2>
							<p>Period: ${moment(startDate).format('MMM DD, YYYY')} - ${moment(endDate).format('MMM DD, YYYY')}</p>
						</div>
						<div class="summary">
							<div class="summary-item">
								<h4>${calculateTotals(data).totalPatients.toLocaleString()}</h4>
								<p>Total Patients</p>
							</div>
							<div class="summary-item">
								<h4>${calculateTotals(data).totalDays}</h4>
								<p>Days</p>
							</div>
							<div class="summary-item">
								<h4>${calculateTotals(data).avgPatientsPerDay}</h4>
								<p>Avg per Day</p>
							</div>
							<div class="summary-item">
								<h4>${calculateTotals(data).maxPatientsInDay}</h4>
								<p>Max per Day</p>
							</div>
						</div>
						<table>
							<thead>
								<tr>
									<th>Registration Date</th>
									<th>Patient Count</th>
								</tr>
							</thead>
							<tbody>
								${data.map(item => `
									<tr>
										<td>${item.registration_date}</td>
										<td>${item.patient_count.toLocaleString()}</td>
									</tr>
								`).join('')}
							</tbody>
						</table>
					</body>
				</html>
			`);
			printWindow.document.close();
			printWindow.print();
		}
	};

	const totals = calculateTotals(data);

	const fetchRegistrationData = async (customStart?: string, customEnd?: string) => {
		setLoading(true);
		setError(null);
		try {
			const useStart = customStart ?? startDate;
			const useEnd = customEnd ?? endDate;
			const result = await customFetch(`patient-analytics/patient-registration-over-time?startdate=${useStart}&enddate=${useEnd}`);
			if (Array.isArray(result)) {
				const transformedData = result.map((item: RegistrationData) => ({
					...item,
					registration_date: moment(item.registration_date).format("MMM DD, YYYY")
				}));
				setData(transformedData);
			} else {
				setError('Unexpected data format received.');
			}
		} catch (err) {
			setError('Error fetching registration data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRegistrationData(startDate, endDate);
		// eslint-disable-next-line
	}, []);

	if (loading) {
		return <div>Loading patient registration data...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className="container-fluid p-4">
			<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4">
				<h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
					<RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
					Patient Registration Over Time
				</h2>
				<div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
					<div className="d-flex align-items-center gap-2 mt-2 mt-sm-0 mx-4">
						<div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
							<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
								<RiCalendarLine size={16} className="text-muted" />
							</span>
							<input
								id="start-date-input"
								type="date"
								className="form-control shadow-none border-start-0"
								value={startDate}
								max={endDate}
								onChange={e => setStartDate(e.target.value)}
							/>
						</div>
						<div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
							<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
								<RiCalendarLine size={16} className="text-muted" />
							</span>
							<input
								id="end-date-input"
								type="date"
								className="form-control shadow-none border-start-0"
								value={endDate}
								min={startDate}
								onChange={e => setEndDate(e.target.value)}
							/>
						</div>
						<button
							className="btn btn-sm btn-primary d-flex align-items-center"
							style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
							onClick={() => fetchRegistrationData(startDate, endDate)}
							disabled={loading}
						>
							{loading ? <RiLoader4Line size={14} className="animate-spin me-1" /> : null}
							{loading ? 'Loading...' : 'Apply'}
						</button>
					</div>
				</div>
			</div>

			{/* Summary Cards */}
			{!loading && !error && data.length > 0 && (
				<div className="px-4 py-3">
					<div className="row g-3 mb-4">
						<div className="col-md-3">
							<div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
								<div className="d-flex align-items-center mb-2">
									<RiUserLine size={20} className="me-2 text-primary" />
									<span className="fw-medium text-muted small">Total Patients</span>
								</div>
								<div className="fs-4 fw-bold text-primary">{totals.totalPatients.toLocaleString()}</div>
								<div className="small text-muted">Registered patients</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
								<div className="d-flex align-items-center mb-2">
									<RiCalendarLine size={20} className="me-2 text-info" />
									<span className="fw-medium text-muted small">Total Days</span>
								</div>
								<div className="fs-4 fw-bold text-info">{totals.totalDays}</div>
								<div className="small text-muted">Period covered</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
								<div className="d-flex align-items-center mb-2">
									<RiBarChartLine size={20} className="me-2 text-success" />
									<span className="fw-medium text-muted small">Avg per Day</span>
								</div>
								<div className="fs-4 fw-bold text-success">{totals.avgPatientsPerDay}</div>
								<div className="small text-muted">Daily average</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
								<div className="d-flex align-items-center mb-2">
									<RiTimeLine size={20} className="me-2 text-warning" />
									<span className="fw-medium text-muted small">Max per Day</span>
								</div>
								<div className="fs-4 fw-bold text-warning">{totals.maxPatientsInDay}</div>
								<div className="small text-muted">Peak registration</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="px-4 py-3">
				{loading ? (
					<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
						<RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
						<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading patient registration data...</p>
					</div>
				) : error ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
						<RiErrorWarningLine size={48} className="mb-3 text-danger" />
						<h5 className="fw-medium mb-1">Error Loading Data</h5>
						<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
					</div>
				) : data.length > 0 ? (
					<>
						{/* Chart Section */}
						<div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
							<h6 className="fw-bold mb-3 d-flex align-items-center">
								<RiLineChartLine size={20} className="me-2 text-primary" />
								Patient Registration Trend
							</h6>
							<ResponsiveContainer width="100%" height={350}>
								<LineChart data={data} margin={{ top: 5, right: 5, left: 20, bottom: 45 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
									<XAxis
										dataKey="registration_date"
										tickFormatter={(value) => value}
										angle={-45}
										textAnchor="end"
										height={60}
										interval="preserveStartEnd"
										tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
										axisLine={false}
										tickLine={false}
										width={60}
									/>
									<Tooltip content={<CustomTooltipContent />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
									<Legend
										verticalAlign="top"
										align="right"
										iconType="circle"
										iconSize={8}
										wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}
									/>
									<Line
										type="monotone"
										dataKey="patient_count"
										name="Patient Count"
										stroke={COLOR_ACCENT}
										strokeWidth={2}
										dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
										activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>

						{/* Table Section */}
						<div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h6 className="fw-bold mb-0 d-flex align-items-center">
									<RiTableLine size={20} className="me-2 text-info" />
									Data Table
								</h6>
								<button
									className="btn btn-sm btn-outline-secondary"
									onClick={handlePrint}
									title="Print registration data"
								>
									<RiPrinterLine size={16} className="me-1" /> Print
								</button>
							</div>
							<div className="table-responsive">
								<table className="table table-sm table-hover table-striped small printable-table-with-borders">
									<thead className="sticky-top bg-body-tertiary">
										<tr>
											<th scope="col" className="py-2">Registration Date</th>
											<th scope="col" className="py-2 text-end">Patient Count</th>
										</tr>
									</thead>
									<tbody>
										{data.map((item, index) => (
											<tr key={index}>
												<td className="py-2">{item.registration_date}</td>
												<td className="py-2 text-end fw-semibold" style={{ color: COLOR_ACCENT }}>{item.patient_count.toLocaleString()}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</>
				) : (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
						<RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
						<h5 className="fw-medium mb-1">No Data Available</h5>
						<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
							No patient registration data available for the selected period.
						</p>
					</div>
				)}
			</div>
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
				}
			`}</style>
		</div>
	);
};

export default PatientRegistrationOverTime;
