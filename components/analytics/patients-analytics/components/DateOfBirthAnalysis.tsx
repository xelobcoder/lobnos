"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DateOfBirthAnalysisData {
	birth_month: number;
	patient_count: number;
}

const DateOfBirthAnalysis: React.FC = () => {
	const [data, setData] = useState<DateOfBirthAnalysisData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDOBAnalysis = async () => {
			try {
				const result = await customFetch('patient-analytics/date-of-birth-analysis');
				if (Array.isArray(result)) {
					setData(result);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching date of birth analysis data');
			} finally {
				setLoading(false);
			}
		};
		fetchDOBAnalysis();
	}, []);

	if (loading) return <div>Loading date of birth analysis data...</div>;
	if (error) return <div>{error}</div>;

	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const transformedData = data.map(item => ({
		birth_month: monthNames[item.birth_month - 1] || item.birth_month,
		patient_count: item.patient_count
	}));

	const COLORS = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58", "#9E9E9E", "#00ACC1", "#8E24AA", "#D81B60", "#FF7043", "#7E57C2", "#26A69A", "#66BB6A"];

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Date of Birth Analysis
			</h5>
			{transformedData.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={transformedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="birth_month" label={{ value: 'Birth Month', position: 'insideBottom', offset: -5 }} />
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						<Bar dataKey="patient_count" barSize={40} name="Patient Count">
							{transformedData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No date of birth analysis data available.</p>
			)}
		</div>
	);
};

export default DateOfBirthAnalysis;
