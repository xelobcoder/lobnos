import { Row, Spinner, Modal, Button, Alert } from "react-bootstrap";
import { useContext, useState } from "react";
import { MultiBillingContext } from "./MultiBillingContext";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import ReceiptOptionsModal from "../ReceiptOptionsModal";
import { RiMoneyDollarCircleLine, RiCloseLine, RiPrinterLine, RiStore3Line } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { plsEncryption } from "../../../lib/encryption";
import { MultiBillingData, defaultMultiBillingData, TestCartItem } from '../../../lib/Multi/MultiTypes';
import MultiPayment from './MultiPayment';
import { MultiValidateAndSubmitBillingInformation } from "../../../lib/Multi/multiBillingValidation";
import { toast } from "react-toastify";
import { calculateCorrectionalAdjustment } from '../../../lib/Multi/correctionUtils';
import { currencyFormatter } from "../../Auth/customFetch";


export default function MultiBillingPageAdditionalInformation() {
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
	const [generatedBillingid, setGeneratedBillingid] = useState<string | undefined>(undefined);
	const [showChoiceModal, setShowChoiceModal] = useState(false);
	const [userAgreedToWriteOff, setUserAgreedToWriteOff] = useState(false);
	const [adminWriteOffInternalLoss, setAdminWriteOffInternalLoss] = useState(false);
	const closeReceiptModal = () => setShowReceiptOptionsModal(false);
	const router = useRouter();

	const handleModalClose = () => {
		setShowChoiceModal(false);
		setBillingData(defaultMultiBillingData);
		setUserAgreedToWriteOff(false);
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

	

	return (
		<Row>
			<div>
				<section>
					<div className="form-group">
						<MultiPayment />
					</div>
				</section>
				<hr />

				
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