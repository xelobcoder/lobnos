"use client";

import React, { useEffect, useState } from "react";
import { RiFlaskLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line } from "@remixicon/react";
import { customFetch } from "../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

type ScientistResultItem = {
	employeeid: number | null;
	employeeName: string | null;
	testsEntered: number;
};

const formatDate = (date: Date) => {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
};

export default function ScientistResultAnalyticsPage() {
	const currentYear = new Date().getFullYear();
	const [dateFilter, setDateFilter] = useState("This Year");
	const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
	const [endDate, setEndDate] = useState(formatDate(new Date()));
	const [data, setData] = useState<ScientistResultItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const handleDateRangeChange = (rangeStart: string, rangeEnd: string) => {
		setStartDate(rangeStart);
		setEndDate(rangeEnd);
	};

	useEffect(() => {
		let cancelled = false;
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await customFetch(
					`result/analysis/test/scientists?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
				);
				if (!Array.isArray(response)) {
					throw new Error("Unexpected response from the scientist analytics endpoint.");
				}
				if (!cancelled) setData(response);
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Failed to fetch scientist performance data.");
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchData();
		return () => {
			cancelled = true;
		};
	}, [startDate, endDate]);

	return (
		<div className="container-fluid px-4 py-3">
			<div className="card" style={{ borderRadius: "0.75rem" }}>
				<div className="card-header py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
					<h1 className="fs-5 fw-semibold mb-0 d-flex align-items-center">
						<RiFlaskLine size={22} className="me-2 text-primary" />
						Lab Scientist Result Performance
					</h1>
					<DateFilterReusable
						id="scientist-result-date-filter"
						value={dateFilter}
						onChange={setDateFilter}
						startDate={startDate}
						endDate={endDate}
						onDateRangeChange={handleDateRangeChange}
						label="Filter by date range"
						className="w-auto"
					/>
				</div>
				<div className="card-body p-3 p-md-4">
					<p className="small text-body-secondary mb-4">
						Reporting period: {startDate} to {endDate}. Each test counts once per employee when that employee made at least one successful result save during the selected range. Repeated saves by the same employee do not increase the count. Older saves without recorded workflow events are not included.
					</p>
					{loading ? (
						<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "280px" }}>
							<RiLoader4Line size={42} className="animate-spin mb-3 text-primary" />
							<p className="text-body-secondary mb-0">Loading result-entry performance...</p>
						</div>
					) : error ? (
						<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: "280px" }}>
							<RiErrorWarningLine size={42} className="mb-3 text-danger" />
							<h2 className="fs-6 fw-semibold">Unable to load analytics</h2>
							<p className="text-body-secondary">{error}</p>
						</div>
					) : data.length === 0 ? (
						<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: "280px" }}>
							<RiInbox2Line size={42} className="mb-3 text-body-secondary" />
							<h2 className="fs-6 fw-semibold">No result saves in this date range</h2>
							<p className="text-body-secondary mb-0">Try a wider date range.</p>
						</div>
					) : (
						<div className="table-responsive">
							<table className="table table-hover table-striped align-middle mb-0">
								<thead className="table-light">
									<tr>
										<th scope="col">Employee</th>
										<th scope="col" className="text-end">Distinct tests worked</th>
									</tr>
								</thead>
								<tbody>
									{data.map((item, index) => (
										<tr key={item.employeeid ?? `unknown-${index}`}>
											<th scope="row" className="fw-medium">
												{item.employeeName || "Unknown employee"}
												{item.employeeid !== null && (
													<span className="small text-body-secondary ms-2">#{item.employeeid}</span>
												)}
											</th>
											<td className="text-end fw-semibold">{item.testsEntered}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
			<style jsx global>{`
				.animate-spin {
					animation: spin 1s linear infinite;
				}
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>
		</div>
	);
}
