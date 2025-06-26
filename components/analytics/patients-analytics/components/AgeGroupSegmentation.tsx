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

interface AgeGroupSegmentationData {
	age_group: string;
	patient_count: number;
}

const AgeGroupSegmentation: React.FC = () => {
	const [data, setData] = useState<AgeGroupSegmentationData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAgeGroupSegmentation = async () => {
			try {
				const result = await customFetch('patient-analytics/age-group-segmentation');
				if (Array.isArray(result)) {
					setData(result);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching age group segmentation data');
			} finally {
				setLoading(false);
			}
		};

		fetchAgeGroupSegmentation();
	}, []);

	if (loading) return <div>Loading age group segmentation data...</div>;
	if (error) return <div>{error}</div>;

	const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9E9E9E', '#00ACC1', '#8E24AA'];

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Age Group Segmentation of Patients
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="age_group" label={{ value: 'Age Group', position: 'insideBottom', offset: -5 }} />
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						<Bar dataKey="patient_count" barSize={40} name="Patient Count">
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No age group segmentation data available.</p>
			)}
		</div>
	);
};

export default AgeGroupSegmentation;
