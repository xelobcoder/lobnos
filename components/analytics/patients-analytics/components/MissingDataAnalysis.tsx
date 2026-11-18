"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RiErrorWarningLine, RiPrinterLine, RiRefreshLine, RiUserUnfollowLine } from '@remixicon/react';
import { customFetch } from '../../../Auth/customFetch';
import styles from './PatientAnalyticsReport.module.css';

interface MissingDataResponse {
	missing_emails?: number | string | null;
	missing_mobile_numbers?: number | string | null;
	missing_middlenames?: number | string | null;
}

interface MissingField {
	field: string;
	missing: number;
}

const COLORS = ['#d97745', '#d3a33c', '#8870bd'];

const MissingDataAnalysis: React.FC = () => {
	const [data, setData] = useState<MissingField[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await customFetch('patient-analytics/missing-data-analysis');
			const row = Array.isArray(result) ? result[0] : result;
			if (Array.isArray(result) && result.length === 0) {
				setData([]);
				return;
			}
			if (!row || typeof row !== 'object') throw new Error('Unexpected data format received.');
			const response = row as MissingDataResponse;
			const asCount = (value: MissingDataResponse[keyof MissingDataResponse]) => {
				const count = Number(value);
				if (value === undefined || value === null || !Number.isFinite(count) || count < 0) {
					throw new Error('Invalid missing-data count in response.');
				}
				return count;
			};
			setData([
				{ field: 'Email', missing: asCount(response.missing_emails) },
				{ field: 'Mobile number', missing: asCount(response.missing_mobile_numbers) },
				{ field: 'Middle name', missing: asCount(response.missing_middlenames) },
			]);
		} catch (requestError) {
			console.error('Unable to load missing patient data analysis', requestError);
			setError('We couldn’t load the missing-data report. Check your connection and try again.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const timer = window.setTimeout(() => { void load(); }, 0);
		return () => window.clearTimeout(timer);
	}, [load]);

	const totalMissing = useMemo(() => data.reduce((sum, item) => sum + item.missing, 0), [data]);
	const share = (value: number) => totalMissing > 0 ? ((value / totalMissing) * 100).toFixed(1) : '0.0';

	return (
		<section className={styles.report} aria-labelledby="missing-data-title">
			<header className={styles.intro}>
				<div>
					<p className={styles.eyebrow}>Prime Laboratory Software · Patient analytics</p>
					<h1 className={styles.title} id="missing-data-title">Missing patient data</h1>
					<p className={styles.description}>Identify common gaps in selected patient profile fields to guide registration follow-up.</p>
				</div>
				<div className={styles.actions}>
					<button className="btn btn-sm btn-outline-primary" type="button" onClick={() => window.print()}><RiPrinterLine size={17} className="me-1" aria-hidden="true" />Print report</button>
					{error && <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => void load()}><RiRefreshLine size={17} className="me-1" aria-hidden="true" />Try again</button>}
				</div>
			</header>

			{loading ? (
				<div className={styles.state} role="status" aria-live="polite" aria-busy="true">
					<span className={styles.stateIcon}><span className={styles.spinner} aria-hidden="true">◌</span></span>
					<h2>Loading report</h2><p>Checking selected patient profile fields…</p>
				</div>
			) : error ? (
				<div className={styles.state} role="alert">
					<span className={styles.stateIcon}><RiErrorWarningLine size={22} aria-hidden="true" /></span>
					<h2>Report unavailable</h2><p>{error}</p>
				</div>
			) : data.length === 0 ? (
				<div className={styles.state}>
					<span className={styles.stateIcon}><RiUserUnfollowLine size={22} aria-hidden="true" /></span>
					<h2>No profile-field data available</h2><p>Missing-field counts will appear when patient records are available.</p>
				</div>
			) : (
				<>
					<div className="row g-3 mb-3">
						<div className="col-12 col-sm-6 col-xl-4">
							<article className="card h-100"><div className="card-body d-flex align-items-center gap-3 p-3">
								<span className={styles.stateIcon}><RiUserUnfollowLine size={20} aria-hidden="true" /></span>
								<div><p className="small text-body-secondary mb-1">Missing values across listed fields</p><p className="h4 fw-bold mb-0">{totalMissing.toLocaleString()}</p></div>
							</div></article>
						</div>
						<div className="col-12 col-sm-6 col-xl-4">
							<article className="card h-100"><div className="card-body p-3">
								<p className="small text-body-secondary mb-1">Profile fields assessed</p><p className="h4 fw-bold mb-0">{data.length}</p>
							</div></article>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-12">
							<section className={styles.panel} aria-labelledby="missing-chart-title">
								<h2 className={styles.panelTitle} id="missing-chart-title">Missing values by field</h2>
								<p className={styles.panelHint}>The share is each field’s contribution to the total missing values shown below.</p>
								<div className={styles.chart} role="img" aria-label="Missing patient values by field">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
											<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
											<XAxis dataKey="field" tick={{ fontSize: 11, fill: 'var(--bs-secondary-color)' }} />
											<YAxis allowDecimals={false} width={56} tick={{ fontSize: 11, fill: 'var(--bs-secondary-color)' }} axisLine={false} tickLine={false} />
											<Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Missing']} contentStyle={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)', borderRadius: 10 }} />
											<Bar dataKey="missing" name="Missing values" radius={[5, 5, 0, 0]} maxBarSize={64}>
												{data.map((row, index) => <Cell key={row.field} fill={COLORS[index % COLORS.length]} />)}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</section>
						</div>
						<div className="col-12">
							<section className={styles.panel} aria-labelledby="missing-table-title">
								<h2 className={styles.panelTitle} id="missing-table-title">Field breakdown</h2>
								<p className={styles.panelHint}>Counts reflect missing values in the data returned by the patient analytics service.</p>
								<div className={styles.tableWrap}>
									<table className="table table-hover align-middle">
										<thead><tr><th scope="col">Patient field</th><th scope="col" className="text-end">Missing count</th><th scope="col" className="text-end">Share of missing</th></tr></thead>
										<tbody>{data.map((item) => <tr key={item.field}>
											<th scope="row">{item.field}</th><td className="text-end">{item.missing.toLocaleString()}</td><td className="text-end">{share(item.missing)}%</td>
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
};

export default MissingDataAnalysis;
