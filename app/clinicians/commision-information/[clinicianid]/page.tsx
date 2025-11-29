"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import styles from '../CommissionReport.module.css';
import { customFetch, currencyFormatter } from '../../../../components/Auth/customFetch';
import dayjs from 'dayjs';

import { RiUserLine, RiPhoneLine, RiBriefcaseLine, RiMoneyDollarCircleLine, RiServiceLine, RiFileList3Line } from '@remixicon/react';
import CommissionDetailsModal from './components/CommissionDetailsModal';
import CommissionLineChart from '../CommissionLineChart';

interface CommissionData {
	service_date: string;
	clinician_id: number;
	clinician_name: string;
	clinician_phone: string;
	occupation: string;
	organization: number;
	total_services: number;
	total_payable: string;
	total_paid: string;
	serviceid: number;
	commission_percent: number;
	commission_earned_by_amount_payable: string;
	commission_earned_by_paid_amount: string;
}


async function getClinicianCommission({ clinicianid, startDate, endDate }: { clinicianid: string, startDate: string, endDate: string }) {
	try {
		const url = `clinician/anal/commissions/range/single?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&clinicianId=${encodeURIComponent(clinicianid)}`;
		const response = await customFetch(url);
		if (!response || !response.success) {
			throw new Error('API returned no data or failed.');
		}
		// New structure: response.data is a flat array of records
		const records = Array.isArray(response.data) ? response.data : [];
		return records as CommissionData[];
	} catch (error: any) {
		return { error: error.message || 'An unknown error occurred' };
	}
}


