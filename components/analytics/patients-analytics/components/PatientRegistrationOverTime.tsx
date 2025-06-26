"use client";

import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { customFetch } from '../../../Auth/customFetch';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer
} from 'recharts';

interface RegistrationData {
	registration_date: string;
	patient_count: number;
}

const PatientRegistrationOverTime: React.FC = () => {
	const [data, setData] = useState<RegistrationData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchRegistrationData = async () => {
			try {
				const result = await customFetch('patient-analytics/patient-registration-over-time');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: RegistrationData) => ({
						...item,
						registration_date: moment(item.registration_date).format("MMM DD, YYYY")
					}));
					setData(transformedData);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching registration data');
			} finally {
				setLoading(false);
			}
		};

		fetchRegistrationData();
	}, []);

	if (loading) {
		return <div>Loading patient registration data...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Patient Registration Over Time
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="registration_date"
							label={{ value: 'Registration Date', position: 'insideBottom', offset: -5 }}
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
						<Line
							type="monotone"
							dataKey="patient_count"
							stroke="#4285F4"  // Google Blue color
							strokeWidth={2}
							name="Patient Count"
							dot={{ r: 3 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			) : (
				<p>No patient registration data available.</p>
			)}
		</div>
	);
};

export default PatientRegistrationOverTime;
