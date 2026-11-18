"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from 'recharts';
import {
	RiBarChart2Line,
	RiCalculatorLine,
	RiErrorWarningLine,
	RiFileList3Line,
	RiInbox2Line,
	RiRefreshLine,
	RiUserLine,
} from '@remixicon/react';
import { customFetch } from '../../../Auth/customFetch';
import styles from './AgeDistribution.module.css';

interface AgeDistributionData {
	age_range: string;
	patient_count: number;
}

interface ChartTooltipProps {
	active?: boolean;
	payload?: Array<{ payload?: AgeDistributionData }>;
}

const AGE_INTERVAL_MIN = 1;
const AGE_INTERVAL_MAX = 120;
const COLOR_ACCENT = '#3478c8';
const COLOR_MIN = '#9aa8b7';
const COLOR_MAX = '#d97745';

function getMinMaxIndexes(data: AgeDistributionData[]) {
	if (!data.length) return { min: -1, max: -1 };
	let min = 0;
	let max = 0;
	for (let index = 1; index < data.length; index += 1) {
		if (data[index].patient_count < data[min].patient_count) min = index;
		if (data[index].patient_count > data[max].patient_count) max = index;
	}
	return { min, max };
}

function getTotals(data: AgeDistributionData[]) {
	const totalPatients = data.reduce((sum, item) => sum + item.patient_count, 0);
	const totalAgeRanges = data.length;
	const avgPatientsPerRange = totalAgeRanges > 0 ? Math.round(totalPatients / totalAgeRanges) : 0;
	return { totalPatients, totalAgeRanges, avgPatientsPerRange };
}

