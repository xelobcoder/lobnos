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

interface OccupationVsAgeGenderData {
	occupation: string | null;
	gender: string | null;
	average_age: number;
}

const OccupationVsAgeGender: React.FC = () => {
	const [data, setData] = useState<OccupationVsAgeGenderData[]>([]);
	const [pivotData, setPivotData] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await customFetch('patient-analytics/occupation-vs-age-gender');
				if (Array.isArray(result)) {
					setData(result);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching occupation vs age/gender data');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (data.length > 0) {
			const pivot: { [key: string]: any } = {};
			data.forEach(item => {
				const occ = item.occupation && item.occupation.trim() !== "" ? item.occupation.trim() : "Unknown";
				let gender = "Unknown";
				if (item.gender && typeof item.gender === "string") {
					const g = item.gender.trim().toLowerCase();
					gender = g === "male" ? "Male" : g === "female" ? "Female" : "Other";
				}
				if (!pivot[occ]) {
					pivot[occ] = { occupation: occ };
				}
				pivot[occ][gender] = item.average_age;
			});
			setPivotData(Object.values(pivot));
		}
	}, [data]);

	if (loading) return <div>Loading occupation vs age/gender data...</div>;
	if (error) return <div>{error}</div>;

	const gendersSet = new Set<string>();
	data.forEach(item => {
		if (item.gender && typeof item.gender === "string") {
			const g = item.gender.trim().toLowerCase();
			gendersSet.add(g === "male" ? "Male" : g === "female" ? "Female" : "Other");
		} else {
			gendersSet.add("Unknown");
		}
	});
	const genders = Array.from(gendersSet);

	const genderColors: Record<string, string> = {
		"Male": "#4285F4",
		"Female": "#DB4437",
		"Other": "#F4B400",
		"Unknown": "#9E9E9E"
	};

	return (
		<div>
			<h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
				Average Age by Occupation and Gender
			</h5>
			{pivotData.length > 0 ? (
				<ResponsiveContainer width="100%" height={400}>
					<BarChart data={pivotData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="occupation" angle={-45} textAnchor="end" interval={0} label={{ value: 'Occupation', position: 'insideBottom', offset: -5 }} />
						<YAxis label={{ value: 'Average Age', angle: -90, position: 'insideLeft' }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
						<Legend />
						{genders.map(gender => (
							<Bar key={gender} dataKey={gender} fill={genderColors[gender] || "#9E9E9E"} name={gender} />
						))}
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p>No occupation vs age/gender data available.</p>
			)}
		</div>
	);
};

export default OccupationVsAgeGender;
