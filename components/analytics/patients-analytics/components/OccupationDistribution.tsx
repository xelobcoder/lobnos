
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
import { RiPrinterLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line } from "@remixicon/react";

interface OccupationDistributionData {
	occupation: string | null;
	patient_count: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const OccupationDistribution: React.FC = () => {
	const [data, setData] = useState<OccupationDistributionData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const TOP_N = 10;

	const calculateTotals = (data: OccupationDistributionData[]) => {
		const totalPatients = data.reduce((sum, item) => sum + item.patient_count, 0);
		const totalOccupations = data.length;
		const avgPatientsPerOccupation = totalOccupations > 0 ? Math.round(totalPatients / totalOccupations) : 0;
		return { totalPatients, totalOccupations, avgPatientsPerOccupation };
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
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Occupation</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{entry.occupation}</span>
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
		const fetchOccupationDistribution = async () => {
			try {
				const result = await customFetch('patient-analytics/occupation-distribution');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: OccupationDistributionData) => {
						let occupation = "Unknown";
						if (item.occupation && typeof item.occupation === "string" && item.occupation.trim() !== "") {
							occupation = item.occupation.trim();
						}
						return { ...item, occupation };
					});
					// Sort by patient_count descending
					const sortedData = transformedData.sort((a, b) => b.patient_count - a.patient_count);
					// Take top N
					const topData = sortedData.slice(0, TOP_N);
					// If there are more than TOP_N items, aggregate the rest into an "Other" category
					if (sortedData.length > TOP_N) {
						const otherCount = sortedData.slice(TOP_N).reduce((acc, curr) => acc + curr.patient_count, 0);
						topData.push({ occupation: "Other", patient_count: otherCount });
					}
					setData(topData);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching occupation distribution data');
			} finally {
				setLoading(false);
			}
		};
		fetchOccupationDistribution();
	}, []);


	if (loading) return <div>Loading occupation distribution data...</div>;
	if (error) return <div>{error}</div>;


	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
				<div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
						<span className="me-2 flex-shrink-0" style={{ color: COLOR_ACCENT, fontSize: 22 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" width="6" height="6" rx="3" stroke="currentColor" strokeWidth="2" /><path d="M12 14v6M8 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
						</span>
						Occupation Distribution of Patients
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
											<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
											<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2" /></svg>
										</span>
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.totalOccupations}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Occupation Types</p>
								</div>
							</div>
						</div>
						<div className="col-md-4">
							<div className="card h-100" style={{ borderRadius: '0.5rem', borderColor: COLOR_BORDER }}>
								<div className="card-body text-center p-3">
									<div className="d-flex align-items-center justify-content-center mb-2">
										<span className="me-2" style={{ color: COLOR_ACCENT, fontSize: 24 }}>
											<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h4v16H4V4h4" stroke="currentColor" strokeWidth="2" /><path d="M9 8h6M9 12h6M9 16h6" stroke="currentColor" strokeWidth="2" /></svg>
										</span>
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.avgPatientsPerOccupation}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Avg per Occupation</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="card-body p-3 p-md-4">
				{loading ? (
					<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
						<RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
						<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading occupation distribution data...</p>
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
						<div style={{ width: "100%", height: 350, marginBottom: '2rem' }}>
							<ResponsiveContainer>
								<BarChart data={data} margin={{ top: 5, right: 5, left: 20, bottom: 45 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
									<XAxis
										dataKey="occupation"
										tickFormatter={(value) => value}
										angle={-45}
										textAnchor="end"
										height={60}
										interval="preserveStartEnd"
										tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
										axisLine={{ stroke: COLOR_BORDER }}
										tickLine={{ stroke: COLOR_BORDER }}
									/>
									<YAxis
										tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
										axisLine={false}
										tickLine={false}
										width={95}
									/>
									<Tooltip content={<CustomTooltipContent />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
									<Legend
										verticalAlign="top"
										align="right"
										iconType="circle"
										iconSize={8}
										wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}
									/>
									<Bar dataKey="patient_count" name="Patient Count" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30}>
										{data.map((entry, index) => {
											const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9E9E9E', '#AB47BC', '#26A69A', '#FF7043', '#5C6BC0', '#EC407A'];
											return (
												<Cell
													key={`cell-${index}`}
													fill={colors[index % colors.length]}
												/>
											);
										})}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>

						{/* Table Section */}
						<div id="occupation-distribution-print" className="table-responsive">
							<h6 className="fw-semibold mb-3" style={{ color: 'var(--bs-body-color)' }}>Data Table</h6>
							<table className="table table-sm table-hover table-striped small printable-table-with-borders">
								<thead className="sticky-top bg-body-tertiary">
									<tr>
										<th scope="col" className="py-2">#</th>
										<th scope="col" className="py-2">Occupation</th>
										<th scope="col" className="py-2 text-end">Patient Count</th>
										<th scope="col" className="py-2 text-end">Percentage</th>
									</tr>
								</thead>
								<tbody>
									{data.map((entry, idx) => {
										const percentage = totals.totalPatients > 0 ? ((entry.patient_count / totals.totalPatients) * 100).toFixed(1) : '0.0';
										return (
											<tr key={idx}>
												<td className="py-2">{idx + 1}</td>
												<td className="py-2">{entry.occupation}</td>
												<td className="py-2 text-end fw-semibold" style={{ color: COLOR_ACCENT }}>{entry.patient_count.toLocaleString()}</td>
												<td className="py-2 text-end" style={{ color: COLOR_TEXT_MUTED }}>{percentage}%</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</>
				) : (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
						<RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
						<h5 className="fw-medium mb-1">No Data Available</h5>
						<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
							No occupation distribution data available.
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

export default OccupationDistribution;
