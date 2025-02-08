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

interface MaritalStatusData {
	marital_status: string | null;
	patient_count: number;
}

const MaritalStatus: React.FC = () => {
	const [data, setData] = useState<MaritalStatusData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchMaritalStatus = async () => {
			try {
				const result = await customFetch('patient-analytics/marital-status');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: MaritalStatusData) => {
						let normalizedStatus = "Unknown";
						if (item.marital_status && typeof item.marital_status === "string") {
							normalizedStatus = item.marital_status.trim().toLowerCase();
							normalizedStatus =
								normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
						}
						return {
							...item,
							marital_status: normalizedStatus
						};
					});
					setData(transformedData);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching marital status data');
			} finally {
				setLoading(false);
			}
		};

		fetchMaritalStatus();
	}, []);

	if (loading) {
		return <div>Loading marital status data...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}


	const colorMapping: Record<string, string> = {
		"Single": "#4285F4",   // Google Blue
		"Married": "#DB4437",  // Google Red
		"Divorced": "#F4B400", // Google Yellow
		"Widowed": "#0F9D58",  // Google Green
		"Unknown": "#9E9E9E"   // Grey for unknown or unrecognized statuses
	};

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Marital Status Distribution of Patients
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="marital_status"
							label={{ value: 'Marital Status', position: 'insideBottom', offset: -5 }}
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
						<Bar dataKey="patient_count" barSize={40} name="Patient Count">
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={colorMapping[entry.marital_status ?? "Unknown"] || "#9E9E9E"}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No marital status data available.</p>
			)}
		</div>
	);
};

export default MaritalStatus;
