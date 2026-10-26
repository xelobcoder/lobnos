"use client";

import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { customPost } from "../../Auth/customFetch";

type Props = {
	show: boolean;
	onHide: () => void;
	employeeid: number;
	item: any;
	onSuccess: (shouldClose?: boolean) => void;
	workflow: string;
};

export default function SingleWorkFlowResultDeliveryModal({
	show,
	onHide,
	workflow,
	onSuccess,
	item,
	employeeid,
}: Props) {
	const [deliveredMode, setDeliveredMode] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const { billingid, testid, ascension_id } = item || {};

	const handleSubmit = async () => {
          if (loading) return;
		if (!billingid) return alert("Billing ID is required");


		if (notes.length > 500) return alert("Notes cannot exceed 500 characters");


		const payload = {
			billingid: Number(billingid),
			delivered_mode: deliveredMode.trim().toLowerCase(),
			delivered_at: new Date(),
			ascensionid: Number(ascension_id),
			notes: notes ? notes.trim() : null,
			failurenotes: null,
		};

		try {
			setLoading(true);

			const response = await customPost('result/delivery/record', 'POST', payload);
			const { status, id } = response || {};
			if (status === true) {
				alert("Result delivery recorded successfully");
				onSuccess();
			} else { alert(response?.message || "Delivery could not be recorded. Refresh the result status and retry."); }
		} catch (err) {
			console.error(err);
			alert("Failed to submit");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal show={show} onHide={()=>{if(!loading)onHide()}} centered backdrop="static" keyboard={!loading}>
			<Modal.Header closeButton={!loading}>
				<Modal.Title>Record result delivery</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Form>

					<Form.Group className="mb-2">
						<Form.Label>Delivery method</Form.Label>
						<select aria-label="Delivery method" className="form-select" value={deliveredMode} onChange={(e) => setDeliveredMode(e.target.value)}>
							<option value=''>Select a delivery method</option>
							<option value="whatapp">WhatsApp</option>
							<option value="email">Email</option>
							<option value={'hardcopy'}>Printed copy</option>
							<option value={'phonecall'}>Phone call</option>
						</select>
					</Form.Group>

					<Form.Group className="mb-2">
						<Form.Label>Notes</Form.Label>
						<Form.Control
							as="textarea"
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						/>
					</Form.Group>
				</Form>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="secondary" onClick={onHide} disabled={loading}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleSubmit} disabled={loading || !deliveredMode}>
					{loading ? "Submitting..." : "Record delivery"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}