"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { fetchPatientAnalytics } from './patientAnalyticsApi';
import { isPatientAnalyticsAccessDeniedError, patientAnalyticsFailureMessage } from './patientAnalyticsAccess';
import DateFilterReusable from '../../../operations/Laboratory/ResuableFilter/DateFilterReusable';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RiCalendarLine, RiErrorWarningLine, RiInbox2Line, RiPrinterLine, RiRefreshLine, RiUserLine } from '@remixicon/react';
import styles from './PatientAnalyticsReport.module.css';

interface RegistrationData {
	registration_date: string;
	patient_count: number;
}

const dateToday = () => dayjs().format('YYYY-MM-DD');
const dateThirtyDaysAgo = () => dayjs().subtract(30, 'days').format('YYYY-MM-DD');

const PatientRegistrationOverTime: React.FC = () => {
	const [data, setData] = useState<RegistrationData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [startDate, setStartDate] = useState(dateThirtyDaysAgo);
	const [endDate, setEndDate] = useState(dateToday);
	const [dateFilter, setDateFilter] = useState('last 30 Days');
	const requestId = useRef(0);

	const fetchRegistrationData = useCallback(async (from: string, to: string) => {
		const id = ++requestId.current;
		if (!from || !to || dayjs(from).isAfter(dayjs(to), 'day')) {
			setError('Choose a valid date range. The start date must not be after the end date.');
			setData([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const result = await fetchPatientAnalytics(`patient-analytics/patient-registration-over-time?startdate=${encodeURIComponent(from)}&enddate=${encodeURIComponent(to)}`);
			if (!Array.isArray(result)) throw new Error('Unexpected data format received.');
			if (id !== requestId.current) return;
			setData(result.map((item: RegistrationData) => {
				const patientCount = Number(item.patient_count);
				if (!item.registration_date || !Number.isSafeInteger(patientCount) || patientCount < 0) {
					throw new Error('Invalid patient registration count in response.');
				}
				return {
					registration_date: dayjs(item.registration_date).format('DD-MM-YYYY'),
					patient_count: patientCount,
				};
			}));
		} catch (requestError) {
			if (id !== requestId.current) return;
			setData([]);
			if (!isPatientAnalyticsAccessDeniedError(requestError)) {
				console.error('Unable to load patient registration trend', requestError);
			}
			setError(patientAnalyticsFailureMessage(
				requestError,
				'We couldn’t load registration activity. Check your connection and try again.',
			));
		} finally {
			if (id === requestId.current) setLoading(false);
		}
	}, []);

	useEffect(() => {
		const timer = window.setTimeout(() => { void fetchRegistrationData(startDate, endDate); }, 0);
		return () => {
			window.clearTimeout(timer);
			requestId.current += 1;
		};
		// Initial request only; date changes call fetchRegistrationData directly.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const applyRange = (from: string, to: string) => {
		setStartDate(from);
		setEndDate(to);
		void fetchRegistrationData(from, to);
	};

	const totals = useMemo(() => {
		const totalPatients = data.reduce((sum, item) => sum + item.patient_count, 0);
		return {
			totalPatients,
			activeDays: data.length,
			average: data.length ? Math.round(totalPatients / data.length) : 0,
			peak: data.reduce((max, item) => Math.max(max, item.patient_count), 0),
		};
	}, [data]);

	const reset = () => {
		const from = dateThirtyDaysAgo();
		const to = dateToday();
		setDateFilter('last 30 Days');
		applyRange(from, to);
	};

	return (
		<section className={styles.report} aria-labelledby="registration-trend-title">
			<header className={styles.intro}>
				<div>
					<p className={styles.eyebrow}>Prime Laboratory Software · Patient analytics</p>
					<h1 className={styles.title} id="registration-trend-title">Patient registration over time</h1>
					<p className={styles.description}>Track the number of patients registered on each day within the selected period.</p>
				</div>
				<div className={styles.actions}>
					<button className="btn btn-sm btn-outline-primary" type="button" onClick={() => window.print()}><RiPrinterLine size={17} className="me-1" aria-hidden="true" />Print report</button>
					{error && <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => void fetchRegistrationData(startDate, endDate)}><RiRefreshLine size={17} className="me-1" aria-hidden="true" />Try again</button>}
				</div>
			</header>

			<div className={`${styles.filterBar} mb-3`} aria-label="Registration date filters">
				<div className={styles.filterField}>
					<label htmlFor="registration-period">Quick period</label>
					<DateFilterReusable id="registration-period" value={dateFilter} onChange={setDateFilter} onDateRangeChange={applyRange} label="Period" className="w-100" />
				</div>
				<div className={styles.filterField}>
					<label htmlFor="registration-start">Start date</label>
					<div className="input-group">
						<span className="input-group-text"><RiCalendarLine size={16} aria-hidden="true" /></span>
						<input id="registration-start" type="date" className="form-control" value={startDate} max={endDate} onChange={event => applyRange(event.target.value, endDate)} />
					</div>
				</div>
				<div className={styles.filterField}>
					<label htmlFor="registration-end">End date</label>
					<div className="input-group">
						<span className="input-group-text"><RiCalendarLine size={16} aria-hidden="true" /></span>
						<input id="registration-end" type="date" className="form-control" value={endDate} min={startDate} onChange={event => applyRange(startDate, event.target.value)} />
					</div>
				</div>
				<button type="button" className="btn btn-outline-secondary" onClick={reset}>Reset period</button>
			</div>

			{loading ? (
				<div className={styles.state} role="status" aria-live="polite" aria-busy="true">
					<span className={styles.stateIcon}><span className={styles.spinner} aria-hidden="true">◌</span></span>
					<h2>Loading registration activity</h2><p>Fetching daily patient counts for {startDate} to {endDate}.</p>
				</div>
			) : error ? (
				<div className={styles.state} role="alert">
					<span className={styles.stateIcon}><RiErrorWarningLine size={22} aria-hidden="true" /></span>
					<h2>Report unavailable</h2><p>{error}</p>
				</div>
			) : data.length === 0 ? (
				<div className={styles.state}>
					<span className={styles.stateIcon}><RiInbox2Line size={22} aria-hidden="true" /></span>
					<h2>No registrations in this period</h2><p>Try a wider date range to view patient registrations.</p>
				</div>
			) : (
				<>
					<div className="row g-3 mb-3" aria-label="Registration summary">
						<div className="col-12 col-sm-6 col-xl-3"><article className="card h-100"><div className="card-body p-3"><p className="small text-body-secondary mb-1">Patients registered</p><p className="h3 fw-bold mb-0">{totals.totalPatients.toLocaleString()}</p></div></article></div>
						<div className="col-12 col-sm-6 col-xl-3"><article className="card h-100"><div className="card-body p-3"><p className="small text-body-secondary mb-1">Days with registrations</p><p className="h3 fw-bold mb-0">{totals.activeDays.toLocaleString()}</p></div></article></div>
						<div className="col-12 col-sm-6 col-xl-3"><article className="card h-100"><div className="card-body p-3"><p className="small text-body-secondary mb-1">Average per active day</p><p className="h3 fw-bold mb-0">{totals.average.toLocaleString()}</p></div></article></div>
						<div className="col-12 col-sm-6 col-xl-3"><article className="card h-100"><div className="card-body p-3"><p className="small text-body-secondary mb-1">Peak day count</p><p className="h3 fw-bold mb-0">{totals.peak.toLocaleString()}</p></div></article></div>
					</div>
					<div className="row g-3">
						<div className="col-12">
							<section className={styles.panel} aria-labelledby="registration-chart-title">
								<h2 className={styles.panelTitle} id="registration-chart-title">Daily registration trend</h2>
								<p className={styles.panelHint}>Date labels use the reporting service’s returned registration dates.</p>
								<div className={styles.chart} role="img" aria-label="Daily patient registration trend chart">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
											<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
											<XAxis dataKey="registration_date" tick={{ fontSize: 10, fill: 'var(--bs-secondary-color)' }} interval="preserveStartEnd" />
											<YAxis allowDecimals={false} width={56} tick={{ fontSize: 11, fill: 'var(--bs-secondary-color)' }} axisLine={false} tickLine={false} />
											<Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Registered']} contentStyle={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)', borderRadius: 10 }} />
											<Line type="monotone" dataKey="patient_count" name="Patients" stroke="#3478c8" strokeWidth={2.5} dot={{ r: 2, fill: '#3478c8' }} activeDot={{ r: 5 }} />
										</LineChart>
									</ResponsiveContainer>
								</div>
							</section>
						</div>
						<div className="col-12">
							<section className={styles.panel} aria-labelledby="registration-table-title">
								<h2 className={styles.panelTitle} id="registration-table-title">Daily breakdown</h2>
								<p className={styles.panelHint}><RiUserLine size={14} className="me-1" aria-hidden="true" />Counts for the selected date range: {startDate} – {endDate}.</p>
								<div className={styles.tableWrap}>
									<table className="table table-hover align-middle">
										<thead><tr><th scope="col">Registration date</th><th scope="col" className="text-end">Patients registered</th></tr></thead>
										<tbody>{data.map((item, index) => <tr key={`${item.registration_date}-${index}`}>
											<th scope="row">{item.registration_date}</th><td className="text-end">{item.patient_count.toLocaleString()}</td>
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

export default PatientRegistrationOverTime;
