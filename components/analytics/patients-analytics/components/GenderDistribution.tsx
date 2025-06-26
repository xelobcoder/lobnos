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

interface GenderDistributionData {
	gender: string | null;
	patient_count: number;
}

const GenderDistribution: React.FC = () => {
	const [data, setData] = useState<GenderDistributionData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchGenderDistribution = async () => {
			try {
				const result = await customFetch('patient-analytics/gender-distribution');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: GenderDistributionData) => {
						let normalizedGender = "unknown";
						if (item.gender && typeof item.gender === "string") {
							normalizedGender = item.gender.trim().toLowerCase();
						}
						return {
							...item,
							gender:
								normalizedGender === "male"
									? "Male"
									: normalizedGender === "female"
										? "Female"
										: "Unknown"
						};
					});
					setData(transformedData);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching gender distribution data');
			} finally {
				setLoading(false);
			}
		};

		fetchGenderDistribution();
	}, []);

	if (loading) {
		return <div>Loading gender distribution data...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Gender Distribution of Patients
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="gender" label={{ value: 'Gender', position: 'insideBottom', offset: -5 }} />
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{
							backgroundColor: "#fff",
							border: "1px solid #ccc",
							borderRadius: "5px",
							fontSize: "14px"
						}} />
						<Legend />
						<Bar dataKey="patient_count" barSize={40} name="Patient Count">
							{data.map((entry, index) => {
								let fillColor;
								if (entry.gender === "Male") {
									fillColor = "#4285F4"; // Google Blue
								} else if (entry.gender === "Female") {
									fillColor = "#DB4437"; // Google Red
								} else {
									fillColor = "#F4B400"; // Google Yellow for unknown/other
								}
								return <Cell key={`cell-${index}`} fill={fillColor} />;
							})}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No gender distribution data available.</p>
			)}
		</div>
	);
};

export default GenderDistribution;
