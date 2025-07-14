import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { BillingSourceOption } from "./BilledClientsView";
import ClinicianFiltering from "../accessories/SectorFileringComponents/ClinicianFiltering";
import InsuranceOrganizationFiltering from "../accessories/SectorFileringComponents/InsuranceOrganizationFiltering";
import OrganizationalBillingSourceSearch from "./BillingContextComponents/BillingSourceComponents/OrganizationBillingSearch";
import { reactSelectCustomStyles } from "../Auth/customFetch";
import { billingSource } from "../../lib/billingLib";




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

	const updateValuesToContext = (value: EntitySeelction, target: 'insurance' | 'organization' | 'clinician') => {
		if (!value) return;
		setSelectedEntity({ entity_type: target, entity_id: value.id });
	};

	const handleSelectedEntityInsurance = (value: EntitySeelction | any) => {
		console.log("Selected Insurance:", value);
		updateValuesToContext(value, 'insurance');
	};

	const handleSelectedEntityClinician = (value: EntitySeelction) => {
		updateValuesToContext(value, 'clinician');
	};

	const handleSelectedEntityOrganization = (value: EntitySeelction) => {
		updateValuesToContext(value, 'organization');
	};

	// Placeholder for future backend/tool integration
	const handleConfirmChange = async () => {
		// Here you will call your backend/tool to update the transaction
		// Example:
		// await updateBillingSource({
		//   billingid,
		//   newSource: selectedBillingSource,
		//   entity: selectedEntity,
		//   claimCode,
		// });
		// await logChange(...)
		setPendingAction("Change submitted (simulated). This will update the transaction and log the change.");
		onContinue();
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

	return (
		<Modal show={show} onHide={onClose} backdrop="static" size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Adjust/Correct Billing Source</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<label>Select Billing Source</label>
				<div className="mb-4">
					<Select
						options={billingSource}
						value={selectedBillingSource}
						onChange={(option) => setSelectedBillingSource(option as BillingSourceOption)}
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
						{selectedEntity && pendingAction && <div className="alert alert-info mt-2">{pendingAction}</div>}
					</div>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleConfirmChange} disabled={!selectedBillingSource}>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AdjustBillingSourceModal;
