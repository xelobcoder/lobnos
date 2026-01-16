'use client'
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Spinner, Modal } from 'react-bootstrap';
import RefundServiceShowDetailModal from '../../../../../components/Billing/BillingContextComponents/BillingSourceComponents/RefundServiceShowDetailModal';
import { currencyFormatter, customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { DollarSignIcon, CreditCardIcon, CheckCircleIcon, RotateCcwIcon, AlertCircleIcon, RefreshCwIcon, EditIcon, SettingsIcon } from '../../../../../components/Billing/BillingContextComponents/Lib/Icons';
import { RiCalculatorLine, RiMoneyDollarCircleLine, RiArrowGoBackLine, RiScalesLine, RiRefreshFill, RiFileList3Line, RiWalletLine, RiAlarmWarningLine, RiRefund2Line, RiCheckboxCircleLine } from '@remixicon/react';
import WriteOffModal from '../../../../../components/Billing/BillingContextComponents/BillingSourceComponents/WriteOffModal';
import { useParams } from 'next/navigation';
import styles from '../../../../../styles/SmsTemplateList.module.css'
import { Service, Witness } from '../../../../../types/serviceTypes';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';


const cardColors = {
	transactionCost: { bg: "#4f46e5", icon: "#6366f1" }, // Indigo
	totalCost: { bg: "#0891b2", icon: "#06b6d4" }, // Cyan
	payable: { bg: "#2563eb", icon: "#3b82f6" }, // Blue
	paid: { bg: "#059669", icon: "#10b981" }, // Emerald
	refunded: { bg: "#7c3aed", icon: "#8b5cf6" }, // Violet
	outstanding: { bg: "#ea580c", icon: "#f97316" }, // Orange
	writeoff: { bg: "#dc2626", icon: "#ef4444" }, // Red
	balance: { bg: "#16a34a", icon: "#22c55e" }, // Green
};


interface AnalyticCardProps {
	title: string;
	value: number;
	Icon: React.ElementType;
	bgColor: string;
	iconColor: string;
}

const AnalyticCard = ({ title, value, Icon, bgColor, iconColor }: AnalyticCardProps) => (
	<div
		className="border-0 rounded shadow-sm p-3 h-100"
		style={{
			backgroundColor: bgColor,
			transition: 'all 0.2s',
			cursor: 'pointer',
			minHeight: '110px',
			color: 'white'
		}}
		onMouseEnter={(e) => {
			e.currentTarget.style.transform = "translateY(-2px)";
			e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
		}}
		onMouseLeave={(e) => {
			e.currentTarget.style.transform = "translateY(0)";
			e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
		}}
	>
		<div className="d-flex align-items-center mb-2">
			<div style={{ color: 'white' }} className="me-2">
				<Icon size={28} />
			</div>
			<h6 className="mb-0 fw-semibold" style={{ fontSize: "0.85rem", color: 'rgba(255,255,255,0.95)' }}>
				{title}
			</h6>
		</div>
		<div className="fw-bold" style={{ fontSize: "1.4rem", color: 'white' }}>
			{currencyFormatter.format(Number(value) || 0)}
		</div>
	</div>
);

export default function PreviousTransactionSummaryPage() {
	const user = useApplication().user;
	const role = user?.role;
	const employeeid = user?.employeeid;
	const [cashIssuedOut, setCashIssuedOut] = useState(false);
	const [refundableAmount, setRefundableAmount] = useState(0);
	const [showCashOutModal, setShowCashOutModal] = useState(false);
	const [refundAmount, setRefundAmount] = useState(0);
	const [selectedPaymentMode, setSelectedPaymentMode] = useState<string | null>(null);
	const [item, setItem] = useState<Service | null>(null);
	const [isRequesting, setIsRequesting] = useState(false);
	interface BillingData {
		billingid?: number;
		amountIncurredDueTax?: number | string;
		payable?: number | string;
		paid?: number | string;
		totalrefunded?: number | string;
		outstanding?: number | string;
		[key: string]: any;
	}
	const [billingdata, setBillingData] = useState<BillingData>({});
	const [refundMessage, setRefundMessage] = useState('');
	const params = useParams();
	const billingidParam = params?.billingid;
	const [submitting, setSubmitting] = useState(false);
	const [PaymentMode, setPaymentMode] = useState('');
	const [loading, setLoading] = useState(true);
	const [previousServices, setPreviousServices] = useState<Service[]>([]);
	const [showTaxModal, setShowTaxModal] = useState(false);
	const [modalTaxes, setModalTaxes] = useState<any[]>([]);
	const [modalService, setModalService] = useState<Service | null>(null);
	const [showWitnessModal, setShowWitnessModal] = useState(false);
	const [witnesses, setWitnesses] = useState<Witness[]>([]);
	const [requesting, setRequesting] = useState(false);
	const [showWriteOffModal, setShowWriteOffModal] = useState(false);
	const [writeOffReason, setWriteOffReason] = useState('');
	const [isWritingOff, setIsWritingOff] = useState(false);
	const [showRefundAllModal, setShowRefundAllModal] = useState(false);

	const refundReasons = [
		'Patient Request',
		'Duplicate Charge',
		'Insurance Denial',
		'Service Not Rendered',
		'Incorrect Amount Charged',
		'Service Quality Issue',
		'Patient Dissatisfaction',
		'Billing Error',
		'Insurance Adjustment',
		'Patient Financial Hardship',
		'Service Cancellation',
		'Wrong Service Billed',
		'Test Not Performed',
		'Patient Transferred',
		'Adjustment Period',
		'Credit Memo',
		'Courtesy Adjustment',
		'Overpayment',
		'System Error',
		'Other'
	];





	const RequestFunding = async (item) => {
		try {
			setRequesting(true);
			const { billingid, categoryTrackId, taxIncluded, serviceid, trackId } = item;
			const data = { billingid, categoryTrackId, employeeid, taxIncluded, serviceid, refundMessage, trackId };

			const pushResponse = await customPost(`billing/previous/request/refund/update`, 'POST', data);
			const { status } = pushResponse;
			status === true ? toast.success("Request for refund submitted successfully") : toast.error("request for refund failed ");
			setRequesting(false);
		} catch (error) {
			console.log(error);
		}
	};




	const handleCashOutRefund = (item: Service) => {
		if (item.isRefundApproved === 1 && item.isRefundInitiated === 1 && item.isRefundCompleted !== 1) {
			setRefundAmount(item.totalcost ? Number(item.totalcost) : 0);
			setItem(item);
			setShowCashOutModal(true);
		}
	};

	const fetchRecords = async (billingid: number) => {
		try {
			const [summaryRes, servicesRes] = await Promise.all([
				customFetch(`billing/previous/transaction/data?billingid=${billingid}`),
				customFetch(`billing/information/single?billingid=${billingid}`)
			]);
			if (summaryRes && Array.isArray(summaryRes.result) && summaryRes.result.length > 0) {
				setBillingData(summaryRes.result[0]);
			} else {
				setBillingData({});
			}
			if (servicesRes && Array.isArray(servicesRes.result)) {
				setPreviousServices(servicesRes.result as Service[]);
			} else if (servicesRes) {
				setPreviousServices([servicesRes] as Service[]);
			} else {
				setPreviousServices([]);
			}
		} catch (err) {
			setBillingData({});
			setPreviousServices([]);
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			let billingidNum = Number(billingidParam);
			if (isNaN(billingidNum)) {
				setLoading(false);
				toast.error('Invalid billing ID');
				return;
			}
			await fetchRecords(billingidNum);
			setLoading(false);
		};
		fetchData();
	}, [billingidParam]);

	const [refundAllReason, setRefundAllReason] = useState('');
	const [refundAllAcknowledge, setRefundAllAcknowledge] = useState('');
	const [refundAllError, setRefundAllError] = useState('');
	const handleRefundAll = () => {
		if (billingdata.islocked === 1 || billingdata.writeOff === 1) {
			toast.error('Refund All is not allowed for locked or written-off transactions.');
			return;
		}
		setRefundAllReason('');
		setRefundAllAcknowledge('');
		setRefundAllError('');
		setShowRefundAllModal(true);
	};

	// This function actually performs the refund all API call
	const handleRefundAllSubmit = async () => {
		setRefundAllError('');
		if (!refundAllReason.trim()) {
			setRefundAllError('Please provide a reason for refunding all.');
			return;
		}
		if (refundAllAcknowledge.trim().toLowerCase() !== 'i acknowledge') {
			setRefundAllError('You must type "I acknowledge" to proceed.');
			return;
		}
		if (!PaymentMode || isNaN(Number(PaymentMode))) {
			setRefundAllError('Please select a valid payment mode.');
			return;
		}
		if (!employeeid || !billingdata.billingid) {
			setRefundAllError('Missing employee or billing information.');
			return;
		}
		try {
			setSubmitting(true);
			const endpoint = `billing/previous/refund/all/${billingdata.billingid}/${employeeid}/${PaymentMode}?reason=${encodeURIComponent(refundAllReason)}`;
			const response = await customFetch(endpoint);
			const { status, message } = response;
			setSubmitting(false);
			setShowRefundAllModal(false);
			if (status == true) {
				toast.success(message || 'Refund all processed successfully');
				await fetchRecords(billingdata.billingid);
			} else {
				toast.error(message || 'Refunding all failed');
			}
		} catch (err) {
			setSubmitting(false);
			setShowRefundAllModal(false);
			toast.error("Something wrong occurred");
		}
	};



	const [showRefundModal, setShowRefundModal] = useState(false);
	const [refundTarget, setRefundTarget] = useState<Service | null>(null);
	const [refundReason, setRefundReason] = useState('');
	const [refundReasonType, setRefundReasonType] = useState('');
	const [refundRequestAmount, setRefundRequestAmount] = useState('');

	const handleRefundService = (service: Service) => {
		if (billingdata.islocked === 1 || billingdata.writeOff === 1) {
			toast.error('Refund is not allowed for locked or written-off transactions.');
			return;
		}
		if (service.paymentstatus === 'pending') {
			toast.error('Refund is not allowed for services with pending payment status.');
			return;
		}
		setRefundTarget(service);
		setRefundReason('');
		setRefundReasonType('');
		setRefundRequestAmount(service.totalcost ? Number(service.totalcost).toString() : '0');
		setShowRefundModal(true);
	};



	const handleCashOutConfirmation = async () => {
		try {
			if (!selectedPaymentMode) {
				toast.error('Please select a refund mode.');
				return;
			}

			if (refundAmount > Number(refundableAmount) || refundAmount <= 0) {
				toast.error('Please enter a valid refund amount.');
				return;
			}

			if (!item) {
				toast.error('No item selected for cash out.');
				return;
			}
			const { serviceid, name, cost, discount, trackId, billingid } = item;

			const RequestData = {
				serviceid,
				name,
				billingid,
				cost,
				discount,
				trackId,
				selectedPaymentMode,
				refundAmount,
				employeeid
			};

			setCashIssuedOut(true);
			const response = await customPost(
				`billing/previous/refund/update/cashout`,
				'POST',
				RequestData
			);
			if (response?.status) {
				toast.success(response.message || 'Refund cashed out successfully');
			} else {
				toast.error(response.message || 'Failed to cash out refund');
			}

			setCashIssuedOut(false);
			setShowCashOutModal(false);
		} catch (err) {
			console.log(err)
			toast.error('An error occurred while processing the cash-out');
			setCashIssuedOut(false);
			setShowCashOutModal(false);
		}
	};


	const handleRefundRequest = async () => {
		if (!refundTarget) return;
		if (!refundReasonType) {
			toast.error('Please select a refund reason');
			return;
		}
		if (refundReasonType === 'Other' && !refundReason.trim()) {
			toast.error('Please provide a custom reason for the refund');
			return;
		}
		const amount = parseFloat(refundRequestAmount);
		if (!amount || amount <= 0) {
			toast.error('Please enter a valid refund amount');
			return;
		}
		if (amount > Number(refundTarget.totalcost)) {
			toast.error('Refund amount cannot exceed the service cost');
			return;
		}
		setIsRequesting(true);
		const { billingid, categoryTrackId, taxIncluded, serviceid, trackId } = refundTarget;
		const finalReason = refundReasonType === 'Other' ? refundReason : refundReasonType;
		const data = {
			billingid,
			categoryTrackId,
			employeeid,
			taxIncluded,
			serviceid,
			refundMessage: finalReason,
			refundAmount: amount,
			trackId
		};
		const pushResponse = await customPost(`billing/previous/request/refund/update`, 'POST', data);
		const { status } = pushResponse;
		if (status === true) {
			toast.success("Request for refund submitted successfully");
			setShowRefundModal(false);
			setRefundReason('');
			setRefundReasonType('');
			setRefundRequestAmount('');
		} else {
			toast.error("request for refund failed ");
		}
		setIsRequesting(false);
	};

	const getServiceTaxes = (svc: any) => {
		let taxes = [];
		try {
			taxes = svc.taxList ? JSON.parse(svc.taxList) : [];
		} catch {
			taxes = [];
		}
		return taxes;
	};

	const renderRefundModal = () => (
		<Modal show={showRefundModal} onHide={() => setShowRefundModal(false)} backdrop="static">
			<Modal.Header closeButton>
				<Modal.Title>Request Refund</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-3">
					<label htmlFor="refundAmount" className="form-label">Refund Amount <span className="text-danger">*</span></label>
					<div className="input-group">
						<span className="input-group-text">₵</span>
						<input
							id="refundAmount"
							type="number"
							className="form-control"
							value={refundRequestAmount}
							onChange={e => setRefundRequestAmount(e.target.value)}
							min="0"
							step="0.01"
							placeholder="Enter refund amount"
						/>
					</div>
					{refundTarget && (
						<small className="text-muted">
							Service cost: ₵{currencyFormatter.format(Number(refundTarget.totalcost) || 0)}
						</small>
					)}
				</div>
				<div className="mb-3">
					<label htmlFor="refundReasonType" className="form-label">Reason for Refund <span className="text-danger">*</span></label>
					<select
						id="refundReasonType"
						className="form-select form-select-sm"
						value={refundReasonType}
						onChange={(e) => {
							setRefundReasonType(e.target.value);
							setRefundReason(e.target.value === 'Other' ? '' : e.target.value);
						}}
					>
						<option value="">-- Select a Reason --</option>
						{refundReasons.map((reason) => (
							<option key={reason} value={reason}>
								{reason}
							</option>
						))}
					</select>
				</div>
				{refundReasonType === 'Other' && (
					<div className="mb-3">
						<label htmlFor="refundReason" className="form-label">Please Specify <span className="text-danger">*</span></label>
						<textarea
							id="refundReason"
							className="form-control"
							value={refundReason}
							onChange={e => setRefundReason(e.target.value)}
							rows={3}
							placeholder="Enter custom reason for refund..."
						/>
					</div>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={() => setShowRefundModal(false)} disabled={isRequesting}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleRefundRequest} disabled={isRequesting}>
					{isRequesting ? <Spinner size="sm" /> : null} Submit Request
				</Button>
			</Modal.Footer>
		</Modal>
	);
	const renderWitnessModal = () => (
		<Modal show={showWitnessModal} onHide={() => setShowWitnessModal(false)} backdrop="static">
			<Modal.Header closeButton>
				<Modal.Title>Witnesses</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{witnesses.length > 0 ? (
					<ul className="list-group">
						{witnesses.map((w, idx) => (
							<li className="list-group-item bg-secondary-subtle text-sm" key={idx}>
								{typeof w === 'string' ? w : (
									<>
										<div><strong>Witness Level:</strong> {w.witnessType || '-'}</div>
										<div><strong>Employee:</strong> {w.username || w.name || '-'}</div>
									</>
								)}
							</li>
						))}
					</ul>
				) : (
					<div>No witnesses found for this service.</div>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={() => setShowWitnessModal(false)}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);

	const handleWriteOff = () => {
		setWriteOffReason('');
		setShowWriteOffModal(true);
	};



	const handleOtherAction = () => {
		alert('Other Action clicked');
	};

	const renderTaxModal = () => {
		let amountIncurredDueTax = '';
		if (modalService && modalService.amountIncurredDueTax !== undefined) {
			amountIncurredDueTax = modalService.amountIncurredDueTax;
		}
		const isOutsourced = modalService && typeof modalService.isoutsourced !== 'undefined' ? (modalService.isoutsourced ? 'Yes' : 'No') : '';
		const serviceCategory = modalService && modalService.serviceCategory ? modalService.serviceCategory : '';
		const registrationType = modalService && modalService.registrationType ? modalService.registrationType : '';
		const clinicianName = modalService && modalService.clinicianName ? modalService.clinicianName : '';
		const organizationName = modalService && modalService.organizationName ? modalService.organizationName : '';
		// Night adjustment details
		const hasNightAdjustment = modalService && modalService.hasNightAdjustment === 1;
		const nightAdjustmentValue = modalService && modalService.nightAdjustmentValue ? modalService.nightAdjustmentValue : '';
		const nightAdjustmentMode = modalService && modalService.nightAdjustmentMode ? modalService.nightAdjustmentMode : '';
		// Insurance
		const isNHIS = modalService && modalService.isNHIS === 1 ? 'Yes' : 'No';
		const isPHIS = modalService && modalService.isPHIS === 1 ? 'Yes' : 'No';
		const nhismembershipid = modalService && modalService.nhismembershipid ? modalService.nhismembershipid : '';
		const claimscheckcode = modalService && modalService.claimscheckcode ? modalService.claimscheckcode : '';
		return (
			<Modal backdrop='static' show={showTaxModal} onHide={() => { setShowTaxModal(false); setModalService(null); }}>
				<Modal.Header closeButton className='bg-secondary-subtle text-sm'>
					<Modal.Title>Service Taxes & Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{amountIncurredDueTax && (
						<div className="alert alert-info mb-3 text-sm" role="alert">
							<strong>Amount Incurred Due To Taxes:</strong> {currencyFormatter.format(Number(amountIncurredDueTax) || 0)}
						</div>
					)}
					{clinicianName && (
						<div className="mb-2 bg-body-tertiary border border-bottom br-5 p-2 text-sm"><strong>Clinician:</strong> {clinicianName}</div>
					)}
					{organizationName && (
						<div className="mb-2 bg-body-tertiary border border-bottom br-5 p-2 text-sm"><strong>Organization:</strong> {organizationName}</div>
					)}
					{isOutsourced && (
						<div className="mb-2 bg-body-tertiary border border-bottom br-5 p-2 text-sm"><strong>Is Outsourced:</strong> {isOutsourced}</div>
					)}
					{serviceCategory && (
						<div className="mb-2 bg-body-tertiary border border-bottom br-5 p-2 text-sm"><strong>Service Category:</strong> {serviceCategory}</div>
					)}
					{registrationType && (
						<div className="mb-2 bg-body-tertiary border border-bottom br-5 p-2 text-sm"><strong>Registration Type:</strong> {registrationType}</div>
					)}
					{/* Night Adjustment Details */}
					{hasNightAdjustment && (
						<div className="mb-2 bg-body-tertiary border border-bottom br-5 p-2 text-sm">
							<strong>Night Adjustment:</strong> Yes<br />
							<strong>Night Adjustment Value:</strong> {nightAdjustmentValue}<br />
							<strong>Night Adjustment Mode:</strong> {nightAdjustmentMode}
						</div>
					)}
					{/* Insurance Details */}
					{modalService && (
						<div className="mb-2 bg-body-tertiary border border-bottom br-5 p-2 text-sm">
							<strong>NHIS:</strong> {isNHIS}<br />
							<strong>PHIS:</strong> {isPHIS}
							{nhismembershipid && (<><br /><strong>NHIS Membership ID:</strong> {nhismembershipid}</>)}
							{claimscheckcode && (<><br /><strong>Claims Check Code:</strong> {claimscheckcode}</>)}
						</div>
					)}
					{modalTaxes.length > 0 ? (
						<div>
							<table className={styles.table}>
								<thead>
									<tr>
										<th>Name</th>
										<th>Value</th>
										<th>Applied</th>
										<th>Created On</th>
									</tr>
								</thead>
								<tbody>
									{Array.isArray(modalTaxes) && modalTaxes.length > 0 && modalTaxes.map((tax, i) => (
										<tr key={i}>
											<td>{tax.name}</td>
											<td>{tax.value}</td>
											<td>{tax.apply ? tax.apply.toString() : ''}</td>
											<td>{tax.createdOn ? new Date(tax.createdOn).toLocaleString() : ''}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className='alert alert-info text-sm'>No taxes found for this service.</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => { setShowTaxModal(false); setModalService(null); }}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		);
	};

	const [paymentModes, setPaymentModes] = useState<any[]>([]);
	useEffect(() => {
		customFetch('paymentmodes').then((res) => {
			if (res && Array.isArray(res.data)) setPaymentModes(res.data);
			else if (Array.isArray(res)) setPaymentModes(res);
		});
	}, []);

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
				<Spinner animation="border" />
			</div>
		);
	} else {
		const cashoutItem = item && item !== null ? {
			cost: Number(item.cost) || 0,
			amountIncurredDueTax: Number(item.amountIncurredDueTax) || 0,
			discount: Number(item.discount) || 0,
			serviceid: item.serviceid,
			billingid: item.billingid,
			totalcost: Number(item.totalcost) || 0
		} : {
			cost: 0,
			amountIncurredDueTax: 0,
			discount: 0,
			serviceid: 0,
			totalcost: 0,
			billingid: 0
		};


		return (
			<div>
				<div className="bg-body-tertiary br-5 p-3">
					{renderRefundModal()}
					<WriteOffModal
						show={showWriteOffModal}
						onClose={() => setShowWriteOffModal(false)}
						billingid={billingdata.billingid !== undefined ? String(billingdata.billingid) : ''}
						employeeid={employeeid !== undefined ? String(employeeid) : ''}
					/>
					<RefundServiceShowDetailModal
						show={showCashOutModal}
						onClose={() => setShowCashOutModal(false)}
						onConfirm={() => handleCashOutConfirmation()}
						refundAmount={refundAmount}
						setRefundAmount={setRefundAmount}
						setRefundableAmount={(v: number) => { setRefundableAmount(v); return {}; }}
						paymentModes={paymentModes}
						selectedPaymentMode={selectedPaymentMode}
						setSelectedPaymentMode={setSelectedPaymentMode}
						item={cashoutItem}
						cashIssuedOut={cashIssuedOut}
					/>
					{renderTaxModal()}
					{renderWitnessModal()}
					<div className="mb-4">
						<div className="d-flex justify-content-between align-items-center mb-3">
							<h5 className="mb-0 fw-semibold text-body-emphasis">Billing Summary</h5>
							<button className='d-flex align-items-center btn btn-secondary btn-sm' onClick={() => fetchRecords(Number(params?.billingid))}>
								<RiRefreshFill /> Refresh
							</button>
						</div>
						<div className="row g-3">
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Trans. Cost"
									value={Number(billingdata.totalTransactionCost) || 0}
									Icon={RiCalculatorLine}
									bgColor={cardColors.transactionCost.bg}
									iconColor={cardColors.transactionCost.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Total Cost"
									value={Number(billingdata.totalcost) || 0}
									Icon={RiFileList3Line}
									bgColor={cardColors.totalCost.bg}
									iconColor={cardColors.totalCost.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Payable"
									value={Number(billingdata.payable) || 0}
									Icon={CreditCardIcon}
									bgColor={cardColors.payable.bg}
									iconColor={cardColors.payable.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Paid"
									value={Number(billingdata.paid) || 0}
									Icon={CheckCircleIcon}
									bgColor={cardColors.paid.bg}
									iconColor={cardColors.paid.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Refunded"
									value={Number(billingdata.totalrefunded) || 0}
									Icon={RiRefund2Line}
									bgColor={cardColors.refunded.bg}
									iconColor={cardColors.refunded.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Outstanding"
									value={Number(billingdata.outstanding) || 0}
									Icon={RiAlarmWarningLine}
									bgColor={cardColors.outstanding.bg}
									iconColor={cardColors.outstanding.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Written Off"
									value={Number(billingdata.writeoff) || 0}
									Icon={EditIcon}
									bgColor={cardColors.writeoff.bg}
									iconColor={cardColors.writeoff.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Balance"
									value={(Number(billingdata.payable) || 0) - (Number(billingdata.paid) || 0)}
									Icon={RiScalesLine}
									bgColor={cardColors.balance.bg}
									iconColor={cardColors.balance.icon}
								/>
							</div>
						</div>
					</div>
					<div className="card border-0 mt-5">
						<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
							<h5 className="mb-0 fw-semibold text-body-emphasis">Services Details</h5>
						</div>
						<div className="card-body p-0">
							<div style={{ overflowX: 'auto' }}>
								<table className="table table-striped table-hover text-nowrap mb-0">
									<thead className="table-light">
										<tr>
											<th className="fw-semibold text-start">Service Name</th>
											<th className="fw-semibold text-start">Organization</th>
											<th className="fw-semibold text-start">Clinician</th>
											<th className="fw-semibold text-start">Service Added On</th>
											<th className="fw-semibold text-start">Cost</th>
											<th className="fw-semibold text-start">Total Cost</th>
											<th className="fw-semibold text-start">Total Payable</th>
											<th className="fw-semibold text-start">Paid Amount</th>
											<th className="fw-semibold text-start">Outstanding</th>
											<th className="fw-semibold text-start">Tax</th>
											<th className="fw-semibold text-start">Discount</th>
											<th className="fw-semibold text-start">Status</th>
											<th className="fw-semibold text-start">Amount Refunded</th>
											<th className="fw-semibold text-start">Tax/Details</th>
											<th className="fw-semibold text-start">Actions/Witnesses</th>
										</tr>
									</thead>
									<tbody>
										{Array.isArray(previousServices) && previousServices.map((row, idx) => {
											const outstanding = Number(row.outstanding) || 0;
											const isOutstanding = outstanding > 0;
											const taxes = getServiceTaxes(row);
											return (
												<tr
													key={idx}
													style={isOutstanding ? { backgroundColor: '#ffe6e6' } : {}}
												>
													<td className="text-start">{row.name}</td>
													<td className="text-start">{row.organizationName || '-'}</td>
													<td className="text-start">{row.clinicianName || '-'}</td>
													<td className="text-start">{row.serviceAddedOn ? new Date(row.serviceAddedOn).toLocaleString() : ''}</td>
													<td className="text-start">{currencyFormatter.format(Number(row.cost) || 0)}</td>
													<td className="text-start">{currencyFormatter.format(Number(row.totalcost) || 0)}</td>
													<td className="text-start">{currencyFormatter.format(Number(row.totalpayable) || 0)}</td>
													<td className="text-start">{currencyFormatter.format(Number(row.paidamount) || 0)}</td>
													<td className="text-start">{currencyFormatter.format(Number(row.outstanding) || 0)}</td>
													<td className="text-start">{currencyFormatter.format(Number(row.amountIncurredDueTax) || 0)}</td>
													<td className="text-start">{currencyFormatter.format(Number(row.discount) || 0)}</td>
													<td className="text-start">{row.status}</td>
													<td className="text-start">{currencyFormatter.format(Number(row.amountRefunded) || 0)}</td>
													<td className="text-start">
														<Button size="sm" variant="info" onClick={() => {
															setModalTaxes(taxes);
															setModalService(row);
															setShowTaxModal(true);
														}}>
															View Details
														</Button>
													</td>
													<td className="text-start">
														<div className="d-flex gap-2 align-items-center flex-wrap">
															{!row.isRefundInitiated && row.paymentstatus !== 'pending' && (
																<Button
																	size="sm"
																	variant="danger"
																	onClick={() => handleRefundService(row)}
																	disabled={billingdata.islocked === 1 || billingdata.writeOff === 1}
																>
																	Refund
																</Button>
															)}
															{row.isRefundInitiated === 1 && row.isRefundApproved === 1 && (row.isRefundCompleted !== 1) && (
																<Button size="sm" variant="success" onClick={() => handleCashOutRefund(row)}>
																	Cash Out
																</Button>
															)}
															{Array.isArray(row.witnesses) && row.witnesses.length > 0 && (
																<Button size="sm" variant="secondary" onClick={() => {
																	setWitnesses(row.witnesses);
																	setShowWitnessModal(true);
																}}>
																	View Witnesses
																</Button>
															)}
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
						<div className="d-flex justify-content-end gap-2 mt-4">
							{(() => {
								const isLocked = billingdata.islocked === 1;
								const isWrittenOff = billingdata.writeOff === 1;
								const totalRefunded = Number(billingdata.totalrefunded) || 0;
								const totalPayable = Number(billingdata.payable) || 0;
								const allRefunded = totalRefunded >= totalPayable && totalPayable > 0;
								const nothingToRefund = totalPayable <= 0;
								const disableActions = isLocked || isWrittenOff || allRefunded || nothingToRefund;
								const getDisabledReason = () => {
									if (isLocked) return 'Transaction is locked.';
									if (isWrittenOff) return 'Transaction is written off.';
									if (allRefunded) return 'All services have already been refunded.';
									if (nothingToRefund) return 'No payable amount left for action.';
									return '';
								};
								// Only allow refund all or write off if role is admin or manager
								const canRefundAllOrWriteOff = role === 'admin' || role === 'manager';
								return <>
									<Button
										size='sm'
										variant="danger"
										onClick={() => {
											if (!canRefundAllOrWriteOff) return toast.error('Not allowed. Only admin or manager can refund all.');
											if (disableActions) toast.error(getDisabledReason());
											else handleRefundAll();
										}}
										disabled={disableActions || !canRefundAllOrWriteOff}
									>
										{submitting && <Spinner size='sm' />}  <RefreshCwIcon /> {" "}
										{submitting ? "refunding" : " Refund All"}
									</Button>
									<Button
										size='sm'
										variant="warning"
										onClick={() => {
											if (!canRefundAllOrWriteOff) return toast.error('Not allowed. Only admin or manager can write off.');
											if (disableActions) toast.error(getDisabledReason());
											else handleWriteOff();
										}}
										disabled={disableActions || !canRefundAllOrWriteOff}
									>
										<EditIcon />  {" "}
										Write Off
									</Button>

								</>;
							})()}
						</div>

						<Modal show={showRefundAllModal} onHide={() => setShowRefundAllModal(false)} backdrop="static">
							<Modal.Header closeButton>
								<Modal.Title>Refund All</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<div className="mb-3">
									<label htmlFor="refundAllReason" className="form-label">Reason for Refunding All</label>
									<textarea
										id="refundAllReason"
										className="form-control"
										value={refundAllReason}
										onChange={e => setRefundAllReason(e.target.value)}
										rows={3}
										placeholder="Enter reason for refunding all..."
									/>
								</div>
								<div className="mb-3">
									<label htmlFor="refundAllAcknowledge" className="form-label">Type <b>I acknowledge</b> to confirm you understand this action</label>
									<input
										id="refundAllAcknowledge"
										className="form-control"
										value={refundAllAcknowledge}
										onChange={e => setRefundAllAcknowledge(e.target.value)}
										placeholder="Type 'I acknowledge' to proceed"
									/>
								</div>
								<div className="mb-3">
									<label htmlFor="refundAllPaymentMode" className="form-label">Select Payment Mode</label>
									<select
										id="refundAllPaymentMode"
										className="form-control"
										value={PaymentMode}
										onChange={e => setPaymentMode(e.target.value)}
									>
										<option value="">Select Refund Mode Here</option>
										{paymentModes.map((mode) => (
											<option key={mode.KeyID} value={mode.KeyID}>
												{mode.PaymentMode}
											</option>
										))}
									</select>
								</div>
								{refundAllError && <div className="alert alert-danger text-sm">{refundAllError}</div>}
							</Modal.Body>
							<Modal.Footer>
								<Button variant="secondary" onClick={() => setShowRefundAllModal(false)} disabled={submitting}>
									Cancel
								</Button>
								<Button variant="primary" onClick={handleRefundAllSubmit} disabled={submitting}>
									{submitting ? <Spinner size="sm" /> : null} Refund All
								</Button>
							</Modal.Footer>
						</Modal>
					</div>
				</div>
			</div>
		);

	}
}