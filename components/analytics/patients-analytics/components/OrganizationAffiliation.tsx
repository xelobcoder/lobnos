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

interface OrganizationAffiliationData {
	organization: string | null;
	patient_count: number;
}

const OrganizationAffiliation: React.FC = () => {
	const [data, setData] = useState<OrganizationAffiliationData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrganizationAffiliation = async () => {
			try {
				const result = await customFetch('patient-analytics/organization-affiliation');
				if (Array.isArray(result)) {
					const transformedData = result.map((item: OrganizationAffiliationData) => {
						let orgName = "Unknown";
						if (item.organization && typeof item.organization === "string" && item.organization.trim() !== "") {
							orgName = item.organization.trim();
						}
						return { ...item, organization: orgName };
					});
					setData(transformedData);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching organization affiliation data');
			} finally {
				setLoading(false);
			}
		};
		fetchOrganizationAffiliation();
	}, []);

	if (loading) return <div>Loading organization affiliation data...</div>;
	if (error) return <div>{error}</div>;

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Organization Affiliation Distribution
			</h5>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="organization" label={{ value: 'Organization', position: 'insideBottom', offset: -5 }} />
						<YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						<Bar dataKey="patient_count" fill="#4285F4" barSize={40} name="Patient Count">
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill="#4285F4" />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No organization affiliation data available.</p>
			)}
		</div>
	);
};

export default OrganizationAffiliation;
