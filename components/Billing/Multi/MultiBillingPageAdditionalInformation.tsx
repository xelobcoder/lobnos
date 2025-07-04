import { Row, Spinner, Modal, Button, Alert } from "react-bootstrap";
import { useContext, useState } from "react";
import { MultiBillingContext } from "./MultiBillingContext";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import ReceiptOptionsModal from "../ReceiptOptionsModal";
import { RiMoneyDollarCircleLine, RiCloseLine, RiPrinterLine, RiStore3Line } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { plsEncryption } from "../../../lib/encryption";
import { MultiBillingData, defaultMultiBillingData } from '../../../lib/Multi/MultiTypes';
import MultiPayment from './MultiPayment';
import { MultiValidateAndSubmitBillingInformation } from "../../../lib/Multi/multiBillingValidation";
import { toast } from "react-toastify";


export default function MultiBillingPageAdditionalInformation() {
	// Outstanding Write-Off Dialog State
	const [showOutstandingDialog, setShowOutstandingDialog] = useState(false);
	const [outstandingInfo, setOutstandingInfo] = useState<{ outstandingToWriteOff: number, previousPaid: number, currentPayable: number } | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const context = useContext(MultiBillingContext);
	if (!context) throw new Error('MultiBillingContext is undefined');
	const { billingdata, setBillingData } = context;
	const { billingid, patientid } = billingdata;
	const { applicationsettings } = useApplicationSettings();
	const branchid = applicationsettings.branchid;
	const { employeeid } = applicationsettings.user;
	const [showReceiptOptionsModal, setShowReceiptOptionsModal] = useState(false);
	const [generatedBillingid, setGeneratedBillingid] = useState<string | undefined>(undefined);
	const [showChoiceModal, setShowChoiceModal] = useState(false);
	const closeReceiptModal = () => setShowReceiptOptionsModal(false);
	const router = useRouter();

	const handleModalClose = () => {
		setShowChoiceModal(false);
		setBillingData(defaultMultiBillingData);
	};

	const checkButtonDisabled = (billingdata: MultiBillingData) => {
		const amountPayable = Number(billingdata.amountPayable) || 0;
		const previousPaid = billingdata.previousRecordsSummary?.paid;
		if (billingdata.isAdjustment === 1 && billingdata.adjustmentType === 'correction' && previousPaid) return false;
		const amountPaid = typeof billingdata.paid === 'number'
			? billingdata.paid
			: (Array.isArray(billingdata.payments)
				? billingdata.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
				: 0);

		if (amountPayable === 0 && amountPaid > 0) return true;
		if (amountPayable === 0 && amountPaid === 0) return false;
		if (amountPaid > amountPayable && amountPayable !== 0) return true;
		return amountPaid <= 0 || amountPaid > amountPayable ? true : false;
	};

	const handleUserChoice = (choice: string) => {
		setShowChoiceModal(false);
		if (choice === 'print') {
			setShowReceiptOptionsModal(true);
		} else {
			setBillingData(defaultMultiBillingData);
			router.push(`/billing/sales/branches/${plsEncryption(branchid.toString())}`);
		}
	};

	const handleBillingSuccess = (billingid: string, message?: string) => {
		setGeneratedBillingid(billingid);
		setShowChoiceModal(true);
		setBillingData(defaultMultiBillingData);
	};

	const handleSubmit = async (writeOffConfirmed = false) => {
		if (isSaving) return;

		if (!billingdata || !billingdata.patientid) {
			return toast.error('Patient ID is required to submit billing');
		}

		if (billingdata.isAdjustment === 1 && !billingdata.adjustmentType) {
			return toast.error('Adjustment type is required for adjustments');
		}

		if (billingdata.isAdjustment === 1 && !billingdata.adjustmentReason && billingdata.adjustmentType == 'correction') {
			return toast.error('Adjustment reason is required for correction adjustments');
		}

		const totalPayments = billingdata.paid;
		const amountPayable = Number(billingdata.amountPayable) || 0;
		// Adjustment Correction Outstanding Logic (frontend check)
		if (
			billingdata.isAdjustment === 1 &&
			billingdata.adjustmentType === 'correction' &&
			billingdata.previousRecordsSummary &&
			billingdata.previousRecordsSummary.paid !== undefined &&
			billingdata.previousRecordsSummary.payable !== undefined
		) {
			// Always show the danger modal for any correction adjustment, regardless of logic
			const prevPaid = Number(billingdata.previousRecordsSummary.paid) || 0;
			const prevPayable = Number(billingdata.previousRecordsSummary.payable) || 0;
			let outstandingToWriteOff = 0;
			let isExcess = false;
			if (prevPaid > amountPayable) {
				outstandingToWriteOff = prevPaid - amountPayable;
				isExcess = true;
			} else if (prevPaid < amountPayable) {
				outstandingToWriteOff = amountPayable - prevPaid;
			}
			setOutstandingInfo({
				outstandingToWriteOff,
				previousPaid: prevPaid,
				currentPayable: amountPayable
			});
			setShowOutstandingDialog(true);
			if (isExcess) {
				toast.warn('Previous payment is greater than the current payable. You need to balance the client account.');
			} else if (outstandingToWriteOff > 0) {
				toast.error('You are about to write off an outstanding balance. This action is irreversible and will affect the client\'s financial record. Proceed with caution.');
			}
			return;
		}
		if (totalPayments !== amountPayable && billingdata.isAdjustment !== 1) return;


		try {
			setIsSaving(true);
			const dataToBeUploaded = {
				...billingdata,
				employeeid: employeeid,
				branchid: branchid,
				isConditionsUnderstood: false,
				isPromo: billingdata.isPromo ?? false,
				promoCodeId: billingdata.promoDetails?.id || billingdata?.promoId,
				promoCode: billingdata.promoDetails?.code || '',
				patientid: Number(patientid),
				payments: billingdata.payments,
				additionalinformation: billingdata.additionalInfo ?? '',
				isAdjustment: typeof billingdata.isAdjustment === 'boolean' ? (billingdata.isAdjustment ? 1 : 0) : billingdata.isAdjustment,
				adjustmentType: billingdata.adjustmentType || 'addition',
				adjustmentReason: billingdata.adjustmentReason || '',
				entitytype: billingdata.entitytype || null,
				writeOffOutstanding: writeOffConfirmed ? true : undefined,
			} as any;

			console.log('Submitting billing:', dataToBeUploaded);

			const response = await MultiValidateAndSubmitBillingInformation(
				dataToBeUploaded,
				billingid ? Number(billingid) : undefined
			);

			console.log('Backend response:', response);

			if (response && response.status === 'outstanding_confirmation_required') {
				setOutstandingInfo({
					outstandingToWriteOff: response.outstandingToWriteOff,
					previousPaid: response.previousPaid,
					currentPayable: response.currentPayable
				});
				setShowOutstandingDialog(true);
				setIsSaving(false);
				return;
			}

			if (!response || typeof response !== 'object') {
				setIsSaving(false);
				return;
			}
			const { status, message, billingid: newBillingId } = response;
			if (status === 'pending verification') {
				setIsSaving(false);
				return;
			}
			if (status === true || status === 'success') {
				if (!newBillingId) {
					setIsSaving(false);
					return;
				}
				setGeneratedBillingid(newBillingId);
				setShowReceiptOptionsModal(true);
				setIsSaving(false);
				return;
			}
			setIsSaving(false);
		} catch (error) {
			setIsSaving(false);
		}
	};

	return (
		<Row>
			<div>
				<section>
					<div className="text-sm p-2 pls-color">
						<div className="form-group">
							<label className="pls-label text-sm">Payment(s)</label>
							<MultiPayment/>
							{Array.isArray(billingdata.payments) && billingdata.payments.length > 0 && (
								<div className="mt-1 small">
									Total: <b>{billingdata.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)}</b>
									{billingdata.amountPayable && billingdata.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) !== Number(billingdata.amountPayable) && (
										<span className="text-danger ms-2">Total must match amount payable</span>
									)}
								</div>
							)}
						</div>
						<div className="mt-2">
							<label className="pls-label text-sm">Total Payable</label>
							<div className="fw-bold text-success" style={{ fontSize: '1.1em' }}>
								{typeof billingdata.amountPayable === 'number'
									? billingdata.amountPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
									: ''}
							</div>
						</div>
					</div>
				</section>
				<hr />
				<div className="mb-2">
					<label htmlFor="additionalInfo" className="form-label fw-bold">Additional Information</label>
					<textarea
						id="additionalInfo"
						className="form-control"
						rows={2}
						placeholder="Enter any additional billing notes or information here..."
						value={billingdata.additionalInfo ?? ''}
						onChange={e => context.setBillingData({ ...billingdata, additionalInfo: e.target.value })}
					/>
				</div>
				<div className="mx-2">
					<div className="mt-2 d-flex justify-content-end">
						<button
							disabled={checkButtonDisabled(billingdata)}
							className="btn btn-success mx-2"
							onClick={() => { handleSubmit() }}>
							{isSaving && <Spinner size="sm" />}<RiMoneyDollarCircleLine size={18} /> Bill Client
						</button>
						{/* Outstanding Write-Off Dialog */}
						<Modal show={showOutstandingDialog} onHide={() => setShowOutstandingDialog(false)} centered backdrop="static" keyboard={false}>
							<Modal.Header closeButton className="bg-danger text-white">
								<Modal.Title>Danger: Outstanding Write-Off</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								{outstandingInfo && (
									<>
										<Alert variant={
											outstandingInfo.previousPaid > outstandingInfo.currentPayable ? "warning" :
												outstandingInfo.previousPaid < outstandingInfo.currentPayable ? "danger" : "info"
										}>
											<div>
												<b>Previous Paid:</b> {outstandingInfo.previousPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br />
												<b>Current Payable:</b> {outstandingInfo.currentPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br />
												<b>{outstandingInfo.previousPaid > outstandingInfo.currentPayable ? 'Excess to Balance' : 'Outstanding to Write Off'}:</b> <span className={outstandingInfo.previousPaid > outstandingInfo.currentPayable ? "text-success" : "text-danger"}>{Math.abs(outstandingInfo.outstandingToWriteOff).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
											</div>
											{outstandingInfo.previousPaid > outstandingInfo.currentPayable ? (
												<div className="mt-3 fw-bold text-warning">Notice: Previous payment is greater than the current payable. You need to balance the client account.</div>
											) : outstandingInfo.previousPaid < outstandingInfo.currentPayable ? (
												<>
													<div className="mt-3 fw-bold text-danger">Warning: Proceeding will write off the outstanding amount. This action is irreversible and will affect the client's financial record.</div>
													<div className="mt-2">Are you sure you want to continue?</div>
												</>
											) : (
												<div className="mt-3 fw-bold text-info">No outstanding or excess. Payments are balanced.</div>
											)}
										</Alert>
									</>
								)}
							</Modal.Body>
							<Modal.Footer>
								<Button variant="secondary" onClick={() => setShowOutstandingDialog(false)}>
									Cancel
								</Button>
								<Button variant="danger" onClick={() => {
									setShowOutstandingDialog(false);
									handleSubmit(true);
								}}>
									Yes, Write Off & Continue
								</Button>
							</Modal.Footer>
						</Modal>
						<button
							onClick={() => {
								setBillingData(defaultMultiBillingData);
							}}
							className="btn btn-danger">
							<RiCloseLine size={18} /> Cancel
						</button>
					</div>
				</div>
			</div>
			{showReceiptOptionsModal && <ReceiptOptionsModal open={showReceiptOptionsModal} close={closeReceiptModal}
				patientid={Number(patientid)}
				billingid={generatedBillingid ? Number(generatedBillingid) : 0} />}
			{showChoiceModal && (
				<Modal
					show={showChoiceModal}
					onHide={handleModalClose}
					centered
					backdrop="static"
					keyboard={false}
				>
					<Modal.Header closeButton>
						<Modal.Title>Billing Complete</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>What would you like to do next?</p>
						<div className="d-flex justify-content-end gap-2">
							<Button
								variant="primary"
								onClick={() => handleUserChoice('print')}
								className="d-flex align-items-center gap-2"
							>
								<RiPrinterLine size={18} />
								Print Receipt
							</Button>
							<Button
								variant="secondary"
								onClick={() => handleUserChoice('sales')}
								className="d-flex align-items-center gap-2"
							>
								<RiStore3Line size={18} />
								Go to Sales
							</Button>
						</div>
					</Modal.Body>
				</Modal>
			)}
		</Row>
	);
}