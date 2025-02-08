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
	ResponsiveContainer
} from 'recharts';

interface AgeTypeAnalysisData {
	agetype: string | null;
	patient_count: number;
}

const AgeTypeAnalysis: React.FC = () => {
	const [data, setData] = useState<AgeTypeAnalysisData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await customFetch('patient-analytics/age-type-analysis');
				if (Array.isArray(result)) {
					const transformed = result.map((item: AgeTypeAnalysisData) => {
						let type = "Unknown";
						if (item.agetype && typeof item.agetype === 'string' && item.agetype.trim() !== "") {
							type = item.agetype.trim();
						}
						return { ...item, agetype: type };
					});
					setData(transformed);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching age type analysis data');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) return <div>Loading age type analysis data...</div>;
	if (error) return <div>{error}</div>;

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Age Type Analysis of Patients
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="agetype" label={{ value: 'Age Type', position: 'insideBottom', offset: -5 }} />
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						<Bar dataKey="patient_count" fill="#4285F4" barSize={40} name="Patient Count" />
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No age type analysis data available.</p>
			)}
		</div>
	);
};

export default AgeTypeAnalysis;
