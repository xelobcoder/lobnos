import { Row, Spinner, Modal, Button } from "react-bootstrap";
import { useContext, useState } from "react";
import { BillingContext } from "./BillingContext";
import Select from "react-select";
import { toast } from "react-toastify";
import { Billingdefaultdata, organizationOptions, urgencyOptions, ValidateAndSubmitBillingInformation } from "../../../lib/billingLib";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import ReceiptOptionsModal from "../ReceiptOptionsModal";
import { RiMoneyDollarCircleLine, RiCloseLine, RiPrinterLine, RiStore3Line } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { plsEncryption } from "../../../lib/encryption";

export default function BillingPageAdditionalInformation({ patientid, billingid }) {
	const [showMoreBtn, setShowMoreBtn] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const { billingdata, updateBilling, recalculateTotalBill } = useContext(BillingContext);
	const { applicationsettings } = useApplicationSettings();
	const branchid = applicationsettings.branchid;
	const { employeeid } = applicationsettings.user;
	const [showReceiptOptionsModal, setShowReceiptptionsModal] = useState(false);
	const [generatedBillingid, setGeneratedBillingid] = useState(billingdata.billingid);
	const [showChoiceModal, setShowChoiceModal] = useState(false);
	const closeReceiptModal = () => setShowReceiptptionsModal(false);
	const router = useRouter();

	const handleModalClose = () => {
		setShowChoiceModal(false);
		updateBilling(Billingdefaultdata);
	};

	const checkButtonDisabled = (billingdata) => {
		const amountPaid = parseFloat(billingdata.paid);
		const amountPayable = parseFloat(billingdata.payable || 0);

		if (amountPayable === 0 && amountPaid > 0) {
			return true;
		}

		if (amountPayable === 0 && amountPaid === 0) {
			console.log('Hit');
			return false;
		}

		if (amountPaid > amountPayable && amountPayable !== 0) {
			return true;
		}

		return amountPaid <= 0 || amountPaid > amountPayable ? true : false;
	};




	const updatePaymentMode = (selectedOption) => {
		const { label, value } = selectedOption;
		if (label === "free") {
			updateBilling({ ...billingdata, paymentmode: value, testcost: 0, cost: 0, payable: 0, outstanding: 0, isFree: true });
		} else {
			updateBilling({ ...billingdata, paymentmode: value });
		}
	};

	const handleBillingSuccess = (billingid, message) => {
		toast.success(message || "Billing successful", {
			position: 'top-right',
			autoClose: 3000
		});
		setGeneratedBillingid(billingid);
		setShowChoiceModal(true);
		// Remove the setTimeout redirect
	};

	const handleUserChoice = (choice) => {
		setShowChoiceModal(false);
		if (choice === 'print') {
			setShowReceiptptionsModal(true);
		} else {
			// Handle navigation and state reset for 'sales' choice
			updateBilling(Billingdefaultdata);
			router.push(`/billing/sales/branches/${plsEncryption(branchid.toString())}`);
		}
	};

	const handleSubmit = async () => {
		if (isSaving) return;

		try {
			setIsSaving(true);
			const dataToBeUploaded = {
				...billingdata,
				employeeid,
				branchid,
				isConditionsUnderstood: false,
				patientid
			};

			const isServiceOnly = parseInt(billingdata.isServiceOnly) === 1;
			const method = billingid ? 'PUT' : 'POST';

			const response = await ValidateAndSubmitBillingInformation(
				dataToBeUploaded,
				method,
				billingid,
				isServiceOnly
			);

			if (!response || typeof response !== 'object') {
				throw new Error('Invalid server response');
			}

			const { status, message, billingid: newBillingId } = response;

			// Handle pending verification
			if (status === 'pending verification') {
				const userConfirmed = window.confirm(
					`${message}\n\nDo you want to proceed understanding all possible implications?`
				);

				if (userConfirmed) {
					setIsSaving(true);
					const verificationResponse = await ValidateAndSubmitBillingInformation(
						{ ...dataToBeUploaded, isConditionsUnderstood: true },
						method,
						billingid,
						isServiceOnly
					);

					if (verificationResponse?.status === true ||
						verificationResponse?.status === 'success') {
						handleBillingSuccess(
							verificationResponse.billingid,
							verificationResponse.message
						);
					}
				}
				return;
			}

			// Handle success
			if (status === true || status === 'success') {
				if (!newBillingId) {
					throw new Error('No billing ID received from server');
				}
				handleBillingSuccess(newBillingId, message);
				return;
			}

			// Handle failure
			if (status == "error" || status == "failed" || status == false) {
				toast.error(message || 'Billing failed', {
					position: 'top-right',
					autoClose: 5000
				});
			}

		} catch (error) {
			toast.error(error?.message || 'An unexpected error occurred');
		} finally {
			setIsSaving(false);
		}
	};




	return (
		<Row>
			<div>
				<section>
					<div className="text-sm p-2 pls-color">
						<div >
							<div>
								<label className="pls-label">Referal Type</label>
								<div >
									<Select
										className="react-select-container"
										classNamePrefix="react-select"
										isDisabled={[2, 3, 5].includes(billingdata.billingSource)}
										value={{ label: billingdata.type, value: billingdata.type }}
										onChange={(selectedOption) => updateBilling({ ...billingdata, type: selectedOption.value })}
										options={organizationOptions}
									/>
								</div>
							</div>

							<div>
								<label className="pls-label text-sm">Select Urgency</label>
								<Select
									className="react-select-container"
									classNamePrefix="react-select"
									value={{ label: billingdata.status, value: billingdata.status }}
									onChange={(selectedOption) => updateBilling({ ...billingdata, status: selectedOption.value })}
									options={urgencyOptions}
								/>
							</div>

							<div>
								<label className="pls-label text-sm">Organization Name</label>
								<Select
									className="react-select-container"
									classNamePrefix="react-select"
									isDisabled={billingdata.type != "organization" || [2, 6].includes(billingdata.billingSource)}
									placeholder="Search organization here"
									onChange={(newValue) => {
										updateBilling({ ...billingdata, organizationId: newValue?.id });
									}}
									options={billingdata.organizationData}
									getOptionLabel={(option) => option.name}
									getOptionValue={(option) => option.id}
								/>
							</div>
						</div>
						<div >
							<div >
								<label className="pls-label text-sm" >Select Clinician</label>
								<Select
									className="react-select-container"
									classNamePrefix="react-select"
									isDisabled={billingdata.type != "clinician" || [2, 6].includes(billingdata.billingSource)}
									placeholder="Search clinician"
									getOptionLabel={(option) => option.name}
									getOptionValue={(option) => option.id}
									onChange={(newValue) => {
										updateBilling({ ...billingdata, clinicianId: newValue?.id });
									}}
									options={billingdata.clinicianData}
								/>
							</div>

							<div className="form-group">
								<label className="pls-label text-sm">Payment Mode</label>
								<Select
									className="react-select-container"
									classNamePrefix="react-select"
									onChange={(selectedOption) => {
										updatePaymentMode(selectedOption);
									}}
									options={billingdata.paymentmodeData.map((item) => ({
										value: item.KeyID,
										label: item.PaymentMode,
									}))}
								/>
							</div>

							<div>
								<label className="pls-label text-sm">Advance Payment</label>
								<input
									type="number"
									className="custom-input"
									value={billingdata.paid}
									onChange={(e) => {
										recalculateTotalBill({ ...billingdata, paid: e.target.value })
									}}

								/>
							</div>
						</div>
					</div>
				</section>
				<hr />
				<div className="mx-2">
					<div className="mt-2 d-flex justify-content-end">
						<button
							disabled={checkButtonDisabled(billingdata)}
							className="btn btn-success mx-2"
							onClick={(ev) => { handleSubmit() }}>
							{isSaving && <Spinner size="sm" />}<RiMoneyDollarCircleLine size={18} /> Bill Client
						</button>
						<button
							onClick={(ev) => {
								updateBilling(Billingdefaultdata);
							}}
							className="btn btn-danger">
							<RiCloseLine size={18} /> Cancel
						</button>
					</div>
				</div>
			</div>

			{showReceiptOptionsModal && <ReceiptOptionsModal open={showReceiptOptionsModal} close={closeReceiptModal}
				patientid={patientid}
				billingid={generatedBillingid} />}

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
