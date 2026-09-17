import { Row, Spinner, Modal, Button, Alert } from "react-bootstrap";
import React, { useContext, useState, useEffect } from "react";
import { MultiBillingContext } from "./MultiBillingContext";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import ReceiptOptionsModal from "../ReceiptOptionsModal";
import { RiMoneyDollarCircleLine, RiCloseLine, RiPrinterLine, RiStore3Line, RiMapPinLine } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { plsEncryption } from "../../../lib/encryption";
import { MultiBillingData, defaultMultiBillingData, TestCartItem } from '../../../lib/Multi/MultiTypes';
import MultiPayment from './MultiPayment';
import { MultiValidateAndSubmitBillingInformation } from "../../../lib/Multi/multiBillingValidation";
import { toast } from "react-toastify";
import { calculateCorrectionalAdjustment } from '../../../lib/Multi/correctionUtils';
import { currencyFormatter } from "../../Auth/customFetch";


export default function MultiBillingPageAdditionalInformation({ showChoiceModal: forceShowChoiceModal = false, onBillingSuccess, handlesubmit, generatedBillingId, onDetermineSampleCollection }: { showChoiceModal?: boolean, onBillingSuccess?: (billingid: string, message?: string) => void, handlesubmit?: (data: MultiBillingData) => Promise<any>, generatedBillingId?: string, onDetermineSampleCollection?: () => void }) {
	// Outstanding Write-Off Dialog State
	const [showOutstandingDialog, setShowOutstandingDialog] = useState(false);
	const [outstandingInfo, setOutstandingInfo] = useState<{
		outstandingToWriteOff: number,
		previousPaid: number,
		currentPayable: number,
		newPayments: number,
		totalPaid: number
	} | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const context = useContext(MultiBillingContext);
	if (!context) throw new Error('MultiBillingContext is undefined');
	const { billingdata, setBillingData } = context;
	const { billingid, patientid } = billingdata;
	const { applicationsettings } = useApplicationSettings();
	const branchid = applicationsettings.branchid;
	const { employeeid, role } = applicationsettings.user;
	const [showReceiptOptionsModal, setShowReceiptOptionsModal] = useState(false);
	const [generatedBillingIdState, setGeneratedBillingIdState] = useState<string | undefined>(generatedBillingId);
	const [showChoiceModal, setShowChoiceModal] = useState(forceShowChoiceModal || false);

	useEffect(() => {
		if (generatedBillingId && generatedBillingId !== generatedBillingIdState) {
			setGeneratedBillingIdState(generatedBillingId);
			setShowChoiceModal(true);
		}
	}, [generatedBillingId]);
	const [userAgreedToWriteOff, setUserAgreedToWriteOff] = useState(false);
	const [adminWriteOffInternalLoss, setAdminWriteOffInternalLoss] = useState(false);
	const closeReceiptModal = () => {
		setShowReceiptOptionsModal(false);
		// Reset billing data after receipt modal is closed
		setBillingData(defaultMultiBillingData);
	};
	const router = useRouter();

	const handleModalClose = () => {
		setShowChoiceModal(false);
		// Reset billing data after successful billing
		setBillingData(defaultMultiBillingData);
		setUserAgreedToWriteOff(false);
	};



	const handleUserChoice = (choice: string) => {
		setShowChoiceModal(false);
		if (choice === 'print') {
			setShowReceiptOptionsModal(true);
		} else if (choice === 'home-collection') {
			onDetermineSampleCollection?.();
		} else {
			// Reset billing data after successful billing
			setBillingData(defaultMultiBillingData);
			router.push(`/crm/customers`);
		}
	};

	// This function can be called from parent or billing logic to show the modal
	const handleBillingSuccess = (billingid: string, message?: string) => {
		setGeneratedBillingIdState(billingid);
		setShowChoiceModal(true);
		setBillingData(defaultMultiBillingData);
		if (onBillingSuccess) onBillingSuccess(billingid, message);
	};



	return (
		<Row>
			<div>
				<section>
					<div className="form-group">
						<MultiPayment handlesubmit={handlesubmit} />
					</div>
				</section>
				<hr />
			</div>
			{showReceiptOptionsModal && <ReceiptOptionsModal open={showReceiptOptionsModal} close={closeReceiptModal}
				patientid={Number(patientid)}
				billingid={generatedBillingIdState ? Number(generatedBillingIdState) : 0} />}
			{showChoiceModal && (
				<Modal
					show={showChoiceModal}
					onHide={handleModalClose}
					backdrop="static"
					keyboard={false}
					animation={false}
					size="lg"
					dialogClassName="mt-4"
				>
					<Modal.Header closeButton>
						<Modal.Title className="text-success">✓ Billing Complete</Modal.Title>
					</Modal.Header>
					<Modal.Body className="text-center">
						<div className="mb-4">
							<div className="display-4 fw-bold text-primary mb-2">{generatedBillingIdState}</div>
							<p className="text-muted mb-4">Billing ID</p>
						</div>
						<p className="mb-4">What would you like to do next?</p>
						<div className="d-flex justify-content-center gap-3">
							<Button
								variant="primary"
								onClick={() => handleUserChoice('print')}
								className="d-flex align-items-center gap-2 px-4 py-2"
							>
								<RiPrinterLine size={18} />
								Print Receipt
							</Button>
							<Button
								variant="secondary"
								onClick={() => handleUserChoice('customers')}
								className="d-flex align-items-center gap-2 px-4 py-2"
							>
								<RiStore3Line size={18} />
								Return to Customers
							</Button>
							<Button
								variant="outline-primary"
								onClick={() => handleUserChoice('home-collection')}
								className="d-flex align-items-center gap-2 px-4 py-2"
							>
								<RiMapPinLine size={18} />
								Determine Sample Collection
							</Button>
						</div>
					</Modal.Body>
				</Modal>
			)}
		</Row>
	);
}