"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';

interface MissingDataAnalysis {
	missing_emails: number;
	missing_mobile_numbers: number;
	missing_middlenames: number;
}

const MissingDataAnalysis: React.FC = () => {
	const [data, setData] = useState<{ field: string; missing: number }[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

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
  <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
	<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
	  <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
		Missing Data Analysis
	  </h2>
	</div>
	<div className="card-body p-3 p-md-4">
	  {loading ? (
		<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '120px' }}>
		  <span className="mb-2 animate-spin" style={{ color: '#4285F4', fontSize: 36 }}>
			<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
		  </span>
		  <p className="text-muted">Loading missing data analysis...</p>
		</div>
	  ) : error ? (
		<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '120px' }}>
		  <span className="mb-2" style={{ color: '#DB4437', fontSize: 36 }}>
			<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
		  </span>
		  <h5 className="fw-medium mb-1">Error Loading Data</h5>
		  <p className="text-muted px-3">{error}</p>
		</div>
	  ) : data.length > 0 ? (
		<div className="row g-3 justify-content-center">
		  {data.map((item, idx) => (
			<div className="col-12 col-md-4" key={item.field}>
			  <div className="p-4 border rounded-3 text-center bg-body-tertiary h-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 140 }}>
				<div className="fs-1 fw-bold mb-2" style={{ color: ['#4285F4', '#DB4437', '#F4B400'][idx % 3] }}>{item.missing}</div>
				<div className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500 }}>{item.field}</div>
			  </div>
			</div>
		  ))}
		</div>
	  ) : (
		<div className="text-center text-muted">No missing data analysis available.</div>
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

export default MissingDataAnalysis;
