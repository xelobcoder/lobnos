"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import {
	PieChart,
	Pie,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell
} from 'recharts';

interface PreferredContactData {
	contactpointer: string | null;
	patient_count: number;
}

const PreferredContactMethod: React.FC = () => {
	const [data, setData] = useState<PreferredContactData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPreferredContact = async () => {
			try {
				const result = await customFetch('patient-analytics/preferred-contact-method');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: PreferredContactData) => {
						let contactMethod = "Unknown";
						if (item.contactpointer && typeof item.contactpointer === "string") {
							const trimmed = item.contactpointer.trim().toLowerCase();
							if (trimmed === "relative") {
								contactMethod = "Relative";
							} else if (trimmed === "self") {
								contactMethod = "Self";
							}
						}
						return { ...item, contactpointer: contactMethod };
					});
					setData(transformedData);
				} else {
					console.error('Fetched data is not an array:', result);
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching preferred contact method data');
			} finally {
				setLoading(false);
			}
		};
		fetchPreferredContact();
	}, []);

	if (loading) {
		return <div>Loading preferred contact method data...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	const colorMapping: Record<string, string> = {
		"Self": "#4285F4",
		"Relative": "#DB4437",
		"Unknown": "#9E9E9E"
	};

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Preferred Contact Method Distribution
			</h5>
			{data.length > 0 ? (
				<>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={data}
								dataKey="patient_count"
								nameKey="contactpointer"
								cx="50%"
								cy="50%"
								outerRadius={80}
								label
							>
								{data.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={colorMapping[entry.contactpointer ?? "Unknown"] || "#9E9E9E"}
									/>
								))}
							</Pie>
							<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
					<div style={{ marginTop: "1rem", padding: "0 1rem", fontSize: "14px", color: "#555" }}>
						<p className='pls-color  br-5 p-3 alert alert-info'>
							<strong>Note:</strong> "Self" indicates that the client is the primary contact (shown in Google Blue), while "Relative" means that the contact belongs to a relative (shown in Google Red). "Unknown" is used when no contact method was provided.
						</p>
					</div>
				</>
			) : (
				<p>No preferred contact method data available.</p>
			)}
		</div>
	);
};

export default PreferredContactMethod;
