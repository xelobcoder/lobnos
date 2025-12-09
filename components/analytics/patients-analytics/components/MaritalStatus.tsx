"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell
} from 'recharts';
import { RiPrinterLine, RiErrorWarningLine, RiFileList3Line, RiLoader4Line, RiBarChart2Line, RiUserLine, RiCalculatorLine, RiInbox2Line } from "@remixicon/react";

interface MaritalStatusData {
	marital_status: string | null;
	patient_count: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const MaritalStatus: React.FC = () => {
	const [data, setData] = useState<MaritalStatusData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const calculateTotals = (data: MaritalStatusData[]) => {
		const totalPatients = data.reduce((sum, item) => sum + item.patient_count, 0);
		const totalStatuses = data.length;
		const avgPatientsPerStatus = totalStatuses > 0 ? Math.round(totalPatients / totalStatuses) : 0;
		return { totalPatients, totalStatuses, avgPatientsPerStatus };
	};

	const CustomTooltipContent = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const entry = payload[0].payload;
			const { totalPatients } = calculateTotals(data);
			const percentage = totalPatients > 0 ? ((entry.patient_count / totalPatients) * 100).toFixed(1) : '0.0';

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
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Marital Status</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{entry.marital_status}</span>
					</div>
					<div className="mb-2">
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Patients</span>
						<span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{entry.patient_count.toLocaleString()}</span>
					</div>
					<div>
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Percentage</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TEXT_MUTED }}>{percentage}%</span>
					</div>
				</div>
			);
		}
		return null;
	};


	const totals = calculateTotals(data);

	useEffect(() => {
		const fetchMaritalStatus = async () => {
			try {
				const result = await customFetch('patient-analytics/marital-status');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: MaritalStatusData) => {
						let normalizedStatus = "Unknown";
						if (item.marital_status && typeof item.marital_status === "string") {
							normalizedStatus = item.marital_status.trim().toLowerCase();
							normalizedStatus =
								normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
						}
						return {
							...item,
							marital_status: normalizedStatus
						};
					});
					setData(transformedData);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching marital status data');
			} finally {
				setLoading(false);
			}
		};

		fetchMaritalStatus();
	}, []);

	if (loading) {
		return <div>Loading marital status data...</div>;
	}

	if (error) return <div>{error}</div>

	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
				<div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
						<span className="me-2 flex-shrink-0" style={{ color: COLOR_ACCENT, fontSize: 22 }}>
							<RiBarChart2Line size={22} />
						</span>
						Marital Status Distribution of Patients
					</h2>
				</div>
			</div>

			{/* Summary Cards */}
			{!loading && !error && data.length > 0 && (
				<div className="card-body px-4 pt-3 pb-2">
					<div className="row g-3 mb-3">
						<div className="col-md-4">
							<div className="card h-100" style={{ borderRadius: '0.5rem', borderColor: COLOR_BORDER }}>
								<div className="card-body text-center p-3">
									<div className="d-flex align-items-center justify-content-center mb-2">
										<span className="me-2" style={{ color: COLOR_ACCENT, fontSize: 24 }}>
											<RiUserLine size={24} />
										</span>
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.totalPatients.toLocaleString()}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Total Patients</p>
								</div>
							</div>
						</div>
						<div className="col-md-4">
							<div className="card h-100" style={{ borderRadius: '0.5rem', borderColor: COLOR_BORDER }}>
								<div className="card-body text-center p-3">
									<div className="d-flex align-items-center justify-content-center mb-2">
										<span className="me-2" style={{ color: COLOR_ACCENT, fontSize: 24 }}>
											<RiBarChart2Line size={24} />
										</span>
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.totalStatuses}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Status Categories</p>
								</div>
							</div>
						</div>
						<div className="col-md-4">
							<div className="card h-100" style={{ borderRadius: '0.5rem', borderColor: COLOR_BORDER }}>
								<div className="card-body text-center p-3">
									<div className="d-flex align-items-center justify-content-center mb-2">
										<span className="me-2" style={{ color: COLOR_ACCENT, fontSize: 24 }}>
											<RiCalculatorLine size={24} />
										</span>
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.avgPatientsPerStatus}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Avg per Category</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="card-body p-3 p-md-4">
				{loading ? (
					<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
						<span className="mb-3 animate-spin" style={{ color: COLOR_ACCENT, fontSize: 48 }}>
							<RiLoader4Line size={48} />
						</span>
						<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading data...</p>
					</div>
				) : error ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
						<span className="mb-3" style={{ color: 'var(--bs-danger)', fontSize: 48 }}>
							<RiErrorWarningLine size={48} />
						</span>
						<h5 className="fw-medium mb-1">Error Loading Data</h5>
						<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
					</div>
				) : data.length === 0 ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
						<span className="mb-3" style={{ color: COLOR_TEXT_MUTED, fontSize: 48 }}>
							<RiInbox2Line size={48} />
						</span>
						<h5 className="fw-medium mb-1">No Data Available</h5>
						<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
							No marital status data available.
						</p>
					</div>
				) : (
					<>
						{/* Chart Section */}
						<div className="mb-4">
							<h6 className="fw-semibold mb-3 d-flex align-items-center" style={{ color: 'var(--bs-body-color)' }}>
								<RiBarChart2Line size={18} className="me-2" style={{ color: COLOR_ACCENT }} />
								Marital Status Chart
							</h6>
							<div style={{ width: "100%", height: 350 }}>
								<ResponsiveContainer>
									<BarChart data={data} margin={{ top: 5, right: 5, left: 20, bottom: 45 }}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
										<XAxis
											dataKey="marital_status"
											tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
											axisLine={{ stroke: COLOR_BORDER }}
											tickLine={{ stroke: COLOR_BORDER }}
										/>
										<YAxis
											tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
											width={95}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip content={<CustomTooltipContent />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
										<Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }} />
										<Bar dataKey="patient_count" maxBarSize={30} name="Patient Count" radius={[4, 4, 0, 0]}>
											{data.map((entry, index) => {
												const colorMapping: Record<string, string> = {
													"Single": "#4285F4",
													"Married": "#DB4437",
													"Divorced": "#F4B400",
													"Widowed": "#0F9D58",
													"Unknown": "#9E9E9E"
												};
												return (
													<Cell
														key={`cell-${index}`}
														fill={colorMapping[entry.marital_status ?? "Unknown"] || "#9E9E9E"}
													/>
												);
											})}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Table Section */}
						<div>
							<h6 className="fw-semibold mb-3 d-flex align-items-center" style={{ color: 'var(--bs-body-color)' }}>
								<RiFileList3Line size={18} className="me-2" style={{ color: COLOR_ACCENT }} />
								Marital Status Data
							</h6>
							<div id="marital-status-print" className="table-responsive">
								<table className="table table-hover" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
									<thead style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
										<tr>
											<th className="border-0 fw-semibold" style={{ color: 'var(--bs-body-color)' }}>Marital Status</th>
											<th className="border-0 fw-semibold text-end" style={{ color: 'var(--bs-body-color)' }}>Patient Count</th>
											<th className="border-0 fw-semibold text-end" style={{ color: 'var(--bs-body-color)' }}>Percentage</th>
										</tr>
									</thead>
									<tbody>
										{data.map((item, index) => {
											const percentage = totals.totalPatients > 0 ? ((item.patient_count / totals.totalPatients) * 100).toFixed(1) : '0.0';
											const colorMapping: Record<string, string> = {
												"Single": "#4285F415",
												"Married": "#DB443715",
												"Divorced": "#F4B40015",
												"Widowed": "#0F9D5815",
												"Unknown": "#9E9E9E15"
											};
											return (
												<tr key={index} style={{ backgroundColor: colorMapping[item.marital_status ?? "Unknown"] || "#9E9E9E15" }}>
													<td className="fw-medium">{item.marital_status}</td>
													<td className="text-end fw-semibold" style={{ color: COLOR_ACCENT }}>{item.patient_count.toLocaleString()}</td>
													<td className="text-end" style={{ color: COLOR_TEXT_MUTED }}>{percentage}%</td>
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
			<style jsx global>{`
				.animate-spin {
					animation: spin 1s linear infinite;
				}
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
				@media print {
					.no-print { display: none !important; }
					.card { border: none !important; box-shadow: none !important; }
					.card-header { background: white !important; border-bottom: 1px solid #ddd !important; }
					.table-responsive { overflow: visible !important; }
					.table { margin-bottom: 0; }
				}
			`}</style>
		</div>
	);
};

export default MaritalStatus;
