"use client";

import React, { useEffect, useState } from 'react';
import { RiErrorWarningLine, RiRefreshLine, RiUserAddLine, RiUserHeartLine, RiUserLine } from '@remixicon/react';
import { fetchPatientAnalytics } from './patientAnalyticsApi';
import { isPatientAnalyticsAccessDeniedError, patientAnalyticsFailureMessage } from './patientAnalyticsAccess';
import { dashboardRowFromResponse } from './dashboardResponse';
import styles from './Dashboards.module.css';

type CountValue = number | string | null | undefined;

interface PatientDashboardData {
	total_patients: CountValue;
	active_patients: CountValue;
	male_patients: CountValue;
	female_patients: CountValue;
}

function asCount(value: CountValue): number {
	return Number(value);
}

function percentOfTotal(value: number, total: number): number {
	return total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
}

const Dashboards: React.FC = () => {
	const [data, setData] = useState<PatientDashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	useEffect(() => {
		let cancelled = false;

		async function fetchData() {
			setLoading(true);
			setError(null);
			try {
				const result = await fetchPatientAnalytics('patient-analytics/dashboards');
				const row = dashboardRowFromResponse(result);
				if (!cancelled) setData(row);
			} catch (requestError) {
				if (!cancelled) {
					setData(null);
					if (!isPatientAnalyticsAccessDeniedError(requestError)) {
						console.error('Unable to load patient analytics dashboard', requestError);
					}
					setError(patientAnalyticsFailureMessage(
						requestError,
						'We couldn’t load the patient summary. Check your connection and try again.',
					));
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		void fetchData();
		return () => {
			cancelled = true;
		};
	}, [retryCount]);

	const totalPatients = asCount(data?.total_patients);
	const metrics = [
		{
			label: 'Total patients',
			value: totalPatients,
			detail: totalPatients === 1 ? 'registered patient' : 'registered patients',
			share: totalPatients > 0 ? 100 : 0,
			icon: <RiUserLine size={21} aria-hidden="true" />,
			tone: 'blue',
		},
		{
			label: 'Active patients',
			value: asCount(data?.active_patients),
			detail: totalPatients > 0 ? `${percentOfTotal(asCount(data?.active_patients), totalPatients)}% of all patients` : 'No patient records yet',
			share: percentOfTotal(asCount(data?.active_patients), totalPatients),
			icon: <RiUserAddLine size={21} aria-hidden="true" />,
			tone: 'green',
		},
		{
			label: 'Female patients',
			value: asCount(data?.female_patients),
			detail: totalPatients > 0 ? `${percentOfTotal(asCount(data?.female_patients), totalPatients)}% of all patients` : 'No patient records yet',
			share: percentOfTotal(asCount(data?.female_patients), totalPatients),
			icon: <RiUserHeartLine size={21} aria-hidden="true" />,
			tone: 'violet',
		},
		{
			label: 'Male patients',
			value: asCount(data?.male_patients),
			detail: totalPatients > 0 ? `${percentOfTotal(asCount(data?.male_patients), totalPatients)}% of all patients` : 'No patient records yet',
			share: percentOfTotal(asCount(data?.male_patients), totalPatients),
			icon: <RiUserLine size={21} aria-hidden="true" />,
			tone: 'orange',
		},
	] as const;

	return (
		<section className={styles.dashboard} aria-labelledby="patient-dashboard-title">
			<header className={styles.header}>
				<div>
					<p className={styles.eyebrow}>Analytics / Patients</p>
					<h1 id="patient-dashboard-title">Patient overview</h1>
					<p className={styles.subtitle}>A clear snapshot of the patients registered at your facility.</p>
				</div>
				<div className={styles.headerBadge}>
					<span className={styles.statusDot} aria-hidden="true" />
					Patient snapshot
				</div>
			</header>

			{loading ? (
				<div className={styles.grid} aria-label="Loading patient metrics" aria-busy="true">
					{[0, 1, 2, 3].map(item => (
						<div className={styles.skeletonCard} key={item}>
							<div className={styles.skeletonTop} />
							<div className={styles.skeletonValue} />
							<div className={styles.skeletonBottom} />
						</div>
					))}
				</div>
			) : error ? (
				<div className={styles.stateCard} role="alert">
					<span className={styles.stateIcon}><RiErrorWarningLine size={24} aria-hidden="true" /></span>
					<div className={styles.stateCopy}>
						<h2>Dashboard unavailable</h2>
						<p>{error}</p>
					</div>
					<button className={styles.retryButton} type="button" onClick={() => setRetryCount(count => count + 1)}>
						<RiRefreshLine size={17} aria-hidden="true" />
						Try again
					</button>
				</div>
			) : data ? (
				<div className={styles.grid} aria-label="Patient metrics">
					{metrics.map(metric => (
						<article className={styles.metricCard} data-tone={metric.tone} key={metric.label}>
							<div className={styles.metricTop}>
								<span className={styles.metricIcon}>{metric.icon}</span>
								<span className={styles.metricLabel}>{metric.label}</span>
							</div>
							<div className={styles.metricValue}>{metric.value.toLocaleString()}</div>
							<div className={styles.metricDetail}>{metric.detail}</div>
							<div className={styles.progressTrack} role="progressbar" aria-label={`${metric.label} share`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={metric.share}>
								<span style={{ width: `${metric.share}%` }} />
							</div>
						</article>
					))}
				</div>
			) : (
				<div className={styles.emptyState}>
					<span className={styles.emptyIcon}><RiUserLine size={24} aria-hidden="true" /></span>
					<h2>No patient summary yet</h2>
					<p>The dashboard will show patient metrics once records are available.</p>
				</div>
			)}
		</section>
	);
};

export default Dashboards;
