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
import { RiPrinterLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line, RiBarChart2Line, RiFileList3Line, RiUserLine, RiCalculatorLine } from "@remixicon/react";

interface AgeDistributionData {
	age_range: string;
	patient_count: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_MIN = '#6c757d';
const COLOR_MAX = '#e74c3c';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const AgeDistribution: React.FC = () => {
	const [data, setData] = useState<AgeDistributionData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [interval, setInterval] = useState<number>(10);
	const [pendingInterval, setPendingInterval] = useState<number>(10);

	const getMinMaxIndexes = (arr: AgeDistributionData[]) => {
		if (!arr.length) return { min: -1, max: -1 };
		let min = 0, max = 0;
		for (let i = 1; i < arr.length; i++) {
			if (arr[i].patient_count < arr[min].patient_count) min = i;
			if (arr[i].patient_count > arr[max].patient_count) max = i;
		}
		return { min, max };
	};

	const calculateTotals = (data: AgeDistributionData[]) => {
		const totalPatients = data.reduce((sum, item) => sum + item.patient_count, 0);
		const totalAgeRanges = data.length;
		const avgPatientsPerRange = totalAgeRanges > 0 ? Math.round(totalPatients / totalAgeRanges) : 0;
		return { totalPatients, totalAgeRanges, avgPatientsPerRange };
	};

	const fetchAgeDistribution = async (customInterval?: number) => {
		setLoading(true);
		setError(null);
		try {
			const useInterval = customInterval ?? interval;
			const result = await customFetch(`patient-analytics/age-distribution?interval=${useInterval}`);
			if (Array.isArray(result)) {
				setData(result);
				setInterval(useInterval);
			} else {
				setError('Unexpected data format received.');
			}
		} catch (err: any) {
			setError(err?.message || 'Error fetching age distribution data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAgeDistribution(interval);
	}, []);

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
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Age Range</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{entry.age_range}</span>
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

	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
				<div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
						<span className="me-2 flex-shrink-0" style={{ color: COLOR_ACCENT, fontSize: 22 }}>
							<RiBarChart2Line size={22} />
						</span>
						Age Distribution of Patients
					</h2>
					<div className="d-flex align-items-center gap-2 ms-auto">
						<label htmlFor="interval-input" className="mb-0" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.95rem', fontWeight: 500 }}>Interval:</label>
						<input
							id="interval-input"
							type="number"
							className="form-control form-control-sm"
							style={{ width: 80 }}
							value={pendingInterval}
							onChange={e => setPendingInterval(Math.max(0, parseInt(e.target.value) || 0))}
						/>
						<button
							className="btn btn-primary btn-sm ms-2"
							style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, fontWeight: 500, fontSize: '0.95rem' }}
							onClick={() => fetchAgeDistribution(pendingInterval)}
							disabled={loading || pendingInterval === interval}
						>
							{loading && pendingInterval === interval ? 'Loading...' : 'Apply'}
						</button>
					</div>
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
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.totalAgeRanges}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Age Ranges</p>
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
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.avgPatientsPerRange}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Avg per Range</p>
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
							No age distribution data available.
						</p>
					</div>
				) : (
					<>
						{/* Chart Section */}
						<div className="mb-4">
							<h6 className="fw-semibold mb-3 d-flex align-items-center" style={{ color: 'var(--bs-body-color)' }}>
								<RiBarChart2Line size={18} className="me-2" style={{ color: COLOR_ACCENT }} />
								Age Distribution Chart
							</h6>
							<div style={{ width: "100%", height: 350 }}>
								<ResponsiveContainer>
									<BarChart
										data={data}
										layout="vertical"
										margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
									>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" horizontal={false} />
										<XAxis
											type="number"
											allowDecimals={false}
											tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											type="category"
											dataKey="age_range"
											tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
											width={95}
											axisLine={{ stroke: COLOR_BORDER }}
											tickLine={{ stroke: COLOR_BORDER }}
										/>
										<Tooltip content={<CustomTooltipContent />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
										<Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }} />
										<Bar
											dataKey="patient_count"
											name="Patient Count"
											radius={[0, 4, 4, 0]}
											maxBarSize={30}
										>
											{data.map((entry, idx) => {
												const { min, max } = getMinMaxIndexes(data);
												let color = COLOR_ACCENT;
												if (idx === min) color = COLOR_MIN;
												if (idx === max) color = COLOR_MAX;
												return (
													<Cell key={`cell-${idx}`} fill={color} />
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
								Age Distribution Data
							</h6>
							<div id="age-distribution-print" className="table-responsive">
								<table className="table table-hover" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
									<thead style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
										<tr>
											<th className="border-0 fw-semibold" style={{ color: 'var(--bs-body-color)' }}>Age Range</th>
											<th className="border-0 fw-semibold text-end" style={{ color: 'var(--bs-body-color)' }}>Patient Count</th>
											<th className="border-0 fw-semibold text-end" style={{ color: 'var(--bs-body-color)' }}>Percentage</th>
										</tr>
									</thead>
									<tbody>
										{data.map((item, index) => {
											const percentage = totals.totalPatients > 0 ? ((item.patient_count / totals.totalPatients) * 100).toFixed(1) : '0.0';
											const { min, max } = getMinMaxIndexes(data);
											let rowStyle = {};
											if (index === min) rowStyle = { backgroundColor: `${COLOR_MIN}15` };
											if (index === max) rowStyle = { backgroundColor: `${COLOR_MAX}15` };

											return (
												<tr key={index} style={rowStyle}>
													<td className="fw-medium">{item.age_range}</td>
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

export default AgeDistribution;