export default function ClinicianCommissionPage({ params }: { params: { clinicianid: string } }) {
	const today = dayjs().format('YYYY-MM-DD');
	const currentYear = dayjs().year();
	const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
	const [startDate, setStartDate] = useState(defaultStart);
	const [endDate, setEndDate] = useState(today);
	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setStartDate(e.target.value);
	};
	const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEndDate(e.target.value);
	};
	const handleResetFilters = () => {
		setStartDate(defaultStart);
		setEndDate(today);
	};
	const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [chartView, setChartView] = useState<'bar' | 'line'>('bar');
	const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
	const [selectedRecordsForPayment, setSelectedRecordsForPayment] = useState<CommissionData[]>([]);
	const [commissionPayments, setCommissionPayments] = useState<any[]>([]);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [paymentModes, setPaymentModes] = useState<{ KeyID: number, PaymentMode: string }[]>([]);

	useEffect(() => {
		setLoading(true);
		setError(null);
		Promise.all([
			getClinicianCommission({ clinicianid: params.clinicianid, startDate, endDate }),
			loadPaymentModes()
		]).then(([commissionRes, modes]) => {
			if ((commissionRes as any).error) {
				setError((commissionRes as any).error);
				setCommissionData([]);
			} else {
				setCommissionData(commissionRes as CommissionData[]);
			}
			setPaymentModes(modes || []);
		}).catch(e => {
			setError(e.message || 'An unknown error occurred');
			setCommissionData([]);
		}).finally(() => setLoading(false));
	}, [params.clinicianid]);

	const loadPaymentModes = async () => {
		try {
			const response = await customFetch('paymentmodes');
			if (!response || !response.status) {
				console.error('Failed to load payment modes');
				return [];
			}
			const modes = Array.isArray(response.data) ? response.data : [];
			return modes;
		} catch (error) {
			console.error('Error loading payment modes:', error);
			return [];
		}
	};

	const loadCommissionData = () => {
		setLoading(true);
		setError(null);
		Promise.all([
			getClinicianCommission({ clinicianid: params.clinicianid, startDate, endDate }),
			paymentModes.length === 0 ? loadPaymentModes() : Promise.resolve(paymentModes)
		]).then(([commissionRes, modes]) => {
			if ((commissionRes as any).error) {
				setError((commissionRes as any).error);
				setCommissionData([]);
			} else {
				setCommissionData(commissionRes as CommissionData[]);
			}
			if (paymentModes.length === 0 && Array.isArray(modes)) {
				setPaymentModes(modes);
			}
		}).catch(e => {
			setError(e.message || 'An unknown error occurred');
			setCommissionData([]);
		}).finally(() => setLoading(false));
	};

	const handleFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	const handleSelectRecord = (index: number) => {
		setSelectedRecords(prev => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	};

	const handleSelectAll = () => {
		if (selectedRecords.size === commissionData.length) {
			setSelectedRecords(new Set());
		} else {
			setSelectedRecords(new Set(commissionData.map((_, idx) => idx)));
		}
	};

	const handleViewDetails = async (record: CommissionData) => {
		setSelectedRecordsForPayment([record]);
		setCommissionPayments([]);
		setLoading(true);

		try {
			console.log(record);
			const url = `commission-payments/service/${record.serviceid}`
			const response = await customFetch(url);
			if (response && response.status) {
				setCommissionPayments(response.data || []);
			} else {
				setCommissionPayments([]);
			}
		} catch (error) {
			console.error('Error loading commission payments:', error);
			setCommissionPayments([]);
		} finally {
			setLoading(false);
		}

		setShowDetailsModal(true);
	};

	if (error) {
		return (
			<main className={styles.container}>
				<h1 className={styles.title}>Could Not Load Clinician Commission Data</h1>
				<div className={styles.errorBox}>
					<RiUserLine size={40} />
					<div>
						<p><strong>There was a problem connecting to the API.</strong></p>
						<p>{error}</p>
					</div>
				</div>
			</main>
		);
	}
	if (!commissionData.length) {
		return (
			<main className={styles.container}>
				<h1 className={styles.title}>No Commission Data Found</h1>
				<div className={styles.emptyState}>
					<RiUserLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
					<p>No commission records found for this clinician.</p>
				</div>
			</main>
		);
	}
	const summary = commissionData.reduce((acc, item) => {
		acc.total_commission_by_payable += Number(item.commission_earned_by_amount_payable);
		acc.total_commission_by_paid += Number(item.commission_earned_by_paid_amount);
		acc.total_value += Number(item.total_payable);
		acc.total_services += item.total_services;
		return acc;
	}, { total_commission_by_payable: 0, total_commission_by_paid: 0, total_value: 0, total_services: 0 });
	const { clinician_name, clinician_phone, occupation } = commissionData[0];
	return (
		<main className={styles.container}>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h1 className={styles.title}><RiUserLine /> {clinician_name.toUpperCase()} - Commission Details</h1>
				<Link
					href={`${params.clinicianid}/commission-update`}
					className="btn btn-outline-primary btn-sm"
					target="_blank"
					rel="noopener noreferrer"
				>
					Update Commission Records
				</Link>
			</div>
			<hr />
			{/* Date Picker and Summary Cards */}
			<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-3 gap-3">
				<div className="row g-3">
					<div className="col-12 col-sm-6 col-md-4 col-lg-3">
						<div className={styles.statItem}>
							<div className={styles.statIcon}><RiPhoneLine /></div>
							<div className={styles.statInfo}>
								<span className={styles.statValue}>{clinician_phone}</span>
								<span className={styles.statLabel}>Phone</span>
							</div>
						</div>
					</div>
					<div className="col-12 col-sm-6 col-md-4 col-lg-3">
						<div className={styles.statItem}>
							<div className={styles.statIcon}><RiBriefcaseLine /></div>
							<div className={styles.statInfo}>
								<span className={styles.statValue}>{occupation}</span>
								<span className={styles.statLabel}>Occupation</span>
							</div>
						</div>
					</div>
					<div className="col-12 col-sm-6 col-md-4 col-lg-3">
						<div className={styles.statItem}>
							<div className={styles.statIcon}><RiMoneyDollarCircleLine /></div>
							<div className={styles.statInfo}>
								<span className={styles.statValue}>{currencyFormatter.format(summary.total_commission_by_payable)}</span>
								<span className={styles.statLabel}>Commission (Payable)</span>
							</div>
						</div>
					</div>
					<div className="col-12 col-sm-6 col-md-4 col-lg-3">
						<div className={styles.statItem}>
							<div className={styles.statIcon}><RiMoneyDollarCircleLine /></div>
							<div className={styles.statInfo}>
								<span className={styles.statValue}>{currencyFormatter.format(summary.total_commission_by_paid)}</span>
								<span className={styles.statLabel}>Commission (Paid)</span>
							</div>
						</div>
					</div>
					<div className="col-12 col-sm-6 col-md-4 col-lg-3">
						<div className={styles.statItem}>
							<div className={styles.statIcon}><RiServiceLine /></div>
							<div className={styles.statInfo}>
								<span className={styles.statValue}>{summary.total_services}</span>
								<span className={styles.statLabel}>Total Services</span>
							</div>
						</div>
					</div>
					<div className="col-12 col-sm-6 col-md-4 col-lg-3">
						<div className={styles.statItem}>
							<div className={styles.statIcon}><RiFileList3Line /></div>
							<div className={styles.statInfo}>
								<span className={styles.statValue}>{commissionData.length}</span>
								<span className={styles.statLabel}>Records</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Chart Section - Modern Analytics Style (Card) */}
			<div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)', margin: '2rem 0 1.5rem 0', background: 'none' }}>
				<div className="card-header py-3 px-4" style={{ borderColor: 'var(--bs-border-color)', background: 'none' }}>
					<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
						<h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center" style={{ color: 'inherit' }}>
							Commission Trend
						</h2>
						<div className="d-flex flex-row align-items-center gap-2">
							<div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
								<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)', paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
									Start
								</span>
								<input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: 'var(--bs-border-color)', paddingLeft: '0.3rem' }} />
							</div>
							<div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
								<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)', paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
									End
								</span>
								<input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: 'var(--bs-border-color)', paddingLeft: '0.3rem' }} />
							</div>
							<button onClick={loadCommissionData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load commission data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
								Load Data
							</button>
							<button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
								Reset
							</button>
						</div>
						<div className="btn-group btn-group-sm" role="group" aria-label="Chart view toggle">
							<button type="button" className={`btn ${chartView === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} style={chartView === 'bar' ? {} : { fontWeight: 500 }} onClick={() => setChartView('bar')}>
								Bar
							</button>
							<button type="button" className={`btn ${chartView === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`} style={chartView === 'line' ? {} : { fontWeight: 500 }} onClick={() => setChartView('line')}>
								Line
							</button>
						</div>
					</div>
				</div>
				<div className="card-body p-3 p-md-4" style={{ background: 'none' }}>
					<div className="CommissionLineChart-to-pdf">
						<CommissionLineChart data={commissionData} view={chartView} />
					</div>
				</div>
			</div>
			<div className={styles.sectionDivider}></div>

			{/* Detailed Commission Records */}
			<div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)', margin: '2rem 0 1.5rem 0', backgroundColor: 'white' }}>
				<div className="card-header py-3 px-4 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--bs-border-color)', backgroundColor: 'white' }}>
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center" style={{ color: 'inherit' }}>
						<RiFileList3Line className="me-2" />
						Detailed Commission Records
					</h2>
				</div>
				<div className="card-body p-3 p-md-4" style={{ backgroundColor: 'white' }}>
					<div className="table-responsive">
						<table className="table table-sm table-hover table-striped small">
							<thead className="sticky-top bg-body-tertiary">
								<tr>
									<th className="py-2 text-center">
										<input
											type="checkbox"
											checked={selectedRecords.size === commissionData.length && commissionData.length > 0}
											onChange={handleSelectAll}
											className="form-check-input"
										/>
									</th>
									<th className="py-2">Service Date</th>
									<th className="py-2 text-end">Services</th>
									<th className="py-2 text-end">Total Payable</th>
									<th className="py-2 text-end">Commission %</th>
									<th className="py-2 text-end">Commission(Payable)</th>
									<th className="py-2 text-end">Commission(Paid)</th>
									<th className="py-2 text-center">Payment</th>
								</tr>
							</thead>
							<tbody>
								{commissionData.map((record, idx) => (
									<tr key={idx} className={selectedRecords.has(idx) ? 'table-active' : ''}>
										<td className="py-2 text-center">
											<input
												type="checkbox"
												checked={selectedRecords.has(idx)}
												onChange={() => handleSelectRecord(idx)}
												className="form-check-input"
											/>
										</td>
										<td className="py-2">{dayjs(record.service_date).format('DD/MM/YYYY')}</td>
										<td className="py-2 text-end">{record.total_services}</td>
										<td className="py-2 text-end">{currencyFormatter.format(Number(record.total_payable))}</td>
										<td className="py-2 text-end">{record.commission_percent}%</td>
										<td className="py-2 text-end">{currencyFormatter.format(Number(record.commission_earned_by_amount_payable))}</td>
										<td className="py-2 text-end">{currencyFormatter.format(Number(record.commission_earned_by_paid_amount))}</td>
										<td className="py-2 text-center">
											<button
												type="button"
												className="btn btn-outline-primary btn-sm"
												onClick={() => handleViewDetails(record)}

											>
												View Details
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Commission Details Modal */}
			<CommissionDetailsModal
				show={showDetailsModal}
				onHide={() => setShowDetailsModal(false)}
				commissionPayments={commissionPayments}
				selectedRecord={selectedRecordsForPayment[0]}
				loading={loading}
				clinicianId={params.clinicianid}
				paymentModes={paymentModes}
				onPaymentSuccess={() => {
					loadCommissionData();
				}}
			/>
		</main>
	);
}
