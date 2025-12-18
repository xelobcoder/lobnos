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

interface MissingDataAnalysis {
	missing_emails: number;
	missing_mobile_numbers: number;
	missing_middlenames: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';

const MissingDataAnalysis: React.FC = () => {
	const [data, setData] = useState<{ field: string; missing: number }[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const calculateTotals = (data: { field: string; missing: number }[]) => {
		const totalMissing = data.reduce((sum, item) => sum + item.missing, 0);
		const totalFields = data.length;
		const avgMissingPerField = totalFields > 0 ? Math.round(totalMissing / totalFields) : 0;
		return { totalMissing, totalFields, avgMissingPerField };
	};

	const CustomTooltipContent = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const entry = payload[0].payload;
			const { totalMissing } = calculateTotals(data);
			const percentage = totalMissing > 0 ? ((entry.missing / totalMissing) * 100).toFixed(1) : '0.0';

			return (
				<div
					className="rounded-lg border p-3 shadow-sm"
					style={{
						backgroundColor: 'var(--bs-body-bg)',
						borderColor: COLOR_BORDER,
						minWidth: '180px',
						fontSize: '0.85rem',
						color: 'var(--bs-body-color)'
					}}
				>
					<div className="mb-2">
						<span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Field</span>
						<span className="fw-bold d-block">{entry.field}</span>
					</div>
					<div className="mb-2">
						<span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Missing Count</span>
						<span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{entry.missing.toLocaleString()}</span>
					</div>
					<div>
						<span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Percentage</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TEXT_MUTED }}>{percentage}%</span>
					</div>
				</div>
			);
		}
		return null;
	};
	const totals = calculateTotals(data);

	useEffect(() => {
		const fetchMissingData = async () => {
			try {
				const result = await customFetch('patient-analytics/missing-data-analysis');
				if (result && typeof result === 'object') {
					let row: MissingDataAnalysis;
					if (Array.isArray(result)) {
						row = result[0];
					} else {
						row = result;
					}
					const transformed = [
						{ field: 'Email', missing: row.missing_emails },
						{ field: 'Mobile Number', missing: row.missing_mobile_numbers },
						{ field: 'Middle Name', missing: row.missing_middlenames }
					];
					setData(transformed);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching missing data analysis.');
			} finally {
				setLoading(false);
			}
		};
		fetchMissingData();
	}, []);

	if (loading) return <div>Loading missing data analysis...</div>;
	if (error) return <div>{error}</div>;


	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
				<div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
						<span className="me-2 flex-shrink-0" style={{ color: COLOR_ACCENT, fontSize: 22 }}>
							<RiBarChart2Line size={22} />
						</span>
						Missing Data Analysis
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
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.totalMissing.toLocaleString()}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Total Missing</p>
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
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.totalFields}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Data Fields</p>
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
										<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.avgMissingPerField}</h4>
									</div>
									<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Avg per Field</p>
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
							No missing data analysis available.
						</p>
					</div>
				) : (
					<>
						{/* Chart Section */}
						<div className="mb-4">
							<h6 className="fw-semibold mb-3 d-flex align-items-center" style={{ color: 'var(--bs-body-color)' }}>
								<RiBarChart2Line size={18} className="me-2" style={{ color: COLOR_ACCENT }} />
								Missing Data Chart
							</h6>
							<div style={{ width: "100%", height: 350 }}>
								<ResponsiveContainer width="100%" height={350}>
									<BarChart data={data} margin={{ top: 5, right: 5, left: 20, bottom: 45 }}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
										<XAxis
											dataKey="field"
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
										<Bar dataKey="missing" maxBarSize={30} name="Missing Count" radius={[4, 4, 0, 0]}>
											{data.map((entry, index) => {
												const colors = ['#DB4437', '#F4B400', '#0F9D58'];
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
						</div>

						{/* Table Section */}
						<div>
							<h6 className="fw-semibold mb-3 d-flex align-items-center" style={{ color: 'var(--bs-body-color)' }}>
								<RiFileList3Line size={18} className="me-2" style={{ color: COLOR_ACCENT }} />
								Missing Data Details
							</h6>
							<div id="missing-data-print" className="table-responsive">
								<table className="table table-hover" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
									<thead style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
										<tr>
											<th className="border-0 fw-semibold" style={{ color: 'var(--bs-body-color)' }}>Data Field</th>
											<th className="border-0 fw-semibold text-end" style={{ color: 'var(--bs-body-color)' }}>Missing Count</th>
											<th className="border-0 fw-semibold text-end" style={{ color: 'var(--bs-body-color)' }}>Percentage</th>
										</tr>
									</thead>
									<tbody>
										{data.map((item, index) => {
											const percentage = totals.totalMissing > 0 ? ((item.missing / totals.totalMissing) * 100).toFixed(1) : '0.0';
											const colors = ['#DB443715', '#F4B40015', '#0F9D5815'];
											return (
												<tr key={index} style={{ backgroundColor: colors[index % colors.length] }}>
													<td className="fw-medium">{item.field}</td>
													<td className="text-end fw-semibold" style={{ color: COLOR_ACCENT }}>{item.missing.toLocaleString()}</td>
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

export default MissingDataAnalysis;
