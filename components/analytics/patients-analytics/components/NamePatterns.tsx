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

interface NamePatternsData {
	firstname: string;
	lastname: string;
	middlename: string;
	name_count: number;
}

const NamePatterns: React.FC = () => {
	const [data, setData] = useState<NamePatternsData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchNamePatterns = async () => {
			try {
				const result = await customFetch('patient-analytics/name-patterns');
				if (Array.isArray(result)) {
					setData(result);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching name patterns data');
			} finally {
				setLoading(false);
			}
		};
		fetchNamePatterns();
	}, []);

	if (loading) return <div>Loading name patterns data...</div>;
	if (error) return <div>{error}</div>;

	const transformedData = data.map(item => {
		let fullName = `${item.firstname} ${item.lastname}`;
		if (item.middlename && item.middlename.trim() !== "") {
			fullName = `${item.firstname} ${item.middlename} ${item.lastname}`;
		}
		return { fullName, name_count: item.name_count };
	});

	const topData = transformedData.slice(0, 10);

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Top 10 Name Patterns of Patients
			</h5>
			{topData.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={topData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="fullName"
							angle={-45}
							textAnchor="end"
							interval={0}
							label={{ value: 'Name Pattern', position: 'insideBottom', offset: -5 }}
						/>
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						<Bar dataKey="name_count" fill="#4285F4" barSize={40} name="Patient Count" />
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No name patterns data available.</p>
			)}
		</div>
	);
};

export default NamePatterns;
