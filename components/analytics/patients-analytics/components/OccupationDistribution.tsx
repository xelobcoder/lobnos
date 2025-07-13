
"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';

interface OccupationDistributionData {
	occupation: string | null;
	patient_count: number;
}

const OccupationDistribution: React.FC = () => {
	const [data, setData] = useState<OccupationDistributionData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const TOP_N = 10;

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
  <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
	<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
	  <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
		Occupation Distribution of Patients
	  </h2>
	</div>
	<div className="card-body p-3 p-md-4">
	  {loading ? (
		<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '120px' }}>
		  <span className="mb-2 animate-spin" style={{ color: '#4285F4', fontSize: 36 }}>
			<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
		  </span>
		  <p className="text-muted">Loading occupation distribution data...</p>
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
		<div className="table-responsive" style={{maxHeight: '350px', overflowY: 'auto'}}>
		  <table className="table table-sm table-hover table-striped small">
			<thead className="sticky-top bg-body-tertiary">
			  <tr>
				<th scope="col" className="py-2">#</th>
				<th scope="col" className="py-2">Occupation</th>
				<th scope="col" className="py-2 text-end">Patient Count</th>
			  </tr>
			</thead>
			<tbody>
			  {data.map((entry, idx) => (
				<tr key={idx}>
				  <td className="py-2">{idx + 1}</td>
				  <td className="py-2">{entry.occupation}</td>
				  <td className="py-2 text-end fw-medium">{entry.patient_count}</td>
				</tr>
			  ))}
			</tbody>
		  </table>
		</div>
	  ) : (
		<div className="text-center text-muted">No occupation distribution data available.</div>
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
	`}</style>
  </div>
);
};

export default OccupationDistribution;
