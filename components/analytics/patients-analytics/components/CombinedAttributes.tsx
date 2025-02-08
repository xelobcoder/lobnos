"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface CombinedAttributesData {
	gender: string | null;
	marital_status: string | null;
	occupation: string | null;
	patient_count: number;
}

const CombinedAttributes: React.FC = () => {
	const [chartData, setChartData] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const TOP_N = 10;

	useEffect(() => {
		const fetchCombinedAttributes = async () => {
			try {
				const result = await customFetch('patient-analytics/combined-attributes');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: CombinedAttributesData) => {
						const gender = item.gender ? item.gender.trim() : "Unknown";
						const marital = item.marital_status ? item.marital_status.trim() : "Unknown";
						const occupation = item.occupation ? item.occupation.trim() : "Unknown";
						const combined = `${gender} | ${marital} | ${occupation}`;
						return { combined, patient_count: item.patient_count };
					});
					const sortedData = transformedData.sort((a, b) => b.patient_count - a.patient_count);
					const topData = sortedData.slice(0, TOP_N);
					if (sortedData.length > TOP_N) {
						const otherCount = sortedData.slice(TOP_N).reduce((acc, curr) => acc + curr.patient_count, 0);
						topData.push({ combined: "Other", patient_count: otherCount });
					}
					setChartData(topData);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				setError('Error fetching combined attributes data');
			} finally {
				setLoading(false);
			}
		};
		fetchCombinedAttributes();
	}, []);

	if (loading) return <div>Loading combined attributes data...</div>;
	if (error) return <div>{error}</div>;

	const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9E9E9E'];

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Combined Attributes Distribution
			</h5>
			{chartData.length > 0 ? (
				<ResponsiveContainer width="100%" height={400}>
					<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="combined" angle={-45} textAnchor="end" interval={0} label={{ value: 'Gender | Marital Status | Occupation', position: 'insideBottom', offset: -5 }} />
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						<Bar dataKey="patient_count" name="Patient Count" barSize={40}>
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No combined attributes data available.</p>
			)}
		</div>
	);
};

export default CombinedAttributes;
