import { Row, Spinner } from "react-bootstrap";
import { MoneyRounded, Clear } from "@mui/icons-material";
import { useContext, useState } from "react";
import { BillingContext } from "./BillingContext";
import Select from "react-select";
import { toast } from "react-toastify";
import { Billingdefaultdata, organizationOptions, urgencyOptions, ValidateAndSubmitBillingInformation } from "../../../lib/billingLib";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import ReceiptOptionsModal from "../ReceiptOptionsModal";

export default function BillingPageAdditionalInformation({ patientid, billingid }) {
	const [showMoreBtn, setShowMoreBtn] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const { billingdata, updateBilling, recalculateTotalBill } = useContext(BillingContext);
	const { applicationsettings } = useApplicationSettings();
	const branchid = applicationsettings.branchid;
	const { employeeid, username, role } = applicationsettings.user;
	const [payment, setPayment] = useState({ amount: 0, mode: "", concession: "" });
	const [showReceiptOptionsModal, setShowReceiptptionsModal] = useState(false);

	const closeReceiptModal = () => setShowReceiptptionsModal(false);

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

	const handleSubmit = async (ev) => {
		try {
			setIsSaving(true);
			const dataToBeUploaded = { ...billingdata, employeeid, branchid, patientid };
			const isServiceOnly = parseInt(billingdata.isServiceOnly) === 1 ? true : false;
			const method = billingid ? 'PUT' : 'POST';
			const data = await ValidateAndSubmitBillingInformation(dataToBeUploaded, method, billingid, isServiceOnly);
			setIsSaving(false);
			console.log(data)
			if (typeof data === "object") {
				const { status, message } = data;
				if (status == true || status == "success") {
					toast.success(message || "Billing  successful");
					setShowReceiptptionsModal(true)
				} else {
					toast.error(message || status)
				}
			}
		} catch (err) {
			setIsSaving(false);
			toast.error(err || "something wrong occured");
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
							{isSaving && <Spinner size="sm" />}<MoneyRounded /> Bill Client
						</button>
						<button
							onClick={(ev) => {
								updateBilling(Billingdefaultdata);
							}}
							className="btn btn-danger">
							<Clear /> Cancel
						</button>
					</div>
				</div>
			</div>

			{showReceiptOptionsModal && <ReceiptOptionsModal open={showReceiptOptionsModal} close={closeReceiptModal} />}
		</Row>
	);
}
