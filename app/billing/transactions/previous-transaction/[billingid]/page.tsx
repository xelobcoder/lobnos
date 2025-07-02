'use client'
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Spinner, Modal } from 'react-bootstrap';
import RefundServiceShowDetailModal from '../../../../../components/Billing/BillingContextComponents/BillingSourceComponents/RefundServiceShowDetailModal';
import { currencyFormatter, customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { DollarSignIcon, CreditCardIcon, CheckCircleIcon, RotateCcwIcon, AlertCircleIcon, RefreshCwIcon, EditIcon, SettingsIcon } from '../../../../../components/Billing/BillingContextComponents/Lib/Icons';
import WriteOffModal from '../../../../../components/Billing/BillingContextComponents/BillingSourceComponents/WriteOffModal';
import { useParams } from 'next/navigation';
import PrimeTable from '../../../../../components/accessories/Datatables/PrimeTable';
import styles from '../../../../../styles/SmsTemplateList.module.css'
import { Service, Witness } from '../../../../../types/serviceTypes';
import { useApplication, useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';


export default function PreviousTransactionSummaryPage() {
	const { applicationsettings } = useApplicationSettings();
	const user = useApplication().user;
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
	const emploeyeeid = user?.employeeid || 0;
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
	const [refundAllReason, setRefundAllReason] = useState('');

	const handleRefundList = (trackId) => {
		toast.info(`Refund list updated for trackId: ${trackId}`);
	};



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

	const handleRefundAll = () => {
		if (billingdata.islocked === 1 || billingdata.writeOff === 1) {
			toast.error('Refund All is not allowed for locked or written-off transactions.');
			return;
		}
		setShowRefundAllModal(true);
	};

	// This function actually performs the refund all API call
	const handleRefundAllSubmit = async () => {
		if (!PaymentMode || isNaN(Number(PaymentMode))) {
			toast.error('Please select a valid payment mode.');
			return;
		}
		if (!employeeid || !billingdata.billingid) {
			toast.error('Missing employee or billing information.');
			return;
		}
		try {
			setSubmitting(true);
			const endpoint = `billing/previous/refund/all/${billingdata.billingid}/${employeeid}/${PaymentMode}`;
			const response = await customFetch(endpoint);
			const { status, message } = response;
			setSubmitting(false);
			setShowRefundAllModal(false);
			status ? toast.success(message) : toast.error(response?.message || "Refunding all failed");
		} catch (err) {
			setSubmitting(false);
			setShowRefundAllModal(false);
			toast.error("Something wrong occurred");
		}
	};



	const [showRefundModal, setShowRefundModal] = useState(false);
	const [refundTarget, setRefundTarget] = useState<Service | null>(null);
	const [refundReason, setRefundReason] = useState('');

	const handleRefundService = (service: Service) => {
		if (billingdata.islocked === 1 || billingdata.writeOff === 1) {
			toast.error('Refund is not allowed for locked or written-off transactions.');
			return;
		}
		setRefundTarget(service);
		setRefundReason('');
		setShowRefundModal(true);
	};



	const handleCashOutConfirmation = async () => {
		try {
			if (!selectedPaymentMode) {
				toast.error('Please select a refund mode.');
				return;
			}

			if (refundAmount !== Number(refundableAmount)) {
				toast.error('Please Enter value equal to the refundable Amount');
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

			console.log(response);
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
		setIsRequesting(true);
		const { billingid, categoryTrackId, taxIncluded, serviceid, trackId } = refundTarget;
		const data = { billingid, categoryTrackId, employeeid, taxIncluded, serviceid, refundMessage: refundReason, trackId };
		const pushResponse = await customPost(`billing/previous/request/refund/update`, 'POST', data);
		const { status } = pushResponse;
		if (status === true) {
			toast.success("Request for refund submitted successfully");
			setShowRefundModal(false);
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

	const columns = [
		{ Header: 'Track ID', accessor: 'trackId' },
		{ Header: 'Cost', accessor: 'cost', Cell: ({ cell: { value } }) => currencyFormatter.format(Number(value) || 0) },
		{
			Header: 'Service Added On',
			accessor: 'serviceAddedOn',
			Cell: ({ cell: { value } }) => (value ? new Date(value).toLocaleString() : '')
		},
		{
			Header: 'Discount',
			accessor: 'discount',
			Cell: ({ cell: { value } }) => currencyFormatter.format(Number(value) || 0)
		},
		{
			Header: 'Total Cost',
			accessor: 'totalcost',
			Cell: ({ cell: { value } }) => currencyFormatter.format(Number(value) || 0)
		},
		{
			Header: 'Total Payable',
			accessor: 'totalpayable',
			Cell: ({ cell: { value } }) => currencyFormatter.format(Number(value) || 0)
		},
		{ Header: 'Status', accessor: 'status' },
		{
			Header: 'Amount Refunded',
			accessor: 'amountRefunded',
			Cell: ({ cell: { value } }) => currencyFormatter.format(Number(value) || 0)
		},
		{ Header: 'Organization Name', accessor: 'organizationName' },
		{
			Header: 'Tax/Details',
			id: 'taxDetails',
			Cell: ({ row }) => {
				const svc = row.original;
				const taxes = getServiceTaxes(svc);
				return (
					<Button size="sm" variant="info" onClick={() => {
						setModalTaxes(taxes);
						setModalService(svc);
						setShowTaxModal(true);
					}}>
						View Details
					</Button>
				);
			}
		},
		{
			Header: 'Actions/Witnesses',
			accessor: 'actions',
			Cell: ({ row }) => {
				const svc = row.original;
				const { isRefundInitiated, isRefundApproved, isRefundCompleted, witnesses } = svc;
				const hasWitnessed = isRefundInitiated && Array.isArray(witnesses) && witnesses.length > 0 && witnesses.some((w: Witness) => w.employeeid === employeeid);
				return (
					<div className="d-flex gap-2 align-items-center">
						{/* Refund button if not initiated */}
						{!isRefundInitiated && (
							<Button
								size="sm"
								variant="danger"
								onClick={() => handleRefundService(svc)}
								disabled={billingdata.islocked === 1 || billingdata.writeOff === 1}
							>
								Refund Service
							</Button>
						)}
						{/* Cashout button if refund is initiated and approved but not completed */}
						{isRefundInitiated === 1 && isRefundApproved === 1 && isRefundCompleted !== 1 && (
							<Button size="sm" variant="success" onClick={() => handleCashOutRefund(svc)}>
								Issue Out Cash
							</Button>
						)}
						{hasWitnessed && (
							<Button size="sm" variant="secondary" onClick={() => {
								setWitnesses(svc.witnesses);
								setShowWitnessModal(true);
							}}>
								View Witnesses
							</Button>
						)}
					</div>
				);
			}
		}
	];

	const renderRefundModal = () => (
		<Modal show={showRefundModal} onHide={() => setShowRefundModal(false)} backdrop="static">
			<Modal.Header closeButton>
				<Modal.Title>Request Refund</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-3">
					<label htmlFor="refundReason" className="form-label">Reason for Refund</label>
					<textarea
						id="refundReason"
						className="form-control"
						value={refundReason}
						onChange={e => setRefundReason(e.target.value)}
						rows={3}
						placeholder="Enter reason for refund..."
					/>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={() => setShowRefundModal(false)} disabled={isRequesting}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleRefundRequest} disabled={isRequesting || !refundReason.trim()}>
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

	const handleWriteOffSubmit = async () => {
		if (!writeOffReason.trim()) {
			toast.error('Please provide a reason for writing off the transaction.');
			return;
		}
		setIsWritingOff(true);
		try {
			// TODO: Replace with actual API endpoint and payload as needed
			// Example: await customPost('billing/writeoff', 'POST', { billingid: billingdata.billingid, reason: writeOffReason, employeeid });
			setTimeout(() => {
				setIsWritingOff(false);
				setShowWriteOffModal(false);
				toast.success('Transaction written off successfully.');
			}, 1000);
		} catch (err) {
			setIsWritingOff(false);
			toast.error('Failed to write off transaction.');
		}
	};

	// WriteOffModal is now a separate component

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
					{isOutsourced && (
						<div className="mb-2 bg-light border border-bottom br-5 p-2 text-sm"><strong>Is Outsourced:</strong> {isOutsourced}</div>
					)}
					{serviceCategory && (
						<div className="mb-2 bg-light border border-bottom br-5 p-2 text-sm"><strong>Service Category:</strong> {serviceCategory}</div>
					)}
					{registrationType && (
						<div className="mb-2 bg-light border border-bottom br-5 p-2 text-sm"><strong>Registration Type:</strong> {registrationType}</div>
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
			billingid: item.billingid
		} : {
			cost: 0,
			amountIncurredDueTax: 0,
			discount: 0,
			serviceid: 0,
			billingid: 0
		};


		return (
			<div className="bg-white br-5 p-3">
				{renderRefundModal()}

				<WriteOffModal
					show={showWriteOffModal}
					onClose={() => setShowWriteOffModal(false)}
					billingid={billingdata.billingid !== undefined ? String(billingdata.billingid) : ''}
					employeeid={emploeyeeid !== undefined ? String(emploeyeeid) : ''}
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
				<div className="row g-3 mb-4">
					{[
						{
							label: 'Total Transaction Cost',
							value: currencyFormatter.format(Number(billingdata.totalTransactionCost) || 0),
							icon: <DollarSignIcon />, color: 'dark',
						},
						{
							label: 'Total Cost',
							value: currencyFormatter.format(Number(billingdata.totalcost) || 0),
							icon: <DollarSignIcon />, color: 'secondary',
						},
						{
							label: 'Total Payable',
							value: currencyFormatter.format(Number(billingdata.payable) || 0),
							icon: <CreditCardIcon />, color: 'primary',
						},
						{
							label: 'Total Refunded',
							value: currencyFormatter.format(Number(billingdata.totalrefunded) || 0),
							icon: <RotateCcwIcon />, color: 'warning',
						},
						{
							label: 'Total Paid',
							value: currencyFormatter.format(Number(billingdata.paid) || 0),
							icon: <CheckCircleIcon />, color: 'info',
						},
						{
							label: 'Outstanding',
							value: currencyFormatter.format(Number(billingdata.outstanding) || 0),
							icon: <AlertCircleIcon />, color: 'danger',
						},
						{
							label: 'Balance',
							value: currencyFormatter.format((Number(billingdata.payable) || 0) - (Number(billingdata.paid) || 0)),
							icon: <DollarSignIcon />, color: 'success',
						},
					].map((card, idx) => (
						<div className="col-md-2 col-6" key={card.label}>
							<div className="card shadow border-0 h-100">
								<div className="card-body d-flex flex-column align-items-center justify-content-center p-3">
									<div className={`rounded-circle bg-${card.color} bg-opacity-10 d-flex align-items-center justify-content-center mb-2`} style={{ width: 48, height: 48 }}>
										<span className={`text-${card.color} fs-4`}>{card.icon}</span>
									</div>
									<div className="fw-semibold text-secondary small mb-1 text-uppercase" style={{ letterSpacing: 1 }}>{card.label}</div>
									<div className="fw-bold fs-5 text-dark">{card.value}</div>
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="mx-2 mt-5">
					<div style={{ overflowX: 'auto' }}>
						<PrimeTable
							column={columns}
							data={previousServices}
							serverSideFiltering={false}
							handleSeverSideProcessing={false} />
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
					   return <>
						   <Button
							   size='sm'
							   variant="danger"
							   onClick={() => {
								   if (disableActions) toast.error(getDisabledReason());
								   else handleRefundAll();
							   }}
							   disabled={disableActions}
						   >
							   {submitting && <Spinner size='sm' />}  <RefreshCwIcon /> {" "}
							   {submitting ? "refunding" : " Refund All"}
						   </Button>
						   <Button
							   size='sm'
							   variant="warning"
							   onClick={() => {
								   if (disableActions) toast.error(getDisabledReason());
								   else handleWriteOff();
							   }}
							   disabled={disableActions}
						   >
							   <EditIcon />  {" "}
							   Write Off
						   </Button>
						   <Button
							   size='sm'
							   variant="primary"
							   onClick={() => {
								   if (disableActions) toast.error(getDisabledReason());
								   else handleOtherAction();
							   }}
							   disabled={disableActions}
						   >
							   <SettingsIcon />  {" "}
							   Other Action
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
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowRefundAllModal(false)} disabled={submitting}>
							Cancel
						</Button>
						<Button variant="primary" onClick={handleRefundAllSubmit} disabled={submitting || !PaymentMode}>
							{submitting ? <Spinner size="sm" /> : null} Refund All
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);

	}
}