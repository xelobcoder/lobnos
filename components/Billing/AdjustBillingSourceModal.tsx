import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { BillingSourceOption } from "./BilledClientsView";
import ClinicianFiltering from "../accessories/SectorFileringComponents/ClinicianFiltering";
import InsuranceOrganizationFiltering from "../accessories/SectorFileringComponents/InsuranceOrganizationFiltering";
import OrganizationalBillingSourceSearch from "./BillingContextComponents/BillingSourceComponents/OrganizationBillingSearch";
import { customPost, reactSelectCustomStyles } from "../Auth/customFetch";
import { billingSource } from "../../lib/billingLib";
import { useApplication } from "../Auth/useApplicationContext";
import { toast } from "react-toastify";





interface AdjustBillingSourceModalProps {
	show: boolean;
	onClose: () => void;
	onContinue: () => void;
	options: BillingSourceOption[];
	billingid: number | null;
}

interface TypeEntity {
	entity_type: string;
	entity_id: number;
}

type SelectedEntity = TypeEntity | null;

type EntitySeelction = { id: number;[key: string]: any }

const AdjustBillingSourceModal: React.FC<AdjustBillingSourceModalProps> = ({
	show,
	onClose,
	onContinue,
	billingid,
}) => {
	const [selectedBillingSource, setSelectedBillingSource] = React.useState<BillingSourceOption | null>(null);
	const [selectedEntity, setSelectedEntity] = React.useState<SelectedEntity | null>(null);
	const [claimCode, setClaimCode] = React.useState<string>("");
	const [pendingAction, setPendingAction] = React.useState<string>("");
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const branchid = useApplication().branchid;
	const employeeId = useApplication()?.user.employeeid;

	React.useEffect(() => {
		if (show) {
			setSelectedBillingSource(null);
			setSelectedEntity(null);
			setClaimCode("");
			setPendingAction("");
			setIsLoading(false);
		}
	}, [show]);

	const updateValuesToContext = (value: EntitySeelction, target: 'phis' | 'organization' | 'clinician') => {
		if (!value) return;
		setSelectedEntity({ entity_type: target, entity_id: value.id });
	};

	const handleSelectedEntityInsurance = (value: EntitySeelction | any) => {
		console.log("Selected Insurance:", value);
		updateValuesToContext(value, 'phis');
	};

	const handleSelectedEntityClinician = (value: EntitySeelction) => {
		updateValuesToContext(value, 'clinician');
	};

	const handleSelectedEntityOrganization = (value: EntitySeelction) => {
		updateValuesToContext(value, 'organization');
	};
	
	const handleConfirmChange = async () => {
		if (!selectedBillingSource || !billingid) return;
		
		if (selectedBillingSource.value > 1) {
			if (selectedBillingSource.value === 4 && !claimCode) return;
			if (selectedBillingSource.value !== 4 && !selectedEntity) return;
		}
		
		setIsLoading(true);
		setPendingAction("");
		try {
			const payload: any = {
				branchid,
				billingid,
				employeeId,
			};

			if (selectedBillingSource.value > 1) {
				if (selectedEntity) {
					payload.entity_type = selectedEntity.entity_type;
					payload.entity_id = selectedEntity.entity_id;
				}
				if (selectedBillingSource.value === 4 && claimCode) {
					payload.claimCode = claimCode;
				}
			} else {
				payload.entity_type = 'walkin';
				payload.entity_id = 0;
			}

			const response = await customPost("billing/correction/source", "POST", payload);
			setPendingAction(response?.message || "Change submitted.");
			const {success,message} = response;
			if (success == true){
				toast.success(message || "Billing source updated successfully.");
				setTimeout(() => {
					onContinue();
				}, 500);
			} else {
				toast.error(message || "Failed to update billing source.");
				setPendingAction("Failed to update billing source.");
			}

		} catch (err) {
			setPendingAction("Error submitting change.");
		}
		setIsLoading(false);
	};

	const handleUrgencyChange = () => { };
	const urgencyOptions = [];
	const isClient = true;

	const formatOptionLabel = (option: BillingSourceOption) => (
		<div className="d-flex align-items-center">
			<span className="me-2">{option.label}</span>
			{option.value === 1 && <span className="badge bg-secondary">Walk-in</span>}
			{option.value === 2 && <span className="badge bg-primary">Organization</span>}
			{option.value === 3 && <span className="badge bg-success">Insurance</span>}
			{option.value === 4 && <span className="badge bg-warning">Claim Code</span>}
			{option.value === 6 && <span className="badge bg-info">Clinician</span>}
		</div>
	);

	console.log("Selected Billing Source:", selectedBillingSource ? selectedBillingSource.value : null);

	const isButtonDisabled = () => {
		if (!selectedBillingSource || isLoading) return true;
		if (selectedBillingSource.value === 1) return false;
		if (selectedBillingSource.value === 4) return !claimCode;
		return !selectedEntity;
	};

	return (
		<Modal show={show} onHide={onClose} backdrop="static" size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Adjust/Correct Billing Source</Modal.Title>
			</Modal.Header>
			<Modal.Body>
                <p className="alert alert-info">This corrects source attribution only; existing service prices, receipts and financial totals are not recalculated. The transaction is locked after correction. NHIS conversion requires its separately verified membership and claim workflow.</p>
				<label>Select Billing Source</label>
				<div className="mb-4">
					<Select
						options={billingSource.filter(source => [1, 2, 3, 6].includes(source.value))}
						value={selectedBillingSource}
						onChange={(option) => {
							setSelectedBillingSource(option as BillingSourceOption);
							setSelectedEntity(null);
							setClaimCode("");
						}}
						placeholder="Choose billing source..."
						isSearchable={false}
						className="mb-2"
						formatOptionLabel={formatOptionLabel}
						styles={reactSelectCustomStyles}
					/>
				</div>

				{/* Conditional UI for selectedBillingSource.value*/}
				{selectedBillingSource && typeof selectedBillingSource.value === "number" && selectedBillingSource.value > 1 && (
					<div className="p-2 mb-2">
						{selectedBillingSource?.value === 2 && (
							<OrganizationalBillingSourceSearch updatefunction={handleSelectedEntityOrganization} />
						)}
						{selectedBillingSource?.value === 3 && (
							<Form.Group>
								<Form.Label className="small text-muted">Search Organization</Form.Label>
								{isClient && (
									<div className="position-relative">
										<InsuranceOrganizationFiltering onSelect={handleSelectedEntityInsurance} isDisabled={false} />
									</div>
								)}
							</Form.Group>
						)}
						{selectedBillingSource.value === 4 && (
							<Form.Group>
								<Form.Label className="small text-muted">Claim Code</Form.Label>
								<Form.Control
									type="text"
									placeholder="Enter claim code"
									className="rounded-3 border-light"
									size="sm"
									value={claimCode}
									onChange={e => setClaimCode(e.target.value)}
								/>
							</Form.Group>
						)}
						{selectedBillingSource.value === 6 && (
							<Form.Group>
								<Form.Label className="small text-muted">Search Clinician</Form.Label>
								<div className="position-relative">
									<ClinicianFiltering isBulk={true} onSelect={handleSelectedEntityClinician} />
								</div>
							</Form.Group>
						)}
					</div>
				)}
				{selectedBillingSource?.value === 1 && (
					<div>
						<label className="pls-label">Referral Type</label>
						<div>
							<Select
								className="react-select-container"
								styles={reactSelectCustomStyles}
								classNamePrefix="react-select"
								value={{ label: 'Walk-in (Self)', value: 'self' }}
								isDisabled={true}
								options={[{ label: 'Walk-in (Self)', value: 'self' }]}
							/>
						</div>
					</div>
				)}

				{/* Summary of intended change for confirmation */}
				{(selectedBillingSource || selectedEntity || claimCode) && (
					<div className="mt-4 p-3 bg-light border rounded">
						<h6 className="mb-2">Change Preview</h6>
						<div><strong>Billing Source:</strong> {selectedBillingSource?.label || "-"}</div>
						{selectedEntity && <div><strong>Entity:</strong> {selectedEntity.entity_type} (ID: {selectedEntity.entity_id})</div>}
						{claimCode && <div><strong>Claim Code:</strong> {claimCode}</div>}
						<div className="text-muted small mt-2">On confirmation, this will update the transaction and log the change.</div>
						{pendingAction && <div className="alert alert-info mt-2">{pendingAction}</div>}
					</div>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleConfirmChange} disabled={isButtonDisabled()}>
					{isLoading ? "Saving..." : "Continue"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AdjustBillingSourceModal;
