"use client";

import { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { customPost } from "../../Auth/customFetch";
import { toast } from "react-toastify";

type Props = {
	show: boolean;
	onHide: () => void;
	employeeid: number;
	items: any[];
	onSuccess: (shouldClose?: boolean) => void;
};

export default function BulkWorkFlowResultDeliveryModal({
	show,
	onHide,
	onSuccess,
	items,
	employeeid,
}: Props) {
	const [deliveredMode, setDeliveredMode] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
          if (loading) return;
		if (items.length === 0) return toast.error("No items selected");
		if (!deliveredMode) return toast.error("Please select a delivery mode");

		if (notes.length > 500) return toast.error("Notes cannot exceed 500 characters");

		const payload = items.map(item => ({
			billingid: Number(item.billingid),
			delivered_mode: deliveredMode.trim().toLowerCase(),
			delivered_at: new Date(),
			ascensionid: Number(item.ascension_id ?? item.ascensionid),
			notes: notes ? notes.trim() : null,
			failurenotes: null,
		}));

		try {
			setLoading(true);

			const promises = payload.map(p => customPost('result/delivery/record', 'POST', p));
			const results = await Promise.all(promises);

			const successCount = results.filter(r => r?.status === true).length;
			const failCount = results.length - successCount;

			if (successCount > 0) {
				toast.success(`Result delivery recorded for ${successCount} items`);
				if (failCount > 0) {
					toast.error(`${failCount} items failed to update`);
				}
				onSuccess(true);
				onHide();
			} else {
				toast.error("Failed to record delivery for all items");
			}
		} catch (err) {
			console.error(err);
			toast.error("An error occurred during submission");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal show={show} onHide={()=>{if(!loading)onHide()}} centered size="lg" backdrop="static" keyboard={!loading}>
			<Modal.Header closeButton={!loading}>
				<Modal.Title>Bulk Record result delivery ({items.length} items)</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<div className="alert alert-info py-2">
					<small>This will update the delivery status for all selected tests.</small>
				</div>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label className="fw-semibold">Delivery method</Form.Label>
						<select aria-label="Delivery method" className="form-select" value={deliveredMode} onChange={(e) => setDeliveredMode(e.target.value)}>
							<option value=''>Select delivery mode...</option>
							<option value="whatapp">WhatsApp</option>
							<option value="email">Email</option>
							<option value="hardcopy">Printed copy</option>
							<option value="phonecall">Phone call</option>
						</select>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label className="fw-semibold">Notes (Optional)</Form.Label>
						<Form.Control
							as="textarea"
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Add any delivery notes here..."
						/>
					</Form.Group>

					<div className="selected-items-list mt-3">
						<label className="fw-semibold mb-2">Selected Tests:</label>
						<div style={{ maxHeight: '150px', overflowY: 'auto' }} className="border rounded p-2 bg-light">
							{items.map((item, idx) => (
								<div key={idx} className="small border-bottom mb-1 pb-1 d-flex justify-content-between">
									<span>{item.name || item.test_name}</span>
									<span className="text-muted">{item.fullname}</span>
								</div>
							))}
						</div>
					</div>
				</Form>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="secondary" onClick={onHide} disabled={loading}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleSubmit} disabled={loading || !deliveredMode}>
					{loading ? <><Spinner size="sm" className="me-2" />Submitting...</> : `Update ${items.length} Items`}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
