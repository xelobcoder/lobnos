"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import styles from '../CommissionReport.module.css';
import { RiUserLine, RiPhoneLine, RiMoneyDollarCircleLine, RiServiceLine, RiFileList3Line } from "@remixicon/react";
import dayjs from "dayjs";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { customPost, currencyFormatter, customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import DateFilterReusable from "../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import CommissionLineChart from "../CommissionLineChart";
import CommissionDetailsModal from "./components/CommissionDetailsModal";

interface CommissionData {
	service_date: string;
	clinician_id: number;
	clinician_name: string;
	clinician_phone: string;
	occupation: string | null;
	organization: number | null;
	total_services: number;
	earned_revenue?: string;
	cash_collected?: string;
	total_payable?: string;
	total_paid?: string;
	serviceid: number;
	commission_earned: string;
}

interface ClinicianInfo {
	clinician_name?: string;
	name?: string;
	clinician_phone?: string;
	phone?: string;
	occupation?: string | null;
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
	const employeeid = useApplication()?.user?.employeeid;
	const branchid = useApplication()?.branchid;
	const [startDate, setStartDate] = useState(today);
	const [endDate, setEndDate] = useState(today);
	const [dateFilter, setDateFilter] = useState('This Year');
	const handleDateRangeChange = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};
	const handleResetFilters = () => {
		setDateFilter('This Year');
		// Reset will reload data and recalculate date range from services
		loadCommissionData();
	};
	const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
	const [clinicianInfoFromApi, setClinicianInfoFromApi] = useState<ClinicianInfo | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [chartView, setChartView] = useState<'bar' | 'line'>('bar');
	const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
	const [selectedRecordsForPayment, setSelectedRecordsForPayment] = useState<CommissionData[]>([]);
	const [commissionPayments, setCommissionPayments] = useState<any[]>([]);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [paymentModes, setPaymentModes] = useState<{ KeyID: number, PaymentMode: string }[]>([]);
	const [showBulkPayModal, setShowBulkPayModal] = useState(false);
	const [bulkPayAmount, setBulkPayAmount] = useState('');
	const [bulkPayLoading, setBulkPayLoading] = useState(false);
	const [bulkPayError, setBulkPayError] = useState<string | null>(null);
	const [bulkPayType, setBulkPayType] = useState<'paid' | 'payable'>('paid');
	const [bulkPayMethod, setBulkPayMethod] = useState<number | null>(null);

	// Initial data load
	useEffect(() => {
		loadCommissionData();
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

	const loadClinicianInfo = async () => {
		try {
			const response = await customFetch(`clinicians/getclinician?id=${encodeURIComponent(params.clinicianid)}`);
			const clinician = Array.isArray(response?.result) ? response.result[0] : null;
			if (clinician) {
				setClinicianInfoFromApi(clinician);
			}
		} catch (err) {
			console.error('Error loading clinician information:', err);
		}
	};

	const loadCommissionData = async () => {
		setLoading(true);
		setError(null);
		try {
			// First load with a very broad date range to get all services
			const broadStart = dayjs().subtract(10, 'year').format('YYYY-MM-DD');
			const broadEnd = dayjs().add(1, 'year').format('YYYY-MM-DD');

			const commissionRes = await getClinicianCommission({
				clinicianid: params.clinicianid,
				startDate: broadStart,
				endDate: broadEnd
			});

			if ((commissionRes as any).error) {
				setError((commissionRes as any).error);
				setCommissionData([]);
			} else {
				const data = commissionRes as CommissionData[];
				setCommissionData(data);

				if (data.length === 0) {
					await loadClinicianInfo();
				}

				// Calculate date range from service dates
				if (data.length > 0) {
					const serviceDates = data.map(record => dayjs(record.service_date));
					const minDate = serviceDates.reduce((min, date) => date.isBefore(min) ? date : min);
					const maxDate = serviceDates.reduce((max, date) => date.isAfter(max) ? date : max);

					if (minDate && maxDate) {
						setStartDate(minDate.format('YYYY-MM-DD'));
						setEndDate(maxDate.format('YYYY-MM-DD'));
					}
				} else {
					// No data, use current month as fallback
					const currentMonth = dayjs().startOf('month');
					setStartDate(currentMonth.format('YYYY-MM-DD'));
					setEndDate(dayjs().format('YYYY-MM-DD'));
				}
			}

			// Load payment modes if not already loaded
			if (paymentModes.length === 0) {
				const modes = await loadPaymentModes();
				setPaymentModes(modes || []);
			}
		} catch (err: any) {
			setError(err.message || 'An unknown error occurred');
			setCommissionData([]);
		} finally {
			setLoading(false);
		}
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
			const url = `commission-payments/service/${record.serviceid}/commission/payment/history`;
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

	// Calculate total commission due for selected records
	const totalBulkCommission = Array.from(selectedRecords).reduce((acc, idx) => {
		const rec = commissionData[idx];
		return acc + (rec ? Number(rec.commission_earned) : 0);
	}, 0);
	const selectedCommissionDue = totalBulkCommission;

	// Bulk pay handler
	const handleBulkPay = async () => {
		setBulkPayLoading(true);
		setBulkPayError(null);
		try {
			if (Number(bulkPayAmount) > selectedCommissionDue) {
				setBulkPayError('Amount cannot exceed total commission due.');
				setBulkPayLoading(false);
				return;
			}
			if (!bulkPayMethod) {
				setBulkPayError('Please select a payment method.');
				setBulkPayLoading(false);
				return;
			}

			const selectedServiceIds = Array.from(selectedRecords).map(idx => commissionData[idx].serviceid);
			const payload = {
				startDate,
				endDate,
				commissionDue: selectedCommissionDue,
				amountPaid: Number(bulkPayAmount),
				commissionType: bulkPayType,
				paymentMethod: bulkPayMethod,
				employeeid,
				recipient_type: 'clinician',
				branchid,
				recipientid: params.clinicianid,
				services: selectedServiceIds
			};

			const response = await customPost('commission-payments/commission/batch/process-services?employeeid=' + employeeid + '&branchid=' + branchid, 'POST', payload);
			if (response && response.status == true) {
				setShowBulkPayModal(false);
				setBulkPayAmount('');
				setBulkPayMethod(null);
				setSelectedRecords(new Set());
				loadCommissionData();
				toast.success('Commission payment processed successfully!');
			} else if (response && response.status === 'error') {
				toast.error(response.message || 'Failed to process payment.');
				setBulkPayError(response.message || 'Failed to process payment.');
			} else {
				toast.error('Failed to process payment.');
				setBulkPayError('Failed to process payment.');
			}
		} catch (err: any) {
			setBulkPayError(err.message || 'Unknown error');
		} finally {
			setBulkPayLoading(false);
		}
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

	const summary = commissionData.reduce((acc, item) => {
		const totalPayable = Number(item.earned_revenue ?? item.total_payable ?? 0);
		acc.total_commission += Number(item.commission_earned);
		acc.total_value += totalPayable;
		acc.total_services += item.total_services;
		return acc;
	}, { total_commission: 0, total_value: 0, total_services: 0 });

	// Default clinician info when no data is available
	const clinicianLookup = clinicianInfoFromApi as ClinicianInfo | null;
	const clinician_name = commissionData[0]?.clinician_name || clinicianLookup?.clinician_name || clinicianLookup?.name || `Clinician ${params.clinicianid}`;
	const clinician_phone = commissionData[0]?.clinician_phone || clinicianLookup?.clinician_phone || clinicianLookup?.phone || 'N/A';
	const occupation = commissionData[0]?.occupation || clinicianLookup?.occupation || 'N/A';
	return (
		<main className={styles.container}>
			<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
				<h1 className={styles.title} style={{ margin: 0 }}><RiUserLine /> {clinician_name.toUpperCase()} - Commission Details</h1>
				<div className="d-flex gap-2">
					<Link
						href={`/commissions/clinicians/commissions-information/${params.clinicianid}/commission-update`}
						className="btn btn-outline-primary btn-sm"
						target="_blank"
						rel="noopener noreferrer"
					>
						Update Commission Records
					</Link>
					<Link
						href={`/commissions/clinicians/commissions-information/${params.clinicianid}/paid-commissions`}
						className="btn btn-outline-success btn-sm"
						target="_blank"
						rel="noopener noreferrer"
					>
						View Paid Commissions
					</Link>
				</div>
			</div>
			{/* Summary Cards */}
			<div className="row g-3 mb-4">
				<div className="col-12 col-sm-6 col-md-3">
					<div className="border rounded p-3 h-100">
						<div className="d-flex align-items-center gap-2 mb-1">
							<RiPhoneLine size={18} className="text-secondary flex-shrink-0" />
							<span className="text-muted small">Phone</span>
						</div>
						<div className="fw-bold fs-6">{clinician_phone || '—'}</div>
					</div>
				</div>
				<div className="col-12 col-sm-6 col-md-3">
					<div className="border rounded p-3 h-100">
						<div className="d-flex align-items-center gap-2 mb-1">
							<RiMoneyDollarCircleLine size={18} className="text-success flex-shrink-0" />
							<span className="text-muted small">Total Commission Earned</span>
						</div>
						<div className="fw-bold fs-6">{currencyFormatter.format(summary.total_commission)}</div>
					</div>
				</div>
				<div className="col-12 col-sm-6 col-md-3">
					<div className="border rounded p-3 h-100">
						<div className="d-flex align-items-center gap-2 mb-1">
							<RiServiceLine size={18} className="text-primary flex-shrink-0" />
							<span className="text-muted small">Total Payable</span>
						</div>
						<div className="fw-bold fs-6">{currencyFormatter.format(summary.total_value)}</div>
					</div>
				</div>
				<div className="col-12 col-sm-6 col-md-3">
					<div className="border rounded p-3 h-100">
						<div className="d-flex align-items-center gap-2 mb-1">
							<RiFileList3Line size={18} className="text-secondary flex-shrink-0" />
							<span className="text-muted small">Services / Records</span>
						</div>
						<div className="fw-bold fs-6">{summary.total_services} <span className="text-muted fw-normal small">/ {commissionData.length} records</span></div>
					</div>
				</div>
			</div>

			{/* Show message when no data is found, but still display filters */}
			{!commissionData.length && (
				<div className="alert alert-info" style={{ borderRadius: '0.5rem', margin: '1rem 0' }}>
					<RiUserLine size={20} className="me-2" />
					No commission records found for this clinician in the selected date range. Try adjusting the date filters above.
				</div>
			)}

			{/* Chart Section */}
			<div className="border rounded mb-4" style={{ background: 'none' }}>
				<div className="p-3 p-md-4 pb-0">
					<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-3">
						<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
							Commission Trend
						</h2>
						<div className="btn-group btn-group-sm" role="group" aria-label="Chart view toggle">
							<button type="button" className={`btn ${chartView === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setChartView('bar')}>
								Bar
							</button>
							<button type="button" className={`btn ${chartView === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setChartView('line')}>
								Line
							</button>
						</div>
					</div>
					<div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 mb-3">
						<DateFilterReusable
							value={dateFilter}
							onChange={setDateFilter}
							onDateRangeChange={handleDateRangeChange}
							label="Filter by"
							className="col-12 col-lg-auto"
						/>
						<button onClick={loadCommissionData} className="btn btn-sm btn-primary" type="button" aria-label="Load commission data">
							Load Data
						</button>
						<button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary" type="button" aria-label="Reset date filters">
							Reset
						</button>
					</div>
				</div>
				<div className="p-3 p-md-4 pt-0" style={{ background: 'none' }}>
					<div className="CommissionLineChart-to-pdf">
						<CommissionLineChart data={commissionData} view={chartView} />
					</div>
				</div>
			</div>

			{/* Detailed Commission Records */}
			<div className="border rounded" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
				<div className="p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
					<h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
						<RiFileList3Line className="me-2" />
						Detailed Commission Records
					</h2>

					<div className="d-flex flex-row align-items-center gap-2">
						<button onClick={loadCommissionData} className="btn btn-sm btn-primary" type="button" aria-label="Load commission data">
							Load Data
						</button>
						<button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary" type="button" aria-label="Reset date filters">
							Reset
						</button>
					</div>
				</div>
				<details className="px-3 px-md-4 py-2" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
					<summary className="text-muted small" style={{ cursor: 'pointer' }}>What do these columns mean?</summary>
					<div className="row gx-2 small text-muted mt-2">
						<div className="col-md-6 mb-1"><strong>Total payable:</strong> <span className="ms-1">amount payable by the services referred by the clinician for that date.</span></div>
						<div className="col-md-6 mb-1"><strong>Total services:</strong> <span className="ms-1">total number of services referred by the clinician for that date.</span></div>
						<div className="col-md-6"><strong>Commission (Earned by Paid):</strong> <span className="ms-1">commission due based on the amount actually paid for the services referred.</span></div>
						<div className="col-md-6"><strong>Commission (Earned by Payable):</strong> <span className="ms-1">commission calculated based on the total payable amount for the services referred.</span></div>
					</div>
				</details>
				<div className="p-3 p-md-4" style={{ backgroundColor: 'var(--theme-card-bg)' }}>

					{/* Bulk Pay Button */}
					{selectedRecords.size > 0 && (
						<div className="mb-3">
							<Button variant="success" size="sm" onClick={() => setShowBulkPayModal(true)}>
								Pay Commission for Selected ({selectedRecords.size})
							</Button>
						</div>
					)}
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
									<th className="py-2 text-start">Services</th>
									<th className="py-2 text-start">Total Payable</th>
									<th className="py-2 text-start">Commission Earned</th>
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
										<td className="py-2 text-start">{record.total_services}</td>
										<td className="py-2 text-start">{currencyFormatter.format(Number(record.earned_revenue ?? record.total_payable ?? 0))}</td>
										<td className="py-2 text-start">{currencyFormatter.format(Number(record.commission_earned))}</td>
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

			{/* Bulk Pay Modal */}
			<Modal show={showBulkPayModal} backdrop="static" onHide={() => setShowBulkPayModal(false)}>
				<Modal.Header closeButton className="py-2">
					<Modal.Title className="fs-6 fw-semibold text-body-emphasis">
						Pay Commission for Selected Records
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="py-2">
					<div className="mb-2 small">
						<div className="mb-2">
							<strong>Period:</strong> {startDate} &mdash; {endDate}
						</div>
						<div className="mb-3">
							<strong>Selected Records:</strong> {selectedRecords.size} &nbsp;|&nbsp; <strong>Total Commission Earned:</strong> {currencyFormatter.format(selectedCommissionDue)}
						</div>
						<Form.Group className="mb-3">
							<Form.Label className="small">Payment Method</Form.Label>
							<Form.Select value={bulkPayMethod ?? ''} onChange={e => setBulkPayMethod(Number(e.target.value))} className="form-select form-select-sm">
								<option value="">Select payment method</option>
								{paymentModes.map(mode => (
									<option key={mode.KeyID} value={mode.KeyID}>{mode.PaymentMode}</option>
								))}
							</Form.Select>
						</Form.Group>
					</div>
					<Form.Group className="mb-3">
						<Form.Label className="small">Amount to Pay</Form.Label>
						<Form.Control
							type="number"
							min="0"
							max={selectedCommissionDue}
							value={bulkPayAmount}
							onChange={e => setBulkPayAmount(e.target.value)}
							placeholder="Enter amount to pay"
							className="form-control form-control-sm"
						/>
						<Form.Text className="text-muted small">Amount must be less than or equal to total commission due.</Form.Text>
					</Form.Group>
					{bulkPayError && <div className="text-danger small mb-2">{bulkPayError}</div>}
				</Modal.Body>
				<Modal.Footer className="py-2">
					<Button variant="outline-secondary" size="sm" onClick={() => setShowBulkPayModal(false)} disabled={bulkPayLoading} className="small">
						Cancel
					</Button>
					<Button variant="outline-primary" size="sm" onClick={handleBulkPay} disabled={bulkPayLoading || !bulkPayAmount} className="small">
						{bulkPayLoading ? 'Processing...' : 'Pay Commission'}
					</Button>
				</Modal.Footer>
			</Modal>
		</main>
	);
}