const AgeDistribution: React.FC = () => {
	const [data, setData] = useState<AgeDistributionData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [interval, setInterval] = useState(10);
	const [pendingInterval, setPendingInterval] = useState('10');

	const requestAgeDistribution = useCallback(async (nextInterval: number) => {
		const result = await customFetch(`patient-analytics/age-distribution?interval=${nextInterval}`);
		if (!Array.isArray(result)) throw new Error('Unexpected age distribution response');
		return result.map((item: AgeDistributionData) => ({
			age_range: String(item.age_range ?? 'Unspecified'),
			patient_count: Number(item.patient_count) || 0,
		}));
	}, []);

	useEffect(() => {
		let active = true;
		requestAgeDistribution(10)
			.then((result) => {
				if (!active) return;
				setData(result);
				setInterval(10);
				setPendingInterval('10');
				setError(null);
			})
			.catch((requestError: unknown) => {
				if (!active) return;
				console.error('Unable to load patient age distribution', requestError);
				setError('We couldn’t load the age distribution. Check your connection and try again.');
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [requestAgeDistribution]);

	async function fetchAgeDistribution(nextInterval: number) {
		try {
			const result = await requestAgeDistribution(nextInterval);
			setData(result);
			setInterval(nextInterval);
			setPendingInterval(String(nextInterval));
		} catch (requestError) {
			console.error('Unable to load patient age distribution', requestError);
			setError('We couldn’t load the age distribution. Check your connection and try again.');
		} finally {
			setLoading(false);
		}
	}

	const selectedInterval = Number(pendingInterval);
	const canApplyInterval = Number.isInteger(selectedInterval)
		&& selectedInterval >= AGE_INTERVAL_MIN
		&& selectedInterval <= AGE_INTERVAL_MAX
		&& selectedInterval !== interval;

	function applyInterval(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!canApplyInterval || loading) return;
		setLoading(true);
		setError(null);
		void fetchAgeDistribution(selectedInterval);
	}

	function retryCurrentInterval() {
		setLoading(true);
		setError(null);
		void fetchAgeDistribution(interval);
	}

	const totals = getTotals(data);
	const { min, max } = getMinMaxIndexes(data);
	const chartHeight = Math.max(300, Math.min(720, data.length * 38 + 72));

	function renderTooltip({ active, payload }: ChartTooltipProps) {
		const entry = payload?.[0]?.payload;
		if (!active || !entry) return null;
		const percentage = totals.totalPatients > 0
			? ((entry.patient_count / totals.totalPatients) * 100).toFixed(1)
			: '0.0';

		return (
			<div className={styles.tooltip}>
				<span className={styles.tooltipLabel}>{entry.age_range} years</span>
				<strong>{entry.patient_count.toLocaleString()} patients</strong>
				<span>{percentage}% of patients with age recorded</span>
			</div>
		);
	}

	return (
		<section className={styles.page} aria-labelledby="age-distribution-title">
			<header className={styles.pageHeader}>
				<div className={styles.titleBlock}>
					<p className={styles.eyebrow}>Analytics / Patients</p>
					<h1 id="age-distribution-title">Age distribution</h1>
					<p className={styles.subtitle}>Explore how registered patients are distributed across age groups.</p>
				</div>

				<form className={styles.intervalForm} onSubmit={applyInterval}>
					<label htmlFor="age-interval">Age band</label>
					<div className={styles.intervalControls}>
						<div className={styles.intervalInputWrap}>
							<input
								id="age-interval"
								type="number"
								min={AGE_INTERVAL_MIN}
								max={AGE_INTERVAL_MAX}
								step={1}
								inputMode="numeric"
								value={pendingInterval}
								onChange={event => setPendingInterval(event.target.value)}
								aria-describedby="age-interval-help"
							/>
							<span>years</span>
						</div>
						<button type="submit" disabled={!canApplyInterval || loading}>
							{loading ? 'Loading…' : 'Apply'}
						</button>
					</div>
					<small id="age-interval-help">Choose 1–120 years per group</small>
				</form>
			</header>

			{loading ? (
				<div className={styles.summaryGrid} aria-label="Loading age metrics" aria-busy="true">
					{[0, 1, 2].map(item => (
						<div className={styles.summarySkeleton} key={item}>
							<span />
							<span />
						</div>
					))}
				</div>
			) : error ? (
				<div className={styles.stateCard} role="alert">
					<span className={styles.stateIcon}><RiErrorWarningLine size={23} aria-hidden="true" /></span>
					<div className={styles.stateText}>
						<h2>Age distribution unavailable</h2>
						<p>{error}</p>
					</div>
					<button className={styles.retryButton} type="button" onClick={retryCurrentInterval}>
						<RiRefreshLine size={17} aria-hidden="true" />
						Try again
					</button>
				</div>
			) : data.length === 0 ? (
				<div className={styles.emptyState}>
					<span className={styles.emptyIcon}><RiInbox2Line size={24} aria-hidden="true" /></span>
					<h2>No age data available</h2>
					<p>Patient age groups will appear here when age or date-of-birth information is recorded.</p>
				</div>
			) : (
				<>
					<div className={styles.summaryGrid} aria-label="Age distribution summary">
						<article className={styles.summaryCard} data-tone="blue">
							<span className={styles.summaryIcon}><RiUserLine size={20} aria-hidden="true" /></span>
							<div>
								<p>Total patients</p>
								<strong>{totals.totalPatients.toLocaleString()}</strong>
							</div>
						</article>
						<article className={styles.summaryCard} data-tone="violet">
							<span className={styles.summaryIcon}><RiBarChart2Line size={20} aria-hidden="true" /></span>
							<div>
								<p>Age groups</p>
								<strong>{totals.totalAgeRanges.toLocaleString()}</strong>
							</div>
						</article>
						<article className={styles.summaryCard} data-tone="green">
							<span className={styles.summaryIcon}><RiCalculatorLine size={20} aria-hidden="true" /></span>
							<div>
								<p>Average per group</p>
								<strong>{totals.avgPatientsPerRange.toLocaleString()}</strong>
							</div>
						</article>
					</div>

					<section className={styles.panel} aria-labelledby="age-chart-title">
						<div className={styles.panelHeader}>
							<div className={styles.panelTitle}>
								<span className={styles.panelIcon}><RiBarChart2Line size={19} aria-hidden="true" /></span>
								<div>
									<h2 id="age-chart-title">Patients by age group</h2>
									<p>Grouped in {interval}-year bands</p>
								</div>
							</div>
							<div className={styles.chartLegend}>
								<span><i data-color="normal" />Patient count</span>
								<span><i data-color="peak" />Largest group</span>
							</div>
						</div>
						<div className={styles.chartFrame} style={{ height: chartHeight }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={data}
									layout="vertical"
									margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
								>
									<CartesianGrid stroke="#e8eef5" strokeDasharray="4 5" horizontal={false} />
									<XAxis
										type="number"
										allowDecimals={false}
										tick={{ fontSize: 12, fill: '#718096' }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										type="category"
										dataKey="age_range"
										tick={{ fontSize: 12, fill: '#52657b' }}
										width={86}
										axisLine={false}
										tickLine={false}
									/>
									<Tooltip content={renderTooltip} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
									<Bar dataKey="patient_count" name="Patients" radius={[0, 6, 6, 0]} maxBarSize={24}>
										{data.map((entry, index) => (
											<Cell
												key={`${entry.age_range}-${index}`}
												fill={index === max ? COLOR_MAX : index === min ? COLOR_MIN : COLOR_ACCENT}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</section>

					<section className={styles.panel} aria-labelledby="age-table-title">
						<div className={styles.panelHeader}>
							<div className={styles.panelTitle}>
								<span className={styles.panelIcon}><RiFileList3Line size={19} aria-hidden="true" /></span>
								<div>
									<h2 id="age-table-title">Age group details</h2>
									<p>{data.length} groups · {totals.totalPatients.toLocaleString()} patients</p>
								</div>
							</div>
						</div>
						<div className={styles.tableWrap}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th scope="col">Age range</th>
										<th scope="col" className={styles.countColumn}>Patients</th>
										<th scope="col" className={styles.shareColumn}>Share of total</th>
									</tr>
								</thead>
								<tbody>
									{data.map((item, index) => {
										const percentage = totals.totalPatients > 0
											? (item.patient_count / totals.totalPatients) * 100
											: 0;
										return (
											<tr key={`${item.age_range}-${index}`}>
												<th scope="row">
													<span className={styles.ageRange}>{item.age_range} years</span>
													{index === max && data.length > 1 && <span className={styles.peakBadge}>Largest group</span>}
												</th>
												<td className={styles.countColumn}>{item.patient_count.toLocaleString()}</td>
												<td className={styles.shareColumn}>
													<div className={styles.shareCell}>
														<div className={styles.shareTrack} aria-hidden="true">
															<span style={{ width: `${Math.min(100, percentage)}%` }} />
														</div>
														<span>{percentage.toFixed(1)}%</span>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</section>
				</>
			)}
		</section>
	);
};

export default AgeDistribution;
