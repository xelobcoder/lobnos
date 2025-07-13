import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../Auth/customFetch';

interface DuplicateRecord {
	fullpatientid: string;
	count: number;
}

const DuplicateRecords: React.FC = () => {
	const [data, setData] = useState<DuplicateRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await customFetch('patient-analytics/duplicate-records');
				if (Array.isArray(result)) {
					setData(result);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				setError('Error fetching duplicate records.');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
			<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
				<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">Duplicate Patient Records</h2>
			</div>
			<div className="card-body p-3 p-md-4">
				{loading ? (
					<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '120px' }}>
						<span className="mb-2 animate-spin" style={{ color: '#4285F4', fontSize: 36 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" /><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
						</span>
						<p className="text-muted">Loading duplicate records...</p>
					</div>
				) : error ? (
					<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '120px' }}>
						<span className="mb-2" style={{ color: '#DB4437', fontSize: 36 }}>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" /><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="currentColor" /></svg>
						</span>
						<h5 className="fw-medium mb-1">Error Loading Data</h5>
						<p className="text-muted px-3">{error}</p>
					</div>
				) : data.length > 0 ? (
					<div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
						<table className="table table-sm table-hover table-striped small">
							<thead className="sticky-top bg-body-tertiary">
								<tr>
									<th scope="col" className="py-2">#</th>
									<th scope="col" className="py-2">Patient ID</th>
									<th scope="col" className="py-2 text-end">Duplicate Count</th>
								</tr>
							</thead>
							<tbody>
								{data.map((entry, idx) => (
									<tr key={idx}>
										<td className="py-2">{idx + 1}</td>
										<td className="py-2">{entry.fullpatientid}</td>
										<td className="py-2 text-end fw-medium">{entry.count}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center text-muted">No duplicate records found.</div>
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

export default DuplicateRecords;
