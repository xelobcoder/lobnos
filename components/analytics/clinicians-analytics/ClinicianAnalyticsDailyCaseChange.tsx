"use client"; 

import React, { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import moment from 'moment';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, Button, Form } from 'react-bootstrap';
import { ArrowBack, ArrowCircleLeftRounded, ArrowForward } from '@mui/icons-material';
import styles from '../../../styles/SmsTemplateList.module.css';

interface DailyCaseChange {
	date: string;
	clinician_cases: number;
	previous_day_cases: number | null;
	percentage_change: string;
}

interface MonthlyCaseChange {
	month: string; 
	clinician_cases: number;
	previous_month_cases: number | null;
	percentage_change: string;
}

interface YearlyCaseChange {
	year: number;
	clinician_cases: number;
	previous_year_cases: number | null;
	percentage_change: string;
}

type CaseData = DailyCaseChange | MonthlyCaseChange | YearlyCaseChange;

interface ClinicianAnalyticsDailyCaseChangeProps {
	clinicianId: number;
}

interface PaginationParams {
	page: number;
	count: number;
}

type TimePeriod = 'daily' | 'monthly' | 'yearly';

const CustomTooltip = ({ active, payload, label }: any) => {
	if (!active || !payload || !payload.length) return null;

	const data = payload[0].payload;
	const percentageChange = parseFloat(data.percentage_change);

	return (
		<div className="bg-white p-3 shadow-sm rounded border" style={{ fontSize: '0.875rem' }}>
			<p className="fw-bold mb-2">{moment(label).format('MMMM D, YYYY')}</p>
			<div className="d-flex flex-column gap-1">
				<div>Cases: <span className="fw-semibold">{data.clinician_cases}</span></div>
				<div>Previous: <span className="fw-semibold">
					{data.previous_year_cases ?? data.previous_month_cases ?? data.previous_day_cases ?? '-'}
				</span></div>
				<div className={`fw-semibold ${percentageChange > 0 ? 'text-success' : percentageChange < 0 ? 'text-danger' : 'text-muted'}`}>
					Change: {percentageChange === 0 ? '-' : `${percentageChange.toFixed(1)}%`}
				</div>
			</div>
		</div>
	);
};

const CARD_HEIGHT = '600px';

