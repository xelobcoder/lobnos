import React from "react";
import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import { BillingSourceOption } from "./BilledClientsView";

interface EditingBillingInfo {
	billingid: number | null;
	patientid: number | string | null;
	billingSource: BillingSourceOption | null;
	reason: string;
	randString: string;
	userRandInput: string;
}

interface AdjustBillingSourceModalProps {
show: boolean;
onClose: () => void;
onContinue: () => void;
options: BillingSourceOption[];
selectedBillingSource: BillingSourceOption | null;
setSelectedBillingSource: (option: BillingSourceOption | null) => void;
formatOptionLabel: (option: BillingSourceOption) => React.ReactElement;
billingid: number | null;
selectedItem: BillingSourceOption | null;
itemToEdit?: any;
}

const AdjustBillingSourceModal: React.FC<AdjustBillingSourceModalProps> = ({
	show,
	onClose,
	onContinue,
	billingid,
	options,
	selectedBillingSource,
	setSelectedBillingSource,
	formatOptionLabel,
	selectedItem,
	itemToEdit,
}) => {
	return (
		<Modal show={show} onHide={onClose} backdrop="static" size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Adjust/Correct Billing source </Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<label>Select Billing Source </label>
				<div className="mb-4">
					<Select
						options={options}
						value={selectedBillingSource}
						onChange={(option) => setSelectedBillingSource(option as BillingSourceOption)}
						placeholder="Choose billing source..."
						isSearchable={false}
						className="mb-2"
						formatOptionLabel={formatOptionLabel}
					/>
				</div>
				{selectedItem && (
					<div className="mb-2">
						<strong>Selected Billing Source:</strong>
						<pre style={{ background: '#f8f9fa', padding: '8px', borderRadius: '4px', fontSize: '13px' }}>
							{JSON.stringify(selectedItem, null, 2)}
						</pre>
					</div>
				)}
				{itemToEdit && (
					<div className="mb-2">
						<strong>Full Item To Edit:</strong>
						<pre style={{ background: '#e9ecef', padding: '8px', borderRadius: '4px', fontSize: '13px' }}>
							{JSON.stringify(itemToEdit, null, 2)}
						</pre>
					</div>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onContinue} disabled={false}>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AdjustBillingSourceModal;
