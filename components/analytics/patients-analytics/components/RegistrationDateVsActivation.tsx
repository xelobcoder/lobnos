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

interface RegistrationActivationData {
	registration_date: string;
	activation_status: string | boolean;
	patient_count: number;
}

const RegistrationDateVsActivation: React.FC = () => {
	const [data, setData] = useState<RegistrationActivationData[]>([]);
	const [pivotData, setPivotData] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchRegistrationActivation = async () => {
			try {
				const result = await customFetch('patient-analytics/registration-date-vs-activation');
				if (Array.isArray(result)) {
					setData(result);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching registration vs activation data');
			} finally {
				setLoading(false);
			}
		};
		fetchRegistrationActivation();
	}, []);

	useEffect(() => {
		if (data.length > 0) {
			const pivot: { [key: string]: any } = {};
			data.forEach(item => {
				const formattedDate = moment(item.registration_date).format("MMM DD, YYYY");
				if (!pivot[formattedDate]) {
					pivot[formattedDate] = { registration_date: formattedDate, Activated: 0, Inactivated: 0 };
				}
				let status = "";
				if (typeof item.activation_status === "string") {
					status = item.activation_status.trim().toLowerCase() === "true" ? "Activated" : "Inactivated";
				} else {
					status = item.activation_status ? "Activated" : "Inactivated";
				}
				pivot[formattedDate][status] += item.patient_count;
			});
			setPivotData(Object.values(pivot));
		}
	}, [data]);

	if (loading) return <div>Loading registration vs activation data...</div>;
	if (error) return <div>{error}</div>;

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Registration Date vs Activation
			</h5>
			{pivotData.length > 0 ? (
				<ResponsiveContainer width="100%" height={400}>
					<LineChart data={pivotData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="registration_date"
							angle={-45}
							textAnchor="end"
							interval={0}
							label={{ value: 'Registration Date', position: 'insideBottom', offset: -5 }}
						/>
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						<Line type="monotone" dataKey="Activated" stroke="#4285F4" strokeWidth={2} dot={{ r: 3 }} name="Activated" />
						<Line type="monotone" dataKey="Inactivated" stroke="#DB4437" strokeWidth={2} dot={{ r: 3 }} name="Inactivated" />
					</LineChart>
				</ResponsiveContainer>
			) : (
				<p>No registration vs activation data available.</p>
			)}
		</div>
	);
};

export default RegistrationDateVsActivation;
