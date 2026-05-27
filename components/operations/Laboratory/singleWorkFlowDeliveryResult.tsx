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
		if (!billingid) return alert("Billing ID is required");


		if (notes.length > 500) return alert("Notes cannot exceed 500 characters");


		const payload = {
			billingid: Number(billingid),
			delivered_mode: deliveredMode.trim().toLowerCase(),
			delivered_by_employeeid: employeeid,
			delivered_at: new Date(),
			ascensionid: Number(ascension_id),
			notes: notes ? notes.trim() : null,
		};

		try {
			setLoading(true);

			const response = await customPost('result/delivery/record', 'POST', payload);
			const {status,id} = response || {};
			if (status === true) {
				alert("Result delivery recorded successfully");
				onSuccess();
			}
		} catch (err) {
			console.error(err);
			alert("Failed to submit");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>Record Result Delivery</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Form>

					<Form.Group className="mb-2">
						<Form.Label>Delivered Mode</Form.Label>
						<select className="form-select form-select-sm" value={deliveredMode} onChange={(e) => setDeliveredMode(e.target.value)}>
							<option value=''>select mode result was delivered to the client</option>
							<option value="whatapp">Whatapp</option>
							<option value="email">Email</option>
							<option value={'hardcopy'}>Hard Copy</option>
							<option value={'phonecall'}>Phone Call</option>
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
				<Button variant="primary" onClick={handleSubmit} disabled={loading}>
					{loading ? "Submitting..." : "Submit"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}