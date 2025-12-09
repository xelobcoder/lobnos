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
import { RiPrinterLine, RiErrorWarningLine, RiFileList3Line, RiLoader4Line } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_ACCENT_ALT = '#DB4437';
const COLOR_UNKNOWN = '#F4B400';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

interface GenderDistributionData {
	gender: string | null;
	patient_count: number;
}

const GenderDistribution: React.FC = () => {
	const [data, setData] = useState<GenderDistributionData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const calculateTotals = (data: GenderDistributionData[]) => {
		const totalPatients = data.reduce((sum, item) => sum + item.patient_count, 0);
		const totalGenders = data.length;
		const avgPatientsPerGender = totalGenders > 0 ? Math.round(totalPatients / totalGenders) : 0;
		return { totalPatients, totalGenders, avgPatientsPerGender };
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
						<span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Gender</span>
						<span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{entry.gender}</span>
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
		const fetchGenderDistribution = async () => {
			try {
				const result = await customFetch('patient-analytics/gender-distribution');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: GenderDistributionData) => {
						let normalizedGender = "unknown";
						if (item.gender && typeof item.gender === "string") {
							normalizedGender = item.gender.trim().toLowerCase();
						}
						return {
							...item,
							gender:
								normalizedGender === "male"
									? "Male"
									: normalizedGender === "female"
										? "Female"
										: "Unknown"
						};
					});
					setData(transformedData);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching gender distribution data');
			} finally {
				setLoading(false);
			}
		};

		fetchGenderDistribution();
	}, []);

	if (loading) {
		return <div>Loading gender distribution data...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
				<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">

					Gender Distribution of Patients
				</h2>
			</div>

			{/* Summary Cards */}
			<div className="card-body px-4 pt-3 pb-2">
				<div className="row g-3 mb-3">
					<div className="col-md-4">
						<div className="card h-100" style={{ borderRadius: '0.5rem', borderColor: COLOR_BORDER }}>
							<div className="card-body text-center p-3">
								<div className="d-flex align-items-center justify-content-center mb-2">
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
									<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.totalGenders}</h4>
								</div>
								<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Gender Categories</p>
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
									<h4 className="mb-0 fw-bold" style={{ color: COLOR_ACCENT }}>{totals.avgPatientsPerGender}</h4>
								</div>
								<p className="text-muted mb-0 small" style={{ color: COLOR_TEXT_MUTED }}>Avg per Category</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card-body p-3 p-md-4">
			
				{/* Chart Section */}
				<div className="mb-4">
					<h6 className="fw-semibold mb-3" style={{ color: 'var(--bs-body-color)' }}>Gender Distribution Chart</h6>
					<div style={{ width: "100%", height: 350 }}>
						<ResponsiveContainer>
							<BarChart data={data} margin={{ top: 5, right: 5, left: 20, bottom: 45 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
								<XAxis
									dataKey="gender"
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
										let fillColor;
										if (entry.gender === "Male") {
											fillColor = COLOR_ACCENT;
										} else if (entry.gender === "Female") {
											fillColor = COLOR_ACCENT_ALT;
										} else {
											fillColor = COLOR_UNKNOWN;
										}
										return <Cell key={`cell-${index}`} fill={fillColor} />;
									})}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Table Section */}
				<div>
					<h6 className="fw-semibold mb-3" style={{ color: 'var(--bs-body-color)' }}>Gender Distribution Data</h6>
					<div id="gender-distribution-print" className="table-responsive">
						<table className="table table-hover" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
							<thead style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
								<tr>
									<th className="border-0 fw-semibold" style={{ color: 'var(--bs-body-color)' }}>Gender</th>
									<th className="border-0 fw-semibold text-end" style={{ color: 'var(--bs-body-color)' }}>Patient Count</th>
									<th className="border-0 fw-semibold text-end" style={{ color: 'var(--bs-body-color)' }}>Percentage</th>
								</tr>
							</thead>
							<tbody>
								{data.map((item, index) => {
									const percentage = totals.totalPatients > 0 ? ((item.patient_count / totals.totalPatients) * 100).toFixed(1) : '0.0';
									let rowStyle = {};
									if (item.gender === "Male") rowStyle = { backgroundColor: `${COLOR_ACCENT}15` };
									else if (item.gender === "Female") rowStyle = { backgroundColor: `${COLOR_ACCENT_ALT}15` };
									else rowStyle = { backgroundColor: `${COLOR_UNKNOWN}15` };

									return (
										<tr key={index} style={rowStyle}>
											<td className="fw-medium">{item.gender}</td>
											<td className="text-end fw-semibold" style={{ color: COLOR_ACCENT }}>{item.patient_count.toLocaleString()}</td>
											<td className="text-end" style={{ color: COLOR_TEXT_MUTED }}>{percentage}%</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GenderDistribution;
