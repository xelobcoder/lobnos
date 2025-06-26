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

interface ActivationStatusData {
	activation_status: string | boolean;
	patient_count: number;
}

const ActivationStatus: React.FC = () => {
	const [data, setData] = useState<ActivationStatusData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchActivationStatus = async () => {
			try {
				const result = await customFetch('patient-analytics/activation-status');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: ActivationStatusData) => {
						// Get the raw status value as a string in lowercase.
						let statusStr: string;
						if (typeof item.activation_status === 'string') {
							statusStr = item.activation_status.trim().toLowerCase();
						} else {
							statusStr = item.activation_status ? "true" : "false";
						}
						return {
							...item,
							activation_status: statusStr === "true" ? "Activated" : "Inactivated"
						};
					});
					setData(transformedData);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching activation status data');
			} finally {
				setLoading(false);
			}
		};

		fetchActivationStatus();
	}, []);

	if (loading) {
		return <div>Loading activation status...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Activated Vs Inactivated Client Status
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="activation_status" />
						<YAxis />
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
									fill={entry.activation_status === "Activated" ? "#4285F4" : "#DB4437"}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No activation status data available.</p>
			)}
		</div>
	);
};

export default ActivationStatus;
