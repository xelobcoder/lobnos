"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { RiErrorWarningLine, RiPhoneLine, RiPrinterLine, RiRefreshLine, RiUserLine } from '@remixicon/react';
import { customFetch } from '../../../Auth/customFetch';
import styles from './PatientAnalyticsReport.module.css';

interface ContactCompletenessData {
	total: number;
	complete_contact: string | number;
}

interface ContactMetrics {
	total: number;
	complete: number;
	incomplete: number;
	rate: number;
}

const ContactCompleteness: React.FC = () => {
	const [metrics, setMetrics] = useState<ContactMetrics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await customFetch('patient-analytics/contact-completeness');
			const row = Array.isArray(result) ? result[0] : result;
			if (!row || typeof row !== 'object') {
				setMetrics(null);
				return;
			}
			const response = row as ContactCompletenessData;
			if (response.total === undefined || response.total === null || response.complete_contact === undefined || response.complete_contact === null) {
				throw new Error('Unexpected data format received.');
			}
			const total = Number(response.total);
			const complete = Number(response.complete_contact);
			if (!Number.isFinite(total) || !Number.isFinite(complete) || total < 0 || complete < 0) {
				throw new Error('Unexpected data format received.');
			}
			setMetrics({
				total,
				complete,
				incomplete: Math.max(0, total - complete),
				rate: total > 0 ? Math.min(100, Math.round((complete / total) * 1000) / 10) : 0,
			});
		} catch (requestError) {
			console.error('Unable to load patient contact completeness', requestError);
			setError('We couldn’t load contact completeness. Check your connection and try again.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const timer = window.setTimeout(() => { void load(); }, 0);
		return () => window.clearTimeout(timer);
	}, [load]);

	const tone = metrics && metrics.rate >= 95 ? 'success' : metrics && metrics.rate >= 80 ? 'warning' : 'danger';
	const progressColor = tone === 'success' ? '#198754' : tone === 'warning' ? '#d97706' : '#dc3545';

	return (
		<section className={styles.report} aria-labelledby="contact-completeness-title">
			<header className={styles.intro}>
				<div>
					<p className={styles.eyebrow}>Prime Laboratory Software · Patient analytics</p>
					<h1 className={styles.title} id="contact-completeness-title">Contact completeness</h1>
					<p className={styles.description}>Measure how many registered patient records include the contact information required by this report.</p>
				</div>
				<div className={styles.actions}>
					<button className="btn btn-sm btn-outline-primary" type="button" onClick={() => window.print()}><RiPrinterLine size={17} className="me-1" aria-hidden="true" />Print report</button>
					{error && <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => void load()}><RiRefreshLine size={17} className="me-1" aria-hidden="true" />Try again</button>}
				</div>
			</header>

			{loading ? (
				<div className={styles.state} role="status" aria-live="polite" aria-busy="true">
					<span className={styles.stateIcon}><span className={styles.spinner} aria-hidden="true">◌</span></span>
					<h2>Loading report</h2><p>Calculating patient contact completion…</p>
				</div>
			) : error ? (
				<div className={styles.state} role="alert">
					<span className={styles.stateIcon}><RiErrorWarningLine size={22} aria-hidden="true" /></span>
					<h2>Report unavailable</h2><p>{error}</p>
				</div>
			) : !metrics ? (
				<div className={styles.state}>
					<span className={styles.stateIcon}><RiPhoneLine size={22} aria-hidden="true" /></span>
					<h2>No contact data available</h2><p>There are no patient records in the contact completeness response.</p>
				</div>
			) : metrics.total === 0 ? (
				<div className={styles.state}>
					<span className={styles.stateIcon}><RiUserLine size={22} aria-hidden="true" /></span>
					<h2>No patients to assess</h2><p>Patient contact metrics will appear when patient records are available.</p>
				</div>
			) : (
				<div className="row g-3">
					<div className="col-12 col-sm-6 col-xl-3">
						<article className="card h-100"><div className="card-body p-3">
							<p className="small text-body-secondary mb-1">Patients assessed</p><p className="h3 fw-bold mb-0">{metrics.total.toLocaleString()}</p>
						</div></article>
					</div>
					<div className="col-12 col-sm-6 col-xl-3">
						<article className="card h-100"><div className="card-body p-3">
							<p className="small text-body-secondary mb-1">Complete contact</p><p className="h3 fw-bold text-success mb-0">{metrics.complete.toLocaleString()}</p>
						</div></article>
					</div>
					<div className="col-12 col-sm-6 col-xl-3">
						<article className="card h-100"><div className="card-body p-3">
							<p className="small text-body-secondary mb-1">Incomplete contact</p><p className="h3 fw-bold text-warning mb-0">{metrics.incomplete.toLocaleString()}</p>
						</div></article>
					</div>
					<div className="col-12 col-sm-6 col-xl-3">
						<article className="card h-100"><div className="card-body p-3">
							<p className="small text-body-secondary mb-1">Completion rate</p><p className="h3 fw-bold mb-0" style={{ color: progressColor }}>{metrics.rate.toFixed(1)}%</p>
						</div></article>
					</div>
					<div className="col-12">
						<section className={styles.panel} aria-labelledby="contact-progress-title">
							<div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
								<div><h2 className={styles.panelTitle} id="contact-progress-title">Patient contact coverage</h2>
									<p className={styles.panelHint}>Completion rate is complete-contact records divided by all assessed patient records.</p></div>
								<span className={`badge text-bg-${tone}`}>{metrics.rate.toFixed(1)}% complete</span>
							</div>
							<div className="progress" style={{ height: 18 }} role="progressbar" aria-label="Contact completion rate" aria-valuenow={metrics.rate} aria-valuemin={0} aria-valuemax={100}>
								<div className="progress-bar" style={{ width: `${metrics.rate}%`, backgroundColor: progressColor }} />
							</div>
							<div className="d-flex flex-wrap justify-content-between gap-2 mt-3 small">
								<span className="text-success">Complete: {metrics.complete.toLocaleString()}</span>
								<span className="text-warning">Incomplete: {metrics.incomplete.toLocaleString()}</span>
							</div>
							{metrics.complete > metrics.total && <p className="text-warning small mt-3 mb-0" role="note">The returned complete count exceeds the total patient count; percentage is capped at 100% and incomplete count is shown as zero. Please review source data.</p>}
						</section>
					</div>
				</div>
			)}
		</section>
	);
};

export default ContactCompleteness;