const ClinicianAnalyticsDailyCaseChange: React.FC<ClinicianAnalyticsDailyCaseChangeProps> = ({ clinicianId }) => {
	const [caseData, setCaseData] = useState<CaseData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState<PaginationParams>({
		page: 1,
		count: 10
	});
	const [totalPages, setTotalPages] = useState(1);
	const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily'); 

	const fetchData = async (pagination: PaginationParams, period: TimePeriod) => {
		setLoading(true);
		try {
			let endpoint = `clinician/anal/case-change/${period}/${clinicianId}?page=${pagination.page}&count=${pagination.count}`;
			const response = await customFetch(endpoint);
			if (response?.success) {
				let sortedData;
				if (period === 'yearly') {
					
					sortedData = response.data.sort((a: YearlyCaseChange, b: YearlyCaseChange) =>
						a.year - b.year
					);
				} else if (period === 'monthly') {
					
					sortedData = response.data.sort((a: MonthlyCaseChange, b: MonthlyCaseChange) =>
						moment(a.month).valueOf() - moment(b.month).valueOf()
					);
				} else {
					
					sortedData = response.data.sort((a: DailyCaseChange, b: DailyCaseChange) =>
						moment(a.date).valueOf() - moment(b.date).valueOf()
					);
				}
				setCaseData(sortedData);
				if (response.total) {
					setTotalPages(Math.ceil(response.total / pagination.count));
				}
			} else {
				setError('Failed to fetch data');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unknown error occurred');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(pagination, timePeriod);
	}, [clinicianId, timePeriod]);

	const handlePageMan = (action: "increase" | "decrease") => {
		if (action === "increase" && pagination.page) {
			const currentValue = pagination.page + 1;
			setPagination(prev => ({ ...prev, page: currentValue }));
			fetchData({ ...pagination, page: currentValue }, timePeriod);
		} else if (action === "decrease" && pagination.page > 0) {
			const currentValue = pagination.page - 1;
			setPagination(prev => ({ ...prev, page: currentValue }));
			fetchData({ ...pagination, page: currentValue }, timePeriod);
		}
	};

	const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newCount = parseInt(event.target.value, 10);
		if (!isNaN(newCount) && newCount > 0) {
			setPagination(prev => ({ ...prev, count: newCount }));
		}
	};

	const handleRefreshClick = () => {
		fetchData(pagination, timePeriod);
	};

	const handleTimePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const period = event.target.value as TimePeriod;
		setTimePeriod(period);
		setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when period changes
	};

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="alert alert-danger" role="alert">{error}</div>
		);
	}

	return (
		<div className="container-fluid p-4">
			<div className="row mb-3">
				<div className="col-12 d-flex justify-content-end align-items-center gap-3">
					<Form.Select
						style={{ width: '150px' }}
						value={timePeriod}
						onChange={handleTimePeriodChange}
					>
						<option value="daily">Daily</option>
						<option value="monthly">Monthly</option>
						<option value="yearly">Yearly</option>
					</Form.Select>
					<input
						type="number"
						min="1"
						className="custom-input"
						value={pagination.count}
						onChange={handleCountChange}
						style={{ width: '150px' }}
						placeholder="Records per page"
					/>
					<Button variant="primary" size="sm" onClick={handleRefreshClick}>
						<ArrowCircleLeftRounded /> Refresh
					</Button>
				</div>
			</div>
			<div className="row g-4">
				<div className="col-12">
					<div className="row g-4">
						{/* Chart Column */}
						<div className="col-12 col-xl-6">
							<Card className="h-100 border-0">
								<Card.Body className="p-4 d-flex flex-column">
									<div className="d-flex justify-content-between align-items-center mb-4">
										<h5 className="mb-0 pls-label">Case Trend Analysis</h5>
									</div>
									<div style={{ height: CARD_HEIGHT, flex: 1 }}>
										<ResponsiveContainer width="100%" height="100%">
											<AreaChart data={caseData}>
												<defs>
													<linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
														<stop offset="5%" stopColor="#0d6efd" stopOpacity={0.1} />
														<stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
													</linearGradient>
												</defs>
												<CartesianGrid strokeDasharray="3 3" opacity={0.1} />
												<XAxis
													dataKey={timePeriod === 'yearly' ? 'year' : timePeriod === 'monthly' ? 'month' : 'date'}
													tickFormatter={(value) =>
														timePeriod === 'yearly'
															? value
															: timePeriod === 'monthly'
																? moment(value).format('MMM YYYY')
																: moment(value).format('MMM DD')
													}
													fontSize={12}
													tick={{ fill: '#6c757d' }}
												/>
												<YAxis fontSize={12} tick={{ fill: '#6c757d' }} />
												<Tooltip content={<CustomTooltip />} />
												<Area
													type="monotone"
													dataKey="clinician_cases"
													stroke="#0d6efd"
													fillOpacity={1}
													fill="url(#colorCases)"
													strokeWidth={2}
												/>
											</AreaChart>
										</ResponsiveContainer>
									</div>
								</Card.Body>
							</Card>
						</div>

						<div className="col-12 col-xl-6">
							<Card className="border-0 h-100">
								<Card.Body className="p-4 d-flex flex-column">
									<div className="d-flex justify-content-between align-items-center mb-4">
										<h5 className="mb-0 pls-label">Detailed Case Analysis</h5>
									</div>
									<div className="table-responsive" style={{ height: CARD_HEIGHT, flex: 1 }}>
										<table className={styles.table} style={{ overflowY: 'auto' }}>
											<thead>
												<tr>
													<th>{timePeriod === 'yearly' ? 'Year' : timePeriod === 'monthly' ? 'Month' : 'Date'}</th>
													<th className="text-end">Cases</th>
													<th className="text-end">Previous {timePeriod === 'yearly' ? 'Year' : timePeriod === 'monthly' ? 'Month' : 'Day'}</th>
													<th className="text-end">Change</th>
												</tr>
											</thead>
											<tbody>
												{caseData.map((item: any, index) => {
													const percentageChange = parseFloat(item.percentage_change);
													return (
														<tr key={index}>
															<td>
																{timePeriod === 'yearly'
																	? item.year
																	: timePeriod === 'monthly'
																		? moment(item.month).format('MMM YYYY')
																		: moment(item.date).format('MMM DD, YYYY')
																}
															</td>
															<td className="text-end fw-semibold">{item.clinician_cases}</td>
															<td className="text-end text-muted">
																{timePeriod === 'yearly'
																	? item.previous_year_cases ?? '-'
																	: timePeriod === 'monthly'
																		? item.previous_month_cases ?? '-'
																		: item.previous_day_cases ?? '-'
																}
															</td>
															<td className="text-end">
																<span className={`badge ${percentageChange > 0 ? 'bg-success' :
																	percentageChange < 0 ? 'bg-danger' :
																		'bg-secondary'
																	}`}>
																	{percentageChange === 0 ? '-' : `${percentageChange.toFixed(1)}%`}
																</span>
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</Card.Body>
							</Card>
						</div>
					</div>
				</div>
			</div>
			<div className="row mt-3">
				<div className="col-12 d-flex justify-content-center">
					<Button
						variant="light"
						onClick={() => handlePageMan("decrease")}
						className="btn-sm"
					>
						<ArrowBack /> Previous
					</Button>
					<Button
						variant="light"
						onClick={() => handlePageMan("increase")}
						className="btn-sm ms-2"
					>
						Next <ArrowForward />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ClinicianAnalyticsDailyCaseChange;