import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../Auth/customFetch';

const CARD_STYLE = {
	borderRadius: '0.75rem',
	borderColor: 'var(--bs-border-color)',
	boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)',
	background: 'var(--bs-body-bg)'
};

const Dashboards: React.FC = () => {
	const [data, setData] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await customFetch('patient-analytics/dashboards');
				if (Array.isArray(result) && result.length > 0) {
					setData(result[0]);
				} else {
					setError('No dashboard data available.');
				}
			} catch (err: any) {
				setError('Error fetching dashboard data');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<div className="card" style={CARD_STYLE}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
				<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">Patient Dashboard Summary</h2>
			</div>
			<div className="card-body p-3 p-md-4">
				{loading ? (
					<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 120 }}>
						<span className="mb-2 animate-spin" style={{ color: '#4285F4', fontSize: 36 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" /><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
						</span>
						<p className="text-muted">Loading dashboard data...</p>
					</div>
				) : error ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: 120 }}>
						<span className="mb-2" style={{ color: '#DB4437', fontSize: 36 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" /><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="currentColor" /></svg>
						</span>
						<h5 className="fw-medium mb-1">Error Loading Data</h5>
						<p className="text-muted px-3">{error}</p>
					</div>
				) : data ? (
					<div className="row g-3">
						<div className="col-12 col-md-6 col-lg-3">
							<div className="p-3 border rounded-3 text-center bg-body-tertiary">
								<div className="fs-2 fw-bold" style={{ color: '#4285F4' }}>{data.total_patients}</div>
								<div className="text-muted">Total Patients</div>
							</div>
						</div>
						<div className="col-12 col-md-6 col-lg-3">
							<div className="p-3 border rounded-3 text-center bg-body-tertiary">
								<div className="fs-2 fw-bold" style={{ color: '#0F9D58' }}>{data.active_patients}</div>
								<div className="text-muted">Active Patients</div>
							</div>
						</div>
						<div className="col-12 col-md-6 col-lg-3">
							<div className="p-3 border rounded-3 text-center bg-body-tertiary">
								<div className="fs-2 fw-bold" style={{ color: '#4285F4' }}>{data.male_patients}</div>
								<div className="text-muted">Male Patients</div>
							</div>
						</div>
						<div className="col-12 col-md-6 col-lg-3">
							<div className="p-3 border rounded-3 text-center bg-body-tertiary">
								<div className="fs-2 fw-bold" style={{ color: '#DB4437' }}>{data.female_patients}</div>
								<div className="text-muted">Female Patients</div>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center text-muted">No dashboard data available.</div>
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

export default Dashboards;
