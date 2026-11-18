"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { RiErrorWarningLine, RiPrinterLine, RiRefreshLine, RiUserLine } from '@remixicon/react';
import { customFetch } from '../../../Auth/customFetch';
import styles from './PatientAnalyticsReport.module.css';

export interface PatientDistributionRow {
	label: string;
	count: number;
}

interface PatientDistributionReportProps {
	title: string;
	description: string;
	endpoint: string;
	categoryName: string;
	normalize: (value: string | null) => string;
	topN?: number;
}

const COLORS = ['#3478c8', '#d97745', '#4b9b73', '#8870bd', '#d3a33c', '#348c91', '#c56b8c', '#667b8c'];
const MUTED = 'var(--bs-secondary-color)';
const BORDER = 'var(--bs-border-color)';

export default function PatientDistributionReport({
	title,
	description,
	endpoint,
	categoryName,
	normalize,
	topN,
}: PatientDistributionReportProps) {
	const [data, setData] = useState<PatientDistributionRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await customFetch(endpoint);
			if (!Array.isArray(result)) throw new Error('Unexpected data format received.');
			const rows = result.map((row: Record<string, unknown>) => ({
				label: normalize(typeof row[categoryName] === 'string' ? row[categoryName] as string : null),
				count: Number(row.patient_count),
			})).map((row: PatientDistributionRow) => {
				if (!Number.isFinite(row.count) || row.count < 0) throw new Error('Invalid patient count in response.');
				return row;
			}).sort((a: PatientDistributionRow, b: PatientDistributionRow) => b.count - a.count);
			if (topN && rows.length > topN) {
				const rest = rows.splice(topN);
				rows.push({ label: 'Other', count: rest.reduce((sum: number, row: PatientDistributionRow) => sum + row.count, 0) });
			}
			setData(rows);
		} catch (requestError) {
			console.error(`Unable to load ${title.toLowerCase()}`, requestError);
			setError(`We couldn’t load this report. Check your connection and try again.`);
		} finally {
			setLoading(false);
		}
	}, [categoryName, endpoint, normalize, title, topN]);

	useEffect(() => {
		const timer = window.setTimeout(() => { void load(); }, 0);
		return () => window.clearTimeout(timer);
	}, [load]);

	const total = useMemo(() => data.reduce((sum, row) => sum + row.count, 0), [data]);
	const percentage = (count: number) => total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

	return (
		<section className={styles.report} aria-labelledby="distribution-title">
			<header className={styles.intro}>
				<div>
					<p className={styles.eyebrow}>Prime Laboratory Software · Patient analytics</p>
					<h1 className={styles.title} id="distribution-title">{title}</h1>
					<p className={styles.description}>{description}</p>
				</div>
				<div className={styles.actions}>
					<button className="btn btn-sm btn-outline-primary" type="button" onClick={() => window.print()}>
						<RiPrinterLine size={17} className="me-1" aria-hidden="true" /> Print report
					</button>
					{error && <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => void load()}>
						<RiRefreshLine size={17} className="me-1" aria-hidden="true" /> Try again
					</button>}
				</div>
			</header>

			{loading ? (
				<div className={styles.state} role="status" aria-live="polite" aria-busy="true">
					<span className={styles.stateIcon}><span className={styles.spinner} aria-hidden="true">◌</span></span>
					<h2>Loading report</h2><p>Retrieving patient distribution data…</p>
				</div>
			) : error ? (
				<div className={styles.state} role="alert">
					<span className={styles.stateIcon}><RiErrorWarningLine size={22} aria-hidden="true" /></span>
					<h2>Report unavailable</h2><p>{error}</p>
				</div>
			) : data.length === 0 ? (
				<div className={styles.state}>
					<span className={styles.stateIcon}><RiUserLine size={22} aria-hidden="true" /></span>
					<h2>No distribution data</h2><p>Patient records will appear here when {categoryName.replace('_', ' ')} information is available.</p>
				</div>
			) : (
				<>
					<div className="row g-3 mb-3" aria-label={`${title} summary`}>
						<div className="col-12 col-sm-6 col-xl-4">
							<article className="card h-100"><div className="card-body d-flex align-items-center gap-3 p-3">
								<span className={styles.stateIcon}><RiUserLine size={20} aria-hidden="true" /></span>
								<div><p className="small text-body-secondary mb-1">Patients in report</p><p className="h4 fw-bold mb-0">{total.toLocaleString()}</p></div>
							</div></article>
						</div>
						<div className="col-12 col-sm-6 col-xl-4">
							<article className="card h-100"><div className="card-body p-3">
								<p className="small text-body-secondary mb-1">{categoryName.replace('_', ' ')} categories shown</p>
								<p className="h4 fw-bold mb-0">{data.length.toLocaleString()}</p>
							</div></article>
						</div>
					</div>

					<div className="row g-3">
						<div className="col-12">
							<section className={styles.panel} aria-labelledby="distribution-chart-title">
								<h2 className={styles.panelTitle} id="distribution-chart-title">{categoryName.replace('_', ' ')} distribution</h2>
								<p className={styles.panelHint}>Patient counts by recorded category; percentages use the displayed report total.</p>
								<div className={styles.chart} role="img" aria-label={`${title} bar chart`}>
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
											<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
											<XAxis dataKey="label" tick={{ fontSize: 11, fill: MUTED }} interval={0} />
											<YAxis allowDecimals={false} width={56} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
											<Tooltip
												formatter={(value) => [Number(value).toLocaleString(), 'Patients']}
												contentStyle={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: BORDER, borderRadius: 10 }}
											/>
											<Bar dataKey="count" name="Patients" radius={[5, 5, 0, 0]} maxBarSize={56}>
												{data.map((row, index) => <Cell key={`${row.label}-${index}`} fill={COLORS[index % COLORS.length]} />)}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</section>
						</div>
						<div className="col-12">
							<section className={styles.panel} aria-labelledby="distribution-table-title">
								<h2 className={styles.panelTitle} id="distribution-table-title">Detailed breakdown</h2>
								<p className={styles.panelHint}>Counts and share of the total patients represented in this report.</p>
								<div className={styles.tableWrap}>
									<table className="table table-hover align-middle">
										<thead><tr><th scope="col">{categoryName.replace('_', ' ')}</th><th scope="col" className="text-end">Patients</th><th scope="col" className="text-end">Share</th></tr></thead>
										<tbody>{data.map((row, index) => <tr key={`${row.label}-${index}`}>
											<th scope="row" className="fw-semibold">{row.label}</th>
											<td className="text-end">{row.count.toLocaleString()}</td>
											<td className="text-end">{percentage(row.count)}%</td>
										</tr>)}</tbody>
									</table>
								</div>
							</section>
						</div>
					</div>
				</>
			)}
		</section>
	);
}
