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

	const COLORS = ['#4285F4', '#DB4437', '#F4B400'];

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Missing Data Analysis
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="field" label={{ value: 'Field', position: 'insideBottom', offset: -5 }} />
						<YAxis label={{ value: 'Missing Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						<Bar dataKey="missing" fill="#4285F4" barSize={40} name="Missing Count">
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No missing data analysis available.</p>
			)}
		</div>
	);
};

export default MissingDataAnalysis;
