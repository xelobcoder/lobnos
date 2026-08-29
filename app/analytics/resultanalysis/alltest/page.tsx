
"use client";
import React, { useEffect, useState } from "react";
import { RiFlaskLine, RiCalendar2Line, RiLoader4Line, RiErrorWarningLine, RiInbox2Line } from "@remixicon/react";
import { customFetch } from "../../../../components/Auth/customFetch";
import ResultAnalysisRow from "../../../../lib/resultanalaysis/RowAnalysis";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

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
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState<number>(currentYear);
	const [resultData, setResultData] = useState<ResultItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - i);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await customFetch(`result/analysis/test/alltest/yearlycount?employeeid=${employeeid}&year=${selectedYear}`);
				setResultData(Array.isArray(response) && response.length > 0 ? response : []);
			} catch (err) {
				setError('Failed to fetch result analysis data.');
			} finally {
				setLoading(false);
			}
		};
		if (employeeid) fetchData();
	}, [employeeid, selectedYear]);

	const months: string[] = [
		"January", "February", "March", "April", "May",
		"June", "July", "August", "September", "October",
		"November", "December"
	];

	return (
		<div className="container-fluid px-4 py-3">
			<div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
				<div className="card-header py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
						<RiFlaskLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
						Yearly Test Result Analysis
						<RiCalendar2Line size={22} className="ms-2 flex-shrink-0" style={{ color: COLOR_TEXT_MUTED }} />
					</h2>
					<div className="d-flex align-items-center gap-2">
						<label htmlFor="year-select" className="small fw-medium text-body-secondary mb-0">Year:</label>
						<select
							id="year-select"
							className="form-select form-select-sm"
							style={{ width: '120px', borderColor: COLOR_BORDER, fontWeight: 500 }}
							value={selectedYear}
							onChange={(e) => setSelectedYear(parseInt(e.target.value))}
						>
							{yearOptions.map((y) => (
								<option key={y} value={y}>{y}</option>
							))}
						</select>
					</div>
				</div>
				<div className="card-body p-3 p-md-4">
					{loading ? (
						<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
							<RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
							<p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading test analysis data...</p>
						</div>
					) : error ? (
						<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
							<RiErrorWarningLine size={48} className="mb-3 text-danger" />
							<h5 className="fw-medium mb-1">Error Loading Data</h5>
							<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
						</div>
					) : resultData.length === 0 ? (
						<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
							<RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
							<h5 className="fw-medium mb-1">No Data Available</h5>
							<p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
								No test analysis data available for the current period.
							</p>
						</div>
					) : (
						<div className="table-responsive">
							<table className="table table-hover table-striped mb-0">
								<thead className="table-light">
									<tr>
										<th scope="col" className="fw-semibold" style={{ minWidth: '200px', color: COLOR_TEXT_MUTED }}>
											<div className="d-flex align-items-center">
												<RiFlaskLine size={16} style={{ color: COLOR_ACCENT, marginRight: '6px' }} />
												Test Name
											</div>
										</th>
										{months.map(month => (
											<th key={month} scope="col" className="text-center fw-semibold" style={{ minWidth: '70px', color: COLOR_TEXT_MUTED }}>
												<div className="d-flex flex-column align-items-center">
													<RiCalendar2Line size={14} style={{ color: COLOR_TEXT_MUTED, marginBottom: '2px' }} />
													<span style={{ fontSize: '0.75rem' }}>{month.slice(0, 3)}</span>
												</div>
											</th>
										))}
										<th scope="col" className="text-center fw-semibold" style={{ minWidth: '120px', color: COLOR_TEXT_MUTED }}>Actions</th>
									</tr>
								</thead>
								<tbody>
									{resultData.map((item, index) => (
										<ResultAnalysisRow key={index} index={index} months={months} item={item} year={selectedYear} />
									))}
								</tbody>
							</table>
						</div>
					)}
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
		</div>
	);
}
