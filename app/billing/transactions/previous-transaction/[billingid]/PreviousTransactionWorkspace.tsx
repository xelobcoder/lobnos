'use client'
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Button, Card, Spinner, Modal } from 'react-bootstrap';
import RefundServiceShowDetailModal from '../../../../../components/Billing/BillingContextComponents/BillingSourceComponents/RefundServiceShowDetailModal';
import { currencyFormatter, customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { DollarSignIcon, CreditCardIcon, CheckCircleIcon, RotateCcwIcon, AlertCircleIcon, RefreshCwIcon, EditIcon, SettingsIcon } from '../../../../../components/Billing/BillingContextComponents/Lib/Icons';
import { RiCalculatorLine, RiMoneyDollarCircleLine, RiArrowGoBackLine, RiScalesLine, RiRefreshFill, RiFileList3Line, RiWalletLine, RiAlarmWarningLine, RiRefund2Line, RiCheckboxCircleLine } from '@remixicon/react';
import WriteOffModal from '../../../../../components/Billing/BillingContextComponents/BillingSourceComponents/WriteOffModal';
import styles from '../../../../../styles/SmsTemplateList.module.css'
import { Service, Witness } from '../../../../../types/serviceTypes';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../../../components/Auth/roles';
import { set } from 'react-hook-form';
import dayjs, { Dayjs } from 'dayjs';
import BillOnlinePayment from './BillOnlinePayment';
import workspaceStyles from './PreviousTransactionWorkspace.module.css';
import tableLayout from '../../../../../components/Billing/BilledClientsLayout.module.css';
import usePageStickyTableHeader from '../../../../../components/Billing/usePageStickyTableHeader';
import { fetchRefundQuote, type RefundQuote } from '../../../../../lib/billing/financialControls';
import { billingSubmissionIdentity } from '../../../../../lib/billing/submissionIdentity';
import Link from 'next/link';


interface AnalyticCardProps {
	title: string;
	value: number;
	Icon: React.ElementType;
	variant: string;
	subtitle: string;
}

const AnalyticCard = ({ title, value, Icon, variant, subtitle }: AnalyticCardProps) => (
	<Card className={`border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
		<Card.Body className="p-3">
			<div className="d-flex justify-content-between align-items-center mb-1">
				<span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
				<Icon size={22} className="opacity-75" />
			</div>
			<h3 className="fw-bold mb-0">{currencyFormatter.format(Number(value) || 0)}</h3>
			<span className="text-xs opacity-75">{subtitle}</span>
		</Card.Body>
	</Card>
);

export default function PreviousTransactionWorkspace({billingid: billingidParam, embedded = false}: {billingid: string | number | undefined; embedded?: boolean}) {
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
	const [submitting, setSubmitting] = useState(false);
	const [PaymentMode, setPaymentMode] = useState('');
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const loadRevision = useRef(0);
    const [refundQuote, setRefundQuote] = useState<RefundQuote | null>(null);
    const [controlsError, setControlsError] = useState("");
    const refundPosting = useRef(false);
    const canChangeSale = !loading && !loadError && !controlsError && refundQuote?.closed_status === "OPEN";
    const requireOpenSale = () => {
        if (canChangeSale) return true;
        toast.error(refundQuote?.closed_status === "CLOSED" ? "This sale is closed and read-only. Historical refunds, voids, deletions and edits are not permitted." : "Sale closure and remaining refundable amounts must be verified before making changes.");
        return false;
    };
	const [previousServices, setPreviousServices] = useState<Service[]>([]);
    const servicesViewportRef = useRef<HTMLDivElement>(null);
    usePageStickyTableHeader(servicesViewportRef, `${embedded}:${loading}`, 1046);
	const [showTaxModal, setShowTaxModal] = useState(false);
	const [modalTaxes, setModalTaxes] = useState<any[]>([]);
	const [modalService, setModalService] = useState<Service | null>(null);
	const [showWitnessModal, setShowWitnessModal] = useState(false);
	const [witnesses, setWitnesses] = useState<Witness[]>([]);
	const [requesting, setRequesting] = useState(false);
	const [showRefundDetailsModal, setShowRefundDetailsModal] = useState(false);
	const [refundDetailsService, setRefundDetailsService] = useState<Service | null>(null);
	const [showWriteOffModal, setShowWriteOffModal] = useState(false);
	const [writeOffReason, setWriteOffReason] = useState('');
	const [isWritingOff, setIsWritingOff] = useState(false);
	const [showRefundAllModal, setShowRefundAllModal] = useState(false);
	const [showDeleteDetailsModal, setShowDeleteDetailsModal] = useState(false);
	const [deletedItemDetails, setDeletedItemDetails] = useState<Service | null>(null);

	const handleViewRefundDetails = (service: Service) => {
		setRefundDetailsService(service);
		setShowRefundDetailsModal(true);
	};

	const handleViewDeleteDetails = (service: Service) => {
		setDeletedItemDetails(service);
		setShowDeleteDetailsModal(true);
	};
	const [isRemovingService, setIsRemovingService] = useState(false);
	const [removingServiceId, setRemovingServiceId] = useState<number | null>(null);

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
        if (!requireOpenSale()) return;
		try {
			setRequesting(true);
			const { billingid, categoryTrackId, taxIncluded, serviceid, trackId } = item;
			const data = { billingid, categoryTrackId, employeeid, taxIncluded, serviceid, refundMessage, trackId };

			const pushResponse = await customPost(`billing/previous/request/refund/update`, 'POST', data);
			const { status } = pushResponse;
			if (status === true) {
				toast.success("Request for refund submitted successfully");
				await fetchRecords(billingid);
			} else {
				toast.error("request for refund failed ");
			}
			setRequesting(false);
		} catch (error) {
			console.log(error);
		}
	};




	const handleCashOutRefund = (item: Service) => {
        if (!requireOpenSale()) return;
		if (item.isRefundApproved === 1 && item.isRefundInitiated === 1 && item.isRefundCompleted !== 1) {
            const remaining = refundQuote?.services.find(row => row.serviceid === Number(item.serviceid))?.remaining_refundable_amount || 0;
            if (remaining <= 0) { toast.error("No refundable cash remains for this service."); return; }
			setRefundAmount(remaining);
            setRefundableAmount(remaining);
			setItem(item);
			setShowCashOutModal(true);
		}
	};

	const fetchRecords = async (billingid: number) => {
		const revision = ++loadRevision.current;
		setLoading(true);
		setLoadError('');
        setRefundQuote(null);
        setControlsError("");
		try {
			if (!Number.isSafeInteger(billingid) || billingid <= 0) throw new Error('Invalid billing ID.');
			const [summaryRes, servicesRes] = await Promise.all([
				customFetch(`billing/previous/transaction/data?billingid=${billingid}`),
				customFetch(`billing/information/single?billingid=${billingid}`)
			]);
			if (revision !== loadRevision.current) return;
			if (!Array.isArray(summaryRes?.result) || !summaryRes.result.length ||
				!Array.isArray(servicesRes?.result) || summaryRes?.status === false || servicesRes?.status === false) {
				throw new Error('Billing data is unavailable. Reload to review this transaction.');
			}
			setBillingData(summaryRes.result[0]);
			setPreviousServices(servicesRes.result as Service[]);
            try {
                const quote = await fetchRefundQuote(billingid);
                if (revision === loadRevision.current) setRefundQuote(quote);
            } catch (error) {
                if (revision === loadRevision.current) setControlsError(error instanceof Error ? error.message : "Financial controls could not be verified.");
            }
		} catch {
			if (revision !== loadRevision.current) return;
			setBillingData({});
			setPreviousServices([]);
			setLoadError('Unable to load this transaction. No balances or actions are available until it reloads successfully.');
		} finally {
			if (revision === loadRevision.current) setLoading(false);
		}
	};

	useEffect(() => {
		void fetchRecords(Number(billingidParam));
		return () => { loadRevision.current++; };
	}, [billingidParam]);

	const [refundAllReason, setRefundAllReason] = useState('');
	const [refundAllAcknowledge, setRefundAllAcknowledge] = useState('');
	const [refundAllError, setRefundAllError] = useState('');
	const handleRefundAll = () => {
        if (!requireOpenSale() || !refundQuote?.can_refund_all) return;
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
        if (refundPosting.current || !requireOpenSale() || !refundQuote?.can_refund_all) return;
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
            refundPosting.current = true;
			setSubmitting(true);
            const payload = { billingid: billingdata.billingid, selectedPaymentMode: Number(PaymentMode), reason: refundAllReason.trim() };
            const identity = billingSubmissionIdentity({ endpoint: "billing/refund-all", payload });
			const response = await customPost("billing/refund-all", "POST", { ...payload, request_key: identity.key });
			const { status, message } = response;
			if (status === true) {
                identity.complete();
                setShowRefundAllModal(false);
				toast.success(message || 'Remaining eligible services refunded; earlier refunds were preserved.');
				await fetchRecords(billingdata.billingid);
			} else {
                setRefundAllError(message || "The remaining refund could not be confirmed. Retry without changing the request.");
			}
		} catch (error) {
            setRefundAllError(error instanceof Error ? error.message : "The refund outcome could not be confirmed. Retry the unchanged request.");
		} finally { refundPosting.current = false; setSubmitting(false); }
	};



	const handleServiceItemRemoval = async (billingdata: BillingData) => {
        if (!requireOpenSale()) return;
		try {
			console.log("Removing service item:", billingdata);
			const { serviceid } = billingdata;
			setIsRemovingService(true);
			setRemovingServiceId(serviceid || null);
			const backendData = { employeeid, billingid: billingdata.billingid, serviceid };
			const response = await customPost(
				`billing/pending/remove/service`,
				'PUT',
				backendData
			);

			const { status, message } = response;

			if (status === true) {
				toast.success(message || 'Service removed successfully');
				if (billingdata.billingid) {
					await fetchRecords(billingdata.billingid);
				}
			} else {
				toast.error(message || 'Failed to remove service');
			}
		} catch (err) {
			toast.error('An error occurred while removing the service');
		} finally {
			setIsRemovingService(false);
			setRemovingServiceId(null);
		}
	}



	const [showRefundModal, setShowRefundModal] = useState(false);
	const [refundTarget, setRefundTarget] = useState<any | null>(null);
	const [refundReason, setRefundReason] = useState('');
	const [refundReasonType, setRefundReasonType] = useState('');
	const [refundRequestAmount, setRefundRequestAmount] = useState('');

	const handleRefundService = (service: Service) => {
        if (!requireOpenSale()) return;
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
        const remaining = refundQuote?.services.find(row => row.serviceid === Number(service.serviceid))?.remaining_refundable_amount || 0;
        if (remaining <= 0) { toast.error("No refundable cash remains for this service."); return; }
		setRefundRequestAmount(String(remaining));
		setShowRefundModal(true);
	};



	const handleCashOutConfirmation = async () => {
        if (refundPosting.current || !requireOpenSale()) return;
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
            const remaining = refundQuote?.services.find(row => row.serviceid === Number(item.serviceid))?.remaining_refundable_amount || 0;
            if (refundAmount > remaining) { toast.error("The refund exceeds this service's remaining refundable cash. Reload the transaction."); return; }
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

            const identity = billingSubmissionIdentity({ endpoint: "billing/previous/refund/update/cashout", payload: RequestData });
            refundPosting.current = true;
			setCashIssuedOut(true);
			const response = await customPost(
				`billing/previous/refund/update/cashout`,
				'POST',
				{ ...RequestData, request_key: identity.key }
			);
			if (response?.status === true) {
                identity.complete();
				toast.success(response.message || 'Refund cashed out successfully');
				await fetchRecords(billingid);
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
		} finally { refundPosting.current = false; }
	};


	const handleRefundRequest = async () => {
        if (!requireOpenSale()) return;
		if (!refundTarget) return;
		if (!refundReasonType) {
			toast.error('Please select a refund reason');
			return;
		}
		if (refundReasonType === 'Other' && !refundReason.trim()) {
			toast.error('Please specify the custom reason for the refund');
			return;
		}
		const amount = parseFloat(refundRequestAmount);
		if (isNaN(amount) || amount <= 0) {
			toast.error('Please enter a valid refund amount');
			return;
		}
		const maxCost = refundQuote?.services.find(row => row.serviceid === Number(refundTarget.serviceid))?.remaining_refundable_amount || 0;
		if (maxCost > 0 && amount > maxCost) {
			toast.error(`Refund amount cannot exceed the service cost (${currencyFormatter.format(maxCost)})`);
			return;
		}

		setIsRequesting(true);
		const { serviceid, categoryTrackId, taxIncluded, trackId } = refundTarget;
		const targetBillingId = refundTarget.billingid || billingdata.billingid || billingidParam;
		const customReasonText = refundReason.trim();
		const finalReason = refundReasonType === 'Other'
			? customReasonText
			: (customReasonText ? `${refundReasonType} - ${customReasonText}` : refundReasonType);

		const data = {
			billingid: Number(targetBillingId),
			categoryTrackId: Number(categoryTrackId || 0),
			employeeid: Number(employeeid),
			taxIncluded: taxIncluded ? 1 : 0,
			serviceid: Number(serviceid),
			refundMessage: finalReason,
			refundAmount: amount,
			trackId
		};

		try {
			const pushResponse = await customPost(`billing/previous/request/refund/update`, 'POST', data);
			const { status, message } = pushResponse || {};
			if (status === true) {
				toast.success(message || "Request for refund submitted successfully");
				setShowRefundModal(false);
				setRefundReason('');
				setRefundReasonType('');
				setRefundRequestAmount('');
				if (targetBillingId) await fetchRecords(Number(targetBillingId));
			} else {
				toast.error(message || "Request for refund failed");
			}
		} catch (err: any) {
			toast.error(err?.message || "An error occurred while submitting refund request");
		} finally {
			setIsRequesting(false);
		}
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

	const renderRefundModal = () => {
		const targetItem: any = refundTarget;
		return (
			<Modal show={showRefundModal} onHide={() => setShowRefundModal(false)} backdrop="static" animation={false} size="lg" className="topSheetDialog">
				<Modal.Header closeButton className="border-bottom pb-2">
					<Modal.Title className="d-flex align-items-center gap-2 text-primary fw-semibold fs-5">
						<RiRefund2Line size={24} /> Request Service Refund
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="p-4">
					{targetItem && (
						<div className="card border-0 bg-light-subtle rounded-3 p-3 mb-3 border-start border-4 border-primary shadow-sm">
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<div className="text-muted text-xs fw-medium text-uppercase mb-1">Target Service</div>
									<h6 className="fw-bold mb-1 text-dark">{(targetItem as any)?.name || (targetItem as any)?.serviceName || 'Billed Service'}</h6>
									<div className="text-muted text-xs">
										Billing ID: <span className="fw-semibold text-body">#{targetItem.billingid || billingdata.billingid || billingidParam}</span>
									</div>
								</div>
								<div className="text-end">
									<div className="text-muted text-xs fw-medium text-uppercase mb-1">Service Cost</div>
									<div className="fs-5 fw-bold text-primary">
										{currencyFormatter.format(Number(targetItem.totalcost || targetItem.cost) || 0)}
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="row g-3 mb-3">
						<div className="col-md-12">
							<label htmlFor="refundAmount" className="form-label fw-medium text-xs text-uppercase mb-1">
								Refund Amount <span className="text-danger">*</span>
							</label>
							<div className="input-group">
								<span className="input-group-text bg-light text-muted fw-bold"></span>
								<input
									id="refundAmount"
									type="number"
									className="form-control form-control-lg fs-6"
									value={refundRequestAmount}
									onChange={e => setRefundRequestAmount(e.target.value)}
									min="0"
									step="0.01"
									placeholder="Enter refund amount"
								/>
								{refundTarget && (
									<Button
										variant="outline-secondary"
										size="sm"
										className="px-3"
										onClick={() => setRefundRequestAmount(Number(refundTarget.totalcost || refundTarget.cost || 0).toString())}
									>
										Full Amount
									</Button>
								)}
							</div>
						</div>

						<div className="col-md-12">
							<label htmlFor="refundReasonType" className="form-label fw-medium text-xs text-uppercase mb-1">
								Reason Category <span className="text-danger">*</span>
							</label>
							<select
								id="refundReasonType"
								className="form-select form-select-md"
								value={refundReasonType}
								onChange={(e) => {
									setRefundReasonType(e.target.value);
									if (e.target.value !== 'Other' && !refundReason) {
										setRefundReason('');
									}
								}}
							>
								<option value="">-- Select Reason Category --</option>
								{refundReasons.map((reason) => (
									<option key={reason} value={reason}>
										{reason}
									</option>
								))}
							</select>
						</div>

						<div className="col-md-12">
							<label htmlFor="refundReason" className="form-label fw-medium text-xs text-uppercase mb-1">
								Detailed Explanation / Remarks {refundReasonType === 'Other' && <span className="text-danger">*</span>}
							</label>
							<textarea
								id="refundReason"
								className="form-control"
								value={refundReason}
								onChange={e => setRefundReason(e.target.value)}
								rows={3}
								placeholder={refundReasonType === 'Other' ? "Specify the exact reason for the refund..." : "Add optional details or remarks for the administrator..."}
							/>
						</div>
					</div>

					<div className="alert alert-info border-0 rounded-3 text-xs mb-0 d-flex align-items-center gap-2">
						<RiAlarmWarningLine size={18} className="flex-shrink-0 text-info" />
						<div>
							<strong>Single Witness Workflow:</strong> Submitting this request logs your witness statement. Administrators will review and approve the request before funds can be issued.
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer className="border-top pt-2">
					<Button variant="light" className="px-4" onClick={() => setShowRefundModal(false)} disabled={isRequesting}>
						Cancel
					</Button>
					<Button variant="primary" className="px-4 fw-semibold" onClick={handleRefundRequest} disabled={isRequesting}>
						{isRequesting ? <Spinner size="sm" className="me-1" /> : null} Submit Request
					</Button>
				</Modal.Footer>
			</Modal>
		);
	};
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
        if (!requireOpenSale()) return;
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
					{/* Time Based Adjustment Details */}
					{hasNightAdjustment && (
						<div className="mb-2 bg-body-tertiary border border-bottom br-5 p-2 text-sm">
							<strong>Time Based Adjustment:</strong> Yes<br />
							<strong>Time Based Adjustment Value:</strong> {nightAdjustmentValue}<br />
							<strong>Time Based Adjustment Mode:</strong> {nightAdjustmentMode}
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

	const renderRefundDetailsModal = () => {
		if (!refundDetailsService) return null;

		const refundInitiatedDate = refundDetailsService?.firstWitnessDate ? new Date(refundDetailsService.firstWitnessDate).toLocaleString() : 'N/A';
		const secondWitnessDateFormatted = refundDetailsService?.secondWitnessDate ? new Date(refundDetailsService.secondWitnessDate).toLocaleString() : 'N/A';
		const thirdWitnessDateFormatted = refundDetailsService?.thirdWitnessDate ? new Date(refundDetailsService.thirdWitnessDate).toLocaleString() : 'N/A';

		return (
			<Modal backdrop='static' show={showRefundDetailsModal} onHide={() => { setShowRefundDetailsModal(false); setRefundDetailsService(null); }} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Refund Details - {refundDetailsService?.name || 'Service'}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="d-flex flex-column gap-2">
						{/* Refund Amount */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Refund Amount</small>
								<h6 className="fw-bold text-success mb-0">{currencyFormatter.format(Number(refundDetailsService?.amountRefunded) || 0)}</h6>
							</div>
						</div>

						{/* Refund Status */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Refund Status</small>
								<span className={`badge ${refundDetailsService?.isRefundCompleted === 1 ? 'bg-success' : 'bg-warning'}`}>
									{refundDetailsService?.isRefundCompleted === 1 ? 'Completed' : 'Pending'}
								</span>
							</div>
						</div>

						{/* Refund Initiated */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Refund Initiated</small>
								<span className={`badge ${refundDetailsService?.isRefundInitiated === 1 ? 'bg-success' : 'bg-secondary'}`}>
									{refundDetailsService?.isRefundInitiated === 1 ? 'Yes' : 'No'}
								</span>
							</div>
						</div>

						{/* Approval Status */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Approval Status</small>
								<span className={`badge ${refundDetailsService?.isRefundApproved === 1 ? 'bg-success' : 'bg-secondary'}`}>
									{refundDetailsService?.isRefundApproved === 1 ? 'Approved' : 'Pending'}
								</span>
							</div>
						</div>

						{/* Initiated By */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Initiated By</small>
								<div className="d-flex flex-column align-items-end text-sm">
									<span className="fw-semibold">{refundDetailsService?.initiatedByName || 'N/A'}</span>
									<small className="text-muted">(ID: {refundDetailsService?.initiatedBy || 'N/A'})</small>
								</div>
							</div>
						</div>

						{/* Initiated Date */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Initiated Date</small>
								<small className="fw-semibold">{refundInitiatedDate}</small>
							</div>
						</div>

						{/* Approved By */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Approved By</small>
								<div className="d-flex flex-column align-items-end text-sm">
									<span className="fw-semibold">{refundDetailsService?.approvedByName || 'N/A'}</span>
									<small className="text-muted">(ID: {refundDetailsService?.approvedby || 'N/A'})</small>
								</div>
							</div>
						</div>

						{/* Refunded By */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Refunded By (Employee ID)</small>
								<span className="fw-semibold">{refundDetailsService?.refundedBy || 'N/A'}</span>
							</div>
						</div>

						{/* Refund Matter Closed */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Refund Matter Closed</small>
								<span className={`badge ${refundDetailsService?.isRefundMatterClosed === 1 ? 'bg-success' : 'bg-secondary'}`}>
									{refundDetailsService?.isRefundMatterClosed === 1 ? 'Yes' : 'No'}
								</span>
							</div>
						</div>

						{/* First Witness */}
						{(refundDetailsService?.firstWitness || 0) > 0 && (
							<div className="p-2 border-bottom">
								<small className="fw-bold text-uppercase d-block mb-1">First Witness</small>
								<div className="d-flex flex-column gap-1 text-sm">
									<div><span className="text-muted">Name:</span> <span className="fw-semibold">{refundDetailsService?.firstWitnessName || 'N/A'}</span></div>
									<div><span className="text-muted">Purpose:</span> <span className="fw-semibold">{refundDetailsService?.firstWitnessPurpose || 'N/A'}</span></div>
									<div><span className="text-muted">Date:</span> <span className="fw-semibold">{refundInitiatedDate}</span></div>
								</div>
							</div>
						)}

						{/* Second Witness */}
						{(refundDetailsService?.secondWitness || 0) > 0 && (
							<div className="p-2 border-bottom">
								<small className="fw-bold text-uppercase d-block mb-1">Second Witness</small>
								<div className="d-flex flex-column gap-1 text-sm">
									<div><span className="text-muted">Name:</span> <span className="fw-semibold">{refundDetailsService?.secondWitnessName || 'N/A'}</span></div>
									<div><span className="text-muted">Purpose:</span> <span className="fw-semibold">{refundDetailsService?.secondWitnessPurpose || 'N/A'}</span></div>
									<div><span className="text-muted">Date:</span> <span className="fw-semibold">{secondWitnessDateFormatted}</span></div>
								</div>
							</div>
						)}

						{/* Third Witness */}
						{(refundDetailsService?.thirdWitness || 0) > 0 && (
							<div className="p-2 border-bottom">
								<small className="fw-bold text-uppercase d-block mb-1">Third Witness</small>
								<div className="d-flex flex-column gap-1 text-sm">
									<div><span className="text-muted">Name:</span> <span className="fw-semibold">{refundDetailsService?.thirdWitnessName || 'N/A'}</span></div>
									<div><span className="text-muted">Purpose:</span> <span className="fw-semibold">{refundDetailsService?.thirdWitnessPurpose || 'N/A'}</span></div>
									<div><span className="text-muted">Date:</span> <span className="fw-semibold">{thirdWitnessDateFormatted}</span></div>
								</div>
							</div>
						)}

						{/* Witness Information List */}
						{Array.isArray(refundDetailsService?.witnesses) && refundDetailsService.witnesses.length > 0 && (
							<div className="p-2 border-bottom">
								<small className="fw-bold text-uppercase d-block mb-1">Witness Information</small>
								{refundDetailsService.witnesses.map((w, idx) => (
									<div key={idx} className="d-flex justify-content-between align-items-center text-sm">
										<span className="fw-semibold">{w.username || 'Unknown'}</span>
										<span className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>{w.witnessType || 'Witness'}</span>
									</div>
								))}
							</div>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => { setShowRefundDetailsModal(false); setRefundDetailsService(null); }}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		);
	};

	const renderDeleteDetailsModal = () => {
		if (!deletedItemDetails) return null;

		const deletedAtDate = deletedItemDetails?.deletedAt ? new Date(deletedItemDetails.deletedAt).toLocaleString() : 'N/A';

		return (
			<Modal backdrop='static' show={showDeleteDetailsModal} onHide={() => { setShowDeleteDetailsModal(false); setDeletedItemDetails(null); }} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Deletion Details - {deletedItemDetails?.name || 'Service'}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="d-flex flex-column gap-2">
						{/* Service Name */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Service Name</small>
								<span className="fw-semibold">{deletedItemDetails?.name || 'N/A'}</span>
							</div>
						</div>

						{/* Service Cost */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Service Cost</small>
								<span className="fw-semibold">{currencyFormatter.format(Number(deletedItemDetails?.totalcost) || 0)}</span>
							</div>
						</div>

						{/* Deleted By */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Deleted By (Employee Name)</small>
								<span title={String(deletedItemDetails?.isDeletedBy || 'N/A')} className="fw-semibold">{deletedItemDetails?.deletedByName || 'N/A'}</span>
							</div>
						</div>

						{/* Deletion Date */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Deletion Date</small>
								<small className="fw-semibold">{deletedAtDate}</small>
							</div>
						</div>

						{/* Status */}
						<div className="p-2 border-bottom">
							<div className="d-flex justify-content-between align-items-center">
								<small className="fw-bold text-uppercase d-block">Status</small>
								<span className="badge bg-danger">Deleted</span>
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => { setShowDeleteDetailsModal(false); setDeletedItemDetails(null); }}>
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

	if (loadError && !loading) return (
		<div className="alert alert-danger m-3" role="alert">
			<p className="mb-2">{loadError}</p>
			<Button variant="outline-danger" onClick={() => void fetchRecords(Number(billingidParam))}>Retry loading transaction</Button>
		</div>
	);

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
				<Spinner animation="border" />
			</div>
		);
	} else {
		const activeItem: any = item;
		const cashoutItem = activeItem ? {
			name: activeItem.name || activeItem.serviceName || 'Billed Service',
			cost: Number(activeItem.cost) || 0,
			amountIncurredDueTax: Number(activeItem.amountIncurredDueTax) || 0,
			discount: Number(activeItem.discount) || 0,
			serviceid: Number(activeItem.serviceid) || 0,
			billingid: Number(activeItem.billingid) || 0,
			totalcost: Number(activeItem.totalcost) || 0
		} : {
			name: 'Billed Service',
			cost: 0,
			amountIncurredDueTax: 0,
			discount: 0,
			serviceid: 0,
			totalcost: 0,
			billingid: 0
		};


		return (
			<div className={embedded ? workspaceStyles.embedded : undefined}>
                {controlsError && <p className="alert alert-danger" role="alert">{controlsError} Financial changes are disabled.<button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => void fetchRecords(Number(billingidParam))}>Retry financial controls</button></p>}
                {refundQuote?.closed_status === "CLOSED" && <p className="alert alert-info" role="status"><strong>Closed sale - read-only.</strong> Historical financial changes are blocked.{refundQuote.closure_evidence?.closed_at && <> Signed off {dayjs(refundQuote.closure_evidence.closed_at).format("DD MMM YYYY, HH:mm")}.</>}{refundQuote.closure_evidence?.closure_id && <> <Link href={`/accounting/daily-close?closeId=${refundQuote.closure_evidence.closure_id}`}>View administrator sign-off</Link></>}</p>}
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
					{renderRefundDetailsModal()}
					{renderDeleteDetailsModal()}
					<div className="mb-4">
						<div className="d-flex justify-content-between align-items-center mb-3">
							<h5 className="mb-0 fw-semibold text-body-emphasis">Billing Summary</h5>
							<button className='d-flex align-items-center btn btn-secondary btn-sm' onClick={() => fetchRecords(Number(billingidParam))}>
								<RiRefreshFill /> Refresh
							</button>
						</div>
						<div className="row g-3">
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Trans. Cost"
									value={Number(billingdata.totalTransactionCost) || 0}
									Icon={RiCalculatorLine}
									variant="primary"
									subtitle="Transaction value"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Total Cost"
									value={Number(billingdata.totalcost) || 0}
									Icon={RiFileList3Line}
									variant="info"
									subtitle="Services and taxes"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Payable"
									value={Number(billingdata.payable) || 0}
									Icon={CreditCardIcon}
									variant="primary"
									subtitle="Amount due"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Paid"
									value={Number(billingdata.paid) || 0}
									Icon={CheckCircleIcon}
									variant="success"
									subtitle="Payment received"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Refunded"
									value={Number(billingdata.totalrefunded) || 0}
									Icon={RiRefund2Line}
									variant="secondary"
									subtitle="Refunds issued"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Outstanding"
									value={Number(billingdata.outstanding) || 0}
									Icon={RiAlarmWarningLine}
									variant="warning"
									subtitle="Balance awaiting payment"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Written Off"
									value={Number(billingdata.writeoff) || 0}
									Icon={EditIcon}
									variant="danger"
									subtitle="Amount written off"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Balance"
									value={(Number(billingdata.payable) || 0) - (Number(billingdata.paid) || 0)}
									Icon={RiScalesLine}
									variant="success"
									subtitle="Payable less paid"
								/>
							</div>
						</div>
					</div>
					<BillOnlinePayment billingId={Number(billingdata.billingid ?? billingidParam)} outstanding={Number(billingdata.outstanding) || 0} />
					<div className="card border-0 mt-5">
						<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
							<h5 className="mb-0 fw-semibold text-body-emphasis">Services Details</h5>
						</div>
						<div className="card-body p-0">
							{!embedded && <div className="px-4 py-2 bg-light border-bottom mb-2 d-flex flex-wrap gap-3 small text-muted">
								<div className="d-flex gap-2"><strong>Svc Name(ID):</strong> Service Name(ID)</div>
								<div className="d-flex gap-2"><strong>Org:</strong> Organization</div>
								<div className="d-flex gap-2"><strong>Clin:</strong> Clinician</div>
								<div className="d-flex gap-2"><strong>Added On:</strong> Service Added On</div>
								<div className="d-flex gap-2"><strong>TC:</strong> Total Cost</div>
								<div className="d-flex gap-2"><strong>TP:</strong> Total Payable</div>
								<div className="d-flex gap-2"><strong>PD:</strong> Paid Amount</div>
								<div className="d-flex gap-2"><strong>UA Type:</strong> User Adjustment Type</div>
								<div className="d-flex gap-2"><strong>UA Val:</strong> User Adjusted Value</div>
								<div className="d-flex gap-2"><strong>OS:</strong> Outstanding</div>
								<div className="d-flex gap-2"><strong>Amt Ref:</strong> Amount Refunded</div>
								<div className="d-flex gap-2"><strong>Tax/Det:</strong> Tax/Details</div>
								<div className="d-flex gap-2"><strong>Act/Wit:</strong> Actions/Witnesses</div>
							</div>}

							<div ref={embedded ? servicesViewportRef : undefined} className={embedded ? tableLayout.viewport : undefined} style={embedded ? undefined : {overflowX:'auto'}} role={embedded ? 'region' : undefined} aria-label={embedded ? 'Transaction services; date and service name stay fixed' : undefined} tabIndex={embedded ? 0 : undefined}>
                                <table className={embedded ? `${tableLayout.fit} ${workspaceStyles.servicesTable}` : "table table-striped table-hover text-nowrap mb-0"}>
                                    <thead className={embedded ? undefined : "table-light"}>
                                    {embedded ? <tr>{[
                                        ['billedon','Date Added'],['fullname','Service Name'],['organization','Organization'],['clinician','Clinician'],['cost','Cost'],['totalcost','Total Cost'],['totalpayable','Amount Payable'],['paidamount','Amount Paid'],['adjustmenttype','Adjustment Type'],['adjustmentvalue','Adjustment Amount'],['outstanding','Outstanding'],['tax','Tax'],['status','Transaction Status'],['paymentstatus','Payment Status'],['refunded','Amount Refunded'],['details','Service Details'],['actions','Actions']
                                    ].map(([key,label]) => <th scope="col" key={key} data-column={key}>{label}</th>)}</tr> :
										<tr>
											<th className="fw-semibold text-start">Svc Name(ID)</th>
											<th className="fw-semibold text-start">Org</th>
											<th className="fw-semibold text-start">Clin</th>
											<th className="fw-semibold text-start">Added On</th>
											<th className="fw-semibold text-start">Cost</th>
											<th className="fw-semibold text-start">TC</th>
											<th className="fw-semibold text-start">TP</th>
											<th className="fw-semibold text-start">PD</th>
											<th className='fw-semibold text-start'>UA Type</th>
											<th className='fw-semibold text-start'>UA Val</th>
											<th className="fw-semibold text-start">OS</th>
											<th className="fw-semibold text-start">Tax</th>
											<th className="fw-semibold text-start">Status</th>
											<th className="fw-semibold text-start">Amt Ref</th>
											<th className="fw-semibold text-start">Tax/Det</th>
											<th className="fw-semibold text-start">Act/Wit</th>
										</tr>}
									</thead>
									<tbody>
										{Array.isArray(previousServices) && previousServices.map((row, idx) => {
											const outstanding = Number(row.outstanding) || 0;
											const isOutstanding = outstanding > 0;
											const taxes = getServiceTaxes(row);
											const getStatusClass = (status: string) => {
												switch (status?.toLowerCase()) {
													case 'active':
														return 'text-success fw-semibold';
													case 'voided':
														return 'text-secondary fw-semibold';
													case 'pending':
														return 'text-warning fw-semibold';
													default:
														return 'text-muted fw-semibold';
												}
											};
											return (
												<tr key={idx} className={embedded && isOutstanding ? 'table-danger' : undefined} style={embedded ? undefined : isOutstanding ? {backgroundColor:'#ffe6e6'} : {}}>
													{embedded && <td data-column="billedon">{row.serviceAddedOn ? dayjs(row.serviceAddedOn).format('DD MMM YYYY, HH:mm') : '—'}</td>}
                                                <td data-column={embedded ? 'fullname' : undefined} className="text-start">{embedded ? <div><span className="fw-semibold" title={String(row.name || '')}>{row.name}</span><small className="text-muted">Service ID: {row.serviceid}</small></div> : <>{row.name}({row.serviceid})</>}</td>
													<td data-column={embedded ? "organization" : undefined} className="text-start">{row.organizationName || '-'}</td>
													<td data-column={embedded ? "clinician" : undefined} className="text-start">{row.clinicianName || '-'}</td>
													{!embedded && <td className="text-start">{row.serviceAddedOn ? dayjs(row.serviceAddedOn).format("DD-MM-YYYY HH:mm:ss") : ""}</td>}
													<td data-column={embedded ? "cost" : undefined} className="text-start">{currencyFormatter.format(Number(row.cost) || 0)}</td>
													<td data-column={embedded ? "totalcost" : undefined} className="text-start">{currencyFormatter.format(Number(row.totalcost) || 0)}</td>
													<td data-column={embedded ? "totalpayable" : undefined} className="text-start">{currencyFormatter.format(Number(row.totalpayable) || 0)}</td>
													<td data-column={embedded ? "paidamount" : undefined} className="text-start fw-semibold" style={embedded ? undefined : {backgroundColor:'rgba(40,167,69,0.15)'}}>{currencyFormatter.format(Number(row.paidamount) || 0)}</td>
													<td data-column={embedded ? "adjustmenttype" : undefined} className="text-start">{row.userAdjustmentType || '-'}</td>
													<td data-column={embedded ? "adjustmentvalue" : undefined} className="text-start">{row.userAdjustedValue !== undefined ? currencyFormatter.format(Number(row.userAdjustedValue) || 0) : '-'}</td>
													<td data-column={embedded ? "outstanding" : undefined} className="text-start fw-semibold" style={embedded ? undefined : {backgroundColor:isOutstanding?'rgba(220,53,69,0.15)':'rgba(40,167,69,0.15)'}}>{currencyFormatter.format(Number(row.outstanding) || 0)}</td>
													<td data-column={embedded ? "tax" : undefined} className="text-start">{currencyFormatter.format(Number(row.amountIncurredDueTax) || 0)}</td>
													<td data-column={embedded ? 'status' : undefined} className={`text-start ${getStatusClass(row.status)}`}>{row.status}</td>
                                                {embedded && <td data-column="paymentstatus" data-payment-status={row.status === 'voided' ? 'voided' : String(row.paymentstatus).toLowerCase() === 'partail' ? 'partial' : String(row.paymentstatus).toLowerCase() === 'unpaid' ? 'pending' : row.paymentstatus}><span>{row.status === 'voided' ? 'voided' : row.paymentstatus || '—'}</span></td>}
													<td data-column={embedded ? "refunded" : undefined} className="text-start fw-semibold" style={embedded ? undefined : {backgroundColor:'rgba(111,66,193,0.15)'}}>{currencyFormatter.format(Number(row.amountRefunded) || 0)}</td>
													<td data-column={embedded ? "details" : undefined} className="text-start">
														<Button size="sm" variant="info" onClick={() => {
															setModalTaxes(taxes);
															setModalService(row);
															setShowTaxModal(true);
														}}>
															View Details
														</Button>
													</td>

													<td data-column={embedded ? "actions" : undefined} className="text-start">
														<div className="d-flex gap-2 align-items-center flex-wrap">
															{!row.isRefundInitiated && row.paymentstatus !== 'pending' && (
																<Button
																	size="sm"
																	variant="danger"
																	onClick={() => handleRefundService(row)}
																	disabled={!canChangeSale || billingdata.islocked === 1 || billingdata.writeOff === 1}
																>
																	Refund
																</Button>
															)}

															{row.isRefundInitiated === 1 && row.isRefundApproved === 1 && (row.isRefundCompleted !== 1) && (
																<Button size="sm" variant="success" onClick={() => handleCashOutRefund(row)}>
																	Cash Out
																</Button>
															)}
															{row.isRefundInitiated === 1 && (
																<Button size="sm" variant="info" onClick={() => handleViewRefundDetails(row)}>
																	View Refund Details
																</Button>
															)}
														</div>

														{(row.paymentstatus === 'pending' && row.isDeleted == 0) &&
															<Button variant='danger' size='sm' onClick={(ev) => { handleServiceItemRemoval(row) }}>
																Remove Item {isRemovingService && removingServiceId === row.serviceid && <Spinner size='sm' />}
															</Button>
														}

														{row.isDeleted == 1 && (
															<Button
																variant='warning'
																size='sm'
																onClick={() => handleViewDeleteDetails(row)}
															>
																View Deletion Details
															</Button>
														)}
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
								const isLocked = !canChangeSale || billingdata.islocked === 1;
								const isWrittenOff = billingdata.writeOff === 1;
								const allRefunded = refundQuote?.refund_state === "FULLY_REFUNDED";
								const nothingToRefund = !refundQuote?.can_refund_all;
								const disableActions = isLocked || isWrittenOff || allRefunded || nothingToRefund;
								const getDisabledReason = () => {
									if (isLocked) return 'Transaction is locked.';
									if (isWrittenOff) return 'Transaction is written off.';
									if (allRefunded) return 'All services have already been refunded.';
									if (nothingToRefund) return 'No payable amount left for action.';
									return '';
								};
								// Only allow refund all or write off if role is admin or manager
								const canRefundAllOrWriteOff = roleAllowed(role, ['admin', 'manager']);
                                const canRefundRemaining = roleAllowed(role, ['admin']);
								return <>
									<Button
										size='sm'
										variant="danger"
										onClick={() => {
											if (!canRefundRemaining) return toast.error('Only an administrator can refund the remaining transaction.');
											if (disableActions) toast.error(getDisabledReason());
											else handleRefundAll();
										}}
										disabled={disableActions || !canRefundRemaining || submitting}
									>
										{submitting && <Spinner size='sm' />}  <RefreshCwIcon /> {" "}
										{submitting ? "Refunding..." : " Refund remaining"}
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
								<Modal.Title>Refund remaining eligible services</Modal.Title>
							</Modal.Header>
							<Modal.Body>
                                {refundQuote && <p>Already refunded: <strong>{currencyFormatter.format(refundQuote.total_refunded_amount)}</strong>. Remaining cash refund: <strong>{currencyFormatter.format(refundQuote.remaining_refundable_amount)}</strong>. Remaining service amount: <strong>{currencyFormatter.format(refundQuote.remaining_voidable_amount)}</strong>. Earlier refunds are not deducted or issued again.</p>}
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