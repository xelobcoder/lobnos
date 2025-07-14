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

interface MaritalStatusData {
	marital_status: string | null;
	patient_count: number;
}

const MaritalStatus: React.FC = () => {
	const [data, setData] = useState<MaritalStatusData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

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

	const colorMapping: Record<string, string> = {
		"Single": "#4285F4",
		"Married": "#DB4437",
		"Divorced": "#F4B400",
		"Widowed": "#0F9D58",
		"Unknown": "#9E9E9E"
	};

	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
				<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
					Marital Status Distribution of Patients
				</h2>
			</div>
			<div className="card-body p-3 p-md-4">
				{loading ? (
					<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
						<span className="mb-3 animate-spin" style={{ color: '#4285F4', fontSize: 48 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" /><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
						</span>
						<p className="text-muted">Loading marital status data...</p>
					</div>
				) : error ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
						<span className="mb-3" style={{ color: '#DB4437', fontSize: 48 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" /><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="currentColor" /></svg>
						</span>
						<h5 className="fw-medium mb-1">Error Loading Data</h5>
						<p className="text-muted px-3">{error}</p>
					</div>
				) : data.length === 0 ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
						<span className="mb-3" style={{ color: '#9E9E9E', fontSize: 48 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1" /><path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
						</span>
						<h5 className="fw-medium mb-1">No Data Available</h5>
						<p className="text-muted px-3">No marital status data available.</p>
					</div>
				) : (
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 45 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
							<XAxis
								dataKey="marital_status"
								label={{ value: 'Marital Status', position: 'insideBottom', offset: -5 }}
								tick={{ fontSize: 12 }}
							/>
							<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
							<Tooltip
								contentStyle={{
									backgroundColor: "#fff",
									border: "1px solid #ccc",
									borderRadius: "5px",
									fontSize: "14px"
								}}
							/>
							<Legend />
							<Bar dataKey="patient_count" barSize={40} name="Patient Count" radius={[8, 8, 0, 0]}>
								{data.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={colorMapping[entry.marital_status ?? "Unknown"] || "#9E9E9E"}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
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

export default MaritalStatus;
