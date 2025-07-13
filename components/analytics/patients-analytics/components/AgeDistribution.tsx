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

interface AgeDistributionData {
	age_range: string;
	patient_count: number;
}


const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_MIN = '#6c757d';
const COLOR_MAX = '#e74c3c';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

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


	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const entry = payload[0].payload;
			return (
				<div
					className="rounded-lg border p-2 shadow-sm"
					style={{
						backgroundColor: 'var(--bs-body-bg)',
						borderColor: COLOR_BORDER,
						minWidth: '140px',
						fontSize: '0.85rem',
						color: 'var(--bs-body-color)'
					}}
				>
					<div className="mb-1">
						<span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Age Range</span>
						<span className="fw-bold d-block">{entry.age_range}</span>
					</div>
					<div>
						<span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Patients</span>
						<span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{entry.patient_count}</span>
					</div>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
				<div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
						<span className="me-2 flex-shrink-0" style={{ color: COLOR_ACCENT, fontSize: 22 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="10" width="4" height="10" rx="1" fill="currentColor" /><rect x="9" y="4" width="4" height="16" rx="1" fill="currentColor" /><rect x="15" y="7" width="4" height="13" rx="1" fill="currentColor" /></svg>
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
			<div className="card-body p-3 p-md-4">
				{loading ? (
					<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
						<span className="mb-3 animate-spin" style={{ color: COLOR_ACCENT, fontSize: 48 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" /><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
						</span>
						<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading data...</p>
					</div>
				) : error ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
						<span className="mb-3" style={{ color: 'var(--bs-danger)', fontSize: 48 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" /><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="currentColor" /></svg>
						</span>
						<h5 className="fw-medium mb-1">Error Loading Data</h5>
						<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
					</div>
				) : data.length === 0 ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
						<span className="mb-3" style={{ color: COLOR_TEXT_MUTED, fontSize: 48 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1" /><path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
						</span>
						<h5 className="fw-medium mb-1">No Data Available</h5>
						<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
							No age distribution data available.
						</p>
					</div>
				) : (
					<div style={{ width: "100%", height: 350 }}>
						<ResponsiveContainer>
							<BarChart
								data={data}
								layout="vertical"
								margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
							>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" horizontal={false} />
								<XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} label={{ value: 'Patient Count', position: 'insideBottom', offset: -5 }} />
								<YAxis type="category" dataKey="age_range" tick={{ fontSize: 12 }} width={100} label={{ value: 'Age Range', angle: -90, position: 'insideLeft' }} />
								<Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
								<Legend />
				<Bar
					dataKey="patient_count"
					name="Patient Count"
					radius={[0, 8, 8, 0]}
					maxBarSize={40}
					isAnimationActive={false}
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
	  `}</style>
		</div>
	);
};

export default AgeDistribution;
