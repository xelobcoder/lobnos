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

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

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
	<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
	  <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
		<div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
		  <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
			Patient Registration Over Time
		  </h2>
		  <div className="d-flex align-items-center gap-2 ms-auto">
			<label htmlFor="start-date-input" className="mb-0" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.95rem', fontWeight: 500 }}>Start Date:</label>
			<input
			  id="start-date-input"
			  type="date"
			  className="form-control form-control-sm"
			  style={{ width: 130 }}
			  value={startDate}
			  max={endDate}
			  onChange={e => setStartDate(e.target.value)}
			/>
			<label htmlFor="end-date-input" className="mb-0 ms-2" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.95rem', fontWeight: 500 }}>End Date:</label>
			<input
			  id="end-date-input"
			  type="date"
			  className="form-control form-control-sm"
			  style={{ width: 130 }}
			  value={endDate}
			  min={startDate}
			  onChange={e => setEndDate(e.target.value)}
			/>
			<button
			  className="btn btn-primary btn-sm ms-2"
			  style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, fontWeight: 500, fontSize: '0.95rem' }}
			  onClick={() => fetchRegistrationData(startDate, endDate)}
			  disabled={loading}
			>
			  {loading ? 'Loading...' : 'Apply'}
			</button>
		  </div>
		</div>
	  </div>
	  <div className="card-body p-3 p-md-4">
		{loading ? (
		  <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
			<span className="mb-3 animate-spin" style={{ color: COLOR_ACCENT, fontSize: 48 }}>
			  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
			</span>
			<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading patient registration data...</p>
		  </div>
		) : error ? (
		  <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
			<span className="mb-3" style={{ color: '#DB4437', fontSize: 48 }}>
			  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
			</span>
			<h5 className="fw-medium mb-1">Error Loading Data</h5>
			<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
		  </div>
		) : data.length > 0 ? (
		  <ResponsiveContainer width="100%" height={300}>
			<LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
			  <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" />
			  <XAxis
				dataKey="registration_date"
				label={{ value: 'Registration Date', position: 'insideBottom', offset: -5 }}
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
			  <Line
				type="monotone"
				dataKey="patient_count"
				stroke={COLOR_ACCENT}
				strokeWidth={2}
				name="Patient Count"
				dot={{ r: 3, stroke: COLOR_ACCENT, strokeWidth: 2, fill: '#fff' }}
				activeDot={{ r: 5, stroke: COLOR_ACCENT, strokeWidth: 2, fill: '#fff' }}
			  />
			</LineChart>
		  </ResponsiveContainer>
		) : (
		  <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
			<span className="mb-3" style={{ color: COLOR_TEXT_MUTED, fontSize: 48 }}>
			  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1"/><path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
			</span>
			<h5 className="fw-medium mb-1">No Data Available</h5>
			<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>No patient registration data available.</p>
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

export default PatientRegistrationOverTime;
