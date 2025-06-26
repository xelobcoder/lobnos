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

interface AgeDistributionData {
	age: number;
	patient_count: number;
}

const AgeDistribution: React.FC = () => {
	const [data, setData] = useState<AgeDistributionData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAgeDistribution = async () => {
			try {
				const result = await customFetch('patient-analytics/age-distribution');
				if (Array.isArray(result)) {
					setData(result);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching age distribution data');
			} finally {
				setLoading(false);
			}
		};

		fetchAgeDistribution();
	}, []);

	if (loading) {
		return <div>Loading age distribution data...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Age Distribution of Patients
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="age"
							label={{ value: 'Age (years)', position: 'insideBottom', offset: -5 }}
						/>
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								border: "1px solid #ccc",
								borderRadius: "5px",
								fontSize: "14px"
							}}
						/>
						<Legend />
						<Bar dataKey="patient_count" fill="#4285F4" barSize={40} name="Patient Count" />
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No age distribution data available.</p>
			)}
		</div>
	);
};

export default AgeDistribution;
