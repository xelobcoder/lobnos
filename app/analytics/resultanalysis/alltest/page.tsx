
"use client";
import React, { useEffect, useState } from "react";
import { RiFlaskLine, RiCalendar2Line } from "@remixicon/react";
import { customFetch } from "../../../../components/Auth/customFetch";
import ResultAnalysisRow from "../../../../lib/resultanalaysis/RowAnalysis";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

type MonthData = {
	state: "positive" | "negative" | string;
	casesCount: number;
	change: number | string;
};

type ResultItem = {
	testid: string | number;
	testname: string;
	data: MonthData[];
};

export default function ResultAnalysisAllTestView() {
	const { user } = useApplication();
	const employeeid = user?.employeeid;
	const [resultData, setResultData] = useState<ResultItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await customFetch(`result/analysis/test/alltest/yearlycount?employeeid=${employeeid}`);
				setResultData(Array.isArray(response) && response.length > 0 ? response : []);
			} catch (err) {
				setError('Failed to fetch result analysis data.');
			} finally {
				setLoading(false);
			}
		};
		if (employeeid) fetchData();
	}, [employeeid]);

	const months: string[] = [
		"January", "February", "March", "April", "May",
		"June", "July", "August", "September", "October",
		"November", "December"
	];

	return (
		<div className="table-container" style={{
			maxHeight: '100vh',
			overflowY: 'auto',
			background: "#f8fafc",
			padding: 16
		}}>
			<div style={{
				display: "flex",
				alignItems: "center",
				gap: 12,
				marginBottom: 18
			}}>
				<span>
					<RiFlaskLine size={28} style={{ color: "#1976d2", verticalAlign: "middle" }} />
				</span>
				<h2 style={{
					fontWeight: 700,
					color: "#1976d2",
					letterSpacing: 0.5,
					fontSize: "1.5rem",
					margin: 0,
					display: "flex",
					alignItems: "center"
				}}>
					Yearly Test Result Analysis
				</h2>
				<span>
					<RiCalendar2Line size={26} style={{ color: "#90caf9", verticalAlign: "middle", marginLeft: 8 }} />
				</span>
			</div>
			{loading ? (
				<div className="text-center py-5">Loading...</div>
			) : error ? (
				<div className="text-center text-danger py-5">{error}</div>
			) : (
				<table className="table" style={{
					background: "#fff",
					borderRadius: 8,
					fontSize: "1rem"
				}}>
					<thead>
						<tr style={{ background: "#f1f5f9" }}>
							<th style={{ minWidth: 80 }}>Test ID</th>
							<th style={{ minWidth: 160, display: "flex", alignItems: "center", gap: 6 }}>
								<RiFlaskLine size={18} style={{ verticalAlign: "middle", color: "#1976d2" }} /> Test
							</th>
							{months.map(month => (
								<th key={month} className="month-header" style={{ minWidth: 70, textAlign: "center" }}>
									<RiCalendar2Line size={16} style={{ verticalAlign: "middle", color: "#90caf9" }} />
									<span style={{ marginLeft: 4 }}>{month.slice(0, 3)}</span>
								</th>
							))}
							<th>Result</th>
						</tr>
					</thead>
					<tbody>
						{Array.isArray(resultData) && resultData.length > 0 && resultData.map((item, index) => (
							<ResultAnalysisRow key={index} index={index} months={months} item={item} />
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
