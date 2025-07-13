"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Blue (Activated)
const COLOR_ACCENT_ALT = '#F4B400'; // Gold/Yellow (Inactivated)
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface ActivationStatusData {
	activation_status: string | boolean;
	patient_count: number;
}

const ActivationStatus: React.FC = () => {
	const [data, setData] = useState<ActivationStatusData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchActivationStatus = async () => {
			try {
				const result = await customFetch('patient-analytics/activation-status');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: ActivationStatusData) => {
						let statusStr: string;
						if (typeof item.activation_status === 'string') {
							statusStr = item.activation_status.trim().toLowerCase();
						} else {
							statusStr = item.activation_status ? "true" : "false";
						}
						return {
							...item,
							activation_status: statusStr === "true" ? "Activated" : "Inactivated"
						};
					});
					setData(transformedData);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching activation status data');
			} finally {
				setLoading(false);
			}
		};

		fetchActivationStatus();
	}, []);

	if (loading) {
		return <div>Loading activation status...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}
  return (
	<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
	  <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
		<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
		  Activated vs Inactivated Client Status
		</h2>
	  </div>
	  <div className="card-body p-3 p-md-4">
		{loading ? (
		  <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
			<span className="mb-3 animate-spin" style={{ color: COLOR_ACCENT, fontSize: 48 }}>
			  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
			</span>
			<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading activation status...</p>
		  </div>
		) : error ? (
		  <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
			<span className="mb-3" style={{ color: COLOR_ACCENT_ALT, fontSize: 48 }}>
			  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
			</span>
			<h5 className="fw-medium mb-1">Error Loading Data</h5>
			<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
		  </div>
		) : data.length > 0 ? (
		  <ResponsiveContainer width="100%" height={300}>
			<PieChart>
			  <Pie
				data={data}
				dataKey="patient_count"
				nameKey="activation_status"
				cx="50%"
				cy="50%"
				innerRadius={70}
				outerRadius={110}
				paddingAngle={2}
				label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
			  >
				{data.map((entry, index) => (
				  <Cell
					key={`cell-${index}`}
					fill={entry.activation_status === "Activated" ? COLOR_ACCENT : COLOR_ACCENT_ALT}
					stroke="#fff"
					strokeWidth={2}
				  />
				))}
			  </Pie>
			  <Tooltip
				contentStyle={{
				  backgroundColor: "#fff",
				  border: "1px solid #ccc",
				  borderRadius: "5px",
				  fontSize: "14px"
				}}
			  />
			  <Legend />
			</PieChart>
		  </ResponsiveContainer>
		) : (
		  <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
			<span className="mb-3" style={{ color: '#9E9E9E', fontSize: 48 }}>
			  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1"/><path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
			</span>
			<h5 className="fw-medium mb-1">No Data Available</h5>
			<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>No activation status data available.</p>
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

export default ActivationStatus;
