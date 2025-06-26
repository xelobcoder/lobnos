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

	const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9E9E9E', '#00ACC1', '#8E24AA'];

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Occupation Distribution of Patients
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="occupation"
							angle={-45}
							textAnchor="end"
							interval={0}
							label={{ value: 'Occupation', position: 'insideBottom', offset: -5 }}
						/>
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip
							contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }}
						/>
						<Legend />
						<Bar dataKey="patient_count" barSize={40} name="Patient Count">
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No occupation distribution data available.</p>
			)}
		</div>
	);
};

export default OccupationDistribution;
